const { isEmpty, intersection, map } = require('lodash');
const httpStatus = require('http-status');
const passport = require('passport');

const APIError = require('../utils/APIError');
const RupeekService = require('../services/rupeek.service');
const { env } = require('../../config/vars');

const re = /(\S+)\s+(\S+)/;

const parseAuthHeader = (hdrValue) => {
  const matches = hdrValue.match(re);
  return matches && { scheme: matches[1], value: matches[2] };
};

exports.kong = (roles) => (req, res, next) => {
  if (env === 'local') {
    return next();
  }
  if (!req.user) req.user = {};
  if (req.headers['x-consumer-id'] && req.headers['x-consumer-role']) {
    req.user.id = req.headers['x-consumer-id'];
    req.user.role = req.headers['x-consumer-role'];
    req.user.email = !isEmpty(req.headers['x-consumer-email']) ? req.headers['x-consumer-email'] : null;
    req.user.name = !isEmpty(req.headers['x-consumer-name']) ? req.headers['x-consumer-name'] : null;
    if (isEmpty(roles)) return next();
    let userRoles = JSON.parse(req.user.role);
    userRoles = map(userRoles.roles, (role) => role.name);
    if (intersection(roles, userRoles).length === 0) {
      const apiError = new APIError({
        message: 'Forbidden',
        status: httpStatus.UNAUTHORIZED,
      });
      return next(apiError);
    }
    return next();
  }
  return next(new APIError({
    status: httpStatus.UNAUTHORIZED,
    message: 'You are not allowed to access this resource. Reason: KONG failure.',
  }));
};

const handleBasic = (req, res, next) => async (err, user, info) => {
  const error = err || info;
  req.logIn = Promise.promisify(req.logIn);
  const apiError = new APIError({
    message: error ? error.message : 'Unauthorized',
    status: httpStatus.UNAUTHORIZED,
    stack: error ? error.stack : undefined,
  });

  try {
    if (error || !user) throw error;
    await req.logIn(user, {
      session: false,
    });
    req.user = user;
    req.isAuthenticated = true;
    return next();
  } catch (e) {
    return next(apiError);
  }
};

exports.authorise = (roles) => async (req, res, next) => {
  try {
    const user = await getUser(req.headers);
    if (intersection(roles, user.roles).length === 0) {
      const apiError = new APIError({
        message: 'Forbidden',
        status: httpStatus.FORBIDDEN,
      });
      return next(apiError);
    }
    req.user = user;
    return next();
  } catch (e) {
    return next(e);
  }
};

const getUser = async (headers) => {
  // request comes from Kong / API Gateway
  const user = await RupeekService.jwtvalidate(headers);
  return {
    ...user,
    token: parseAuthHeader(headers.authorization).value || null,
  };
};

exports.authorizeKey = () => (req, res, next) => {
  passport.authenticate('basic', { session: false }, handleBasic(req, res, next))(req, res, next);
};

exports.authenticateBasicOrJWT = (roles) => async (req, res, next) => {
  passport.authenticate(['jwt', 'basic'], { session: false }, async (err, user, info) => {
    const error = err || info;
    req.logIn = Promise.promisify(req.logIn);
    const apiError = new APIError({
      message: 'Unauthorized',
      status: httpStatus.UNAUTHORIZED,
    });
    try {
      if (error || !user) throw error;
      if (!isEmpty(user.auth)) {
        // jwt auth so check roles
        if (intersection(roles, user.roles).length === 0) {
          return next(apiError);
        }
      } else {
        // basic auth (no role check)
        await req.logIn(user, {
          session: false,
        });
      }
      req.user = user;
      return next();
    } catch (e) {
      return next(apiError);
    }
  })(req, res, next);
};

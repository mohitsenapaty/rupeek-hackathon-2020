const Sentry = require('@sentry/node');
const express = require('express');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const cors = require('cors');
const helmet = require('helmet');
const passport = require('passport');
const { middlewareLogger } = require('./logger');
const error = require('../api/middlewares/error');
const routes = require('../api/routes');

Sentry.init();

/**
* Express instance
* @public
*/
const app = express();


app.use(Sentry.Handlers.requestHandler());

// request logging. dev: console | production: file
app.use(middlewareLogger);

// parse body params and attache them to req.body
// @HACK: increase the size of request payload
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true }));

// lets you use HTTP verbs such as PUT or DELETE
// in places where the client doesn't support it
app.use(methodOverride());

// secure apps by setting various HTTP headers
app.use(helmet());

// enable CORS - Cross Origin Resource Sharing
app.use(cors());

// mount api routes
app.use(routes);

// enable authentication
app.use(passport.initialize());

app.use(error.validationError);

app.use(Sentry.Handlers.errorHandler());

// if error is not an instanceOf APIError, convert it.
app.use(error.converter);

// catch 404 and forward to error handler
app.use(error.notFound);

// error handler, send stacktrace only during development
app.use(error.handler);

module.exports = app;

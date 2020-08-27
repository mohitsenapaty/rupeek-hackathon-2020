const { logger } = require('./config/logger');

Promise = require('bluebird'); // eslint-disable-line no-global-assign

const { port, env } = require('./config/vars');

const db = require('./api/models');

exports.init = () => {
  global.sequelize = db;
};

const app = require('./config/express');

// listen to requests
app.listen(port, () => logger.info(`Server started on port ${port} (${env})`));

// Init sequelize
// const db = require('./api/models');
// global.sequelize = db;

// const cache = require('./api/services/cache.service');
// cache.intitialize();

module.exports = app;

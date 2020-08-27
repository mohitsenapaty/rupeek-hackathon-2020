const { extend } = require('lodash');
const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const { pg, env } = require('../../config/vars');
const logger = require('../../config/logger').logger;

const basename = path.basename(__filename);
const db = {};

const sequelizeOptions = {
  ...(env === 'production' && {
    // disable logging in production
    logging: false
  }),
  dialect: 'postgres',
  define: {
    timestamps: false
  },
};
const sequelize = new Sequelize(pg.uri, sequelizeOptions);
sequelize
  .authenticate()
  .then(function (err) {
    logger.info('Connection to db has been established successfully.');
  }, function (err) {
    logger.info('Unable to connect to the database:', err);
  });

const modelsDir = path.normalize(__dirname);
// loop through all files in models directory
fs
  .readdirSync(modelsDir)
  .filter(file => (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js'))
  .forEach((file) => {
    const model = sequelize.import(path.join(modelsDir, file));
    db[model.name] = model;
  });

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

module.exports = extend({
  sequelize,
  Sequelize,
}, db);

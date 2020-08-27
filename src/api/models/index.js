const { extend } = require('lodash');
const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const { Op } = require('sequelize');
const { pg, env } = require('../../config/vars');

const basename = path.basename(__filename);
const db = {};

const sequelizeOptions = {
  ...(env === 'production' && {
    // disable logging in production
    logging: false,
  }),
};
const sequelize = new Sequelize(pg.uri, sequelizeOptions);

const modelsDir = path.normalize(__dirname);
// loop through all files in models directory
fs
  .readdirSync(modelsDir)
  .filter((file) => (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js'))
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
  Op,
}, db);

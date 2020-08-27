const db = require('../api/models/sequelize');

exports.init = () => {
  global.sequelize = db;
};

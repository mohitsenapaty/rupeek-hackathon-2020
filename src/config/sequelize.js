const db = require('../api/models');

// console.log(db);

exports.init = () => {
  global.sequelize = db;
};

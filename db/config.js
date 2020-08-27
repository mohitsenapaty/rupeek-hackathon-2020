const { pg } = require('../src/config/vars');

module.exports = {
  local: {
    url: pg.uri,
    dialect: 'postgres',
  },
  qa: {
    url: pg.uri,
    dialect: 'postgres',
  },
  uat: {
    url: pg.uri,
    dialect: 'postgres',
  },
  production: {
    url: pg.uri,
    dialect: 'postgres',
  },
};

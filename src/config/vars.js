const path = require('path');
const { name, version } = require('../../package.json');

// import .env variables
require('dotenv-safe').load({
  path: path.join(__dirname, '../../.env'),
  sample: path.join(__dirname, '../../.env.example'),
});

module.exports = {
  env: process.env.NODE_ENV,
  port: process.env.PORT,
  pkgConfig: {
    name,
    version,
  },
  pg: {
    uri: process.env.DEV_DATABASE_URL,
  },
};

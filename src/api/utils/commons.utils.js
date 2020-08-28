const moment = require('moment');
const util = require('util');

const timeout = (ms) => new Promise((res) => setTimeout(res, ms));

module.exports = {
  moment,
  util,
  timeout,
};

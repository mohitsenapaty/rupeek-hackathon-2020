const httpStatus = require('http-status');

exports.listInvestments = async (req, res, next) => {
    try {
      console.log('listInvestments');
      return res.status(httpStatus.OK);
    } catch (err) {
      return next(err);
    }
  };
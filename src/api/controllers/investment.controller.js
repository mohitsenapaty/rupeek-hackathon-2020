const httpStatus = require('http-status');

exports.listInvestments = async (req, res, next) => {
    try {
      console.log('listInvestments');
      const response = {
          code: httpStatus.OK,
          message: 'listInvestments',
      }
      return res.status(httpStatus.OK).json(response);
    } catch (err) {
      return next(err);
    }
  };
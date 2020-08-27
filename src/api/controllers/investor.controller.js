const httpStatus = require('http-status');
const investorMatcher = require('../utils/investor_matcher.util');

exports.filterChunks = async (req, res, next) => {
  try {
    const {amount, time, rateOfReturn} = req.param;
    const response = investorMatcher.filterChunksForGivenReturn(amount, time, rateOfReturn);
    const responseObj = {
      code: httpStatus.OK,
      message: response,
    }
    return res.status(httpStatus.OK).json(responseObj);
  } catch (err) {
    return next(err);
  }
};

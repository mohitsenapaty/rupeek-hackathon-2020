const httpStatus = require('http-status');
const investorMatcher = require('../utils/investor_matcher.util');
const returnCalculator = require('../utils/return_calculator.util');
const investment = require('../utils/investment_util');

exports.filterChunks = async (req, res, next) => {
  try {
    const {amount, time, rateOfReturnLo, rateOfReturnHi} = req.body;
    const chunkUnits = amount/1000;
    const response = await returnCalculator.getMostRelevantKChunks(chunkUnits, time, rateOfReturnLo, rateOfReturnHi);
    const responseObj = {
      code: httpStatus.OK,
      message: response,
    }
    return res.status(httpStatus.OK).json(responseObj);
  } catch (err) {
    return next(err);
  }
};

exports.mapChunks = async (req, res, next) => {
  try {
    const { investmentid, rateOfReturnLo, rateOfReturnHi } = req.body;
    const response = await investment.mapInvestmentToChunks(investmentid, rateOfReturnLo, rateOfReturnHi);
    const responseObj = {
      code: httpStatus.OK,
      message: response,
    }
    return res.status(httpStatus.OK).json(responseObj);
  } catch (err) {
    return next(err);
  }
};

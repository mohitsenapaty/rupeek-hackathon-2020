const httpStatus = require('http-status');

const {
    Investment,
    Investmenttochunk,
  } = global.sequelize;

const investmentUtil = require('../utils/investment.util');

exports.listInvestments = async (req, res, next) => {
    try {
      console.log('listInvestments');
      const requestParams = { ...req.query };
      const investorInvestments = await investmentUtil.getInvestments(requestParams);
      // console.log(investorInvestments);
      const response = {
          code: httpStatus.OK,
          message: 'listInvestments',
          investorInvestments,
      }
      return res.status(httpStatus.OK).json(response);
    } catch (err) {
      return next(err);
    }
  };
const httpStatus = require('http-status');

const { moment } = require('../utils/commons.utils');

const {
    Investment,
    Investmenttochunk,
  } = global.sequelize;

const { omit } = require('lodash');

const investmentUtil = require('../utils/investment.util');

const otherUtil = require('../utils/investment_util');

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

  exports.createInvestment = async (req, res, next) => {
      try {
        console.log('createInvestment');
        const params = { ...req.body, createdAt: moment().utc(), updatedAt: moment().utc(), investedon: moment().utc(), fetchedon: moment().utc() };
        paramsMod = omit(params, ['lroi', 'hroi']);
        const investment = await Investment.createInvestmentByParams(paramsMod);
        await otherUtil.mapInvestmentToChunks(investment.id, req.body.lroi, req.body.hroi);
        // console.log(investment);
        return res.status(httpStatus.OK).json(investment);
      } catch (err) {
        console.log(err);
        return next(err);
      }
  };

  exports.syncInvestment = async (req, res, next) => { 
      try {
        console.log('syncInvestment');
        const investmentIds = req.body.investmentIds;
        const response = await investmentUtil.syncInvestments({ investmentIds }); 
        return res.status(httpStatus.OK).json(response);
      } catch (err) {
        return next(err);
      }
  };


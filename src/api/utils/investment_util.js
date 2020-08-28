const {
  Investment,
} = global.sequelize;
const returnCalculator = require('./return_calculator.util');
const { forEach, sortBy, filter } = require('lodash');
const moment = require('../utils/commons.utils').moment;
const { logger } = require('../../config/logger');

const mapInvestmentToChunks = async(investmentid) =>{
  logger.info('Finding investment chunks for investment id: ',investmentid);
  const investment = Investment.findByPk(investmentid);
  investment = investment.dataValues;
};

const {
  Investment, Chunk, Investmenttochunk
} = global.sequelize;
const returnCalculator = require('./return_calculator.util');
const { forEach, sortBy, filter } = require('lodash');
const moment = require('../utils/commons.utils').moment;
const { logger } = require('../../config/logger');

exports.mapInvestmentToChunks = async(investmentid, returnLow, returnHigh) =>{
  logger.info('Finding investment chunks for investment id: ',investmentid);
  let investment = await Investment.findByPk(investmentid);
  investment = investment.dataValues;
  const amount = investment.amount;
  const n = amount/1000;
  const tenure = investment.investmenttenure;
  const chunksToInvest = await returnCalculator.getMostRelevantKChunks(n, tenure, returnLow, returnHigh);
  const response = [];
  await Promise.each(chunksToInvest.chunks, async(chunk) => {
    const createParams = {
      investmentid: investmentid,
      chunkid: chunk.id,
      schemeinterest: chunk.interestrate,
      amount: chunk.amount
    };
    const createResp = await Investmenttochunk.create(
      createParams
    );
    const updateParams = {
      invested: true,
    };
    await Chunk.update(updateParams, {
      where: {id: chunk.id}
    });
    response.push(createResp.dataValues);
  });
  return response;
};

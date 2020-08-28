const {
  Chunk, Loan,
} = global.sequelize;
const skmeans = require("skmeans");
const { forEach, pick, filter, includes, map } = require('lodash');
const moment = require('../utils/commons.utils').moment;
const { logger } = require('../../config/logger');
const investorMatcherUtil = require('./investor_matcher.util');

exports.getMostRelevantKChunks = async (clusterSize, timePeriod, rangeLowInterest, rangeHighInterest) => {
  try {
    let availableChunks = await Chunk.findAll({
      where: { invested: false },
    });
    availableChunks = filter(availableChunks, chunk => {
      return chunk.dataValues;
    });
    logger.info('No of available chunks for investments:', availableChunks.length);
    availableChunks = await populateChunksWithTimeLeft(availableChunks);
    availableChunks = await populateChunksWithPercentageRateOfReturn(availableChunks, timePeriod);
    availableChunks = await populateChunksWithRateOfInterestFactor(availableChunks);
    availableChunks = await populateChunksWithMaxPercentageRateOfReturn(availableChunks, timePeriod);
    availableChunks = await populateChunksWithMinPercentageRateOfReturn(availableChunks, timePeriod);
    availableChunks = filter(availableChunks, chunk => {
      return chunk.percentageReturn <= rangeHighInterest && chunk.percentageReturn >= rangeLowInterest;
    });
    // calculate max and min return from availble options
    let maxReturn = await getMaxReturnsFromChosenChunks(availableChunks);
    let minReturn = await getMinReturnsFromChosenChunks(availableChunks);
    if(availableChunks.length < 1){
      throw new Error('No chunks found with given serach criteria');
    }
    logger.info('Chunks with given return and time:', availableChunks);
    const clusters = await runKMeansAlogrithm(availableChunks, clusterSize);
    // get one point from each cluster
    logger.info('Clusters after running k-means alog:', clusters);
    let responseObj = {};
    let response = [];
    responseObj.maxReturn = maxReturn;
    responseObj.minReturn = minReturn;
    forEach(clusters, cluster => {
      if(cluster.length > 0){
        const idx = Math.floor(Math.random() * cluster.length)
        chunkUnit = {...pick(cluster[idx], [
          'id',
          'loan',
          'interestrate',
          'invested',
          'closed',
          'amount',
          'maxPercentageReturn',
          'minPercentageReturn',
          'percentageReturn',
          'status',
        ])};
        response.push(chunkUnit);
      }
    });
    // k-means not giving all the points, pick the remaining ones from
    // different algorithm
    let chunkIds = [];
    let remainingChunks = [];
    forEach(response, response => {
      chunkIds.push(response.id+"");
    });
    if (chunkIds.length < clusterSize) {
      let leftInvestment = [];
      forEach(availableChunks, chunk=>{
        if (!includes(chunkIds, chunk.id+"")){
          leftInvestment.push(chunk);
        }
      });
      const amountLeft = (clusterSize - chunkIds.length)*1000;
      const rateOfReturnExpected  = (rangeLowInterest + rangeHighInterest)/2;
      remainingChunks = await investorMatcherUtil.filterChunksForGivenReturn(leftInvestment, amountLeft, timePeriod, rateOfReturnExpected);
    }
    forEach(remainingChunks, chunk => {
      response.push(chunk);
    });
    let modifiedResponse = [];
    forEach(response, response =>{
      const resp = {
        ...pick(response, [
          'id',
          'loan',
          'interestrate',
          'invested',
          'closed',
          'amount',
          'maxPercentageReturn',
          'minPercentageReturn',
          'percentageReturn',
          'status',
      ])};
      modifiedResponse.push(resp);
    });
    responseObj.chunks = modifiedResponse;
    return responseObj;
  } catch (err) {
    logger.error('Error in creating cluster:', err);
    throw err;
  }
};

const getMaxReturnsFromChosenChunks = async(chunks) => {
  let returnValue = 0;
  forEach(chunks, chunk => {
    returnValue += chunk.maxPercentageReturn;
  });
  return returnValue/chunks.length;
};

const getMinReturnsFromChosenChunks = async (chunks) => {
  let returnValue = 0;
  forEach(chunks, chunk => {
    returnValue += chunk.minPercentageReturn;
  });
  return returnValue / chunks.length;
};

const runKMeansAlogrithm = async (availableChunks, clusterSize)=>{
  logger.info('Preparing to run k-means algo on datapoints:', availableChunks.length);
  const clusters = [];
  // intialise cluster with empty objects
  let size = 0;
  while(size < clusterSize){
    clusters.push([]);
    size++;
  }
  logger.info('Starting k-means')
  const clusterResponse = skmeans(
    availableChunks, clusterSize, null, 1,
    (x1, x2) => Math.abs(x1.percentageReturn - x2.percentageReturn));
  logger.info('Running algo completed.Response:', clusterResponse);
  const totalPoints = availableChunks.length;
  let start = 0;
  while(start < totalPoints) {
    // start point is assigned to clusterId
    const clusterId = clusterResponse.idxs[start] - 1;
    // id offset is 1
    if(clusterId > 0) {
      clusters[clusterId].push(availableChunks[start]);
    }
    start++;
  }
  return clusters;
};


const populateChunksWithPercentageRateOfReturn = async (availableChunks, days) => {
  const interestRepaymentFactor = 1;
  const prinicipalRepaymentFactor = 1;
  const releastFactor = 1;
  const rateOfInterest = 1;
  let timeFactor = 1;
  await Promise.each(availableChunks, async chunk => {
    timeFactor = await calculateTimeFactor(chunk, days);
    let returnValue = chunk.amount * prinicipalRepaymentFactor;
    returnValue = returnValue * interestRepaymentFactor;
    returnValue = returnValue * releastFactor;
    returnValue = returnValue * timeFactor;
    returnValue = returnValue * rateOfInterest;
    chunk.percentageReturn = returnValue / chunk.amount;
  });
  return availableChunks;
};

const populateChunksWithMinPercentageRateOfReturn = async (availableChunks, days) => {
  const prinicipalRepaymentFactor = 0.7;
  const releastFactor = 0.8;
  const interestRepaymentFactor = 0.3;
  let timeFactor = 1;
  await Promise.each(availableChunks, async chunk => {
    timeFactor = await calculateTimeFactor(chunk, days);
    let returnValue = chunk.amount * prinicipalRepaymentFactor;
    returnValue = returnValue * interestRepaymentFactor * chunk.interestrate;
    returnValue = returnValue * releastFactor;
    returnValue = returnValue * timeFactor;
    chunk.minPercentageReturn = returnValue / chunk.amount;
  });
  return availableChunks;
};

/**
 *  interest factor = rate of interest/highest rate of interest
 * @param {*} chunks
 */
const populateChunksWithRateOfInterestFactor = async(chunks) => {
  let maxInterestRate = -1;
  forEach(chunks, chunk => {
    if (chunk.interestrate > maxInterestRate){
      maxInterestRate = chunk.interestrate;
    }
  });
  // if no max value found, don't count contribution of interest rate factor
  if(maxInterestRate === -1){
    maxInterestRate = 1;
  }
  forEach(chunks, chunk => {
    chunk.interestRepaymentFactor = chunk.interestrate/maxInterestRate;
  });
  return chunks;
};

const populateChunksWithMaxPercentageRateOfReturn = async (availableChunks, days) => {
  const interestRepaymentFactor = 0.7;
  const prinicipalRepaymentFactor = 1;
  const releastFactor = 1;
  let timeFactor = 1;
  await Promise.each(availableChunks, async chunk => {
    timeFactor = await calculateTimeFactor(chunk, days);
    let returnValue = chunk.amount * prinicipalRepaymentFactor;
    returnValue = returnValue * interestRepaymentFactor * chunk.interestrate;
    returnValue = returnValue * releastFactor;
    returnValue = returnValue * timeFactor;
    chunk.maxPercentageReturn = returnValue / chunk.amount;
  });
  return availableChunks;
};

const calculateTimeFactor = async (chunk, days) => {
  const timeFactor = chunk.timeToExpire / days;
  return timeFactor;
};

const populateChunksWithTimeLeft = async (chunks) => {
  await Promise.each(chunks, async (chunk) => {
    const loan = await Loan.findByPk(chunk.loan);
    const currentTime = moment.utc();
    const expiryTimeLoan = moment(loan.expirydate);
    const daysLeft = expiryTimeLoan.diff(currentTime, 'days');
    chunk.timeToExpire = daysLeft;
  });
  return chunks;
};

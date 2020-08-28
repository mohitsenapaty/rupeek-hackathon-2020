const {
  Chunk, Loan,
} = global.sequelize;
const skmeans = require("skmeans");
const { forEach, sortBy, filter } = require('lodash');
const moment = require('../utils/commons.utils').moment;
const { logger } = require('../../config/logger');

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
    let maxReturn = -1;
    let minReturn = 100000000;
    forEach(availableChunks, chunk => {
      if (maxReturn < chunk.percentageReturn){
        maxReturn = chunk.percentageReturn;
      }
      if (minReturn > chunk.percentageReturn){
        minReturn = chunk.percentageReturn;
      }
    });
    availableChunks = filter(availableChunks, chunk => {
      return chunk.percentageReturn <= rangeHighInterest && chunk.percentageReturn >= rangeLowInterest;
    });
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
        response.push(cluster[idx]);
      }
    });
    responseObj.chunks = response;
    return responseObj;
  } catch (err) {
    logger.error('Error in creating cluster:', err);
    throw err;
  }
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
    clusters[clusterId].push(availableChunks[start]);
    start++;
  }
  return clusters;
};


const populateChunksWithPercentageRateOfReturn = async (availableChunks, days) => {
  const interestRepaymentFactor = 1;
  const prinicipalRepaymentFactor = 1;
  const releastFactor = 1;
  let timeFactor = 1;
  await Promise.each(availableChunks, async chunk => {
    timeFactor = await calculateTimeFactor(chunk, days);
    let returnValue = chunk.amount * prinicipalRepaymentFactor;
    returnValue = returnValue * interestRepaymentFactor;
    returnValue = returnValue * releastFactor;
    returnValue = returnValue * timeFactor;
    chunk.percentageReturn = returnValue / chunk.amount;
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

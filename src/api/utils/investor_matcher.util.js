/**
 * It is assumed that investor would invest only in some units
 * i. e. amount%{unit_value} = 0, where unit_value is the cost of one unit
 */
const {forEach, sortBy, filter} = require('lodash');
const moment = require('../utils/commons.utils').moment;
const { logger } = require('../../config/logger');
const {
  Chunk, Loan,
} = global.sequelize;

const getNonInvestedChunks = async() => {
  // find chunks with invested = false
  let response = await Chunk.findAll({
    where: { invested: false },
  });
  response = filter(response, chunk => {
    return chunk.dataValues;
  });
  // response = [
  //   {
  //     id: 1,
  //     loan: 12,
  //     interestrate: 5.6,
  //     invested: false,
  //     closed: false,
  //     amount: 1000,
  //     timeToExpire: 123,
  //   },
  //   {
  //     id: 1,
  //     loan: 13,
  //     interestrate: 11.6,
  //     invested: false,
  //     closed: false,
  //     amount: 1000,
  //     timeToExpire: 205,
  //   },
  //   {
  //     id: 1,
  //     loan: 14,
  //     interestrate: 3.2,
  //     invested: false,
  //     closed: false,
  //     amount: 1000,
  //     timeToExpire: 23,
  //   },
  //   {
  //     id: 1,
  //     loan: 15,
  //     interestrate: 7.0,
  //     invested: false,
  //     closed: false,
  //     amount: 1000,
  //     timeToExpire: 340,
  //   }
  // ];
  return response;
};

const validateInputAmount = async(amount) => {
  // check if we can split amount in different chunk amount
  // available
  const CHUNK_SIZE = 1000;
  return amount % CHUNK_SIZE === 0;
};

exports.filterChunksForGivenReturn = async(amount, time, rateOfReturn)=>{
  try{
    logger.info('Request received for', {amount: amount, time: time, rateOfReturn: rateOfReturn});
    if (!validateInputAmount(amount)) {
      throw new Error('Invalid amount: Amount undivisible into chunks');
    }
    const expectedReturnValue = amount * rateOfReturn * time / 365 * .01;
    const availableChunks = await getNonInvestedChunks();
    logger.info('Total no of availble chunks non-invested are:', availableChunks.length);
    // get the options with equal or less than the given time
    let chunksWithTimeLeft = await populateChunksWithTimeLeft(availableChunks);
    chunksWithTimeLeft = filter(chunksWithTimeLeft, chunk => {
      return chunk.timeToExpire <= time;
    });
    logger.info('No of chunks with the given time frame: ', chunksWithTimeLeft.length);
    forEach(chunksWithTimeLeft, chunk => {
      const returnableValue = chunk.amount * chunk.timeToExpire / 365 * chunk.interestrate * .01;
      chunk.returnableValue = returnableValue;
    });
    const maxReturnable = await getMaximumReturnableValueWithInvestedAmount(chunksWithTimeLeft, amount, time);
    const minReturnable = await getMinReturnableValueWithInvestedAmount(chunksWithTimeLeft, amount, time);
    logger.info('Maximum returnable value is: ', maxReturnable);
    logger.info('Minimum returnable value is: ', minReturnable);
    if(expectedReturnValue > minReturnable) {
      throw new Error('Expected return too high to meet');
    }
    // find the options in the list that would sum up to the closest expectedreturn value

    chunksWithTimeLeft = sortBy(chunksWithTimeLeft, ['returnableValue']);
    let filteredValues = await getChunksWithGivenReturnValue(chunksWithTimeLeft, expectedReturnValue);
    return filteredValues;
  } catch(err){
    logger.error(err);
  }
};

const getChunksWithGivenReturnValue = async (chunks, expectedReturn) => {
  let start = 0, end = chunks.length - 1;
  let response = [];
  let choseStart = true;
  let returnSorFar = 0;
  while (start < end) {
    if(choseStart && chunks[start].returnableValue + returnSorFar <= expectedReturn){
      //pick the smallest value
      response.push(chunks[start]);
      returnSorFar += chunks[start];
      choseStart = false;
      start++;
    }
    else if (!choseStart && chunks[end].returnableValue + returnSorFar <= expectedReturn){
      //pick the largest value
      response.push(chunks[end]);
      returnSorFar += chunks[end];
      choseStart = true;
      end--;
    }
  }
  return response;
};

const getMaximumReturnableValueWithInvestedAmount = async (chunks, amount, time) => {
  if (!validateInputAmount(amount)) {
    throw new Error('Invalid amount: Amount undivisible into chunks');
  }
  const listOfChunkAvailable = filter(chunks, chunk =>{
    return chunk.timeToExpire <= time;
  });
  sortBy(listOfChunkAvailable, ['returnableValue'], 'desc');
  let maxReturn = 0;
  let optionsAvailable = [];
  forEach(listOfChunkAvailable, chunk => {
    if(amount > 0){
      maxReturn += chunk.returnableValue;
      optionsAvailable.push(chunk);
      amount -= 1000;
    }
  });
  return {
    maxReturn,
    optionsAvailable
  };
};

const getMinReturnableValueWithInvestedAmount = async (chunks, amount, time) => {
  if (!validateInputAmount(amount)) {
    throw new Error('Invalid amount: Amount undivisible into chunks');
  }
  const listOfChunkAvailable = filter(chunks, chunk => {
    return chunk.timeToExpire <= time;
  });
  sortBy(listOfChunkAvailable, ['returnableValue']);
  let minReturn = 0;
  let optionsAvailable = [];
  forEach(listOfChunkAvailable, chunk => {
    if (amount > 0) {
      minReturn += chunk.returnableValue;
      optionsAvailable.push(chunk);
      amount -= 1000;
    }
  });
  return {
    minReturn,
    optionsAvailable
  };
};

const populateChunksWithTimeLeft = async(chunks) => {
  await Promise.each(chunks, async(chunk) => {
    const loan = await Loan.findByPk(chunk.loan);
    const currentTime = moment.utc();
    const expiryTimeLoan = moment(loan.expirydate);
    const daysLeft =expiryTimeLoan.diff(currentTime, 'days');
    chunk.timeToExpire = daysLeft;
  });
  return chunks;
};

const httpStatus = require('http-status');
const moment = require('moment');
const {
  isEmpty,
  pick,
  times,
  fill,
} = require('lodash');

const loanService = require('../services/loan.service');
const { logger } = require('../../config/logger');

const {
  Loan,
  Chunk,
} = global.sequelize;

exports.syncLoanFromPayments = async (req, res, next) => {
  try {
    const { loan } = req.body;
    /* const loanObj = {
      loanid: '111',
      loanamount: 10000,
      balanceamount: 10000,
      tenure: 6,
      startedon: moment(),
      expirydate: moment(),
      scheme: 19.76,
    };
    */
    console.log(loan);
    const loanObj = await loanService.getLoanFromPayments(loan);
    const presentLoans = await Loan.findAll({
      where: {
        loanid: loan,
      },
      raw: true,
    });
    if (isEmpty(presentLoans)) {
      await createLoans(loanObj);
    }
    return res.status(httpStatus.OK).json({
      code: httpStatus.OK,
      message: 'Fetched Loan details successfully',
      data: loanObj,
    });
  } catch (err) {
    logger.error('Loan sync failed with ', err);
    return next(err);
  }
};

const createLoans = async (params) => {
  const loancreateObj = {
    ...pick(params, [
      'loanid',
      'loanamount',
      'balanceamount',
      'tenure',
      'startedon',
      'expirydate',
      'scheme',
    ]),
    status: 'OPEN',
    fetchedon: moment(),
  };
  const createdLoan = await Loan.create(loancreateObj);
  console.log(createdLoan);
  const initialLoanChunk = {
    loan: createdLoan.id,
    interestrate: params.scheme,
    currentinterestrate: params.scheme,
    status: 'OPEN',
    invested: false,
    closed: false,
    fetchedon: moment(),
  };
  console.log(initialLoanChunk);
  const numChunks = Math.floor(params.balanceamount / 1000);
  // const chunkList = times(10, initialLoanChunk);
  const chunkList = fill(Array(numChunks), initialLoanChunk);
  console.log(chunkList);
  await Chunk.bulkCreate(chunkList);
};

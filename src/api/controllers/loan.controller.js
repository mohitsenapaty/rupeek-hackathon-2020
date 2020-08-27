const httpStatus = require('http-status');
const moment = require('moment');
const {
  isEmpty,
  pick,
  times,
} = require('lodash');

const loanService = require('../services/loan.service');
const { logger } = require('../../config/logger');

const {
  Loan,
  Chunk,
} = global.sequelize();

exports.syncLoanFromPayments = async (req, res, next) => {
  try {
    const { loan } = req.query;
    const loanObj = await loanService.getLoanFromPayments(loan);
    const presentLoans = await Loan.find({
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
  await Loan.create(loancreateObj);
  const initialLoanChunk = {

  };
  const chunkList = times(initialLoanChunk, 10);
  await Chunk.bulkCreate(chunkList);
};

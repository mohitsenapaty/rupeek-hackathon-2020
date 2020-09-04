const httpStatus = require('http-status');
const moment = require('moment');
const {
  isEmpty,
  pick,
  fill,
  each,
  map,
  slice,
  compact,
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
    } else if (loanObj.statuscode === 5) {
      await closeLoanAndChunks(loanObj);
    } else if (presentLoans[0].balanceamount !== loanObj.balanceamount) {
      await updateLoanAndChunk(loanObj);
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
    amount: 1000,
  };
  console.log(initialLoanChunk);
  const numChunks = Math.floor(params.balanceamount / 1000);
  // const chunkList = times(10, initialLoanChunk);
  const chunkList = fill(Array(numChunks), initialLoanChunk);
  console.log(chunkList);
  await Chunk.bulkCreate(chunkList);
};

const closeLoanAndChunks = async (params) => {
  // close the loan
  const closedLoan = await Loan.update({
    status: 'CLOSED',
    balanceamount: 0,
    closedon: moment(),
  }, {
    where: { loanid: params.loanid },
    returning: true,
    plain: true,
  });
  console.log(closedLoan);
  // close the chunks
  await Chunk.update({
    status: 'CLOSED',
    closed: true,
    closedon: moment(),
  }, {
    where: {
      loan: closedLoan[1].dataValues.id,
    },
  });
};

const updateLoanAndChunk = async (params) => {
  console.log(params);
  // update balanceamount
  const prevLoan = await Loan.findOne({
    where: { loanid: params.loanid },
    raw: true,
  });
  const prevChunks = await Chunk.findAll({
    where: { loan: prevLoan.id, status: 'OPEN' },
    raw: true,
  });
  const diffAmount = prevLoan.balanceamount - params.balanceamount;
  const numChunkClose = diffAmount / 1000;
  let notInvestedCount = 0;
  each(prevChunks, (c) => {
    if (!c.invested) notInvestedCount += 1;
  });
  const updatedLoan = await Loan.update({
    balanceamount: params.balanceamount,
    closedon: moment(),
  }, {
    where: { loanid: params.loanid },
    returning: true,
    plain: true,
  });
  console.log(updatedLoan);
  const chunkList = await Chunk.findAll({
    where: {
      loan: updatedLoan[1].dataValues.id,
      status: 'OPEN',
      closed: false,
      invested: false,
    },
  });
  console.log(numChunkClose, updatedLoan[1].dataValues.id, notInvestedCount);
  if (chunkList.length >= numChunkClose) {
    // close only numChunkClose number of chunks which are not invested
    console.log('here', updatedLoan[1].dataValues.id);
    const uninvestedChunkIds = compact(map(prevChunks, (pc) => {
      if (pc.invested === false) return pc.id;
      return null;
    }));
    await Chunk.update({
      status: 'CLOSED',
      closed: true,
      closedon: moment(),
    }, {
      fields: ['status', 'closed', 'closedon'],
      limit: 1,
      where: {
        loan: updatedLoan[1].dataValues.id,
        invested: false,
        id: slice(uninvestedChunkIds, 0, numChunkClose),
      },
    });
  } else {
    // close all numChunkClose which are not invested
    await Chunk.update({
      status: 'CLOSED',
      closed: true,
      closedon: moment(),
    }, {
      where: {
        loan: updatedLoan[1].dataValues.id,
        invested: false,
      },
    });
    // also close remaining invested chunks that need to be closed
    const investedChunks = compact(map(prevChunks, (pc) => {
      if (pc.invested === true) return pc.id;
      return null;
    }));
    console.log(investedChunks);
    await Chunk.update({
      status: 'CLOSED',
      closed: true,
      closedon: moment(),
    }, {
      where: {
        loan: updatedLoan[1].dataValues.id,
        invested: true,
        id: slice(investedChunks, 0, numChunkClose - notInvestedCount),
      },
    });
  }
};

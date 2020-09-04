const { isEmpty, groupBy, map, each } = require('lodash');

const { logger } = require('../../config/logger');

const { moment } = require('../utils/commons.utils');

const { Op } = require('../models');

const {
    Investor,
    Investment,
    Investmenttochunk,
    Chunk,
  } = global.sequelize;

const joinObjects = (params) => {
    const { parentArray } = params;
    const { childGroupedObject } = params;
    const { parentKey } = params;
    const { childRef } = params;
    const { removeParentRef } = params;
    const { notArray } = params;
    map(parentArray, (parentArrayObject) => {
      if (childGroupedObject[parentArrayObject[parentKey]]) {
        parentArrayObject[childRef] = childGroupedObject[parentArrayObject[parentKey]];
      } else if (notArray && notArray === true) {
        parentArrayObject[childRef] = {};
      } else {
        parentArrayObject[childRef] = [];
      }
      if (removeParentRef && removeParentRef.length > 0) {
        map(removeParentRef, (removeParentRefName) => {
          delete parentArray[removeParentRefName];
        });
      }
    });
    return parentArray;
  };

const transformInvestors = (params) => {
    const { investors } = params;
    let transformedInvestors = [];
    map(investors, (investor) => {
       let transformedObj = {};
       transformedObj.id = investor.id;
       transformedObj.refid = investor.refid;
       transformedObj.phone = investor.phone;
       transformedInvestors.push(transformedObj);
    });
    return transformedInvestors;
};

const transformInvestments = (params) => {
    const { investments } = params;
    let transformedInvestments = [];
    map(investments, (investment) => {
       let transformedObj = {};
       transformedObj.id = investment.id;
       transformedObj.investor = investment.investor;
       transformedObj.amount = investment.amount;
       transformedObj.returntotal = investment.returntotal;
       transformedObj.status = investment.status;
       transformedObj.roimaxlimit = investment.roimaxlimit;
       transformedObj.investedon = investment.investedon;
       transformedObj.fetchedon = investment.fetchedon;
       transformedObj.closedon = investment.closedon;
       transformedObj.createdAt = investment.createdAt;
       transformedObj.updatedAt = investment.updatedAt;
       transformedInvestments.push(transformedObj);
    });
    return transformedInvestments;
};

const transformChunks = (params) => {
    const { chunks, chunkToInvMap } = params;
    let transformedChunks = [];
    map(chunks, (chunk) => {
       let transformedObj = {};
       transformedObj.id = chunk.id;
       transformedObj.loan = chunk.loan;
       transformedObj.interestrate = chunk.interestrate;
       transformedObj.currentinterestrate = chunk.currentinterestrate;
       transformedObj.status = chunk.status;
       transformedObj.invested = chunk.invested;
       transformedObj.closed = chunk.closed;
       transformedObj.investedon = chunk.investedon;
       transformedObj.closedon = chunk.closedon;
       transformedObj.fetchedon = chunk.fetchedon;
       transformedObj.investmentid = chunkToInvMap[chunk.id];
       transformedChunks.push(transformedObj);
    });
    return transformedChunks;
};

exports.getInvestments = async (filterParams) => {
    try {
        const returnObject = [];
        const searchInvestmentsParams = {};
        const searchInvestorParams = {};
        const searchChunks = {};
        const searchInvToChunks = {};
        if (!isEmpty(filterParams.investmentIds)) {
            const idList = filterParams.investmentIds.split(',');
            searchInvestmentsParams.id = { [Op.in]: idList };
        }
        if (!isEmpty(filterParams.investorIds)) {
            const investorList = filterParams.investorIds.split(',');
            searchInvestmentsParams.investor = { [Op.in]: investorList };
            searchInvestorParams.id = { [Op.in]: investorList }
        }
        const orderInvestments = [['createdAt', 'DESC']];

        if(isEmpty(filterParams.investorIds) && !isEmpty(filterParams.investmentIds)) {
            // get search investor ids only for these investments
        }

        let investors = await Investor.findInvestorByParams(searchInvestorParams);
        let transformedInvestors = transformInvestors({ investors });
        let investments = await Investment.findInvestmentByParamsInclude(searchInvestmentsParams, orderInvestments);
        let transformedInvestments = transformInvestments({ investments });
        let investmentIdsExtracted = map(transformedInvestments, (investment) => investment.id);
        console.log(investmentIdsExtracted);
        const groupedInvestments = groupBy(transformedInvestments, 'investor');
        joinObjects({
            parentArray: transformedInvestors, parentKey: 'id', childGroupedObject: groupedInvestments, childRef: 'investments',
        });
        searchInvToChunks.investmentid = { [Op.in]: investmentIdsExtracted };
        let invtochunk = await Investmenttochunk.findInvToChunksByParamsInclude(searchInvToChunks);
        let chunkToInvMap = {};
        map(invtochunk, (ic) => {
            chunkToInvMap[ic.chunkid] = ic.investmentid;
        });
        let chunks = await Chunk.findChunksByParamsInclude(searchChunks);
        let transformedChunks = transformChunks({ chunks, chunkToInvMap });
        const groupedChunks = groupBy(transformedChunks, 'investmentid');
        joinObjects({
            parentArray: transformedInvestments, parentKey: 'id', childGroupedObject: groupedChunks, childRef: 'chunks',
        });
        return transformedInvestors;
    } catch(err) {
        logger.error('Something unexpected happened (get investment details util): ', err);
        throw err;
    }
};

const syncInvestment = async (params) => {
  const { investmentId, invtofetchmap } = params;
  const fetchedondate = moment(invtofetchmap[investmentId]).utc().add(5.5, 'hours').startOf('day');
  const currentdate = moment().utc().add(5.5, 'hours').startOf('day');
  if (currentdate.diff(fetchedondate, 'days') > 0) {
    let searchInvToChunks = {};
    searchInvToChunks.investmentid = { [Op.in]: [investmentId] };
    let invtochunk = await Investmenttochunk.findInvToChunksByParamsInclude(searchInvToChunks);
    let totalearning = 0;
    /* map(invtochunk, (ic) => {
      let chunk = await Chunk.findChunkByID(ic.id);
      if (!chunk.closed) {
        let earning = (amount * schemeinterest * 0.01 * currentdate.diff(fetchedondate, 'days')) / 365;
        let updateObject = {
          earning: ic.earning + earning,
          updatedAt: moment().utc(),
        };
        const updateRows = await Investmenttochunk.update(updateObject, { where: { id: { [Op.in]: [ic.id] } } });
        totalearning = totalearning + earning;
      }
    }); */
    for(i in invtochunk) {
      let chunk = await Chunk.findChunkByID(invtochunk[i].chunkid);
      console.log('checkkkkk ------- ');
      console.log(chunk.id, chunk.closed);
      if (!chunk.closed) {
        let earning = (invtochunk[i].amount * invtochunk[i].schemeinterest * 0.01 * currentdate.diff(fetchedondate, 'days')) / 365;
        console.log('earning = ' + earning);
        let updateObject = {
          earning: invtochunk[i].earning + earning,
          updatedAt: moment().utc(),
        };
        const updateRows = await Investmenttochunk.update(updateObject, { where: { id: { [Op.in]: [invtochunk[i].id] } } });
        totalearning = totalearning + earning;
      }
    }
    let investmentToUpdate = await Investment.findOne({where: { id: investmentId }});
    let updateObject2 = {
      returntotal: investmentToUpdate.returntotal + totalearning,
      updatedAt: moment().utc(),
      fetchedon: moment().utc(),
    };
    // const updateRows2 = await Investment.update(updateObject2, { where: { id: { [Op.in]: [investmentId] } } });
    /*
    const invChnks = await Investmenttochunk.findAll({
      where: {
        investmentid: investmentId,
      },
      raw: true,
    });
    let sumReturn = 0;
    each(invChnks, (ic) => {
      sumReturn += ic.earning;
    });
    await Investment.update({
      returntotal: sumReturn,
      updatedAt: moment().utc(),
      fetchedon: moment().utc(),
    }, {
      where: { id: investmentId },
    });
    */
    console.log(investmentId);
    const updateRows2 = await Investment.update(updateObject2, { where: { id: { [Op.in]: [investmentId] } } });
    console.log('totalearning = ' + totalearning);
  }
};

exports.syncInvestments = async (params) => {
  const { investmentIds } = params;
  const investmentIdList = investmentIds.split(',');
  let parallelExecutionArray = [];
  let invtofetchmap = {};
  let searchInvestmentsParams = {};
  if (investmentIdList.length > 0) {
    searchInvestmentsParams.id = { [Op.in]: investmentIdList };
  }
  const orderInvestments = [['createdAt', 'DESC']];
  let investments = await Investment.findInvestmentByParamsInclude(searchInvestmentsParams, orderInvestments);
  // console.log(investments);
  let transformedInvestments = transformInvestments({ investments });
  // console.log(transformedInvestments);
  map(transformedInvestments, (investment) => {
    invtofetchmap[investment.id] = investment.fetchedon;
  });
  console.log(investmentIdList, invtofetchmap);
  map(investmentIdList, (investmentId) => {
    parallelExecutionArray.push(syncInvestment({ investmentId, invtofetchmap }));
  });
  if (parallelExecutionArray.length > 0) {
    await Promise.all(parallelExecutionArray);
  }
  let returnObj = {
    success: `Sync done for the investments - ${investmentIds}`,
  };
  console.log(returnObj);
  return returnObj;
};
const { isEmpty, groupBy, map } = require('lodash');

const { logger } = require('../../config/logger');

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
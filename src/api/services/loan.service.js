const axios = require('axios');
const { supporttoken } = require('../../config/vars');
const { logger } = require('../../config/logger');

exports.getLoanFromPayments = async (params) => {
  const options = {
    method: 'GET',
    url: `https://api-qa.rupeek.co/pay/api/getloandetail?loan=${params.loanid}`,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `JWT ${supporttoken}`,
    },
  };

  logger.info(options);
  const response = await axios(options);
  logger.info(response);

  return response.data.loan;
};

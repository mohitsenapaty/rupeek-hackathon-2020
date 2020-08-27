const axios = require('axios');
const { supporttoken } = require('../../config/vars');
const { logger } = require('../../config/logger');

exports.getLoanFromPayments = async (loanid) => {
  const options = {
    method: 'GET',
    url: `https://3991883d-0af2-4c1c-be4d-6a7c65ebd079.mock.pstmn.io/pay/api/getloandetail?loan=${loanid}`,
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

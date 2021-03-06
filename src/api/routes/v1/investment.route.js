/* eslint-disable max-len */
const express = require('express');

const controller = require('../../controllers/investment.controller');

const router = express.Router();

router
  .route('/list')

  .get(controller.listInvestments);

router
  .route('/create')
  
  .post(controller.createInvestment);

router
  .route('/sync')
  
  .post(controller.syncInvestment); 

module.exports = router;

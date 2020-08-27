/* eslint-disable max-len */
const express = require('express');

const controller = require('../../controllers/investment.controller');

const router = express.Router();

router
  .route('/list')

  .get(controller.listInvestments);

module.exports = router;

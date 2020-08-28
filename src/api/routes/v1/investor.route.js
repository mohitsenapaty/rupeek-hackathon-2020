/* eslint-disable max-len */
const express = require('express');

const controller = require('../../controllers/investor.controller');

const router = express.Router();

router
  .route('/')

  .post(controller.filterChunks);

module.exports = router;

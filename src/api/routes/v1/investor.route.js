/* eslint-disable max-len */
const express = require('express');

const controller = require('../../controllers/investor.controller');

const router = express.Router();

router
  .route('/')

  .post(controller.filterChunks);

router
  .route('/mapChunks')

  .post(controller.mapChunks);

module.exports = router;

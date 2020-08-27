const express = require('express');

const controller = require('../../controllers/loan.controller');

const router = express.Router();

router
  .route('/')
  /**
   * @api {post} api/v1/rules/add Add
   * @apiDescription Add rules
   * @apiVersion 1.0.0
   * @apiName Add rules
   * @apiGroup rules
   *
   * @apiHeader {String} Authorization  None
   *
   * @apiSuccess {Object} Status and Message
   *
   * @apiError (Unauthorized 401)  Unauthorized  Only authenticated data can access the data
   * @apiError (Forbidden 403)     Forbidden
   */
  .post(controller.syncLoanFromPayments);

const express = require('express');
const investmentApiRoutes = require('./investment.route');
const loanRoutes = require('./loan.route');

const router = express.Router();

/**
 * API Routes
 */
router.use('/api/v1/investment', investmentApiRoutes);
router.use('/api/v1/loan', loanRoutes);

module.exports = router;

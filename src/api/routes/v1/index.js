const express = require('express');
const investmentApiRoutes = require('./investment.route');

const router = express.Router();

/**
 * API Routes
 */
router.use('/api/v1/investment', investmentApiRoutes);

module.exports = router;

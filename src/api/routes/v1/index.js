const express = require('express');
const loanRoutes = require('./loan.route');

const router = express.Router();

router.use('/api/v1/loan', loanRoutes);

module.exports = router;

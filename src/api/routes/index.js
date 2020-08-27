const express = require('express');
const routesV1 = require('./v1');

const router = express.Router();

/**
* GET /api/status
*/
router.get('/api/health', (req, res) => res.send({ status: 'up' }));

router.use(routesV1);

/**
* API Routes
*/
// router.use('/api/lenders', lenderDetailRoutes);
router.use(routesV1);

module.exports = router;

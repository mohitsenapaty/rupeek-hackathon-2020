const express = require('express');

const routesV1 = require('./v1');

const router = express.Router();

/**
* GET /api/status
*/
router.get('/api/status', (req, res, next) => {
  return res.status(200).send({
    data: "OK"
  })
  next();
});

router.use(routesV1);

/**
* API Routes
*/
// router.use('/api/lenders', lenderDetailRoutes);


module.exports = router;

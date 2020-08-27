const express = require('express');
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

/**
* API Routes
*/
// router.use('/api/lenders', lenderDetailRoutes);


module.exports = router;

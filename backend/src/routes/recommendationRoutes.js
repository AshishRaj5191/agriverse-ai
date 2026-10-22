const express = require('express');
const { authenticate, authorize } = require('../middleware/authMiddleware');
const {
  recommendCrops,
  recommendFertilizer,
} = require('../controllers/recommendationController');

const router = express.Router();

router.use(authenticate);
router.use(authorize('farmer'));

router.post('/crops', recommendCrops);
router.post('/fertilizer', recommendFertilizer);

module.exports = router;

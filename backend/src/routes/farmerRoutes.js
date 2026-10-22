const express = require('express');
const { authenticate, authorize } = require('../middleware/authMiddleware');
const {
  fetchFarmerProfile,
  updateFarmerProfileHandler,
} = require('../controllers/profileController');
const farmRecordsRoutes = require('./farmRecordsRoutes');
const recommendationRoutes = require('./recommendationRoutes');

const router = express.Router();

router.use(authenticate);
router.use(authorize('farmer'));

router.get('/profile', fetchFarmerProfile);
router.put('/profile', updateFarmerProfileHandler);

router.use('/farm-records', farmRecordsRoutes);
router.use('/recommendations', recommendationRoutes);

module.exports = router;

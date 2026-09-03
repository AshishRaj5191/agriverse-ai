const express = require('express');
const { authenticate, authorize } = require('../middleware/authMiddleware');
const {
  fetchExpertProfile,
  updateExpertProfileHandler,
} = require('../controllers/profileController');

const router = express.Router();

router.use(authenticate);
router.use(authorize('expert'));

router.get('/profile', fetchExpertProfile);
router.put('/profile', updateExpertProfileHandler);

module.exports = router;

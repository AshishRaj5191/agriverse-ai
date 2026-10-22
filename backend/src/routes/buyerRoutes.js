const express = require('express');
const { authenticate, authorize } = require('../middleware/authMiddleware');
const {
  fetchBuyerProfile,
  updateBuyerProfileHandler,
} = require('../controllers/profileController');

const router = express.Router();

router.use(authenticate);
router.use(authorize('buyer'));

router.get('/profile', fetchBuyerProfile);
router.put('/profile', updateBuyerProfileHandler);

module.exports = router;

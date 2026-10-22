const express = require('express');
const {
  authenticate,
  authorize,
} = require('../middleware/authMiddleware');
const {
  getWeather,
} = require('../controllers/weatherController');

const router = express.Router();

router.use(authenticate);
router.use(authorize('farmer'));

router.get('/', getWeather);

module.exports = router;
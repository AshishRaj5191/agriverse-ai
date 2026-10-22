const express = require('express');
const { body } = require('express-validator');
const { authenticate, authorize } = require('../middleware/authMiddleware');
const { processVoiceRequest } = require('../controllers/voiceController');

const router = express.Router();

router.use(authenticate);
router.use(authorize('farmer'));

router.post(
  '/process',
  [body('text').isString().trim().isLength({ min: 1, max: 1000 }).withMessage('Voice question must be between 1 and 1000 characters.')],
  processVoiceRequest
);

module.exports = router;

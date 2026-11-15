const express = require('express');
const { body } = require('express-validator');
const { authenticate, authorize } = require('../middleware/authMiddleware');
const {
  startConversation, listConversations, listMessages, sendMessage,
} = require('../controllers/marketplaceChatController');

const router = express.Router();
router.use(authenticate);
router.use(authorize('buyer', 'farmer', 'admin'));
router.get('/', listConversations);
router.post('/', body('listingId').isMongoId().withMessage('A valid listing is required.'), startConversation);
router.get('/:id/messages', listMessages);
router.post('/:id/messages', body('message').trim().isLength({ min: 1, max: 2000 }).withMessage('Message must be between 1 and 2000 characters.'), sendMessage);

module.exports = router;

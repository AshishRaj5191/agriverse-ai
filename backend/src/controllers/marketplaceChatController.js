const mongoose = require('mongoose');
const Product = require('../models/Product');
const MarketplaceConversation = require('../models/MarketplaceConversation');
const MarketplaceMessage = require('../models/MarketplaceMessage');
const Notification = require('../models/Notification');
const ApiError = require('../utils/ApiError');

function validId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

async function getConversationForUser(id, userId) {
  if (!validId(id)) throw new ApiError(400, 'Invalid conversation ID.');
  const conversation = await MarketplaceConversation.findOne({
    _id: id,
    $or: [{ buyer: userId }, { seller: userId }],
  });
  if (!conversation) throw new ApiError(404, 'Conversation not found.');
  return conversation;
}

async function startConversation(req, res, next) {
  try {
    if (!validId(req.body.listingId)) throw new ApiError(400, 'Invalid listing ID.');
    const listing = await Product.findOne({ _id: req.body.listingId });
    if (!listing) throw new ApiError(404, 'Listing not found.');
    if (listing.seller.toString() === req.user.userId) throw new ApiError(400, 'You cannot message yourself.');
    let conversation = await MarketplaceConversation.findOne({
      listing: listing._id,
      buyer: req.user.userId,
      seller: listing.seller,
    });
    if (!conversation) {
      conversation = await MarketplaceConversation.create({
        listing: listing._id,
        buyer: req.user.userId,
        seller: listing.seller,
      });
      await Notification.create({
        recipient: listing.seller,
        type: 'marketplace_chat_started',
        message: `A buyer started a chat about your animal listing: ${listing.name}.`,
        marketplaceConversation: conversation._id,
      });
    }
    res.status(200).json({ success: true, data: conversation });
  } catch (error) {
    next(error);
  }
}

async function listConversations(req, res, next) {
  try {
    const conversations = await MarketplaceConversation.find({
      $or: [{ buyer: req.user.userId }, { seller: req.user.userId }],
    })
      .populate('listing', 'name images status')
      .populate('buyer seller', 'name')
      .sort({ lastMessageAt: -1 })
      .lean();
    res.json({ success: true, data: conversations });
  } catch (error) {
    next(error);
  }
}

async function listMessages(req, res, next) {
  try {
    const conversation = await getConversationForUser(req.params.id, req.user.userId);
    const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 50, 1), 100);
    const messages = await MarketplaceMessage.find({ conversation: conversation._id })
      .populate('sender', 'name')
      .sort({ createdAt: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();
    const unreadField = conversation.buyer.toString() === req.user.userId ? 'unreadForBuyer' : 'unreadForSeller';
    conversation[unreadField] = 0;
    await conversation.save();
    await MarketplaceMessage.updateMany(
      { conversation: conversation._id, sender: { $ne: req.user.userId }, readAt: null },
      { $set: { readAt: new Date() } }
    );
    res.json({ success: true, data: messages, pagination: { page, limit } });
  } catch (error) {
    next(error);
  }
}

async function sendMessage(req, res, next) {
  try {
    const conversation = await getConversationForUser(req.params.id, req.user.userId);
    const message = String(req.body.message || '').trim();
    if (!message || message.length > 2000) throw new ApiError(400, 'Message must be between 1 and 2000 characters.');
    const created = await MarketplaceMessage.create({
      conversation: conversation._id,
      sender: req.user.userId,
      message,
    });
    const senderIsBuyer = conversation.buyer.toString() === req.user.userId;
    conversation.lastMessage = message;
    conversation.lastMessageAt = created.createdAt;
    conversation[senderIsBuyer ? 'unreadForSeller' : 'unreadForBuyer'] += 1;
    await conversation.save();
    const listing = await Product.findById(conversation.listing).select('name').lean();
    await Notification.create({
      recipient: senderIsBuyer ? conversation.seller : conversation.buyer,
      type: 'marketplace_message',
      message: `New marketplace message about ${listing?.name || 'your listing'}.`,
      marketplaceConversation: conversation._id,
    });
    await created.populate('sender', 'name');
    res.status(201).json({ success: true, data: created });
  } catch (error) {
    next(error);
  }
}

module.exports = { startConversation, listConversations, listMessages, sendMessage };

const Notification = require('../models/Notification');
const ApiError = require('../utils/ApiError');

async function listNotifications(req, res, next) {
  try {
    const data = await Notification.find({ recipient: req.user.userId }).sort({ createdAt: -1 }).limit(50).lean();
    return res.json({ success: true, data });
  } catch (error) { return next(error); }
}

async function markNotificationRead(req, res, next) {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user.userId },
      { readAt: new Date() },
      { new: true }
    ).lean();
    if (!notification) throw new ApiError(404, 'Notification not found.');
    return res.json({ success: true, data: notification });
  } catch (error) { return next(error); }
}

async function markAllNotificationsRead(req, res, next) {
  try {
    const result = await Notification.updateMany(
      { recipient: req.user.userId, readAt: null },
      { $set: { readAt: new Date() } }
    );
    return res.json({ success: true, message: 'All notifications marked as read.', data: { modifiedCount: result.modifiedCount } });
  } catch (error) {
    return next(error);
  }
}

module.exports = { listNotifications, markNotificationRead, markAllNotificationsRead };

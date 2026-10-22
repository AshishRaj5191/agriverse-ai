const mongoose = require('mongoose');

const consultationMessageSchema = new mongoose.Schema(
  {
    consultation: { type: mongoose.Schema.Types.ObjectId, ref: 'ConsultationRequest', required: true, index: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, required: true, trim: true, maxlength: 4000 },
    attachments: [{ url: String, publicId: String }],
  },
  { timestamps: true }
);

consultationMessageSchema.index({ consultation: 1, createdAt: 1 });

module.exports = mongoose.model('ConsultationMessage', consultationMessageSchema);

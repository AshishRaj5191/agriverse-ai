const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true },
  },
  { _id: false }
);

const consultationRequestSchema = new mongoose.Schema(
  {
    farmer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    expert: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    expertProfile: { type: mongoose.Schema.Types.ObjectId, ref: 'ExpertProfile', required: true },
    farmerName: { type: String, required: true, trim: true, maxlength: 100 },
    farmerEmail: { type: String, required: true, trim: true, lowercase: true },
    farmerPhone: { type: String, trim: true, maxlength: 30 },
    state: { type: String, required: true, trim: true },
    district: { type: String, required: true, trim: true },
    cropName: { type: String, required: true, trim: true, maxlength: 100 },
    problemTitle: { type: String, required: true, trim: true, maxlength: 160 },
    problemDescription: { type: String, required: true, trim: true, maxlength: 4000 },
    symptoms: { type: String, trim: true, maxlength: 2000 },
    affectedArea: { type: String, trim: true, maxlength: 100 },
    preferredContactTime: { type: String, trim: true, maxlength: 120 },
    images: { type: [imageSchema], default: [] },
    cropStage: { type: String, trim: true, maxlength: 120 },
    additionalInformation: { type: String, trim: true, maxlength: 2000 },
    status: { type: String, enum: ['pending', 'accepted', 'declined', 'responded', 'closed', 'rejected', 'completed'], default: 'pending', index: true },
    expertResponse: {
      diagnosis: { type: String, trim: true, maxlength: 2000 },
      recommendation: { type: String, trim: true, maxlength: 4000 },
      visitRequired: { type: Boolean, default: false },
      visitDate: { type: Date, default: null },
      message: { type: String, trim: true, maxlength: 4000 },
      respondedAt: { type: Date, default: null },
    },
    expertResponseAt: { type: Date },
  },
  { timestamps: true }
);

consultationRequestSchema.index({ expert: 1, status: 1, createdAt: -1 });
consultationRequestSchema.index({ farmer: 1, createdAt: -1 });

module.exports = mongoose.model('ConsultationRequest', consultationRequestSchema);

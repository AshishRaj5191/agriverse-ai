const mongoose = require('mongoose');

const verificationStatusValues = ['pending', 'verified', 'rejected'];

const expertProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    specialization: {
      type: String,
      trim: true,
    },
    experience: {
      type: String,
      trim: true,
    },
    qualification: {
      type: String,
      trim: true,
    },
    state: {
      type: String,
      trim: true,
    },
    district: {
      type: String,
      trim: true,
    },
    serviceRadius: {
      type: String,
      trim: true,
    },
    bio: {
      type: String,
      trim: true,
    },
    verificationStatus: {
      type: String,
      enum: verificationStatusValues,
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

expertProfileSchema.index({ verificationStatus: 1, state: 1 });

const ExpertProfile = mongoose.model('ExpertProfile', expertProfileSchema);

module.exports = ExpertProfile;

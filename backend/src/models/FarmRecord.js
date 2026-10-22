const mongoose = require('mongoose');

const farmRecordSchema = new mongoose.Schema(
  {
    farmerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    farmProfileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FarmerProfile',
      required: false,
    },
    crop: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    cropVariety: {
      type: String,
      trim: true,
      maxlength: 100,
      default: null,
    },
    sowingDate: {
      type: Date,
      required: true,
    },
    expectedHarvestDate: {
      type: Date,
      default: null,
    },
    harvestDate: {
      type: Date,
      default: null,
    },
    soilInfo: {
      type: String,
      trim: true,
      maxlength: 500,
      default: '',
    },
    fertilizersUsed: [
      {
        name: String,
        quantity: String,
        dateApplied: Date,
      },
    ],
    farmingActivities: [
      {
        activity: String,
        date: Date,
        notes: String,
      },
    ],
    diseaseHistory: [
      {
        disease: String,
        dateObserved: Date,
        treatment: String,
        status: {
          type: String,
          enum: ['suspected', 'confirmed', 'treated', 'resolved'],
          default: 'suspected',
        },
      },
    ],
    notes: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: '',
    },
    images: [
      {
        url: {
          type: String,
          required: true,
        },
        publicId: {
          type: String,
          required: true,
        },
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    recordDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const FarmRecord = mongoose.model('FarmRecord', farmRecordSchema);

module.exports = FarmRecord;

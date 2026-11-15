const mongoose = require('mongoose');

const productImageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 120 },
    category: {
      type: String,
      required: true,
      enum: ['livestock', 'grains_crops', 'fruits_vegetables', 'seeds_farm_products', 'fertilizers', 'other', 'grains', 'vegetables', 'fruits', 'pulses', 'seeds'],
      index: true,
    },
    productType: { type: String, trim: true, maxlength: 80, index: true },
    description: { type: String, required: true, trim: true, minlength: 10, maxlength: 3000 },
    price: { type: Number, required: true, min: 0.01 },
    priceType: { type: String, enum: ['per_animal', 'per_unit', 'total_lot'], default: 'per_unit' },
    quantity: { type: Number, required: true, min: 0.01 },
    unit: { type: String, required: true, trim: true, maxlength: 30 },
    animalDetails: {
      animalType: { type: String, trim: true, maxlength: 50 },
      breed: { type: String, trim: true, maxlength: 80 },
      age: { type: Number, min: 0, max: 120 },
      gender: { type: String, enum: ['male', 'female', 'unknown'] },
      milkYieldPerDay: { type: Number, min: 0 },
      weightKg: { type: Number, min: 0.01 },
      healthDetails: { type: String, trim: true, maxlength: 1000 },
    },
    cropDetails: {
      harvestDate: { type: Date },
      season: { type: String, trim: true, maxlength: 80 },
      qualityGrade: { type: String, trim: true, maxlength: 80 },
    },
    location: {
      state: { type: String, required: true, trim: true, maxlength: 80, index: true },
      district: { type: String, required: true, trim: true, maxlength: 80, index: true },
      tehsil: { type: String, trim: true, maxlength: 80, index: true },
      village: { type: String, trim: true, maxlength: 100, index: true },
      address: { type: String, trim: true, maxlength: 300 },
      pincode: { type: String, required: true, trim: true, match: /^[1-9][0-9]{5}$/, index: true },
      landmark: { type: String, trim: true, maxlength: 160 },
      coordinates: {
        latitude: { type: Number, min: -90, max: 90 },
        longitude: { type: Number, min: -180, max: 180 },
      },
    },
    images: { type: [productImageSchema], default: [] },
    contactPhone: { type: String, trim: true, maxlength: 20 },
    status: { type: String, enum: ['available', 'reserved', 'sold', 'inactive', 'active'], default: 'available', index: true },
  },
  { timestamps: true }
);

productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ 'location.state': 1, 'location.district': 1, status: 1, createdAt: -1 });

module.exports = mongoose.model('Product', productSchema);

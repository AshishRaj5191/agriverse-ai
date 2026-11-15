const mongoose = require('mongoose');
const { validationResult } = require('express-validator');
const Product = require('../models/Product');
const MarketplaceInquiry = require('../models/MarketplaceInquiry');
const Notification = require('../models/Notification');
const FarmerProfile = require('../models/FarmerProfile');
const { uploadImage, deleteImage } = require('../services/imageService');
const ApiError = require('../utils/ApiError');

const publicProductQuery = { status: { $in: ['available', 'active'] } };

function validId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

function pageValues(query) {
  const page = Math.max(Number.parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(Number.parseInt(query.limit, 10) || 12, 1), 50);
  return { page, limit, skip: (page - 1) * limit };
}

function locationFromBody(body) {
  return {
    state: String(body.state || body['location.state'] || '').trim(),
    district: String(body.district || body['location.district'] || '').trim(),
    tehsil: String(body.tehsil || body['location.tehsil'] || '').trim(),
    village: String(body.village || body['location.village'] || '').trim(),
    address: String(body.address || body['location.address'] || '').trim(),
    pincode: String(body.pincode || body['location.pincode'] || '').trim(),
    landmark: String(body.landmark || body['location.landmark'] || '').trim(),
  };
}

function optionalNumber(value) {
  if (value === undefined || value === '') return undefined;
  return Number(value);
}

async function addPublicSellerContacts(products) {
  const list = Array.isArray(products) ? products : [products];
  const sellerIds = list.map((item) => item.seller?._id || item.seller).filter(Boolean);
  const profiles = await FarmerProfile.find({ user: { $in: sellerIds }, marketplacePhonePublic: true }).select('user phone').lean();
  const contacts = new Map(profiles.map((profile) => [profile.user.toString(), profile.phone]));
  return list.map((item) => ({
    ...item,
    seller: item.seller ? { ...item.seller, phone: contacts.get((item.seller._id || item.seller).toString()) || item.contactPhone || null } : item.seller,
  }));
}

async function listProducts(req, res, next) {
  try {
    const { page, limit, skip } = pageValues(req.query);
    const filter = { ...publicProductQuery };
    if (req.query.category) filter.category = req.query.category;
    ['state', 'district', 'tehsil', 'village'].forEach((field) => {
      if (req.query[field]) filter[`location.${field}`] = new RegExp(String(req.query[field]).trim(), 'i');
    });
    if (req.query.pincode) filter['location.pincode'] = String(req.query.pincode).trim();
    if (req.query.productType) filter.productType = new RegExp(String(req.query.productType).trim(), 'i');
    if (req.query.priceMin || req.query.priceMax) {
      filter.price = {};
      if (req.query.priceMin) filter.price.$gte = Number(req.query.priceMin);
      if (req.query.priceMax) filter.price.$lte = Number(req.query.priceMax);
    }
    if (req.query.search) filter.$text = { $search: String(req.query.search).trim() };
    const sort = req.query.sort === 'priceAsc' ? { price: 1 } : req.query.sort === 'priceDesc' ? { price: -1 } : { createdAt: -1 };

    const [products, total] = await Promise.all([
      Product.find(filter).populate('seller', 'name role').select('-__v').sort(sort).skip(skip).limit(limit).lean(),
      Product.countDocuments(filter),
    ]);

    res.json({ success: true, data: { products: await addPublicSellerContacts(products), pagination: { page, limit, total, pages: Math.ceil(total / limit) } } });
  } catch (error) {
    next(error);
  }
}

async function getProduct(req, res, next) {
  try {
    if (!validId(req.params.id)) throw new ApiError(400, 'Invalid product ID.');
    const product = await Product.findOne({ _id: req.params.id, ...publicProductQuery })
      .populate('seller', 'name role')
      .select('-__v')
      .lean();
    if (!product) throw new ApiError(404, 'Product listing not found.');
    res.json({ success: true, data: (await addPublicSellerContacts(product))[0] });
  } catch (error) {
    next(error);
  }
}

async function createProduct(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) throw new ApiError(400, errors.array()[0].msg);
    if (req.body.category === 'livestock' && !String(req.body.animalType || '').trim()) {
      throw new ApiError(400, 'Animal type is required for livestock listings.');
    }
    const images = [];
    for (const file of req.files || []) {
      const uploaded = await uploadImage(file.buffer, file.originalname, 'marketplace');
      images.push(uploaded);
    }
    const location = locationFromBody(req.body);
    const product = await Product.create({
      ...req.body,
      seller: req.user.userId,
      price: Number(req.body.price),
      quantity: Number(req.body.quantity),
      contactPhone: req.body.contactPhone,
      priceType: req.body.priceType || 'per_unit',
      productType: req.body.productType || req.body.name,
      location,
      animalDetails: req.body.category === 'livestock' ? {
        animalType: req.body.animalType,
        breed: req.body.breed,
        age: optionalNumber(req.body.age),
        gender: req.body.gender || 'unknown',
        weightKg: optionalNumber(req.body.weightKg),
        milkYieldPerDay: optionalNumber(req.body.milkYieldPerDay),
        healthDetails: req.body.healthDetails,
      } : undefined,
      cropDetails: req.body.category !== 'livestock' ? {
        harvestDate: req.body.harvestDate || undefined,
        season: req.body.season,
        qualityGrade: req.body.qualityGrade,
      } : undefined,
      images,
    });
    res.status(201).json({ success: true, message: 'Product listed successfully.', data: product });
  } catch (error) {
    next(error);
  }
}

async function getOwnedProducts(req, res, next) {
  try {
    const products = await Product.find({ seller: req.user.userId }).sort({ createdAt: -1 }).lean();
    res.json({ success: true, data: products });
  } catch (error) {
    next(error);
  }
}

async function updateProduct(req, res, next) {
  try {
    if (!validId(req.params.id)) throw new ApiError(400, 'Invalid product ID.');
    const errors = validationResult(req);
    if (!errors.isEmpty()) throw new ApiError(400, errors.array()[0].msg);
    const product = await Product.findById(req.params.id);
    if (!product) throw new ApiError(404, 'Product listing not found.');
    if (product.seller.toString() !== req.user.userId && req.user.role !== 'admin') throw new ApiError(403, 'You cannot modify this listing.');
    ['name', 'category', 'description', 'unit', 'status', 'priceType', 'productType', 'contactPhone'].forEach((field) => {
      if (req.body[field] !== undefined) product[field] = req.body[field];
    });
    if (req.body.price !== undefined) product.price = Number(req.body.price);
    if (req.body.quantity !== undefined) product.quantity = Number(req.body.quantity);
    const location = locationFromBody(req.body);
    if (Object.values(location).some(Boolean)) product.location = { ...product.location.toObject(), ...location };
    if (product.category === 'livestock') {
      product.animalDetails = {
        ...product.animalDetails?.toObject?.(),
        animalType: req.body.animalType ?? product.animalDetails?.animalType,
        breed: req.body.breed ?? product.animalDetails?.breed,
        age: req.body.age === undefined ? product.animalDetails?.age : optionalNumber(req.body.age),
        gender: req.body.gender ?? product.animalDetails?.gender,
        weightKg: req.body.weightKg === undefined ? product.animalDetails?.weightKg : optionalNumber(req.body.weightKg),
        milkYieldPerDay: req.body.milkYieldPerDay === undefined ? product.animalDetails?.milkYieldPerDay : optionalNumber(req.body.milkYieldPerDay),
        healthDetails: req.body.healthDetails ?? product.animalDetails?.healthDetails,
      };
    }
    for (const file of req.files || []) product.images.push(await uploadImage(file.buffer, file.originalname, 'marketplace'));
    await product.save();
    res.json({ success: true, message: 'Product listing updated successfully.', data: product });
  } catch (error) {
    next(error);
  }
}

async function deleteProduct(req, res, next) {
  try {
    if (!validId(req.params.id)) throw new ApiError(400, 'Invalid product ID.');
    const product = await Product.findById(req.params.id);
    if (!product) throw new ApiError(404, 'Product listing not found.');
    if (product.seller.toString() !== req.user.userId && req.user.role !== 'admin') throw new ApiError(403, 'You cannot delete this listing.');
    for (const image of product.images) await deleteImage(image.publicId);
    await product.deleteOne();
    res.json({ success: true, message: 'Product listing deleted successfully.' });
  } catch (error) {
    next(error);
  }
}

async function createInquiry(req, res, next) {
  try {
    if (!validId(req.params.id)) throw new ApiError(400, 'Invalid product ID.');
    const product = await Product.findOne({ _id: req.params.id, ...publicProductQuery });
    if (!product) throw new ApiError(404, 'Product listing not found.');
    if (product.seller.toString() === req.user.userId) throw new ApiError(400, 'You cannot contact yourself about your listing.');
    const inquiry = await MarketplaceInquiry.create({ product: product._id, buyer: req.user.userId, seller: product.seller, message: req.body.message });
    await Notification.create({
      recipient: product.seller,
      type: 'marketplace_inquiry',
      message: `New inquiry for your marketplace listing: ${product.name}.`,
      marketplaceInquiry: inquiry._id,
    });
    res.status(201).json({ success: true, message: 'Inquiry sent to the seller.', data: inquiry });
  } catch (error) {
    next(error);
  }
}

async function listInquiries(req, res, next) {
  try {
    const filter = req.user.role === 'admin' ? {} : { $or: [{ seller: req.user.userId }, { buyer: req.user.userId }] };
    const inquiries = await MarketplaceInquiry.find(filter).populate('product', 'name').populate('buyer seller', 'name').sort({ createdAt: -1 }).lean();
    res.json({ success: true, data: inquiries });
  } catch (error) {
    next(error);
  }
}

module.exports = { listProducts, getProduct, createProduct, getOwnedProducts, updateProduct, deleteProduct, createInquiry, listInquiries };

const express = require('express');
const multer = require('multer');
const { body } = require('express-validator');
const { authenticate, authorize } = require('../middleware/authMiddleware');
const {
  listProducts, getProduct, createProduct, getOwnedProducts, updateProduct, deleteProduct, createInquiry, listInquiries,
} = require('../controllers/marketplaceController');

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 6 },
  fileFilter: (req, file, cb) => {
    if (['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.mimetype)) return cb(null, true);
    return cb(new Error('Invalid image type. Only JPEG, PNG, and WEBP are allowed.'));
  },
});
const productValidation = [
  body('name').trim().isLength({ min: 2, max: 120 }).withMessage('Product name is required.'),
  body('category').isIn(['livestock', 'grains_crops', 'fruits_vegetables', 'seeds_farm_products', 'fertilizers', 'other', 'grains', 'vegetables', 'fruits', 'pulses', 'seeds']).withMessage('Choose a valid category.'),
  body('description').trim().isLength({ min: 10, max: 3000 }).withMessage('Description must be 10-3000 characters.'),
  body('price').isFloat({ gt: 0 }).withMessage('Price must be positive.'),
  body('quantity').isFloat({ gt: 0 }).withMessage('Quantity must be positive.'),
  body('unit').trim().isLength({ min: 1, max: 30 }).withMessage('Unit is required.'),
  body('state').trim().isLength({ min: 2, max: 80 }).withMessage('State is required.'),
  body('district').trim().isLength({ min: 2, max: 80 }).withMessage('District is required.'),
  body('address').trim().isLength({ min: 5, max: 300 }).withMessage('Full address is required.'),
  body('pincode').matches(/^[1-9][0-9]{5}$/).withMessage('A valid six-digit PIN code is required.'),
  body('contactPhone').trim().matches(/^\+?[0-9][0-9\s-]{9,14}$/).withMessage('A valid contact number is required.'),
  body('priceType').optional().isIn(['per_animal', 'per_unit', 'total_lot']).withMessage('Choose a valid price type.'),
  body('status').optional().isIn(['available', 'reserved', 'sold', 'inactive']).withMessage('Choose a valid listing status.'),
];
const updateProductValidation = [
  body('name').optional().trim().isLength({ min: 2, max: 120 }).withMessage('Product name is invalid.'),
  body('category').optional().isIn(['livestock', 'grains_crops', 'fruits_vegetables', 'seeds_farm_products', 'fertilizers', 'other', 'grains', 'vegetables', 'fruits', 'pulses', 'seeds']).withMessage('Choose a valid category.'),
  body('description').optional().trim().isLength({ min: 10, max: 3000 }).withMessage('Description must be 10-3000 characters.'),
  body('price').optional().isFloat({ gt: 0 }).withMessage('Price must be positive.'),
  body('quantity').optional().isFloat({ gt: 0 }).withMessage('Quantity must be positive.'),
  body('unit').optional().trim().isLength({ min: 1, max: 30 }).withMessage('Unit is invalid.'),
  body('location').optional().trim().isLength({ min: 2, max: 160 }).withMessage('Location is invalid.'),
  body('state').optional().trim().isLength({ min: 2, max: 80 }).withMessage('State is invalid.'),
  body('district').optional().trim().isLength({ min: 2, max: 80 }).withMessage('District is invalid.'),
  body('address').optional().trim().isLength({ min: 5, max: 300 }).withMessage('Address is invalid.'),
  body('pincode').optional().matches(/^[1-9][0-9]{5}$/).withMessage('PIN code is invalid.'),
  body('contactPhone').optional().trim().matches(/^\+?[0-9][0-9\s-]{9,14}$/).withMessage('Contact number is invalid.'),
  body('priceType').optional().isIn(['per_animal', 'per_unit', 'total_lot']).withMessage('Choose a valid price type.'),
  body('status').optional().isIn(['available', 'reserved', 'sold', 'inactive']).withMessage('Choose a valid listing status.'),
];

router.get('/', listProducts);
router.use(authenticate);
router.get('/seller/mine', authorize('farmer', 'buyer', 'admin'), getOwnedProducts);
router.get('/inquiries/mine', listInquiries);
router.post('/', authorize('farmer', 'buyer'), upload.array('images', 6), productValidation, createProduct);
router.put('/:id', authorize('farmer', 'buyer', 'admin'), upload.array('images', 6), updateProductValidation, updateProduct);
router.delete('/:id', authorize('farmer', 'buyer', 'admin'), deleteProduct);
router.post('/:id/inquiries', body('message').trim().isLength({ min: 3, max: 2000 }).withMessage('Inquiry message is required.'), createInquiry);
router.get('/:id', getProduct);

module.exports = router;

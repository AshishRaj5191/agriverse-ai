const express = require('express');
const { body } = require('express-validator');
const multer = require('multer');
const {
  createFarmRecord,
  getFarmRecords,
  getFarmRecordById,
  updateFarmRecord,
  deleteFarmRecord,
  uploadFarmImage,
  deleteRecordImage,
  addFertilizerEntry,
  addActivityEntry,
  addDiseaseEntry,
} = require('../controllers/farmRecordController');

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, and WEBP are allowed.'));
    }
  },
});

// POST /api/v1/farm-records
router.post(
  '/',
  [
    body('crop').trim().isLength({ min: 2 }).withMessage('Crop name is required.'),
    body('sowingDate').isISO8601().withMessage('Valid sowing date is required.'),
  ],
  createFarmRecord
);

// GET /api/v1/farm-records
router.get('/', getFarmRecords);

// GET /api/v1/farm-records/:id
router.get('/:id', getFarmRecordById);

// PUT /api/v1/farm-records/:id
router.put(
  '/:id',
  [
    body('crop').optional().trim().isLength({ min: 2 }).withMessage('Crop name is required.'),
  ],
  updateFarmRecord
);

// DELETE /api/v1/farm-records/:id
router.delete('/:id', deleteFarmRecord);

// POST /api/v1/farm-records/:id/images
router.post('/:id/images', upload.single('image'), uploadFarmImage);

// DELETE /api/v1/farm-records/:id/images/:imagePublicId
// Cloudinary public_id values can contain '/' and must be URL-encoded in the request path.
router.delete('/:id/images/:imagePublicId', deleteRecordImage);

// POST /api/v1/farm-records/:id/fertilizers
router.post(
  '/:id/fertilizers',
  [
    body('name').trim().isLength({ min: 1 }).withMessage('Fertilizer name is required.'),
    body('quantity').trim().isLength({ min: 1 }).withMessage('Quantity is required.'),
    body('dateApplied').isISO8601().withMessage('Valid date is required.'),
  ],
  addFertilizerEntry
);

// POST /api/v1/farm-records/:id/activities
router.post(
  '/:id/activities',
  [
    body('activity').trim().isLength({ min: 1 }).withMessage('Activity description is required.'),
    body('date').isISO8601().withMessage('Valid date is required.'),
  ],
  addActivityEntry
);

// POST /api/v1/farm-records/:id/diseases
router.post(
  '/:id/diseases',
  [
    body('disease').trim().isLength({ min: 1 }).withMessage('Disease name is required.'),
    body('dateObserved').isISO8601().withMessage('Valid observation date is required.'),
  ],
  addDiseaseEntry
);

module.exports = router;

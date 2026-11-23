const express = require('express');
const multer = require('multer');
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/authMiddleware');
const {
  createConsultation,
  listFarmerConsultations,
  listExpertConsultations,
  getConsultation,
  respondToConsultation,
  changeConsultationStatus,
  listMessages,
  sendMessage,
} = require('../controllers/consultationController');

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 5 },
  fileFilter: (req, file, callback) => {
    if (['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.mimetype)) return callback(null, true);
    return callback(new Error('Invalid image type. Only JPEG, PNG, and WEBP are allowed.'));
  },
});

router.use(authenticate);
router.post('/', authorize('farmer'), upload.array('images', 5), createConsultation);
router.get('/farmer', authorize('farmer'), listFarmerConsultations);
router.get('/expert', authorize('expert'), listExpertConsultations);
router.get('/:id', getConsultation);
router.patch('/:id/respond', authorize('expert'), respondToConsultation);
router.patch('/:id/accept', authorize('expert'), changeConsultationStatus);
router.patch('/:id/decline', authorize('expert'), changeConsultationStatus);
router.patch('/:id/close', changeConsultationStatus);
router.get('/:id/messages', listMessages);
router.post('/:id/messages', upload.array('images', 3), sendMessage);

module.exports = router;

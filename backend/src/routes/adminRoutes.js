const express = require('express');
const { authenticate, authorize } = require('../middleware/authMiddleware');
const {
  listAdminUsers,
  listAdminExperts,
} = require('../controllers/profileController');

const router = express.Router();

router.use(authenticate);
router.use(authorize('admin'));

router.get('/users', listAdminUsers);
router.get('/experts', listAdminExperts);

module.exports = router;

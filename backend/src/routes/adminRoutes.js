const express = require('express');
const { authenticate, authorize } = require('../middleware/authMiddleware');
const {
  listAdminUsers,
  listAdminExperts,
  updateExpertVerificationHandler,
} = require('../controllers/profileController');
const {
  createGovernmentSchemeHandler,
  updateGovernmentSchemeHandler,
  deleteGovernmentSchemeHandler,
  getGovernmentSchemes,
} = require('../controllers/governmentSchemeController');

const router = express.Router();

router.use(authenticate);
router.use(authorize('admin'));

router.get('/users', listAdminUsers);
router.get('/experts', listAdminExperts);
router.get('/government-schemes', getGovernmentSchemes);
router.post('/government-schemes', createGovernmentSchemeHandler);
router.patch('/government-schemes/:id', updateGovernmentSchemeHandler);
router.delete('/government-schemes/:id', deleteGovernmentSchemeHandler);
router.patch('/experts/:id/verification', updateExpertVerificationHandler);

module.exports = router;

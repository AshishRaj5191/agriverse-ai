const express = require('express');
const {
  getGovernmentSchemes,
  getGovernmentScheme,
  searchGovernmentSchemes,
  getGovernmentSchemesByCategory,
  getGovernmentSchemesByState,
} = require('../controllers/governmentSchemeController');

const router = express.Router();

router.get('/', getGovernmentSchemes);
router.get('/search', searchGovernmentSchemes);
router.get('/category/:category', getGovernmentSchemesByCategory);
router.get('/state/:state', getGovernmentSchemesByState);
router.get('/:id', getGovernmentScheme);

module.exports = router;

const express = require('express');
const { listIndianLocations } = require('../controllers/locationController');

const router = express.Router();

router.get('/', listIndianLocations);

module.exports = router;

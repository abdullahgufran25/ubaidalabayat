const express = require('express');
const {
  getSettings,
  updateSettings,
} = require('../controllers/settingsController');

const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

// Public route to fetch configuration metadata
router.get('/', getSettings);

// Admin-only route to update values
router.put('/', protect, authorize('admin'), updateSettings);

module.exports = router;

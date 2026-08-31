const express = require('express');
const {
  getInventoryStatus,
  getInventoryHistory,
  adjustInventory,
} = require('../controllers/inventoryController');

const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

// All inventory routes are protected for admin/staff
router.get('/', protect, authorize('admin', 'staff'), getInventoryStatus);
router.get('/history', protect, authorize('admin', 'staff'), getInventoryHistory);
router.post('/adjust', protect, authorize('admin'), adjustInventory);

module.exports = router;

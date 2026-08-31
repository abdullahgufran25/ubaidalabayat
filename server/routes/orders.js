const express = require('express');
const {
  createOrder,
  getOrders,
  getMyOrders,
  getOrder,
  updateOrderStatus,
  updateOrderTracking,
} = require('../controllers/orderController');

const router = express.Router();
const { protect, authorize, checkAuthOptional } = require('../middleware/auth');

// Public route to place orders (optional auth to link to profile if user is logged in)
router.post('/', checkAuthOptional, createOrder);

// Customer route to view their own orders
router.get('/my-orders', protect, getMyOrders);

// Admin/Staff routes to view and update orders
router.get('/', protect, authorize('admin', 'staff'), getOrders);

// Get single order (optional auth for matching guest/phone verification queries)
router.get('/:id', checkAuthOptional, getOrder);

router.put('/:id/status', protect, authorize('admin', 'staff'), updateOrderStatus);
router.put('/:id/tracking', protect, authorize('admin', 'staff'), updateOrderTracking);

module.exports = router;

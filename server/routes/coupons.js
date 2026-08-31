const express = require('express');
const {
  validateCoupon,
  getCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
} = require('../controllers/couponController');

const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

// Public route to validate coupon on cart/checkout
router.post('/validate', validateCoupon);

// Protected admin routes to manage coupons
router.get('/', protect, authorize('admin', 'staff'), getCoupons);
router.post('/', protect, authorize('admin'), createCoupon);
router.put('/:id', protect, authorize('admin'), updateCoupon);
router.delete('/:id', protect, authorize('admin'), deleteCoupon);

module.exports = router;

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
router.post('/', protect, authorize('admin', 'staff'), createCoupon);
router.put('/:id', protect, authorize('admin', 'staff'), updateCoupon);
router.delete('/:id', protect, authorize('admin', 'staff'), deleteCoupon);

module.exports = router;

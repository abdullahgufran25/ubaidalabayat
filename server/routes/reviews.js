const express = require('express');
const {
  addReview,
  getProductReviews,
  getAllReviews,
  approveReview,
  deleteReview,
} = require('../controllers/reviewController');

const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

// Public route to view reviews of a product
router.get('/:productId', getProductReviews);

// Protected customer route to submit reviews
router.post('/:productId', protect, addReview);

// Protected admin routes to list and moderate reviews
router.get('/', protect, authorize('admin', 'staff'), getAllReviews);
router.put('/:id/approve', protect, authorize('admin'), approveReview);
router.delete('/:id', protect, authorize('admin'), deleteReview);

module.exports = router;

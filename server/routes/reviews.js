const express = require('express');
const {
  addReview,
  getProductReviews,
  getHomeTestimonials,
  getAllReviews,
  approveReview,
  toggleFeatureHome,
  createAdminTestimonial,
  deleteReview,
} = require('../controllers/reviewController');

const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

// Public route to view home running testimonials (must be before /:productId)
router.get('/testimonials', getHomeTestimonials);

// Public route to view reviews of a product
router.get('/:productId', getProductReviews);

// Protected customer route to submit reviews
router.post('/:productId', protect, addReview);

// Protected admin routes to list, create, and moderate reviews
router.get('/', protect, authorize('admin', 'staff'), getAllReviews);
router.post('/admin-create', protect, authorize('admin', 'staff'), createAdminTestimonial);
router.put('/:id/approve', protect, authorize('admin', 'staff'), approveReview);
router.put('/:id/feature-home', protect, authorize('admin', 'staff'), toggleFeatureHome);
router.delete('/:id', protect, authorize('admin'), deleteReview);

module.exports = router;

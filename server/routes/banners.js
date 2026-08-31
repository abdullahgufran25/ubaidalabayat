const express = require('express');
const {
  getBanners,
  createBanner,
  updateBanner,
  deleteBanner,
} = require('../controllers/bannerController');

const router = express.Router();
const { protect, authorize, checkAuthOptional } = require('../middleware/auth');
const { upload } = require('../services/upload');

// Public route to view banners (optional auth checks for admin context)
router.get('/', checkAuthOptional, getBanners);

// Protected admin routes to modify banners
router.post('/', protect, authorize('admin', 'staff'), upload.single('image'), createBanner);
router.put('/:id', protect, authorize('admin', 'staff'), upload.single('image'), updateBanner);
router.delete('/:id', protect, authorize('admin'), deleteBanner);

module.exports = router;

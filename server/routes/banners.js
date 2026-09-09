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

// Banner multipart upload handler: supports both desktop and mobile files
const bannerUploadFields = upload.fields([
  { name: 'image', maxCount: 1 },        // Legacy / default desktop field
  { name: 'desktopImage', maxCount: 1 }, // Explicit desktop field
  { name: 'mobileImage', maxCount: 1 },  // Mobile banner field (3:4 ratio)
]);

// Protected admin routes to modify banners
router.post('/', protect, authorize('admin', 'staff'), bannerUploadFields, createBanner);
router.put('/:id', protect, authorize('admin', 'staff'), bannerUploadFields, updateBanner);
router.delete('/:id', protect, authorize('admin'), deleteBanner);

module.exports = router;

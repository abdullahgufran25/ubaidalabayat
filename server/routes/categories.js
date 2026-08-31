const express = require('express');
const {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
} = require('../controllers/categoryController');

const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { upload } = require('../services/upload');

// Public route to view categories
router.get('/', getCategories);
router.get('/:slug', getCategory);

// Protected admin routes to modify categories
router.post('/', protect, authorize('admin', 'staff'), upload.single('image'), createCategory);
router.put('/:id', protect, authorize('admin', 'staff'), upload.single('image'), updateCategory);
router.delete('/:id', protect, authorize('admin'), deleteCategory);

module.exports = router;

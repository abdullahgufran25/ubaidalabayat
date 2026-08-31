const express = require('express');
const {
  getProducts,
  getProductBySlug,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');

const router = express.Router();
const { protect, authorize, checkAuthOptional } = require('../middleware/auth');
const { upload } = require('../services/upload');

// Public routes (with optional auth mapping to show active vs inactive products)
router.get('/', checkAuthOptional, getProducts);
router.get('/slug/:slug', getProductBySlug);
router.get('/:id', getProduct);

// Protected admin routes to modify products
router.post('/', protect, authorize('admin', 'staff'), upload.array('images', 5), createProduct);
router.put('/:id', protect, authorize('admin', 'staff'), upload.array('images', 5), updateProduct);
router.delete('/:id', protect, authorize('admin'), deleteProduct);

module.exports = router;

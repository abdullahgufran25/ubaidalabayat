const Category = require('../models/category');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const { uploadSingleImage } = require('../services/upload');

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
exports.getCategories = asyncHandler(async (req, res, next) => {
  const filter = {};
  // If not admin/staff, only show active categories
  if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'staff')) {
    filter.isActive = true;
  }
  const categories = await Category.find(filter).sort({ name: 1 });

  res.status(200).json({
    success: true,
    data: categories,
  });
});

// @desc    Get single category by slug
// @route   GET /api/categories/:slug
// @access  Public
exports.getCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.findOne({ slug: req.params.slug });

  if (!category) {
    return next(new ErrorResponse(`Category not found with slug of ${req.params.slug}`, 404));
  }

  res.status(200).json({
    success: true,
    data: category,
  });
});

// @desc    Create new category
// @route   POST /api/categories
// @access  Private/Admin
exports.createCategory = asyncHandler(async (req, res, next) => {
  let { name, isActive } = req.body;
  
  // Check if category already exists
  let categoryExists = await Category.findOne({ name });
  if (categoryExists) {
    return next(new ErrorResponse('Category with this name already exists', 400));
  }

  let imageUrl = '';
  if (req.file) {
    imageUrl = await uploadSingleImage(req.file);
  }

  const category = await Category.create({
    name,
    isActive: isActive === 'false' ? false : true,
    image: imageUrl,
  });

  res.status(201).json({
    success: true,
    message: 'Category created successfully',
    data: category,
  });
});

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private/Admin
exports.updateCategory = asyncHandler(async (req, res, next) => {
  let category = await Category.findById(req.params.id);

  if (!category) {
    return next(new ErrorResponse(`Category not found with id of ${req.params.id}`, 404));
  }

  // Handle image upload if a new file is uploaded
  if (req.file) {
    req.body.image = await uploadSingleImage(req.file);
  }

  // Handle boolean flags sent as strings from FormData
  if (req.body.isActive !== undefined) {
    req.body.isActive = req.body.isActive === 'true' || req.body.isActive === true;
  }

  category = await Category.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    message: 'Category updated successfully',
    data: category,
  });
});

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
exports.deleteCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    return next(new ErrorResponse(`Category not found with id of ${req.params.id}`, 404));
  }

  // Optional: Check if products are associated with this category before deleting
  const Product = require('../models/product');
  const associatedProducts = await Product.countDocuments({ category: req.params.id });
  if (associatedProducts > 0) {
    return next(
      new ErrorResponse(
        `Cannot delete category. It is associated with ${associatedProducts} products.`,
        400
      )
    );
  }

  await category.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Category deleted successfully',
    data: {},
  });
});

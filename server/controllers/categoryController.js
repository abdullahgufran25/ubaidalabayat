const Category = require('../models/category');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const { uploadSingleImage, deleteImage } = require('../services/upload');

const Product = require('../models/product');

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
exports.getCategories = asyncHandler(async (req, res, next) => {
  const filter = {};
  // If not admin/staff, only show active categories
  if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'staff')) {
    filter.isActive = true;
  }
  const categories = await Category.find(filter).sort({ name: 1 }).lean();

  // Aggregate active product counts per category
  const productFilter = (!req.user || (req.user.role !== 'admin' && req.user.role !== 'staff'))
    ? { isActive: true }
    : {};
  const productCounts = await Product.aggregate([
    { $match: productFilter },
    { $group: { _id: '$category', count: { $sum: 1 } } },
  ]);

  const countMap = {};
  productCounts.forEach((pc) => {
    if (pc._id) {
      countMap[pc._id.toString()] = pc.count;
    }
  });

  const data = categories.map((cat) => ({
    ...cat,
    productCount: countMap[cat._id.toString()] || 0,
  }));

  res.status(200).json({
    success: true,
    data,
  });
});

// @desc    Get single category by slug
// @route   GET /api/categories/:slug
// @access  Public
exports.getCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.findOne({ slug: req.params.slug }).lean();

  if (!category) {
    return next(new ErrorResponse(`Category not found with slug of ${req.params.slug}`, 404));
  }

  const productFilter = (!req.user || (req.user.role !== 'admin' && req.user.role !== 'staff'))
    ? { category: category._id, isActive: true }
    : { category: category._id };
  const productCount = await Product.countDocuments(productFilter);

  res.status(200).json({
    success: true,
    data: {
      ...category,
      productCount,
    },
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
    if (category.image) {
      await deleteImage(category.image);
    }
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
  const associatedProducts = await Product.countDocuments({ category: req.params.id });
  if (associatedProducts > 0) {
    return next(
      new ErrorResponse(
        `Cannot delete category. It is associated with ${associatedProducts} products.`,
        400
      )
    );
  }

  if (category.image) {
    await deleteImage(category.image);
  }

  await category.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Category and image deleted successfully',
    data: {},
  });
});

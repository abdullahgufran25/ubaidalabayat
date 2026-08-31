const Product = require('../models/product');
const Category = require('../models/category');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const { uploadSingleImage } = require('../services/upload');

// @desc    Get all products (with advanced filters, search, sorting & pagination)
// @route   GET /api/products
// @access  Public
exports.getProducts = asyncHandler(async (req, res, next) => {
  let query;

  // Copy req.query
  const reqQuery = { ...req.query };

  // Fields to exclude from filtering
  const removeFields = ['select', 'sort', 'page', 'limit', 'search'];
  removeFields.forEach((param) => delete reqQuery[param]);

  // Construct query filter
  const filter = {};

  // Default filter: only show active products to customers
  if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'staff')) {
    filter.isActive = true;
  } else if (req.query.isActive !== undefined) {
    filter.isActive = req.query.isActive === 'true';
  }

  // Category filter (match by slug or ID)
  if (req.query.category) {
    const categoryDoc = await Category.findOne({
      $or: [{ slug: req.query.category }, { name: req.query.category }],
    });
    if (categoryDoc) {
      filter.category = categoryDoc._id;
    } else if (req.query.category.match(/^[0-9a-fA-F]{24}$/)) {
      filter.category = req.query.category;
    } else {
      // Category query entered but not found, return empty results
      return res.status(200).json({
        success: true,
        count: 0,
        pagination: {},
        data: [],
      });
    }
  }

  // Price range filters
  if (req.query.minPrice || req.query.maxPrice) {
    filter.$or = [];
    
    // Condition 1: Check active salePrice
    const saleCondition = {};
    if (req.query.minPrice) saleCondition.salePrice = { $gte: Number(req.query.minPrice) };
    if (req.query.maxPrice) {
      saleCondition.salePrice = saleCondition.salePrice || {};
      saleCondition.salePrice.$lte = Number(req.query.maxPrice);
    }
    saleCondition.salePrice.$ne = null; // Sale price exists
    filter.$or.push(saleCondition);

    // Condition 2: Check original price when salePrice doesn't exist
    const originalCondition = {};
    if (req.query.minPrice) originalCondition.price = { $gte: Number(req.query.minPrice) };
    if (req.query.maxPrice) {
      originalCondition.price = originalCondition.price || {};
      originalCondition.price.$lte = Number(req.query.maxPrice);
    }
    originalCondition.salePrice = { $eq: null }; // No active sale
    filter.$or.push(originalCondition);
  }

  // Size filter
  if (req.query.sizes) {
    const sizesArr = req.query.sizes.split(',');
    filter.sizes = { $in: sizesArr };
  }

  // Color filter
  if (req.query.colors) {
    const colorsArr = req.query.colors.split(',');
    filter.colors = { $in: colorsArr };
  }

  // Flags filters
  if (req.query.featured) filter.featured = req.query.featured === 'true';
  if (req.query.bestseller) filter.bestseller = req.query.bestseller === 'true';
  if (req.query.newArrival) filter.newArrival = req.query.newArrival === 'true';

  // Availability / In Stock filter
  if (req.query.inStock) {
    if (req.query.inStock === 'true') {
      filter.stock = { $gt: 0 };
    } else {
      filter.stock = 0;
    }
  }

  // Search keyword (matches Name, SKU, Description)
  if (req.query.search) {
    const regex = new RegExp(req.query.search, 'i');
    filter.$and = filter.$and || [];
    filter.$and.push({
      $or: [
        { name: regex },
        { sku: regex },
        { description: regex },
      ],
    });
  }

  // Query Execution
  query = Product.find(filter).populate('category', 'name slug');

  // Select Fields
  if (req.query.select) {
    const fields = req.query.select.split(',').join(' ');
    query = query.select(fields);
  }

  // Sort Option
  if (req.query.sort) {
    const sortBy = req.query.sort;
    if (sortBy === 'price-low') {
      // Sort by active price. Mongoose sort is not dynamic for salePrice vs price, 
      // but we can sort by salePrice or price. We will sort primarily by price.
      query = query.sort({ price: 1 });
    } else if (sortBy === 'price-high') {
      query = query.sort({ price: -1 });
    } else if (sortBy === 'popular') {
      query = query.sort({ averageRating: -1, numOfReviews: -1 });
    } else if (sortBy === 'newest') {
      query = query.sort({ createdAt: -1 });
    } else if (sortBy === 'bestselling') {
      query = query.sort({ bestseller: -1, stock: -1 });
    } else {
      query = query.sort('-createdAt');
    }
  } else {
    query = query.sort('-createdAt');
  }

  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 12;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await Product.countDocuments(filter);

  query = query.skip(startIndex).limit(limit);

  // Execute query
  const products = await query;

  // Pagination result
  const pagination = {};

  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit,
    };
  }

  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit,
    };
  }

  pagination.totalPages = Math.ceil(total / limit);
  pagination.totalItems = total;
  pagination.currentPage = page;

  res.status(200).json({
    success: true,
    count: products.length,
    pagination,
    data: products,
  });
});

// @desc    Get single product by slug
// @route   GET /api/products/slug/:slug
// @access  Public
exports.getProductBySlug = asyncHandler(async (req, res, next) => {
  const product = await Product.findOne({ slug: req.params.slug }).populate('category', 'name slug');

  if (!product) {
    return next(new ErrorResponse(`Product not found with slug of ${req.params.slug}`, 404));
  }

  res.status(200).json({
    success: true,
    data: product,
  });
});

// @desc    Get single product by ID
// @route   GET /api/products/:id
// @access  Public
exports.getProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id).populate('category', 'name slug');

  if (!product) {
    return next(new ErrorResponse(`Product not found with id of ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: product,
  });
});

// @desc    Create new product
// @route   POST /api/products
// @access  Private/Admin
exports.createProduct = asyncHandler(async (req, res, next) => {
  let {
    name,
    description,
    price,
    salePrice,
    category,
    sku,
    sizes,
    colors,
    stock,
    featured,
    bestseller,
    newArrival,
    isActive,
  } = req.body;

  // Validate sku uniqueness
  const existingProduct = await Product.findOne({ sku: sku.toUpperCase() });
  if (existingProduct) {
    return next(new ErrorResponse(`Product with SKU '${sku}' already exists`, 400));
  }

  // Handle uploaded images
  let imageUrls = [];
  if (req.files && req.files.length > 0) {
    for (const file of req.files) {
      const url = await uploadSingleImage(file);
      if (url) imageUrls.push(url);
    }
  } else if (req.body.images) {
    // If sent as raw array/string list from API
    imageUrls = Array.isArray(req.body.images) ? req.body.images : [req.body.images];
  }

  if (imageUrls.length === 0) {
    return next(new ErrorResponse('At least one product image is required', 400));
  }

  // Format array fields (FormData values are sent as comma-separated or separate values)
  if (typeof sizes === 'string') sizes = sizes.split(',').map(s => s.trim()).filter(Boolean);
  if (typeof colors === 'string') colors = colors.split(',').map(c => c.trim()).filter(Boolean);

  const product = await Product.create({
    name,
    description,
    price: Number(price),
    salePrice: salePrice ? Number(salePrice) : undefined,
    category,
    sku: sku.toUpperCase(),
    sizes: sizes || [],
    colors: colors || [],
    stock: Number(stock),
    featured: featured === 'true' || featured === true,
    bestseller: bestseller === 'true' || bestseller === true,
    newArrival: newArrival === 'true' || newArrival === true,
    isActive: isActive === 'false' ? false : true,
    images: imageUrls,
  });

  // Log inventory transaction for initial stock
  if (Number(stock) > 0) {
    const InventoryTransaction = require('../models/inventory');
    await InventoryTransaction.create({
      product: product._id,
      type: 'IN',
      quantity: Number(stock),
      reason: 'Initial stock entry',
      createdBy: req.user._id,
    });
  }

  res.status(201).json({
    success: true,
    message: 'Product created successfully',
    data: product,
  });
});

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
exports.updateProduct = asyncHandler(async (req, res, next) => {
  let product = await Product.findById(req.params.id);

  if (!product) {
    return next(new ErrorResponse(`Product not found with id of ${req.params.id}`, 404));
  }

  let imageUrls = [...product.images];

  // If new files uploaded, append or replace them
  if (req.files && req.files.length > 0) {
    const newUrls = [];
    for (const file of req.files) {
      const url = await uploadSingleImage(file);
      if (url) newUrls.push(url);
    }
    // If request wants to replace images (e.g. replace=true query or parameter), replace. Else append.
    if (req.body.replaceImages === 'true') {
      imageUrls = newUrls;
    } else {
      imageUrls = [...imageUrls, ...newUrls];
    }
  } else if (req.body.images) {
    // If explicit image list is passed
    imageUrls = Array.isArray(req.body.images) ? req.body.images : [req.body.images];
  }

  req.body.images = imageUrls;

  // Handle sizes/colors mapping if they are string lists
  if (typeof req.body.sizes === 'string') {
    req.body.sizes = req.body.sizes.split(',').map(s => s.trim()).filter(Boolean);
  }
  if (typeof req.body.colors === 'string') {
    req.body.colors = req.body.colors.split(',').map(c => c.trim()).filter(Boolean);
  }

  // Adjust types
  if (req.body.price) req.body.price = Number(req.body.price);
  if (req.body.salePrice !== undefined) {
    req.body.salePrice = req.body.salePrice ? Number(req.body.salePrice) : null;
  }
  if (req.body.stock !== undefined) {
    const newStock = Number(req.body.stock);
    const difference = newStock - product.stock;
    
    if (difference !== 0) {
      // Record stock transaction
      const InventoryTransaction = require('../models/inventory');
      await InventoryTransaction.create({
        product: product._id,
        type: difference > 0 ? 'IN' : 'ADJUSTMENT',
        quantity: Math.abs(difference),
        reason: req.body.adjustmentReason || `Manual stock update from ${product.stock} to ${newStock}`,
        createdBy: req.user._id,
      });
      req.body.stock = newStock;
    }
  }

  // Handle boolean toggles from FormData
  if (req.body.featured !== undefined) req.body.featured = req.body.featured === 'true' || req.body.featured === true;
  if (req.body.bestseller !== undefined) req.body.bestseller = req.body.bestseller === 'true' || req.body.bestseller === true;
  if (req.body.newArrival !== undefined) req.body.newArrival = req.body.newArrival === 'true' || req.body.newArrival === true;
  if (req.body.isActive !== undefined) req.body.isActive = req.body.isActive === 'true' || req.body.isActive === true;

  product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    message: 'Product updated successfully',
    data: product,
  });
});

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
exports.deleteProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new ErrorResponse(`Product not found with id of ${req.params.id}`, 404));
  }

  // Delete inventory transaction records
  const InventoryTransaction = require('../models/inventory');
  await InventoryTransaction.deleteMany({ product: req.params.id });

  // Delete reviews associated with product
  const Review = require('../models/review');
  await Review.deleteMany({ product: req.params.id });

  await product.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Product deleted successfully',
    data: {},
  });
});

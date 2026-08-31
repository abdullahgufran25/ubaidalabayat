const Review = require('../models/review');
const Order = require('../models/order');
const Product = require('../models/product');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Add review for a product
// @route   POST /api/reviews/:productId
// @access  Private (Verified purchaser check)
exports.addReview = asyncHandler(async (req, res, next) => {
  const { rating, comment } = req.body;
  const productId = req.params.productId;

  if (!rating || !comment) {
    return next(new ErrorResponse('Please provide a rating and a comment', 400));
  }

  // 1. Verify the product exists
  const product = await Product.findById(productId);
  if (!product) {
    return next(new ErrorResponse('Product not found', 404));
  }

  // 2. Verify user has purchased this product (Delivered order contains item with this product ID)
  const hasPurchased = await Order.findOne({
    user: req.user.id,
    orderStatus: 'Delivered',
    'items.product': productId,
  });

  if (!hasPurchased) {
    return next(
      new ErrorResponse(
        'You can only review products that you have purchased and have been successfully delivered.',
        400
      )
    );
  }

  // 3. Verify user hasn't already reviewed this product
  const alreadyReviewed = await Review.findOne({
    product: productId,
    user: req.user.id,
  });

  if (alreadyReviewed) {
    return next(new ErrorResponse('You have already reviewed this product', 400));
  }

  const review = await Review.create({
    product: productId,
    user: req.user.id,
    userName: req.user.name,
    rating: Number(rating),
    comment,
  });

  res.status(201).json({
    success: true,
    message: 'Review submitted successfully. It will be visible once approved by an admin.',
    data: review,
  });
});

// @desc    Get reviews for a product
// @route   GET /api/reviews/:productId
// @access  Public (Only returns approved reviews)
exports.getProductReviews = asyncHandler(async (req, res, next) => {
  const reviews = await Review.find({
    product: req.params.productId,
    isApproved: true,
  }).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: reviews.length,
    data: reviews,
  });
});

// ================= ADMIN REVIEWS CONTROLS =================

// @desc    Get all reviews (Admin)
// @route   GET /api/reviews
// @access  Private/Admin|Staff
exports.getAllReviews = asyncHandler(async (req, res, next) => {
  const reviews = await Review.find()
    .populate('product', 'name slug sku images')
    .populate('user', 'name email')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: reviews.length,
    data: reviews,
  });
});

// @desc    Approve/moderate review
// @route   PUT /api/reviews/:id/approve
// @access  Private/Admin
exports.approveReview = asyncHandler(async (req, res, next) => {
  const { isApproved } = req.body;

  let review = await Review.findById(req.params.id);
  if (!review) {
    return next(new ErrorResponse('Review not found', 404));
  }

  review.isApproved = isApproved === undefined ? true : isApproved;
  await review.save();

  // Explicitly trigger aggregate recalculation
  await Review.calculateAverageRating(review.product);

  res.status(200).json({
    success: true,
    message: `Review has been ${review.isApproved ? 'approved' : 'unapproved'}`,
    data: review,
  });
});

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private/Admin
exports.deleteReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id);
  if (!review) {
    return next(new ErrorResponse('Review not found', 404));
  }

  const productId = review.product;
  await review.deleteOne();

  // Recalculate average rating after deletion
  await Review.calculateAverageRating(productId);

  res.status(200).json({
    success: true,
    message: 'Review deleted successfully',
    data: {},
  });
});

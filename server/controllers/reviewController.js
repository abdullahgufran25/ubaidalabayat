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

// @desc    Get homepage running testimonials
// @route   GET /api/reviews/testimonials
// @access  Public
exports.getHomeTestimonials = asyncHandler(async (req, res, next) => {
  let testimonials = await Review.find({
    isApproved: true,
    isFeaturedOnHome: true,
  })
    .populate('product', 'name slug sku images')
    .sort({ createdAt: -1 });

  // Auto-seed initial elegant testimonials if none exist yet
  if (testimonials.length === 0) {
    const defaultTestimonials = [
      {
        userName: 'Zobia N.',
        city: 'Islamabad',
        title: 'Absolutely Premium',
        rating: 5,
        comment: 'The embroidery on the Zahra Abaya is exceptionally neat. Tailoring is perfect. Exceeded my expectations!',
        isApproved: true,
        isFeaturedOnHome: true,
      },
      {
        userName: 'Amina K.',
        city: 'Karachi',
        title: 'Incredibly Soft Georgette',
        rating: 5,
        comment: 'Ordered modal and georgette hijabs. The draping is gorgeous, and they are completely slip-free. Recommended!',
        isApproved: true,
        isFeaturedOnHome: true,
      },
      {
        userName: 'Maryam F.',
        city: 'Lahore',
        title: 'Outstanding Customer Service',
        rating: 5,
        comment: 'I wanted to customize my Abaya sleeve length. The team aligned over WhatsApp and delivered the perfect dress!',
        isApproved: true,
        isFeaturedOnHome: true,
      },
      {
        userName: 'Ayesha B.',
        city: 'Peshawar',
        title: 'Pure Luxury Feel',
        rating: 5,
        comment: 'The fabric quality is pure Saudi Nidha, breathable and completely opaque. Standard size 54 fits like bespoke couture.',
        isApproved: true,
        isFeaturedOnHome: true,
      },
      {
        userName: 'Fatima R.',
        city: 'Rawalpindi',
        title: 'Fast Delivery & Elegant Packaging',
        rating: 5,
        comment: 'Received within 2 days in a gorgeous branded luxury box. The attention to detail and packaging is unmatched!',
        isApproved: true,
        isFeaturedOnHome: true,
      },
    ];

    testimonials = await Review.insertMany(defaultTestimonials);
  }

  res.status(200).json({
    success: true,
    count: testimonials.length,
    data: testimonials,
  });
});

// @desc    Toggle feature review on homepage running tape
// @route   PUT /api/reviews/:id/feature-home
// @access  Private/Admin|Staff
exports.toggleFeatureHome = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id);
  if (!review) {
    return next(new ErrorResponse('Review not found', 404));
  }

  review.isFeaturedOnHome = !review.isFeaturedOnHome;
  // If featured on home, automatically ensure it is approved
  if (review.isFeaturedOnHome) {
    review.isApproved = true;
  }
  await review.save();

  res.status(200).json({
    success: true,
    message: review.isFeaturedOnHome
      ? 'Review is now featured on Homepage running tape!'
      : 'Review removed from Homepage running tape',
    data: review,
  });
});

// @desc    Create custom testimonial directly from Admin CMS
// @route   POST /api/reviews/admin-create
// @access  Private/Admin|Staff
exports.createAdminTestimonial = asyncHandler(async (req, res, next) => {
  const { userName, city, title, rating, comment, isFeaturedOnHome, productId } = req.body;

  if (!userName || !comment) {
    return next(new ErrorResponse('Please provide client name and testimonial review text', 400));
  }

  const review = await Review.create({
    userName: userName.trim(),
    city: city ? city.trim() : '',
    title: title ? title.trim() : '',
    rating: Number(rating) || 5,
    comment: comment.trim(),
    product: productId || undefined,
    user: req.user._id,
    isApproved: true,
    isFeaturedOnHome: isFeaturedOnHome !== false,
  });

  res.status(201).json({
    success: true,
    message: 'Customer testimonial created and featured successfully!',
    data: review,
  });
});

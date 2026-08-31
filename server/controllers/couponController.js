const Coupon = require('../models/coupon');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Validate coupon usability
// @route   POST /api/coupons/validate
// @access  Public (or customer)
exports.validateCoupon = asyncHandler(async (req, res, next) => {
  const { code, orderAmount } = req.body;

  if (!code) {
    return next(new ErrorResponse('Please provide coupon code', 400));
  }

  const coupon = await Coupon.findOne({ code: code.toUpperCase() });

  if (!coupon) {
    return next(new ErrorResponse('Invalid coupon code', 404));
  }

  if (!coupon.isValid(Number(orderAmount))) {
    // Check specific conditions to return helpful messages
    const now = new Date();
    if (!coupon.isActive) {
      return next(new ErrorResponse('This coupon code is inactive', 400));
    }
    if (coupon.expiryDate && coupon.expiryDate < now) {
      return next(new ErrorResponse('This coupon code has expired', 400));
    }
    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      return next(new ErrorResponse('This coupon has reached its usage limit', 400));
    }
    if (Number(orderAmount) < coupon.minOrderAmount) {
      return next(
        new ErrorResponse(
          `Minimum order value of ${coupon.minOrderAmount} is required to use this coupon`,
          400
        )
      );
    }
    return next(new ErrorResponse('Coupon cannot be applied', 400));
  }

  res.status(200).json({
    success: true,
    message: 'Coupon applied successfully',
    data: {
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      maxDiscount: coupon.maxDiscount,
    },
  });
});

// @desc    Get all coupons (Admin)
// @route   GET /api/coupons
// @access  Private/Admin|Staff
exports.getCoupons = asyncHandler(async (req, res, next) => {
  const coupons = await Coupon.find().sort({ createdAt: -1 });
  res.status(200).json({
    success: true,
    data: coupons,
  });
});

// @desc    Create coupon
// @route   POST /api/coupons
// @access  Private/Admin
exports.createCoupon = asyncHandler(async (req, res, next) => {
  const { code, discountType, discountValue, minOrderAmount, maxDiscount, expiryDate, usageLimit, isActive } = req.body;

  const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
  if (existingCoupon) {
    return next(new ErrorResponse('Coupon with this code already exists', 400));
  }

  const coupon = await Coupon.create({
    code: code.toUpperCase(),
    discountType,
    discountValue,
    minOrderAmount,
    maxDiscount,
    expiryDate,
    usageLimit,
    isActive,
  });

  res.status(201).json({
    success: true,
    message: 'Coupon created successfully',
    data: coupon,
  });
});

// @desc    Update coupon
// @route   PUT /api/coupons/:id
// @access  Private/Admin
exports.updateCoupon = asyncHandler(async (req, res, next) => {
  let coupon = await Coupon.findById(req.params.id);

  if (!coupon) {
    return next(new ErrorResponse(`Coupon not found with id of ${req.params.id}`, 404));
  }

  if (req.body.code) req.body.code = req.body.code.toUpperCase();

  coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    message: 'Coupon updated successfully',
    data: coupon,
  });
});

// @desc    Delete coupon
// @route   DELETE /api/coupons/:id
// @access  Private/Admin
exports.deleteCoupon = asyncHandler(async (req, res, next) => {
  const coupon = await Coupon.findById(req.params.id);

  if (!coupon) {
    return next(new ErrorResponse(`Coupon not found with id of ${req.params.id}`, 404));
  }

  await coupon.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Coupon deleted successfully',
    data: {},
  });
});

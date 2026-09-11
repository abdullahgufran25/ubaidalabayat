const Coupon = require('../models/coupon');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Validate coupon usability
// @route   POST /api/coupons/validate
// @access  Public (or customer)
exports.validateCoupon = asyncHandler(async (req, res, next) => {
  let { code, orderAmount } = req.body;

  if (!code || !code.trim()) {
    return next(new ErrorResponse('Please enter a coupon code', 400));
  }

  code = code.trim().toUpperCase();
  const numericAmount = Number(orderAmount) || 0;

  const coupon = await Coupon.findOne({ code });

  if (!coupon) {
    return next(new ErrorResponse(`Coupon code '${code}' is invalid`, 404));
  }

  // Check specific validation conditions
  const now = new Date();

  if (!coupon.isActive) {
    return next(new ErrorResponse(`Coupon '${code}' is currently inactive`, 400));
  }

  if (coupon.expiryDate && new Date(coupon.expiryDate) < now) {
    return next(new ErrorResponse(`Coupon '${code}' has expired`, 400));
  }

  if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
    return next(new ErrorResponse(`Coupon '${code}' has reached its maximum usage limit`, 400));
  }

  if (numericAmount < coupon.minOrderAmount) {
    return next(
      new ErrorResponse(
        `Minimum order amount of PKR ${coupon.minOrderAmount.toLocaleString()} is required for coupon '${code}'`,
        400
      )
    );
  }

  // Calculate discount preview
  let calculatedDiscount = 0;
  if (coupon.discountType === 'percentage') {
    calculatedDiscount = (coupon.discountValue / 100) * numericAmount;
    if (coupon.maxDiscount && calculatedDiscount > coupon.maxDiscount) {
      calculatedDiscount = coupon.maxDiscount;
    }
  } else {
    calculatedDiscount = coupon.discountValue;
  }
  if (calculatedDiscount > numericAmount) {
    calculatedDiscount = numericAmount;
  }

  res.status(200).json({
    success: true,
    message: `Coupon '${coupon.code}' applied successfully!`,
    data: {
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      maxDiscount: coupon.maxDiscount,
      minOrderAmount: coupon.minOrderAmount,
      calculatedDiscount: Math.round(calculatedDiscount),
    },
  });
});

// @desc    Get all coupons (Admin) - Auto-seeds default coupons if none exist
// @route   GET /api/coupons
// @access  Private/Admin|Staff
exports.getCoupons = asyncHandler(async (req, res, next) => {
  let count = await Coupon.countDocuments();

  // Auto-seed default luxury coupons if collection is empty
  if (count === 0) {
    const defaultExpiry = new Date();
    defaultExpiry.setMonth(defaultExpiry.getMonth() + 6);
    defaultExpiry.setHours(23, 59, 59, 999);

    await Coupon.create([
      {
        code: 'WELCOME10',
        discountType: 'percentage',
        discountValue: 10,
        minOrderAmount: 0,
        maxDiscount: 2000,
        expiryDate: defaultExpiry,
        usageLimit: null,
        isActive: true,
      },
      {
        code: 'ELEGANCE1000',
        discountType: 'fixed',
        discountValue: 1000,
        minOrderAmount: 7000,
        maxDiscount: null,
        expiryDate: defaultExpiry,
        usageLimit: null,
        isActive: true,
      },
    ]);
  }

  const coupons = await Coupon.find().sort({ createdAt: -1 });
  res.status(200).json({
    success: true,
    data: coupons,
  });
});

// @desc    Create coupon
// @route   POST /api/coupons
// @access  Private/Admin|Staff
exports.createCoupon = asyncHandler(async (req, res, next) => {
  let { code, discountType, discountValue, minOrderAmount, maxDiscount, expiryDate, usageLimit, isActive } = req.body;

  if (!code || !code.trim()) {
    return next(new ErrorResponse('Please provide a coupon code', 400));
  }

  code = code.trim().toUpperCase();

  if (discountValue === undefined || discountValue === null || Number(discountValue) <= 0) {
    return next(new ErrorResponse('Please enter a valid discount value greater than 0', 400));
  }

  if (discountType === 'percentage' && Number(discountValue) > 100) {
    return next(new ErrorResponse('Percentage discount cannot exceed 100%', 400));
  }

  if (!expiryDate) {
    return next(new ErrorResponse('Please select an expiry date', 400));
  }

  const existingCoupon = await Coupon.findOne({ code });
  if (existingCoupon) {
    return next(new ErrorResponse(`Coupon with code '${code}' already exists`, 400));
  }

  // Parse expiry and set to end of that calendar day (23:59:59.999)
  const parsedExpiry = new Date(expiryDate);
  parsedExpiry.setHours(23, 59, 59, 999);

  const coupon = await Coupon.create({
    code,
    discountType: discountType || 'percentage',
    discountValue: Number(discountValue),
    minOrderAmount: minOrderAmount ? Math.max(0, Number(minOrderAmount)) : 0,
    maxDiscount: discountType === 'percentage' && maxDiscount && Number(maxDiscount) > 0 ? Number(maxDiscount) : undefined,
    expiryDate: parsedExpiry,
    usageLimit: usageLimit && Number(usageLimit) > 0 ? Number(usageLimit) : null,
    isActive: isActive !== false,
  });

  res.status(201).json({
    success: true,
    message: `Coupon '${coupon.code}' created successfully`,
    data: coupon,
  });
});

// @desc    Update coupon
// @route   PUT /api/coupons/:id
// @access  Private/Admin|Staff
exports.updateCoupon = asyncHandler(async (req, res, next) => {
  let coupon = await Coupon.findById(req.params.id);

  if (!coupon) {
    return next(new ErrorResponse(`Coupon not found with id of ${req.params.id}`, 404));
  }

  let { code, discountType, discountValue, minOrderAmount, maxDiscount, expiryDate, usageLimit, isActive } = req.body;

  if (code) {
    code = code.trim().toUpperCase();
    const existingCoupon = await Coupon.findOne({ code, _id: { $ne: req.params.id } });
    if (existingCoupon) {
      return next(new ErrorResponse(`Another coupon with code '${code}' already exists`, 400));
    }
    coupon.code = code;
  }

  if (discountType) coupon.discountType = discountType;
  if (discountValue !== undefined && discountValue !== null) {
    const num = Number(discountValue);
    if (num <= 0) return next(new ErrorResponse('Discount value must be greater than 0', 400));
    if (coupon.discountType === 'percentage' && num > 100) return next(new ErrorResponse('Percentage discount cannot exceed 100%', 400));
    coupon.discountValue = num;
  }

  if (minOrderAmount !== undefined) {
    coupon.minOrderAmount = Math.max(0, Number(minOrderAmount) || 0);
  }

  if (coupon.discountType === 'percentage' && maxDiscount && Number(maxDiscount) > 0) {
    coupon.maxDiscount = Number(maxDiscount);
  } else {
    coupon.maxDiscount = undefined;
  }

  if (expiryDate) {
    const parsedExpiry = new Date(expiryDate);
    parsedExpiry.setHours(23, 59, 59, 999);
    coupon.expiryDate = parsedExpiry;
  }

  if (usageLimit && Number(usageLimit) > 0) {
    coupon.usageLimit = Number(usageLimit);
  } else {
    coupon.usageLimit = null;
  }

  if (isActive !== undefined) {
    coupon.isActive = isActive;
  }

  await coupon.save();

  res.status(200).json({
    success: true,
    message: `Coupon '${coupon.code}' updated successfully`,
    data: coupon,
  });
});

// @desc    Delete coupon
// @route   DELETE /api/coupons/:id
// @access  Private/Admin|Staff
exports.deleteCoupon = asyncHandler(async (req, res, next) => {
  const coupon = await Coupon.findById(req.params.id);

  if (!coupon) {
    return next(new ErrorResponse(`Coupon not found with id of ${req.params.id}`, 404));
  }

  const deletedCode = coupon.code;
  await coupon.deleteOne();

  res.status(200).json({
    success: true,
    message: `Coupon '${deletedCode}' deleted successfully`,
    data: {},
  });
});

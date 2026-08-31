const Banner = require('../models/banner');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const { uploadSingleImage } = require('../services/upload');

// @desc    Get all banners
// @route   GET /api/banners
// @access  Public
exports.getBanners = asyncHandler(async (req, res, next) => {
  const filter = {};
  // If not admin/staff, only show active banners
  if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'staff')) {
    filter.isActive = true;
  }
  const banners = await Banner.find(filter).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: banners,
  });
});

// @desc    Create new banner
// @route   POST /api/banners
// @access  Private/Admin
exports.createBanner = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    return next(new ErrorResponse('Please upload a banner image', 400));
  }

  const imageUrl = await uploadSingleImage(req.file);

  const { title, subtitle, link, type, isActive } = req.body;

  const banner = await Banner.create({
    title,
    subtitle,
    link,
    type,
    isActive: isActive === 'false' ? false : true,
    image: imageUrl,
  });

  res.status(201).json({
    success: true,
    message: 'Banner created successfully',
    data: banner,
  });
});

// @desc    Update banner
// @route   PUT /api/banners/:id
// @access  Private/Admin
exports.updateBanner = asyncHandler(async (req, res, next) => {
  let banner = await Banner.findById(req.params.id);

  if (!banner) {
    return next(new ErrorResponse(`Banner not found with id of ${req.params.id}`, 404));
  }

  if (req.file) {
    req.body.image = await uploadSingleImage(req.file);
  }

  if (req.body.isActive !== undefined) {
    req.body.isActive = req.body.isActive === 'true' || req.body.isActive === true;
  }

  banner = await Banner.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    message: 'Banner updated successfully',
    data: banner,
  });
});

// @desc    Delete banner
// @route   DELETE /api/banners/:id
// @access  Private/Admin
exports.deleteBanner = asyncHandler(async (req, res, next) => {
  const banner = await Banner.findById(req.params.id);

  if (!banner) {
    return next(new ErrorResponse(`Banner not found with id of ${req.params.id}`, 404));
  }

  await banner.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Banner deleted successfully',
    data: {},
  });
});

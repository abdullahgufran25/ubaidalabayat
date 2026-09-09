const Banner = require('../models/banner');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const { uploadSingleImage, deleteImage } = require('../services/upload');

// @desc    Get all banners
// @route   GET /api/banners
// @access  Public
exports.getBanners = asyncHandler(async (req, res, next) => {
  const filter = {};
  // If not admin/staff, only show active banners
  if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'staff')) {
    filter.isActive = true;
  }
  // Sort by admin-defined sortOrder first (lowest number first), then newest
  const banners = await Banner.find(filter).sort({ sortOrder: 1, createdAt: -1 });

  res.status(200).json({
    success: true,
    data: banners,
  });
});

// @desc    Create new banner
// @route   POST /api/banners
// @access  Private/Admin
exports.createBanner = asyncHandler(async (req, res, next) => {
  // Extract desktop and mobile files from req.files (upload.fields) or req.file
  const desktopFile = (req.files && (req.files.desktopImage?.[0] || req.files.image?.[0])) || req.file;
  const mobileFile = req.files && req.files.mobileImage?.[0];

  if (!desktopFile) {
    return next(new ErrorResponse('Please upload a desktop banner image (recommended 2560x1280 px)', 400));
  }

  // Upload primary desktop banner
  const desktopImageUrl = await uploadSingleImage(desktopFile);

  // Upload mobile banner if provided
  let mobileImageUrl = '';
  if (mobileFile) {
    mobileImageUrl = await uploadSingleImage(mobileFile);
  }

  const {
    title,
    subtitle,
    ctaText,
    ctaUrl,
    link,
    altText,
    desktopPosition,
    mobilePosition,
    sortOrder,
    type,
    isActive,
  } = req.body;

  const targetLink = ctaUrl || link || '/shop';

  const banner = await Banner.create({
    title: title || '',
    subtitle: subtitle || '',
    image: desktopImageUrl,
    desktopImage: desktopImageUrl,
    mobileImage: mobileImageUrl,
    ctaText: ctaText || 'Shop Collection',
    ctaUrl: targetLink,
    link: targetLink,
    altText: altText || '',
    desktopPosition: desktopPosition || 'center',
    mobilePosition: mobilePosition || 'center',
    sortOrder: sortOrder !== undefined && sortOrder !== '' ? Number(sortOrder) : 0,
    type: type || 'hero',
    isActive: isActive === 'false' || isActive === false ? false : true,
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

  const desktopFile = (req.files && (req.files.desktopImage?.[0] || req.files.image?.[0])) || req.file;
  const mobileFile = req.files && req.files.mobileImage?.[0];

  // If a new desktop image is uploaded, replace the old one
  if (desktopFile) {
    if (banner.image) {
      await deleteImage(banner.image);
    }
    if (banner.desktopImage && banner.desktopImage !== banner.image) {
      await deleteImage(banner.desktopImage);
    }
    const newDesktopUrl = await uploadSingleImage(desktopFile);
    req.body.image = newDesktopUrl;
    req.body.desktopImage = newDesktopUrl;
  }

  // If a new mobile image is uploaded, replace the old one
  if (mobileFile) {
    if (banner.mobileImage) {
      await deleteImage(banner.mobileImage);
    }
    const newMobileUrl = await uploadSingleImage(mobileFile);
    req.body.mobileImage = newMobileUrl;
  }

  if (req.body.isActive !== undefined) {
    req.body.isActive = req.body.isActive === 'true' || req.body.isActive === true;
  }

  if (req.body.sortOrder !== undefined && req.body.sortOrder !== '') {
    req.body.sortOrder = Number(req.body.sortOrder);
  }

  if (req.body.ctaUrl) {
    req.body.link = req.body.ctaUrl;
  } else if (req.body.link) {
    req.body.ctaUrl = req.body.link;
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

  // Delete all associated assets
  if (banner.image) {
    await deleteImage(banner.image);
  }
  if (banner.desktopImage && banner.desktopImage !== banner.image) {
    await deleteImage(banner.desktopImage);
  }
  if (banner.mobileImage) {
    await deleteImage(banner.mobileImage);
  }

  await banner.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Banner and associated assets deleted successfully',
    data: {},
  });
});

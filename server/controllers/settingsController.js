const StoreSettings = require('../models/settings');
const asyncHandler = require('../middleware/async');

// @desc    Get store settings
// @route   GET /api/settings
// @access  Public
exports.getSettings = asyncHandler(async (req, res, next) => {
  let settings = await StoreSettings.findOne();

  // If no settings document exists, create default settings
  if (!settings) {
    settings = await StoreSettings.create({
      whatsappNumber: process.env.WHATSAPP_NUMBER || '03287512751',
      shippingCharges: Number(process.env.DEFAULT_SHIPPING_CHARGES) || 200,
      freeShippingThreshold: Number(process.env.DEFAULT_FREE_SHIPPING_THRESHOLD) || 5000,
      currency: process.env.DEFAULT_CURRENCY || 'PKR',
      socialLinks: [
        { platform: 'Facebook', url: 'https://facebook.com/ubaidalabayat' },
        { platform: 'Instagram', url: 'https://instagram.com/ubaidalabayat' },
        { platform: 'Pinterest', url: 'https://pinterest.com/ubaidalabayat' }
      ]
    });
  }

  res.status(200).json({
    success: true,
    data: settings,
  });
});

// @desc    Update store settings
// @route   PUT /api/settings
// @access  Private/Admin
exports.updateSettings = asyncHandler(async (req, res, next) => {
  let settings = await StoreSettings.findOne();

  if (!settings) {
    settings = await StoreSettings.create(req.body);
  } else {
    settings = await StoreSettings.findByIdAndUpdate(settings._id, req.body, {
      new: true,
      runValidators: true,
    });
  }

  res.status(200).json({
    success: true,
    message: 'Store settings updated successfully',
    data: settings,
  });
});

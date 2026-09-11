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
      ],
      announcementBar: {
        enabled: true,
        speed: 4000,
        messages: [
          { text: '10% OFF ON CARD & ONLINE PAYMENTS | USE CODE: LUXURY10', link: '/shop' },
          { text: 'FREE SHIPPING ON ALL ORDERS ABOVE RS. 10,000 NATIONWIDE', link: '/shop' },
          { text: 'BESPOKE SAUDI NIDHA FABRIC ABAYAS | HANDCRAFTED ELEGANCE', link: '/shop' },
        ],
      },
    });
  } else if (!settings.announcementBar || !settings.announcementBar.messages || settings.announcementBar.messages.length === 0) {
    settings.announcementBar = {
      enabled: true,
      speed: 4000,
      messages: [
        { text: '10% OFF ON CARD & ONLINE PAYMENTS | USE CODE: LUXURY10', link: '/shop' },
        { text: 'FREE SHIPPING ON ALL ORDERS ABOVE RS. 10,000 NATIONWIDE', link: '/shop' },
        { text: 'BESPOKE SAUDI NIDHA FABRIC ABAYAS | HANDCRAFTED ELEGANCE', link: '/shop' },
      ],
    };
    await settings.save();
  }

  if (settings.bankTransferDiscountPercentage === undefined) {
    settings.bankTransferDiscountPercentage = 5;
    settings.bankTransferDiscountEnabled = true;
    await settings.save();
  }

  if (!settings.availableSizes || settings.availableSizes.length === 0) {
    settings.availableSizes = ['50', '52', '54', '56', '58', '60', 'XS', 'S', 'M', 'L', 'XL', '2XL', 'Standard', 'Free Size', 'Custom'];
    settings.availableColors = ['Black', 'Beige', 'Emerald Green', 'Navy Blue', 'Deep Plum', 'Mocha', 'Sand Beige', 'Dusty Rose', 'Maroon', 'White', 'Olive Green', 'Brown', 'Grey', 'Lilac', 'Burgundy', 'Teal'];
    await settings.save();
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

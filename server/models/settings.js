const mongoose = require('mongoose');

const storeSettingsSchema = new mongoose.Schema(
  {
    whatsappNumber: {
      type: String,
      default: '03287512751',
    },
    shippingCharges: {
      type: Number,
      default: 200,
    },
    freeShippingThreshold: {
      type: Number,
      default: 5000,
    },
    currency: {
      type: String,
      default: 'PKR',
    },
    contactEmail: {
      type: String,
      default: 'info@ubaidalabayat.com',
    },
    contactPhone: {
      type: String,
      default: '+92 328 7512751',
    },
    contactAddress: {
      type: String,
      default: '123 Fashion Street, Karachi, Pakistan',
    },
    facebookUrl: {
      type: String,
      default: 'https://facebook.com',
    },
    instagramUrl: {
      type: String,
      default: 'https://instagram.com',
    },
    pinterestUrl: {
      type: String,
      default: 'https://pinterest.com',
    },
    socialLinks: [
      {
        platform: { type: String, required: true },
        url: { type: String, required: true },
      }
    ],
    aboutUsText: {
      type: String,
      default: 'Ubaid Al Abayat is a premium fashion destination dedicated to elegant, minimal, and high-quality Abayas, Hijabs, and luxury accessories.',
    },
    footerText: {
      type: String,
      default: '© 2026 Ubaid Al Abayat. All Rights Reserved. Designed for elegance.',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('StoreSettings', storeSettingsSchema);

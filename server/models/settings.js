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
    // Payment Methods Configuration
    bankName: {
      type: String,
      default: 'Faysal Bank Limited (FBL)',
    },
    accountTitle: {
      type: String,
      default: 'UBAID ULLAH',
    },
    accountNumber: {
      type: String,
      default: '',
    },
    iban: {
      type: String,
      default: '',
    },
    bankBranch: {
      type: String,
      default: '',
    },
    bankInstructions: {
      type: String,
      default: 'Please transfer the exact order amount and share the payment screenshot on WhatsApp with your Order ID for instant dispatch.',
    },
    bankTransferEnabled: {
      type: Boolean,
      default: true,
    },
    codEnabled: {
      type: Boolean,
      default: true,
    },
    cardPaymentEnabled: {
      type: Boolean,
      default: false,
    },
    cardDiscountPercentage: {
      type: Number,
      default: 10,
      min: 0,
      max: 100,
    },
    cardDiscountEnabled: {
      type: Boolean,
      default: true,
    },
    // Top Announcement Bar / Promotional Slider
    announcementBar: {
      enabled: {
        type: Boolean,
        default: true,
      },
      speed: {
        type: Number,
        default: 4000,
      },
      messages: [
        {
          text: { type: String, required: true },
          link: { type: String, default: '' },
        },
      ],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('StoreSettings', storeSettingsSchema);

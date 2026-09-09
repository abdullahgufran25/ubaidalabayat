const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      default: '',
    },
    subtitle: {
      type: String,
      trim: true,
      default: '',
    },
    // Desktop banner image (primary image)
    image: {
      type: String,
      required: [true, 'Banner image is required'],
    },
    desktopImage: {
      type: String,
      default: '',
    },
    // Mobile banner image (3:4 ratio for screens < 768px)
    mobileImage: {
      type: String,
      default: '',
    },
    // CTA Button configuration
    ctaText: {
      type: String,
      trim: true,
      default: 'Shop Collection',
    },
    ctaUrl: {
      type: String,
      trim: true,
      default: '/shop',
    },
    link: {
      type: String,
      trim: true,
      default: '/shop',
    },
    // SEO & Accessibility
    altText: {
      type: String,
      trim: true,
      default: '',
    },
    // Object positioning controls (e.g. 'center', 'top', '50% 40%')
    desktopPosition: {
      type: String,
      trim: true,
      default: 'center',
    },
    mobilePosition: {
      type: String,
      trim: true,
      default: 'center',
    },
    // Display sort order for carousel slides
    sortOrder: {
      type: Number,
      default: 0,
    },
    type: {
      type: String,
      enum: ['hero', 'promo'],
      default: 'hero',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Banner', bannerSchema);

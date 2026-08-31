const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, 'Coupon code is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    discountType: {
      type: String,
      required: [true, 'Discount type is required'],
      enum: ['percentage', 'fixed'],
      default: 'percentage',
    },
    discountValue: {
      type: Number,
      required: [true, 'Discount value is required'],
      min: [0, 'Discount value must be positive'],
    },
    minOrderAmount: {
      type: Number,
      default: 0,
      min: [0, 'Minimum order amount must be positive'],
    },
    maxDiscount: {
      type: Number,
      min: [0, 'Max discount must be positive'],
    },
    expiryDate: {
      type: Date,
      required: [true, 'Expiry date is required'],
    },
    usageLimit: {
      type: Number,
      default: null, // Null means unlimited
    },
    usageCount: {
      type: Number,
      default: 0,
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

// Method to validate coupon usability
couponSchema.methods.isValid = function (orderAmount = 0) {
  const now = new Date();
  if (!this.isActive) return false;
  if (this.expiryDate && this.expiryDate < now) return false;
  if (this.usageLimit && this.usageCount >= this.usageLimit) return false;
  if (orderAmount < this.minOrderAmount) return false;
  return true;
};

module.exports = mongoose.model('Coupon', couponSchema);

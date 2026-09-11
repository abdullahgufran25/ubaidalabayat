const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: false,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    userName: {
      type: String,
      required: [true, 'User name is required'],
      trim: true,
    },
    city: {
      type: String,
      default: '',
      trim: true,
    },
    title: {
      type: String,
      default: '',
      trim: true,
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1 star'],
      max: [5, 'Rating cannot exceed 5 stars'],
      default: 5,
    },
    comment: {
      type: String,
      required: [true, 'Review comment is required'],
      trim: true,
    },
    isApproved: {
      type: Boolean,
      default: false, // Reviews moderated by admin
    },
    isFeaturedOnHome: {
      type: Boolean,
      default: false, // Selected to display in Home page running tape
    },
  },
  {
    timestamps: true,
  }
);

// After a review is saved or updated, we should recalculate the product average rating.
reviewSchema.statics.calculateAverageRating = async function (productId) {
  if (!productId) return;
  try {
    const stats = await this.aggregate([
      {
        $match: { product: productId, isApproved: true },
      },
      {
        $group: {
          _id: '$product',
          averageRating: { $avg: '$rating' },
          numOfReviews: { $sum: 1 },
        },
      },
    ]);

    if (stats.length > 0) {
      await mongoose.model('Product').findByIdAndUpdate(productId, {
        averageRating: Math.round(stats[0].averageRating * 10) / 10,
        numOfReviews: stats[0].numOfReviews,
      });
    } else {
      await mongoose.model('Product').findByIdAndUpdate(productId, {
        averageRating: 0,
        numOfReviews: 0,
      });
    }
  } catch (error) {
    console.error(`Error calculating average rating: ${error}`);
  }
};

// Recalculate on save
reviewSchema.post('save', function () {
  if (this.product) {
    this.constructor.calculateAverageRating(this.product);
  }
});

// Recalculate on delete/remove
reviewSchema.post('remove', function () {
  if (this.product) {
    this.constructor.calculateAverageRating(this.product);
  }
});

module.exports = mongoose.model('Review', reviewSchema);

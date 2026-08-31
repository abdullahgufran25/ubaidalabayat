const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product is required for a review'],
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required for a review'],
    },
    userName: {
      type: String,
      required: [true, 'User name is required'],
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1 star'],
      max: [5, 'Rating cannot exceed 5 stars'],
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
  },
  {
    timestamps: true,
  }
);

// After a review is saved or updated, we should recalculate the product average rating.
// Let's create a static method to update product average rating.
reviewSchema.statics.calculateAverageRating = async function (productId) {
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

  try {
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
  this.constructor.calculateAverageRating(this.product);
});

// Recalculate on delete/remove
reviewSchema.post('remove', function () {
  this.constructor.calculateAverageRating(this.product);
});

module.exports = mongoose.model('Review', reviewSchema);

const mongoose = require('mongoose');

const variantSchema = new mongoose.Schema({
  sku: {
    type: String,
    trim: true,
    uppercase: true,
  },
  color: {
    type: String,
    trim: true,
  },
  shade: {
    type: String,
    trim: true,
  },
  size: {
    type: String,
    trim: true,
  },
  sizes: {
    type: [String],
    default: [],
  },
  price: {
    type: Number,
    min: [0, 'Price must be positive'],
  },
  salePrice: {
    type: Number,
    min: [0, 'Sale price must be positive'],
  },
  stock: {
    type: Number,
    min: [0, 'Stock cannot be negative'],
    default: 0,
  },
  images: {
    type: [String],
    default: [],
  },
});

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Original price is required'],
      min: [0, 'Price must be positive'],
    },
    salePrice: {
      type: Number,
      min: [0, 'Sale price must be positive'],
      validate: {
        validator: function (val) {
          // If salePrice does not exist, it is valid
          if (val === undefined || val === null) return true;
          const currentPrice = this.price !== undefined ? this.price : (this.getUpdate ? (this.getUpdate().$set?.price || this.getUpdate().price) : undefined);
          if (currentPrice !== undefined) {
            return val <= currentPrice;
          }
          return true;
        },
        message: 'Sale price must be less than or equal to original price',
      },
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Product category is required'],
    },
    images: {
      type: [String],
      required: [true, 'At least one product image is required'],
      validate: [
        {
          validator: (arr) => arr.length > 0,
          message: 'At least one image is required',
        },
      ],
    },
    sku: {
      type: String,
      required: [true, 'Product SKU is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    sizes: {
      type: [String],
      default: [],
    },
    colors: {
      type: [String],
      default: [],
    },
    stock: {
      type: Number,
      required: [true, 'Stock quantity is required'],
      min: [0, 'Stock cannot be negative'],
      default: 0,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    bestseller: {
      type: Boolean,
      default: false,
    },
    bestsellerOrder: {
      type: Number,
      default: 999,
    },
    newArrival: {
      type: Boolean,
      default: false,
    },
    newArrivalOrder: {
      type: Number,
      default: 999,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    numOfReviews: {
      type: Number,
      default: 0,
    },
    variants: {
      type: [variantSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Returns actual variants if defined, or synthesizes a default variant from the product
productSchema.methods.getEffectiveVariants = function () {
  if (this.variants && this.variants.length > 0) {
    return this.variants;
  }
  return [
    {
      _id: this._id,
      sku: this.sku,
      color: this.colors && this.colors.length > 0 ? this.colors[0] : 'Standard',
      shade: '',
      sizes: this.sizes || [],
      price: this.price,
      salePrice: this.salePrice,
      stock: this.stock,
      images: this.images || [],
    },
  ];
};

// Auto-generate slug from name if not provided or modified
productSchema.pre('validate', function (next) {
  if (this.name && (!this.slug || this.isModified('name'))) {
    let baseSlug = this.name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');

    // If name contains only non-ASCII chars (like Urdu/Arabic), fallback to a clean timestamped slug
    if (!baseSlug) {
      baseSlug = `product-${Date.now()}`;
    }
    this.slug = baseSlug;
  }
  next();
});

module.exports = mongoose.model('Product', productSchema);

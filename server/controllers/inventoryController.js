const Product = require('../models/product');
const InventoryTransaction = require('../models/inventory');
const StoreSettings = require('../models/settings');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get real-time stock levels of all products
// @route   GET /api/inventory
// @access  Private/Admin|Staff
exports.getInventoryStatus = asyncHandler(async (req, res, next) => {
  // Configurable low-stock threshold from settings
  const settings = await StoreSettings.findOne();
  // We can add lowStockThreshold to settings model or default to 5
  const threshold = 5; // Default threshold

  const products = await Product.find().select('name sku price stock isActive images').sort({ stock: 1 });

  const inventory = products.map(product => {
    let status = 'In Stock';
    if (product.stock === 0) {
      status = 'Out of Stock';
    } else if (product.stock <= threshold) {
      status = 'Low Stock';
    }

    return {
      _id: product._id,
      name: product.name,
      sku: product.sku,
      stock: product.stock,
      isActive: product.isActive,
      image: product.images[0] || '',
      status,
    };
  });

  const summary = {
    totalProducts: products.length,
    lowStockCount: inventory.filter(i => i.status === 'Low Stock').length,
    outOfStockCount: inventory.filter(i => i.status === 'Out of Stock').length,
    totalStockCount: products.reduce((acc, p) => acc + p.stock, 0),
  };

  res.status(200).json({
    success: true,
    summary,
    data: inventory,
  });
});

// @desc    Get inventory transactions history log
// @route   GET /api/inventory/history
// @access  Private/Admin|Staff
exports.getInventoryHistory = asyncHandler(async (req, res, next) => {
  const transactions = await InventoryTransaction.find()
    .populate('product', 'name sku images')
    .populate('createdBy', 'name email')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: transactions.length,
    data: transactions,
  });
});

// @desc    Manually adjust product inventory stock levels
// @route   POST /api/inventory/adjust
// @access  Private/Admin
exports.adjustInventory = asyncHandler(async (req, res, next) => {
  const { productId, type, quantity, reason } = req.body;

  if (!productId || !type || quantity === undefined) {
    return next(new ErrorResponse('Please provide productId, transaction type (IN/OUT/ADJUSTMENT), and quantity', 400));
  }

  const product = await Product.findById(productId);
  if (!product) {
    return next(new ErrorResponse('Product not found', 404));
  }

  const qty = Number(quantity);
  if (qty < 0) {
    return next(new ErrorResponse('Quantity must be a positive integer', 400));
  }

  let newStock = product.stock;

  if (type === 'IN') {
    newStock += qty;
  } else if (type === 'OUT') {
    if (product.stock < qty) {
      return next(new ErrorResponse(`Cannot reduce stock by ${qty}. Only ${product.stock} in inventory.`, 400));
    }
    newStock -= qty;
  } else if (type === 'ADJUSTMENT') {
    // ADJUSTMENT treats quantity as the new absolute stock level
    newStock = qty;
  } else {
    return next(new ErrorResponse('Invalid transaction type. Must be IN, OUT, or ADJUSTMENT', 400));
  }

  const stockDifference = newStock - product.stock;

  // Update product stock
  product.stock = newStock;
  await product.save();

  // Log inventory transaction
  const transaction = await InventoryTransaction.create({
    product: productId,
    type,
    quantity: type === 'ADJUSTMENT' ? Math.abs(stockDifference) : qty,
    reason: reason || `Manual stock adjustment: set to ${newStock}`,
    createdBy: req.user._id,
  });

  res.status(200).json({
    success: true,
    message: `Inventory adjusted successfully. New stock: ${newStock}`,
    data: {
      product: product.name,
      sku: product.sku,
      stock: product.stock,
      transaction,
    },
  });
});

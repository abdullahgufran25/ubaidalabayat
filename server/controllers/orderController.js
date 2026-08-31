const Order = require('../models/order');
const Product = require('../models/product');
const Coupon = require('../models/coupon');
const StoreSettings = require('../models/settings');
const InventoryTransaction = require('../models/inventory');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Create new order
// @route   POST /api/orders
// @access  Public (Guest Checkout supported, but logs user ID if authenticated)
exports.createOrder = asyncHandler(async (req, res, next) => {
  const {
    items,
    shippingAddress,
    paymentMethod,
    couponCode,
    notes,
  } = req.body;

  if (!items || items.length === 0) {
    return next(new ErrorResponse('No items in order', 400));
  }

  if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.phone || !shippingAddress.address || !shippingAddress.city || !shippingAddress.postalCode) {
    return next(new ErrorResponse('Please provide complete shipping address details', 400));
  }

  // Fetch Store settings for shipping calculations
  let settings = await StoreSettings.findOne();
  if (!settings) {
    settings = { shippingCharges: 200, freeShippingThreshold: 5000 };
  }

  let subtotal = 0;
  const processedItems = [];

  // Validate items & calculate subtotal
  for (const item of items) {
    const product = await Product.findById(item.product);
    if (!product) {
      return next(new ErrorResponse(`Product not found with ID ${item.product}`, 404));
    }

    if (!product.isActive) {
      return next(new ErrorResponse(`Product '${product.name}' is no longer available`, 400));
    }

    if (product.stock < item.quantity) {
      return next(new ErrorResponse(`Insufficient stock for '${product.name}'. Only ${product.stock} available.`, 400));
    }

    const price = product.salePrice && product.salePrice > 0 ? product.salePrice : product.price;
    subtotal += price * item.quantity;

    processedItems.push({
      product: product._id,
      name: product.name,
      quantity: item.quantity,
      price,
      size: item.size || 'Free Size',
      color: item.color || 'Standard',
    });
  }

  // Calculate Shipping charges
  const shippingCharges = subtotal >= settings.freeShippingThreshold ? 0 : settings.shippingCharges;

  // Calculate Coupon discount
  let discountAmount = 0;
  let couponDoc = null;
  if (couponCode) {
    couponDoc = await Coupon.findOne({ code: couponCode.toUpperCase() });
    if (couponDoc && couponDoc.isValid(subtotal)) {
      if (couponDoc.discountType === 'percentage') {
        discountAmount = (couponDoc.discountValue / 100) * subtotal;
        if (couponDoc.maxDiscount && discountAmount > couponDoc.maxDiscount) {
          discountAmount = couponDoc.maxDiscount;
        }
      } else {
        discountAmount = couponDoc.discountValue;
      }
      // Ensure discount doesn't exceed subtotal
      if (discountAmount > subtotal) {
        discountAmount = subtotal;
      }
    } else {
      return next(new ErrorResponse('Invalid or expired coupon code', 400));
    }
  }

  const total = subtotal + shippingCharges - discountAmount;

  // Generate unique order number (e.g. UA-10001)
  const orderCount = await Order.countDocuments();
  const orderNumber = `UA-${10000 + orderCount + 1}`;

  // Deduct inventory & record transactions
  for (const item of processedItems) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: -item.quantity },
    });

    await InventoryTransaction.create({
      product: item.product,
      type: 'OUT',
      quantity: item.quantity,
      reason: `Order placed: ${orderNumber}`,
      createdBy: req.user ? req.user._id : undefined,
    });
  }

  // Update coupon usage count
  if (couponDoc) {
    await Coupon.findByIdAndUpdate(couponDoc._id, {
      $inc: { usageCount: 1 },
    });
  }

  // Create order
  const order = await Order.create({
    orderNumber,
    user: req.user ? req.user._id : undefined,
    items: processedItems,
    subtotal,
    shippingCharges,
    discountAmount,
    couponCode: couponCode ? couponCode.toUpperCase() : undefined,
    total,
    paymentMethod,
    paymentStatus: paymentMethod === 'Online' ? 'Paid' : 'Pending', // Online simulation, default Paid for simulation simplicity, COD Pending
    orderStatus: 'Pending',
    shippingAddress,
    notes,
  });

  res.status(201).json({
    success: true,
    message: 'Order placed successfully',
    data: order,
  });
});

// @desc    Get all orders (Admin/Staff)
// @route   GET /api/orders
// @access  Private/Admin|Staff
exports.getOrders = asyncHandler(async (req, res, next) => {
  const query = Order.find().sort({ createdAt: -1 });

  // Optional status filter
  if (req.query.status) {
    query.where({ orderStatus: req.query.status });
  }

  const orders = await query.populate('user', 'name email');

  res.status(200).json({
    success: true,
    count: orders.length,
    data: orders,
  });
});

// @desc    Get logged in customer's orders
// @route   GET /api/orders/my-orders
// @access  Private
exports.getMyOrders = asyncHandler(async (req, res, next) => {
  const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: orders.length,
    data: orders,
  });
});

// @desc    Get single order by ID or orderNumber
// @route   GET /api/orders/:id
// @access  Public (Guest needs orderNumber + phone validation, Authenticated users match user ID)
exports.getOrder = asyncHandler(async (req, res, next) => {
  let order;

  // Check if standard MongoDB ID or orderNumber slug
  if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
    order = await Order.findById(req.params.id).populate('items.product', 'images SKU slug');
  } else {
    order = await Order.findOne({ orderNumber: req.params.id.toUpperCase() }).populate('items.product', 'images SKU slug');
  }

  if (!order) {
    return next(new ErrorResponse('Order not found', 404));
  }

  // Authorization check: User matches or is admin/staff
  const isAuthorized =
    (req.user && (req.user.role === 'admin' || req.user.role === 'staff')) ||
    (req.user && order.user && order.user.toString() === req.user.id) ||
    // Guest check validation query matching phone number
    (req.query.phone && order.shippingAddress.phone === req.query.phone);

  if (!isAuthorized) {
    return next(new ErrorResponse('Not authorized to access this order details', 403));
  }

  res.status(200).json({
    success: true,
    data: order,
  });
});

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin|Staff
exports.updateOrderStatus = asyncHandler(async (req, res, next) => {
  const { status } = req.body;

  let order = await Order.findById(req.params.id);
  if (!order) {
    return next(new ErrorResponse('Order not found', 404));
  }

  // If order is being cancelled, return items to inventory
  if (status === 'Cancelled' && order.orderStatus !== 'Cancelled') {
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity },
      });

      await InventoryTransaction.create({
        product: item.product,
        type: 'IN',
        quantity: item.quantity,
        reason: `Order cancelled: ${order.orderNumber}`,
        createdBy: req.user._id,
      });
    }
  }

  // If order was cancelled and is now being re-activated (e.g. pending/confirmed)
  if (order.orderStatus === 'Cancelled' && status !== 'Cancelled') {
    // Check stock availability again
    for (const item of order.items) {
      const product = await Product.findById(item.product);
      if (product.stock < item.quantity) {
        return next(
          new ErrorResponse(
            `Cannot reactivate order. Product '${product.name}' does not have sufficient stock.`,
            400
          )
        );
      }
    }

    // Deduct stock again
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity },
      });

      await InventoryTransaction.create({
        product: item.product,
        type: 'OUT',
        quantity: item.quantity,
        reason: `Order reactivated: ${order.orderNumber}`,
        createdBy: req.user._id,
      });
    }
  }

  order.orderStatus = status;

  // Auto-set payment status to Paid if Delivered
  if (status === 'Delivered') {
    order.paymentStatus = 'Paid';
  }

  await order.save();

  res.status(200).json({
    success: true,
    message: `Order status updated to '${status}' successfully`,
    data: order,
  });
});

// @desc    Update order tracking number
// @route   PUT /api/orders/:id/tracking
// @access  Private/Admin|Staff
exports.updateOrderTracking = asyncHandler(async (req, res, next) => {
  const { trackingNumber } = req.body;

  let order = await Order.findById(req.params.id);
  if (!order) {
    return next(new ErrorResponse('Order not found', 404));
  }

  order.trackingNumber = trackingNumber;
  await order.save();

  res.status(200).json({
    success: true,
    message: 'Tracking number updated successfully',
    data: order,
  });
});

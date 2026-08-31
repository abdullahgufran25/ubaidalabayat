const mongoose = require('mongoose');

const inventoryTransactionSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true,
    },
    type: {
      type: String,
      required: true,
      enum: ['IN', 'OUT', 'ADJUSTMENT'],
    },
    quantity: {
      type: Number,
      required: true,
    },
    reason: {
      type: String,
      trim: true,
      default: '',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false, // can be system-generated on sales/refunds
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // only track when the transaction was logged
  }
);

module.exports = mongoose.model('InventoryTransaction', inventoryTransactionSchema);

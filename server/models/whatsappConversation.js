const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  id: {
    type: String, // Meta message id (wamid)
    trim: true,
  },
  direction: {
    type: String,
    enum: ['incoming', 'outgoing'],
    required: true,
  },
  sender: {
    type: String,
    enum: ['customer', 'bot', 'agent'],
    default: 'customer',
  },
  type: {
    type: String,
    enum: ['text', 'image', 'interactive', 'template'],
    default: 'text',
  },
  text: {
    type: String,
    trim: true,
  },
  mediaUrl: {
    type: String,
    trim: true,
  },
  status: {
    type: String,
    enum: ['sent', 'delivered', 'read', 'failed'],
    default: 'sent',
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const orderDraftSchema = new mongoose.Schema(
  {
    step: {
      type: String,
      enum: [
        'idle',
        'selecting_variant',
        'selecting_size',
        'selecting_quantity',
        'collecting_info',
        'confirming_order',
      ],
      default: 'idle',
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
    },
    productName: {
      type: String,
      trim: true,
    },
    variantId: {
      type: String,
    },
    color: {
      type: String,
      trim: true,
    },
    size: {
      type: String,
      trim: true,
    },
    quantity: {
      type: Number,
      default: 1,
      min: 1,
    },
    unitPrice: {
      type: Number,
      default: 0,
    },
    fullName: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    lastPrompt: {
      type: String,
    },
  },
  { _id: false }
);

const whatsappConversationSchema = new mongoose.Schema(
  {
    whatsappNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    customerName: {
      type: String,
      default: 'Valued Customer',
      trim: true,
    },
    aiEnabled: {
      type: Boolean,
      default: true,
      index: true,
    },
    humanHandover: {
      type: Boolean,
      default: false,
      index: true,
    },
    unreadCount: {
      type: Number,
      default: 0,
    },
    orderDraft: {
      type: orderDraftSchema,
      default: () => ({}),
    },
    messages: [messageSchema],
    processedMessageIds: {
      type: [String],
      default: [],
      index: true,
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    currentContext: {
      lastReferencedProductId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
      },
      lastReferencedColor: {
        type: String,
        default: '',
      },
      lastReferencedCategory: {
        type: String,
        default: '',
      },
    },
  },
  {
    timestamps: true,
  }
);

// Keep processedMessageIds array trimmed to last 200 items to conserve document size
whatsappConversationSchema.methods.recordProcessedMessageId = function (messageId) {
  if (!messageId) return;
  if (!this.processedMessageIds.includes(messageId)) {
    this.processedMessageIds.push(messageId);
    if (this.processedMessageIds.length > 200) {
      this.processedMessageIds = this.processedMessageIds.slice(-200);
    }
  }
};

module.exports = mongoose.model('WhatsappConversation', whatsappConversationSchema);

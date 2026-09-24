const { OpenAI } = require('openai');
const Product = require('../models/product');
const Order = require('../models/order');
const StoreSettings = require('../models/settings');
const InventoryTransaction = require('../models/inventory');
const productSearch = require('./productSearch');
const whatsappClient = require('./whatsappClient');

class WhatsAppAIService {
  constructor() {
    this.model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
  }

  getOpenAIClient() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return null;
    return new OpenAI({ apiKey });
  }

  /**
   * Check if customer message is explicitly requesting human handover
   */
  isHandoverRequested(text) {
    if (!text) return false;
    const lower = text.toLowerCase().trim();
    const handoverPatterns = [
      /\bhuman\b/,
      /\brepresentative\b/,
      /\bagent\b/,
      /\bmanager\b/,
      /\bowner\b/,
      /\bteam se baat\b/,
      /\bbando se baat\b/,
      /\bcall me\b/,
      /\bcall karein\b/,
      /\bcall karo\b/,
      /\boperator\b/,
      /\binsan se baat\b/,
      /\badmi se baat\b/,
      /\brep\b/,
      /\bhelpdesk\b/,
    ];
    return handoverPatterns.some((pattern) => pattern.test(lower));
  }

  /**
   * Check if customer message is requesting product images
   */
  isImageRequested(text) {
    if (!text) return false;
    const lower = text.toLowerCase();
    const imageKeywords = [
      'pic', 'pics', 'picture', 'pictures', 'photo', 'photos', 'tasweer', 'tasveer', 'image', 'images', 'dikhao', 'send pic'
    ];
    return imageKeywords.some((kw) => lower.includes(kw));
  }

  /**
   * Load store settings for shipping, payments, and contacts
   */
  async getStoreContext() {
    let settings = await StoreSettings.findOne().lean();
    if (!settings) {
      settings = {
        shippingCharges: 200,
        freeShippingThreshold: 5000,
        currency: 'PKR',
        whatsappNumber: '03121464275',
        bankName: 'Faysal Bank Limited (FBL)',
        accountTitle: 'UBAID ULLAH',
        accountNumber: 'Please contact team for active account details',
        iban: '',
        bankInstructions: 'Please share payment screenshot with Order ID on WhatsApp.',
      };
    }
    return settings;
  }

  /**
   * Build OpenAI system prompt with strict business rules and live catalog data
   */
  buildSystemPrompt(storeSettings, relevantProducts, orderDraft) {
    const productsContext = relevantProducts && relevantProducts.length > 0
      ? JSON.stringify(relevantProducts, null, 2)
      : 'No exact product matched yet. Ask customer what style, color, or fabric they are looking for.';

    return `You are the official AI Sales & Customer Support Specialist for "Ubaid Al Abayat", a luxury brand specializing in bespoke, high-quality Abayas, Hijabs, and Modest Wear in Pakistan.

BUSINESS RULES & TRUTH ANCHORS (NEVER VIOLATE):
- Store Name: Ubaid Al Abayat
- Official Website: https://ubaidalabayat.online
- Official WhatsApp: ${storeSettings.whatsappNumber || '03121464275'}
- Instagram: @ubaid_alabayat
- Currency: ${storeSettings.currency || 'PKR'}
- Standard Nationwide Shipping: PKR ${storeSettings.shippingCharges || 200}
- Free Shipping Threshold: Free delivery on all orders above PKR ${storeSettings.freeShippingThreshold || 5000} (calculated automatically on order total before shipping)
- Payment Method: ADVANCE PAYMENT ONLY (via Bank Transfer / Online). Cash on Delivery (COD) is STRICTLY NOT AVAILABLE.
- International Shipping: Available! Never invent a fixed international shipping rate. Explain politely: "International delivery is available. Our team confirms exact shipping rates according to your destination country and parcel weight."

BEHAVIOR & TONE:
- Language: Speak in warm, polite, and natural Roman Urdu (Pakistani conversational style: "Jee bilkul", "Aap", "Shukriya") or English if the customer speaks English.
- Conciseness: Be helpful, elegant, and concise. Avoid unnecessary essays. Use subtle emojis (🤎, ✨, 🛍️, 📦).
- Honesty & Zero Hallucination: NEVER invent stock, prices, colors, sizes, or products. Only speak about what exists in REAL PRODUCTS DATA provided below.
- Clarification: If customer asks for a general color like "brown abaya" and multiple shades exist (e.g. Dark Brown, Coffee Brown, Light Brown), ALWAYS list the available shades and ask them which one they prefer.
- Image Requests: When customer asks for pictures ("pic bhejo", "pics send karo"), invoke the send_product_images tool with the exact product and shade. NEVER send images belonging to another color or variant.
- Human Handover: If a customer requests human support, immediately invoke trigger_human_handover.

REAL PRODUCTS DATA FROM MONGODB:
${productsContext}

CURRENT CUSTOMER ORDER DRAFT:
${JSON.stringify(orderDraft || {}, null, 2)}

ORDER PLACEMENT GUIDELINES:
When a customer wants to buy or order:
1. Confirm Product & Variant/Color.
2. Confirm Size (e.g. Standard, Free Size, 50, 52, 54, 56, S, M, L).
3. Confirm Quantity (default 1).
4. Request Delivery Information: Full Name, Complete Street Address, City, Contact Phone.
5. Present Order Summary clearly:
   - Product Name, Color, Size, Quantity
   - Price: Rs. X
   - Shipping: Rs. 200 (or FREE if >= Rs. 5000)
   - Total: Rs. Y
   - Payment: Advance Bank Transfer
   Ask: "Kya aap is order ko confirm karna chahte hain?"
6. Once the customer explicitly says "Yes", "Confirm", "Kardo", etc., invoke the create_final_order tool.`;
  }

  /**
   * Main entry point to process an incoming customer message
   */
  async processIncomingMessage({ conversation, messageText, customerPhone, customerName }) {
    // 1. Check for immediate human handover request
    if (this.isHandoverRequested(messageText)) {
      conversation.humanHandover = true;
      conversation.aiEnabled = false;
      await conversation.save();

      const handoverReply = 'Jee zaroor! 👩‍💼 Maine aapki conversation hamare human support specialist ko transfer kar di hai. Hamari team jald hi aapko yahan reply karegi. Shukriya!';
      await whatsappClient.sendText(customerPhone, handoverReply);
      return { action: 'handover', reply: handoverReply };
    }

    // 2. Fetch Store Settings & Search Products
    const storeSettings = await this.getStoreContext();
    const relevantProducts = await productSearch.searchRelevantProducts(messageText, { limit: 5 });

    // 3. Fallback if OpenAI API Key is not configured
    const openai = this.getOpenAIClient();
    if (!openai) {
      console.warn('OPENAI_API_KEY not configured. Responding with grounded fallback message.');
      const fallbackReply = `Assalam-o-Alaikum ${customerName || ''}! 🌸 Ubaid Al Abayat mein khush-amdeed.\n\nHamare tamam luxury Abayas dekhne ke liye hamari website visit karein: https://ubaidalabayat.online\nStandard delivery: PKR 200 (Free delivery over PKR 5,000).\nPayment: Advance Bank Transfer.\n\nAapko kaunsa product ya color pasand hai? Hamari team bhi jald hi aap se rabta karegi.`;
      await whatsappClient.sendText(customerPhone, fallbackReply);
      return { action: 'fallback', reply: fallbackReply };
    }

    // 4. Build Conversation History (last 8 messages for context)
    const historyMessages = (conversation.messages || [])
      .slice(-8)
      .map((msg) => ({
        role: msg.sender === 'customer' ? 'user' : 'assistant',
        content: msg.text || '',
      }))
      .filter((m) => m.content.trim().length > 0);

    const systemPrompt = this.buildSystemPrompt(
      storeSettings,
      relevantProducts,
      conversation.orderDraft
    );

    // 5. Define Tools for OpenAI
    const tools = [
      {
        type: 'function',
        function: {
          name: 'send_product_images',
          description: 'Send actual Cloudinary photos of a specific product and color/shade to the customer via WhatsApp.',
          parameters: {
            type: 'object',
            properties: {
              productId: { type: 'string', description: 'MongoDB Product ID' },
              colorOrShade: { type: 'string', description: 'Specific color or shade requested, e.g. Coffee Brown, Black' },
              caption: { type: 'string', description: 'Brief caption for the photo' },
            },
            required: ['productId'],
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'update_order_draft',
          description: 'Update the customer in-progress order details (size, quantity, color, name, address, city).',
          parameters: {
            type: 'object',
            properties: {
              productId: { type: 'string' },
              productName: { type: 'string' },
              color: { type: 'string' },
              size: { type: 'string' },
              quantity: { type: 'number' },
              fullName: { type: 'string' },
              address: { type: 'string' },
              city: { type: 'string' },
              phone: { type: 'string' },
            },
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'create_final_order',
          description: 'Create and place the actual order in MongoDB once customer explicitly confirms the order summary.',
          parameters: {
            type: 'object',
            properties: {
              productId: { type: 'string', description: 'Product ID' },
              productName: { type: 'string' },
              color: { type: 'string' },
              size: { type: 'string' },
              quantity: { type: 'number' },
              fullName: { type: 'string' },
              address: { type: 'string' },
              city: { type: 'string' },
              phone: { type: 'string' },
              notes: { type: 'string' },
            },
            required: ['productId', 'size', 'fullName', 'address', 'city'],
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'trigger_human_handover',
          description: 'Pause AI and request a human team member to take over this WhatsApp chat.',
          parameters: {
            type: 'object',
            properties: {
              reason: { type: 'string', description: 'Why human assistance is required' },
            },
          },
        },
      },
    ];

    try {
      const messagesPayload = [
        { role: 'system', content: systemPrompt },
        ...historyMessages,
        { role: 'user', content: messageText },
      ];

      const completion = await openai.chat.completions.create({
        model: this.model,
        messages: messagesPayload,
        tools,
        tool_choice: 'auto',
        temperature: 0.3,
        max_tokens: 600,
      });

      const responseMessage = completion.choices[0].message;
      let finalReplyText = responseMessage.content || '';

      // Handle tool calls if any
      if (responseMessage.tool_calls && responseMessage.tool_calls.length > 0) {
        for (const toolCall of responseMessage.tool_calls) {
          const fnName = toolCall.function.name;
          const args = JSON.parse(toolCall.function.arguments || '{}');

          if (fnName === 'send_product_images') {
            await this.handleToolSendImages(customerPhone, args, relevantProducts);
          } else if (fnName === 'update_order_draft') {
            await this.handleToolUpdateDraft(conversation, args);
          } else if (fnName === 'create_final_order') {
            const orderResult = await this.handleToolCreateOrder(customerPhone, conversation, args, storeSettings);
            if (orderResult.success) {
              finalReplyText = orderResult.message;
            }
          } else if (fnName === 'trigger_human_handover') {
            conversation.humanHandover = true;
            conversation.aiEnabled = false;
            await conversation.save();
          }
        }
      }

      // If OpenAI did not provide a message content because it only ran tool calls, generate a follow-up
      if (!finalReplyText && responseMessage.tool_calls?.length > 0) {
        finalReplyText = 'Jee, maine details update kar di hain! Mazeed kuch maloomat chahiye to zaroor batayein.';
      }

      // Fallback if still empty
      if (!finalReplyText) {
        finalReplyText = 'Jee bilkul! Main aapki mazeed kya madad kar sakta hoon?';
      }

      // Send the AI text reply to customer WhatsApp
      await whatsappClient.sendText(customerPhone, finalReplyText);

      return {
        action: 'replied',
        reply: finalReplyText,
      };
    } catch (err) {
      console.error('OpenAI processing error:', err);
      // Graceful fallback to customer
      const fallbackReply = 'Sorry, mujhe is waqt product information access karne mein thora issue aa raha hai. Hamari customer support team jald hi aap se yahan WhatsApp par rabta karegi.';
      try {
        await whatsappClient.sendText(customerPhone, fallbackReply);
      } catch (sendErr) {
        console.error('WhatsApp send error during fallback:', sendErr.message);
      }
      return { action: 'error', error: err.message, reply: fallbackReply };
    }
  }

  /**
   * Tool: Send exact product variant images to customer
   */
  async handleToolSendImages(customerPhone, args, relevantProducts) {
    let productDoc = null;
    if (args.productId) {
      productDoc = await Product.findById(args.productId).lean();
    }
    if (!productDoc && relevantProducts && relevantProducts.length > 0) {
      productDoc = relevantProducts[0];
    }

    if (!productDoc) return;

    const images = productSearch.findImagesForColorOrVariant(productDoc, args.colorOrShade);
    if (!images || images.length === 0) return;

    // Send up to 3 images to avoid flooding
    const toSend = images.slice(0, 3);
    for (let i = 0; i < toSend.length; i++) {
      const caption = i === 0 ? (args.caption || `${productDoc.name} - ${args.colorOrShade || ''}`.trim()) : '';
      await whatsappClient.sendImage(customerPhone, toSend[i], caption);
    }
  }

  /**
   * Tool: Update order draft in conversation
   */
  async handleToolUpdateDraft(conversation, args) {
    if (!conversation.orderDraft) {
      conversation.orderDraft = {};
    }
    Object.keys(args).forEach((key) => {
      if (args[key] !== undefined && args[key] !== null) {
        conversation.orderDraft[key] = args[key];
      }
    });
    await conversation.save();
  }

  /**
   * Tool: Create the real Order in MongoDB with source: 'whatsapp'
   */
  async handleToolCreateOrder(customerPhone, conversation, args, storeSettings) {
    try {
      const productId = args.productId || conversation.orderDraft?.productId;
      const product = await Product.findById(productId);
      if (!product) {
        return { success: false, message: 'Product record not found.' };
      }

      const quantity = args.quantity || conversation.orderDraft?.quantity || 1;
      const size = args.size || conversation.orderDraft?.size || 'Standard';
      const color = args.color || conversation.orderDraft?.color || (product.colors?.[0] || 'Standard');
      const unitPrice = product.salePrice && product.salePrice > 0 ? product.salePrice : product.price;
      const subtotal = unitPrice * quantity;

      const freeShippingThreshold = storeSettings.freeShippingThreshold || 5000;
      const shippingCharges = subtotal >= freeShippingThreshold ? 0 : (storeSettings.shippingCharges || 200);
      const total = subtotal + shippingCharges;

      // Unique order number
      const orderCount = await Order.countDocuments();
      const orderNumber = `UA-WA-${10000 + orderCount + 1}`;

      // Deduct inventory
      await Product.findByIdAndUpdate(product._id, {
        $inc: { stock: -quantity },
      });

      await InventoryTransaction.create({
        product: product._id,
        type: 'OUT',
        quantity,
        reason: `WhatsApp Order placed: ${orderNumber}`,
      });

      // Create Order
      const newOrder = await Order.create({
        orderNumber,
        source: 'whatsapp',
        items: [
          {
            product: product._id,
            name: product.name,
            quantity,
            price: unitPrice,
            size,
            color,
          },
        ],
        subtotal,
        shippingCharges,
        discountAmount: 0,
        total,
        paymentMethod: 'Bank Transfer',
        paymentStatus: 'Pending',
        orderStatus: 'Pending',
        shippingAddress: {
          fullName: args.fullName || conversation.customerName || 'WhatsApp Customer',
          phone: args.phone || customerPhone,
          whatsappNumber: customerPhone,
          address: args.address || 'Address provided via WhatsApp',
          city: args.city || 'Pakistan',
          postalCode: '00000',
        },
        notes: `Placed via WhatsApp AI Chatbot. Delivery City: ${args.city || ''}`,
      });

      // Clear draft
      conversation.orderDraft = { step: 'idle' };
      await conversation.save();

      const bankInfo = storeSettings.accountNumber
        ? `\n\n🏦 *Bank Transfer Details:*\nBank: ${storeSettings.bankName}\nTitle: ${storeSettings.accountTitle}\nAccount #: ${storeSettings.accountNumber}\nIBAN: ${storeSettings.iban || 'N/A'}\n\n*Instructions:* ${storeSettings.bankInstructions || 'Please share payment screenshot with your Order ID for instant dispatch.'}`
        : '';

      const confirmationMsg = `🎉 *MUBARAK HO! Aapka Order Successfully Place Ho Gaya Hai!*\n\n📋 *Order Number:* ${orderNumber}\n🛍️ *Item:* ${product.name} (${color}, Size: ${size})\n🔢 *Quantity:* ${quantity}\n💰 *Subtotal:* Rs. ${subtotal.toLocaleString()}\n🚚 *Delivery:* Rs. ${shippingCharges === 0 ? 'FREE' : shippingCharges}\n💵 *Total Amount:* Rs. ${total.toLocaleString()}${bankInfo}\n\nShukriya for shopping with Ubaid Al Abayat! ✨`;

      return {
        success: true,
        order: newOrder,
        message: confirmationMsg,
      };
    } catch (err) {
      console.error('Order creation error in WhatsApp AI:', err);
      return { success: false, message: 'Order could not be created: ' + err.message };
    }
  }
}

module.exports = new WhatsAppAIService();

const WhatsappConversation = require('../models/whatsappConversation');
const whatsappClient = require('../services/whatsappClient');
const whatsappAI = require('../services/whatsappAI');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');

/**
 * @desc    Meta Webhook Verification
 * @route   GET /api/whatsapp/webhook
 * @access  Public
 */
exports.verifyWebhook = (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  const expectedToken = process.env.WHATSAPP_VERIFY_TOKEN || 'ubaid_whatsapp_secret_2026';

  if (mode && token) {
    if (mode === 'subscribe' && token === expectedToken) {
      console.log('WhatsApp Webhook Verified Successfully by Meta.');
      return res.status(200).send(challenge);
    } else {
      console.warn('WhatsApp Webhook Verification Failed: Invalid Token.');
      return res.status(403).json({ error: 'Verification token mismatch' });
    }
  }

  return res.status(400).json({ error: 'Missing required webhook parameters' });
};

/**
 * @desc    Receive Incoming WhatsApp Messages from Meta
 * @route   POST /api/whatsapp/webhook
 * @access  Public
 */
exports.handleWebhook = async (req, res) => {
  // 1. Instantly acknowledge Meta with HTTP 200 within 20 seconds to prevent retries
  res.status(200).send('EVENT_RECEIVED');

  try {
    const body = req.body;

    if (!body || body.object !== 'whatsapp_business_account') {
      return;
    }

    const entry = body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;

    // Handle delivery/read status updates if any
    if (value?.statuses && value.statuses.length > 0) {
      return;
    }

    const messages = value?.messages;
    if (!messages || messages.length === 0) {
      return;
    }

    const incomingMsg = messages[0];
    const messageId = incomingMsg.id; // wamid
    const customerPhone = incomingMsg.from; // e.g. "923121464275"
    const contactProfile = value?.contacts?.[0]?.profile;
    const customerName = contactProfile?.name || 'Valued Customer';

    // Extract text content from various WhatsApp message types
    let messageText = '';
    if (incomingMsg.type === 'text') {
      messageText = incomingMsg.text?.body || '';
    } else if (incomingMsg.type === 'interactive') {
      messageText =
        incomingMsg.interactive?.button_reply?.title ||
        incomingMsg.interactive?.list_reply?.title ||
        '';
    } else if (incomingMsg.type === 'button') {
      messageText = incomingMsg.button?.text || '';
    } else {
      messageText = `[Customer sent a ${incomingMsg.type} message]`;
    }

    if (!messageText.trim()) return;

    // Clean phone number
    const cleanPhone = String(customerPhone).replace(/\D/g, '');

    // 2. Find or create conversation
    let conversation = await WhatsappConversation.findOne({ whatsappNumber: cleanPhone });
    if (!conversation) {
      conversation = new WhatsappConversation({
        whatsappNumber: cleanPhone,
        customerName,
        aiEnabled: true,
        humanHandover: false,
        messages: [],
      });
    } else if (customerName && conversation.customerName === 'Valued Customer') {
      conversation.customerName = customerName;
    }

    // 3. Deduplication check: Protect against duplicate webhooks from Meta
    if (messageId && conversation.processedMessageIds.includes(messageId)) {
      console.log(`Duplicate WhatsApp message ignored: ${messageId}`);
      return;
    }

    if (messageId) {
      conversation.recordProcessedMessageId(messageId);
    }

    // 4. Record incoming customer message
    conversation.messages.push({
      id: messageId,
      direction: 'incoming',
      sender: 'customer',
      type: incomingMsg.type || 'text',
      text: messageText,
      timestamp: new Date(),
      status: 'read',
    });

    conversation.lastMessageAt = new Date();

    // Mark message as read on Meta
    if (messageId) {
      whatsappClient.markAsRead(messageId).catch(() => {});
    }

    // 5. If human handover is active or AI is disabled, do not reply automatically
    if (conversation.humanHandover || !conversation.aiEnabled) {
      conversation.unreadCount += 1;
      await conversation.save();
      console.log(`Chat with ${cleanPhone} is under Human Handover. AI skipped.`);
      return;
    }

    // 6. Process message with WhatsApp AI Engine
    const aiResult = await whatsappAI.processIncomingMessage({
      conversation,
      messageText,
      customerPhone: cleanPhone,
      customerName: conversation.customerName,
    });

    // 7. Save bot response to conversation history
    if (aiResult?.reply) {
      conversation.messages.push({
        direction: 'outgoing',
        sender: 'bot',
        type: 'text',
        text: aiResult.reply,
        timestamp: new Date(),
        status: 'sent',
      });
    }

    await conversation.save();
  } catch (error) {
    console.error('Error handling WhatsApp webhook payload:', error);
  }
};

/**
 * @desc    Get all WhatsApp conversations for Admin Dashboard
 * @route   GET /api/whatsapp/conversations
 * @access  Private/Admin
 */
exports.getConversations = asyncHandler(async (req, res, next) => {
  const { filter, search } = req.query;

  const query = {};
  if (filter === 'attention') {
    query.humanHandover = true;
  } else if (filter === 'ai_active') {
    query.aiEnabled = true;
    query.humanHandover = false;
  }

  if (search) {
    const searchRegex = new RegExp(search, 'i');
    query.$or = [
      { whatsappNumber: searchRegex },
      { customerName: searchRegex },
      { 'orderDraft.productName': searchRegex },
    ];
  }

  const conversations = await WhatsappConversation.find(query)
    .sort({ lastMessageAt: -1 })
    .limit(100)
    .lean();

  res.status(200).json({
    success: true,
    count: conversations.length,
    data: conversations,
  });
});

/**
 * @desc    Get single WhatsApp conversation with full chat history
 * @route   GET /api/whatsapp/conversations/:id
 * @access  Private/Admin
 */
exports.getConversationById = asyncHandler(async (req, res, next) => {
  const conversation = await WhatsappConversation.findById(req.params.id);

  if (!conversation) {
    return next(new ErrorResponse('Conversation not found', 404));
  }

  // Reset unread count when admin opens conversation
  if (conversation.unreadCount > 0) {
    conversation.unreadCount = 0;
    await conversation.save();
  }

  res.status(200).json({
    success: true,
    data: conversation,
  });
});

/**
 * @desc    Send manual agent reply from Admin Dashboard
 * @route   POST /api/whatsapp/conversations/:id/reply
 * @access  Private/Admin
 */
exports.sendManualReply = asyncHandler(async (req, res, next) => {
  const { text } = req.body;

  if (!text || !text.trim()) {
    return next(new ErrorResponse('Reply message text is required', 400));
  }

  const conversation = await WhatsappConversation.findById(req.params.id);
  if (!conversation) {
    return next(new ErrorResponse('Conversation not found', 404));
  }

  // Send message via Meta WhatsApp API
  await whatsappClient.sendText(conversation.whatsappNumber, text.trim());

  // Record outgoing message
  conversation.messages.push({
    direction: 'outgoing',
    sender: 'agent',
    type: 'text',
    text: text.trim(),
    timestamp: new Date(),
    status: 'sent',
  });

  conversation.lastMessageAt = new Date();
  await conversation.save();

  res.status(200).json({
    success: true,
    message: 'Message sent successfully via WhatsApp',
    data: conversation,
  });
});

/**
 * @desc    Toggle AI vs Human Handover for conversation
 * @route   PATCH /api/whatsapp/conversations/:id/toggle-ai
 * @access  Private/Admin
 */
exports.toggleAI = asyncHandler(async (req, res, next) => {
  const { enableAI, humanHandover } = req.body;

  const conversation = await WhatsappConversation.findById(req.params.id);
  if (!conversation) {
    return next(new ErrorResponse('Conversation not found', 404));
  }

  if (enableAI !== undefined) {
    conversation.aiEnabled = Boolean(enableAI);
  }
  if (humanHandover !== undefined) {
    conversation.humanHandover = Boolean(humanHandover);
  }

  await conversation.save();

  res.status(200).json({
    success: true,
    message: conversation.aiEnabled ? 'AI Automation Activated' : 'Human Support Took Over',
    data: conversation,
  });
});

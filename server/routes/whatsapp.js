const express = require('express');
const {
  verifyWebhook,
  handleWebhook,
  getConversations,
  getConversationById,
  sendManualReply,
  toggleAI,
} = require('../controllers/whatsappController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Meta WhatsApp Webhook endpoints (Public)
router.get('/webhook', verifyWebhook);
router.post('/webhook', handleWebhook);

// Admin / Staff WhatsApp Management endpoints (Protected)
router.get('/conversations', protect, authorize('admin', 'staff'), getConversations);
router.get('/conversations/:id', protect, authorize('admin', 'staff'), getConversationById);
router.post('/conversations/:id/reply', protect, authorize('admin', 'staff'), sendManualReply);
router.patch('/conversations/:id/toggle-ai', protect, authorize('admin', 'staff'), toggleAI);

module.exports = router;

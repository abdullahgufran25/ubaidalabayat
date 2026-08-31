const express = require('express');
const {
  submitContactForm,
  getContactMessages,
  updateMessageStatus,
  deleteMessage,
} = require('../controllers/contactController');

const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

// Public route to submit contact inquiry
router.post('/', submitContactForm);

// Protected admin/staff routes to view and process inquiries
router.get('/', protect, authorize('admin', 'staff'), getContactMessages);
router.put('/:id', protect, authorize('admin', 'staff'), updateMessageStatus);
router.delete('/:id', protect, authorize('admin', 'staff'), deleteMessage);

module.exports = router;

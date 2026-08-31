const ContactMessage = require('../models/contact');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Submit a contact inquiry
// @route   POST /api/contact
// @access  Public
exports.submitContactForm = asyncHandler(async (req, res, next) => {
  const { name, email, phone, message } = req.body;

  if (!name || !email || !message) {
    return next(new ErrorResponse('Please provide name, email, and a message', 400));
  }

  const contact = await ContactMessage.create({
    name,
    email,
    phone,
    message,
  });

  res.status(201).json({
    success: true,
    message: 'Your message has been submitted. We will contact you soon!',
    data: contact,
  });
});

// @desc    Get all contact messages
// @route   GET /api/contact
// @access  Private/Admin|Staff
exports.getContactMessages = asyncHandler(async (req, res, next) => {
  const messages = await ContactMessage.find().sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: messages,
  });
});

// @desc    Update contact message status
// @route   PUT /api/contact/:id
// @access  Private/Admin|Staff
exports.updateMessageStatus = asyncHandler(async (req, res, next) => {
  const { status } = req.body;

  let message = await ContactMessage.findById(req.params.id);
  if (!message) {
    return next(new ErrorResponse(`Message not found with id of ${req.params.id}`, 404));
  }

  message = await ContactMessage.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    message: 'Inquiry status updated successfully',
    data: message,
  });
});

// @desc    Delete contact message
// @route   DELETE /api/contact/:id
// @access  Private/Admin|Staff
exports.deleteMessage = asyncHandler(async (req, res, next) => {
  const message = await ContactMessage.findById(req.params.id);

  if (!message) {
    return next(new ErrorResponse(`Message not found with id of ${req.params.id}`, 404));
  }

  await ContactMessage.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Message deleted successfully',
  });
});

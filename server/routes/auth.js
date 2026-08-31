const express = require('express');
const {
  register,
  login,
  getMe,
  updateProfile,
  updatePassword,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
} = require('../controllers/authController');

const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes (Logged-in users)
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/update-password', protect, updatePassword);

// Admin-only routes
router.get('/users', protect, authorize('admin', 'staff'), getUsers);
router.route('/users/:id')
  .get(protect, authorize('admin', 'staff'), getUser)
  .put(protect, authorize('admin'), updateUser)
  .delete(protect, authorize('admin'), deleteUser);

module.exports = router;

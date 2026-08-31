const jwt = require('jsonwebtoken');
const User = require('../models/user');
const asyncHandler = require('./async');
const ErrorResponse = require('../utils/errorResponse');

// Protect routes - Verify JWT token
exports.protect = asyncHandler(async (req, res, next) => {
  let token;

  // Check headers for token
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Make sure token exists
  if (!token) {
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'ubaid_al_abayat_jwt_secret_token_123456789_abcdef');

    // Attach user to request object
    req.user = await User.findById(decoded.id);

    if (!req.user) {
      return next(new ErrorResponse('User associated with this token no longer exists', 401));
    }

    next();
  } catch (err) {
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }
});

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ErrorResponse('Not authorized to access this route', 401));
    }
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorResponse(
          `User role '${req.user.role}' is not authorized to access this route`,
          403
        )
      );
    }
    next();
  };
};

// Optional auth checker (does not block if no token provided, just attaches req.user if valid)
exports.checkAuthOptional = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'ubaid_al_abayat_jwt_secret_token_123456789_abcdef');
    req.user = await User.findById(decoded.id);
    next();
  } catch (err) {
    // If invalid token, proceed anyway but without attaching req.user
    next();
  }
};

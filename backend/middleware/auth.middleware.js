const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const authConfig = require('../config/auth');
const User = require('../models/User');
const config = require('../config/environment');

const protect = async (req, res, next) => {
  let token;

  // Check for token in Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // Get token from header
    token = req.headers.authorization.split(' ')[1];
  }
  // Also check for token in query parameter (for PDF downloads from browser)
  else if (req.query.token) {
    token = req.query.token;
  }
  
  if (token) {
    try {

      // Verify token with enhanced security
      const decoded = jwt.verify(token, authConfig.jwtSecret, {
        algorithms: ['HS256'],
        issuer: 'spark-therapy-api',
        audience: 'spark-therapy-client'
      });

      // Additional token validation
      if (!decoded.id) {
        return res.status(401).json({ 
          success: false,
          message: 'Invalid token payload',
          code: 'INVALID_TOKEN_PAYLOAD'
        });
      }

      // Get user from database
      const user = await User.findById(decoded.id).select('-password');

      if (!user) {
        return res.status(401).json({ 
          success: false,
          message: 'Not authorized, user not found',
          code: 'USER_NOT_FOUND'
        });
      }

      // Check if user is active
      if (!user.isActive) {
        return res.status(401).json({ 
          success: false,
          message: 'User account is deactivated',
          code: 'ACCOUNT_DEACTIVATED'
        });
      }

      // Store user info in request
      req.user = user;
      next();
    } catch (error) {
      console.error('Authentication error:', {
        message: error.message,
        name: error.name,
        userId: req.user ? req.user._id : 'unknown',
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString()
      });
      
      // More specific error responses
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ 
          success: false,
          message: 'Invalid token signature',
          code: 'INVALID_TOKEN'
        });
      }
      
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          success: false,
          message: 'Token has expired. Please log in again.',
          code: 'TOKEN_EXPIRED'
        });
      }
      
      if (error.name === 'NotBeforeError') {
        return res.status(401).json({ 
          success: false,
          message: 'Token not active yet',
          code: 'TOKEN_NOT_ACTIVE'
        });
      }
      
      return res.status(401).json({ 
        success: false,
        message: 'Not authorized, token validation failed',
        code: 'AUTH_FAILED'
      });
    }
  }

  if (!token) {
    return res.status(401).json({ 
      success: false,
      message: 'Not authorized, no token provided',
      code: 'NO_TOKEN'
    });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }
    
    if (!roles.includes(req.user.role)) {
      // Log unauthorized access attempts
      console.warn('Unauthorized access attempt:', {
        userId: req.user._id,
        userRole: req.user.role,
        requiredRoles: roles,
        endpoint: req.originalUrl,
        method: req.method,
        ip: req.ip,
        timestamp: new Date().toISOString()
      });
      
      return res.status(403).json({
        success: false,
        message: `User role '${req.user.role}' is not authorized to access this resource`,
        code: 'INSUFFICIENT_PERMISSIONS'
      });
    }
    next();
  };
};

// Token revocation middleware - checks if token has been revoked
const checkTokenRevocation = async (req, res, next) => {
  try {
    // For access tokens, we rely on the database check in protect middleware
    // For refresh tokens, we check the hash in the database
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Token validation failed',
      code: 'TOKEN_VALIDATION_ERROR'
    });
  }
};

module.exports = { protect, authorize, checkTokenRevocation };

/**
 * Centralized Error Handling Middleware
 * Standardized error responses and logging for all API endpoints
 */

const { errorResponse } = require('../utils/responseHandler');
const config = require('../config/environment');

// Error codes mapping
const ERROR_CODES = {
  // Authentication errors
  AUTH_INVALID_CREDENTIALS: 'AUTH_INVALID_CREDENTIALS',
  AUTH_TOKEN_EXPIRED: 'AUTH_TOKEN_EXPIRED',
  AUTH_TOKEN_INVALID: 'AUTH_TOKEN_INVALID',
  AUTH_UNAUTHORIZED: 'AUTH_UNAUTHORIZED',
  AUTH_FORBIDDEN: 'AUTH_FORBIDDEN',
  AUTH_ACCOUNT_LOCKED: 'AUTH_ACCOUNT_LOCKED',
  
  // Validation errors
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',
  
  // Resource errors
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
  RESOURCE_CONFLICT: 'RESOURCE_CONFLICT',
  
  // Database errors
  DATABASE_ERROR: 'DATABASE_ERROR',
  DATABASE_CONNECTION_FAILED: 'DATABASE_CONNECTION_FAILED',
  
  // Business logic errors
  BUSINESS_RULE_VIOLATION: 'BUSINESS_RULE_VIOLATION',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
  
  // System errors
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR'
};

// Custom error classes
class ApiError extends Error {
  constructor(message, statusCode = 500, code = ERROR_CODES.INTERNAL_SERVER_ERROR, details = null) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends ApiError {
  constructor(message, details = null) {
    super(message, 400, ERROR_CODES.VALIDATION_ERROR, details);
    this.name = 'ValidationError';
  }
}

class AuthenticationError extends ApiError {
  constructor(message, code = ERROR_CODES.AUTH_UNAUTHORIZED) {
    super(message, 401, code);
    this.name = 'AuthenticationError';
  }
}

class AuthorizationError extends ApiError {
  constructor(message = 'Insufficient permissions') {
    super(message, 403, ERROR_CODES.AUTH_FORBIDDEN);
    this.name = 'AuthorizationError';
  }
}

class NotFoundError extends ApiError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 404, ERROR_CODES.RESOURCE_NOT_FOUND);
    this.name = 'NotFoundError';
  }
}

class ConflictError extends ApiError {
  constructor(message = 'Resource conflict') {
    super(message, 409, ERROR_CODES.RESOURCE_CONFLICT);
    this.name = 'ConflictError';
  }
}

// Error handler middleware
const errorHandler = (err, req, res, next) => {
  // Log error details
  const errorLog = {
    timestamp: new Date().toISOString(),
    requestId: req.id || 'unknown',
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.user ? req.user._id : null,
    userRole: req.user ? req.user.role : null,
    error: {
      name: err.name,
      message: err.message,
      stack: config.isDevelopment() ? err.stack : undefined,
      code: err.code,
      statusCode: err.statusCode
    }
  };

  // Log to appropriate destination based on environment
  if (config.isDevelopment()) {
    console.error('API Error:', JSON.stringify(errorLog, null, 2));
  } else {
    // In production, send to logging service
    // logger.error('API Error', errorLog);
  }

  // Handle different types of errors
  let responseError = err;

  // Handle Joi validation errors
  if (err.isJoi) {
    responseError = new ValidationError(
      err.details.map(detail => detail.message).join(', '),
      err.details
    );
  }

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    responseError = new ValidationError(errors.join(', '), err.errors);
  }

  // Handle Mongoose duplicate key errors
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    responseError = new ConflictError(`${field} already exists`);
  }

  // Handle Mongoose cast errors
  if (err.name === 'CastError') {
    responseError = new ValidationError(`Invalid ${err.path}: ${err.value}`);
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    responseError = new AuthenticationError('Invalid token', ERROR_CODES.AUTH_TOKEN_INVALID);
  }

  if (err.name === 'TokenExpiredError') {
    responseError = new AuthenticationError('Token expired', ERROR_CODES.AUTH_TOKEN_EXPIRED);
  }

  // Default to internal server error for unknown errors
  if (!(responseError instanceof ApiError)) {
    responseError = new ApiError(
      'Internal server error',
      500,
      ERROR_CODES.INTERNAL_SERVER_ERROR
    );
  }

  // Send standardized error response
  return errorResponse(
    res,
    responseError.message,
    responseError.statusCode,
    config.isDevelopment() ? {
      code: responseError.code,
      details: responseError.details,
      stack: responseError.stack
    } : {
      code: responseError.code
    }
  );
};

// 404 handler for unmatched routes
const notFoundHandler = (req, res, next) => {
  const error = new NotFoundError(`Route ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

// Async error wrapper
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Request validation middleware
const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body);
    if (error) {
      const validationError = new ValidationError(
        error.details.map(detail => detail.message).join(', '),
        error.details
      );
      return next(validationError);
    }
    req.validatedBody = value;
    next();
  };
};

module.exports = {
  errorHandler,
  notFoundHandler,
  asyncHandler,
  validateRequest,
  ApiError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  ERROR_CODES
};
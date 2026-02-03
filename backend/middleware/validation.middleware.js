/**
 * Comprehensive Input Validation and Sanitization Middleware
 * Provides centralized validation, sanitization, and security for all API endpoints
 */

const Joi = require('joi');
const { errorResponse } = require('../utils/responseHandler');

// Security-focused sanitization rules
const SANITIZATION_RULES = {
  // Remove dangerous characters and patterns
  stripDangerousChars: (value) => {
    if (typeof value !== 'string') return value;
    
    return value
      // Remove null bytes
      .replace(/\0/g, '')
      // Remove control characters except common whitespace
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
      // Remove potential XSS vectors
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/vbscript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      // Normalize whitespace
      .trim();
  },
  
  // Sanitize HTML content (basic)
  sanitizeHTML: (value) => {
    if (typeof value !== 'string') return value;
    
    return value
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;');
  },
  
  // Validate and normalize email
  normalizeEmail: (value) => {
    if (typeof value !== 'string') return value;
    
    return value
      .toLowerCase()
      .trim();
  },
  
  // Validate ObjectId format
  validateObjectId: (value) => {
    if (typeof value !== 'string') return value;
    
    const objectIdRegex = /^[0-9a-fA-F]{24}$/;
    if (!objectIdRegex.test(value)) {
      throw new Error('Invalid ObjectId format');
    }
    return value;
  }
};

// Rate limiting and flood protection
const REQUEST_LIMITS = {
  maxRequestsPerMinute: 60,
  maxRequestsPerHour: 1000,
  maxPayloadSize: '10mb'
};

// Validation middleware factory
const createValidator = (schema, options = {}) => {
  const {
    stripUnknown = true,
    abortEarly = false,
    sanitize = true,
    rateLimit = true
  } = options;
  
  return async (req, res, next) => {
    try {
      // Apply rate limiting if enabled
      if (rateLimit) {
        // In a real implementation, this would integrate with redis or similar
        // For now, we'll add basic request tracking
        const requestTime = Date.now();
        const requestWindow = 60000; // 1 minute
        
        if (!req.session) {
          req.session = {};
        }
        
        if (!req.session.requestHistory) {
          req.session.requestHistory = [];
        }
        
        // Clean old requests
        req.session.requestHistory = req.session.requestHistory.filter(
          timestamp => requestTime - timestamp < requestWindow
        );
        
        // Check rate limit
        if (req.session.requestHistory.length >= REQUEST_LIMITS.maxRequestsPerMinute) {
          return errorResponse(res, 'Rate limit exceeded. Please try again later.', 429);
        }
        
        // Record this request
        req.session.requestHistory.push(requestTime);
      }
      
      // Validate request body
      if (req.body && Object.keys(req.body).length > 0) {
        const { error, value } = schema.validate(req.body, {
          stripUnknown,
          abortEarly
        });
        
        if (error) {
          const errorMessage = error.details.map(detail => detail.message).join(', ');
          return errorResponse(res, `Validation error: ${errorMessage}`, 400);
        }
        
        // Apply sanitization if enabled
        if (sanitize) {
          req.body = sanitizeInput(value);
        } else {
          req.body = value;
        }
      }
      
      // Validate query parameters
      if (req.query && Object.keys(req.query).length > 0) {
        // Basic query validation - prevent injection attacks
        for (const [key, value] of Object.entries(req.query)) {
          if (typeof value === 'string') {
            // Prevent NoSQL injection
            if (value.includes('$') || value.includes('{') || value.includes('}')) {
              return errorResponse(res, `Invalid query parameter: ${key}`, 400);
            }
            
            // Sanitize query values
            req.query[key] = SANITIZATION_RULES.stripDangerousChars(value);
          }
        }
      }
      
      // Validate route parameters
      if (req.params && Object.keys(req.params).length > 0) {
        for (const [key, value] of Object.entries(req.params)) {
          if (key === 'id' || key.endsWith('Id')) {
            try {
              SANITIZATION_RULES.validateObjectId(value);
            } catch (error) {
              return errorResponse(res, `Invalid ${key}: ${error.message}`, 400);
            }
          }
          
          // Sanitize other parameters
          if (typeof value === 'string') {
            req.params[key] = SANITIZATION_RULES.stripDangerousChars(value);
          }
        }
      }
      
      next();
    } catch (error) {
      console.error('Validation middleware error:', error);
      return errorResponse(res, 'Validation failed', 500);
    }
  };
};

// Input sanitization function
const sanitizeInput = (input) => {
  if (input === null || input === undefined) return input;
  
  // Handle Date objects specifically - don't sanitize them
  if (input instanceof Date) {
    return input;
  }
  
  if (typeof input === 'string') {
    return SANITIZATION_RULES.stripDangerousChars(input);
  }
  
  if (Array.isArray(input)) {
    return input.map(item => sanitizeInput(item));
  }
  
  if (typeof input === 'object') {
    const sanitized = {};
    for (const [key, value] of Object.entries(input)) {
      // Skip internal/metadata fields
      if (key.startsWith('_') || key === 'createdAt' || key === 'updatedAt') {
        continue;
      }
      sanitized[key] = sanitizeInput(value);
    }
    return sanitized;
  }
  
  return input;
};

// Specific validation utilities
const validators = {
  // Email validation with normalization
  email: (value) => {
    const schema = Joi.string().email().lowercase().trim();
    const { error, value: normalized } = schema.validate(value);
    if (error) throw new Error('Invalid email format');
    return normalized;
  },
  
  // Password strength validation
  password: (value) => {
    const schema = Joi.string()
      .min(8)
      .max(128)
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .messages({
        'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
      });
    
    const { error } = schema.validate(value);
    if (error) throw new Error(error.details[0].message);
    return value;
  },
  
  // Phone number validation
  phone: (value) => {
    if (!value) return value;
    
    const schema = Joi.string()
      .pattern(/^[\+]?[1-9][\d]{0,15}$/)
      .messages({
        'string.pattern.base': 'Invalid phone number format'
      });
    
    const { error } = schema.validate(value.replace(/[\s\-\(\)]/g, ''));
    if (error) throw new Error('Invalid phone number');
    return value;
  },
  
  // Date validation
  date: (value) => {
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      throw new Error('Invalid date format');
    }
    return date.toISOString();
  }
};

// Security headers middleware
const securityHeaders = (req, res, next) => {
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Enable XSS protection
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Content Security Policy
  res.setHeader('Content-Security-Policy', 
    "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'");
  
  // Referrer Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  next();
};

// Request size limiting
const requestSizeLimiter = (req, res, next) => {
  const contentLength = req.headers['content-length'];
  if (contentLength && parseInt(contentLength) > 10 * 1024 * 1024) { // 10MB limit
    return errorResponse(res, 'Request entity too large', 413);
  }
  next();
};

module.exports = {
  createValidator,
  sanitizeInput,
  validators,
  securityHeaders,
  requestSizeLimiter,
  SANITIZATION_RULES,
  REQUEST_LIMITS
};
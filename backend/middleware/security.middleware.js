/**
 * Security Middleware
 * Additional security layers for the application
 */

const rateLimit = require('express-rate-limit');
const config = require('../config/environment');

// Brute force protection for login attempts
const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 login requests per windowMs
  message: {
    success: false,
    message: 'Too many login attempts, please try again later.',
    code: 'LOGIN_RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// General API rate limiting
const apiRateLimiter = rateLimit({
  windowMs: config.get('RATE_LIMIT_WINDOW_MS'),
  max: config.get('RATE_LIMIT_MAX_REQUESTS'),
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict rate limiting for sensitive operations
const strictRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Very strict limit
  message: {
    success: false,
    message: 'Rate limit exceeded for sensitive operation.',
    code: 'STRICT_RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// IP blocking middleware
const blockedIPs = new Set();

const blockIP = (ip) => {
  blockedIPs.add(ip);
  setTimeout(() => {
    blockedIPs.delete(ip);
  }, 24 * 60 * 60 * 1000); // Block for 24 hours
};

const ipBlocker = (req, res, next) => {
  const clientIP = req.ip || req.connection.remoteAddress;
  
  if (blockedIPs.has(clientIP)) {
    return res.status(429).json({
      success: false,
      message: 'Your IP has been temporarily blocked due to suspicious activity.',
      code: 'IP_BLOCKED'
    });
  }
  
  next();
};

// Suspicious activity detection
const suspiciousActivityDetector = (req, res, next) => {
  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /eval\s*\(/i,
    /document\.cookie/i,
    /xhr/i,
    /fetch\s*\(/i
  ];
  
  const requestData = JSON.stringify({
    url: req.url,
    method: req.method,
    headers: req.headers,
    body: req.body,
    query: req.query
  });
  
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(requestData)) {
      const clientIP = req.ip || req.connection.remoteAddress;
      console.warn('Suspicious activity detected:', {
        ip: clientIP,
        pattern: pattern.toString(),
        url: req.url,
        method: req.method,
        timestamp: new Date().toISOString()
      });
      
      blockIP(clientIP);
      
      return res.status(403).json({
        success: false,
        message: 'Suspicious activity detected. Access denied.',
        code: 'SUSPICIOUS_ACTIVITY'
      });
    }
  }
  
  next();
};

// Content Security Policy headers
const cspMiddleware = (req, res, next) => {
  if (config.get('HELMET_ENABLED')) {
    next();
    return;
  }
  
  res.setHeader('Content-Security-Policy', 
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline'; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: https:; " +
    "font-src 'self'; " +
    "connect-src 'self' http://localhost:* https://*; " +
    "media-src 'self'"
  );
  
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  next();
};

// Request sanitization
const sanitizeRequest = (req, res, next) => {
  // Sanitize query parameters
  if (req.query) {
    Object.keys(req.query).forEach(key => {
      if (typeof req.query[key] === 'string') {
        req.query[key] = req.query[key].trim();
      }
    });
  }
  
  // Sanitize body parameters
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = req.body[key].trim();
      }
    });
  }
  
  next();
};

// API key validation (for external integrations)
const validateAPIKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey) {
    return res.status(401).json({
      success: false,
      message: 'API key required',
      code: 'API_KEY_REQUIRED'
    });
  }
  
  // In production, validate against a database or secure store
  if (apiKey !== process.env.API_KEY) {
    return res.status(403).json({
      success: false,
      message: 'Invalid API key',
      code: 'INVALID_API_KEY'
    });
  }
  
  next();
};

module.exports = {
  loginRateLimiter,
  apiRateLimiter,
  strictRateLimiter,
  ipBlocker,
  suspiciousActivityDetector,
  cspMiddleware,
  sanitizeRequest,
  validateAPIKey,
  blockIP
};
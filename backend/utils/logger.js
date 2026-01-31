/**
 * Structured Logging System
 * Production-ready logging with multiple transports and levels
 */

const winston = require('winston');
const config = require('../config/environment');
const path = require('path');

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  verbose: 4,
  debug: 5,
  silly: 6
};

// Define log colors
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white'
};

winston.addColors(colors);

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  config.get('LOG_FORMAT') === 'json' 
    ? winston.format.json()
    : winston.format.printf(({ timestamp, level, message, ...metadata }) => {
        let msg = `${timestamp} [${level}] : ${message} `;
        if (Object.keys(metadata).length > 0) {
          msg += JSON.stringify(metadata);
        }
        return msg;
      })
);

// Define transports based on configuration
const transports = [];

// Console transport
if (config.get('LOG_TRANSPORT').includes('console')) {
  transports.push(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize({ all: true }),
        logFormat
      )
    })
  );
}

// File transports
if (config.get('LOG_TRANSPORT').includes('file')) {
  // Error logs
  transports.push(
    new winston.transports.File({
      filename: path.join(__dirname, '../logs/error.log'),
      level: 'error',
      format: logFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  );

  // Combined logs
  transports.push(
    new winston.transports.File({
      filename: path.join(__dirname, '../logs/combined.log'),
      format: logFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  );

  // HTTP request logs
  transports.push(
    new winston.transports.File({
      filename: path.join(__dirname, '../logs/http.log'),
      level: 'http',
      format: logFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  );
}

// Create logger instance
const logger = winston.createLogger({
  level: config.get('LOG_LEVEL'),
  levels,
  format: logFormat,
  transports,
  exitOnError: false
});

// Handle uncaught exceptions
logger.exceptions.handle(
  new winston.transports.File({
    filename: path.join(__dirname, '../logs/exceptions.log')
  })
);

// Handle unhandled rejections
logger.rejections.handle(
  new winston.transports.File({
    filename: path.join(__dirname, '../logs/rejections.log')
  })
);

// Create logs directory if it doesn't exist
const fs = require('fs');
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Express middleware for HTTP logging
const httpLogger = (req, res, next) => {
  if (req.url.startsWith('/api/health') || req.url.startsWith('/favicon.ico')) {
    return next(); // Skip health check and favicon logging
  }

  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    
    const logData = {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      userId: req.user ? req.user._id : 'anonymous'
    };

    if (res.statusCode >= 500) {
      logger.error('HTTP Error', logData);
    } else if (res.statusCode >= 400) {
      logger.warn('HTTP Warning', logData);
    } else {
      logger.http('HTTP Request', logData);
    }
  });

  next();
};

// Security event logging
const logSecurityEvent = (eventType, details) => {
  logger.warn('SECURITY_EVENT', {
    eventType,
    ...details,
    timestamp: new Date().toISOString()
  });
};

// Audit logging for sensitive operations
const logAuditEvent = (userId, action, resource, details = {}) => {
  logger.info('AUDIT_EVENT', {
    userId,
    action,
    resource,
    ...details,
    timestamp: new Date().toISOString()
  });
};

// Performance monitoring logging
const logPerformance = (operation, duration, details = {}) => {
  const logLevel = duration > 5000 ? 'warn' : 'debug';
  logger[logLevel]('PERFORMANCE', {
    operation,
    duration: `${duration}ms`,
    ...details
  });
};

module.exports = {
  logger,
  httpLogger,
  logSecurityEvent,
  logAuditEvent,
  logPerformance
};
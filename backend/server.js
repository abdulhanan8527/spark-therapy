const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const path = require('path');
const connectDB = require('./config/database');
const config = require('./config/environment');
const { suspiciousActivityDetector, ipBlocker, cspMiddleware, sanitizeRequest } = require('./middleware/security.middleware');
const { httpLogger, logger } = require('./utils/logger');
const { errorHandler, notFoundHandler } = require('./middleware/error.middleware');

// Connect to database
connectDB();

// Create Express app
const app = express();

// Early security middleware
app.use(ipBlocker);
app.use(suspiciousActivityDetector);
app.use(cspMiddleware);
app.use(sanitizeRequest);

// Security middleware
if (config.get('HELMET_ENABLED')) {
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
        scriptSrc: ["'self'"],
        connectSrc: ["'self'", "http://localhost:*", "https://*"],
      },
    },
  }));
}

// Rate limiting
const limiter = rateLimit({
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

app.use('/api/', limiter);

// CORS configuration
app.use(cors({
  origin: config.get('CORS_ORIGINS'),
  credentials: true,
  optionsSuccessStatus: 200
}));

// Performance middleware
if (config.get('ENABLE_COMPRESSION')) {
  app.use(compression());
}

// HTTP logging
app.use(httpLogger);

// Body parsing middleware with limits
app.use(express.json({ 
  limit: config.get('UPLOAD_MAX_FILE_SIZE') 
}));
app.use(express.urlencoded({ 
  extended: true, 
  limit: config.get('UPLOAD_MAX_FILE_SIZE') 
}));

// Request timeout
app.use((req, res, next) => {
  req.setTimeout(config.get('REQUEST_TIMEOUT_MS'));
  res.setTimeout(config.get('REQUEST_TIMEOUT_MS'));
  next();
});

// DB Connection Check
app.use((req, res, next) => {
  if (req.path.startsWith('/api/') && !connectDB.is_connected()) {
    return res.status(503).json({
      success: false,
      message: 'Database connection is not established. Please check if your MongoDB server is running.',
      code: 'DATABASE_UNAVAILABLE'
    });
  }
  next();
});

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/children', require('./routes/child.routes'));
app.use('/api/programs', require('./routes/program.routes'));
app.use('/api/sessions', require('./routes/session.routes'));
app.use('/api/notifications', require('./routes/notification.routes'));
app.use('/api/invoices', require('./routes/invoice.routes'));
app.use('/api/complaints', require('./routes/complaint.routes'));
app.use('/api/schedules', require('./routes/schedule.routes'));
app.use('/api/leave', require('./routes/leave.routes'));
app.use('/api/fees', require('./routes/fee.routes'));
app.use('/api/therapists', require('./routes/therapist.routes'));
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/videos', require('./routes/video.routes'));
app.use('/api/ablls', require('./routes/ablls.routes'));
app.use('/api/feedback', require('./routes/feedback.routes'));
app.use('/api/reports', require('./routes/report.routes')); // Quarterly reports
app.use('/api/admin', require('./routes/admin.routes'));
app.use('/api', require('./routes/health.routes')); // Health check routes

// Health check endpoint
app.get('/', (req, res) => {
  // Try to send the built index.html, but fall back to a basic one if not available
  const indexPath = path.join(__dirname, '../web-build/index.html');
  const fs = require('fs');
  
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    // Send a basic HTML that loads the development bundle
    res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SPARK Therapy Services</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background-color: #f5f5f5;
    }
    #root {
      height: 100vh;
      width: 100vw;
    }
    .loading {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      font-family: Arial, sans-serif;
      color: #666;
    }
  </style>
</head>
<body>
  <div id="root">
    <div class="loading">Loading SPARK Therapy Application...</div>
  </div>
  <script src="http://localhost:8081/index.bundle?platform=web&dev=true"></script>
</body>
</html>
    `);
  }
});

// API health check endpoint
app.get('/api/health', (req, res) => {
  const healthCheck = {
    status: 'healthy',
    message: 'SPARK Therapy API is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: connectDB.is_connected() ? 'connected' : 'disconnected',
    environment: config.get('NODE_ENV'),
    version: config.get('API_VERSION')
  };
  
  res.status(200).json(healthCheck);
});

// 404 handler for unmatched routes
app.use(notFoundHandler);

// Centralized error handling middleware
app.use(errorHandler);

const PORT = config.get('PORT');

// Only start the server if this file is run directly
if (require.main === module) {
  const server = app.listen(PORT, '0.0.0.0', () => {
    logger.info('Server started', {
      port: PORT,
      environment: config.get('NODE_ENV'),
      helmetEnabled: config.get('HELMET_ENABLED'),
      rateLimit: `${config.get('RATE_LIMIT_MAX_REQUESTS')} requests per ${config.get('RATE_LIMIT_WINDOW_MS')/60000} minutes`,
      swaggerEnabled: config.get('ENABLE_SWAGGER')
    });
    
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`📡 Server accessible at http://localhost:${PORT}`);
    console.log(`🔧 Environment: ${config.get('NODE_ENV')}`);
    console.log(`🔒 Helmet Security: ${config.get('HELMET_ENABLED') ? 'Enabled' : 'Disabled'}`);
    console.log(`📊 Rate Limiting: ${config.get('RATE_LIMIT_MAX_REQUESTS')} requests per ${config.get('RATE_LIMIT_WINDOW_MS')/60000} minutes`);
    
    if (config.get('ENABLE_SWAGGER')) {
      console.log(`📚 Swagger Docs: http://localhost:${PORT}${config.get('SWAGGER_PATH')}`);
    }
  });
  
  // Graceful shutdown
  process.on('SIGTERM', () => {
    logger.info('SIGTERM received, shutting down gracefully');
    server.close(() => {
      logger.info('Process terminated');
      process.exit(0);
    });
  });
  
  process.on('SIGINT', () => {
    logger.info('SIGINT received, shutting down gracefully');
    server.close(() => {
      logger.info('Process terminated');
      process.exit(0);
    });
  });
}

// Export the app for use in tests
module.exports = app;
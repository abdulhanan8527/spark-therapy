/**
 * Environment Configuration Manager
 * Centralized configuration management with validation and defaults
 */

const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// Load environment variables
dotenv.config();

class ConfigManager {
  constructor() {
    this.config = this.loadConfiguration();
    this.validateConfiguration();
  }

  loadConfiguration() {
    const env = process.env.NODE_ENV || 'development';
    
    // Base configuration with defaults
    const baseConfig = {
      // Application
      NODE_ENV: env,
      PORT: parseInt(process.env.PORT) || 5000,
      API_VERSION: process.env.API_VERSION || 'v1',
      
      // Database
      MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/spark_therapy',
      DB_CONNECTION_POOL_SIZE: parseInt(process.env.DB_CONNECTION_POOL_SIZE) || 5,
      DB_MAX_RETRIES: parseInt(process.env.DB_MAX_RETRIES) || 3,
      DB_RETRY_DELAY: parseInt(process.env.DB_RETRY_DELAY) || 5000,
      
      // JWT
      JWT_SECRET: process.env.JWT_SECRET || 'fallback_jwt_secret_for_dev_only',
      JWT_EXPIRE: process.env.JWT_EXPIRE || '24h',
      JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret_for_dev_only',
      JWT_REFRESH_EXPIRE: process.env.JWT_REFRESH_EXPIRE || '7d',
      
      // Security
      CORS_ORIGINS: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : [
        'http://localhost:3000',
        'http://localhost:19006',
        'http://localhost:19000'
      ],
      RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 minutes
      RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
      HELMET_ENABLED: process.env.HELMET_ENABLED === 'true',
      REQUEST_TIMEOUT_MS: parseInt(process.env.REQUEST_TIMEOUT_MS) || 30000,
      
      // Logging
      LOG_LEVEL: process.env.LOG_LEVEL || (env === 'production' ? 'info' : 'debug'),
      LOG_FORMAT: process.env.LOG_FORMAT || 'json',
      LOG_TRANSPORT: process.env.LOG_TRANSPORT ? process.env.LOG_TRANSPORT.split(',') : ['console'],
      
      // API Features
      ENABLE_SWAGGER: process.env.ENABLE_SWAGGER === 'true',
      SWAGGER_PATH: process.env.SWAGGER_PATH || '/api-docs',
      ENABLE_HEALTH_CHECKS: process.env.ENABLE_HEALTH_CHECKS !== 'false',
      HEALTH_CHECK_INTERVAL: parseInt(process.env.HEALTH_CHECK_INTERVAL) || 30000,
      
      // Performance
      ENABLE_COMPRESSION: process.env.ENABLE_COMPRESSION !== 'false',
      ENABLE_ETAGS: process.env.ENABLE_ETAGS !== 'false',
      
      // File Uploads
      UPLOAD_MAX_FILE_SIZE: process.env.UPLOAD_MAX_FILE_SIZE || '10MB',
      UPLOAD_ALLOWED_TYPES: process.env.UPLOAD_ALLOWED_TYPES ? 
        process.env.UPLOAD_ALLOWED_TYPES.split(',') : 
        ['image/*', 'application/pdf'],
      
      // Cache
      REDIS_URL: process.env.REDIS_URL,
      CACHE_TTL_DEFAULT: parseInt(process.env.CACHE_TTL_DEFAULT) || 3600,
      CACHE_TTL_SESSIONS: parseInt(process.env.CACHE_TTL_SESSIONS) || 7200,
      
      // Monitoring
      ENABLE_METRICS: process.env.ENABLE_METRICS === 'true',
      METRICS_PATH: process.env.METRICS_PATH || '/metrics',
      
      // Backup
      BACKUP_ENABLED: process.env.BACKUP_ENABLED === 'true',
      BACKUP_SCHEDULE: process.env.BACKUP_SCHEDULE || '0 2 * * *',
      BACKUP_RETENTION_DAYS: parseInt(process.env.BACKUP_RETENTION_DAYS) || 30
    };

    // Environment-specific overrides
    const envConfigs = {
      development: {
        LOG_LEVEL: 'debug',
        HELMET_ENABLED: false,
        ENABLE_SWAGGER: true,
        CORS_ORIGINS: [
          'http://localhost:3000',
          'http://localhost:19006',
          'http://localhost:19000',
          'http://localhost:5001',
          'http://localhost:8081',
          'http://localhost:8082',
          'http://localhost:8090',
          'http://192.168.100.83:8081',  // IP for physical device connections
          'http://192.168.100.83:8082',  // IP for physical device connections
          'http://192.168.100.83:8083',  // IP for physical device connections
          'http://192.168.100.83:8084',  // IP for physical device connections
          'http://192.168.100.83:8085',  // IP for physical device connections
          'http://192.168.100.83:8086'   // IP for physical device connections
        ]
      },
      staging: {
        LOG_LEVEL: 'info',
        HELMET_ENABLED: true,
        ENABLE_SWAGGER: true
      },
      production: {
        LOG_LEVEL: 'warn',
        HELMET_ENABLED: true,
        ENABLE_SWAGGER: false,
        CORS_ORIGINS: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : []
      }
    };

    return { ...baseConfig, ...(envConfigs[env] || {}) };
  }

  validateConfiguration() {
    const errors = [];

    // Critical validations
    if (this.config.NODE_ENV === 'production') {
      // Production security validations
      if (this.config.JWT_SECRET === 'fallback_jwt_secret_for_dev_only') {
        errors.push('JWT_SECRET must be changed from default value in production');
      }
      
      if (this.config.JWT_REFRESH_SECRET === 'fallback_refresh_secret_for_dev_only') {
        errors.push('JWT_REFRESH_SECRET must be changed from default value in production');
      }
      
      if (this.config.CORS_ORIGINS.length === 0) {
        errors.push('CORS_ORIGINS must be configured in production');
      }
      
      if (!this.config.MONGODB_URI || this.config.MONGODB_URI.includes('localhost')) {
        errors.push('Production MongoDB URI must be configured with remote database');
      }
    }

    // General validations
    if (this.config.PORT < 1 || this.config.PORT > 65535) {
      errors.push('PORT must be between 1 and 65535');
    }

    if (errors.length > 0) {
      console.error('Configuration Validation Errors:');
      errors.forEach(error => console.error(`  ❌ ${error}`));
      if (this.config.NODE_ENV === 'production') {
        throw new Error('Critical configuration errors in production environment');
      }
    }

    // Warnings for non-critical issues
    if (this.config.NODE_ENV !== 'production') {
      if (this.config.JWT_SECRET === 'fallback_jwt_secret_for_dev_only') {
        console.warn('⚠️  Using default JWT secret - change for production');
      }
    }
  }

  get(key) {
    return this.config[key];
  }

  getAll() {
    return { ...this.config };
  }

  isProduction() {
    return this.config.NODE_ENV === 'production';
  }

  isDevelopment() {
    return this.config.NODE_ENV === 'development';
  }

  isStaging() {
    return this.config.NODE_ENV === 'staging';
  }
}

// Create singleton instance
const config = new ConfigManager();

// Export configuration
module.exports = config;
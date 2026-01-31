/**
 * Database Indexing and Optimization Script
 * Creates optimal indexes for production performance
 */

const mongoose = require('mongoose');
const config = require('../config/environment');
const { logger } = require('../utils/logger');

// Import all models to ensure they're registered
require('../models/User');
require('../models/Child');
require('../models/Program');
require('../models/Session');
require('../models/Invoice');
require('../models/Notification');
require('../models/Complaint');
require('../models/Fee');
require('../models/Schedule');
require('../models/LeaveRequest');
require('../models/Feedback');

class DatabaseOptimizer {
  constructor() {
    this.models = mongoose.models;
  }

  async createIndexes() {
    logger.info('Starting database index optimization...');
    
    try {
      // User model indexes
      await this.optimizeUserModel();
      
      // Child model indexes
      await this.optimizeChildModel();
      
      // Program model indexes
      await this.optimizeProgramModel();
      
      // Session model indexes
      await this.optimizeSessionModel();
      
      // Other models
      await this.optimizeOtherModels();
      
      logger.info('Database index optimization completed successfully');
      
    } catch (error) {
      logger.error('Database index optimization failed:', error);
      throw error;
    }
  }

  async optimizeUserModel() {
    const User = this.models.User;
    if (!User) return;

    logger.info('Optimizing User model indexes...');
    
    try {
      // Email unique index (should already exist from schema)
      await User.collection.createIndex({ email: 1 }, { unique: true });
      
      // Role-based queries
      await User.collection.createIndex({ role: 1, isActive: 1 });
      
      // Status and creation date for admin queries
      await User.collection.createIndex({ isActive: 1, createdAt: -1 });
      
      // Name search index
      await User.collection.createIndex({ 
        name: 'text',
        email: 'text'
      }, { 
        weights: { name: 10, email: 5 },
        name: 'UserTextIndex'
      });
      
      logger.info('User model indexes created successfully');
    } catch (error) {
      logger.warn('User model index creation warning:', error.message);
    }
  }

  async optimizeChildModel() {
    const Child = this.models.Child;
    if (!Child) return;

    logger.info('Optimizing Child model indexes...');
    
    try {
      // Parent-child relationship queries
      await Child.collection.createIndex({ parentId: 1, isActive: 1 });
      
      // Therapist assignments
      await Child.collection.createIndex({ therapistId: 1, isActive: 1 });
      
      // Name search
      await Child.collection.createIndex({ 
        firstName: 'text',
        lastName: 'text'
      }, { 
        weights: { firstName: 10, lastName: 10 },
        name: 'ChildTextIndex'
      });
      
      // Date-based queries
      await Child.collection.createIndex({ createdAt: -1 });
      await Child.collection.createIndex({ startDate: -1 });
      
      logger.info('Child model indexes created successfully');
    } catch (error) {
      logger.warn('Child model index creation warning:', error.message);
    }
  }

  async optimizeProgramModel() {
    const Program = this.models.Program;
    if (!Program) return;

    logger.info('Optimizing Program model indexes...');
    
    try {
      // Child-specific programs
      await Program.collection.createIndex({ childId: 1, isArchived: 1 });
      
      // Category-based queries
      await Program.collection.createIndex({ category: 1, isArchived: 1 });
      
      // ABLLS code search
      await Program.collection.createIndex({ abllsCode: 1 });
      
      // Text search for program content
      await Program.collection.createIndex({ 
        title: 'text',
        shortDescription: 'text',
        longDescription: 'text'
      }, { 
        weights: { title: 10, shortDescription: 5, longDescription: 2 },
        name: 'ProgramTextIndex'
      });
      
      // Creation date for sorting
      await Program.collection.createIndex({ createdAt: -1 });
      
      logger.info('Program model indexes created successfully');
    } catch (error) {
      logger.warn('Program model index creation warning:', error.message);
    }
  }

  async optimizeSessionModel() {
    const Session = this.models.Session;
    if (!Session) return;

    logger.info('Optimizing Session model indexes...');
    
    try {
      // User-based session queries
      await Session.collection.createIndex({ therapistId: 1, date: -1 });
      await Session.collection.createIndex({ parentId: 1, date: -1 });
      await Session.collection.createIndex({ childId: 1, date: -1 });
      
      // Date range queries
      await Session.collection.createIndex({ date: -1 });
      await Session.collection.createIndex({ startTime: -1 });
      
      // Status-based filtering
      await Session.collection.createIndex({ status: 1, date: -1 });
      
      // Composite indexes for common queries
      await Session.collection.createIndex({ 
        therapistId: 1, 
        date: -1, 
        status: 1 
      });
      
      await Session.collection.createIndex({ 
        childId: 1, 
        date: -1, 
        status: 1 
      });
      
      logger.info('Session model indexes created successfully');
    } catch (error) {
      logger.warn('Session model index creation warning:', error.message);
    }
  }

  async optimizeOtherModels() {
    logger.info('Optimizing other model indexes...');
    
    // Notification model
    const Notification = this.models.Notification;
    if (Notification) {
      try {
        await Notification.collection.createIndex({ recipientId: 1, createdAt: -1 });
        await Notification.collection.createIndex({ isRead: 1, createdAt: -1 });
        await Notification.collection.createIndex({ type: 1, priority: 1 });
      } catch (error) {
        logger.warn('Notification index creation warning:', error.message);
      }
    }

    // Invoice model
    const Invoice = this.models.Invoice;
    if (Invoice) {
      try {
        await Invoice.collection.createIndex({ parentId: 1, dueDate: -1 });
        await Invoice.collection.createIndex({ status: 1, dueDate: 1 });
        await Invoice.collection.createIndex({ invoiceNumber: 1 }, { unique: true });
      } catch (error) {
        logger.warn('Invoice index creation warning:', error.message);
      }
    }

    // Schedule model
    const Schedule = this.models.Schedule;
    if (Schedule) {
      try {
        await Schedule.collection.createIndex({ therapistId: 1, date: 1 });
        await Schedule.collection.createIndex({ childId: 1, date: 1 });
        await Schedule.collection.createIndex({ date: 1, time: 1 });
        await Schedule.collection.createIndex({ status: 1, date: 1 });
      } catch (error) {
        logger.warn('Schedule index creation warning:', error.message);
      }
    }

    logger.info('Other model indexes created successfully');
  }

  async analyzePerformance() {
    logger.info('Analyzing database performance...');
    
    try {
      const db = mongoose.connection.db;
      
      // Get collection statistics
      const collections = await db.listCollections().toArray();
      
      for (const collection of collections) {
        if (collection.name.startsWith('system.')) continue;
        
        try {
          const stats = await db.collection(collection.name).stats();
          logger.info(`Collection ${collection.name}:`, {
            documentCount: stats.count,
            size: `${Math.round(stats.size / 1024 / 1024)} MB`,
            avgObjSize: `${Math.round(stats.avgObjSize)} bytes`,
            indexCount: stats.nindexes
          });
        } catch (error) {
          logger.warn(`Could not get stats for ${collection.name}:`, error.message);
        }
      }
      
    } catch (error) {
      logger.error('Database performance analysis failed:', error);
    }
  }

  async cleanupOldData() {
    logger.info('Cleaning up old data...');
    
    try {
      const Notification = this.models.Notification;
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      
      if (Notification) {
        const result = await Notification.deleteMany({
          createdAt: { $lt: thirtyDaysAgo },
          isRead: true
        });
        
        logger.info(`Cleaned up ${result.deletedCount} old notifications`);
      }
      
    } catch (error) {
      logger.error('Data cleanup failed:', error);
    }
  }

  async validateIndexes() {
    logger.info('Validating database indexes...');
    
    try {
      const db = mongoose.connection.db;
      const collections = await db.listCollections().toArray();
      
      for (const collection of collections) {
        if (collection.name.startsWith('system.')) continue;
        
        try {
          const indexes = await db.collection(collection.name).indexes();
          logger.info(`Collection ${collection.name} has ${indexes.length} indexes:`);
          
          indexes.forEach(index => {
            logger.debug(`  - ${index.name}: ${JSON.stringify(index.key)}`);
          });
        } catch (error) {
          logger.warn(`Could not validate indexes for ${collection.name}:`, error.message);
        }
      }
      
    } catch (error) {
      logger.error('Index validation failed:', error);
    }
  }
}

// Run optimization if script is executed directly
if (require.main === module) {
  const optimizer = new DatabaseOptimizer();
  
  const runOptimization = async () => {
    try {
      await mongoose.connect(config.get('MONGODB_URI'));
      logger.info('Connected to database for optimization');
      
      await optimizer.createIndexes();
      await optimizer.analyzePerformance();
      await optimizer.cleanupOldData();
      await optimizer.validateIndexes();
      
      logger.info('Database optimization completed successfully');
      process.exit(0);
    } catch (error) {
      logger.error('Database optimization failed:', error);
      process.exit(1);
    }
  };
  
  runOptimization();
}

module.exports = DatabaseOptimizer;
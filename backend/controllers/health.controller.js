/**
 * System Health Check Controller
 * Comprehensive health monitoring for all system components
 */

const os = require('os');
const mongoose = require('mongoose');
const config = require('../config/environment');
const { logger } = require('../utils/logger');

class HealthChecker {
  constructor() {
    this.checks = {
      database: this.checkDatabase.bind(this),
      memory: this.checkMemory.bind(this),
      cpu: this.checkCPU.bind(this),
      disk: this.checkDisk.bind(this),
      network: this.checkNetwork.bind(this),
      application: this.checkApplication.bind(this)
    };
  }

  async performHealthCheck(detailed = false) {
    const startTime = Date.now();
    const results = {};
    let overallStatus = 'healthy';
    
    try {
      // Run all health checks in parallel for better performance
      const checkPromises = Object.entries(this.checks).map(async ([name, checkFn]) => {
        try {
          const result = await checkFn();
          return { name, result, status: 'healthy' };
        } catch (error) {
          logger.error(`Health check failed for ${name}:`, error);
          return { 
            name, 
            result: { error: error.message }, 
            status: 'unhealthy' 
          };
        }
      });

      const checkResults = await Promise.all(checkPromises);
      
      // Process results
      checkResults.forEach(({ name, result, status }) => {
        results[name] = result;
        if (status === 'unhealthy') {
          overallStatus = 'degraded';
        }
      });

      // Overall system metrics
      const systemMetrics = {
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch
      };

      const response = {
        status: overallStatus,
        timestamp: new Date().toISOString(),
        responseTime: Date.now() - startTime,
        system: systemMetrics,
        checks: results
      };

      // Add detailed information if requested
      if (detailed) {
        response.detailed = {
          environment: config.get('NODE_ENV'),
          version: config.get('API_VERSION'),
          pid: process.pid,
          hostname: os.hostname(),
          totalMemory: os.totalmem(),
          freeMemory: os.freemem(),
          cpus: os.cpus().length,
          loadAverage: os.loadavg(),
          networkInterfaces: os.networkInterfaces()
        };
      }

      return response;

    } catch (error) {
      logger.error('Health check system error:', error);
      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        responseTime: Date.now() - startTime,
        error: error.message
      };
    }
  }

  async checkDatabase() {
    const startTime = Date.now();
    
    try {
      // Check connection status
      const connectionStatus = mongoose.connection.readyState;
      const isConnected = connectionStatus === 1;
      
      if (!isConnected) {
        throw new Error('Database not connected');
      }
      
      // Perform a simple query to test responsiveness
      await mongoose.connection.db.admin().ping();
      
      // Get database stats
      const dbStats = await mongoose.connection.db.stats();
      
      return {
        status: 'connected',
        responseTime: Date.now() - startTime,
        collections: dbStats.collections,
        objects: dbStats.objects,
        dataSize: dbStats.dataSize,
        storageSize: dbStats.storageSize
      };
      
    } catch (error) {
      throw new Error(`Database check failed: ${error.message}`);
    }
  }

  checkMemory() {
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const memoryUsage = process.memoryUsage();
    
    const percentages = {
      system: Math.round((usedMem / totalMem) * 100),
      heap: Math.round((memoryUsage.heapUsed / memoryUsage.heapTotal) * 100),
      rss: Math.round((memoryUsage.rss / totalMem) * 100)
    };
    
    // Alert thresholds
    const isHealthy = percentages.system < 85 && percentages.heap < 90;
    
    return {
      status: isHealthy ? 'healthy' : 'warning',
      total: totalMem,
      free: freeMem,
      used: usedMem,
      percentage: percentages.system,
      process: {
        rss: memoryUsage.rss,
        heapTotal: memoryUsage.heapTotal,
        heapUsed: memoryUsage.heapUsed,
        external: memoryUsage.external
      }
    };
  }

  checkCPU() {
    const cpus = os.cpus();
    const loadAvg = os.loadavg();
    const numCPUs = cpus.length;
    
    // Calculate average CPU usage
    let totalIdle = 0;
    let totalTick = 0;
    
    cpus.forEach(cpu => {
      for (const type in cpu.times) {
        totalTick += cpu.times[type];
      }
      totalIdle += cpu.times.idle;
    });
    
    const idle = totalIdle / cpus.length;
    const total = totalTick / cpus.length;
    const usage = ((total - idle) / total) * 100;
    
    // Normalize load average by CPU count
    const normalizedLoad = loadAvg.map(avg => avg / numCPUs);
    
    return {
      status: normalizedLoad[0] < 0.8 ? 'healthy' : 'warning',
      cores: numCPUs,
      usage: Math.round(usage * 100) / 100,
      loadAverage: {
        '1min': normalizedLoad[0],
        '5min': normalizedLoad[1],
        '15min': normalizedLoad[2]
      }
    };
  }

  checkDisk() {
    try {
      // This is a simplified disk check - in production you might want
      // to check specific mount points or use system utilities
      const totalMem = os.totalmem();
      const freeMem = os.freemem();
      const usedPercentage = ((totalMem - freeMem) / totalMem) * 100;
      
      return {
        status: usedPercentage < 85 ? 'healthy' : 'warning',
        usedPercentage: Math.round(usedPercentage)
      };
    } catch (error) {
      return {
        status: 'unknown',
        error: error.message
      };
    }
  }

  checkNetwork() {
    try {
      const interfaces = os.networkInterfaces();
      const activeInterfaces = [];
      
      Object.keys(interfaces).forEach(name => {
        interfaces[name].forEach(iface => {
          if (!iface.internal && iface.address) {
            activeInterfaces.push({
              name,
              address: iface.address,
              family: iface.family,
              mac: iface.mac
            });
          }
        });
      });
      
      return {
        status: activeInterfaces.length > 0 ? 'healthy' : 'warning',
        interfaces: activeInterfaces.length,
        addresses: activeInterfaces
      };
    } catch (error) {
      return {
        status: 'unknown',
        error: error.message
      };
    }
  }

  checkApplication() {
    return {
      status: 'healthy',
      version: config.get('API_VERSION'),
      environment: config.get('NODE_ENV'),
      uptime: process.uptime(),
      pid: process.pid
    };
  }

  async monitorHealth() {
    const healthData = await this.performHealthCheck();
    
    // Log warnings for degraded components
    Object.entries(healthData.checks).forEach(([component, data]) => {
      if (data.status === 'warning') {
        logger.warn(`Health warning for ${component}:`, data);
      } else if (data.status === 'unhealthy') {
        logger.error(`Health error for ${component}:`, data);
      }
    });
    
    return healthData;
  }
}

// Express route handler
const healthController = {
  async getHealth(req, res) {
    const detailed = req.query.detailed === 'true';
    const healthChecker = new HealthChecker();
    
    try {
      const healthData = await healthChecker.performHealthCheck(detailed);
      const statusCode = healthData.status === 'healthy' ? 200 : 503;
      
      res.status(statusCode).json(healthData);
    } catch (error) {
      logger.error('Health check endpoint error:', error);
      res.status(500).json({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Health check system error'
      });
    }
  },

  async getSimpleHealth(req, res) {
    // Quick health check without detailed information
    const isDbConnected = mongoose.connection.readyState === 1;
    
    const health = {
      status: isDbConnected ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      database: isDbConnected ? 'connected' : 'disconnected'
    };
    
    res.status(isDbConnected ? 200 : 503).json(health);
  }
};

module.exports = { HealthChecker, healthController };
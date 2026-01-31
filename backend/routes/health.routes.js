/**
 * Health Check Routes
 * API endpoints for system health monitoring
 */

const express = require('express');
const { healthController } = require('../controllers/health.controller');

const router = express.Router();

// Simple health check endpoint (quick response)
router.get('/health', healthController.getSimpleHealth);

// Detailed health check endpoint
router.get('/health/detailed', healthController.getHealth);

// Health check with monitoring data
router.get('/monitoring/health', healthController.getHealth);

module.exports = router;
const express = require('express');
const router = express.Router();
const { getDashboardStats } = require('../controllers/admin.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

// @desc    Get admin dashboard statistics
// @route   GET /api/admin/dashboard
// @access  Private/Admin
router.route('/dashboard').get(protect, authorize('admin'), getDashboardStats);

module.exports = router;
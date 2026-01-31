const express = require('express');
const router = express.Router();
const {
  createFee,
  getAllFees,
  getFeeById,
  updateFee,
  deleteFee,
  getFeesByParentId,
  getFeesByChildId,
  getParentFeeSummary
} = require('../controllers/fee.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const { createValidator } = require('../middleware/validation.middleware');
const { feeSchemas } = require('../helpers/validation');

// Admin routes
router.post('/', protect, authorize('admin'), createValidator(feeSchemas.create), createFee);
router.get('/', protect, authorize('admin'), getAllFees);
router.put('/:id', protect, authorize('admin'), createValidator(feeSchemas.update), updateFee);
router.delete('/:id', protect, authorize('admin'), deleteFee);
router.get('/child/:childId', protect, authorize('admin'), getFeesByChildId);

// Admin and Parent routes
router.get('/:id', protect, authorize('admin', 'parent'), getFeeById);
router.get('/parent/:parentId', protect, authorize('admin', 'parent'), getFeesByParentId);
router.get('/summary/:parentId', protect, authorize('admin', 'parent'), getParentFeeSummary);

module.exports = router;
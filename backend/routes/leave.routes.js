const express = require('express');
const router = express.Router();
const {
  createLeaveRequest,
  getAllLeaveRequests,
  getLeaveRequestById,
  updateLeaveRequest,
  deleteLeaveRequest,
  getLeaveRequestsByTherapistId,
  getPendingLeaveRequests
} = require('../controllers/leave.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const { createValidator } = require('../middleware/validation.middleware');
const { leaveSchemas } = require('../helpers/validation');

// Therapist routes
router.post('/', protect, authorize('therapist'), createValidator(leaveSchemas.create), createLeaveRequest);

// Admin routes
router.get('/', protect, authorize('admin'), getAllLeaveRequests);
router.put('/:id', protect, authorize('admin'), createValidator(leaveSchemas.update), updateLeaveRequest);
router.delete('/:id', protect, authorize('admin'), deleteLeaveRequest);
router.get('/pending', protect, authorize('admin'), getPendingLeaveRequests);

// Admin and Therapist routes
router.get('/:id', protect, authorize('admin', 'therapist'), getLeaveRequestById);
router.get('/therapist/:therapistId', protect, authorize('admin', 'therapist'), getLeaveRequestsByTherapistId);

module.exports = router;
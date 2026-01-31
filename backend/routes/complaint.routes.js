const express = require('express');
const router = express.Router();
const {
  createComplaint,
  getAllComplaints,
  getComplaintById,
  updateComplaint,
  deleteComplaint,
  getComplaintsByParentId,
  getComplaintsByChildId
} = require('../controllers/complaint.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const { createValidator } = require('../middleware/validation.middleware');
const { complaintSchemas } = require('../helpers/validation');

// Parent routes
router.post('/', protect, authorize('parent'), createValidator(complaintSchemas.create), createComplaint);

// Admin routes
router.get('/', protect, authorize('admin'), getAllComplaints);
router.put('/:id', protect, authorize('admin'), createValidator(complaintSchemas.update), updateComplaint);
router.delete('/:id', protect, authorize('admin'), deleteComplaint);
router.get('/child/:childId', protect, authorize('admin'), getComplaintsByChildId);

// Admin and Parent routes
router.get('/:id', protect, authorize('admin', 'parent'), getComplaintById);
router.get('/parent/:parentId', protect, authorize('admin', 'parent'), getComplaintsByParentId);

module.exports = router;
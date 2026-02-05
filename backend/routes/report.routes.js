const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const {
  createReport,
  getReportsByTherapist,
  getReportsByChild,
  getReportById,
  updateReport,
  deleteReport,
  updateReportStatus
} = require('../controllers/report.controller');

// Public routes (all require authentication)
router.post('/', protect, authorize('therapist'), createReport);
router.get('/therapist/:therapistId?', protect, authorize('admin', 'therapist'), getReportsByTherapist);
router.get('/child/:childId', protect, authorize('admin', 'therapist', 'parent'), getReportsByChild);
router.get('/:id', protect, authorize('admin', 'therapist', 'parent'), getReportById);
router.put('/:id', protect, authorize('therapist'), updateReport);
router.delete('/:id', protect, authorize('therapist'), deleteReport);
router.patch('/:id/status', protect, authorize('admin'), updateReportStatus);

module.exports = router;

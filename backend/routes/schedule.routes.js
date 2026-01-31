const express = require('express');
const router = express.Router();
const {
  createSchedule,
  getAllSchedules,
  getScheduleById,
  updateSchedule,
  deleteSchedule,
  getSchedulesByTherapistId,
  getSchedulesByChildId
} = require('../controllers/schedule.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const { createValidator } = require('../middleware/validation.middleware');
const { scheduleSchemas } = require('../helpers/validation');

// Admin routes
router.post('/', protect, authorize('admin'), createValidator(scheduleSchemas.create), createSchedule);
router.get('/', protect, authorize('admin'), getAllSchedules);
router.put('/:id', protect, authorize('admin'), createValidator(scheduleSchemas.update), updateSchedule);
router.delete('/:id', protect, authorize('admin'), deleteSchedule);
router.get('/child/:childId', protect, authorize('admin'), getSchedulesByChildId);

// Admin and Therapist routes
router.get('/:id', protect, authorize('admin', 'therapist'), getScheduleById);
router.get('/therapist/:therapistId', protect, authorize('admin', 'therapist'), getSchedulesByTherapistId);

module.exports = router;
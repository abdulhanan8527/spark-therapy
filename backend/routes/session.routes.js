const express = require('express');
const {
  getSessions,
  getSessionById,
  createSession,
  updateSession,
  deleteSession,
  getTherapistAvailability
} = require('../controllers/session.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

router.route('/')
  .get(protect, authorize('therapist', 'parent', 'admin'), getSessions)
  .post(protect, authorize('therapist', 'admin'), createSession);

router.route('/:id')
  .get(protect, authorize('therapist', 'parent', 'admin'), getSessionById)
  .put(protect, authorize('therapist', 'admin'), updateSession)
  .delete(protect, authorize('therapist', 'admin'), deleteSession);

router.route('/availability/:therapistId')
  .get(protect, authorize('admin', 'parent'), getTherapistAvailability);

module.exports = router;
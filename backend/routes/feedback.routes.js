const express = require('express');
const {
  getAllFeedback,
  getFeedbackByChild,
  getFeedbackById,
  createFeedback,
  updateFeedback,
  deleteFeedback
} = require('../controllers/feedback.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

// Feedback for a specific child
router.route('/child/:childId')
  .get(protect, authorize('therapist', 'parent', 'admin'), getFeedbackByChild);

// Feedback CRUD operations
router.route('/')
  .get(protect, authorize('admin'), getAllFeedback)
  .post(protect, authorize('therapist', 'admin'), createFeedback);

router.route('/:id')
  .get(protect, authorize('therapist', 'parent', 'admin'), getFeedbackById)
  .put(protect, authorize('therapist', 'admin'), updateFeedback)
  .delete(protect, authorize('therapist', 'admin'), deleteFeedback);

module.exports = router;
const express = require('express');
const router = express.Router();
const { 
  getAllAbllsAssessments, 
  getAbllsAssessmentById, 
  createAbllsAssessment, 
  updateAbllsAssessment, 
  deleteAbllsAssessment,
  getAbllsAssessmentsByChild
} = require('../controllers/ablls.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

// Apply authentication to all routes
router.use(protect);

// Admin and therapist only routes
router.route('/')
  .get(authorize('admin', 'therapist'), getAllAbllsAssessments)
  .post(authorize('admin', 'therapist'), createAbllsAssessment);

// Routes for specific assessment
router.route('/:id')
  .get(authorize('admin', 'therapist'), getAbllsAssessmentById)
  .put(authorize('admin', 'therapist'), updateAbllsAssessment)
  .delete(authorize('admin'), deleteAbllsAssessment);

// Get assessments by child
router.route('/child/:childId')
  .get(authorize('admin', 'therapist'), getAbllsAssessmentsByChild);

module.exports = router;
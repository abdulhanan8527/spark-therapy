const express = require('express');
const router = express.Router();
const {
  getAllTherapists,
  getTherapistById,
  updateTherapist,
  deactivateTherapist,
  reactivateTherapist,
  assignChildToTherapist,
  removeChildFromTherapist,
  getChildrenByTherapistId,
  deleteTherapist
} = require('../controllers/therapist.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const { createValidator } = require('../middleware/validation.middleware');
const { therapistSchemas } = require('../helpers/validation');

// Admin routes
router.get('/', protect, authorize('admin'), getAllTherapists);
router.get('/:id', protect, authorize('admin'), getTherapistById);
router.put('/:id', protect, authorize('admin'), createValidator(therapistSchemas.update), updateTherapist);
router.delete('/:id', protect, authorize('admin'), deleteTherapist);  // Permanently delete therapist
router.put('/:id/deactivate', protect, authorize('admin'), deactivateTherapist);
router.put('/:id/reactivate', protect, authorize('admin'), reactivateTherapist);
router.put('/:id/assign-child/:childId', protect, authorize('admin'), assignChildToTherapist);
router.put('/remove-child/:childId', protect, authorize('admin'), removeChildFromTherapist);

// Admin and Therapist routes
router.get('/:id/children', protect, authorize('admin', 'therapist'), getChildrenByTherapistId);

module.exports = router;
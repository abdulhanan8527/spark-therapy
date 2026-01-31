const express = require('express');
const {
  getProgramsByChild,
  getProgramById,
  createProgram,
  updateProgram,
  deleteProgram,
  updateTarget,
  addProgramTarget,
  removeProgramTarget
} = require('../controllers/program.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const { createValidator } = require('../middleware/validation.middleware');
const { programSchemas } = require('../helpers/validation');

const router = express.Router();

// Programs for a specific child
router.route('/child/:childId')
  .get(protect, authorize('therapist', 'parent', 'admin'), getProgramsByChild);

// Program CRUD operations
router.route('/')
  .post(protect, authorize('therapist', 'admin'), createValidator(programSchemas.create), createProgram);

router.route('/:id')
  .get(protect, authorize('therapist', 'parent', 'admin'), getProgramById)
  .put(protect, authorize('therapist', 'admin'), createValidator(programSchemas.update), updateProgram)
  .delete(protect, authorize('therapist', 'admin'), deleteProgram);

// Target operations within a program
router.route('/:id/targets')
  .post(protect, authorize('therapist', 'admin'), createValidator(programSchemas.addTarget), addProgramTarget);
  
router.route('/:id/targets/:targetId')
  .put(protect, authorize('therapist', 'admin'), createValidator(programSchemas.updateTarget), updateTarget)
  .delete(protect, authorize('therapist', 'admin'), removeProgramTarget);

module.exports = router;
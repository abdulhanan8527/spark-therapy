const express = require('express');
const {
  getChildren,
  getChildById,
  createChild,
  updateChild,
  deleteChild
} = require('../controllers/child.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const { createValidator } = require('../middleware/validation.middleware');
const { childSchemas } = require('../helpers/validation');

const router = express.Router();

router
  .route('/')
  .get(protect, authorize('parent', 'therapist', 'admin'), getChildren)
  .post(protect, authorize('parent', 'admin'), createValidator(childSchemas.create), createChild);

router
  .route('/:id')
  .get(protect, authorize('parent', 'therapist', 'admin'), getChildById)
  .put(protect, authorize('parent', 'admin'), createValidator(childSchemas.update), updateChild)
  .delete(protect, authorize('parent', 'admin'), deleteChild);

module.exports = router;
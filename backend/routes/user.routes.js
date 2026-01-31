const express = require('express');
const {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getUsersByRole
} = require('../controllers/user.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const { createValidator } = require('../middleware/validation.middleware');
const { userSchemas } = require('../helpers/validation');

const router = express.Router();

// Admin routes
router.get('/', protect, authorize('admin'), getAllUsers);
router.get('/role/:role', protect, authorize('admin'), getUsersByRole);
router.put('/:id', protect, authorize('admin', 'user'), createValidator(userSchemas.update), updateUser);
router.delete('/:id', protect, authorize('admin'), deleteUser);

// User routes (self-access)
router.get('/:id', protect, getUserById);

module.exports = router;
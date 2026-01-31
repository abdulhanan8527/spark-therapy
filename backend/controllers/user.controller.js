const UserService = require('../services/user.service');
const { successResponse, errorResponse } = require('../utils/responseHandler');
const { isValidObjectId } = require('../utils/validation');

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
  try {
    // Only admins can access this
    if (req.user.role !== 'admin') {
      return errorResponse(res, 'Access denied. Admin only.', 403);
    }

    const result = await UserService.getAllUsers();
    if (result.success) {
      successResponse(res, result.data, result.message);
    } else {
      errorResponse(res, result.message, result.statusCode);
    }
  } catch (error) {
    errorResponse(res, error.message, 500);
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!isValidObjectId(id)) {
      return errorResponse(res, 'Invalid user ID', 400);
    }

    // Users can only view their own profile unless they're an admin
    if (req.user.role !== 'admin' && req.user._id.toString() !== id) {
      return errorResponse(res, 'Access denied. You can only view your own profile.', 403);
    }

    const result = await UserService.getUserById(id);
    if (result.success) {
      successResponse(res, result.data, result.message);
    } else {
      errorResponse(res, result.message, result.statusCode);
    }
  } catch (error) {
    errorResponse(res, error.message, 500);
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Validate ObjectId
    if (!isValidObjectId(id)) {
      return errorResponse(res, 'Invalid user ID', 400);
    }

    // Users can only update their own profile unless they're an admin
    if (req.user.role !== 'admin' && req.user._id.toString() !== id) {
      return errorResponse(res, 'Access denied. You can only update your own profile.', 403);
    }

    const result = await UserService.updateUser(id, updateData);
    if (result.success) {
      successResponse(res, result.data, result.message);
    } else {
      errorResponse(res, result.message, result.statusCode);
    }
  } catch (error) {
    errorResponse(res, error.message, 500);
  }
};

// @desc    Delete user (soft delete)
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!isValidObjectId(id)) {
      return errorResponse(res, 'Invalid user ID', 400);
    }

    // Only admins can delete users
    if (req.user.role !== 'admin') {
      return errorResponse(res, 'Access denied. Admin only.', 403);
    }

    const result = await UserService.deleteUser(id);
    if (result.success) {
      successResponse(res, result.data, result.message);
    } else {
      errorResponse(res, result.message, result.statusCode);
    }
  } catch (error) {
    errorResponse(res, error.message, 500);
  }
};

// @desc    Get users by role
// @route   GET /api/users/role/:role
// @access  Private/Admin
const getUsersByRole = async (req, res) => {
  try {
    const { role } = req.params;

    // Only admins can access this
    if (req.user.role !== 'admin') {
      return errorResponse(res, 'Access denied. Admin only.', 403);
    }

    // Validate role
    const validRoles = ['parent', 'therapist', 'admin'];
    if (!validRoles.includes(role)) {
      return errorResponse(res, 'Invalid role. Valid roles are: parent, therapist, admin', 400);
    }

    const result = await UserService.getUsersByRole(role);
    if (result.success) {
      successResponse(res, result.data, result.message);
    } else {
      errorResponse(res, result.message, result.statusCode);
    }
  } catch (error) {
    errorResponse(res, error.message, 500);
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getUsersByRole
};
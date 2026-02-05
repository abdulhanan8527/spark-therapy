const therapistService = require('../services/therapist.service');
const { successResponse, errorResponse } = require('../utils/responseHandler');

/**
 * Get all therapists
 * @route GET /api/therapists
 * @access Admin
 */
const getAllTherapists = async (req, res) => {
  try {
    // Only admins can view all therapists
    if (req.user.role !== 'admin') {
      return errorResponse(res, 'Access denied. Admin only.', 403);
    }

    const result = await therapistService.getAllTherapists();
    
    // Service returns {success, data, message} - extract the data
    if (result.success) {
      successResponse(res, result.data, 'Therapists retrieved successfully');
    } else {
      errorResponse(res, result.message || 'Failed to retrieve therapists', 400);
    }
  } catch (error) {
    errorResponse(res, error.message, 400);
  }
};

/**
 * Get therapist by ID
 * @route GET /api/therapists/:id
 * @access Admin
 */
const getTherapistById = async (req, res) => {
  try {
    // Only admins can view therapist details
    if (req.user.role !== 'admin') {
      return errorResponse(res, 'Access denied. Admin only.', 403);
    }

    const { id } = req.params;
    const therapist = await therapistService.getTherapistById(id);
    successResponse(res, therapist, 'Therapist retrieved successfully');
  } catch (error) {
    errorResponse(res, error.message, 404);
  }
};

/**
 * Update therapist by ID
 * @route PUT /api/therapists/:id
 * @access Admin
 */
const updateTherapist = async (req, res) => {
  try {
    // Only admins can update therapists
    if (req.user.role !== 'admin') {
      return errorResponse(res, 'Access denied. Admin only.', 403);
    }

    const { id } = req.params;
    const therapist = await therapistService.updateTherapist(id, req.body);
    successResponse(res, therapist, 'Therapist updated successfully');
  } catch (error) {
    errorResponse(res, error.message, 400);
  }
};

/**
 * Deactivate therapist
 * @route PUT /api/therapists/:id/deactivate
 * @access Admin
 */
const deactivateTherapist = async (req, res) => {
  try {
    // Only admins can deactivate therapists
    if (req.user.role !== 'admin') {
      return errorResponse(res, 'Access denied. Admin only.', 403);
    }

    const { id } = req.params;
    const therapist = await therapistService.deactivateTherapist(id);
    successResponse(res, therapist, 'Therapist deactivated successfully');
  } catch (error) {
    errorResponse(res, error.message, 400);
  }
};

/**
 * Reactivate therapist
 * @route PUT /api/therapists/:id/reactivate
 * @access Admin
 */
const reactivateTherapist = async (req, res) => {
  try {
    // Only admins can reactivate therapists
    if (req.user.role !== 'admin') {
      return errorResponse(res, 'Access denied. Admin only.', 403);
    }

    const { id } = req.params;
    const therapist = await therapistService.reactivateTherapist(id);
    successResponse(res, therapist, 'Therapist reactivated successfully');
  } catch (error) {
    errorResponse(res, error.message, 400);
  }
};

/**
 * Assign child to therapist
 * @route PUT /api/therapists/:id/assign-child/:childId
 * @access Admin
 */
const assignChildToTherapist = async (req, res) => {
  try {
    // Only admins can assign children to therapists
    if (req.user.role !== 'admin') {
      return errorResponse(res, 'Access denied. Admin only.', 403);
    }

    const { id, childId } = req.params;
    const child = await therapistService.assignChildToTherapist(childId, id);
    successResponse(res, child, 'Child assigned to therapist successfully');
  } catch (error) {
    errorResponse(res, error.message, 400);
  }
};

/**
 * Remove child from therapist
 * @route PUT /api/therapists/remove-child/:childId
 * @access Admin
 */
const removeChildFromTherapist = async (req, res) => {
  try {
    // Only admins can remove children from therapists
    if (req.user.role !== 'admin') {
      return errorResponse(res, 'Access denied. Admin only.', 403);
    }

    const { childId } = req.params;
    const child = await therapistService.removeChildFromTherapist(childId);
    successResponse(res, child, 'Child removed from therapist successfully');
  } catch (error) {
    errorResponse(res, error.message, 400);
  }
};

/**
 * Get children assigned to therapist
 * @route GET /api/therapists/:id/children
 * @access Admin, Therapist
 */
const getChildrenByTherapistId = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Therapists can only view their own children
    if (req.user.role === 'therapist' && id !== req.user._id.toString()) {
      return errorResponse(res, 'Access denied. You can only view your own children.', 403);
    }
    
    // Admins can view any therapist's children
    if (req.user.role !== 'admin' && req.user.role !== 'therapist') {
      return errorResponse(res, 'Access denied.', 403);
    }

    const children = await therapistService.getChildrenByTherapistId(id);
    successResponse(res, children, 'Therapist children retrieved successfully');
  } catch (error) {
    errorResponse(res, error.message, 400);
  }
};

/**
 * Delete therapist permanently
 * @route DELETE /api/therapists/:id
 * @access Admin
 */
const deleteTherapist = async (req, res) => {
  try {
    // Only admins can delete therapists
    if (req.user.role !== 'admin') {
      return errorResponse(res, 'Access denied. Admin only.', 403);
    }

    const { id } = req.params;
    const therapist = await therapistService.deleteTherapist(id);
    successResponse(res, therapist, 'Therapist deleted successfully');
  } catch (error) {
    errorResponse(res, error.message, 400);
  }
};

module.exports = {
  getAllTherapists,
  getTherapistById,
  updateTherapist,
  deactivateTherapist,
  reactivateTherapist,
  assignChildToTherapist,
  removeChildFromTherapist,
  getChildrenByTherapistId,
  deleteTherapist
};
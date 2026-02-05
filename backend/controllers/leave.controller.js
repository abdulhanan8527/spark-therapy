const leaveService = require('../services/leave.service');
const { successResponse, errorResponse } = require('../utils/responseHandler');

/**
 * Create a new leave request
 * @route POST /api/leave
 * @access Therapist
 */
const createLeaveRequest = async (req, res) => {
  try {
    // Only therapists can create leave requests
    if (req.user.role !== 'therapist') {
      return errorResponse(res, 'Access denied. Therapists only.', 403);
    }

    // Add therapist ID to the leave request data
    const leaveData = {
      ...req.body,
      therapistId: req.user._id
    };

    const leaveRequest = await leaveService.createLeaveRequest(leaveData);
    successResponse(res, leaveRequest, 'Leave request submitted successfully', 201);
  } catch (error) {
    errorResponse(res, error.message, 400);
  }
};

/**
 * Get all leave requests
 * @route GET /api/leave
 * @access Admin
 */
const getAllLeaveRequests = async (req, res) => {
  try {
    // Only admins can view all leave requests
    if (req.user.role !== 'admin') {
      return errorResponse(res, 'Access denied. Admin only.', 403);
    }

    const { page, limit, sortBy, sortOrder, ...filters } = req.query;
    const options = { page, limit, sortBy, sortOrder };
    
    const result = await leaveService.getAllLeaveRequests(filters, options);
    successResponse(res, result, 'Leave requests retrieved successfully');
  } catch (error) {
    errorResponse(res, error.message, 400);
  }
};

/**
 * Get leave request by ID
 * @route GET /api/leave/:id
 * @access Admin, Therapist
 */
const getLeaveRequestById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Therapists can only view their own leave requests
    if (req.user.role === 'therapist') {
      const leaveRequest = await leaveService.getLeaveRequestById(id);
      if (leaveRequest.therapistId.toString() !== req.user._id.toString()) {
        return errorResponse(res, 'Access denied. Leave request does not belong to you.', 403);
      }
      return successResponse(res, leaveRequest, 'Leave request retrieved successfully');
    }
    
    // Admins can view any leave request
    if (req.user.role === 'admin') {
      const leaveRequest = await leaveService.getLeaveRequestById(id);
      return successResponse(res, leaveRequest, 'Leave request retrieved successfully');
    }
    
    return errorResponse(res, 'Access denied.', 403);
  } catch (error) {
    errorResponse(res, error.message, 404);
  }
};

/**
 * Update leave request by ID
 * @route PUT /api/leave/:id
 * @access Admin
 */
const updateLeaveRequest = async (req, res) => {
  try {
    // Only admins can update leave requests
    if (req.user.role !== 'admin') {
      return errorResponse(res, 'Access denied. Admin only.', 403);
    }

    const { id } = req.params;
    const leaveRequest = await leaveService.updateLeaveRequest(id, req.body);
    successResponse(res, leaveRequest, 'Leave request updated successfully');
  } catch (error) {
    errorResponse(res, error.message, 400);
  }
};

/**
 * Delete leave request by ID
 * @route DELETE /api/leave/:id
 * @access Admin, Therapist
 */
const deleteLeaveRequest = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Therapists can delete their own pending leave requests
    if (req.user.role === 'therapist') {
      const leaveRequest = await leaveService.getLeaveRequestById(id);
      if (leaveRequest.therapistId.toString() !== req.user._id.toString()) {
        return errorResponse(res, 'Access denied. Leave request does not belong to you.', 403);
      }
      
      // Only allow deletion of pending requests
      if (leaveRequest.status !== 'pending') {
        return errorResponse(res, 'Cannot delete leave request that is not pending.', 400);
      }
      
      const result = await leaveService.deleteLeaveRequest(id);
      return successResponse(res, result, 'Leave request deleted successfully');
    }
    
    // Admins can delete any leave request
    if (req.user.role === 'admin') {
      const result = await leaveService.deleteLeaveRequest(id);
      return successResponse(res, result, 'Leave request deleted successfully');
    }
    
    return errorResponse(res, 'Access denied.', 403);
  } catch (error) {
    errorResponse(res, error.message, 404);
  }
};

/**
 * Get leave requests by therapist ID
 * @route GET /api/leave/therapist/:therapistId
 * @access Admin, Therapist
 */
const getLeaveRequestsByTherapistId = async (req, res) => {
  try {
    const { therapistId } = req.params;
    
    // Therapists can only view their own leave requests
    if (req.user.role === 'therapist' && therapistId !== req.user._id.toString()) {
      return errorResponse(res, 'Access denied. You can only view your own leave requests.', 403);
    }
    
    // Admins can view any therapist's leave requests
    const leaveRequests = await leaveService.getLeaveRequestsByTherapistId(therapistId);
    successResponse(res, leaveRequests, 'Therapist leave requests retrieved successfully');
  } catch (error) {
    errorResponse(res, error.message, 400);
  }
};

/**
 * Get pending leave requests
 * @route GET /api/leave/pending
 * @access Admin
 */
const getPendingLeaveRequests = async (req, res) => {
  try {
    // Only admins can view pending leave requests
    if (req.user.role !== 'admin') {
      return errorResponse(res, 'Access denied. Admin only.', 403);
    }

    const leaveRequests = await leaveService.getPendingLeaveRequests();
    successResponse(res, leaveRequests, 'Pending leave requests retrieved successfully');
  } catch (error) {
    errorResponse(res, error.message, 400);
  }
};

module.exports = {
  createLeaveRequest,
  getAllLeaveRequests,
  getLeaveRequestById,
  updateLeaveRequest,
  deleteLeaveRequest,
  getLeaveRequestsByTherapistId,
  getPendingLeaveRequests
};
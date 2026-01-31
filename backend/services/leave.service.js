const LeaveRequest = require('../models/LeaveRequest');
const User = require('../models/User');

/**
 * Create a new leave request
 * @param {Object} leaveData - Leave request data
 * @returns {Promise<Object>} Created leave request
 */
const createLeaveRequest = async (leaveData) => {
  try {
    const leaveRequest = new LeaveRequest(leaveData);
    await leaveRequest.save();
    return leaveRequest;
  } catch (error) {
    throw new Error(`Failed to create leave request: ${error.message}`);
  }
};

/**
 * Get all leave requests with optional filters
 * @param {Object} filters - Filter criteria
 * @param {Object} options - Pagination and sorting options
 * @returns {Promise<Object>} Leave requests with pagination info
 */
const getAllLeaveRequests = async (filters = {}, options = {}) => {
  try {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = -1 } = options;
    const skip = (page - 1) * limit;
    
    const leaveRequests = await LeaveRequest.find(filters)
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit)
      .populate('therapistId', 'name email');
    
    const total = await LeaveRequest.countDocuments(filters);
    
    return {
      leaveRequests,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    };
  } catch (error) {
    throw new Error(`Failed to fetch leave requests: ${error.message}`);
  }
};

/**
 * Get leave request by ID
 * @param {string} id - Leave request ID
 * @returns {Promise<Object>} Leave request document
 */
const getLeaveRequestById = async (id) => {
  try {
    const leaveRequest = await LeaveRequest.findById(id)
      .populate('therapistId', 'name email');
    
    if (!leaveRequest) {
      throw new Error('Leave request not found');
    }
    
    return leaveRequest;
  } catch (error) {
    throw new Error(`Failed to fetch leave request: ${error.message}`);
  }
};

/**
 * Update leave request by ID
 * @param {string} id - Leave request ID
 * @param {Object} updateData - Update data
 * @returns {Promise<Object>} Updated leave request
 */
const updateLeaveRequest = async (id, updateData) => {
  try {
    const leaveRequest = await LeaveRequest.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!leaveRequest) {
      throw new Error('Leave request not found');
    }
    
    return leaveRequest;
  } catch (error) {
    throw new Error(`Failed to update leave request: ${error.message}`);
  }
};

/**
 * Delete leave request by ID
 * @param {string} id - Leave request ID
 * @returns {Promise<Object>} Deletion result
 */
const deleteLeaveRequest = async (id) => {
  try {
    const leaveRequest = await LeaveRequest.findByIdAndDelete(id);
    
    if (!leaveRequest) {
      throw new Error('Leave request not found');
    }
    
    return { message: 'Leave request deleted successfully' };
  } catch (error) {
    throw new Error(`Failed to delete leave request: ${error.message}`);
  }
};

/**
 * Get leave requests by therapist ID
 * @param {string} therapistId - Therapist ID
 * @returns {Promise<Array>} Array of leave requests
 */
const getLeaveRequestsByTherapistId = async (therapistId) => {
  try {
    const leaveRequests = await LeaveRequest.find({ therapistId })
      .sort({ startDate: 1 });
    return leaveRequests;
  } catch (error) {
    throw new Error(`Failed to fetch therapist leave requests: ${error.message}`);
  }
};

/**
 * Get pending leave requests
 * @returns {Promise<Array>} Array of pending leave requests
 */
const getPendingLeaveRequests = async () => {
  try {
    const leaveRequests = await LeaveRequest.find({ status: 'pending' })
      .populate('therapistId', 'name email');
    return leaveRequests;
  } catch (error) {
    throw new Error(`Failed to fetch pending leave requests: ${error.message}`);
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
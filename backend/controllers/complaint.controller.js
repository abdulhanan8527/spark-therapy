const complaintService = require('../services/complaint.service');
const { successResponse, errorResponse } = require('../utils/responseHandler');

/**
 * Create a new complaint
 * @route POST /api/complaints
 * @access Parent
 */
const createComplaint = async (req, res) => {
  try {
    // Only parents can create complaints
    if (req.user.role !== 'parent') {
      return errorResponse(res, 'Access denied. Parents only.', 403);
    }

    // Add parent ID to the complaint data
    const complaintData = {
      ...req.body,
      parentId: req.user._id
    };

    const complaint = await complaintService.createComplaint(complaintData);
    successResponse(res, 'Complaint submitted successfully', complaint, 201);
  } catch (error) {
    errorResponse(res, error.message, 400);
  }
};

/**
 * Get all complaints
 * @route GET /api/complaints
 * @access Admin
 */
const getAllComplaints = async (req, res) => {
  try {
    // Only admins can view all complaints
    if (req.user.role !== 'admin') {
      return errorResponse(res, 'Access denied. Admin only.', 403);
    }

    const { page, limit, sortBy, sortOrder, ...filters } = req.query;
    const options = { page, limit, sortBy, sortOrder };
    
    const result = await complaintService.getAllComplaints(filters, options);
    successResponse(res, 'Complaints retrieved successfully', result);
  } catch (error) {
    errorResponse(res, error.message, 400);
  }
};

/**
 * Get complaint by ID
 * @route GET /api/complaints/:id
 * @access Admin, Parent
 */
const getComplaintById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Parents can only view their own complaints
    if (req.user.role === 'parent') {
      const complaint = await complaintService.getComplaintById(id);
      if (complaint.parentId.toString() !== req.user._id.toString()) {
        return errorResponse(res, 'Access denied. Complaint does not belong to you.', 403);
      }
      return successResponse(res, 'Complaint retrieved successfully', complaint);
    }
    
    // Admins can view any complaint
    if (req.user.role === 'admin') {
      const complaint = await complaintService.getComplaintById(id);
      return successResponse(res, 'Complaint retrieved successfully', complaint);
    }
    
    return errorResponse(res, 'Access denied.', 403);
  } catch (error) {
    errorResponse(res, error.message, 404);
  }
};

/**
 * Update complaint by ID
 * @route PUT /api/complaints/:id
 * @access Admin
 */
const updateComplaint = async (req, res) => {
  try {
    // Only admins can update complaints
    if (req.user.role !== 'admin') {
      return errorResponse(res, 'Access denied. Admin only.', 403);
    }

    const { id } = req.params;
    const complaint = await complaintService.updateComplaint(id, req.body);
    successResponse(res, 'Complaint updated successfully', complaint);
  } catch (error) {
    errorResponse(res, error.message, 400);
  }
};

/**
 * Delete complaint by ID
 * @route DELETE /api/complaints/:id
 * @access Admin, Parent
 */
const deleteComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Parents can delete their own complaints
    if (req.user.role === 'parent') {
      const complaint = await complaintService.getComplaintById(id);
      if (complaint.parentId.toString() !== req.user._id.toString()) {
        return errorResponse(res, 'Access denied. Complaint does not belong to you.', 403);
      }
      
      const result = await complaintService.deleteComplaint(id);
      return successResponse(res, 'Complaint deleted successfully', result);
    }
    
    // Admins can delete any complaint
    if (req.user.role === 'admin') {
      const result = await complaintService.deleteComplaint(id);
      return successResponse(res, 'Complaint deleted successfully', result);
    }
    
    return errorResponse(res, 'Access denied.', 403);
  } catch (error) {
    errorResponse(res, error.message, 404);
  }
};

/**
 * Get complaints by parent ID
 * @route GET /api/complaints/parent/:parentId
 * @access Admin, Parent
 */
const getComplaintsByParentId = async (req, res) => {
  try {
    const { parentId } = req.params;
    
    // Parents can only view their own complaints
    if (req.user.role === 'parent' && parentId !== req.user._id.toString()) {
      return errorResponse(res, 'Access denied. You can only view your own complaints.', 403);
    }
    
    // Admins can view any parent's complaints
    const complaints = await complaintService.getComplaintsByParentId(parentId);
    successResponse(res, 'Parent complaints retrieved successfully', complaints);
  } catch (error) {
    errorResponse(res, error.message, 400);
  }
};

/**
 * Get complaints by child ID
 * @route GET /api/complaints/child/:childId
 * @access Admin
 */
const getComplaintsByChildId = async (req, res) => {
  try {
    // Only admins can view complaints by child ID
    if (req.user.role !== 'admin') {
      return errorResponse(res, 'Access denied. Admin only.', 403);
    }

    const { childId } = req.params;
    const complaints = await complaintService.getComplaintsByChildId(childId);
    successResponse(res, 'Child complaints retrieved successfully', complaints);
  } catch (error) {
    errorResponse(res, error.message, 400);
  }
};

module.exports = {
  createComplaint,
  getAllComplaints,
  getComplaintById,
  updateComplaint,
  deleteComplaint,
  getComplaintsByParentId,
  getComplaintsByChildId
};
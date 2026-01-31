const feeService = require('../services/fee.service');
const { successResponse, errorResponse } = require('../utils/responseHandler');

/**
 * Create a new fee record
 * @route POST /api/fees
 * @access Admin
 */
const createFee = async (req, res) => {
  try {
    // Only admins can create fee records
    if (req.user.role !== 'admin') {
      return errorResponse(res, 'Access denied. Admin only.', 403);
    }

    const fee = await feeService.createFee(req.body);
    successResponse(res, 'Fee record created successfully', fee, 201);
  } catch (error) {
    errorResponse(res, error.message, 400);
  }
};

/**
 * Get all fee records
 * @route GET /api/fees
 * @access Admin
 */
const getAllFees = async (req, res) => {
  try {
    // Only admins can view all fee records
    if (req.user.role !== 'admin') {
      return errorResponse(res, 'Access denied. Admin only.', 403);
    }

    const { page, limit, sortBy, sortOrder, ...filters } = req.query;
    const options = { page, limit, sortBy, sortOrder };
    
    const result = await feeService.getAllFees(filters, options);
    successResponse(res, 'Fee records retrieved successfully', result);
  } catch (error) {
    errorResponse(res, error.message, 400);
  }
};

/**
 * Get fee record by ID
 * @route GET /api/fees/:id
 * @access Admin, Parent
 */
const getFeeById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Parents can only view their own fee records
    if (req.user.role === 'parent') {
      const fee = await feeService.getFeeById(id);
      if (fee.parentId.toString() !== req.user._id.toString()) {
        return errorResponse(res, 'Access denied. Fee record does not belong to you.', 403);
      }
      return successResponse(res, 'Fee record retrieved successfully', fee);
    }
    
    // Admins can view any fee record
    if (req.user.role === 'admin') {
      const fee = await feeService.getFeeById(id);
      return successResponse(res, 'Fee record retrieved successfully', fee);
    }
    
    return errorResponse(res, 'Access denied.', 403);
  } catch (error) {
    errorResponse(res, error.message, 404);
  }
};

/**
 * Update fee record by ID
 * @route PUT /api/fees/:id
 * @access Admin
 */
const updateFee = async (req, res) => {
  try {
    // Only admins can update fee records
    if (req.user.role !== 'admin') {
      return errorResponse(res, 'Access denied. Admin only.', 403);
    }

    const { id } = req.params;
    const fee = await feeService.updateFee(id, req.body);
    successResponse(res, 'Fee record updated successfully', fee);
  } catch (error) {
    errorResponse(res, error.message, 400);
  }
};

/**
 * Delete fee record by ID
 * @route DELETE /api/fees/:id
 * @access Admin
 */
const deleteFee = async (req, res) => {
  try {
    // Only admins can delete fee records
    if (req.user.role !== 'admin') {
      return errorResponse(res, 'Access denied. Admin only.', 403);
    }

    const { id } = req.params;
    const result = await feeService.deleteFee(id);
    successResponse(res, 'Fee record deleted successfully', result);
  } catch (error) {
    errorResponse(res, error.message, 404);
  }
};

/**
 * Get fee records by parent ID
 * @route GET /api/fees/parent/:parentId
 * @access Admin, Parent
 */
const getFeesByParentId = async (req, res) => {
  try {
    const { parentId } = req.params;
    
    // Parents can only view their own fee records
    if (req.user.role === 'parent' && parentId !== req.user._id.toString()) {
      return errorResponse(res, 'Access denied. You can only view your own fee records.', 403);
    }
    
    // Admins can view any parent's fee records
    const fees = await feeService.getFeesByParentId(parentId);
    successResponse(res, 'Parent fee records retrieved successfully', fees);
  } catch (error) {
    errorResponse(res, error.message, 400);
  }
};

/**
 * Get fee records by child ID
 * @route GET /api/fees/child/:childId
 * @access Admin
 */
const getFeesByChildId = async (req, res) => {
  try {
    // Only admins can view fee records by child ID
    if (req.user.role !== 'admin') {
      return errorResponse(res, 'Access denied. Admin only.', 403);
    }

    const { childId } = req.params;
    const fees = await feeService.getFeesByChildId(childId);
    successResponse(res, 'Child fee records retrieved successfully', fees);
  } catch (error) {
    errorResponse(res, error.message, 400);
  }
};

/**
 * Get fee summary for a parent
 * @route GET /api/fees/summary/:parentId
 * @access Admin, Parent
 */
const getParentFeeSummary = async (req, res) => {
  try {
    const { parentId } = req.params;
    
    // Parents can only view their own fee summary
    if (req.user.role === 'parent' && parentId !== req.user._id.toString()) {
      return errorResponse(res, 'Access denied. You can only view your own fee summary.', 403);
    }
    
    // Admins can view any parent's fee summary
    const summary = await feeService.getParentFeeSummary(parentId);
    successResponse(res, 'Parent fee summary retrieved successfully', summary);
  } catch (error) {
    errorResponse(res, error.message, 400);
  }
};

module.exports = {
  createFee,
  getAllFees,
  getFeeById,
  updateFee,
  deleteFee,
  getFeesByParentId,
  getFeesByChildId,
  getParentFeeSummary
};
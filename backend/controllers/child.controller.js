const ChildService = require('../services/child.service');
const { successResponse, errorResponse } = require('../utils/responseHandler');
const { isValidObjectId } = require('../utils/validation');
const { authorizeResource, verifyOwnership } = require('../middleware/rbac.middleware');

// @desc    Get all children for a parent
// @route   GET /api/children
// @access  Private (Parent, Admin)
const getChildren = async (req, res) => {
  try {
    let result;
    
    if (req.user.role === 'parent') {
      result = await ChildService.getChildrenByParent(req.user._id);
    } else if (req.user.role === 'therapist') {
      result = await ChildService.getChildrenByTherapist(req.user._id);
    } else if (req.user.role === 'admin') {
      result = await ChildService.getAllChildren();
    }
    
    if (result.success) {
      successResponse(res, result.data, result.message);
    } else {
      errorResponse(res, result.message, result.statusCode);
    }
  } catch (error) {
    errorResponse(res, error.message, 500);
  }
};

// @desc    Get child by ID
// @route   GET /api/children/:id
// @access  Private (Parent, Therapist, Admin)
const getChildById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!isValidObjectId(id)) {
      return errorResponse(res, 'Invalid child ID', 400);
    }

    const result = await ChildService.getChildById(id);
    
    if (result.success) {
      // Check if user has permission to access this child
      const child = result.data;
      if (req.user.role !== 'admin' && 
          child.parentId.toString() !== req.user._id.toString() &&
          (child.therapistId && child.therapistId.toString() !== req.user._id.toString())) {
        return errorResponse(res, 'Not authorized to access this child', 403);
      }
      
      successResponse(res, result.data, result.message);
    } else {
      errorResponse(res, result.message, result.statusCode);
    }
  } catch (error) {
    errorResponse(res, error.message, 500);
  }
};

// @desc    Create new child
// @route   POST /api/children
// @access  Private (Parent, Admin)
const createChild = async (req, res) => {
  try {
    console.log('=== BACKEND: Child creation request received ===');
    console.log('Request body:', req.body);
    console.log('User role:', req.user.role);
    console.log('User ID:', req.user._id);
    
    // Only parents and admins can create children
    if (req.user.role !== 'parent' && req.user.role !== 'admin') {
      return errorResponse(res, 'Not authorized to create child', 403);
    }

    const childData = {
      ...req.body,
      parentId: req.user.role === 'parent' ? req.user._id : req.body.parentId
    };
    
    console.log('Processed child data:', childData);

    const result = await ChildService.createChild(childData);
    
    if (result.success) {
      successResponse(res, result.data, result.message, result.statusCode);
    } else {
      errorResponse(res, result.message, result.statusCode);
    }
  } catch (error) {
    errorResponse(res, error.message, 500);
  }
};

// @desc    Update child
// @route   PUT /api/children/:id
// @access  Private (Parent, Admin)
const updateChild = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!isValidObjectId(id)) {
      return errorResponse(res, 'Invalid child ID', 400);
    }

    // Check if user has permission to update this child
    const childResult = await ChildService.getChildById(id);
    if (!childResult.success) {
      return errorResponse(res, childResult.message, childResult.statusCode);
    }
    
    const child = childResult.data;
    if (req.user.role !== 'admin' && child.parentId.toString() !== req.user._id.toString()) {
      return errorResponse(res, 'Not authorized to update this child', 403);
    }

    const result = await ChildService.updateChild(id, req.body);
    
    if (result.success) {
      successResponse(res, result.data, result.message);
    } else {
      errorResponse(res, result.message, result.statusCode);
    }
  } catch (error) {
    errorResponse(res, error.message, 500);
  }
};

// @desc    Delete child
// @route   DELETE /api/children/:id
// @access  Private (Parent, Admin)
const deleteChild = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!isValidObjectId(id)) {
      return errorResponse(res, 'Invalid child ID', 400);
    }

    // Check if user has permission to delete this child
    const childResult = await ChildService.getChildById(id);
    if (!childResult.success) {
      return errorResponse(res, childResult.message, childResult.statusCode);
    }
    
    const child = childResult.data;
    if (req.user.role !== 'admin' && child.parentId.toString() !== req.user._id.toString()) {
      return errorResponse(res, 'Not authorized to delete this child', 403);
    }

    const result = await ChildService.deleteChild(id);
    
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
  getChildren,
  getChildById,
  createChild,
  updateChild,
  deleteChild
};
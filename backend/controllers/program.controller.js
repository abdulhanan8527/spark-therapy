const ProgramService = require('../services/program.service');
const ChildService = require('../services/child.service');
const { successResponse, errorResponse } = require('../utils/responseHandler');
const { isValidObjectId } = require('../utils/validation');

// @desc    Get all programs for a child
// @route   GET /api/programs/child/:childId
// @access  Private (Therapist, Parent, Admin)
const getProgramsByChild = async (req, res) => {
  try {
    const { childId } = req.params;

    // Validate ObjectId
    if (!isValidObjectId(childId)) {
      return errorResponse(res, 'Invalid child ID', 400);
    }

    // Check if child exists and user has access
    const childResult = await ChildService.getChildById(childId);
    if (!childResult.success) {
      return errorResponse(res, childResult.message, childResult.statusCode);
    }

    const child = childResult.data;
    // Check if user has permission to access this child's programs
    if (req.user.role !== 'admin' && 
        child.parentId.toString() !== req.user._id.toString() &&
        (child.therapistId && child.therapistId.toString() !== req.user._id.toString())) {
      return errorResponse(res, 'Not authorized to access this child\'s programs', 403);
    }

    const result = await ProgramService.getProgramsByChild(childId);
    
    if (result.success) {
      successResponse(res, result.data, result.message);
    } else {
      errorResponse(res, result.message, result.statusCode);
    }
  } catch (error) {
    errorResponse(res, error.message, 500);
  }
};

// @desc    Get program by ID
// @route   GET /api/programs/:id
// @access  Private (Therapist, Parent, Admin)
const getProgramById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!isValidObjectId(id)) {
      return errorResponse(res, 'Invalid program ID', 400);
    }

    const result = await ProgramService.getProgramById(id);
    
    if (result.success) {
      const program = result.data;
      // Check if user has permission to access this program
      const childResult = await ChildService.getChildById(program.childId);
      if (!childResult.success) {
        return errorResponse(res, childResult.message, childResult.statusCode);
      }
      
      const child = childResult.data;
      if (req.user.role !== 'admin' && 
          child.parentId.toString() !== req.user._id.toString() &&
          (child.therapistId && child.therapistId.toString() !== req.user._id.toString())) {
        return errorResponse(res, 'Not authorized to access this program', 403);
      }
      
      successResponse(res, result.data, result.message);
    } else {
      errorResponse(res, result.message, result.statusCode);
    }
  } catch (error) {
    errorResponse(res, error.message, 500);
  }
};

// @desc    Create new program
// @route   POST /api/programs
// @access  Private (Therapist, Admin)
const createProgram = async (req, res) => {
  try {
    // Only therapists and admins can create programs
    if (req.user.role !== 'therapist' && req.user.role !== 'admin') {
      return errorResponse(res, 'Not authorized to create program', 403);
    }

    const { childId } = req.body;

    // Validate childId
    if (!isValidObjectId(childId)) {
      return errorResponse(res, 'Invalid child ID', 400);
    }

    // Check if child exists
    const childResult = await ChildService.getChildById(childId);
    if (!childResult.success) {
      return errorResponse(res, childResult.message, childResult.statusCode);
    }

    const child = childResult.data;
    // Check if user has permission to create program for this child
    if (req.user.role !== 'admin' && 
        (child.therapistId && child.therapistId.toString() !== req.user._id.toString())) {
      return errorResponse(res, 'Not authorized to create program for this child', 403);
    }

    const result = await ProgramService.createProgram(req.body);
    
    if (result.success) {
      successResponse(res, result.data, result.message, result.statusCode);
    } else {
      errorResponse(res, result.message, result.statusCode);
    }
  } catch (error) {
    errorResponse(res, error.message, 500);
  }
};

// @desc    Update program
// @route   PUT /api/programs/:id
// @access  Private (Therapist, Admin)
const updateProgram = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!isValidObjectId(id)) {
      return errorResponse(res, 'Invalid program ID', 400);
    }

    // Check if program exists
    const programResult = await ProgramService.getProgramById(id);
    if (!programResult.success) {
      return errorResponse(res, programResult.message, programResult.statusCode);
    }

    const program = programResult.data;
    // Check if user has permission to update this program
    const childResult = await ChildService.getChildById(program.childId);
    if (!childResult.success) {
      return errorResponse(res, childResult.message, childResult.statusCode);
    }
    
    const child = childResult.data;
    if (req.user.role !== 'admin' && 
        (child.therapistId && child.therapistId.toString() !== req.user._id.toString())) {
      return errorResponse(res, 'Not authorized to update this program', 403);
    }

    const result = await ProgramService.updateProgram(id, req.body);
    
    if (result.success) {
      successResponse(res, result.data, result.message);
    } else {
      errorResponse(res, result.message, result.statusCode);
    }
  } catch (error) {
    errorResponse(res, error.message, 500);
  }
};

// @desc    Delete program
// @route   DELETE /api/programs/:id
// @access  Private (Therapist, Admin)
const deleteProgram = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!isValidObjectId(id)) {
      return errorResponse(res, 'Invalid program ID', 400);
    }

    // Check if program exists
    const programResult = await ProgramService.getProgramById(id);
    if (!programResult.success) {
      return errorResponse(res, programResult.message, programResult.statusCode);
    }

    const program = programResult.data;
    // Check if user has permission to delete this program
    const childResult = await ChildService.getChildById(program.childId);
    if (!childResult.success) {
      return errorResponse(res, childResult.message, childResult.statusCode);
    }
    
    const child = childResult.data;
    if (req.user.role !== 'admin' && 
        (child.therapistId && child.therapistId.toString() !== req.user._id.toString())) {
      return errorResponse(res, 'Not authorized to delete this program', 403);
    }

    const result = await ProgramService.deleteProgram(id);
    
    if (result.success) {
      successResponse(res, result.data, result.message);
    } else {
      errorResponse(res, result.message, result.statusCode);
    }
  } catch (error) {
    errorResponse(res, error.message, 500);
  }
};

// @desc    Update target in program
// @route   PUT /api/programs/:id/targets/:targetId
// @access  Private (Therapist, Admin)
const updateTarget = async (req, res) => {
  try {
    const { id, targetId } = req.params;

    // Validate ObjectIds
    if (!isValidObjectId(id) || !isValidObjectId(targetId)) {
      return errorResponse(res, 'Invalid program or target ID', 400);
    }

    // Check if program exists
    const programResult = await ProgramService.getProgramById(id);
    if (!programResult.success) {
      return errorResponse(res, programResult.message, programResult.statusCode);
    }

    const program = programResult.data;
    // Check if user has permission to update this program
    const childResult = await ChildService.getChildById(program.childId);
    if (!childResult.success) {
      return errorResponse(res, childResult.message, childResult.statusCode);
    }
    
    const child = childResult.data;
    if (req.user.role !== 'admin' && 
        (child.therapistId && child.therapistId.toString() !== req.user._id.toString())) {
      return errorResponse(res, 'Not authorized to update this program', 403);
    }

    const result = await ProgramService.updateTarget(id, targetId, req.body);
    
    if (result.success) {
      successResponse(res, result.data, result.message);
    } else {
      errorResponse(res, result.message, result.statusCode);
    }
  } catch (error) {
    errorResponse(res, error.message, 500);
  }
};

// @desc    Add target to program
// @route   POST /api/programs/:id/targets
// @access  Private (Therapist, Admin)
const addProgramTarget = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!isValidObjectId(id)) {
      return errorResponse(res, 'Invalid program ID', 400);
    }

    // Check if program exists
    const programResult = await ProgramService.getProgramById(id);
    if (!programResult.success) {
      return errorResponse(res, programResult.message, programResult.statusCode);
    }

    const program = programResult.data;
    // Check if user has permission to update this program
    const childResult = await ChildService.getChildById(program.childId);
    if (!childResult.success) {
      return errorResponse(res, childResult.message, childResult.statusCode);
    }
    
    const child = childResult.data;
    if (req.user.role !== 'admin' && 
        (child.therapistId && child.therapistId.toString() !== req.user._id.toString())) {
      return errorResponse(res, 'Not authorized to update this program', 403);
    }

    const result = await ProgramService.addTarget(id, req.body);
    
    if (result.success) {
      successResponse(res, result.data, result.message);
    } else {
      errorResponse(res, result.message, result.statusCode);
    }
  } catch (error) {
    errorResponse(res, error.message, 500);
  }
};

// @desc    Remove target from program
// @route   DELETE /api/programs/:id/targets/:targetId
// @access  Private (Therapist, Admin)
const removeProgramTarget = async (req, res) => {
  try {
    const { id, targetId } = req.params;

    // Validate ObjectIds
    if (!isValidObjectId(id) || !isValidObjectId(targetId)) {
      return errorResponse(res, 'Invalid program or target ID', 400);
    }

    // Check if program exists
    const programResult = await ProgramService.getProgramById(id);
    if (!programResult.success) {
      return errorResponse(res, programResult.message, programResult.statusCode);
    }

    const program = programResult.data;
    // Check if user has permission to update this program
    const childResult = await ChildService.getChildById(program.childId);
    if (!childResult.success) {
      return errorResponse(res, childResult.message, childResult.statusCode);
    }
    
    const child = childResult.data;
    if (req.user.role !== 'admin' && 
        (child.therapistId && child.therapistId.toString() !== req.user._id.toString())) {
      return errorResponse(res, 'Not authorized to update this program', 403);
    }

    const result = await ProgramService.removeTarget(id, targetId);
    
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
  getProgramsByChild,
  getProgramById,
  createProgram,
  updateProgram,
  deleteProgram,
  updateTarget,
  addProgramTarget,
  removeProgramTarget
};
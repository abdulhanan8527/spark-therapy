const AbllsAssessment = require('../models/AbllsAssessment');
const { successResponse, errorResponse } = require('../utils/responseHandler');

// Get all ABLLS assessments
const getAllAbllsAssessments = async (req, res) => {
  try {
    const assessments = await AbllsAssessment.find()
      .populate('childId', 'firstName lastName')
      .populate('evaluatorId', 'firstName lastName email');
    
    successResponse(res, assessments, 'ABLLS assessments retrieved successfully');
  } catch (error) {
    errorResponse(res, error.message, 500);
  }
};

// Get ABLLS assessment by ID
const getAbllsAssessmentById = async (req, res) => {
  try {
    const assessment = await AbllsAssessment.findById(req.params.id)
      .populate('childId', 'firstName lastName')
      .populate('evaluatorId', 'firstName lastName email');
    
    if (!assessment) {
      return errorResponse(res, 'ABLLS assessment not found', 404);
    }
    
    successResponse(res, assessment, 'ABLLS assessment retrieved successfully');
  } catch (error) {
    errorResponse(res, error.message, 500);
  }
};

// Create ABLLS assessment
const createAbllsAssessment = async (req, res) => {
  try {
    const { childId, evaluatorId, assessmentDate, areas } = req.body;
    
    // Validate required fields
    if (!childId || !evaluatorId || !assessmentDate || !areas) {
      return errorResponse(res, 'Child ID, evaluator ID, assessment date, and areas are required', 400);
    }
    
    const newAssessment = new AbllsAssessment({
      childId,
      evaluatorId,
      assessmentDate,
      areas,
      createdBy: req.user._id
    });
    
    const savedAssessment = await newAssessment.save();
    
    successResponse(res, savedAssessment, 'ABLLS assessment created successfully', 201);
  } catch (error) {
    errorResponse(res, error.message, 500);
  }
};

// Update ABLLS assessment
const updateAbllsAssessment = async (req, res) => {
  try {
    const { assessmentDate, areas, status } = req.body;
    
    const updatedAssessment = await AbllsAssessment.findByIdAndUpdate(
      req.params.id,
      { 
        assessmentDate,
        areas,
        status,
        updatedAt: new Date(),
        updatedBy: req.user._id
      },
      { new: true, runValidators: true }
    )
    .populate('childId', 'firstName lastName')
    .populate('evaluatorId', 'firstName lastName email');
    
    if (!updatedAssessment) {
      return errorResponse(res, 'ABLLS assessment not found', 404);
    }
    
    successResponse(res, updatedAssessment, 'ABLLS assessment updated successfully');
  } catch (error) {
    errorResponse(res, error.message, 500);
  }
};

// Delete ABLLS assessment
const deleteAbllsAssessment = async (req, res) => {
  try {
    const deletedAssessment = await AbllsAssessment.findByIdAndDelete(req.params.id);
    
    if (!deletedAssessment) {
      return errorResponse(res, 'ABLLS assessment not found', 404);
    }
    
    successResponse(res, deletedAssessment, 'ABLLS assessment deleted successfully');
  } catch (error) {
    errorResponse(res, error.message, 500);
  }
};

// Get ABLLS assessments by child ID
const getAbllsAssessmentsByChild = async (req, res) => {
  try {
    const { childId } = req.params;
    
    const assessments = await AbllsAssessment.find({ childId })
      .populate('childId', 'firstName lastName')
      .populate('evaluatorId', 'firstName lastName email')
      .sort({ createdAt: -1 });
    
    successResponse(res, assessments, 'Child ABLLS assessments retrieved successfully');
  } catch (error) {
    errorResponse(res, error.message, 500);
  }
};

module.exports = {
  getAllAbllsAssessments,
  getAbllsAssessmentById,
  createAbllsAssessment,
  updateAbllsAssessment,
  deleteAbllsAssessment,
  getAbllsAssessmentsByChild
};
const Feedback = require('../models/Feedback');
const Session = require('../models/Session');
const Child = require('../models/Child');
const { successResponse, errorResponse } = require('../utils/responseHandler');
const { isValidObjectId } = require('../utils/validation');

// @desc    Get all feedback for a child
// @route   GET /api/feedback/child/:childId
// @access  Private (Parent, Therapist, Admin)
const getFeedbackByChild = async (req, res) => {
  try {
    const { childId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    // Validate ObjectId
    if (!isValidObjectId(childId)) {
      return errorResponse(res, 'Invalid child ID', 400);
    }

    // Check if child exists and user has access
    const child = await Child.findById(childId);
    if (!child) {
      return errorResponse(res, 'Child not found', 404);
    }

    // Check if user has permission to access this child's feedback
    if (req.user.role !== 'admin' && 
        child.parentId.toString() !== req.user._id.toString() &&
        (child.therapistId && child.therapistId.toString() !== req.user._id.toString())) {
      return errorResponse(res, 'Not authorized to access this child\'s feedback', 403);
    }

    const feedback = await Feedback.find({ childId })
      .populate('therapistId', 'name email')
      .populate('sessionId', 'startTime endTime')
      .sort({ date: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Feedback.countDocuments({ childId });

    return successResponse(res, {
      feedback,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    }, 'Feedback retrieved successfully');
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

// @desc    Get feedback by ID
// @route   GET /api/feedback/:id
// @access  Private (Parent, Therapist, Admin)
const getFeedbackById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!isValidObjectId(id)) {
      return errorResponse(res, 'Invalid feedback ID', 400);
    }

    const feedback = await Feedback.findById(id)
      .populate('therapistId', 'name email')
      .populate('sessionId', 'startTime endTime');

    if (!feedback) {
      return errorResponse(res, 'Feedback not found', 404);
    }

    // Check if user has permission to access this feedback
    const child = await Child.findById(feedback.childId);
    if (!child) {
      return errorResponse(res, 'Associated child not found', 404);
    }

    if (req.user.role !== 'admin' && 
        child.parentId.toString() !== req.user._id.toString() &&
        (child.therapistId && child.therapistId.toString() !== req.user._id.toString())) {
      return errorResponse(res, 'Not authorized to access this feedback', 403);
    }

    return successResponse(res, feedback, 'Feedback retrieved successfully');
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

// @desc    Create new feedback
// @route   POST /api/feedback
// @access  Private (Therapist, Admin)
const createFeedback = async (req, res) => {
  try {
    const { sessionId, childId, date, mood, activities, achievements, 
            challenges, recommendations, notes } = req.body;

    // Only therapists and admins can create feedback
    if (req.user.role !== 'therapist' && req.user.role !== 'admin') {
      return errorResponse(res, 'Not authorized to create feedback', 403);
    }

    // Validate required fields
    if (!childId || !mood) {
      return errorResponse(res, 'Missing required fields', 400);
    }

    // Validate ObjectIds
    if (!isValidObjectId(childId)) {
      return errorResponse(res, 'Invalid child ID', 400);
    }

    if (sessionId && !isValidObjectId(sessionId)) {
      return errorResponse(res, 'Invalid session ID', 400);
    }

    // Check if child exists
    const child = await Child.findById(childId);
    if (!child) {
      return errorResponse(res, 'Child not found', 404);
    }

    // Check if session exists (if provided)
    let session = null;
    if (sessionId) {
      session = await Session.findById(sessionId);
      if (!session) {
        return errorResponse(res, 'Session not found', 404);
      }
    }

    // Check if user has permission to create feedback for this child
    if (req.user.role === 'therapist' && 
        child.therapistId.toString() !== req.user._id.toString()) {
      return errorResponse(res, 'Not authorized to create feedback for this child', 403);
    }

    const feedback = new Feedback({
      sessionId: sessionId || undefined,
      childId,
      therapistId: req.user._id,
      parentId: child.parentId,
      date: date ? new Date(date) : new Date(),
      mood,
      activities: activities || [],
      achievements: achievements || [],
      challenges: challenges || [],
      recommendations: recommendations || [],
      notes: notes || ''
    });

    const createdFeedback = await feedback.save();
    
    // Populate references
    await createdFeedback.populate('therapistId', 'name email');
    await createdFeedback.populate('sessionId', 'startTime endTime');

    return successResponse(res, createdFeedback, 'Feedback created successfully', 201);
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

// @desc    Update feedback
// @route   PUT /api/feedback/:id
// @access  Private (Therapist, Admin)
const updateFeedback = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!isValidObjectId(id)) {
      return errorResponse(res, 'Invalid feedback ID', 400);
    }

    const feedback = await Feedback.findById(id);

    if (!feedback) {
      return errorResponse(res, 'Feedback not found', 404);
    }

    // Check if user has permission to update this feedback
    if (req.user.role === 'therapist' && 
        feedback.therapistId.toString() !== req.user._id.toString()) {
      return errorResponse(res, 'Not authorized to update this feedback', 403);
    }

    const { mood, activities, achievements, challenges, recommendations, notes } = req.body;

    feedback.mood = mood || feedback.mood;
    feedback.activities = activities || feedback.activities;
    feedback.achievements = achievements || feedback.achievements;
    feedback.challenges = challenges || feedback.challenges;
    feedback.recommendations = recommendations || feedback.recommendations;
    feedback.notes = notes || feedback.notes;

    const updatedFeedback = await feedback.save();
    
    // Populate references
    await updatedFeedback.populate('therapistId', 'name email');
    await updatedFeedback.populate('sessionId', 'startTime endTime');

    return successResponse(res, updatedFeedback, 'Feedback updated successfully');
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

// @desc    Delete feedback
// @route   DELETE /api/feedback/:id
// @access  Private (Therapist, Admin)
const deleteFeedback = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!isValidObjectId(id)) {
      return errorResponse(res, 'Invalid feedback ID', 400);
    }

    const feedback = await Feedback.findById(id);

    if (!feedback) {
      return errorResponse(res, 'Feedback not found', 404);
    }

    // Check if user has permission to delete this feedback
    if (req.user.role === 'therapist' && 
        feedback.therapistId.toString() !== req.user._id.toString()) {
      return errorResponse(res, 'Not authorized to delete this feedback', 403);
    }

    await feedback.remove();
    return successResponse(res, {}, 'Feedback deleted successfully');
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

module.exports = {
  getFeedbackByChild,
  getFeedbackById,
  createFeedback,
  updateFeedback,
  deleteFeedback
};
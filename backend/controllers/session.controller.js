const Session = require('../models/Session');
const Child = require('../models/Child');
const User = require('../models/User');
const { successResponse, errorResponse } = require('../utils/responseHandler');
const { isValidObjectId } = require('../utils/validation');

// @desc    Get all sessions for a user
// @route   GET /api/sessions
// @access  Private (Therapist, Parent, Admin)
const getSessions = async (req, res) => {
  try {
    let query = {};

    // Filter by user role
    if (req.user.role === 'therapist') {
      query.therapistId = req.user._id;
    } else if (req.user.role === 'parent') {
      query.parentId = req.user._id;
    } else if (req.user.role === 'admin' && req.query.userId) {
      query.$or = [
        { therapistId: req.query.userId },
        { parentId: req.query.userId }
      ];
    }

    // Filter by child if specified
    if (req.query.childId) {
      if (!isValidObjectId(req.query.childId)) {
        return errorResponse(res, 'Invalid child ID', 400);
      }
      query.childId = req.query.childId;
    }

    // Filter by date range if specified
    if (req.query.startDate || req.query.endDate) {
      query.startTime = {};
      if (req.query.startDate) {
        query.startTime.$gte = new Date(req.query.startDate);
      }
      if (req.query.endDate) {
        query.startTime.$lte = new Date(req.query.endDate);
      }
    }

    const sessions = await Session.find(query)
      .populate('therapistId', 'name email')
      .populate('childId', 'firstName lastName')
      .populate('parentId', 'name email')
      .sort({ startTime: 1 });

    return successResponse(res, sessions, 'Sessions retrieved successfully');
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

// @desc    Get session by ID
// @route   GET /api/sessions/:id
// @access  Private (Therapist, Parent, Admin)
const getSessionById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!isValidObjectId(id)) {
      return errorResponse(res, 'Invalid session ID', 400);
    }

    const session = await Session.findById(id)
      .populate('therapistId', 'name email')
      .populate('childId', 'firstName lastName')
      .populate('parentId', 'name email');

    if (!session) {
      return errorResponse(res, 'Session not found', 404);
    }

    // Check if user has permission to access this session
    if (req.user.role !== 'admin' && 
        session.therapistId._id.toString() !== req.user._id.toString() &&
        session.parentId._id.toString() !== req.user._id.toString()) {
      return errorResponse(res, 'Not authorized to access this session', 403);
    }

    return successResponse(res, session, 'Session retrieved successfully');
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

// @desc    Create new session
// @route   POST /api/sessions
// @access  Private (Therapist, Admin)
const createSession = async (req, res) => {
  try {
    const { childId, parentId, startTime, endTime, duration, notes, 
            isRecurring, recurrencePattern, recurrenceEndDate } = req.body;

    // Only therapists and admins can create sessions
    if (req.user.role !== 'therapist' && req.user.role !== 'admin') {
      return errorResponse(res, 'Not authorized to create session', 403);
    }

    // Validate required fields
    if (!childId || !parentId || !startTime || !endTime || !duration) {
      return errorResponse(res, 'Missing required fields', 400);
    }

    // Validate ObjectIds
    if (!isValidObjectId(childId) || !isValidObjectId(parentId)) {
      return errorResponse(res, 'Invalid child or parent ID', 400);
    }

    // Check if child and parent exist
    const child = await Child.findById(childId);
    const parent = await User.findById(parentId);
    
    if (!child) {
      return errorResponse(res, 'Child not found', 404);
    }
    
    if (!parent || parent.role !== 'parent') {
      return errorResponse(res, 'Parent not found', 404);
    }

    // Check if user has permission to create session for this child
    if (req.user.role === 'therapist' && 
        child.therapistId.toString() !== req.user._id.toString()) {
      return errorResponse(res, 'Not authorized to create session for this child', 403);
    }

    const session = new Session({
      therapistId: req.user.role === 'therapist' ? req.user._id : req.body.therapistId,
      childId,
      parentId,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      duration,
      notes,
      isRecurring,
      recurrencePattern: isRecurring ? recurrencePattern : undefined,
      recurrenceEndDate: isRecurring ? new Date(recurrenceEndDate) : undefined
    });

    // Check for conflicts (simplified version)
    const conflict = await Session.findOne({
      therapistId: session.therapistId,
      startTime: { $lt: session.endTime },
      endTime: { $gt: session.startTime }
    });

    if (conflict) {
      session.hasConflict = true;
    }

    const createdSession = await session.save();
    
    // Populate references
    await createdSession.populate('therapistId', 'name email');
    await createdSession.populate('childId', 'firstName lastName');
    await createdSession.populate('parentId', 'name email');

    return successResponse(res, createdSession, 'Session created successfully', 201);
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

// @desc    Update session
// @route   PUT /api/sessions/:id
// @access  Private (Therapist, Admin)
const updateSession = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!isValidObjectId(id)) {
      return errorResponse(res, 'Invalid session ID', 400);
    }

    const session = await Session.findById(id);

    if (!session) {
      return errorResponse(res, 'Session not found', 404);
    }

    // Check if user has permission to update this session
    if (req.user.role === 'therapist' && 
        session.therapistId.toString() !== req.user._id.toString()) {
      return errorResponse(res, 'Not authorized to update this session', 403);
    }

    const { startTime, endTime, duration, status, notes, hasConflict } = req.body;

    session.startTime = startTime ? new Date(startTime) : session.startTime;
    session.endTime = endTime ? new Date(endTime) : session.endTime;
    session.duration = duration || session.duration;
    session.status = status || session.status;
    session.notes = notes || session.notes;
    session.hasConflict = hasConflict !== undefined ? hasConflict : session.hasConflict;

    // Recheck for conflicts if time changed
    if (startTime || endTime) {
      const conflict = await Session.findOne({
        _id: { $ne: session._id },
        therapistId: session.therapistId,
        startTime: { $lt: session.endTime },
        endTime: { $gt: session.startTime }
      });

      session.hasConflict = !!conflict;
    }

    const updatedSession = await session.save();
    
    // Populate references
    await updatedSession.populate('therapistId', 'name email');
    await updatedSession.populate('childId', 'firstName lastName');
    await updatedSession.populate('parentId', 'name email');

    return successResponse(res, updatedSession, 'Session updated successfully');
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

// @desc    Delete session
// @route   DELETE /api/sessions/:id
// @access  Private (Therapist, Admin)
const deleteSession = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!isValidObjectId(id)) {
      return errorResponse(res, 'Invalid session ID', 400);
    }

    const session = await Session.findById(id);

    if (!session) {
      return errorResponse(res, 'Session not found', 404);
    }

    // Check if user has permission to delete this session
    if (req.user.role === 'therapist' && 
        session.therapistId.toString() !== req.user._id.toString()) {
      return errorResponse(res, 'Not authorized to delete this session', 403);
    }

    await session.deleteOne();
    return successResponse(res, {}, 'Session deleted successfully');
  } catch (error) {
    console.error('Error deleting session:', {
      error: error.message,
      stack: error.stack,
      sessionId: req.params.id,
      userId: req.user?._id,
      userRole: req.user?.role
    });
    return errorResponse(res, error.message);
  }
};

// @desc    Get therapist availability
// @route   GET /api/sessions/availability/:therapistId
// @access  Private (Admin, Parent)
const getTherapistAvailability = async (req, res) => {
  try {
    const { therapistId } = req.params;
    const { date } = req.query;

    // Validate ObjectId
    if (!isValidObjectId(therapistId)) {
      return errorResponse(res, 'Invalid therapist ID', 400);
    }

    // Check if therapist exists
    const therapist = await User.findById(therapistId);
    if (!therapist || therapist.role !== 'therapist') {
      return errorResponse(res, 'Therapist not found', 404);
    }

    // Only admins and parents can check therapist availability
    if (req.user.role !== 'admin' && req.user.role !== 'parent') {
      return errorResponse(res, 'Not authorized to check therapist availability', 403);
    }

    // Get existing sessions for the therapist on the specified date
    const startDate = date ? new Date(date) : new Date();
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 1);

    const sessions = await Session.find({
      therapistId,
      startTime: { $gte: startDate, $lt: endDate },
      status: { $ne: 'cancelled' }
    }).select('startTime endTime');

    return successResponse(res, { 
      therapistId, 
      date: startDate, 
      sessions 
    }, 'Availability retrieved successfully');
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

module.exports = {
  getSessions,
  getSessionById,
  createSession,
  updateSession,
  deleteSession,
  getTherapistAvailability
};
const Session = require('../models/Session');

// Get all sessions
const getAllSessions = async () => {
  try {
    const sessions = await Session.find({})
      .populate('childId', 'firstName lastName')
      .populate('therapistId', 'firstName lastName email')
      .populate('programId', 'name')
      .sort({ startTime: -1 });

    return {
      success: true,
      data: sessions,
      message: 'Sessions retrieved successfully'
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
      data: []
    };
  }
};

// Get session by ID
const getSessionById = async (sessionId) => {
  try {
    const session = await Session.findById(sessionId)
      .populate('childId', 'firstName lastName')
      .populate('therapistId', 'firstName lastName email')
      .populate('programId', 'name');

    if (!session) {
      return {
        success: false,
        message: 'Session not found',
        data: null
      };
    }

    return {
      success: true,
      data: session,
      message: 'Session retrieved successfully'
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
      data: null
    };
  }
};

// Create session
const createSession = async (sessionData) => {
  try {
    const session = new Session(sessionData);
    await session.save();

    return {
      success: true,
      data: session,
      message: 'Session created successfully'
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
      data: null
    };
  }
};

// Update session
const updateSession = async (sessionId, sessionData) => {
  try {
    const session = await Session.findByIdAndUpdate(
      sessionId,
      sessionData,
      { new: true, runValidators: true }
    );

    if (!session) {
      return {
        success: false,
        message: 'Session not found',
        data: null
      };
    }

    return {
      success: true,
      data: session,
      message: 'Session updated successfully'
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
      data: null
    };
  }
};

// Delete session
const deleteSession = async (sessionId) => {
  try {
    const session = await Session.findByIdAndDelete(sessionId);

    if (!session) {
      return {
        success: false,
        message: 'Session not found',
        data: null
      };
    }

    return {
      success: true,
      data: session,
      message: 'Session deleted successfully'
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
      data: null
    };
  }
};

module.exports = {
  getAllSessions,
  getSessionById,
  createSession,
  updateSession,
  deleteSession
};
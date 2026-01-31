const Feedback = require('../models/Feedback');

// Get all feedback
const getAllFeedback = async () => {
  try {
    const feedbacks = await Feedback.find({})
      .populate('childId', 'firstName lastName')
      .populate('parentId', 'firstName lastName email')
      .populate('therapistId', 'firstName lastName email')
      .sort({ createdAt: -1 });

    return {
      success: true,
      data: feedbacks,
      message: 'Feedbacks retrieved successfully'
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
      data: []
    };
  }
};

// Get feedback by ID
const getFeedbackById = async (feedbackId) => {
  try {
    const feedback = await Feedback.findById(feedbackId)
      .populate('childId', 'firstName lastName')
      .populate('parentId', 'firstName lastName email')
      .populate('therapistId', 'firstName lastName email');

    if (!feedback) {
      return {
        success: false,
        message: 'Feedback not found',
        data: null
      };
    }

    return {
      success: true,
      data: feedback,
      message: 'Feedback retrieved successfully'
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
      data: null
    };
  }
};

// Create feedback
const createFeedback = async (feedbackData) => {
  try {
    const feedback = new Feedback(feedbackData);
    await feedback.save();

    return {
      success: true,
      data: feedback,
      message: 'Feedback created successfully'
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
      data: null
    };
  }
};

// Update feedback
const updateFeedback = async (feedbackId, feedbackData) => {
  try {
    const feedback = await Feedback.findByIdAndUpdate(
      feedbackId,
      feedbackData,
      { new: true, runValidators: true }
    );

    if (!feedback) {
      return {
        success: false,
        message: 'Feedback not found',
        data: null
      };
    }

    return {
      success: true,
      data: feedback,
      message: 'Feedback updated successfully'
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
      data: null
    };
  }
};

// Delete feedback
const deleteFeedback = async (feedbackId) => {
  try {
    const feedback = await Feedback.findByIdAndDelete(feedbackId);

    if (!feedback) {
      return {
        success: false,
        message: 'Feedback not found',
        data: null
      };
    }

    return {
      success: true,
      data: feedback,
      message: 'Feedback deleted successfully'
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
  getAllFeedback,
  getFeedbackById,
  createFeedback,
  updateFeedback,
  deleteFeedback
};
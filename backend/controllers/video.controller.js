const Video = require('../models/Video');
const Child = require('../models/Child');
const User = require('../models/User');
const { successResponse, errorResponse } = require('../utils/responseHandler');

/**
 * Get videos by therapist
 * @route GET /api/videos
 * @access Therapist, Admin
 */
const getVideosByTherapist = async (req, res) => {
  try {
    // Only return videos created by the authenticated therapist
    const videos = await Video.find({ therapistId: req.user._id })
      .populate('childId', 'name')
      .sort({ dateRecorded: -1 });

    successResponse(res, 'Videos retrieved successfully', videos);
  } catch (error) {
    errorResponse(res, error.message, 500);
  }
};

/**
 * Get videos by child
 * @route GET /api/videos/child/:childId
 * @access Therapist, Admin
 */
const getVideosByChild = async (req, res) => {
  try {
    const { childId } = req.params;
    
    // Verify child belongs to therapist or user is admin
    const videoFilter = {
      childId,
      ...(req.user.role !== 'admin' && { therapistId: req.user._id })
    };

    const videos = await Video.find(videoFilter)
      .populate('childId', 'name')
      .populate('therapistId', 'name')
      .sort({ dateRecorded: -1 });

    successResponse(res, 'Videos retrieved successfully', videos);
  } catch (error) {
    errorResponse(res, error.message, 500);
  }
};

/**
 * Get video by ID
 * @route GET /api/videos/:id
 * @access Therapist, Admin
 */
const getVideoById = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id)
      .populate('childId', 'name')
      .populate('therapistId', 'name');

    if (!video) {
      return errorResponse(res, 'Video not found', 404);
    }

    // Check if user has permission to view the video
    if (req.user.role !== 'admin' && video.therapistId.toString() !== req.user._id.toString()) {
      return errorResponse(res, 'Access denied', 403);
    }

    successResponse(res, 'Video retrieved successfully', video);
  } catch (error) {
    errorResponse(res, error.message, 500);
  }
};

/**
 * Create video
 * @route POST /api/videos
 * @access Therapist
 */
const createVideo = async (req, res) => {
  try {
    const { childId, title, description, videoUrl, weekNumber, year } = req.body;

    // Validate required fields
    if (!childId || !title || !videoUrl || !weekNumber || !year) {
      return errorResponse(res, 'Child ID, title, video URL, week number, and year are required', 400);
    }

    // Verify child exists and belongs to therapist
    const child = await Child.findById(childId);
    if (!child) {
      return errorResponse(res, 'Child not found', 404);
    }

    // For therapists, ensure they are assigned to this child
    if (req.user.role === 'therapist' && child.therapistId.toString() !== req.user._id.toString()) {
      return errorResponse(res, 'You can only create videos for children assigned to you', 403);
    }

    // Create video
    const video = await Video.create({
      childId,
      therapistId: req.user._id,
      title,
      description,
      videoUrl,
      weekNumber,
      year
    });

    successResponse(res, 'Video created successfully', video, 201);
  } catch (error) {
    errorResponse(res, error.message, 500);
  }
};

/**
 * Update video
 * @route PUT /api/videos/:id
 * @access Therapist
 */
const updateVideo = async (req, res) => {
  try {
    const { title, description, status } = req.body;

    const video = await Video.findById(req.params.id);

    if (!video) {
      return errorResponse(res, 'Video not found', 404);
    }

    // Check if user has permission to update the video
    if (req.user.role !== 'admin' && video.therapistId.toString() !== req.user._id.toString()) {
      return errorResponse(res, 'Access denied', 403);
    }

    // Update allowed fields
    if (title) video.title = title;
    if (description) video.description = description;
    
    // Only admin can update status
    if (req.user.role === 'admin' && status) {
      video.status = status;
      if (status !== 'pending') {
        video.reviewedAt = Date.now();
        video.reviewedBy = req.user._id;
      }
    }

    await video.save();

    successResponse(res, 'Video updated successfully', video);
  } catch (error) {
    errorResponse(res, error.message, 500);
  }
};

/**
 * Delete video
 * @route DELETE /api/videos/:id
 * @access Therapist, Admin
 */
const deleteVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);

    if (!video) {
      return errorResponse(res, 'Video not found', 404);
    }

    // Check if user has permission to delete the video
    if (req.user.role !== 'admin' && video.therapistId.toString() !== req.user._id.toString()) {
      return errorResponse(res, 'Access denied', 403);
    }

    await Video.findByIdAndDelete(req.params.id);

    successResponse(res, 'Video deleted successfully', {});
  } catch (error) {
    errorResponse(res, error.message, 500);
  }
};

/**
 * Approve video
 * @route PUT /api/videos/:id/approve
 * @access Admin
 */
const approveVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);

    if (!video) {
      return errorResponse(res, 'Video not found', 404);
    }

    video.status = 'approved';
    video.reviewedAt = Date.now();
    video.reviewedBy = req.user._id;

    await video.save();

    successResponse(res, 'Video approved successfully', video);
  } catch (error) {
    errorResponse(res, error.message, 500);
  }
};

/**
 * Reject video
 * @route PUT /api/videos/:id/reject
 * @access Admin
 */
const rejectVideo = async (req, res) => {
  try {
    const { rejectionReason } = req.body;
    const video = await Video.findById(req.params.id);

    if (!video) {
      return errorResponse(res, 'Video not found', 404);
    }

    video.status = 'rejected';
    video.rejectionReason = rejectionReason;
    video.reviewedAt = Date.now();
    video.reviewedBy = req.user._id;

    await video.save();

    successResponse(res, 'Video rejected successfully', video);
  } catch (error) {
    errorResponse(res, error.message, 500);
  }
};

module.exports = {
  getVideosByTherapist,
  getVideoById,
  createVideo,
  updateVideo,
  deleteVideo,
  getVideosByChild,
  approveVideo,
  rejectVideo
};
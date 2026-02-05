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
      .populate('childId', 'firstName lastName')
      .sort({ dateRecorded: -1 });

    successResponse(res, videos, 'Videos retrieved successfully');
  } catch (error) {
    errorResponse(res, error.message, 500);
  }
};

/**
 * Get videos by child
 * @route GET /api/videos/child/:childId
 * @access Therapist, Admin, Parent
 */
const getVideosByChild = async (req, res) => {
  try {
    const { childId } = req.params;
    
    // Build filter based on user role
    let videoFilter = { childId };
    
    if (req.user.role === 'therapist') {
      // Therapists can only see their own videos
      videoFilter.therapistId = req.user._id;
    } else if (req.user.role === 'parent') {
      // Parents can see all videos for their children
      // Verify parent owns this child
      const child = await Child.findById(childId);
      if (!child || child.parentId.toString() !== req.user._id.toString()) {
        return errorResponse(res, 'Access denied', 403);
      }
    }
    // Admin can see all videos

    const videos = await Video.find(videoFilter)
      .populate('childId', 'firstName lastName')
      .populate('therapistId', 'name')
      .sort({ dateRecorded: -1 });

    successResponse(res, videos, 'Videos retrieved successfully');
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
      .populate('childId', 'firstName lastName')
      .populate('therapistId', 'name');

    if (!video) {
      return errorResponse(res, 'Video not found', 404);
    }

    // Check if user has permission to view the video
    if (req.user.role !== 'admin' && video.therapistId.toString() !== req.user._id.toString()) {
      return errorResponse(res, 'Access denied', 403);
    }

    successResponse(res, video, 'Video retrieved successfully');
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
    const { childId, title, description, weekNumber, year } = req.body;

    // Check if file was uploaded
    if (!req.file) {
      return errorResponse(res, 'Video file is required', 400);
    }

    // Get video URL from Cloudinary
    const videoUrl = req.file.path;

    // Validate required fields
    if (!childId || !title || !weekNumber || !year) {
      return errorResponse(res, 'Child ID, title, week number, and year are required', 400);
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

    // Create video with Cloudinary URL
    const video = await Video.create({
      childId,
      therapistId: req.user._id,
      title,
      description,
      videoUrl, // This is now the Cloudinary URL
      weekNumber,
      year
    });

    successResponse(res, video, 'Video created successfully', 201);
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

    successResponse(res, video, 'Video updated successfully');
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

    successResponse(res, {}, 'Video deleted successfully');
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

    successResponse(res, video, 'Video approved successfully');
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

    successResponse(res, video, 'Video rejected successfully');
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
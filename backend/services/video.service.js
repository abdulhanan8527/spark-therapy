const Video = require('../models/Video');
const Child = require('../models/Child');
const User = require('../models/User');

class VideoService {
  /**
   * Get videos by therapist
   * @param {string} therapistId - Therapist ID
   * @returns {Promise<Array>} Array of videos
   */
  static async getVideosByTherapist(therapistId) {
    try {
      const videos = await Video.find({ therapistId })
        .populate('childId', 'name')
        .sort({ dateRecorded: -1 });
      
      return videos;
    } catch (error) {
      throw new Error(`Failed to fetch videos: ${error.message}`);
    }
  }

  /**
   * Get videos by child
   * @param {string} childId - Child ID
   * @param {string} therapistId - Therapist ID (for authorization)
   * @param {string} userRole - User role (for authorization)
   * @returns {Promise<Array>} Array of videos
   */
  static async getVideosByChild(childId, therapistId, userRole) {
    try {
      const videoFilter = {
        childId,
        ...(userRole !== 'admin' && { therapistId })
      };

      const videos = await Video.find(videoFilter)
        .populate('childId', 'name')
        .populate('therapistId', 'name')
        .sort({ dateRecorded: -1 });
      
      return videos;
    } catch (error) {
      throw new Error(`Failed to fetch videos: ${error.message}`);
    }
  }

  /**
   * Get video by ID
   * @param {string} videoId - Video ID
   * @param {string} userId - User ID (for authorization)
   * @param {string} userRole - User role (for authorization)
   * @returns {Promise<Object>} Video document
   */
  static async getVideoById(videoId, userId, userRole) {
    try {
      const video = await Video.findById(videoId)
        .populate('childId', 'name')
        .populate('therapistId', 'name');
      
      if (!video) {
        throw new Error('Video not found');
      }

      // Check if user has permission to view the video
      if (userRole !== 'admin' && video.therapistId.toString() !== userId.toString()) {
        throw new Error('Access denied');
      }

      return video;
    } catch (error) {
      throw new Error(`Failed to fetch video: ${error.message}`);
    }
  }

  /**
   * Create video
   * @param {Object} videoData - Video data
   * @param {string} therapistId - Therapist ID
   * @returns {Promise<Object>} Created video
   */
  static async createVideo(videoData, therapistId) {
    try {
      const { childId, title, description, videoUrl, weekNumber, year } = videoData;

      // Validate required fields
      if (!childId || !title || !videoUrl || !weekNumber || !year) {
        throw new Error('Child ID, title, video URL, week number, and year are required');
      }

      // Verify child exists and belongs to therapist
      const child = await Child.findById(childId);
      if (!child) {
        throw new Error('Child not found');
      }

      // For therapists, ensure they are assigned to this child
      if (child.therapistId.toString() !== therapistId.toString()) {
        throw new Error('You can only create videos for children assigned to you');
      }

      // Create video
      const video = await Video.create({
        childId,
        therapistId,
        title,
        description,
        videoUrl,
        weekNumber,
        year
      });

      return video;
    } catch (error) {
      throw new Error(`Failed to create video: ${error.message}`);
    }
  }

  /**
   * Update video
   * @param {string} videoId - Video ID
   * @param {Object} updateData - Update data
   * @param {string} userId - User ID (for authorization)
   * @param {string} userRole - User role (for authorization)
   * @returns {Promise<Object>} Updated video
   */
  static async updateVideo(videoId, updateData, userId, userRole) {
    try {
      const { title, description, status } = updateData;

      const video = await Video.findById(videoId);

      if (!video) {
        throw new Error('Video not found');
      }

      // Check if user has permission to update the video
      if (userRole !== 'admin' && video.therapistId.toString() !== userId.toString()) {
        throw new Error('Access denied');
      }

      // Update allowed fields
      if (title) video.title = title;
      if (description) video.description = description;
      
      // Only admin can update status
      if (userRole === 'admin' && status) {
        video.status = status;
        if (status !== 'pending') {
          video.reviewedAt = Date.now();
          video.reviewedBy = userId;
        }
      }

      await video.save();

      return video;
    } catch (error) {
      throw new Error(`Failed to update video: ${error.message}`);
    }
  }

  /**
   * Delete video
   * @param {string} videoId - Video ID
   * @param {string} userId - User ID (for authorization)
   * @param {string} userRole - User role (for authorization)
   * @returns {Promise<Object>} Deletion result
   */
  static async deleteVideo(videoId, userId, userRole) {
    try {
      const video = await Video.findById(videoId);

      if (!video) {
        throw new Error('Video not found');
      }

      // Check if user has permission to delete the video
      if (userRole !== 'admin' && video.therapistId.toString() !== userId.toString()) {
        throw new Error('Access denied');
      }

      await Video.findByIdAndDelete(videoId);

      return { success: true };
    } catch (error) {
      throw new Error(`Failed to delete video: ${error.message}`);
    }
  }

  /**
   * Approve video
   * @param {string} videoId - Video ID
   * @param {string} adminId - Admin ID
   * @returns {Promise<Object>} Updated video
   */
  static async approveVideo(videoId, adminId) {
    try {
      const video = await Video.findById(videoId);

      if (!video) {
        throw new Error('Video not found');
      }

      video.status = 'approved';
      video.reviewedAt = Date.now();
      video.reviewedBy = adminId;

      await video.save();

      return video;
    } catch (error) {
      throw new Error(`Failed to approve video: ${error.message}`);
    }
  }

  /**
   * Reject video
   * @param {string} videoId - Video ID
   * @param {string} adminId - Admin ID
   * @param {string} rejectionReason - Rejection reason
   * @returns {Promise<Object>} Updated video
   */
  static async rejectVideo(videoId, adminId, rejectionReason) {
    try {
      const video = await Video.findById(videoId);

      if (!video) {
        throw new Error('Video not found');
      }

      video.status = 'rejected';
      video.rejectionReason = rejectionReason;
      video.reviewedAt = Date.now();
      video.reviewedBy = adminId;

      await video.save();

      return video;
    } catch (error) {
      throw new Error(`Failed to reject video: ${error.message}`);
    }
  }
}

module.exports = VideoService;
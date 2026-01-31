const express = require('express');
const router = express.Router();
const {
  getVideosByTherapist,
  getVideoById,
  createVideo,
  updateVideo,
  deleteVideo,
  getVideosByChild,
  approveVideo,
  rejectVideo
} = require('../controllers/video.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

// All routes are protected
router.use(protect);

// Therapist and admin routes
router.get('/', getVideosByTherapist);
router.get('/child/:childId', getVideosByChild);
router.get('/:id', getVideoById);
router.post('/', createVideo);
router.put('/:id', updateVideo);
router.delete('/:id', deleteVideo);

// Admin only routes for approval
router.put('/:id/approve', authorize('admin'), approveVideo);
router.put('/:id/reject', authorize('admin'), rejectVideo);

module.exports = router;
const scheduleService = require('../services/schedule.service');
const { successResponse, errorResponse } = require('../utils/responseHandler');

/**
 * Create a new schedule entry
 * @route POST /api/schedules
 * @access Admin
 */
const createSchedule = async (req, res) => {
  try {
    // Only admins can create schedules
    if (req.user.role !== 'admin') {
      return errorResponse(res, 'Access denied. Admin only.', 403);
    }

    // Check for scheduling conflicts
    const { therapistId, date, time, duration } = req.body;
    const hasConflict = await scheduleService.checkForConflicts(therapistId, date, time, duration);
    
    if (hasConflict) {
      return errorResponse(res, 'Scheduling conflict detected. Please choose another time.', 400);
    }

    const schedule = await scheduleService.createSchedule(req.body);
    successResponse(res, schedule, 'Schedule created successfully', 201);
  } catch (error) {
    errorResponse(res, error.message, 400);
  }
};

/**
 * Get all schedules
 * @route GET /api/schedules
 * @access Admin
 */
const getAllSchedules = async (req, res) => {
  try {
    // Only admins can view all schedules
    if (req.user.role !== 'admin') {
      return errorResponse(res, 'Access denied. Admin only.', 403);
    }

    const { page, limit, sortBy, sortOrder, ...filters } = req.query;
    const options = { page, limit, sortBy, sortOrder };
    
    const result = await scheduleService.getAllSchedules(filters, options);
    successResponse(res, result, 'Schedules retrieved successfully');
  } catch (error) {
    errorResponse(res, error.message, 400);
  }
};

/**
 * Get schedule by ID
 * @route GET /api/schedules/:id
 * @access Admin
 */
const getScheduleById = async (req, res) => {
  try {
    // Only admins can view schedules
    if (req.user.role !== 'admin') {
      return errorResponse(res, 'Access denied. Admin only.', 403);
    }

    const { id } = req.params;
    const schedule = await scheduleService.getScheduleById(id);
    successResponse(res, schedule, 'Schedule retrieved successfully');
  } catch (error) {
    errorResponse(res, error.message, 404);
  }
};

/**
 * Update schedule by ID
 * @route PUT /api/schedules/:id
 * @access Admin
 */
const updateSchedule = async (req, res) => {
  try {
    // Only admins can update schedules
    if (req.user.role !== 'admin') {
      return errorResponse(res, 'Access denied. Admin only.', 403);
    }

    const { id } = req.params;
    
    // Check for scheduling conflicts (excluding current schedule)
    const { therapistId, date, time, duration } = req.body;
    const hasConflict = await scheduleService.checkForConflicts(therapistId, date, time, duration, id);
    
    if (hasConflict) {
      return errorResponse(res, 'Scheduling conflict detected. Please choose another time.', 400);
    }

    const schedule = await scheduleService.updateSchedule(id, req.body);
    successResponse(res, schedule, 'Schedule updated successfully');
  } catch (error) {
    errorResponse(res, error.message, 400);
  }
};

/**
 * Delete schedule by ID
 * @route DELETE /api/schedules/:id
 * @access Admin
 */
const deleteSchedule = async (req, res) => {
  try {
    // Only admins can delete schedules
    if (req.user.role !== 'admin') {
      return errorResponse(res, 'Access denied. Admin only.', 403);
    }

    const { id } = req.params;
    const result = await scheduleService.deleteSchedule(id);
    successResponse(res, result, 'Schedule deleted successfully');
  } catch (error) {
    errorResponse(res, error.message, 404);
  }
};

/**
 * Get schedules by therapist ID
 * @route GET /api/schedules/therapist/:therapistId
 * @access Admin, Therapist
 */
const getSchedulesByTherapistId = async (req, res) => {
  try {
    const { therapistId } = req.params;
    
    // Therapists can only view their own schedules
    if (req.user.role === 'therapist' && therapistId !== req.user._id.toString()) {
      return errorResponse(res, 'Access denied. You can only view your own schedules.', 403);
    }
    
    // Admins can view any therapist's schedules
    if (req.user.role !== 'admin' && req.user.role !== 'therapist') {
      return errorResponse(res, 'Access denied.', 403);
    }

    const { startDate, endDate } = req.query;
    const options = { startDate, endDate };
    
    const schedules = await scheduleService.getSchedulesByTherapistId(therapistId, options);
    successResponse(res, Array.isArray(schedules) ? schedules : [], 'Therapist schedules retrieved successfully');
  } catch (error) {
    errorResponse(res, error.message, 400);
  }
};

/**
 * Get schedules by child ID
 * @route GET /api/schedules/child/:childId
 * @access Admin
 */
const getSchedulesByChildId = async (req, res) => {
  try {
    // Only admins can view schedules by child ID
    if (req.user.role !== 'admin') {
      return errorResponse(res, 'Access denied. Admin only.', 403);
    }

    const { childId } = req.params;
    const { startDate, endDate } = req.query;
    const options = { startDate, endDate };
    
    const schedules = await scheduleService.getSchedulesByChildId(childId, options);
    successResponse(res, Array.isArray(schedules) ? schedules : [], 'Child schedules retrieved successfully');
  } catch (error) {
    errorResponse(res, error.message, 400);
  }
};

module.exports = {
  createSchedule,
  getAllSchedules,
  getScheduleById,
  updateSchedule,
  deleteSchedule,
  getSchedulesByTherapistId,
  getSchedulesByChildId
};
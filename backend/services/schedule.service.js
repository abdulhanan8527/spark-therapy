const Schedule = require('../models/Schedule');
const User = require('../models/User');
const Child = require('../models/Child');

/**
 * Create a new schedule entry
 * @param {Object} scheduleData - Schedule data
 * @returns {Promise<Object>} Created schedule
 */
const createSchedule = async (scheduleData) => {
  try {
    const schedule = new Schedule(scheduleData);
    await schedule.save();
    return schedule;
  } catch (error) {
    throw new Error(`Failed to create schedule: ${error.message}`);
  }
};

/**
 * Get all schedules with optional filters
 * @param {Object} filters - Filter criteria
 * @param {Object} options - Pagination and sorting options
 * @returns {Promise<Object>} Schedules with pagination info
 */
const getAllSchedules = async (filters = {}, options = {}) => {
  try {
    const { page = 1, limit = 10, sortBy = 'date', sortOrder = 1 } = options;
    const skip = (page - 1) * limit;
    
    const schedules = await Schedule.find(filters)
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit)
      .populate('therapistId', 'name email')
      .populate('childId', 'firstName lastName');
    
    const total = await Schedule.countDocuments(filters);
    
    return {
      schedules,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    };
  } catch (error) {
    throw new Error(`Failed to fetch schedules: ${error.message}`);
  }
};

/**
 * Get schedule by ID
 * @param {string} id - Schedule ID
 * @returns {Promise<Object>} Schedule document
 */
const getScheduleById = async (id) => {
  try {
    const schedule = await Schedule.findById(id)
      .populate('therapistId', 'name email')
      .populate('childId', 'firstName lastName');
    
    if (!schedule) {
      throw new Error('Schedule not found');
    }
    
    return schedule;
  } catch (error) {
    throw new Error(`Failed to fetch schedule: ${error.message}`);
  }
};

/**
 * Update schedule by ID
 * @param {string} id - Schedule ID
 * @param {Object} updateData - Update data
 * @returns {Promise<Object>} Updated schedule
 */
const updateSchedule = async (id, updateData) => {
  try {
    const schedule = await Schedule.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!schedule) {
      throw new Error('Schedule not found');
    }
    
    return schedule;
  } catch (error) {
    throw new Error(`Failed to update schedule: ${error.message}`);
  }
};

/**
 * Delete schedule by ID
 * @param {string} id - Schedule ID
 * @returns {Promise<Object>} Deletion result
 */
const deleteSchedule = async (id) => {
  try {
    const schedule = await Schedule.findByIdAndDelete(id);
    
    if (!schedule) {
      throw new Error('Schedule not found');
    }
    
    return { message: 'Schedule deleted successfully' };
  } catch (error) {
    throw new Error(`Failed to delete schedule: ${error.message}`);
  }
};

/**
 * Get schedules by therapist ID
 * @param {string} therapistId - Therapist ID
 * @param {Object} options - Date range and other options
 * @returns {Promise<Array>} Array of schedules
 */
const getSchedulesByTherapistId = async (therapistId, options = {}) => {
  try {
    const { startDate, endDate } = options;
    const filter = { therapistId };
    
    if (startDate && endDate) {
      filter.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }
    
    const schedules = await Schedule.find(filter)
      .sort({ date: 1, time: 1 })
      .populate('childId', 'firstName lastName');
    return schedules;
  } catch (error) {
    throw new Error(`Failed to fetch therapist schedules: ${error.message}`);
  }
};

/**
 * Get schedules by child ID
 * @param {string} childId - Child ID
 * @param {Object} options - Date range and other options
 * @returns {Promise<Array>} Array of schedules
 */
const getSchedulesByChildId = async (childId, options = {}) => {
  try {
    const { startDate, endDate } = options;
    const filter = { childId };
    
    if (startDate && endDate) {
      filter.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }
    
    const schedules = await Schedule.find(filter)
      .sort({ date: 1, time: 1 })
      .populate('therapistId', 'name email');
    return schedules;
  } catch (error) {
    throw new Error(`Failed to fetch child schedules: ${error.message}`);
  }
};

/**
 * Check for scheduling conflicts
 * @param {string} therapistId - Therapist ID
 * @param {Date} date - Schedule date
 * @param {string} time - Schedule time
 * @param {number} duration - Duration in minutes
 * @param {string} excludeId - ID to exclude from conflict check
 * @returns {Promise<boolean>} True if conflict exists
 */
const checkForConflicts = async (therapistId, date, time, duration, excludeId = null) => {
  try {
    const filter = {
      therapistId,
      date: new Date(date),
    };
    
    if (excludeId) {
      filter._id = { $ne: excludeId };
    }
    
    const schedules = await Schedule.find(filter);
    
    // Simple conflict check - in a real app, this would be more sophisticated
    for (const schedule of schedules) {
      if (schedule.time === time) {
        return true;
      }
    }
    
    return false;
  } catch (error) {
    throw new Error(`Failed to check for conflicts: ${error.message}`);
  }
};

module.exports = {
  createSchedule,
  getAllSchedules,
  getScheduleById,
  updateSchedule,
  deleteSchedule,
  getSchedulesByTherapistId,
  getSchedulesByChildId,
  checkForConflicts
};
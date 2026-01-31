const Complaint = require('../models/Complaint');
const User = require('../models/User');
const Child = require('../models/Child');

/**
 * Create a new complaint
 * @param {Object} complaintData - Complaint data
 * @returns {Promise<Object>} Created complaint
 */
const createComplaint = async (complaintData) => {
  try {
    const complaint = new Complaint(complaintData);
    await complaint.save();
    return complaint;
  } catch (error) {
    throw new Error(`Failed to create complaint: ${error.message}`);
  }
};

/**
 * Get all complaints with optional filters
 * @param {Object} filters - Filter criteria
 * @param {Object} options - Pagination and sorting options
 * @returns {Promise<Object>} Complaints with pagination info
 */
const getAllComplaints = async (filters = {}, options = {}) => {
  try {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = -1 } = options;
    const skip = (page - 1) * limit;
    
    const complaints = await Complaint.find(filters)
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit)
      .populate('parentId', 'name email')
      .populate('childId', 'firstName lastName');
    
    const total = await Complaint.countDocuments(filters);
    
    return {
      success: true,
      data: complaints,
      message: 'Complaints retrieved successfully'
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
      data: []
    };
  }
};

/**
 * Get complaint by ID
 * @param {string} id - Complaint ID
 * @returns {Promise<Object>} Complaint document
 */
const getComplaintById = async (id) => {
  try {
    const complaint = await Complaint.findById(id)
      .populate('parentId', 'name email')
      .populate('childId', 'firstName lastName');
    
    if (!complaint) {
      throw new Error('Complaint not found');
    }
    
    return complaint;
  } catch (error) {
    throw new Error(`Failed to fetch complaint: ${error.message}`);
  }
};

/**
 * Update complaint by ID
 * @param {string} id - Complaint ID
 * @param {Object} updateData - Update data
 * @returns {Promise<Object>} Updated complaint
 */
const updateComplaint = async (id, updateData) => {
  try {
    const complaint = await Complaint.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!complaint) {
      throw new Error('Complaint not found');
    }
    
    return complaint;
  } catch (error) {
    throw new Error(`Failed to update complaint: ${error.message}`);
  }
};

/**
 * Delete complaint by ID
 * @param {string} id - Complaint ID
 * @returns {Promise<Object>} Deletion result
 */
const deleteComplaint = async (id) => {
  try {
    const complaint = await Complaint.findByIdAndDelete(id);
    
    if (!complaint) {
      throw new Error('Complaint not found');
    }
    
    return { message: 'Complaint deleted successfully' };
  } catch (error) {
    throw new Error(`Failed to delete complaint: ${error.message}`);
  }
};

/**
 * Get complaints by parent ID
 * @param {string} parentId - Parent ID
 * @returns {Promise<Array>} Array of complaints
 */
const getComplaintsByParentId = async (parentId) => {
  try {
    const complaints = await Complaint.find({ parentId })
      .populate('childId', 'firstName lastName');
    return complaints;
  } catch (error) {
    throw new Error(`Failed to fetch parent complaints: ${error.message}`);
  }
};

/**
 * Get complaints by child ID
 * @param {string} childId - Child ID
 * @returns {Promise<Array>} Array of complaints
 */
const getComplaintsByChildId = async (childId) => {
  try {
    const complaints = await Complaint.find({ childId })
      .populate('parentId', 'name email');
    return complaints;
  } catch (error) {
    throw new Error(`Failed to fetch child complaints: ${error.message}`);
  }
};

module.exports = {
  createComplaint,
  getAllComplaints,
  getComplaintById,
  updateComplaint,
  deleteComplaint,
  getComplaintsByParentId,
  getComplaintsByChildId
};
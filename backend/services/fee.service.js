const Fee = require('../models/Fee');
const User = require('../models/User');
const Child = require('../models/Child');

/**
 * Create a new fee record
 * @param {Object} feeData - Fee data
 * @returns {Promise<Object>} Created fee record
 */
const createFee = async (feeData) => {
  try {
    const fee = new Fee(feeData);
    await fee.save();
    return fee;
  } catch (error) {
    throw new Error(`Failed to create fee record: ${error.message}`);
  }
};

/**
 * Get all fee records with optional filters
 * @param {Object} filters - Filter criteria
 * @param {Object} options - Pagination and sorting options
 * @returns {Promise<Object>} Fee records with pagination info
 */
const getAllFees = async (filters = {}, options = {}) => {
  try {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = -1 } = options;
    const skip = (page - 1) * limit;
    
    const fees = await Fee.find(filters)
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit)
      .populate('parentId', 'name email')
      .populate('childId', 'firstName lastName');
    
    const total = await Fee.countDocuments(filters);
    
    return {
      fees,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    };
  } catch (error) {
    throw new Error(`Failed to fetch fee records: ${error.message}`);
  }
};

/**
 * Get fee record by ID
 * @param {string} id - Fee record ID
 * @returns {Promise<Object>} Fee record document
 */
const getFeeById = async (id) => {
  try {
    const fee = await Fee.findById(id)
      .populate('parentId', 'name email')
      .populate('childId', 'firstName lastName');
    
    if (!fee) {
      throw new Error('Fee record not found');
    }
    
    return fee;
  } catch (error) {
    throw new Error(`Failed to fetch fee record: ${error.message}`);
  }
};

/**
 * Update fee record by ID
 * @param {string} id - Fee record ID
 * @param {Object} updateData - Update data
 * @returns {Promise<Object>} Updated fee record
 */
const updateFee = async (id, updateData) => {
  try {
    const fee = await Fee.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!fee) {
      throw new Error('Fee record not found');
    }
    
    return fee;
  } catch (error) {
    throw new Error(`Failed to update fee record: ${error.message}`);
  }
};

/**
 * Delete fee record by ID
 * @param {string} id - Fee record ID
 * @returns {Promise<Object>} Deletion result
 */
const deleteFee = async (id) => {
  try {
    const fee = await Fee.findByIdAndDelete(id);
    
    if (!fee) {
      throw new Error('Fee record not found');
    }
    
    return { message: 'Fee record deleted successfully' };
  } catch (error) {
    throw new Error(`Failed to delete fee record: ${error.message}`);
  }
};

/**
 * Get fee records by parent ID
 * @param {string} parentId - Parent ID
 * @returns {Promise<Array>} Array of fee records
 */
const getFeesByParentId = async (parentId) => {
  try {
    const fees = await Fee.find({ parentId })
      .populate('childId', 'firstName lastName');
    return fees;
  } catch (error) {
    throw new Error(`Failed to fetch parent fee records: ${error.message}`);
  }
};

/**
 * Get fee records by child ID
 * @param {string} childId - Child ID
 * @returns {Promise<Array>} Array of fee records
 */
const getFeesByChildId = async (childId) => {
  try {
    const fees = await Fee.find({ childId })
      .populate('parentId', 'name email');
    return fees;
  } catch (error) {
    throw new Error(`Failed to fetch child fee records: ${error.message}`);
  }
};

/**
 * Get fee summary for a parent
 * @param {string} parentId - Parent ID
 * @returns {Promise<Object>} Fee summary
 */
const getParentFeeSummary = async (parentId) => {
  try {
    const fees = await Fee.find({ parentId });
    
    const summary = {
      totalDue: 0,
      overdue: 0,
      upcoming: 0,
      paid: 0
    };
    
    fees.forEach(fee => {
      if (fee.status === 'paid') {
        summary.paid += fee.amount;
      } else if (new Date(fee.dueDate) < new Date()) {
        summary.overdue += fee.amount;
      } else {
        summary.upcoming += fee.amount;
      }
      summary.totalDue += fee.amount;
    });
    
    return summary;
  } catch (error) {
    throw new Error(`Failed to fetch parent fee summary: ${error.message}`);
  }
};

module.exports = {
  createFee,
  getAllFees,
  getFeeById,
  updateFee,
  deleteFee,
  getFeesByParentId,
  getFeesByChildId,
  getParentFeeSummary
};
const User = require('../models/User');
const Child = require('../models/Child');

/**
 * Get all therapists
 * @returns {Promise<Array>} Array of therapists
 */
const getAllTherapists = async () => {
  try {
    const therapists = await User.find({ role: 'therapist' });
    return {
      success: true,
      data: therapists,
      message: 'Therapists retrieved successfully'
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
 * Get therapist by ID
 * @param {string} id - Therapist ID
 * @returns {Promise<Object>} Therapist document
 */
const getTherapistById = async (id) => {
  try {
    const therapist = await User.findById(id);
    
    if (!therapist || therapist.role !== 'therapist') {
      return {
        success: false,
        message: 'Therapist not found',
        data: null
      };
    }
    
    return {
      success: true,
      data: therapist,
      message: 'Therapist retrieved successfully'
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
      data: null
    };
  }
};

/**
 * Update therapist by ID
 * @param {string} id - Therapist ID
 * @param {Object} updateData - Update data
 * @returns {Promise<Object>} Updated therapist
 */
const updateTherapist = async (id, updateData) => {
  try {
    // Prepare update fields - include all valid fields
    const updateFields = {};
    
    // Only add fields to update if they're provided
    if (updateData.name !== undefined) {
      updateFields.name = updateData.name;
    }
    if (updateData.email !== undefined) {
      updateFields.email = updateData.email;
    }
    if (updateData.phone !== undefined) {
      updateFields.phone = updateData.phone;
    }
    if (updateData.specialization !== undefined) {
      updateFields.specialization = updateData.specialization;
    }
    if (updateData.isActive !== undefined) {
      updateFields.isActive = updateData.isActive;
    }
    
    const therapist = await User.findByIdAndUpdate(
      id,
      updateFields,
      { new: true, runValidators: true }
    );
    
    if (!therapist || therapist.role !== 'therapist') {
      throw new Error('Therapist not found');
    }
    
    return therapist;
  } catch (error) {
    throw new Error(`Failed to update therapist: ${error.message}`);
  }
};

/**
 * Deactivate therapist
 * @param {string} id - Therapist ID
 * @returns {Promise<Object>} Updated therapist
 */
const deactivateTherapist = async (id) => {
  try {
    const therapist = await User.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );
    
    if (!therapist || therapist.role !== 'therapist') {
      throw new Error('Therapist not found');
    }
    
    // Also deactivate all children assigned to this therapist
    await Child.updateMany(
      { therapistId: id },
      { therapistId: null }
    );
    
    return therapist;
  } catch (error) {
    throw new Error(`Failed to deactivate therapist: ${error.message}`);
  }
};

/**
 * Reactivate therapist
 * @param {string} id - Therapist ID
 * @returns {Promise<Object>} Updated therapist
 */
const reactivateTherapist = async (id) => {
  try {
    const therapist = await User.findByIdAndUpdate(
      id,
      { isActive: true },
      { new: true }
    );
    
    if (!therapist || therapist.role !== 'therapist') {
      throw new Error('Therapist not found');
    }
    
    return therapist;
  } catch (error) {
    throw new Error(`Failed to reactivate therapist: ${error.message}`);
  }
};

/**
 * Assign child to therapist
 * @param {string} childId - Child ID
 * @param {string} therapistId - Therapist ID
 * @returns {Promise<Object>} Updated child
 */
const assignChildToTherapist = async (childId, therapistId) => {
  try {
    // Verify therapist exists and is active
    const therapist = await User.findById(therapistId);
    if (!therapist || therapist.role !== 'therapist' || !therapist.isActive) {
      throw new Error('Invalid or inactive therapist');
    }
    
    // Assign child to therapist
    const child = await Child.findByIdAndUpdate(
      childId,
      { therapistId },
      { new: true }
    );
    
    if (!child) {
      throw new Error('Child not found');
    }
    
    return child;
  } catch (error) {
    throw new Error(`Failed to assign child to therapist: ${error.message}`);
  }
};

/**
 * Remove child from therapist
 * @param {string} childId - Child ID
 * @returns {Promise<Object>} Updated child
 */
const removeChildFromTherapist = async (childId) => {
  try {
    const child = await Child.findByIdAndUpdate(
      childId,
      { therapistId: null },
      { new: true }
    );
    
    if (!child) {
      throw new Error('Child not found');
    }
    
    return child;
  } catch (error) {
    throw new Error(`Failed to remove child from therapist: ${error.message}`);
  }
};

/**
 * Get children assigned to therapist
 * @param {string} therapistId - Therapist ID
 * @returns {Promise<Array>} Array of children
 */
const getChildrenByTherapistId = async (therapistId) => {
  try {
    const children = await Child.find({ therapistId })
      .populate('parentId', 'name email');
    return children;
  } catch (error) {
    throw new Error(`Failed to fetch therapist's children: ${error.message}`);
  }
};

/**
 * Delete therapist permanently
 * @param {string} id - Therapist ID
 * @returns {Promise<Object>} Deleted therapist
 */
const deleteTherapist = async (id) => {
  try {
    const therapist = await User.findByIdAndDelete(id);
    
    if (!therapist || therapist.role !== 'therapist') {
      throw new Error('Therapist not found');
    }
    
    // Remove therapist assignment from all children
    await Child.updateMany(
      { therapistId: id },
      { therapistId: null }
    );
    
    return therapist;
  } catch (error) {
    throw new Error(`Failed to delete therapist: ${error.message}`);
  }
};

module.exports = {
  getAllTherapists,
  getTherapistById,
  updateTherapist,
  deactivateTherapist,
  reactivateTherapist,
  assignChildToTherapist,
  removeChildFromTherapist,
  getChildrenByTherapistId,
  deleteTherapist
};
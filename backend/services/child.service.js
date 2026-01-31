const Child = require('../models/Child');

class ChildService {
  // Get all children for a parent
  static async getChildrenByParent(parentId) {
    try {
      const children = await Child.find({ parentId, isActive: true });
      return {
        success: true,
        data: children,
        message: 'Children retrieved successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        statusCode: 500
      };
    }
  }

  // Get all children (admin only)
  static async getAllChildren() {
    try {
      const children = await Child.find({ isActive: true });
      return {
        success: true,
        data: children,
        message: 'All children retrieved successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        statusCode: 500
      };
    }
  }

  // Get child by ID
  static async getChildById(childId) {
    try {
      const child = await Child.findById(childId);
      if (!child || !child.isActive) {
        return {
          success: false,
          message: 'Child not found',
          statusCode: 404
        };
      }
      return {
        success: true,
        data: child,
        message: 'Child retrieved successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        statusCode: 500
      };
    }
  }

  // Create child
  static async createChild(childData) {
    try {
      const child = new Child(childData);
      const savedChild = await child.save();
      return {
        success: true,
        data: savedChild,
        message: 'Child created successfully',
        statusCode: 201
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        statusCode: 500
      };
    }
  }

  // Update child
  static async updateChild(childId, updateData) {
    try {
      const child = await Child.findById(childId);
      if (!child || !child.isActive) {
        return {
          success: false,
          message: 'Child not found',
          statusCode: 404
        };
      }

      Object.assign(child, updateData);
      const updatedChild = await child.save();
      return {
        success: true,
        data: updatedChild,
        message: 'Child updated successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        statusCode: 500
      };
    }
  }

  // Delete child (soft delete)
  static async deleteChild(childId) {
    try {
      const child = await Child.findById(childId);
      if (!child || !child.isActive) {
        return {
          success: false,
          message: 'Child not found',
          statusCode: 404
        };
      }

      child.isActive = false;
      await child.save();
      return {
        success: true,
        data: {},
        message: 'Child deactivated successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        statusCode: 500
      };
    }
  }

  // Get children by therapist
  static async getChildrenByTherapist(therapistId) {
    try {
      const children = await Child.find({ therapistId, isActive: true });
      return {
        success: true,
        data: children,
        message: 'Children retrieved successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        statusCode: 500
      };
    }
  }

  // Assign therapist to child
  static async assignTherapist(childId, therapistId) {
    try {
      const child = await Child.findById(childId);
      if (!child || !child.isActive) {
        return {
          success: false,
          message: 'Child not found',
          statusCode: 404
        };
      }

      child.therapistId = therapistId;
      const updatedChild = await child.save();
      return {
        success: true,
        data: updatedChild,
        message: 'Therapist assigned successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        statusCode: 500
      };
    }
  }
}

module.exports = ChildService;
const User = require('../models/User');

class UserService {
  // Get all users (admin only)
  static async getAllUsers() {
    try {
      const users = await User.find({}).select('-password');
      return {
        success: true,
        data: users,
        message: 'Users retrieved successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        data: []
      };
    }
  }

  // Get user by ID
  static async getUserById(userId) {
    try {
      const user = await User.findById(userId).select('-password');
      if (!user) {
        return {
          success: false,
          message: 'User not found',
          data: null
        };
      }
      return {
        success: true,
        data: user,
        message: 'User retrieved successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  }

  // Update user
  static async updateUser(userId, updateData) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        return {
          success: false,
          message: 'User not found',
          data: null
        };
      }

      // Update user fields
      Object.keys(updateData).forEach(key => {
        if (key !== 'password' || updateData[key]) {
          user[key] = updateData[key];
        }
      });

      const updatedUser = await user.save();
      return {
        success: true,
        data: updatedUser,
        message: 'User updated successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  }

  // Delete user (soft delete)
  static async deleteUser(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        return {
          success: false,
          message: 'User not found',
          data: null
        };
      }

      user.isActive = false;
      await user.save();
      return {
        success: true,
        data: {},
        message: 'User deactivated successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  }

  // Get users by role
  static async getUsersByRole(role) {
    try {
      const users = await User.find({ role, isActive: true }).select('-password');
      return {
        success: true,
        data: users,
        message: `Users with role ${role} retrieved successfully`
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        data: []
      };
    }
  }
}

module.exports = UserService;
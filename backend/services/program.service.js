const Program = require('../models/Program');

class ProgramService {
  // Get all programs for a child
  static async getProgramsByChild(childId) {
    try {
      const programs = await Program.find({ childId, isArchived: false });
      return {
        success: true,
        data: programs,
        message: 'Programs retrieved successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  }

  // Get program by ID
  static async getProgramById(programId) {
    try {
      const program = await Program.findById(programId);
      if (!program || program.isArchived) {
        return {
          success: false,
          message: 'Program not found',
          data: null,
          statusCode: 404
        };
      }
      return {
        success: true,
        data: program,
        message: 'Program retrieved successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  }

  // Create program
  static async createProgram(programData) {
    try {
      const program = new Program(programData);
      const savedProgram = await program.save();
      return {
        success: true,
        data: savedProgram,
        message: 'Program created successfully',
        statusCode: 201
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  }

  // Update program
  static async updateProgram(programId, updateData) {
    try {
      const program = await Program.findById(programId);
      if (!program || program.isArchived) {
        return {
          success: false,
          message: 'Program not found',
          data: null,
          statusCode: 404
        };
      }

      Object.assign(program, updateData);
      
      // Handle archiving
      if (updateData.isArchived && updateData.isArchived === true) {
        program.archivedDate = new Date();
      }
      
      const updatedProgram = await program.save();
      return {
        success: true,
        data: updatedProgram,
        message: 'Program updated successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  }

  // Delete program (soft delete by archiving)
  static async deleteProgram(programId) {
    try {
      const program = await Program.findById(programId);
      if (!program || program.isArchived) {
        return {
          success: false,
          message: 'Program not found',
          data: null,
          statusCode: 404
        };
      }

      program.isArchived = true;
      program.archivedDate = new Date();
      const updatedProgram = await program.save();
      return {
        success: true,
        data: updatedProgram,
        message: 'Program archived successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  }

  // Update target within a program
  static async updateTarget(programId, targetId, targetData) {
    try {
      const program = await Program.findById(programId);
      if (!program || program.isArchived) {
        return {
          success: false,
          message: 'Program not found',
          data: null,
          statusCode: 404
        };
      }

      const targetIndex = program.targets.findIndex(target => target._id.toString() === targetId);
      if (targetIndex === -1) {
        return {
          success: false,
          message: 'Target not found',
          data: null,
          statusCode: 404
        };
      }

      // Update target fields
      Object.keys(targetData).forEach(key => {
        program.targets[targetIndex][key] = targetData[key];
      });

      // Handle mastering
      if (targetData.isMastered && targetData.isMastered === true) {
        program.targets[targetIndex].masteredDate = new Date();
      }

      const updatedProgram = await program.save();
      return {
        success: true,
        data: updatedProgram,
        message: 'Target updated successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  }

  // Add target to program
  static async addTarget(programId, targetData) {
    try {
      const program = await Program.findById(programId);
      if (!program || program.isArchived) {
        return {
          success: false,
          message: 'Program not found',
          data: null,
          statusCode: 404
        };
      }

      program.targets.push(targetData);
      const updatedProgram = await program.save();
      return {
        success: true,
        data: updatedProgram,
        message: 'Target added successfully',
        statusCode: 201
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  }

  // Remove target from program
  static async removeTarget(programId, targetId) {
    try {
      const program = await Program.findById(programId);
      if (!program || program.isArchived) {
        return {
          success: false,
          message: 'Program not found',
          data: null,
          statusCode: 404
        };
      }

      program.targets = program.targets.filter(target => target._id.toString() !== targetId);
      const updatedProgram = await program.save();
      return {
        success: true,
        data: updatedProgram,
        message: 'Target removed successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  }
}

module.exports = ProgramService;
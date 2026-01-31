/**
 * Role-Based Access Control Middleware
 * Standardized authorization for all API endpoints
 */

const { errorResponse } = require('../utils/responseHandler');

// Role hierarchy and permissions mapping
const ROLE_PERMISSIONS = {
  admin: {
    canAccessAll: true,
    canCreateUsers: true,
    canDeleteUsers: true,
    canAssignTherapists: true,
    canManageBilling: true,
    canViewAllData: true,
    canGenerateReports: true
  },
  therapist: {
    canAccessAssignedChildren: true,
    canCreatePrograms: true,
    canUpdatePrograms: true,
    canViewSessions: true,
    canCreateSessions: true,
    canUpdateSessions: true,
    canViewFeedback: true,
    canCreateFeedback: true,
    canViewVideos: true,
    canUploadVideos: true,
    canViewSchedule: true,
    canRequestLeave: true
  },
  parent: {
    canAccessOwnChildren: true,
    canViewChildProgress: true,
    canViewInvoices: true,
    canPayInvoices: true,
    canSubmitComplaints: true,
    canViewFeedback: true,
    canViewSessions: true
  }
};

// Resource ownership checks
const OWNERSHIP_CHECKS = {
  child: (user, child) => {
    if (user.role === 'admin') return true;
    if (user.role === 'parent') return child.parentId?.toString() === user._id.toString();
    if (user.role === 'therapist') return child.therapistId?.toString() === user._id.toString();
    return false;
  },
  
  invoice: (user, invoice) => {
    if (user.role === 'admin') return true;
    if (user.role === 'parent') return invoice.parentId?.toString() === user._id.toString();
    return false;
  },
  
  complaint: (user, complaint) => {
    if (user.role === 'admin') return true;
    if (user.role === 'parent') return complaint.parentId?.toString() === user._id.toString();
    return false;
  },
  
  program: (user, program) => {
    if (user.role === 'admin') return true;
    if (user.role === 'therapist') return program.therapistId?.toString() === user._id.toString();
    if (user.role === 'parent') {
      // Parents can access programs of their children
      return program.child?.parentId?.toString() === user._id.toString();
    }
    return false;
  },
  
  session: (user, session) => {
    if (user.role === 'admin') return true;
    if (user.role === 'therapist') return session.therapistId?.toString() === user._id.toString();
    if (user.role === 'parent') {
      // Parents can access sessions of their children
      return session.child?.parentId?.toString() === user._id.toString();
    }
    return false;
  }
};

// Main RBAC middleware
const authorizeResource = (resource, action = 'read') => {
  return async (req, res, next) => {
    try {
      const user = req.user;
      
      // Check if user has role
      if (!user || !user.role) {
        return errorResponse(res, 'User role not found', 401);
      }
      
      // Check role permissions
      const permissions = ROLE_PERMISSIONS[user.role];
      if (!permissions) {
        return errorResponse(res, `Role '${user.role}' not recognized`, 403);
      }
      
      // Admins have access to everything
      if (permissions.canAccessAll) {
        return next();
      }
      
      // Check specific resource permissions
      const permissionKey = `can${action.charAt(0).toUpperCase() + action.slice(1)}${resource.charAt(0).toUpperCase() + resource.slice(1)}`;
      if (permissions[permissionKey]) {
        return next();
      }
      
      // If we reach here, user doesn't have direct permission
      // Log unauthorized access attempt
      console.warn('RBAC: Unauthorized access attempt', {
        userId: user._id,
        userRole: user.role,
        resource,
        action,
        endpoint: req.originalUrl,
        method: req.method,
        timestamp: new Date().toISOString()
      });
      
      return errorResponse(res, `Insufficient permissions for ${action} ${resource}`, 403);
    } catch (error) {
      console.error('RBAC middleware error:', error);
      return errorResponse(res, 'Authorization check failed', 500);
    }
  };
};

// Ownership verification middleware
const verifyOwnership = (resource, getIdFromReq = (req) => req.params.id) => {
  return async (req, res, next) => {
    try {
      const user = req.user;
      const resourceId = getIdFromReq(req);
      
      if (!user || !resourceId) {
        return errorResponse(res, 'Invalid request', 400);
      }
      
      // Admins bypass ownership checks
      if (user.role === 'admin') {
        return next();
      }
      
      // Get the ownership check function
      const ownershipCheck = OWNERSHIP_CHECKS[resource];
      if (!ownershipCheck) {
        return errorResponse(res, `Ownership check not configured for ${resource}`, 500);
      }
      
      // Fetch the resource to check ownership
      // This requires importing the appropriate service
      const serviceMap = {
        child: '../services/child.service',
        invoice: '../services/invoice.service',
        complaint: '../services/complaint.service',
        program: '../services/program.service',
        session: '../services/session.service'
      };
      
      const servicePath = serviceMap[resource];
      if (!servicePath) {
        return errorResponse(res, `Service not found for ${resource}`, 500);
      }
      
      const service = require(servicePath);
      const getResult = await service[`get${resource.charAt(0).toUpperCase() + resource.slice(1)}ById`](resourceId);
      
      if (!getResult.success) {
        return errorResponse(res, getResult.message, getResult.statusCode || 404);
      }
      
      const resourceData = getResult.data;
      
      // Check ownership
      if (!ownershipCheck(user, resourceData)) {
        console.warn('Ownership violation attempt', {
          userId: user._id,
          userRole: user.role,
          resourceId,
          resourceType: resource,
          endpoint: req.originalUrl,
          method: req.method,
          timestamp: new Date().toISOString()
        });
        
        return errorResponse(res, `Not authorized to access this ${resource}`, 403);
      }
      
      // Attach resource to request for downstream use
      req.resource = resourceData;
      next();
    } catch (error) {
      console.error('Ownership verification error:', error);
      return errorResponse(res, 'Ownership verification failed', 500);
    }
  };
};

// Combined middleware for common patterns
const requireAdmin = authorizeResource('all', 'manage');
const requireTherapistAccess = authorizeResource('assignedChildren', 'access');
const requireParentAccess = authorizeResource('ownChildren', 'access');

module.exports = {
  authorizeResource,
  verifyOwnership,
  requireAdmin,
  requireTherapistAccess,
  requireParentAccess,
  ROLE_PERMISSIONS,
  OWNERSHIP_CHECKS
};
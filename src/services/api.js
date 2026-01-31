import storage from '../utils/StorageUtils';

import axios from 'axios';

// Import environment configuration
import getEnvVars from '../config/env';

// Get environment variables
const ENV = getEnvVars();

// Create axios instance with base URL
const apiClient = axios.create({
  baseURL: ENV.API_BASE_URL,
  // Add timeout to prevent hanging requests
  timeout: 10000,
  // Add headers for web compatibility
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
});

// Add a request interceptor to include auth token
apiClient.interceptors.request.use(
  async (config) => {
    const token = await storage.getItem('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle token expiration
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid, clear storage and redirect to login
      await storage.removeItem('userToken');
      await storage.removeItem('userData');
    }
    return Promise.reject(error);
  }
);

// Helper to handle API errors
const handleApiError = (error, fallbackMessage) => {
  console.error(`API Error (${fallbackMessage}):`, error);

  let message = fallbackMessage;
  let data = null;

  if (error.response) {
    // The server responded with a status code (e.g., 400, 401, 500)
    data = error.response.data;
    message = data?.message || fallbackMessage;
    
    // Handle specific status codes with more descriptive messages
    if (error.response.status === 401) {
      const errorCode = data?.code;
      if (errorCode === 'TOKEN_EXPIRED') {
        message = 'Your session has expired. Please log in again.';
      } else if (errorCode === 'INVALID_TOKEN') {
        message = 'Invalid session. Please log in again.';
      } else if (errorCode === 'USER_NOT_FOUND') {
        message = 'User account not found. Please contact support.';
      } else if (errorCode === 'ACCOUNT_DEACTIVATED') {
        message = 'Your account has been deactivated. Please contact support.';
      } else {
        message = 'Unauthorized access. Please log in again.';
      }
      
      // Clear authentication data for 401 errors
      storage.removeItem('userToken');
      storage.removeItem('userData');
    } else if (error.response.status >= 500) {
      message = 'Server error. Please contact support if this persists.';
    } else if (error.response.status === 404) {
      message = 'Requested resource not found.';
    }
  } else if (error.request) {
    // The request was made but no response was received (Network Error)
    message = `Cannot connect to server at ${ENV.API_BASE_URL}. 

Please check:
- Is the backend server running on port ${ENV.API_BASE_URL.split(':')[2] || '5001'}?
- Are you using the correct IP address?
- For web browser, use localhost
- For Expo Go, use localhost`;
  } else {
    // Something happened during request setup
    message = error.message || fallbackMessage;
  }

  // Throw a proper Error object so catch blocks can reliably use .message
  const apiError = new Error(message);
  apiError.data = data; // Keep raw data in case we need it
  apiError.statusCode = error.response?.status;
  apiError.isAuthError = error.response?.status === 401;
  throw apiError;
};

// Helper function to check if the server is reachable
export const checkServerConnectivity = async () => {
  try {
    // Make a simple GET request to the server's health endpoint
    const response = await apiClient.get('/health'); // Root health check
    return { reachable: true, data: response.data };
  } catch (error) {
    // If root health check fails, try the API health endpoint
    try {
      const response = await apiClient.get('/api/health');
      return { reachable: true, data: response.data };
    } catch (apiError) {
      console.warn('Server connectivity check failed:', error.message, apiError.message);
      return { reachable: false, error: error };
    }
  }
};

// Auth API functions
export const authAPI = {
  // Register user
  register: async (userData) => {
    try {
      const response = await apiClient.post('/auth/register', userData);
      if (response.data.success) {
        // Save tokens and user data to storage
        await storage.setItem('userToken', response.data.data.accessToken);
        await storage.setItem('refreshToken', response.data.data.refreshToken);
        await storage.setItem('userData', JSON.stringify(response.data.data));
      }
      return response.data;
    } catch (error) {
      console.error('Registration API error details:', {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        statusText: error.response?.statusText,
        url: error.request?.responseURL
      });
      handleApiError(error, 'Registration failed');
    }
  },

  // Login user
  login: async (credentials) => {
    try {
      const response = await apiClient.post('/auth/login', credentials);
      if (response.data.success) {
        // Save tokens and user data to storage
        await storage.setItem('userToken', response.data.data.accessToken);
        await storage.setItem('refreshToken', response.data.data.refreshToken);
        await storage.setItem('userData', JSON.stringify(response.data.data));
      }
      return response.data;
    } catch (error) {
      console.error('Login API error details:', {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        statusText: error.response?.statusText,
        url: error.request?.responseURL
      });
      handleApiError(error, 'Login failed');
    }
  },

  // Logout user
  logout: async () => {
    try {
      // Call backend logout endpoint
      await apiClient.post('/auth/logout');
    } catch (error) {
      // Continue with local cleanup even if backend call fails
      console.warn('Backend logout failed:', error.message);
    } finally {
      // Always clear local storage for security
      await Promise.all([
        storage.removeItem('userToken'),
        storage.removeItem('refreshToken'),
        storage.removeItem('userData')
      ]);
    }
  },

  // Get user profile
  getProfile: async () => {
    try {
      const response = await apiClient.get('/auth/profile');
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to fetch profile');
    }
  },

  // Update user profile
  updateProfile: async (userData) => {
    try {
      const response = await apiClient.put('/auth/profile', userData);
      if (response.data.success) {
        // Update stored user data
        await storage.setItem('userData', JSON.stringify(response.data.data));
      }
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to update profile');
    }
  },

  // Check if user is authenticated
  isAuthenticated: async () => {
    const token = await storage.getItem('userToken');
    return !!token;
  },

  // Get stored user data
  getCurrentUser: async () => {
    const userData = await storage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
  },

  // Refresh token if expired
  refreshToken: async () => {
    try {
      const userData = await storage.getItem('userData');
      if (!userData) {
        throw new Error('No user data available');
      }
      
      const parsedUserData = JSON.parse(userData);
      
      // Try to get profile to test if token is still valid
      const response = await apiClient.get('/auth/profile');
      if (response.data.success) {
        return response.data;
      }
    } catch (error) {
      if (error.isAuthError) {
        // Token is invalid/expired, clear storage and return null
        await storage.removeItem('userToken');
        await storage.removeItem('userData');
        return null;
      }
      throw error;
    }
  }
};

// Child API functions
export const childAPI = {
  // Get all children for current user
  getChildren: async () => {
    try {
      const response = await apiClient.get('/children');
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to fetch children');
    }
  },

  // Get child by ID
  getChildById: async (childId) => {
    try {
      const response = await apiClient.get(`/children/${childId}`);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to fetch child');
    }
  },

  // Create child
  createChild: async (childData) => {
    try {
      const response = await apiClient.post('/children', childData);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to create child');
    }
  },

  // Update child
  updateChild: async (childId, childData) => {
    try {
      const response = await apiClient.put(`/children/${childId}`, childData);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to update child');
    }
  },

  // Delete child
  deleteChild: async (childId) => {
    try {
      const response = await apiClient.delete(`/children/${childId}`);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to delete child');
    }
  }
};

// Program API functions
export const programAPI = {
  // Get programs by child ID
  getProgramsByChild: async (childId) => {
    try {
      const response = await apiClient.get(`/programs/child/${childId}`);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to fetch programs');
    }
  },

  // Get program by ID
  getProgramById: async (programId) => {
    try {
      const response = await apiClient.get(`/programs/${programId}`);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to fetch program');
    }
  },

  // Create program
  createProgram: async (programData) => {
    try {
      const response = await apiClient.post('/programs', programData);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to create program');
    }
  },

  // Update program
  updateProgram: async (programId, programData) => {
    try {
      const response = await apiClient.put(`/programs/${programId}`, programData);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to update program');
    }
  },

  // Delete program
  deleteProgram: async (programId) => {
    try {
      const response = await apiClient.delete(`/programs/${programId}`);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to delete program');
    }
  },

  // Update target in program
  updateTarget: async (programId, targetId, targetData) => {
    try {
      const response = await apiClient.put(`/programs/${programId}/targets/${targetId}`, targetData);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to update target');
    }
  },
  
  // Add target to program
  addTarget: async (programId, targetData) => {
    try {
      const response = await apiClient.post(`/programs/${programId}/targets`, targetData);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to add target');
    }
  },
  
  // Remove target from program
  removeTarget: async (programId, targetId) => {
    try {
      const response = await apiClient.delete(`/programs/${programId}/targets/${targetId}`);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to remove target');
    }
  }
};

// Notification API functions
export const notificationAPI = {
  // Get notifications for current user
  getNotifications: async (params = {}) => {
    try {
      const response = await apiClient.get('/notifications', { params });
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to fetch notifications');
    }
  },

  // Get notification by ID
  getNotificationById: async (notificationId) => {
    try {
      const response = await apiClient.get(`/notifications/${notificationId}`);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to fetch notification');
    }
  },

  // Create notification (admin only)
  createNotification: async (notificationData) => {
    try {
      const response = await apiClient.post('/notifications', notificationData);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to create notification');
    }
  },

  // Mark notification as read
  markAsRead: async (notificationId) => {
    try {
      const response = await apiClient.put(`/notifications/${notificationId}/read`);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to mark notification as read');
    }
  },

  // Mark all notifications as read
  markAllAsRead: async () => {
    try {
      const response = await apiClient.put('/notifications/read-all');
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to mark all notifications as read');
    }
  },

  // Delete notification
  deleteNotification: async (notificationId) => {
    try {
      const response = await apiClient.delete(`/notifications/${notificationId}`);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to delete notification');
    }
  }
};

// Invoice API functions
export const invoiceAPI = {
  // Get all invoices (admin)
  getAllInvoices: async () => {
    try {
      const response = await apiClient.get('/invoices');
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to fetch invoices');
    }
  },

  // Get invoice by ID
  getInvoiceById: async (invoiceId) => {
    try {
      const response = await apiClient.get(`/invoices/${invoiceId}`);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to fetch invoice');
    }
  },

  // Create invoice (admin)
  createInvoice: async (invoiceData) => {
    try {
      const response = await apiClient.post('/invoices', invoiceData);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to create invoice');
    }
  },

  // Update invoice (admin)
  updateInvoice: async (invoiceId, invoiceData) => {
    try {
      const response = await apiClient.put(`/invoices/${invoiceId}`, invoiceData);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to update invoice');
    }
  },

  // Delete invoice (admin)
  deleteInvoice: async (invoiceId) => {
    try {
      const response = await apiClient.delete(`/invoices/${invoiceId}`);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to delete invoice');
    }
  },

  // Get invoices by child ID
  getInvoicesByChildId: async (childId) => {
    try {
      const response = await apiClient.get(`/invoices/child/${childId}`);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to fetch invoices');
    }
  },

  // Get invoices by parent ID
  getInvoicesByParentId: async (parentId) => {
    try {
      const response = await apiClient.get(`/invoices/parent/${parentId}`);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to fetch invoices');
    }
  },

  // Download invoice as PDF
  downloadInvoicePDF: async (invoiceId) => {
    try {
      // Use the axios instance directly to handle binary response
      const response = await apiClient({
        method: 'GET',
        url: `/invoices/${invoiceId}/pdf`,
        responseType: 'blob', // Important for handling binary data
      });
      return response;
    } catch (error) {
      console.error('Download PDF error details:', {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        statusText: error.response?.statusText,
        url: error.request?.responseURL
      });
      handleApiError(error, 'Failed to download invoice PDF');
    }
  }
};

// Complaint API functions
export const complaintAPI = {
  // Get all complaints (admin)
  getAllComplaints: async () => {
    try {
      const response = await apiClient.get('/complaints');
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to fetch complaints');
    }
  },

  // Get complaint by ID
  getComplaintById: async (complaintId) => {
    try {
      const response = await apiClient.get(`/complaints/${complaintId}`);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to fetch complaint');
    }
  },

  // Create complaint (parent)
  createComplaint: async (complaintData) => {
    try {
      const response = await apiClient.post('/complaints', complaintData);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to create complaint');
    }
  },

  // Update complaint (admin)
  updateComplaint: async (complaintId, complaintData) => {
    try {
      const response = await apiClient.put(`/complaints/${complaintId}`, complaintData);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to update complaint');
    }
  },

  // Delete complaint (admin)
  deleteComplaint: async (complaintId) => {
    try {
      const response = await apiClient.delete(`/complaints/${complaintId}`);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to delete complaint');
    }
  },

  // Get complaints by child ID
  getComplaintsByChildId: async (childId) => {
    try {
      const response = await apiClient.get(`/complaints/child/${childId}`);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to fetch complaints');
    }
  },

  // Get complaints by parent ID
  getComplaintsByParentId: async (parentId) => {
    try {
      const response = await apiClient.get(`/complaints/parent/${parentId}`);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to fetch complaints');
    }
  }
};

// Schedule API functions
export const scheduleAPI = {
  // Get all schedules (admin)
  getAllSchedules: async () => {
    try {
      const response = await apiClient.get('/schedules');
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to fetch schedules');
    }
  },

  // Get schedule by ID
  getScheduleById: async (scheduleId) => {
    try {
      const response = await apiClient.get(`/schedules/${scheduleId}`);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to fetch schedule');
    }
  },

  // Create schedule (admin)
  createSchedule: async (scheduleData) => {
    try {
      const response = await apiClient.post('/schedules', scheduleData);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to create schedule');
    }
  },

  // Update schedule (admin)
  updateSchedule: async (scheduleId, scheduleData) => {
    try {
      const response = await apiClient.put(`/schedules/${scheduleId}`, scheduleData);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to update schedule');
    }
  },

  // Delete schedule (admin)
  deleteSchedule: async (scheduleId) => {
    try {
      const response = await apiClient.delete(`/schedules/${scheduleId}`);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to delete schedule');
    }
  },

  // Get schedules by child ID
  getSchedulesByChildId: async (childId) => {
    try {
      const response = await apiClient.get(`/schedules/child/${childId}`);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to fetch schedules');
    }
  },

  // Get schedules by therapist ID
  getSchedulesByTherapistId: async (therapistId) => {
    try {
      const response = await apiClient.get(`/schedules/therapist/${therapistId}`);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to fetch schedules');
    }
  }
};

// Leave Request API functions
export const leaveAPI = {
  // Get all leave requests (admin)
  getAllLeaveRequests: async () => {
    try {
      const response = await apiClient.get('/leave');
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to fetch leave requests');
      // Always return a default value to prevent undefined
      return [];
    }
  },

  // Get leave request by ID
  getLeaveRequestById: async (leaveId) => {
    try {
      const response = await apiClient.get(`/leave/${leaveId}`);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to fetch leave request');
      // Always return a default value to prevent undefined
      return null;
    }
  },

  // Create leave request (therapist)
  createLeaveRequest: async (leaveData) => {
    try {
      const response = await apiClient.post('/leave', leaveData);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to create leave request');
      // Always return a default value to prevent undefined
      return { success: false, message: 'Failed to create leave request' };
    }
  },

  // Update leave request (admin)
  updateLeaveRequest: async (leaveId, leaveData) => {
    try {
      const response = await apiClient.put(`/leave/${leaveId}`, leaveData);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to update leave request');
      // Always return a default value to prevent undefined
      return { success: false, message: 'Failed to update leave request' };
    }
  },

  // Delete leave request (admin)
  deleteLeaveRequest: async (leaveId) => {
    try {
      const response = await apiClient.delete(`/leave/${leaveId}`);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to delete leave request');
      // Always return a default value to prevent undefined
      return { success: false, message: 'Failed to delete leave request' };
    }
  },

  // Get pending leave requests (admin)
  getPendingLeaveRequests: async () => {
    try {
      const response = await apiClient.get('/leave/pending');
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to fetch pending leave requests');
      // Always return a default value to prevent undefined
      return [];
    }
  },

  // Get leave requests by therapist ID
  getLeaveRequestsByTherapistId: async (therapistId) => {
    try {
      const response = await apiClient.get(`/leave/therapist/${therapistId}`);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to fetch leave requests');
      // Always return a default value to prevent undefined
      return [];
    }
  }
};

// Fee API functions
export const feeAPI = {
  // Get all fees (admin)
  getAllFees: async () => {
    try {
      const response = await apiClient.get('/fees');
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to fetch fees');
    }
  },

  // Get fee by ID
  getFeeById: async (feeId) => {
    try {
      const response = await apiClient.get(`/fees/${feeId}`);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to fetch fee');
    }
  },

  // Create fee (admin)
  createFee: async (feeData) => {
    try {
      const response = await apiClient.post('/fees', feeData);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to create fee');
    }
  },

  // Update fee (admin)
  updateFee: async (feeId, feeData) => {
    try {
      const response = await apiClient.put(`/fees/${feeId}`, feeData);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to update fee');
    }
  },

  // Delete fee (admin)
  deleteFee: async (feeId) => {
    try {
      const response = await apiClient.delete(`/fees/${feeId}`);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to delete fee');
    }
  },

  // Get fees by child ID
  getFeesByChildId: async (childId) => {
    try {
      const response = await apiClient.get(`/fees/child/${childId}`);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to fetch fees');
    }
  },

  // Get fees by parent ID
  getFeesByParentId: async (parentId) => {
    try {
      const response = await apiClient.get(`/fees/parent/${parentId}`);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to fetch fees');
    }
  },

  // Get parent fee summary
  getParentFeeSummary: async (parentId) => {
    try {
      const response = await apiClient.get(`/fees/summary/${parentId}`);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to fetch fee summary');
    }
  }
};

// Session API functions
export const sessionAPI = {
  getSessions: async (params = {}) => {
    try {
      const response = await apiClient.get('/sessions', { params });
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to fetch sessions');
    }
  },

  getSessionById: async (sessionId) => {
    try {
      const response = await apiClient.get(`/sessions/${sessionId}`);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to fetch session');
    }
  },

  createSession: async (sessionData) => {
    try {
      const response = await apiClient.post('/sessions', sessionData);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to create session');
    }
  },

  updateSession: async (sessionId, sessionData) => {
    try {
      const response = await apiClient.put(`/sessions/${sessionId}`, sessionData);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to update session');
    }
  },

  deleteSession: async (sessionId) => {
    try {
      const response = await apiClient.delete(`/sessions/${sessionId}`);
      return response.data;
    } catch (error) {
      console.error('Delete session API error details:', {
        sessionId,
        message: error.message,
        code: error.code,
        status: error.response?.status,
        statusText: error.response?.statusText,
        url: error.request?.responseURL,
        data: error.response?.data
      });
      handleApiError(error, 'Failed to delete session');
    }
  },

  getTherapistAvailability: async (therapistId, date) => {
    try {
      const response = await apiClient.get(`/sessions/availability/${therapistId}`, { params: { date } });
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to fetch availability');
    }
  }
};

// Feedback API functions
export const feedbackAPI = {
  getFeedbackByChild: async (childId, params = {}) => {
    try {
      const response = await apiClient.get(`/feedback/child/${childId}`, { params });
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to fetch feedback');
    }
  },

  getFeedbackById: async (feedbackId) => {
    try {
      const response = await apiClient.get(`/feedback/${feedbackId}`);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to fetch feedback');
    }
  },

  createFeedback: async (feedbackData) => {
    try {
      const response = await apiClient.post('/feedback', feedbackData);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to create feedback');
    }
  },

  updateFeedback: async (feedbackId, feedbackData) => {
    try {
      const response = await apiClient.put(`/feedback/${feedbackId}`, feedbackData);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to update feedback');
    }
  },

  deleteFeedback: async (feedbackId) => {
    try {
      const response = await apiClient.delete(`/feedback/${feedbackId}`);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to delete feedback');
    }
  }
};

// User API functions
export const userAPI = {
  // Get all users (admin)
  getAllUsers: async () => {
    try {
      const response = await apiClient.get('/users');
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to fetch users');
    }
  },

  // Get users by role (admin)
  getUsersByRole: async (role) => {
    try {
      const response = await apiClient.get(`/users/role/${role}`);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to fetch users by role');
    }
  },

  // Get user by ID
  getUserById: async (userId) => {
    try {
      const response = await apiClient.get(`/users/${userId}`);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to fetch user');
    }
  },

  // Update user
  updateUser: async (userId, userData) => {
    try {
      const response = await apiClient.put(`/users/${userId}`, userData);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to update user');
    }
  },

  // Delete user (admin)
  deleteUser: async (userId) => {
    try {
      const response = await apiClient.delete(`/users/${userId}`);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to delete user');
    }
  }
};

// Therapist API functions
export const therapistAPI = {
  // Get all therapists (admin)
  getAllTherapists: async () => {
    try {
      const response = await apiClient.get('/therapists');
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to fetch therapists');
    }
  },

  // Get therapist by ID
  getTherapistById: async (therapistId) => {
    try {
      const response = await apiClient.get(`/therapists/${therapistId}`);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to fetch therapist');
    }
  },

  // Update therapist (admin)
  updateTherapist: async (therapistId, therapistData) => {
    try {
      const response = await apiClient.put(`/therapists/${therapistId}`, therapistData);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to update therapist');
    }
  },

  // Deactivate therapist (admin)
  deactivateTherapist: async (therapistId) => {
    try {
      const response = await apiClient.put(`/therapists/${therapistId}/deactivate`);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to deactivate therapist');
    }
  },

  // Reactivate therapist (admin)
  reactivateTherapist: async (therapistId) => {
    try {
      const response = await apiClient.put(`/therapists/${therapistId}/reactivate`);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to reactivate therapist');
    }
  },

  // Assign child to therapist (admin)
  assignChild: async (therapistId, childId) => {
    try {
      const response = await apiClient.put(`/therapists/${therapistId}/assign-child/${childId}`);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to assign child');
    }
  },

  // Get children assigned to therapist
  getChildren: async (therapistId) => {
    try {
      const response = await apiClient.get(`/therapists/${therapistId}/children`);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to fetch therapist children');
    }
  },

  // Delete therapist permanently (admin)
  deleteTherapist: async (therapistId) => {
    try {
      console.log(`API: Deleting therapist ${therapistId}`);
      const response = await apiClient.delete(`/therapists/${therapistId}`);
      console.log('API: Delete response:', response.data);
      return response.data;
    } catch (error) {
      console.error('API: Delete error:', error);
      handleApiError(error, 'Failed to delete therapist');
      // Return a default error response to prevent undefined returns
      const errorMessage = error.response?.data?.message || error.message || 'Failed to delete therapist';
      return { success: false, message: errorMessage };
    }
  }
};

// Video API functions
export const videoAPI = {
  // Get videos by therapist
  getVideosByTherapist: async () => {
    try {
      const response = await apiClient.get('/videos');
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to fetch videos');
    }
  },

  // Get videos by child
  getVideosByChild: async (childId) => {
    try {
      const response = await apiClient.get(`/videos/child/${childId}`);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to fetch videos');
    }
  },

  // Get video by ID
  getVideoById: async (videoId) => {
    try {
      const response = await apiClient.get(`/videos/${videoId}`);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to fetch video');
    }
  },

  // Create video
  createVideo: async (videoData) => {
    try {
      const response = await apiClient.post('/videos', videoData);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to create video');
    }
  },

  // Update video
  updateVideo: async (videoId, videoData) => {
    try {
      const response = await apiClient.put(`/videos/${videoId}`, videoData);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to update video');
    }
  },

  // Delete video
  deleteVideo: async (videoId) => {
    try {
      const response = await apiClient.delete(`/videos/${videoId}`);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to delete video');
    }
  }
};

// Admin API functions
export const adminAPI = {
  // Get admin dashboard statistics
  getDashboardStats: async () => {
    try {
      const response = await apiClient.get('/admin/dashboard');
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to fetch dashboard statistics');
    }
  }
};

export default apiClient;

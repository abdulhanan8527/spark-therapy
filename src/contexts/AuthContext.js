import React, { createContext, useState, useEffect, useContext } from 'react';
import { authAPI } from '../services/api';

import storage from '../utils/StorageUtils';

// Create Auth Context
const AuthContext = createContext();

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState(null);

  // Check if user is logged in on app start
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      // Clear any previous errors on app start
      setError(null);
      
      // Add small delay to ensure storage is ready in web environments
      await new Promise(resolve => setTimeout(resolve, 10));
      
      const authToken = await storage.getItem('userToken');
      const refreshToken = await storage.getItem('refreshToken');
      const userData = await storage.getItem('userData');

      if (authToken && userData) {
        let parsedUserData;
        try {
          parsedUserData = JSON.parse(userData);
        } catch (parseError) {
          console.error('Error parsing user data:', parseError);
          // Clear corrupted data
          await storage.removeItem('userToken');
          await storage.removeItem('userData');
          return;
        }
        
        // Validate token expiration
        try {
          const payload = JSON.parse(atob(authToken.split('.')[1]));
          const exp = payload.exp * 1000; // Convert to milliseconds
          const now = Date.now();
          
          if (exp < now) {
            // Token expired, clear storage
            console.log('Token expired, clearing authentication data');
            await storage.removeItem('userToken');
            await storage.removeItem('userData');
            return;
          }
        } catch (tokenError) {
          console.error('Error validating token:', tokenError);
          // Invalid token format, clear storage
          await storage.removeItem('userToken');
          await storage.removeItem('userData');
          return;
        }
        
        setUser(parsedUserData);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      // Don't set error here to avoid showing error screen on app start
      // setError(error.message);
    } finally {
      // Always set loading to false when check is complete
      setIsLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      // Clear any previous errors
      setError(null);
      
      const response = await authAPI.login(credentials);
      if (response.success) {
        setUser(response.data);
        setIsAuthenticated(true);
        setError(null);
        return { success: true, data: response.data };
      } else {
        const message = response.message || 'Login failed';
        setError(message);
        return { success: false, message };
      }
    } catch (error) {
      let message = error.message || 'An error occurred during login';
      
      // Handle specific authentication errors
      if (error.isAuthError) {
        if (error.statusCode === 401) {
          message = 'Invalid email or password. Please check your credentials and try again.';
        }
      } else if (error.message && typeof error.message === 'string' && error.message.includes('Network error')) {
        message = 'Unable to connect to server. Please check your internet connection and try again.';
      } else if (error.message && typeof error.message === 'string' && error.message.includes('connect to server')) {
        message = 'Server is not responding. Please make sure the backend server is running.';
      }
      
      // Production error logging
      if (!__DEV__) {
        // In production, send to error reporting service
        // logErrorToService('auth_login_failed', { error: message, credentials: { email: credentials.email } });
      } else {
        console.error('AuthContext Login Error:', message);
      }
      
      setError(message);
      return { success: false, message };
    }
  };

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      if (response.success) {
        return { success: true, data: response.data };
      } else {
        const message = response.message || 'Registration failed';
        setError(message);
        return { success: false, message };
      }
    } catch (error) {
      const message = error.message || 'An error occurred during registration';
      console.error('AuthContext Register Error:', message);
      setError(message);
      return { success: false, message };
    }
  };

  const logout = async () => {
    try {
      // Clear any previous errors
      setError(null);
      
      // Attempt to logout on backend
      await authAPI.logout();
      
      // Clear all local storage
      await Promise.all([
        storage.removeItem('userToken'),
        storage.removeItem('userData'),
        storage.removeItem('refreshToken')
      ]);
      
      // Reset state
      setUser(null);
      setIsAuthenticated(false);
      setError(null);
      
      // Clear any cached API data
      // apiClient.defaults.headers.common['Authorization'] = '';
      
    } catch (error) {
      // Even if logout fails, clear local data for security
      await Promise.all([
        storage.removeItem('userToken'),
        storage.removeItem('userData'),
        storage.removeItem('refreshToken')
      ]);
      
      setUser(null);
      setIsAuthenticated(false);
      setError(null);
      
      // Log error in development only
      if (__DEV__) {
        console.error('Error during logout:', error);
      }
    }
  };

  const updateUser = async (userData) => {
    try {
      // Clear any previous errors
      setError(null);
      
      const response = await authAPI.updateProfile(userData);
      if (response.success) {
        setUser(response.data);
        setError(null);
        return { success: true, data: response.data };
      } else {
        setError(response.message);
        return { success: false, message: response.message };
      }
    } catch (error) {
      const message = error.message || 'Failed to update profile';
      setError(message);
      
      // Production error logging
      if (!__DEV__) {
        // logErrorToService('profile_update_failed', { error: message });
      } else {
        console.error('AuthContext Update User Error:', message);
      }
      
      return { success: false, message };
    }
  };

  const value = {
    user,
    isLoading,
    isAuthenticated,
    error,
    login,
    register,
    logout,
    updateUser,
    checkAuthStatus
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
// Environment configuration for SPARK Therapy Mobile App
// This file manages different API endpoints for various environments

// Determine platform and environment more comprehensively
const getPlatformType = () => {
  // Check if running in web environment
  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    return 'web';
  }
  
  // Check if running in Expo environment
  try {
    // Attempt to check for Expo environment variables
    if (typeof process !== 'undefined' && process.env && process.env.EXPO_DEBUG) {
      return 'expo';
    }
  } catch (e) {
    // Ignore errors
  }
  
  // Check for Expo in userAgent or global scope
  if (typeof navigator !== 'undefined') {
    const userAgent = navigator.userAgent || '';
    if (userAgent.includes('Expo') || userAgent.includes('ReactNative')) {
      return 'expo';
    }
  }
  
  // Check for global Expo object
  if (typeof global !== 'undefined' && global.Expo) {
    return 'expo';
  }
  
  // Default to native for other cases
  return 'native';
};

const PLATFORM_TYPE = getPlatformType();

const ENV = {
  development: {
    // For web browsers: use localhost
    // For Expo Go client: use your actual IP address
    // For standalone native apps: use host IP
    API_BASE_URL: process.env.REACT_APP_API_BASE_URL || 
      (PLATFORM_TYPE === 'web' ? 'http://localhost:5001/api' : 'http://192.168.100.83:5001/api'),
    // Fallback for development when backend is on different port
    BACKEND_URL: process.env.REACT_APP_BACKEND_URL || 'http://localhost:5001',
    // Alternative IPs that might work depending on setup:
    // 'http://10.0.2.2:5001/api' for Android emulator
    // 'http://192.168.100.83:5001/api' for real device (YOUR CURRENT IP)
    // Find your IP: Windows - ipconfig, Mac/Linux - ifconfig
    // Replace with your actual IP address
  },
  staging: {
    API_BASE_URL: process.env.REACT_APP_API_BASE_URL || 'https://staging-api.sparktherapy.com/api',
  },
  production: {
    API_BASE_URL: process.env.REACT_APP_API_BASE_URL || 'https://sparktherapy-backend.onrender.com/api',
    // Add timeout and retry configuration for production
    REQUEST_TIMEOUT: 30000,
    MAX_RETRIES: 3,
  },
};

// Get environment - defaults to development based on build environment
const getEnvVars = () => {
  let env = 'development';
  
  if (process.env.NODE_ENV === 'production') {
    env = 'production';
  } else if (process.env.NODE_ENV === 'staging') {
    env = 'staging';
  }
  
  return ENV[env] || ENV.development;
};

export default getEnvVars;
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const authConfig = require('../config/auth');
const User = require('../models/User');
const { successResponse, errorResponse } = require('../utils/responseHandler');

// Generate JWT access token
const generateAccessToken = (id) => {
  return jwt.sign(
    { id },
    authConfig.jwtSecret,
    {
      expiresIn: authConfig.jwtExpire,
      issuer: 'spark-therapy-api',
      audience: 'spark-therapy-client'
    }
  );
};

// Generate JWT refresh token
const generateRefreshToken = (id) => {
  return jwt.sign(
    { id },
    authConfig.jwtRefreshSecret,
    {
      expiresIn: authConfig.jwtRefreshExpire,
      issuer: 'spark-therapy-api',
      audience: 'spark-therapy-client'
    }
  );
};

// Generate secure refresh token hash for database storage
const generateRefreshTokenHash = (refreshToken) => {
  return crypto.createHash('sha256').update(refreshToken).digest('hex');
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  const { name, email, password, role, phone, specialization, adminSecretKey } = req.body;

  try {
    // Validate admin secret key if role is admin
    if (role === 'admin') {
      const ADMIN_SECRET_KEY = process.env.ADMIN_SECRET_KEY || 'SPARK_ADMIN_2026_SECRET';
      
      if (!adminSecretKey) {
        return errorResponse(res, 'Admin secret key is required to create an admin account', 403);
      }
      
      if (adminSecretKey !== ADMIN_SECRET_KEY) {
        console.warn('Failed admin signup attempt with invalid key:', {
          email,
          providedKey: adminSecretKey,
          timestamp: new Date().toISOString()
        });
        return errorResponse(res, 'Invalid admin secret key. Contact system administrator.', 403);
      }
      
      console.log('Valid admin secret key provided for:', email);
    }
    
    // Check if user exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      return errorResponse(res, 'User already exists', 400);
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role,
      phone: phone || '',
      specialization: specialization || ''
    });

    if (user) {
      // Generate tokens
      const accessToken = generateAccessToken(user._id);
      const refreshToken = generateRefreshToken(user._id);
      const refreshTokenHash = generateRefreshTokenHash(refreshToken);
      
      // Store refresh token hash in database
      user.refreshToken = refreshTokenHash;
      user.lastLogin = new Date();
      user.resetLoginAttempts();
      await user.save();
      
      successResponse(res, {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        accessToken,
        refreshToken
      }, 'User registered successfully', 201);
    } else {
      errorResponse(res, 'Invalid user data', 400);
    }
  } catch (error) {
    console.error('Registration error:', error);
    errorResponse(res, error.message, 500);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user by email
    const user = await User.findOne({ email });

    // Check if account is locked
    if (user && user.isLocked) {
      return errorResponse(res, 'Account is temporarily locked due to multiple failed login attempts. Please try again later.', 423);
    }

    // Validate credentials
    if (user && (await user.comparePassword(password))) {
      // Reset login attempts on successful login
      await user.resetLoginAttempts();
      
      // Generate tokens
      const accessToken = generateAccessToken(user._id);
      const refreshToken = generateRefreshToken(user._id);
      const refreshTokenHash = generateRefreshTokenHash(refreshToken);
      
      // Store refresh token hash in database
      user.refreshToken = refreshTokenHash;
      user.lastLogin = new Date();
      await user.save();
      
      successResponse(res, {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        accessToken,
        refreshToken
      }, 'Login successful');
    } else {
      // Increment login attempts on failed login
      if (user) {
        await user.incLoginAttempts();
        if (user.isLocked) {
          return errorResponse(res, 'Account locked due to multiple failed login attempts. Please try again in 2 hours.', 423);
        }
      }
      errorResponse(res, 'Invalid email or password', 401);
    }
  } catch (error) {
    errorResponse(res, error.message, 500);
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logoutUser = async (req, res) => {
  try {
    // Remove refresh token from database
    await User.findByIdAndUpdate(req.user._id, {
      $unset: { refreshToken: 1 }
    });
    
    successResponse(res, null, 'Logged out successfully');
  } catch (error) {
    errorResponse(res, error.message, 500);
  }
};

// @desc    Refresh access token
// @route   POST /api/auth/refresh
// @access  Public
const refreshAccessToken = async (req, res) => {
  const { refreshToken } = req.body;
  
  if (!refreshToken) {
    return errorResponse(res, 'Refresh token is required', 400);
  }
  
  try {
    // Verify refresh token
    const decoded = jwt.verify(refreshToken, authConfig.jwtRefreshSecret, {
      issuer: 'spark-therapy-api',
      audience: 'spark-therapy-client'
    });
    
    // Find user and verify refresh token hash
    const user = await User.findById(decoded.id);
    
    if (!user || !user.refreshToken) {
      return errorResponse(res, 'Invalid refresh token', 401);
    }
    
    // Verify refresh token hash matches
    const refreshTokenHash = generateRefreshTokenHash(refreshToken);
    if (refreshTokenHash !== user.refreshToken) {
      return errorResponse(res, 'Invalid refresh token', 401);
    }
    
    // Check if user is active
    if (!user.isActive) {
      return errorResponse(res, 'Account is deactivated', 401);
    }
    
    // Generate new tokens
    const newAccessToken = generateAccessToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);
    const newRefreshTokenHash = generateRefreshTokenHash(newRefreshToken);
    
    // Update refresh token in database
    user.refreshToken = newRefreshTokenHash;
    await user.save();
    
    successResponse(res, {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    }, 'Token refreshed successfully');
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return errorResponse(res, 'Refresh token has expired', 401);
    }
    if (error.name === 'JsonWebTokenError') {
      return errorResponse(res, 'Invalid refresh token', 401);
    }
    errorResponse(res, error.message, 500);
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');

    if (user) {
      successResponse(res, user, 'User retrieved successfully');
    } else {
      errorResponse(res, 'User not found', 404);
    }
  } catch (error) {
    errorResponse(res, error.message, 500);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.phone = req.body.phone || user.phone;
      user.specialization = req.body.specialization || user.specialization;

      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      successResponse(res, {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        accessToken: generateAccessToken(updatedUser._id)
      }, 'User updated successfully');
    } else {
      errorResponse(res, 'User not found', 404);
    }
  } catch (error) {
    errorResponse(res, error.message, 500);
  }
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  getUserProfile,
  updateUserProfile
};

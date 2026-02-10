const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User.model');
const Business = require('../models/Business.model');
const { USER_ROLES } = require('../config/constants');

// Generate JWT Token
const generateToken = (userId, role) => {
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );
};

// Register new user
exports.register = async (req, res) => {
  try {
    const { email, password, fullName, phone, role, businessData } = req.body;

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      email,
      password: hashedPassword,
      fullName,
      phone,
      role: role || USER_ROLES.CUSTOMER
    });

    // If user is business owner, create business
    let business = null;
    if (role === USER_ROLES.BUSINESS_OWNER && businessData) {
      business = await Business.create({
        ...businessData,
        ownerId: user.id,
        email: user.email
      });

      // Update user with business ID
      await User.update(user.id, { businessId: business.id });
    }

    // Generate token
    const token = generateToken(user.id, user.role);

    // Remove password from response
    const userResponse = { ...user };
    delete userResponse.password;

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: userResponse,
      business: business ? {
        id: business.id,
        name: business.name,
        businessCode: business.businessCode
      } : null
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Error registering user',
      error: error.message
    });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Get business details if user has business
    let business = null;
    if (user.businessId) {
      business = await Business.findById(user.businessId);
    }

    // Update last login
    await User.update(user.id, { lastLogin: new Date() });

    // Generate token
    const token = generateToken(user.id, user.role);

    // Remove password from response
    const userResponse = { ...user };
    delete userResponse.password;

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: userResponse,
      business: business ? {
        id: business.id,
        name: business.name,
        businessCode: business.businessCode
      } : null
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error logging in',
      error: error.message
    });
  }
};

// Get current user
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get business details if user has business
    let business = null;
    if (user.businessId) {
      business = await Business.findById(user.businessId);
    }

    // Remove password from response
    const userResponse = { ...user };
    delete userResponse.password;

    res.status(200).json({
      success: true,
      user: userResponse,
      business: business ? {
        id: business.id,
        name: business.name,
        businessCode: business.businessCode,
        settings: business.settings
      } : null
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user',
      error: error.message
    });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const { fullName, phone, notificationPreferences } = req.body;
    const updateData = {};

    if (fullName) updateData.fullName = fullName;
    if (phone) updateData.phone = phone;
    if (notificationPreferences) updateData.notificationPreferences = notificationPreferences;

    const updatedUser = await User.update(req.user.userId, updateData);

    // Remove password from response
    const userResponse = { ...updatedUser };
    delete userResponse.password;

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: userResponse
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: error.message
    });
  }
};

// Change password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Get user
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await User.update(user.id, { password: hashedPassword });

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Error changing password',
      error: error.message
    });
  }
};

// Logout (client-side token removal)
exports.logout = (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
};
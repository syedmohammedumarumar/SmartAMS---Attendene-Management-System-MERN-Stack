// src/controllers/authController.js
const User = require('../models/User');
const Class = require('../models/Class');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
// src/controllers/authController.js - Fix the register function
exports.register = async (req, res) => {
    try {
      const { name, email, password, role, className, totalStudents } = req.body;
  
      // Check if user already exists
      const userExists = await User.findOne({ email });
      if (userExists) {
        return res.status(400).json({
          success: false,
          message: 'User already exists',
        });
      }
  
      // Create user
      const user = await User.create({
        name,
        email,
        password,
        role,
      });
  
      // If role is CR, create a class
      if (role === 'CR' && className) {
        // Ensure totalStudents is at least 1
        const studentsCount = totalStudents ? Math.max(1, parseInt(totalStudents)) : 1;
        
        const newClass = await Class.create({
          name: className,
          totalStudents: studentsCount,
        });
        
        // Link class to the CR
        user.classId = newClass._id;
        await user.save();
      }
  
      sendTokenResponse(user, 201, res);
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  };

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an email and password',
      });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    let user = await User.findById(req.user.id);
    
    // If user is CR, include class details
    if (user.role === 'CR' && user.classId) {
      user = await User.findById(req.user.id).populate('classId');
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Log user out / clear cookie
// @route   GET /api/auth/logout
// @access  Private
exports.logout = async (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    data: {},
  });
};

// Helper function to get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
    // Create token
    const token = user.getSignedJwtToken();
  
    const options = {
      // The issue is here - we're using JWT_COOKIE_EXPIRE which isn't defined in the .env file
      expires: new Date(
        Date.now() + 30 * 24 * 60 * 60 * 1000 // Use a direct value: 30 days
      ),
      httpOnly: true,
    };
  
    // Use secure flag in production
    if (process.env.NODE_ENV === 'production') {
      options.secure = true;
    }
  
    res
      .status(statusCode)
      .cookie('token', token, options)
      .json({
        success: true,
        token,
      });
  };
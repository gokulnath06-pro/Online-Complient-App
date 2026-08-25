import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Helper to generate JWT Token
const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'super_secret_jwt_complaint_key_2026_modern_mern',
    {
      expiresIn: process.env.JWT_EXPIRE || '7d',
    }
  );
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res, next) => {
  try {
    const { name, email, password, role, department, phone } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email address already exists.',
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'USER',
      department: department || (role === 'AGENT' ? 'Technical Support' : 'General Support'),
      phone: phone || '',
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Account registered successfully',
      token,
      user,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Login user & return JWT token
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password credentials.',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated. Please contact support/administrator.',
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password credentials.',
      });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      token,
      user: user.toJSON(),
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get currently logged in user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      success: true,
      user,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, department, avatar } = req.body;
    const user = await User.findById(req.user.id);

    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (department !== undefined) user.department = department;
    if (avatar !== undefined) user.avatar = avatar;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all agents (for ticket assignment dropdowns)
// @route   GET /api/auth/agents
// @access  Private (Admin & Agent)
export const getAgents = async (req, res, next) => {
  try {
    const agents = await User.find({ role: 'AGENT', isActive: true }).select(
      'name email role department avatar'
    );
    res.status(200).json({
      success: true,
      count: agents.length,
      agents,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all users (Admin view)
// @route   GET /api/auth/users
// @access  Private (Admin only)
export const getAllUsers = async (req, res, next) => {
  try {
    const { role, search, page = 1, limit = 50 } = req.query;
    const query = {};

    if (role) {
      query.role = role;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { department: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      users,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Admin update user role or status
// @route   PUT /api/auth/users/:id
// @access  Private (Admin only)
export const updateUserRole = async (req, res, next) => {
  try {
    const { role, isActive, department } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (role) user.role = role;
    if (typeof isActive === 'boolean') user.isActive = isActive;
    if (department) user.department = department;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'User status updated successfully',
      user,
    });
  } catch (err) {
    next(err);
  }
};

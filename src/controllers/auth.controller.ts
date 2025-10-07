import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import User from '../models/User.js';

/**
 * Login controller
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const login = async (req, res, next) => {
  try {
    console.log("📥 Login request received:");
    console.log("🔍 Request headers:", req.headers);
    console.log("📋 Request body:", req.body);
    console.log("📏 Body type:", typeof req.body);
    console.log("📏 Body keys:", Object.keys(req.body || {}));
    
    const { email, password } = req.body;
    
    console.log("📧 Extracted email:", email);
    console.log("🔑 Extracted password:", password ? "***" : "undefined");
    console.log("📧 Email type:", typeof email);
    console.log("🔑 Password type:", typeof password);

    // Find user by email and include password field
    const user = await User.findOne({ email }).select('+password');
    
    console.log("👤 User lookup result:", user ? "User found" : "No user found");
    if (user) {
      console.log("👤 User details:", { id: user._id, email: user.email, role: user.role });
    }

    if (!user) {
      console.log("❌ No user found, returning 401");
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Create JWT token
    const token = jwt.sign(
      { 
        id: user._id, 
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    // Return success response
    const responseData = {
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      }
    };
    
    console.log("📤 Login response sent:", {
      role: user.role,
      id: user._id,
      redirectPath: `/${user.role}/${user._id}/dashboard`
    });
    
    res.status(200).json(responseData);

  } catch (error) {
    next(error);
  }
};

/**
 * Register controller
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const register = async (req, res, next) => {
  try {
    console.log("📥 Register request received:", req.body);
    
    const { name, email, password, phone, gender, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log("❌ User already exists with email:", email);
      return res.status(409).json({
        success: false,
        error: 'User with this email already exists'
      });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    console.log("🔐 Password hashed successfully");

    // Create new user
    const user = new User({
      name,
      email,
      password: hashedPassword,
      phone,
      gender,
      role
    });

    await user.save();
    console.log("✅ User created successfully:", { id: user._id, email: user.email, role: user.role });

    // Create JWT token
    const token = jwt.sign(
      { 
        id: user._id, 
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    // Return success response
    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      }
    });

  } catch (error) {
    console.error("❌ Registration error:", error);
    next(error);
  }
};


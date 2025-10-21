import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import User from '../models/User.js';
import { Parent } from '../models/Parent.model.js';
import Student from '../models/Student.model.js';
import { Teacher } from '../models/Teacher.model.js';
import { Request, Response, NextFunction } from 'express';

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

    // For role-specific users, fetch the role document to get roleSpecificId
    let roleSpecificId = null;
    if (user.role === 'parent') {
      const parent = await Parent.findOne({ userId: user._id }).select('_id').lean();
      if (parent) {
        roleSpecificId = parent._id;
        console.log('👨‍👩‍👧 Parent document found:', parent._id);
      }
    } else if (user.role === 'student') {
      const student = await Student.findOne({ userId: user._id }).select('_id').lean();
      if (student) {
        roleSpecificId = student._id;
        console.log('👨‍🎓 Student document found:', student._id);
      }
    } else if (user.role === 'teacher') {
      const teacher = await Teacher.findOne({ userId: user._id }).select('_id').lean();
      if (teacher) {
        roleSpecificId = teacher._id;
        console.log('👨‍🏫 Teacher document found:', teacher._id);
      }
    }

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
          role: user.role,
          roleSpecificId: roleSpecificId // parentId for parents, studentId for students
        }
      }
    };
    
    console.log("📤 Login response sent:", {
      role: user.role,
      id: user._id,
      roleSpecificId: roleSpecificId,
      redirectPath: user.role === 'parent' ? `/parent/${roleSpecificId}` : `/${user.role}/${roleSpecificId}/dashboard`
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

    const { name, email, password, phone, gender, role, classes, subject, fullName, childrenEmails, className } = req.body;

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
    
    // 🔍 DETAILED DATABASE LOGGING
    console.log("🔍 DATABASE CONNECTION DETAILS:");
    console.log("  Connected DB:", mongoose.connection.name);
    console.log("  DB Host:", mongoose.connection.host);
    console.log("  DB Port:", mongoose.connection.port);
    console.log("  Saved in collection:", user.collection.collectionName);
    console.log("  User document ID:", user._id);
    console.log("  Full connection URI:", process.env.MONGO_URI);

    // Create role-specific document based on user role
    let roleSpecificId = null;
    if (user.role === 'parent') {
      console.log("👨‍👩‍👧 Creating parent document for new parent user...");
      
      // Validate and find children by email
      let childrenIds = [];
      let childrenClasses = [];
      if (childrenEmails && childrenEmails.length > 0) {
        console.log("🔍 Looking for children with emails:", childrenEmails);
        
        // Find students by email
        const students = await Student.find({ email: { $in: childrenEmails } }).select('_id email name className');
        console.log("📚 Found students:", students.map(s => ({ id: s._id, email: s.email, name: s.name, className: s.className })));
        
        // Check if all emails were found
        const foundEmails = students.map(s => s.email);
        const notFoundEmails = childrenEmails.filter(email => !foundEmails.includes(email));
        
        if (notFoundEmails.length > 0) {
          // Delete the user document to keep data consistent
          await User.deleteOne({ _id: user._id });
          console.log("❌ Parent validation failed, deleted user document");
          return res.status(400).json({
            success: false,
            error: `No students found with the following emails: ${notFoundEmails.join(', ')}`
          });
        }
        
        childrenIds = students.map(s => s._id);
        childrenClasses = students.map(s => s.className).filter(Boolean); // Get unique class names
        console.log("✅ Children IDs found:", childrenIds);
        console.log("✅ Children classes found:", childrenClasses);
      }
      
      const parentDoc = new Parent({
        userId: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        children: childrenIds,
        childrenClasses: childrenClasses, // Add children's classes
        messagesCount: 0,
        meetingsCount: 0,
        alertsCount: 0,
        upcomingEvents: []
      });
      
      await parentDoc.save();
      roleSpecificId = parentDoc._id;
      console.log("✅ Parent document created:", parentDoc._id, "with children:", childrenIds);
      console.log("🔍 Parent saved in collection:", parentDoc.collection.collectionName);
    } else if (user.role === 'student') {
      console.log("👨‍🎓 Creating student document for new student user...");
      
      const studentDoc = new Student({
        userId: user._id,
        name: user.name,
        email: user.email,
        password: hashedPassword,
        phone: user.phone || '',
        gradeLevel: 'Not Assigned',
        className: className || 'Not Assigned', // Use provided className or default
        gpa: 0,
        profilePicture: ''
      });
      
      await studentDoc.save();
      roleSpecificId = studentDoc._id;
      console.log("✅ Student document created:", studentDoc._id);
      console.log("🔍 Student saved in collection:", studentDoc.collection.collectionName);
    } else if (user.role === 'teacher') {
      console.log("👨‍🏫 Creating teacher document for new teacher user...");
      
      // Validate required teacher fields
      if (!classes || !subject) {
        // Delete the user document to keep data consistent
        await User.deleteOne({ _id: user._id });
        console.log("❌ Teacher validation failed, deleted user document");
        return res.status(400).json({
          success: false,
          error: 'Classes and subject are required for teacher registration'
        });
      }
      
      try {
        const teacherDoc = new Teacher({
          userId: user._id,
          fullName: fullName || user.name, // Use fullName from request or fallback to name
          email: user.email,
          phone: user.phone || '',
          classes: Array.isArray(classes) ? classes : [classes], // Ensure it's an array
          subject: subject,
          messagesCount: 0,
          meetingsCount: 0,
          alertsCount: 0,
          upcomingEvents: []
        });
        
        await teacherDoc.save();
        roleSpecificId = teacherDoc._id;
        console.log("✅ Teacher document created:", teacherDoc._id);
        console.log("🔍 Teacher saved in collection:", teacherDoc.collection.collectionName);
      } catch (teacherError) {
        // If teacher creation fails, delete the user document to keep data consistent
        await User.deleteOne({ _id: user._id });
        console.log("❌ Teacher creation failed, deleted user document:", teacherError.message);
        return res.status(500).json({
          success: false,
          error: 'Failed to create teacher profile. Please try again.'
        });
      }
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
    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          roleSpecificId: roleSpecificId // parentId, studentId, or teacherId
        }
      }
    });

  } catch (error) {
    console.error("❌ Registration error:", error);
    next(error);
  }
};

/**
 * Logout controller
 * POST /api/auth/logout
 * Handles user logout and token invalidation
 */
export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log("🚪 Logout request received");
    
    // Get user info from token if available
    const token = req.headers.authorization?.split(' ')[1];
    
    if (token) {
      try {
        const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key');
        console.log(`👤 User logging out: ${decoded.email} (${decoded.role})`);
      } catch (err) {
        console.log("⚠️  Token verification failed during logout (token might be expired)");
      }
    }
    
    // In a production app, you might want to:
    // 1. Add token to a blacklist/revocation list
    // 2. Clear any server-side sessions
    // 3. Log the logout event to database
    
    console.log("✅ Logout successful");
    
    res.status(200).json({
      success: true,
      message: "Logged out successfully"
    });
  } catch (error) {
    console.error("❌ Logout error:", error);
    next(error);
  }
};


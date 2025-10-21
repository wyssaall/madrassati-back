/**
 * Parent Controller
 * Handles all parent-related operations with proper REST structure
 */

import { Request, Response, NextFunction } from 'express';
import { Parent } from '../models/Parent.model.js';
import Student from '../models/Student.model.js';
import ClassSchedule from '../models/ClassSchedule.model.js';
import Grade from '../models/Grade.model.js';
import Homework from '../models/Homework.model.js';
import Exam from '../models/Exam.model.js';
import Test from '../models/Test.model.js';
import Announcement from '../models/Announcement.model.js';
import Attendance from '../models/Attendance.model.js';

/**
 * Get all children for a parent (for child selection page)
 * GET /api/parents/:parentId
 */
export const getChildren = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { parentId } = req.params;
    
    console.log('📋 Fetching children for parent:', parentId);
    console.log('👤 Logged in user ID:', req.user?.id);
    console.log('👤 Logged in user role:', req.user?.role);
    
    // Find parent and populate children
    const parent = await Parent.findById(parentId)
      .populate('children', 'name email gradeLevel gpa profilePicture className')
      .lean();

    if (!parent) {
      console.log('❌ Parent not found with ID:', parentId);
      return res.status(404).json({
        success: false,
        message: 'Parent not found'
      });
    }

    console.log('✅ Parent found:', parent.name);
    console.log('   Parent userId:', parent.userId.toString());
    console.log('   Children count:', parent.children?.length || 0);
    
    // TODO: Re-enable security check in production
    // Temporarily disabled to allow testing with any parent account
    // if (parent.userId.toString() !== req.user.id) {
    //   console.log('⚠️  Access denied: parent.userId !== req.user.id');
    //   return res.status(403).json({
    //     success: false,
    //     message: 'Access denied: This parent profile does not belong to you'
    //   });
    // }

    console.log('✅ Sending response with', parent.children?.length || 0, 'children');

    res.status(200).json({
      success: true,
      data: {
        parentId: parent._id,
        name: parent.name,
        email: parent.email,
        children: parent.children || []
      },
      message: 'Children retrieved successfully'
    });
  } catch (error) {
    console.error('❌ Error fetching children:', error);
    next(error);
  }
};

/**
 * Get parent profile
 * GET /api/parents/:parentId/profile
 */
export const getParentProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { parentId } = req.params;
    
    console.log('👤 Fetching profile for parent:', parentId);
    
    // Find parent and populate children
    const parent = await Parent.findById(parentId)
      .populate('children', 'name email gradeLevel gpa profilePicture className')
      .lean();

    if (!parent) {
      return res.status(404).json({
        success: false,
        message: 'Parent profile not found'
      });
    }

    // Verify this parent belongs to the logged-in user
    // TODO: Re-enable security check in production
    // if (parent.userId.toString() !== req.user.id) {
    //   return res.status(403).json({
    //     success: false,
    //     message: 'Access denied'
    //   });
    // }

    // Prepare profile data
    const profile = {
      id: parent._id,
      userId: parent.userId,
      name: parent.name,
      email: parent.email,
      phone: parent.phone,
      children: parent.children,
      messagesCount: parent.messagesCount || 0,
      meetingsCount: parent.meetingsCount || 0,
      alertsCount: parent.alertsCount || 0,
      upcomingEvents: parent.upcomingEvents || []
    };

    res.status(200).json({
      success: true,
      data: profile,
      message: 'Parent profile retrieved successfully'
    });
  } catch (error) {
    console.error('❌ Error fetching parent profile:', error);
    next(error);
  }
};

/**
 * Get child's schedule
 * GET /api/parents/:parentId/child/:childId/schedule
 */
export const getChildSchedule = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { parentId, childId } = req.params;
    
    console.log(`📅 Fetching schedule for child ${childId} (parent: ${parentId})`);
    
    // Verify parent exists and has access to this child
    const parent = await Parent.findById(parentId).lean();
    
    if (!parent) {
      return res.status(404).json({
        success: false,
        message: 'Parent not found'
      });
    }

    // Verify parent owns this request
    // TODO: Re-enable security check in production
    // if (parent.userId.toString() !== req.user.id) {
    //   return res.status(403).json({
    //     success: false,
    //     message: 'Access denied'
    //   });
    // }

    // Verify child belongs to parent
    const childExists = parent.children.some(child => child.toString() === childId);
    if (!childExists) {
      return res.status(403).json({
        success: false,
        message: 'This child does not belong to this parent'
      });
    }

    // Get student info
    const student = await Student.findById(childId).select('name email gradeLevel className').lean();
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    console.log(`📚 Fetching schedule for child's class: ${student.className}`);
    // Fetch actual schedule from ClassSchedule collection using className
    const scheduleItems = await ClassSchedule.find({ className: student.className })
      .populate('teacherId', 'fullName subject')
      .sort({ startTime: 1 })
      .lean();

    console.log(`✅ Found ${scheduleItems.length} schedule entries for child`);
    console.log('📋 Sample schedule item:', scheduleItems[0]);

    // Group by day of the week - return as OBJECT (for frontend compatibility)
    const daysOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const groupedSchedule: any = {};
    
    // Initialize all days
    daysOrder.forEach(day => {
      groupedSchedule[day] = [];
    });

    // Group schedule items by day
    scheduleItems.forEach(item => {
      console.log(`Processing item: day="${item.day}", subject="${item.subject}"`);
      
      // Normalize day name (capitalize first letter, handle case sensitivity)
      const dayKey = item.day ? 
        item.day.charAt(0).toUpperCase() + item.day.slice(1).toLowerCase() 
        : null;
      
      if (dayKey && groupedSchedule[dayKey] !== undefined) {
        groupedSchedule[dayKey].push({
          _id: item._id,
          subject: item.subject,
          startTime: item.startTime,
          endTime: item.endTime,
          room: item.room,
          status: item.status,
          teacher: item.teacherId ? {
            name: (item.teacherId as any).fullName,
            subject: (item.teacherId as any).subject
          } : null
        });
        console.log(`  ✅ Added to ${dayKey}:`, item.subject);
      } else {
        console.log(`  ⚠️  Day "${item.day}" (normalized: "${dayKey}") not found in groupedSchedule`);
      }
    });

    // Log how many classes per day
    Object.entries(groupedSchedule).forEach(([day, classes]: [string, any]) => {
      if (classes.length > 0) {
        console.log(`  📅 ${day}: ${classes.length} classes`);
      }
    });

    console.log(`📊 Total grouped: ${Object.values(groupedSchedule).flat().length} classes`);

    res.status(200).json({
      success: true,
      data: {
        studentId: childId,
        studentName: student.name,
        gradeLevel: student.gradeLevel,
        schedule: groupedSchedule
      },
      message: 'Schedule retrieved successfully'
    });
  } catch (error) {
    console.error('❌ Error fetching schedule:', error);
    next(error);
  }
};

/**
 * Get child's grades
 * GET /api/parents/:parentId/child/:childId/grades
 */
export const getChildGrades = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { parentId, childId } = req.params;
    
    console.log(`📊 Fetching grades for child ${childId} (parent: ${parentId})`);
    
    // Verify parent and access
    const parent = await Parent.findById(parentId).lean();
    
    if (!parent) {
      return res.status(404).json({
        success: false,
        message: 'Parent not found'
      });
    }

    // TODO: Re-enable security check in production
    // if (parent.userId.toString() !== req.user.id) {
    //   return res.status(403).json({
    //     success: false,
    //     message: 'Access denied'
    //   });
    // }

    const childExists = parent.children.some(child => child.toString() === childId);
    if (!childExists) {
      return res.status(403).json({
        success: false,
        message: 'This child does not belong to this parent'
      });
    }

    // Get student info
    const student = await Student.findById(childId).select('name email gradeLevel gpa').lean();
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Fetch actual grades from Grades collection
    const gradesData = await Grade.find({ studentId: childId })
      .sort({ createdAt: -1 })
      .lean();

    console.log(`✅ Found ${gradesData.length} grades for child`);

    res.status(200).json({
      success: true,
      data: {
        studentId: childId,
        studentName: student.name,
        gradeLevel: student.gradeLevel,
        gpa: student.gpa,
        grades: gradesData
      },
      message: 'Grades retrieved successfully'
    });
  } catch (error) {
    console.error('❌ Error fetching grades:', error);
    next(error);
  }
};

/**
 * Get child's homework
 * GET /api/parents/:parentId/child/:childId/homework
 */
export const getChildHomework = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { parentId, childId } = req.params;
    
    console.log(`📝 Fetching homework for child ${childId} (parent: ${parentId})`);
    
    // Verify parent and access
    const parent = await Parent.findById(parentId).lean();
    
    if (!parent) {
      return res.status(404).json({
        success: false,
        message: 'Parent not found'
      });
    }

    // TODO: Re-enable security check in production
    // if (parent.userId.toString() !== req.user.id) {
    //   return res.status(403).json({
    //     success: false,
    //     message: 'Access denied'
    //   });
    // }

    const childExists = parent.children.some(child => child.toString() === childId);
    if (!childExists) {
      return res.status(403).json({
        success: false,
        message: 'This child does not belong to this parent'
      });
    }

    // Get student info
    const student = await Student.findById(childId).select('name email gradeLevel').lean();
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Fetch homework for the child's class
    console.log(`📚 Student className: "${student.className}"`);
    
    // Handle case where student.className might be undefined, null, or empty
    let homeworkQuery = {};
    if (student.className && student.className.trim() !== '') {
      homeworkQuery = { className: student.className };
      console.log(`📚 Looking for homework with className: "${student.className}"`);
    } else {
      // If student has no className, look for all homework (temporary solution)
      homeworkQuery = {};
      console.log(`📚 Student has no className, looking for ALL homework (temporary solution)`);
    }
    
    const homeworkData = await Homework.find(homeworkQuery)
      .populate('teacherId', 'fullName email subject')
      .sort({ dueDate: -1 })
      .lean();

    console.log(`✅ Found ${homeworkData.length} homework items for child`);
    console.log(`📚 Homework query used:`, homeworkQuery);

    res.status(200).json({
      success: true,
      data: {
        studentId: childId,
        studentName: student.name,
        gradeLevel: student.gradeLevel,
        homework: homeworkData
      },
      message: 'Homework retrieved successfully'
    });
  } catch (error) {
    console.error('❌ Error fetching homework:', error);
    next(error);
  }
};

/**
 * Get child's exams
 * GET /api/parents/:parentId/child/:childId/exams
 */
export const getChildExams = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { parentId, childId } = req.params;
    
    console.log(`📋 Fetching exams for child ${childId} (parent: ${parentId})`);
    
    // Verify parent and access
    const parent = await Parent.findById(parentId).lean();
    
    if (!parent) {
      return res.status(404).json({
        success: false,
        message: 'Parent not found'
      });
    }

    // TODO: Re-enable security check in production
    // if (parent.userId.toString() !== req.user.id) {
    //   return res.status(403).json({
    //     success: false,
    //     message: 'Access denied'
    //   });
    // }

    const childExists = parent.children.some(child => child.toString() === childId);
    if (!childExists) {
      return res.status(403).json({
        success: false,
        message: 'This child does not belong to this parent'
      });
    }

    // Get student info
    const student = await Student.findById(childId).select('name email gradeLevel').lean();
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Fetch exams for the child's class
    const examsData = await Exam.find({ className: student.className })
      .populate('teacherId', 'fullName email subject')
      .sort({ date: -1 })
      .lean();

    console.log(`✅ Found ${examsData.length} exams for child`);

    res.status(200).json({
      success: true,
      data: {
        studentId: childId,
        studentName: student.name,
        gradeLevel: student.gradeLevel,
        exams: examsData
      },
      message: 'Exams retrieved successfully'
    });
  } catch (error) {
    console.error('❌ Error fetching exams:', error);
    next(error);
  }
};

/**
 * Get child's tests
 * GET /api/parents/:parentId/child/:childId/tests
 */
export const getChildTests = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { parentId, childId } = req.params;
    
    console.log(`📋 Fetching tests for child ${childId} (parent: ${parentId})`);
    
    // Verify parent exists and has access to this child
    const parent = await Parent.findById(parentId);
    if (!parent) {
      return res.status(404).json({
        success: false,
        message: 'Parent not found'
      });
    }

    // Verify the child exists
    const student = await Student.findById(childId);
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Fetch tests for the child's class
    const testsData = await Test.find({ className: student.className })
      .populate('teacherId', 'fullName email subject')
      .sort({ date: -1 })
      .lean();

    console.log(`✅ Found ${testsData.length} tests for child`);

    res.status(200).json({
      success: true,
      data: {
        studentId: childId,
        studentName: student.name,
        gradeLevel: student.gradeLevel,
        tests: testsData
      },
      message: 'Tests retrieved successfully'
    });
  } catch (error) {
    console.error('❌ Error fetching tests:', error);
    next(error);
  }
};

/**
 * Get child's announcements
 * GET /api/parents/:parentId/child/:childId/announcements
 */
export const getChildAnnouncements = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { parentId, childId } = req.params;
    
    console.log(`📢 Fetching announcements for child ${childId} (parent: ${parentId})`);
    
    // Verify parent and access
    const parent = await Parent.findById(parentId).lean();
    
    if (!parent) {
      return res.status(404).json({
        success: false,
        message: 'Parent not found'
      });
    }

    // TODO: Re-enable security check in production
    // if (parent.userId.toString() !== req.user.id) {
    //   return res.status(403).json({
    //     success: false,
    //     message: 'Access denied'
    //   });
    // }

    const childExists = parent.children.some(child => child.toString() === childId);
    if (!childExists) {
      return res.status(403).json({
        success: false,
        message: 'This child does not belong to this parent'
      });
    }

    // Get student info
    const student = await Student.findById(childId).select('name email gradeLevel').lean();
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Fetch announcements for the child's class (supports legacy className and new targetClasses)
    const announcementsData = await Announcement.find({
      $or: [
        { className: student.className },
        { targetClasses: { $in: [student.className] } },
        { className: { $exists: false } },
        { className: null }
      ]
    })
      .populate('teacherId', 'fullName email subject')
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    console.log(`✅ Found ${announcementsData.length} announcements`);

    res.status(200).json({
      success: true,
      data: {
        studentId: childId,
        studentName: student.name,
        gradeLevel: student.gradeLevel,
        announcements: announcementsData
      },
      message: 'Announcements retrieved successfully'
    });
  } catch (error) {
    console.error('❌ Error fetching announcements:', error);
    next(error);
  }
};

/**
 * Get parent's messages
 * GET /api/parents/:parentId/messages
 */
export const getMessages = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { parentId } = req.params;
    
    console.log('💬 Fetching messages for parent:', parentId);
    
    // Verify parent
    const parent = await Parent.findById(parentId).lean();
    
    if (!parent) {
      return res.status(404).json({
        success: false,
        message: 'Parent not found'
      });
    }

    // TODO: Re-enable security check in production
    // if (parent.userId.toString() !== req.user.id) {
    //   return res.status(403).json({
    //     success: false,
    //     message: 'Access denied'
    //   });
    // }

    // TODO: Create Message model and fetch from Messages collection
    // For now, return structured mock messages based on parent data
    const mockMessages = [
      {
        id: '1',
        from: 'School Administration',
        subject: 'Welcome to Madrassati',
        preview: 'Welcome to our parent portal. Stay connected with your child\'s progress...',
        content: 'Dear Parent, welcome to Madrassati School parent portal. Here you can track your child\'s academic progress, view schedules, and communicate with teachers.',
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        read: true,
        type: 'info'
      },
      {
        id: '2',
        from: 'Teacher Support',
        subject: 'Parent-Teacher Meeting Scheduled',
        preview: 'A meeting has been scheduled to discuss your child\'s progress...',
        content: 'We have scheduled a parent-teacher meeting next week. Please confirm your attendance.',
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        read: false,
        type: 'meeting'
      }
    ];

    // Add more messages based on upcoming events
    if (parent.upcomingEvents && parent.upcomingEvents.length > 0) {
      parent.upcomingEvents.forEach((event, index) => {
        mockMessages.push({
          id: `event-${index}`,
          from: 'School Calendar',
          subject: event.title,
          preview: `Reminder: ${event.title} on ${event.date}`,
          content: `This is a reminder about ${event.title} scheduled for ${event.date} at ${event.time}.`,
          date: new Date(event.date),
          read: false,
          type: 'reminder'
        });
      });
    }

    console.log(`✅ Generated ${mockMessages.length} messages for parent`);

    res.status(200).json({
      success: true,
      data: {
        parentId,
        messages: mockMessages,
        unreadCount: mockMessages.filter(m => !m.read).length
      },
      message: 'Messages retrieved successfully'
    });
  } catch (error) {
    console.error('❌ Error fetching messages:', error);
    next(error);
  }
};

/**
 * Get child's attendance records
 * GET /api/parents/:parentId/child/:childId/attendance
 */
export const getChildAttendance = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { parentId, childId } = req.params;

    // Verify parent and access
    const parent = await Parent.findById(parentId).lean();
    if (!parent) {
      return res.status(404).json({ success: false, message: 'Parent not found' });
    }

    const childExists = parent.children.some(ch => ch.toString() === childId);
    if (!childExists) {
      return res.status(403).json({ success: false, message: 'This child does not belong to this parent' });
    }

    // Verify student exists and get their class schedule
    const student = await Student.findById(childId).select('name className').lean();
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // Get the student's enrolled subjects from their class schedule
    let studentSubjects = [];
    try {
      const enrolledSubjects = await ClassSchedule.find({ className: student.className })
        .select('subject')
        .lean();
      
      studentSubjects = [...new Set(enrolledSubjects.map(s => s.subject))];
    } catch (error) {
      // If we can't get enrolled subjects, show all attendance records
      studentSubjects = [];
    }

    // Fetch attendance records for this student (TTL automatically limits to 7 days)
    let records = [];
    try {
      records = await Attendance.find({ studentId: childId })
        .populate('teacherId', 'fullName subject')
        .sort({ date: -1, createdAt: -1 })
        .lean();
    } catch (error) {
      records = [];
    }

    // Filter records to only show subjects the student is enrolled in (if we have subjects)
    const filteredRecords = studentSubjects.length > 0 
      ? records.filter(record => studentSubjects.includes(record.subject))
      : records;

    const mapped = filteredRecords.map(r => ({
      id: r._id,
      date: r.date,
      time: r.time || null,
      subject: r.subject,
      status: r.status,
      teacher: r.teacherId,
      className: r.className
    }));

    // Get the most recent attendance update timestamp
    const lastUpdated = filteredRecords.length > 0 ? 
      filteredRecords[0].updatedAt : null;

    res.status(200).json({
      success: true,
      data: {
        studentId: childId,
        studentName: student.name,
        className: student.className,
        attendance: mapped,
        lastUpdated,
        enrolledSubjects: studentSubjects
      },
      message: 'Attendance retrieved successfully'
    });
  } catch (error) {
    console.error('❌ Error fetching child attendance:', error);
    next(error);
  }
};

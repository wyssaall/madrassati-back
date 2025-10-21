import mongoose from 'mongoose';
import { Teacher } from '../models/Teacher.model.js';
import ClassSchedule from '../models/ClassSchedule.model.js';
import { TeacherClass } from '../models/TeacherClass.model.js';
import Student from '../models/Student.model.js';
import Grade from '../models/Grade.model.js';
import Homework from '../models/Homework.model.js';
import Exam from '../models/Exam.model.js';
import Test from '../models/Test.model.js';
import Announcement from '../models/Announcement.model.js';
import Attendance from '../models/Attendance.model.js';


/**
 * Teacher Controller
 * Handles all teacher-related operations
 */

/**
 * Get teacher profile
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const getProfile = async (req, res, next) => {
  try {
    const { teacherId } = req.params;
    console.log('👨‍🏫 Fetching teacher profile for teacher ID:', teacherId);
    
    // Find teacher document by teacherId
    const teacher = await Teacher.findById(teacherId)
      .select('_id userId fullName email phone classes subject messagesCount meetingsCount alertsCount upcomingEvents')
      .lean();
    
    if (!teacher) {
      console.log('❌ Teacher not found for teacher ID:', teacherId);
      return res.status(404).json({
        success: false,
        error: 'Teacher profile not found'
      });
    }
    
    console.log('✅ Teacher profile found:', {
      id: teacher._id,
      name: teacher.fullName,
      email: teacher.email,
      subject: teacher.subject,
      classes: teacher.classes
    });
    
    // Prepare profile data
    const profileData = {
      id: teacher._id,
      userId: teacher.userId,
      name: teacher.fullName,
      email: teacher.email,
      phone: teacher.phone,
      subject: teacher.subject,
      classes: teacher.classes,
      messagesCount: teacher.messagesCount,
      meetingsCount: teacher.meetingsCount,
      alertsCount: teacher.alertsCount,
      upcomingEvents: teacher.upcomingEvents
    };

    res.status(200).json({
      success: true,
      data: profileData,
      message: 'Teacher profile retrieved successfully'
    });
  } catch (error) {
    console.error('❌ Error fetching teacher profile:', error);
    next(error);
  }
};

/**
 * Get teacher dashboard data
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const getDashboard = async (req, res, next) => {
  try {
    // TODO: Fetch dashboard data (classes, recent activities, etc.)
    const dashboardData = {
      teacherId: req.user.id,
      classes: [],
      recentActivities: []
    };

    res.status(200).json({
      success: true,
      data: dashboardData,
      message: 'Dashboard data retrieved successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get teacher schedule
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const getSchedule = async (req, res, next) => {
  try {
    const { teacherId } = req.params;
    console.log('📅 Fetching schedule for teacher ID:', teacherId);
    
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(teacherId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid teacher ID format'
      });
    }

    // Query ClassSchedule for the specific teacher
    const schedule = await ClassSchedule.find({ teacherId })
      .populate('studentId', 'name email className')
      .populate('teacherId', 'fullName email subject')
      .select('day startTime endTime subject room status studentId teacherId className')
      .lean()
      .sort({ day: 1, startTime: 1 }); // Sort by day and time

    if (!schedule || schedule.length === 0) {
      console.log('❌ No schedule found for teacher ID:', teacherId);
      return res.status(404).json({
        success: false,
        error: 'No schedule found for this teacher'
      });
    }

    console.log('✅ Schedule found:', {
      teacherId,
      totalClasses: schedule.length,
      days: [...new Set(schedule.map(s => s.day))]
    });

    // Group schedule by day for better frontend consumption
    const groupedSchedule = schedule.reduce((acc, classItem) => {
      const day = classItem.day;
      if (!acc[day]) {
        acc[day] = [];
      }
      acc[day].push({
        id: classItem._id,
        startTime: classItem.startTime,
        endTime: classItem.endTime,
        subject: classItem.subject,
        room: classItem.room,
        status: classItem.status,
        student: classItem.studentId,
        teacher: classItem.teacherId
      });
      return acc;
    }, {});

    res.status(200).json({
      success: true,
      data: {
        teacherId,
        schedule: groupedSchedule,
        totalClasses: schedule.length
      },
      message: 'Schedule retrieved successfully'
    });
  } catch (error) {
    console.error('❌ Error fetching teacher schedule:', error);
    next(error);
  }
};

/**
 * Get teacher's classes
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const getClasses = async (req, res, next) => {
  try {
    const { teacherId } = req.params;
    console.log('🏫 Fetching classes for teacher ID:', teacherId);
    
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(teacherId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid teacher ID format'
      });
    }

    // Find the teacher and get their classes
    const teacher = await Teacher.findById(teacherId);
    
    if (!teacher) {
      console.log('❌ Teacher not found with ID:', teacherId);
      return res.status(404).json({
        success: false,
        error: 'Teacher not found'
      });
    }

    if (!teacher.classes || teacher.classes.length === 0) {
      console.log('❌ No classes found for teacher ID:', teacherId);
      return res.status(404).json({
        success: false,
        error: 'No classes found for this teacher'
      });
    }

    // Convert teacher classes to the expected format
    const teacherClasses = teacher.classes.map(className => ({
      _id: `${teacherId}_${className}`,
      className: className,
      teacherId: teacherId,
      subject: teacher.subject,
      room: 'Not Assigned',
      teacher: {
        _id: teacherId,
        fullName: teacher.fullName,
        email: teacher.email,
        subject: teacher.subject
      }
    }));

    // Calculate real-time metrics for each class
    const classesWithMetrics = await Promise.all(
      teacherClasses.map(async (classItem) => {
        try {
          // Calculate studentsCount from students collection
          const studentsCount = await Student.countDocuments({ 
            className: classItem.className 
          });

          // Calculate avgGrade from grades collection
          const grades = await Grade.find({ 
            studentId: { $in: await Student.find({ className: classItem.className }).distinct('_id') }
          }).lean();

          const avgGrade = grades.length > 0 
            ? grades.reduce((sum, grade) => sum + (grade.finalGrade || 0), 0) / grades.length 
            : 0;

          // Calculate avgAttendance from students collection
          const students = await Student.find({ className: classItem.className }).lean();
          const avgAttendance = students.length > 0 
            ? students.reduce((sum, student) => sum + (student.attendance || 0), 0) / students.length 
            : 0;

          return {
            id: classItem._id,
            className: classItem.className,
            subject: classItem.subject,
            room: classItem.room,
            studentsCount,
            avgGrade: Math.round(avgGrade * 100) / 100, // Round to 2 decimal places
            avgAttendance: Math.round(avgAttendance * 100) / 100, // Round to 2 decimal places
            teacher: classItem.teacherId
          };
        } catch (error) {
          console.error(`Error calculating metrics for class ${classItem.className}:`, error);
          // Return class with default values if calculation fails
          return {
            id: classItem._id,
            className: classItem.className,
            subject: classItem.subject,
            room: classItem.room,
            studentsCount: 0,
            avgGrade: 0,
            avgAttendance: 0,
            teacher: classItem.teacherId
          };
        }
      })
    );

    console.log('✅ Classes found:', {
      teacherId,
      totalClasses: classesWithMetrics.length,
      classNames: classesWithMetrics.map(c => c.className)
    });

    res.status(200).json({
      success: true,
      data: {
        teacherId,
        classes: classesWithMetrics,
        totalClasses: classesWithMetrics.length
      },
      message: 'Classes retrieved successfully'
    });
  } catch (error) {
    console.error('❌ Error fetching teacher classes:', error);
    next(error);
  }
};

/**
 * Get all grades managed by teacher
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const getGrades = async (req, res, next) => {
  try {
    // TODO: Fetch all grades for classes taught by the teacher
    const grades = {
      teacherId: req.user.id,
      grades: []
    };

    res.status(200).json({
      success: true,
      data: grades,
      message: 'Grades retrieved successfully'
    });
  } catch (error) {
    next(error);
  }
};


/**
 * Get all homework managed by teacher
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const getHomework = async (req, res, next) => {
  try {
    // TODO: Fetch all homework assignments created by the teacher
    const homework = {
      teacherId: req.user.id,
      homework: []
    };

    res.status(200).json({
      success: true,
      data: homework,
      message: 'Homework retrieved successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get homework for a specific class
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const getHomeworkByClass = async (req, res, next) => {
  try {
    const { classId } = req.params;
    
    // TODO: validate ObjectId and check permissions
    // TODO: Verify teacher is assigned to this class
    
    const homework = {
      teacherId: req.user.id,
      classId,
      homework: []
    };

    res.status(200).json({
      success: true,
      data: homework,
      message: 'Class homework retrieved successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get exams managed by teacher
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const getExams = async (req, res, next) => {
  try {
    const { teacherId } = req.params;
    console.log('📋 Fetching exams and tests for teacher:', teacherId);

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(teacherId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid teacher ID format'
      });
    }

    // Get teacher info for subject filtering
    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher not found'
      });
    }

    // Normalize subject function for filtering
    const normalizeSubject = (subject) => {
      const normalized = subject.toLowerCase().replace(/\s+/g, '');
      
      // Handle common subject variations
      const subjectMappings = {
        'math': ['mathematics', 'maths', 'mat'],
        'mathematics': ['math', 'maths', 'mat'],
        'science': ['sciences', 'sci'],
        'english': ['eng', 'lang'],
        'physics': ['phy'],
        'chemistry': ['chem'],
        'biology': ['bio'],
        'history': ['hist'],
        'geography': ['geo'],
        'french': ['fr'],
        'arabic': ['ar']
      };
      
      // Check if subjects match directly or through mappings
      for (const [key, variations] of Object.entries(subjectMappings)) {
        if (normalized === key || variations.includes(normalized)) {
          return key; // Return the canonical subject name
        }
      }
      
      return normalized; // Return as-is if no mapping found
    };
    
    const teacherSubjectNormalized = normalizeSubject(teacher.subject);

    // Fetch all exams and tests created by the teacher, filtered by subject
    const [exams, tests] = await Promise.all([
      Exam.find({ teacherId })
        .populate('teacherId', 'fullName email subject')
        .lean()
        .sort({ date: 1 }),
      Test.find({ teacherId })
        .populate('teacherId', 'fullName email subject')
        .lean()
        .sort({ date: 1 })
    ]);

    // Filter exams and tests to only show those matching the teacher's subject
    const filteredExams = exams.filter(exam => {
      const examSubjectNormalized = normalizeSubject(exam.subject);
      return examSubjectNormalized === teacherSubjectNormalized;
    });

    const filteredTests = tests.filter(test => {
      const testSubjectNormalized = normalizeSubject(test.subject);
      return testSubjectNormalized === teacherSubjectNormalized;
    });

    console.log(`✅ Found ${filteredExams.length} exams and ${filteredTests.length} tests for teacher ${teacherId} (subject: ${teacher.subject})`);

    res.status(200).json({
      success: true,
      data: {
        teacherId,
        teacherSubject: teacher.subject,
        exams: filteredExams.map(exam => ({
          id: exam._id,
          examId: exam.examId,
          className: exam.className,
          subject: exam.subject,
          title: exam.title,
          type: exam.type,
          date: exam.date,
          startTime: exam.startTime,
          endTime: exam.endTime,
          room: exam.room,
          durationMinutes: exam.durationMinutes,
          teacher: exam.teacherId,
          createdAt: exam.createdAt,
          updatedAt: exam.updatedAt
        })),
        tests: filteredTests.map(test => ({
          id: test._id,
          testId: test.testId,
          className: test.className,
          subject: test.subject,
          title: test.title,
          type: test.type,
          date: test.date,
          startTime: test.startTime,
          endTime: test.endTime,
          room: test.room,
          durationMinutes: test.durationMinutes,
          teacher: test.teacherId,
          createdAt: test.createdAt,
          updatedAt: test.updatedAt
        })),
        totalExams: filteredExams.length,
        totalTests: filteredTests.length
      },
      message: `Exams and tests retrieved successfully for subject: ${teacher.subject}`
    });
  } catch (error) {
    console.error('❌ Error fetching exams and tests:', error);
    next(error);
  }
};

/**
 * Get announcements created by teacher
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const getAnnouncement = async (req, res, next) => {
  try {
    const { teacherId } = req.params;
    console.log('📢 Fetching announcements for teacher:', teacherId);

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(teacherId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid teacher ID format'
      });
    }

    // Fetch all announcements created by the teacher
    const announcements = await Announcement.find({ teacherId })
      .populate('teacherId', 'fullName email subject')
      .lean()
      .sort({ date: -1 });

    console.log(`✅ Found ${announcements.length} announcements for teacher ${teacherId}`);

    res.status(200).json({
      success: true,
      data: {
        teacherId,
        announcements: announcements.map(announcement => ({
          id: announcement._id,
          announcementId: announcement.announcementId,
          className: announcement.className,
          title: announcement.title,
          type: announcement.type,
          priority: announcement.priority,
          content: announcement.content,
          date: announcement.date,
          postedBy: announcement.postedBy,
          teacher: announcement.teacherId,
          createdAt: announcement.createdAt,
          updatedAt: announcement.updatedAt
        })),
        totalAnnouncements: announcements.length
      },
      message: 'Announcements retrieved successfully'
    });
  } catch (error) {
    console.error('❌ Error fetching announcements:', error);
    next(error);
  }
};

/**
 * Get all messages for teacher
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const getMessages = async (req, res, next) => {
  try {
    // TODO: Fetch all messages/conversations for the teacher
    const messages = {
      teacherId: req.user.id,
      conversations: []
    };

    res.status(200).json({
      success: true,
      data: messages,
      message: 'Messages retrieved successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get messages with a specific user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const getMessagesByToken = async (req, res, next) => {
  try {
    const { tokenUserId } = req.params;
    
    // TODO: validate ObjectId and check permissions
    // TODO: Verify teacher has permission to access this conversation
    
    const messages = {
      teacherId: req.user.id,
      tokenUserId,
      messages: []
    };

    res.status(200).json({
      success: true,
      data: messages,
      message: 'Conversation messages retrieved successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all attendance managed by teacher
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const getAttendance = async (req, res, next) => {
  try {
    const { teacherId } = req.params;
    
    console.log('📊 Fetching attendance for teacher:', teacherId);

    // Validate teacher ID
    if (!mongoose.Types.ObjectId.isValid(teacherId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid teacher ID format'
      });
    }

    // Find teacher and their classes
    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      return res.status(404).json({
        success: false,
        error: 'Teacher not found'
      });
    }

    // Get students from all classes taught by this teacher
    const studentsByClass = {};
    const now = new Date();
    const todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const today = todayDate.toISOString().split('T')[0]; // YYYY-MM-DD format

    // Import Attendance model to check today's status
    const Attendance = (await import('../models/Attendance.model.js')).default;

    for (const className of teacher.classes) {
      const students = await Student.find({ className })
        .select('_id name email className attendance')
        .lean();

      console.log(`📚 Found ${students.length} students in class ${className}`);
      
      if (students.length > 0) {
        // Get today's attendance status for each student
        const studentsWithTodayStatus = await Promise.all(
          students.map(async (student) => {
            // Check today's attendance status
            const todayAttendance = await Attendance.findOne({
              studentId: student._id,
              date: todayDate
            });

            // Calculate overall attendance (TTL automatically limits to 7 days)
            const [presentCount, totalCount] = await Promise.all([
              Attendance.countDocuments({ 
                studentId: student._id, 
                status: 'Present'
              }),
              Attendance.countDocuments({ 
                studentId: student._id
              })
            ]);
            
            const overallAttendance = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 100;
            
            return {
              _id: student._id,
              name: student.name,
              email: student.email,
              className: student.className,
              status: todayAttendance?.status || 'Present', // Default to Present if no record
              overallAttendance
            };
          })
        );
        
        studentsByClass[className] = studentsWithTodayStatus;
      } else {
        studentsByClass[className] = [];
      }
    }

    console.log('✅ Attendance data fetched successfully');

    res.status(200).json({
      success: true,
      data: {
        teacherId,
        classes: teacher.classes,
        studentsByClass,
        date: today
      },
      message: 'Attendance retrieved successfully'
    });
  } catch (error) {
    console.error('❌ Error fetching attendance:', error);
    next(error);
  }
};

/**
 * Get attendance for a specific class
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const getAttendanceByClass = async (req, res, next) => {
  try {
    const { teacherId, className } = req.params;
    
    console.log('📊 Fetching attendance for class:', className, 'teacher:', teacherId);

    // Validate teacher ID
    if (!mongoose.Types.ObjectId.isValid(teacherId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid teacher ID format'
      });
    }

    // Verify teacher exists and has access to this class
    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      return res.status(404).json({
        success: false,
        error: 'Teacher not found'
      });
    }

    if (!teacher.classes.includes(className)) {
      return res.status(403).json({
        success: false,
        error: 'Teacher does not have access to this class'
      });
    }

    // Get students from the specific class
    const students = await Student.find({ className })
      .select('_id name email className attendance attendanceRecords')
      .lean();

    console.log(`📚 Found ${students.length} students in class ${className}`);

    const now = new Date();
    const todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const today = todayDate.toISOString().split('T')[0]; // YYYY-MM-DD format

    const studentsWithAttendance = students.map(student => {
      // Check today's attendance status
      const todayAttendance = student.attendanceRecords?.find(
        record => record.date === today
      );
      
      return {
        _id: student._id,
        name: student.name,
        email: student.email,
        className: student.className,
        status: todayAttendance?.status || 'Present', // Default to Present if no record
        overallAttendance: student.attendance || 95 // Overall attendance percentage
      };
    });

    res.status(200).json({
      success: true,
      data: {
        teacherId,
        className,
        students: studentsWithAttendance,
        date: today
      },
      message: 'Class attendance retrieved successfully'
    });
  } catch (error) {
    console.error('❌ Error fetching class attendance:', error);
    next(error);
  }
};

/**
 * Toggle attendance status for a student
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const toggleAttendance = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    const { status } = req.body; // 'Present' or 'Absent'
    
    console.log('🔄 Toggling attendance for student:', studentId, 'to:', status);

    // Validate student ID
    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid student ID format'
      });
    }

    // Validate status
    if (!['Present', 'Absent'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Status must be either "Present" or "Absent"'
      });
    }

    // Find student
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        error: 'Student not found'
      });
    }

    const now = new Date();
    const today = now.toISOString().split('T')[0]; // YYYY-MM-DD format
    const todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Initialize attendanceRecords if it doesn't exist
    if (!student.attendanceRecords) {
      student.attendanceRecords = [];
    }

    // Find or create today's attendance record
    let todayRecord = student.attendanceRecords.find(
      record => record.date === today
    );

    if (todayRecord) {
      // Update existing record
      todayRecord.status = status;
    } else {
      // Create new record
      student.attendanceRecords.push({
        date: today,
        status: status
      });
    }

    // Save the student
    await student.save();

    // Also upsert a record in Attendance collection for parent visibility
    try {
      // Attempt to find teacher from request context
      const teacher = await Teacher.findById(req.params.teacherId || req.body.teacherId).lean();
      const subject = teacher?.subject || 'General';

      // infer time window from today's schedule (best-effort)
      let timeWindow: string | undefined = undefined;
      try {
        const weekday = todayDate.toLocaleDateString('en-US', { weekday: 'long' });
        const slot = await ClassSchedule.findOne({ studentId: student._id, teacherId: teacher?._id, day: weekday }).lean();
        if (slot?.startTime && slot?.endTime) {
          timeWindow = `${slot.startTime}–${slot.endTime}`;
        }
      } catch {}

      await Attendance.findOneAndUpdate(
        { studentId: student._id, subject, date: todayDate },
        {
          $set: {
            teacherId: teacher ? teacher._id : undefined,
            className: student.className || 'N/A',
            status: status,
            time: timeWindow
          }
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      // Recalculate overall attendance percentage
      const [presentCount, totalCount] = await Promise.all([
        Attendance.countDocuments({ studentId: student._id, status: 'Present' }),
        Attendance.countDocuments({ studentId: student._id })
      ]);
      if (totalCount > 0) {
        student.attendance = Math.round((presentCount / totalCount) * 100);
        await student.save();
      }
    } catch (e) {
      console.warn('⚠️ Failed to upsert Attendance record or recalc:', (e as any)?.message);
    }

    console.log('✅ Attendance updated successfully:', {
      studentId: student._id,
      studentName: student.name,
      status: status,
      date: today
    });

    res.status(200).json({
      success: true,
      data: {
        studentId: student._id,
        studentName: student.name,
        status: status,
        date: today,
        overallAttendance: student.attendance || 95
      },
      message: 'Attendance updated successfully'
    });
  } catch (error) {
    console.error('❌ Error toggling attendance:', error);
    next(error);
  }
};

/**
 * Get grades for a specific class
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const getGradesByClass = async (req, res, next) => {
  try {
    const { teacherId, className } = req.params;
    console.log('📊 Fetching grades for teacher:', teacherId, 'class:', className);
    
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(teacherId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid teacher ID format'
      });
    }

    // Fetch grades for the specific class and teacher
    const grades = await Grade.find({ teacherId, className })
      .populate('studentId', 'name email studentId')
      .populate('teacherId', 'fullName email subject')
      .lean()
      .sort({ 'studentId.name': 1 });

    if (!grades || grades.length === 0) {
      console.log('❌ No grades found for teacher:', teacherId, 'class:', className);
      return res.status(404).json({
        success: false,
        error: 'No grades found for this class'
      });
    }

    console.log('✅ Grades found:', {
      teacherId,
      className,
      totalGrades: grades.length,
      students: grades.map(g => (g.studentId && typeof g.studentId === 'object' && 'name' in g.studentId) ? g.studentId.name : 'Unknown')
    });

    res.status(200).json({
      success: true,
      data: {
        teacherId,
        className,
        grades: grades.map(grade => ({
          id: grade._id,
          studentId: (grade.studentId && typeof grade.studentId === 'object' && '_id' in grade.studentId) ? grade.studentId._id : grade.studentId,
          studentName: (grade.studentId && typeof grade.studentId === 'object' && 'name' in grade.studentId) ? grade.studentId.name : 'Unknown',
          studentEmail: (grade.studentId && typeof grade.studentId === 'object' && 'email' in grade.studentId) ? grade.studentId.email : '',
          studentNumber: (grade.studentId && typeof grade.studentId === 'object' && 'studentId' in grade.studentId) ? grade.studentId.studentId : '',
          className: grade.className,
          subject: grade.subject,
          homework: grade.homework,
          test: grade.test,
          exam: grade.exam,
          finalGrade: grade.finalGrade,
          status: grade.status,
          teacher: grade.teacherId
        })),
        totalGrades: grades.length
      },
      message: 'Grades retrieved successfully'
    });
  } catch (error) {
    console.error('❌ Error fetching grades by class:', error);
    next(error);
  }
};

/**
 * Add new grade
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const addGrade = async (req, res, next) => {
  try {
    const { teacherId } = req.params;
    const { studentId, className, subject, homework, test, exam } = req.body;
    
    console.log('➕ Adding new grade for teacher:', teacherId);
    
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(teacherId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid teacher ID format'
      });
    }

    // Add logging to debug the studentId
    console.log('🔍 Received studentId:', studentId);
    console.log('🔍 studentId type:', typeof studentId);
    console.log('🔍 studentId length:', studentId?.length);
    
    // Validate ObjectId format for studentId
    if (!studentId) {
      return res.status(400).json({
        success: false,
        error: 'Student ID is required'
      });
    }
    
    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      console.log('❌ Invalid ObjectId format:', studentId);
      return res.status(400).json({
        success: false,
        error: 'Invalid student ID format. Please select a student from the dropdown.'
      });
    }
    
    // Find student by _id (MongoDB ObjectId)
    const student = await Student.findById(studentId);
    if (!student) {
      console.log('❌ Student not found with ID:', studentId);
      return res.status(404).json({
        success: false,
        error: 'Student not found with this ID'
      });
    }
    
    console.log('✅ Student found:', student.name, '(ID:', student._id + ')');

    // Validate required fields
    if (!className || !subject || homework === undefined || test === undefined || exam === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: className, subject, homework, test, exam'
      });
    }

    // Check if grade already exists for this student and subject
    const existingGrade = await Grade.findOne({ studentId: student._id, subject, teacherId });
    if (existingGrade) {
      return res.status(409).json({
        success: false,
        error: 'Grade already exists for this student and subject'
      });
    }

    // Create new grade (finalGrade will be auto-calculated by middleware)
    const newGrade = new Grade({
      studentId: student._id,
      teacherId,
      className,
      subject,
      homework,
      test,
      exam
    });

    await newGrade.save();

    // Populate the saved grade
    await newGrade.populate([
      { path: 'studentId', select: 'name email studentId' },
      { path: 'teacherId', select: 'fullName email subject' }
    ]);

    console.log('✅ Grade added successfully:', {
      id: newGrade._id,
      student: (newGrade.studentId && typeof newGrade.studentId === 'object' && 'name' in newGrade.studentId) ? newGrade.studentId.name : 'Unknown',
      subject: newGrade.subject,
      finalGrade: newGrade.finalGrade
    });

    res.status(201).json({
      success: true,
      data: {
        id: newGrade._id,
        studentId: (newGrade.studentId && typeof newGrade.studentId === 'object' && '_id' in newGrade.studentId) ? newGrade.studentId._id : newGrade.studentId,
        studentName: (newGrade.studentId && typeof newGrade.studentId === 'object' && 'name' in newGrade.studentId) ? newGrade.studentId.name : 'Unknown',
        studentEmail: (newGrade.studentId && typeof newGrade.studentId === 'object' && 'email' in newGrade.studentId) ? newGrade.studentId.email : '',
        studentNumber: (newGrade.studentId && typeof newGrade.studentId === 'object' && 'studentId' in newGrade.studentId) ? newGrade.studentId.studentId : '',
        className: newGrade.className,
        subject: newGrade.subject,
        homework: newGrade.homework,
        test: newGrade.test,
        exam: newGrade.exam,
        finalGrade: newGrade.finalGrade,
        status: newGrade.status,
        teacher: newGrade.teacherId
      },
      message: 'Grade added successfully'
    });
  } catch (error) {
    console.error('❌ Error adding grade:', error);
    next(error);
  }
};

/**
 * Update a grade
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const updateGrade = async (req, res, next) => {
  try {
    const { teacherId, gradeId } = req.params;
    const { homework, test, exam } = req.body;
    
    console.log('✏️ Updating grade:', gradeId, 'for teacher:', teacherId);
    
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(teacherId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid teacher ID format'
      });
    }

    if (!mongoose.Types.ObjectId.isValid(gradeId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid grade ID format'
      });
    }

    // Validate required fields
    if (homework === undefined && test === undefined && exam === undefined) {
      return res.status(400).json({
        success: false,
        error: 'At least one grade field (homework, test, exam) is required'
      });
    }

    // Find and update the grade (finalGrade will be auto-calculated by middleware)
    const updatedGrade = await Grade.findOneAndUpdate(
      { _id: gradeId, teacherId },
      { $set: { homework, test, exam } },
      { new: true, runValidators: true }
    ).populate([
      { path: 'studentId', select: 'name email studentId' },
      { path: 'teacherId', select: 'fullName email subject' }
    ]);

    if (!updatedGrade) {
      return res.status(404).json({
        success: false,
        error: 'Grade not found or you do not have permission to update it'
      });
    }

    console.log('✅ Grade updated successfully:', {
      id: updatedGrade._id,
      student: (updatedGrade.studentId && typeof updatedGrade.studentId === 'object' && 'name' in updatedGrade.studentId) ? updatedGrade.studentId.name : 'Unknown',
      subject: updatedGrade.subject,
      finalGrade: updatedGrade.finalGrade
    });

    res.status(200).json({
      success: true,
      data: {
        id: updatedGrade._id,
        studentId: (updatedGrade.studentId && typeof updatedGrade.studentId === 'object' && '_id' in updatedGrade.studentId) ? updatedGrade.studentId._id : updatedGrade.studentId,
        studentName: (updatedGrade.studentId && typeof updatedGrade.studentId === 'object' && 'name' in updatedGrade.studentId) ? updatedGrade.studentId.name : 'Unknown',
        studentEmail: (updatedGrade.studentId && typeof updatedGrade.studentId === 'object' && 'email' in updatedGrade.studentId) ? updatedGrade.studentId.email : '',
        studentNumber: (updatedGrade.studentId && typeof updatedGrade.studentId === 'object' && 'studentId' in updatedGrade.studentId) ? updatedGrade.studentId.studentId : '',
        className: updatedGrade.className,
        subject: updatedGrade.subject,
        homework: updatedGrade.homework,
        test: updatedGrade.test,
        exam: updatedGrade.exam,
        finalGrade: updatedGrade.finalGrade,
        status: updatedGrade.status,
        teacher: updatedGrade.teacherId
      },
      message: 'Grade updated successfully'
    });
  } catch (error) {
    console.error('❌ Error updating grade:', error);
    next(error);
  }
};

/**
 * Delete a grade
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const deleteGrade = async (req, res, next) => {
  try {
    const { teacherId, gradeId } = req.params;
    
    console.log('🗑️ Deleting grade:', gradeId, 'for teacher:', teacherId);
    
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(teacherId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid teacher ID format'
      });
    }

    if (!mongoose.Types.ObjectId.isValid(gradeId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid grade ID format'
      });
    }

    // Find and delete the grade
    const deletedGrade = await Grade.findOneAndDelete({ _id: gradeId, teacherId })
      .populate([
        { path: 'studentId', select: 'name email studentId' },
        { path: 'teacherId', select: 'fullName email subject' }
      ]);

    if (!deletedGrade) {
      return res.status(404).json({
        success: false,
        error: 'Grade not found or you do not have permission to delete it'
      });
    }

    console.log('✅ Grade deleted successfully:', {
      id: deletedGrade._id,
      student: (deletedGrade.studentId && typeof deletedGrade.studentId === 'object' && 'name' in deletedGrade.studentId) ? deletedGrade.studentId.name : 'Unknown',
      subject: deletedGrade.subject
    });

    res.status(200).json({
      success: true,
      data: {
        id: deletedGrade._id,
        studentName: (deletedGrade.studentId && typeof deletedGrade.studentId === 'object' && 'name' in deletedGrade.studentId) ? deletedGrade.studentId.name : 'Unknown',
        subject: deletedGrade.subject,
        finalGrade: deletedGrade.finalGrade
      },
      message: 'Grade deleted successfully'
    });
  } catch (error) {
    console.error('❌ Error deleting grade:', error);
    next(error);
  }
};

/**
 * Get all homeworks for a teacher
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const getHomeworks = async (req, res, next) => {
  try {
    const { teacherId } = req.params;
    console.log('📚 Fetching homeworks for teacher:', teacherId);
    
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(teacherId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid teacher ID format'
      });
    }

    // Fetch all homeworks for the teacher
    const homeworks = await Homework.find({ teacherId })
      .populate('teacherId', 'fullName email subject')
      .lean()
      .sort({ dueDate: 1 });

    console.log('✅ Homeworks found:', {
      teacherId,
      totalHomeworks: homeworks.length
    });

    res.status(200).json({
      success: true,
      data: {
        teacherId,
        homeworks: homeworks.map(homework => ({
          id: homework._id,
          homeworkId: homework.homeworkId,
          className: homework.className,
          subject: homework.subject,
          title: homework.title,
          description: homework.description,
          startDate: homework.startDate,
          dueDate: homework.dueDate,
          status: homework.status,
          durationDays: homework.durationDays,
          daysLeft: homework.daysLeft,
          teacher: homework.teacherId,
          createdAt: homework.createdAt,
          updatedAt: homework.updatedAt
        })),
        totalHomeworks: homeworks.length
      },
      message: 'Homeworks retrieved successfully'
    });
  } catch (error) {
    console.error('❌ Error fetching homeworks:', error);
    next(error);
  }
};

/**
 * Get homeworks for a specific class
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const getHomeworksByClass = async (req, res, next) => {
  try {
    const { teacherId, className } = req.params;
    console.log('📚 Fetching homeworks for teacher:', teacherId, 'class:', className);
    
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(teacherId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid teacher ID format'
      });
    }

    // Fetch homeworks for the specific class and teacher
    const homeworks = await Homework.find({ teacherId, className })
      .populate('teacherId', 'fullName email subject')
      .lean()
      .sort({ dueDate: 1 });

    console.log('✅ Homeworks found:', {
      teacherId,
      className,
      totalHomeworks: homeworks.length
    });

    res.status(200).json({
      success: true,
      data: {
        teacherId,
        className,
        homeworks: homeworks.map(homework => ({
          id: homework._id,
          homeworkId: homework.homeworkId,
          className: homework.className,
          subject: homework.subject,
          title: homework.title,
          description: homework.description,
          startDate: homework.startDate,
          dueDate: homework.dueDate,
          status: homework.status,
          durationDays: homework.durationDays,
          daysLeft: homework.daysLeft,
          teacher: homework.teacherId,
          createdAt: homework.createdAt,
          updatedAt: homework.updatedAt
        })),
        totalHomeworks: homeworks.length
      },
      message: 'Class homeworks retrieved successfully'
    });
  } catch (error) {
    console.error('❌ Error fetching homeworks by class:', error);
    next(error);
  }
};

/**
 * Add new homework
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const addHomework = async (req, res, next) => {
  try {
    const { teacherId } = req.params;
    const { className, subject, title, description, startDate, dueDate } = req.body;
    
    console.log('➕ Adding new homework for teacher:', teacherId);
    console.log('📝 Request body:', req.body);
    
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(teacherId)) {
      console.log('❌ Invalid teacher ID format:', teacherId);
      return res.status(400).json({
        success: false,
        message: 'Invalid teacher ID format'
      });
    }

    // Validate required fields
    if (!className || !subject || !title || !description || !startDate || !dueDate) {
      console.log('❌ Missing required fields:', { className, subject, title, description, startDate, dueDate });
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: className, subject, title, description, startDate, dueDate'
      });
    }

    // Parse dates - handle both DD/MM/YYYY and YYYY-MM-DD formats
    let start, due;
    
    try {
      // Check if date is in DD/MM/YYYY format
      if (startDate.includes('/') && startDate.split('/')[0].length <= 2) {
        // DD/MM/YYYY format
        const [day, month, year] = startDate.split('/');
        start = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      } else {
        // YYYY-MM-DD format or other formats
        start = new Date(startDate);
      }
      
      if (dueDate.includes('/') && dueDate.split('/')[0].length <= 2) {
        // DD/MM/YYYY format
        const [day, month, year] = dueDate.split('/');
        due = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      } else {
        // YYYY-MM-DD format or other formats
        due = new Date(dueDate);
      }
      
      console.log('📅 Parsed dates:', { startDate: start, dueDate: due });
      
    } catch (dateError) {
      console.log('❌ Date parsing error:', dateError);
      return res.status(400).json({
        success: false,
        message: 'Invalid date format. Please use DD/MM/YYYY or YYYY-MM-DD format'
      });
    }
    
    // Check if dates are valid
    if (isNaN(start.getTime()) || isNaN(due.getTime())) {
      console.log('❌ Invalid parsed dates:', { start, due });
      return res.status(400).json({
        success: false,
        message: 'Invalid date format. Please use DD/MM/YYYY or YYYY-MM-DD format'
      });
    }
    
    if (start >= due) {
      console.log('❌ Due date must be after start date:', { start, due });
      return res.status(400).json({
        success: false,
        message: 'Due date must be after start date'
      });
    }

    // Create new homework (durationDays, daysLeft, status will be auto-calculated by middleware)
    const newHomework = new Homework({
      teacherId,
      className,
      subject,
      title,
      description,
      startDate: start,
      dueDate: due
    });

    const savedHomework = await newHomework.save();

    // Populate the saved homework
    await newHomework.populate('teacherId', 'fullName email subject');

    console.log('✅ Homework added successfully:', {
      id: newHomework._id,
      homeworkId: newHomework.homeworkId,
      title: newHomework.title,
      className: newHomework.className,
      subject: newHomework.subject,
      durationDays: newHomework.durationDays,
      daysLeft: newHomework.daysLeft,
      status: newHomework.status
    });

    res.status(201).json({
      success: true,
      data: {
        id: newHomework._id,
        homeworkId: newHomework.homeworkId,
        className: newHomework.className,
        subject: newHomework.subject,
        title: newHomework.title,
        description: newHomework.description,
        startDate: newHomework.startDate,
        dueDate: newHomework.dueDate,
        status: newHomework.status,
        durationDays: newHomework.durationDays,
        daysLeft: newHomework.daysLeft,
        teacher: newHomework.teacherId,
        createdAt: newHomework.createdAt,
        updatedAt: newHomework.updatedAt
      },
      message: 'Homework added successfully'
    });
  } catch (error) {
    console.error('❌ Error adding homework:', error);
    
    // Handle specific Mongoose validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message);
      console.log('❌ Validation errors:', validationErrors);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      console.log('❌ Duplicate key error:', error.keyValue);
      return res.status(400).json({
        success: false,
        message: 'Homework with this information already exists'
      });
    }
    
    // Handle other errors
    console.log('❌ Unexpected error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to add homework',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

/**
 * Update a homework
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const updateHomework = async (req, res, next) => {
  try {
    const { teacherId, homeworkId } = req.params;
    const { title, description, startDate, dueDate, status } = req.body;
    
    console.log('✏️ Updating homework:', homeworkId, 'for teacher:', teacherId);
    
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(teacherId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid teacher ID format'
      });
    }

    if (!mongoose.Types.ObjectId.isValid(homeworkId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid homework ID format'
      });
    }

    // Validate dates if provided
    if (startDate && dueDate) {
      const start = new Date(startDate);
      const due = new Date(dueDate);
      
      if (start >= due) {
        return res.status(400).json({
          success: false,
          error: 'Due date must be after start date'
        });
      }
    }

    // Find and update the homework (durationDays, daysLeft will be auto-calculated by middleware)
    const updateData: any = {};
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (startDate) updateData.startDate = new Date(startDate);
    if (dueDate) updateData.dueDate = new Date(dueDate);
    if (status) updateData.status = status;

    const updatedHomework = await Homework.findOneAndUpdate(
      { _id: homeworkId, teacherId },
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate('teacherId', 'fullName email subject');

    if (!updatedHomework) {
      return res.status(404).json({
        success: false,
        error: 'Homework not found or you do not have permission to update it'
      });
    }

    console.log('✅ Homework updated successfully:', {
      id: updatedHomework._id,
      homeworkId: updatedHomework.homeworkId,
      title: updatedHomework.title,
      durationDays: updatedHomework.durationDays,
      daysLeft: updatedHomework.daysLeft,
      status: updatedHomework.status
    });

    res.status(200).json({
      success: true,
      data: {
        id: updatedHomework._id,
        homeworkId: updatedHomework.homeworkId,
        className: updatedHomework.className,
        subject: updatedHomework.subject,
        title: updatedHomework.title,
        description: updatedHomework.description,
        startDate: updatedHomework.startDate,
        dueDate: updatedHomework.dueDate,
        status: updatedHomework.status,
        durationDays: updatedHomework.durationDays,
        daysLeft: updatedHomework.daysLeft,
        teacher: updatedHomework.teacherId,
        createdAt: updatedHomework.createdAt,
        updatedAt: updatedHomework.updatedAt
      },
      message: 'Homework updated successfully'
    });
  } catch (error) {
    console.error('❌ Error updating homework:', error);
    next(error);
  }
};

/**
 * Delete a homework
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const deleteHomework = async (req, res, next) => {
  try {
    const { teacherId, homeworkId } = req.params;
    
    console.log('🗑️ Deleting homework:', homeworkId, 'for teacher:', teacherId);
    
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(teacherId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid teacher ID format'
      });
    }

    if (!mongoose.Types.ObjectId.isValid(homeworkId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid homework ID format'
      });
    }

    // Find and delete the homework
    const deletedHomework = await Homework.findOneAndDelete({ _id: homeworkId, teacherId })
      .populate('teacherId', 'fullName email subject');

    if (!deletedHomework) {
      return res.status(404).json({
        success: false,
        error: 'Homework not found or you do not have permission to delete it'
      });
    }

    console.log('✅ Homework deleted successfully:', {
      id: deletedHomework._id,
      homeworkId: deletedHomework.homeworkId,
      title: deletedHomework.title
    });

    res.status(200).json({
      success: true,
      data: {
        id: deletedHomework._id,
        homeworkId: deletedHomework.homeworkId,
        title: deletedHomework.title,
        className: deletedHomework.className,
        subject: deletedHomework.subject
      },
      message: 'Homework deleted successfully'
    });
  } catch (error) {
    console.error('❌ Error deleting homework:', error);
    next(error);
  }
};

/**
 * Add new exam
 * POST /api/teacher/:teacherId/exam
 */
export const addExam = async (req, res, next) => {
  try {
    const { teacherId } = req.params;
    const { className, subject, title, type, date, startTime, endTime, room, durationMinutes } = req.body;

    console.log('➕ Adding new exam for teacher:', teacherId);
    console.log('📝 Request body:', req.body);

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(teacherId)) {
      console.log('❌ Invalid teacher ID format:', teacherId);
      return res.status(400).json({
        success: false,
        message: 'Invalid teacher ID format'
      });
    }

    // Validate required fields
    if (!className || !subject || !title || !type || !date || !startTime || !endTime || !room || !durationMinutes) {
      console.log('❌ Missing required fields');
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: className, subject, title, type, date, startTime, endTime, room, durationMinutes'
      });
    }

    // Get teacher info for subject validation
    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher not found'
      });
    }

    // Validate that teacher can only create exams for their own subject
    const normalizeSubject = (subject) => {
      const normalized = subject.toLowerCase().replace(/\s+/g, '');
      
      // Handle common subject variations
      const subjectMappings = {
        'math': ['mathematics', 'maths', 'mat'],
        'mathematics': ['math', 'maths', 'mat'],
        'science': ['sciences', 'sci'],
        'english': ['eng', 'lang'],
        'physics': ['phy'],
        'chemistry': ['chem'],
        'biology': ['bio'],
        'history': ['hist'],
        'geography': ['geo'],
        'french': ['fr'],
        'arabic': ['ar']
      };
      
      // Check if subjects match directly or through mappings
      for (const [key, variations] of Object.entries(subjectMappings)) {
        if (normalized === key || variations.includes(normalized)) {
          return key; // Return the canonical subject name
        }
      }
      
      return normalized; // Return as-is if no mapping found
    };
    
    const teacherSubjectNormalized = normalizeSubject(teacher.subject);
    const examSubjectNormalized = normalizeSubject(subject);
    
    if (examSubjectNormalized !== teacherSubjectNormalized) {
      return res.status(403).json({
        success: false,
        message: `You can only create exams for your subject: ${teacher.subject}. You tried to create for: ${subject}`
      });
    }

    // Create new exam
    const newExam = new Exam({
      teacherId,
      className,
      subject,
      title,
      type,
      date: new Date(date),
      startTime,
      endTime,
      room,
      durationMinutes
    });

    const savedExam = await newExam.save();

    // Populate the saved exam
    await newExam.populate('teacherId', 'fullName email subject');

    console.log('✅ Exam added successfully:', {
      id: newExam._id,
      examId: newExam.examId,
      title: newExam.title,
      className: newExam.className,
      subject: newExam.subject
    });

    res.status(201).json({
      success: true,
      data: {
        id: newExam._id,
        examId: newExam.examId,
        className: newExam.className,
        subject: newExam.subject,
        title: newExam.title,
        type: newExam.type,
        date: newExam.date,
        startTime: newExam.startTime,
        endTime: newExam.endTime,
        room: newExam.room,
        durationMinutes: newExam.durationMinutes,
        teacher: newExam.teacherId,
        createdAt: newExam.createdAt,
        updatedAt: newExam.updatedAt
      },
      message: 'Exam added successfully'
    });
  } catch (error) {
    console.error('❌ Error adding exam:', error);
    next(error);
  }
};

/**
 * Add new test
 * POST /api/teacher/:teacherId/test
 */
export const addTest = async (req, res, next) => {
  try {
    const { teacherId } = req.params;
    const { className, subject, title, type, date, startTime, endTime, room, durationMinutes } = req.body;

    console.log('➕ Adding new test for teacher:', teacherId);
    console.log('📝 Request body:', req.body);

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(teacherId)) {
      console.log('❌ Invalid teacher ID format:', teacherId);
      return res.status(400).json({
        success: false,
        message: 'Invalid teacher ID format'
      });
    }

    // Validate required fields
    if (!className || !subject || !title || !type || !date || !startTime || !endTime || !room || !durationMinutes) {
      console.log('❌ Missing required fields');
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: className, subject, title, type, date, startTime, endTime, room, durationMinutes'
      });
    }

    // Get teacher info for subject validation
    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher not found'
      });
    }

    // Validate that teacher can only create tests for their own subject
    const normalizeSubject = (subject) => {
      const normalized = subject.toLowerCase().replace(/\s+/g, '');
      
      // Handle common subject variations
      const subjectMappings = {
        'math': ['mathematics', 'maths', 'mat'],
        'mathematics': ['math', 'maths', 'mat'],
        'science': ['sciences', 'sci'],
        'english': ['eng', 'lang'],
        'physics': ['phy'],
        'chemistry': ['chem'],
        'biology': ['bio'],
        'history': ['hist'],
        'geography': ['geo'],
        'french': ['fr'],
        'arabic': ['ar']
      };
      
      // Check if subjects match directly or through mappings
      for (const [key, variations] of Object.entries(subjectMappings)) {
        if (normalized === key || variations.includes(normalized)) {
          return key; // Return the canonical subject name
        }
      }
      
      return normalized; // Return as-is if no mapping found
    };
    
    const teacherSubjectNormalized = normalizeSubject(teacher.subject);
    const testSubjectNormalized = normalizeSubject(subject);
    
    if (testSubjectNormalized !== teacherSubjectNormalized) {
      return res.status(403).json({
        success: false,
        message: `You can only create tests for your subject: ${teacher.subject}. You tried to create for: ${subject}`
      });
    }

    // Create new test
    const newTest = new Test({
      teacherId,
      className,
      subject,
      title,
      type,
      date: new Date(date),
      startTime,
      endTime,
      room,
      durationMinutes
    });

    const savedTest = await newTest.save();

    // Populate the saved test
    await newTest.populate('teacherId', 'fullName email subject');

    console.log('✅ Test added successfully:', {
      id: newTest._id,
      testId: newTest.testId,
      title: newTest.title,
      className: newTest.className,
      subject: newTest.subject
    });

    res.status(201).json({
      success: true,
      data: {
        id: newTest._id,
        testId: newTest.testId,
        className: newTest.className,
        subject: newTest.subject,
        title: newTest.title,
        type: newTest.type,
        date: newTest.date,
        startTime: newTest.startTime,
        endTime: newTest.endTime,
        room: newTest.room,
        durationMinutes: newTest.durationMinutes,
        teacher: newTest.teacherId,
        createdAt: newTest.createdAt,
        updatedAt: newTest.updatedAt
      },
      message: 'Test added successfully'
    });
  } catch (error) {
    console.error('❌ Error adding test:', error);
    next(error);
  }
};

/**
 * Add new announcement
 * POST /api/teacher/:teacherId/announcement
 */
export const addAnnouncement = async (req, res, next) => {
  try {
    const { teacherId } = req.params;
    const { className, targetClasses, title, type, priority, content, postedBy } = req.body;

    console.log('➕ Adding new announcement for teacher:', teacherId);
    console.log('📝 Request body:', req.body);

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(teacherId)) {
      console.log('❌ Invalid teacher ID format:', teacherId);
      return res.status(400).json({
        success: false,
        message: 'Invalid teacher ID format'
      });
    }

    // Validate required fields
    if (!title || !content || !postedBy) {
      console.log('❌ Missing required fields');
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: title, content, postedBy'
      });
    }

    // Normalize classes: accept either single className or multiple targetClasses
    const classes = Array.isArray(targetClasses)
      ? targetClasses.filter(Boolean)
      : (className ? [className] : []);

    // Create new announcement
    const newAnnouncement = new Announcement({
      teacherId,
      className: classes.length === 1 ? classes[0] : undefined,
      targetClasses: classes,
      title,
      type: type || 'info',
      priority: priority || 'low',
      content,
      postedBy,
      date: new Date()
    });

    const savedAnnouncement = await newAnnouncement.save();

    // Populate the saved announcement
    await newAnnouncement.populate('teacherId', 'fullName email subject');

    console.log('✅ Announcement added successfully:', {
      id: newAnnouncement._id,
      announcementId: newAnnouncement.announcementId,
      title: newAnnouncement.title,
      className: newAnnouncement.className,
      targetClasses: newAnnouncement.targetClasses
    });

    res.status(201).json({
      success: true,
      data: {
        id: newAnnouncement._id,
        announcementId: newAnnouncement.announcementId,
        className: newAnnouncement.className,
        targetClasses: newAnnouncement.targetClasses,
        title: newAnnouncement.title,
        type: newAnnouncement.type,
        priority: newAnnouncement.priority,
        content: newAnnouncement.content,
        date: newAnnouncement.date,
        postedBy: newAnnouncement.postedBy,
        teacher: newAnnouncement.teacherId,
        createdAt: newAnnouncement.createdAt,
        updatedAt: newAnnouncement.updatedAt
      },
      message: 'Announcement added successfully'
    });
  } catch (error) {
    console.error('❌ Error adding announcement:', error);
    next(error);
  }
};

/**
 * Delete a test
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const deleteTest = async (req, res, next) => {
  try {
    const { teacherId, testId } = req.params;
    console.log('🗑️ Deleting test:', { teacherId, testId });

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(teacherId) || !mongoose.Types.ObjectId.isValid(testId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid teacher ID or test ID format'
      });
    }

    // Get teacher info for subject validation
    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher not found'
      });
    }

    // Find the test and verify teacher owns it and it's their subject
    const test = await Test.findById(testId);
    if (!test) {
      return res.status(404).json({
        success: false,
        message: 'Test not found'
      });
    }

    if (test.teacherId.toString() !== teacherId) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own tests'
      });
    }

    // Normalize subject names for comparison (handle common variations)
    const normalizeSubject = (subject) => {
      const normalized = subject.toLowerCase().replace(/\s+/g, '');
      
      // Handle common subject variations
      const subjectMappings = {
        'math': ['mathematics', 'maths', 'mat'],
        'mathematics': ['math', 'maths', 'mat'],
        'science': ['sciences', 'sci'],
        'english': ['eng', 'lang'],
        'physics': ['phy'],
        'chemistry': ['chem'],
        'biology': ['bio'],
        'history': ['hist'],
        'geography': ['geo'],
        'french': ['fr'],
        'arabic': ['ar']
      };
      
      // Check if subjects match directly or through mappings
      for (const [key, variations] of Object.entries(subjectMappings)) {
        if (normalized === key || variations.includes(normalized)) {
          return key; // Return the canonical subject name
        }
      }
      
      return normalized; // Return as-is if no mapping found
    };
    
    const teacherSubjectNormalized = normalizeSubject(teacher.subject);
    const testSubjectNormalized = normalizeSubject(test.subject);
    
    if (testSubjectNormalized !== teacherSubjectNormalized) {
      return res.status(403).json({
        success: false,
        message: `You can only delete tests for your subject: ${teacher.subject}. Test subject: ${test.subject}`
      });
    }

    // Delete the test
    await Test.findByIdAndDelete(testId);

    console.log('✅ Test deleted successfully:', testId);

    res.status(200).json({
      success: true,
      data: {
        deletedTestId: testId,
        testTitle: test.title,
        className: test.className
      },
      message: 'Test deleted successfully'
    });
  } catch (error) {
    console.error('❌ Error deleting test:', error);
    next(error);
  }
};

/**
 * Delete an exam
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const deleteExam = async (req, res, next) => {
  try {
    const { teacherId, examId } = req.params;
    console.log('🗑️ Deleting exam:', { teacherId, examId });

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(teacherId) || !mongoose.Types.ObjectId.isValid(examId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid teacher ID or exam ID format'
      });
    }

    // Get teacher info for subject validation
    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher not found'
      });
    }

    // Find the exam and verify teacher owns it and it's their subject
    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Exam not found'
      });
    }

    if (exam.teacherId.toString() !== teacherId) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own exams'
      });
    }

    // Normalize subject names for comparison (handle common variations)
    const normalizeSubject = (subject) => {
      const normalized = subject.toLowerCase().replace(/\s+/g, '');
      
      // Handle common subject variations
      const subjectMappings = {
        'math': ['mathematics', 'maths', 'mat'],
        'mathematics': ['math', 'maths', 'mat'],
        'science': ['sciences', 'sci'],
        'english': ['eng', 'lang'],
        'physics': ['phy'],
        'chemistry': ['chem'],
        'biology': ['bio'],
        'history': ['hist'],
        'geography': ['geo'],
        'french': ['fr'],
        'arabic': ['ar']
      };
      
      // Check if subjects match directly or through mappings
      for (const [key, variations] of Object.entries(subjectMappings)) {
        if (normalized === key || variations.includes(normalized)) {
          return key; // Return the canonical subject name
        }
      }
      
      return normalized; // Return as-is if no mapping found
    };
    
    const teacherSubjectNormalized = normalizeSubject(teacher.subject);
    const examSubjectNormalized = normalizeSubject(exam.subject);
    
    if (examSubjectNormalized !== teacherSubjectNormalized) {
      return res.status(403).json({
        success: false,
        message: `You can only delete exams for your subject: ${teacher.subject}. Exam subject: ${exam.subject}`
      });
    }

    // Delete the exam
    await Exam.findByIdAndDelete(examId);

    console.log('✅ Exam deleted successfully:', examId);

    res.status(200).json({
      success: true,
      data: {
        deletedExamId: examId,
        examTitle: exam.title,
        className: exam.className
      },
      message: 'Exam deleted successfully'
    });
  } catch (error) {
    console.error('❌ Error deleting exam:', error);
    next(error);
  }
};

/**
 * Update a test
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const updateTest = async (req, res, next) => {
  try {
    const { teacherId, testId } = req.params;
    const updateData = req.body;
    console.log('📝 Updating test:', { teacherId, testId, updateData });

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(teacherId) || !mongoose.Types.ObjectId.isValid(testId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid teacher ID or test ID format'
      });
    }

    // Get teacher info for subject validation
    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher not found'
      });
    }

    // Find the test and verify teacher owns it
    const test = await Test.findById(testId);
    if (!test) {
      return res.status(404).json({
        success: false,
        message: 'Test not found'
      });
    }

    if (test.teacherId.toString() !== teacherId) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own tests'
      });
    }

    // Validate subject if being changed
    if (updateData.subject) {
      const normalizeSubject = (subject) => {
        const normalized = subject.toLowerCase().replace(/\s+/g, '');
        
        // Handle common subject variations
        const subjectMappings = {
          'math': ['mathematics', 'maths', 'mat'],
          'mathematics': ['math', 'maths', 'mat'],
          'science': ['sciences', 'sci'],
          'english': ['eng', 'lang'],
          'physics': ['phy'],
          'chemistry': ['chem'],
          'biology': ['bio'],
          'history': ['hist'],
          'geography': ['geo'],
          'french': ['fr'],
          'arabic': ['ar']
        };
        
        // Check if subjects match directly or through mappings
        for (const [key, variations] of Object.entries(subjectMappings)) {
          if (normalized === key || variations.includes(normalized)) {
            return key; // Return the canonical subject name
          }
        }
        
        return normalized; // Return as-is if no mapping found
      };
      
      const teacherSubjectNormalized = normalizeSubject(teacher.subject);
      const updateSubjectNormalized = normalizeSubject(updateData.subject);
      
      if (updateSubjectNormalized !== teacherSubjectNormalized) {
        return res.status(403).json({
          success: false,
          message: `You can only create tests for your subject: ${teacher.subject}`
        });
      }
    }

    // Update the test
    const updatedTest = await Test.findByIdAndUpdate(
      testId,
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    console.log('✅ Test updated successfully:', updatedTest.testId);

    res.status(200).json({
      success: true,
      data: {
        test: {
          id: updatedTest._id,
          testId: updatedTest.testId,
          className: updatedTest.className,
          subject: updatedTest.subject,
          title: updatedTest.title,
          type: updatedTest.type,
          date: updatedTest.date,
          startTime: updatedTest.startTime,
          endTime: updatedTest.endTime,
          room: updatedTest.room,
          durationMinutes: updatedTest.durationMinutes,
          teacherId: updatedTest.teacherId,
          createdAt: updatedTest.createdAt,
          updatedAt: updatedTest.updatedAt
        }
      },
      message: 'Test updated successfully'
    });
  } catch (error) {
    console.error('❌ Error updating test:', error);
    next(error);
  }
};

/**
 * Get students by teacher's classes
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const getStudents = async (req, res, next) => {
  try {
    const { teacherId } = req.params;
    console.log('👥 Fetching students for teacher:', teacherId);

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(teacherId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid teacher ID format'
      });
    }

    // Find teacher to get their classes
    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher not found'
      });
    }

    console.log('✅ Teacher found:', { name: teacher.fullName, classes: teacher.classes });

    // Group students by class
    const studentsByClass = {};
    let totalStudents = 0;

    for (const className of teacher.classes) {
      const students = await Student.find({ className })
        .select('_id name email gpa attendance className')
        .lean();

      console.log(`📚 Found ${students.length} students in class ${className}`);
      
      if (students.length > 0) {
        studentsByClass[className] = students.map(student => ({
          _id: student._id,
          fullName: student.name, // Map name to fullName for frontend consistency
          email: student.email,
          averageGrade: student.gpa ? student.gpa.toString() : 'N/A',
          attendance: student.attendance ? `${student.attendance}%` : 'N/A',
          className: student.className
        }));
        totalStudents += students.length;
      } else {
        studentsByClass[className] = [];
      }
    }

    console.log('✅ Students fetched successfully:', {
      teacherId,
      totalClasses: teacher.classes.length,
      totalStudents
    });

    res.status(200).json({
      success: true,
      data: {
        teacherId,
        teacherName: teacher.fullName,
        classes: teacher.classes,
        studentsByClass,
        totalClasses: teacher.classes.length,
        totalStudents
      },
      message: 'Students retrieved successfully'
    });

  } catch (error) {
    console.error('❌ Error fetching students:', error);
    next(error);
  }
};

/**
 * Get students for a specific class
 * GET /api/teacher/:teacherId/students/:className
 */
export const getStudentsByClass = async (req, res, next) => {
  try {
    const { teacherId, className } = req.params;
    console.log(`👥 Fetching students for teacher ${teacherId} in class ${className}`);

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(teacherId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid teacher ID format'
      });
    }

    // Find teacher to verify they teach this class
    const teacher = await Teacher.findById(teacherId).lean();
    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher not found'
      });
    }

    if (!teacher.classes.includes(className)) {
      return res.status(403).json({
        success: false,
        message: 'Teacher does not teach this class'
      });
    }

    // Find students in this class
    const students = await Student.find({ className: className })
      .select('_id name email gradeLevel gpa attendance profilePicture className')
      .lean();

    console.log(`✅ Found ${students.length} students in class ${className}`);

    res.status(200).json({
      success: true,
      data: {
        className,
        subject: teacher.subject,
        students: students,
        studentCount: students.length
      },
      message: 'Students retrieved successfully'
    });
  } catch (error) {
    console.error('❌ Error fetching students by class:', error);
    next(error);
  }
};

/**
 * Add a new student
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const addStudent = async (req, res, next) => {
  try {
    const { teacherId } = req.params;
    const { fullName, email, className, averageGrade, attendance } = req.body;

    console.log('👤 Adding new student:', {
      teacherId,
      fullName,
      email,
      className,
      averageGrade,
      attendance
    });

    // Validate teacher ID
    if (!mongoose.Types.ObjectId.isValid(teacherId)) {
      return res.status(400).json({ success: false, message: 'Invalid teacher ID format' });
    }

    // Check if teacher exists and has access to the class
    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }

    if (!teacher.classes.includes(className)) {
      return res.status(403).json({ 
        success: false, 
        message: `You can only add students to your assigned classes: ${teacher.classes.join(', ')}` 
      });
    }

    // Check if student with same email already exists
    const existingStudent = await Student.findOne({ email });
    if (existingStudent) {
      return res.status(400).json({ 
        success: false, 
        message: 'A student with this email already exists' 
      });
    }

    // Create new student
    const newStudent = new Student({
      name: fullName, // Map fullName to name field
      email,
      className,
      password: 'temp123', // Temporary password - should be changed by student on first login
      attendance: attendance || 95, // Default attendance
      gpa: averageGrade ? parseFloat(averageGrade.replace(/[^0-9.]/g, '')) : 0 // Convert grade to GPA
    });

    await newStudent.save();

    console.log('✅ Student created successfully:', {
      studentId: newStudent._id,
      fullName: newStudent.name,
      className: newStudent.className
    });

    res.status(201).json({
      success: true,
      data: {
        student: {
          _id: newStudent._id,
          fullName: newStudent.name, // Map name back to fullName for frontend
          email: newStudent.email,
          className: newStudent.className,
          averageGrade: newStudent.gpa ? newStudent.gpa.toString() : 'N/A',
          attendance: newStudent.attendance ? `${newStudent.attendance}%` : 'N/A'
        }
      },
      message: 'Student created successfully'
    });

  } catch (error) {
    console.error('❌ Error adding student:', error);
    next(error);
  }
};

/**
 * Update a student
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const updateStudent = async (req, res, next) => {
  try {
    const { teacherId, studentId } = req.params;
    const updateData = req.body;

    console.log('✏️ Updating student:', {
      teacherId,
      studentId,
      updateData
    });

    // Validate IDs
    if (!mongoose.Types.ObjectId.isValid(teacherId) || !mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({ success: false, message: 'Invalid ID format' });
    }

    // Check if teacher exists
    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }

    // Find the student
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // Check if teacher has access to student's class
    if (!teacher.classes.includes(student.className)) {
      return res.status(403).json({ 
        success: false, 
        message: `You can only manage students from your assigned classes: ${teacher.classes.join(', ')}` 
      });
    }

    // If updating className, check if teacher has access to new class
    if (updateData.className && !teacher.classes.includes(updateData.className)) {
      return res.status(403).json({ 
        success: false, 
        message: `You can only assign students to your assigned classes: ${teacher.classes.join(', ')}` 
      });
    }

    // If updating email, check if it's already taken by another student
    if (updateData.email && updateData.email !== student.email) {
      const existingStudent = await Student.findOne({ email: updateData.email });
      if (existingStudent) {
        return res.status(400).json({ 
          success: false, 
          message: 'A student with this email already exists' 
        });
      }
    }

    // Map frontend fields to model fields
    const mappedUpdateData = {
      ...updateData,
      name: updateData.fullName || undefined, // Map fullName to name
      gpa: updateData.averageGrade ? parseFloat(updateData.averageGrade.replace(/[^0-9.]/g, '')) : undefined // Convert grade to GPA
    };
    
    // Remove frontend-specific fields that don't exist in the model
    delete mappedUpdateData.fullName;
    delete mappedUpdateData.averageGrade;

    // Update the student
    const updatedStudent = await Student.findByIdAndUpdate(
      studentId,
      mappedUpdateData,
      { new: true, runValidators: true }
    );

    console.log('✅ Student updated successfully:', {
      studentId: updatedStudent._id,
      fullName: updatedStudent.name,
      className: updatedStudent.className
    });

    res.status(200).json({
      success: true,
      data: {
        student: {
          _id: updatedStudent._id,
          fullName: updatedStudent.name, // Map name back to fullName for frontend
          email: updatedStudent.email,
          className: updatedStudent.className,
          averageGrade: updatedStudent.gpa ? updatedStudent.gpa.toString() : 'N/A',
          attendance: updatedStudent.attendance ? `${updatedStudent.attendance}%` : 'N/A'
        }
      },
      message: 'Student updated successfully'
    });

  } catch (error) {
    console.error('❌ Error updating student:', error);
    next(error);
  }
};

/**
 * Delete a student
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const deleteStudent = async (req, res, next) => {
  try {
    const { teacherId, studentId } = req.params;

    console.log('🗑️ Deleting student:', {
      teacherId,
      studentId
    });

    // Validate IDs
    if (!mongoose.Types.ObjectId.isValid(teacherId) || !mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({ success: false, message: 'Invalid ID format' });
    }

    // Check if teacher exists
    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }

    // Find the student
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // Check if teacher has access to student's class
    if (!teacher.classes.includes(student.className)) {
      return res.status(403).json({ 
        success: false, 
        message: `You can only manage students from your assigned classes: ${teacher.classes.join(', ')}` 
      });
    }

    // Delete the student
    await Student.findByIdAndDelete(studentId);

    console.log('✅ Student deleted successfully:', {
      studentId,
      fullName: student.name,
      className: student.className
    });

    res.status(200).json({
      success: true,
      message: `Student "${student.name}" deleted successfully`
    });

  } catch (error) {
    console.error('❌ Error deleting student:', error);
    next(error);
  }
};

/**
 * Update an exam
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const updateExam = async (req, res, next) => {
  try {
    const { teacherId, examId } = req.params;
    const updateData = req.body;
    console.log('📝 Updating exam:', { teacherId, examId, updateData });

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(teacherId) || !mongoose.Types.ObjectId.isValid(examId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid teacher ID or exam ID format'
      });
    }

    // Get teacher info for subject validation
    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher not found'
      });
    }

    // Find the exam and verify teacher owns it
    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Exam not found'
      });
    }

    if (exam.teacherId.toString() !== teacherId) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own exams'
      });
    }

    // Validate subject if being changed
    if (updateData.subject) {
      const normalizeSubject = (subject) => {
        const normalized = subject.toLowerCase().replace(/\s+/g, '');
        
        // Handle common subject variations
        const subjectMappings = {
          'math': ['mathematics', 'maths', 'mat'],
          'mathematics': ['math', 'maths', 'mat'],
          'science': ['sciences', 'sci'],
          'english': ['eng', 'lang'],
          'physics': ['phy'],
          'chemistry': ['chem'],
          'biology': ['bio'],
          'history': ['hist'],
          'geography': ['geo'],
          'french': ['fr'],
          'arabic': ['ar']
        };
        
        // Check if subjects match directly or through mappings
        for (const [key, variations] of Object.entries(subjectMappings)) {
          if (normalized === key || variations.includes(normalized)) {
            return key; // Return the canonical subject name
          }
        }
        
        return normalized; // Return as-is if no mapping found
      };
      
      const teacherSubjectNormalized = normalizeSubject(teacher.subject);
      const updateSubjectNormalized = normalizeSubject(updateData.subject);
      
      if (updateSubjectNormalized !== teacherSubjectNormalized) {
        return res.status(403).json({
          success: false,
          message: `You can only create exams for your subject: ${teacher.subject}`
        });
      }
    }

    // Update the exam
    const updatedExam = await Exam.findByIdAndUpdate(
      examId,
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    console.log('✅ Exam updated successfully:', updatedExam.examId);

    res.status(200).json({
      success: true,
      data: {
        exam: {
          id: updatedExam._id,
          examId: updatedExam.examId,
          className: updatedExam.className,
          subject: updatedExam.subject,
          title: updatedExam.title,
          type: updatedExam.type,
          date: updatedExam.date,
          startTime: updatedExam.startTime,
          endTime: updatedExam.endTime,
          room: updatedExam.room,
          durationMinutes: updatedExam.durationMinutes,
          teacherId: updatedExam.teacherId,
          createdAt: updatedExam.createdAt,
          updatedAt: updatedExam.updatedAt
        }
      },
      message: 'Exam updated successfully'
    });
  } catch (error) {
    console.error('❌ Error updating exam:', error);
    next(error);
  }
};

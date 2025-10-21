import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import Student from "../models/Student.model.js";
import User from "../models/User.js";
import ClassSchedule from "../models/ClassSchedule.model.js";
import Grade from "../models/Grade.model.js";
import Homework from "../models/Homework.model.js";
import Exam from "../models/Exam.model.js";
import Test from "../models/Test.model.js";
import Announcement from "../models/Announcement.model.js";

/**
 * Get student profile
 * GET /api/student/:id/profile
 * :id is the userId from the users collection
 */
export const getProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id;
    console.log("👤 Fetching profile for ID:", id);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ID format"
      });
    }

    // Try to find student by userId first, then by _id (student document ID)
    let student = await Student.findOne({ userId: id }).select('-password').populate('userId');
    
    if (!student) {
      // If not found by userId, try by student document _id
      student = await Student.findById(id).select('-password').populate('userId');
    }
    
    if (!student) {
      console.log("❌ Student not found for ID:", id);
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }

    console.log("✅ Student found:", student.name, "(studentId:", student._id.toString() + ")");
    // Get user data (if populated)
    const user: any = student.userId || await User.findById(id);

    // Get class count from ClassSchedule using student._id
    const classCount = await ClassSchedule.countDocuments({ studentId: student._id });

    // Calculate total credits (assuming 4 credits per class)
    const totalCredits = classCount * 4;

    // Format enrollment date
    const enrollmentDate = student.enrollmentDate 
      ? new Date(student.enrollmentDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
      : 'N/A';

    const profile = {
      id: student._id,
      userId: id,
      name: student.name || user?.name || 'N/A',
      class: student.className || 'Not Assigned',
      email: student.email || user?.email || 'N/A',
      phone: student.phone || user?.phone || 'N/A',
      address: student.address || 'N/A',
      parentName: student.parentName || 'N/A',
      parentPhone: student.parentPhone || 'N/A',
      enrollmentDate: enrollmentDate,
      gpa: student.gpa?.toFixed(1) || '0.0',
      attendance: `${student.attendance || 95}%`,
      classCount: classCount,
      totalCredits: totalCredits,
      profilePicture: student.profilePicture || null,
      gradeLevel: student.gradeLevel,
      className: student.className,
      createdAt: student.createdAt
    };

    console.log("✅ Profile fetched successfully for:", profile.name);
    console.log(`📚 Student ID: ${student._id}, Classes: ${classCount}, GPA: ${profile.gpa}, Attendance: ${profile.attendance}`);

    res.status(200).json({
      success: true,
      data: profile,
      message: "Student profile retrieved successfully"
    });
  } catch (error) {
    console.error("❌ Error fetching student profile:", error);
    next(error);
  }
};

/**
 * Get student dashboard data
 * GET /api/student/:id/dashboard
 * :id is the userId from the users collection
 */
export const getDashboard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id;
    console.log("📊 Fetching dashboard data for ID:", id);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ID format"
      });
    }

    // Try to find student by userId first, then by _id (student document ID)
    let student = await Student.findOne({ userId: id }).select('-password');
    
    if (!student) {
      // If not found by userId, try by student document _id
      student = await Student.findById(id).select('-password');
    }
    
    if (!student) {
      console.log("❌ Student not found for ID:", id);
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }

    console.log("✅ Student found:", student.name, "(studentId:", student._id.toString() + ")");
    const studentId = student._id;

    // Fetch upcoming class (next class today or tomorrow)
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const currentTime = today.toTimeString().slice(0, 5);
    const nextClass = await ClassSchedule.findOne({
      studentId: studentId,
      $or: [
        { day: today.toLocaleDateString('en-US', { weekday: 'long' }) },
        { day: tomorrow.toLocaleDateString('en-US', { weekday: 'long' }) }
      ],
      startTime: { $gte: currentTime }
    }).sort({ startTime: 1 }).limit(1);

    // Fetch next upcoming exam (check both exams and tests)
    const [nextExam, nextTest] = await Promise.all([
      Exam.findOne({
        studentId: studentId,
        date: { $gte: today }
      }).sort({ date: 1 }).limit(1),
      Test.findOne({
        studentId: studentId,
        date: { $gte: today }
      }).sort({ date: 1 }).limit(1)
    ]);

    // Select the earlier one
    let nextAssessment = null;
    if (nextExam && nextTest) {
      nextAssessment = new Date(nextExam.date) < new Date(nextTest.date) ? nextExam : nextTest;
    } else {
      nextAssessment = nextExam || nextTest;
    }

    // Count pending homework
    const pendingHomeworkCount = await Homework.countDocuments({
      studentId: studentId,
      status: { $in: ['active', 'upcoming'] }
    });

    // Count upcoming exams and tests
    const [upcomingExamsCount, upcomingTestsCount] = await Promise.all([
      Exam.countDocuments({
        studentId: studentId,
        date: { $gte: today }
      }),
      Test.countDocuments({
        studentId: studentId,
        date: { $gte: today }
      })
    ]);
    const upcomingAssessmentsCount = upcomingExamsCount + upcomingTestsCount;

    // Count new announcements (last 7 days)
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const newAnnouncementsCount = await Announcement.countDocuments({
      date: { $gte: weekAgo }
    });

    // Fetch recent activities (last 5 of each type)
    const [recentAnnouncements, recentGrades, recentHomework] = await Promise.all([
      Announcement.find({}).sort({ date: -1 }).limit(5).select('title type date'),
      Grade.find({ studentId: studentId }).sort({ createdAt: -1 }).limit(5).select('subject finalGrade status'),
      Homework.find({ studentId: studentId }).sort({ createdAt: -1 }).limit(5).select('title subject status dueDate')
    ]);

    const dashboardData = {
      student: {
        id: student._id,
        userId: id,
        name: student.name,
        gradeLevel: student.gradeLevel,
        gpa: student.gpa,
        profilePicture: student.profilePicture
      },
      nextClass: nextClass ? {
        subject: nextClass.subject,
        day: nextClass.day,
        startTime: nextClass.startTime,
        endTime: nextClass.endTime,
        room: nextClass.room
      } : null,
      nextExam: nextAssessment ? {
        title: nextAssessment.title,
        subject: nextAssessment.subject,
        type: nextAssessment.type,
        date: nextAssessment.date,
        startTime: nextAssessment.startTime,
        room: nextAssessment.room
      } : null,
      counts: {
        pendingHomework: pendingHomeworkCount,
        upcomingExams: upcomingAssessmentsCount,
        newAnnouncements: newAnnouncementsCount
      },
      recentActivities: {
        announcements: recentAnnouncements,
        grades: recentGrades,
        homework: recentHomework
      }
    };

    console.log("✅ Dashboard data fetched successfully");
    console.log(`📈 Counts - Homework: ${pendingHomeworkCount}, Exams: ${upcomingAssessmentsCount}, Announcements: ${newAnnouncementsCount}`);

    res.status(200).json({
      success: true,
      data: dashboardData,
      message: "Dashboard data retrieved successfully"
    });
  } catch (error) {
    console.error("❌ Error fetching dashboard data:", error);
    next(error);
  }
};

/**
 * Get student schedule
 * GET /api/student/:id/schedule
 * :id is the userId from the users collection
 * Returns schedule grouped by day of the week
 */
export const getSchedule = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id;
    console.log("📅 Fetching schedule for ID:", id);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ID format"
      });
    }

    // Try to find student by userId first, then by _id (student document ID)
    let student = await Student.findOne({ userId: id });
    
    if (!student) {
      // If not found by userId, try by student document _id
      student = await Student.findById(id);
    }
    
    if (!student) {
      console.log("❌ Student not found for ID:", id);
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }

    console.log("✅ Student found:", student.name, "(studentId:", student._id.toString() + ")");
    const studentId = student._id;
    const className = student.className;
    
    console.log(`📚 Fetching schedule for class: ${className}`);
    const scheduleItems = await ClassSchedule.find({ className: className })
      .populate('teacherId', 'fullName subject')
      .sort({ startTime: 1 });

    // Group by day of the week
    const daysOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const groupedSchedule: any = {};
    
    // Initialize all days
    daysOrder.forEach(day => {
      groupedSchedule[day] = [];
    });

    // Group schedule items by day
    scheduleItems.forEach(item => {
      if (groupedSchedule[item.day]) {
        groupedSchedule[item.day].push({
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
      }
    });

    console.log(`✅ Found ${scheduleItems.length} schedule items for student ${studentId}`);

    res.status(200).json({
      success: true,
      data: {
        userId: id,
        studentId: studentId,
        schedule: groupedSchedule
      },
      message: "Schedule retrieved successfully"
    });
  } catch (error) {
    console.error("❌ Error fetching schedule:", error);
    next(error);
  }
};

/**
 * Get student grades
 * GET /api/student/:id/grades
 * :id is the userId from the users collection
 */
export const getGrades = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id;
    console.log("📊 Fetching grades for ID:", id);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ID format"
      });
    }

    // Try to find student by userId first, then by _id (student document ID)
    let student = await Student.findOne({ userId: id });
    
    if (!student) {
      // If not found by userId, try by student document _id
      student = await Student.findById(id);
    }
    
    if (!student) {
      console.log("❌ Student not found for ID:", id);
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }

    console.log("✅ Student found:", student.name, "(studentId:", student._id.toString() + ")");
    const studentId = student._id;
    const grades = await Grade.find({ studentId: studentId }).sort({ subject: 1 });

    // Calculate overall average
    const overallAverage = grades.length > 0 
      ? (grades.reduce((sum, g) => sum + g.finalGrade, 0) / grades.length).toFixed(2)
      : 0;

    console.log(`✅ Found ${grades.length} grade records for student ${studentId}, Overall Average: ${overallAverage}`);

    res.status(200).json({
      success: true,
      data: {
        userId: id,
        studentId: studentId,
        grades: grades,
        overallAverage: parseFloat(overallAverage as string),
        passingGrades: grades.filter(g => g.status === 'Pass').length
      },
      message: "Grades retrieved successfully"
    });
  } catch (error) {
    console.error("❌ Error fetching grades:", error);
    next(error);
  }
};

/**
 * Get student homework
 * GET /api/student/:id/homework
 * :id is the userId from the users collection
 */
export const getHomework = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id;
    console.log("📝 Fetching homework for ID:", id);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ID format"
      });
    }

    // Try to find student by userId first, then by _id (student document ID)
    let student = await Student.findOne({ userId: id });
    
    if (!student) {
      // If not found by userId, try by student document _id
      student = await Student.findById(id);
    }
    
    if (!student) {
      console.log("❌ Student not found for ID:", id);
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }

    console.log("✅ Student found:", student.name, "(studentId:", student._id.toString() + ")");
    const studentId = student._id;
    const homeworkList = await Homework.find({ studentId: studentId }).sort({ dueDate: 1 });

    // Update status based on dates
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const updatedHomework = homeworkList.map(hw => {
      const startDate = new Date(hw.startDate);
      startDate.setHours(0, 0, 0, 0);
      const dueDate = new Date(hw.dueDate);
      dueDate.setHours(0, 0, 0, 0);

      let status = hw.status;
      if (today > dueDate) {
        status = 'overdue';
      } else if (today < startDate) {
        status = 'upcoming';
      } else {
        status = 'active';
      }

      return {
        ...hw.toObject(),
        status: status
      };
    });

    // Separate by status
    const active = updatedHomework.filter(hw => hw.status === 'active');
    const upcoming = updatedHomework.filter(hw => hw.status === 'upcoming');
    const overdue = updatedHomework.filter(hw => hw.status === 'overdue');

    console.log(`✅ Found ${homeworkList.length} homework assignments for student ${studentId} (Active: ${active.length}, Upcoming: ${upcoming.length}, Overdue: ${overdue.length})`);

    res.status(200).json({
      success: true,
      data: {
        userId: id,
        studentId: studentId,
        homework: updatedHomework,
        counts: {
          active: active.length,
          upcoming: upcoming.length,
          overdue: overdue.length,
          total: updatedHomework.length
        }
      },
      message: "Homework retrieved successfully"
    });
  } catch (error) {
    console.error("❌ Error fetching homework:", error);
    next(error);
  }
};

/**
 * Get student exams and tests
 * GET /api/student/:id/exams
 * :id is the userId from the users collection
 * Returns data from both exams and tests collections, grouped by type
 */
export const getExams = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id;
    console.log("📋 Fetching exams and tests for ID:", id);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ID format"
      });
    }

    // Try to find student by userId first, then by _id (student document ID)
    let student = await Student.findOne({ userId: id });
    
    if (!student) {
      // If not found by userId, try by student document _id
      student = await Student.findById(id);
    }
    
    if (!student) {
      console.log("❌ Student not found for ID:", id);
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }

    console.log("✅ Student found:", student.name, "(studentId:", student._id.toString() + ")");
    const studentId = student._id;

    // Fetch all exams and tests for the student's class
    const [exams, tests] = await Promise.all([
      Exam.find({ className: student.className }).sort({ date: 1 }),
      Test.find({ className: student.className }).sort({ date: 1 })
    ]);

    console.log(`✅ Found ${exams.length} exams and ${tests.length} tests for student ${studentId}`);

    res.status(200).json({
      success: true,
      data: {
        userId: id,
        studentId: studentId,
        exams: exams,
        tests: tests
      },
      message: "Exams and tests retrieved successfully"
    });
  } catch (error) {
    console.error("❌ Error fetching exams and tests:", error);
    next(error);
  }
};

/**
 * Get student tests
 * GET /api/student/:id/tests
 */
export const getTests = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id;
    console.log("📋 Fetching tests for ID:", id);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ID format"
      });
    }

    // Try to find student by userId first, then by _id (student document ID)
    let student = await Student.findOne({ userId: id });
    
    if (!student) {
      // If not found by userId, try by student document _id
      student = await Student.findById(id);
    }
    
    if (!student) {
      console.log("❌ Student not found for ID:", id);
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }

    console.log("✅ Student found:", student.name, "(studentId:", student._id.toString() + ")");
    const studentId = student._id;

    // Fetch all tests for the student's class
    const tests = await Test.find({ className: student.className })
      .populate('teacherId', 'fullName email subject')
      .sort({ date: 1 })
      .lean();

    console.log(`✅ Found ${tests.length} tests for student ${studentId}`);

    res.status(200).json({
      success: true,
      data: {
        userId: id,
        studentId: studentId,
        studentName: student.name,
        className: student.className,
        tests: tests.map(test => ({
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
        totalTests: tests.length
      },
      message: "Tests retrieved successfully"
    });
  } catch (error) {
    console.error("❌ Error fetching tests:", error);
    next(error);
  }
};

/**
 * Get student announcements
 * GET /api/student/:id/announcements
 * :id is the userId from the users collection
 */
export const getAnnouncement = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id;
    console.log("📢 Fetching announcements for ID:", id);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ID format"
      });
    }

    // Try to find student by userId first, then by _id (student document ID)
    let student = await Student.findOne({ userId: id });
    
    if (!student) {
      // If not found by userId, try by student document _id
      student = await Student.findById(id);
    }
    
    if (!student) {
      console.log("❌ Student not found for ID:", id);
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }

    console.log("✅ Student found:", student.name, "(studentId:", student._id.toString() + ")");
    const studentId = student._id;
    
    // Fetch announcements for the student's class (supports legacy className and new targetClasses)
    const announcements = await Announcement.find({
      $or: [
        { className: student.className }, // legacy
        { targetClasses: { $in: [student.className] } }, // new multi-class
        { className: { $exists: false } }, // general
        { className: null } // general
      ]
    }).sort({ date: -1 });

    console.log(`✅ Found ${announcements.length} announcements for student ${studentId}`);

    res.status(200).json({
      success: true,
      data: {
        userId: id,
        studentId: studentId,
        announcements: announcements
      },
      message: "Announcements retrieved successfully"
    });
  } catch (error) {
    console.error("❌ Error fetching announcements:", error);
    next(error);
  }
};

/**
 * Get homeworks for a student
 * GET /api/student/:id/homeworks
 * :id is the userId from the users collection
 */
export const getHomeworks = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id;
    console.log("📚 Fetching homeworks for student ID:", id);
    
    // Find the student by userId first, then by _id
    let student = await Student.findOne({ userId: id }).lean();
    
    if (!student && mongoose.Types.ObjectId.isValid(id)) {
      student = await Student.findById(id).lean();
    }
    
    if (!student) {
      return res.status(404).json({
        success: false,
        error: "Student not found"
      });
    }

    // Fetch homeworks for the student's class and subjects
    const homeworks = await Homework.find({ 
      className: student.className 
    })
      .populate('teacherId', 'fullName email subject')
      .lean()
      .sort({ dueDate: 1 });


    res.status(200).json({
      success: true,
      data: {
        studentId: student._id,
        studentName: student.name,
        className: student.className,
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
      message: "Homeworks retrieved successfully"
    });
  } catch (error) {
    console.error("❌ Error fetching homeworks:", error);
    next(error);
  }
};
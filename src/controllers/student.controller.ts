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
    const userId = req.params.id;
    console.log("👤 Fetching profile for userId:", userId);

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID format"
      });
    }

    // Find student by userId and populate user data
    const student = await Student.findOne({ userId: userId }).select('-password').populate('userId');
    
    if (!student) {
      console.log("❌ Student not found for userId:", userId);
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }

    // Get user data (if populated)
    const user: any = student.userId || await User.findById(userId);

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
      userId: userId,
      name: student.name || user?.name || 'N/A',
      class: student.gradeLevel || 'N/A',
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
    const userId = req.params.id;
    console.log("📊 Fetching dashboard data for userId:", userId);

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID format"
      });
    }

    // Find student by userId
    const student = await Student.findOne({ userId: userId }).select('-password');
    if (!student) {
      console.log("❌ Student not found for userId:", userId);
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }

    const studentId = student._id;
    console.log(`✅ Found student with ID: ${studentId} for userId: ${userId}`);

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
        userId: userId,
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
    const userId = req.params.id;
    console.log("📅 Fetching schedule for userId:", userId);

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID format"
      });
    }

    // Find student by userId
    const student = await Student.findOne({ userId: userId });
    if (!student) {
      console.log("❌ Student not found for userId:", userId);
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }

    const studentId = student._id;
    const scheduleItems = await ClassSchedule.find({ studentId: studentId }).sort({ startTime: 1 });

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
          status: item.status
        });
      }
    });

    console.log(`✅ Found ${scheduleItems.length} schedule items for student ${studentId}`);

    res.status(200).json({
      success: true,
      data: {
        userId: userId,
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
    const userId = req.params.id;
    console.log("📊 Fetching grades for userId:", userId);

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID format"
      });
    }

    // Find student by userId
    const student = await Student.findOne({ userId: userId });
    if (!student) {
      console.log("❌ Student not found for userId:", userId);
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }

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
        userId: userId,
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
    const userId = req.params.id;
    console.log("📝 Fetching homework for userId:", userId);

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID format"
      });
    }

    // Find student by userId
    const student = await Student.findOne({ userId: userId });
    if (!student) {
      console.log("❌ Student not found for userId:", userId);
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }

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
        userId: userId,
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
    const userId = req.params.id;
    console.log("📋 Fetching exams and tests for userId:", userId);

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID format"
      });
    }

    // Find student by userId
    const student = await Student.findOne({ userId: userId });
    if (!student) {
      console.log("❌ Student not found for userId:", userId);
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }

    const studentId = student._id;

    // Fetch all exams (final, exam) and tests (test, quiz, midterm)
    const [exams, tests] = await Promise.all([
      Exam.find({ studentId: studentId }).sort({ date: 1 }),
      Test.find({ studentId: studentId }).sort({ date: 1 })
    ]);

    console.log(`✅ Found ${exams.length} exams and ${tests.length} tests for student ${studentId}`);

    res.status(200).json({
      success: true,
      data: {
        userId: userId,
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
 * Get student announcements
 * GET /api/student/:id/announcements
 * :id is the userId from the users collection
 */
export const getAnnouncement = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.params.id;
    console.log("📢 Fetching announcements for userId:", userId);

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID format"
      });
    }

    // Find student by userId (to verify student exists)
    const student = await Student.findOne({ userId: userId });
    if (!student) {
      console.log("❌ Student not found for userId:", userId);
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }

    const studentId = student._id;
    const announcements = await Announcement.find({}).sort({ date: -1 });

    console.log(`✅ Found ${announcements.length} announcements for student ${studentId}`);

    res.status(200).json({
      success: true,
      data: {
        userId: userId,
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
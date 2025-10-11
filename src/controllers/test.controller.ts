import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Student from "../models/Student.model.js";
import ClassSchedule from "../models/ClassSchedule.model.js";
import Grade from "../models/Grade.model.js";
import Homework from "../models/Homework.model.js";
import Exam from "../models/Exam.model.js";
import Announcement from "../models/Announcement.model.js";
import mongoose from "mongoose";

/**
 * Insert demo data into all collections for testing
 */
export const insertDemoData = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log("🚀 Starting demo data insertion...");

    // Generate unique IDs and timestamps
    const timestamp = Date.now();
    const studentId = new mongoose.Types.ObjectId();
    const homeworkId = `HW${timestamp}`;
    const examId = `EX${timestamp}`;
    const announcementId = `ANN${timestamp}`;

    // 1. Insert User (Student)
    const hashedPassword = await bcrypt.hash("demo123", 12);
    const userData = {
      name: `Demo Student ${timestamp}`,
      email: `student${timestamp}@madrassati.com`,
      password: hashedPassword,
      phone: "+966 50 123 4567",
      gender: "male" as const,
      role: "student" as const
    };
    
    const user = await User.create(userData);
    console.log("✅ User inserted:", { id: user._id, name: user.name, email: user.email, role: user.role });

    // 2. Insert Student
    const studentData = {
      _id: studentId,
      userId: user._id,
      name: `Demo Student ${timestamp}`,
      email: `student${timestamp}@madrassati.com`,
      password: hashedPassword,
      gradeLevel: "Grade 10 - Computer Science",
      gpa: 3.8,
      classesToday: 6,
      pendingHomework: 3,
      upcomingExams: 2,
      profilePicture: "https://via.placeholder.com/150",
      phone: "+966 50 123 4567",
      address: "123 King Fahd Road, Riyadh, Saudi Arabia",
      parentName: "Ahmed & Fatima Al-Said",
      parentPhone: "+966 50 987 6543",
      enrollmentDate: new Date("2023-09-01"),
      attendance: 95
    };
    
    const student = await Student.create(studentData);
    console.log("✅ Student inserted:", { id: student._id, name: student.name, gradeLevel: student.gradeLevel });

    // 3. Insert Class Schedule
    const scheduleData = {
      studentId: studentId,
      subject: "Mathematics",
      day: "Monday",
      startTime: "09:00",
      endTime: "10:30",
      room: "Room A-101",
      status: "scheduled"
    };
    
    const schedule = await ClassSchedule.create(scheduleData);
    console.log("✅ Class Schedule inserted:", { 
      id: schedule._id, 
      subject: schedule.subject, 
      day: schedule.day,
      time: `${schedule.startTime}-${schedule.endTime}`
    });

    // 4. Insert Grade
    const gradeData = {
      studentId: studentId,
      subject: "Mathematics",
      finalGrade: 85,
      homework: 90,
      test: 80,
      exam: 85,
      status: "Pass" as const
    };
    
    const grade = await Grade.create(gradeData);
    console.log("✅ Grade inserted:", { 
      id: grade._id, 
      subject: grade.subject, 
      finalGrade: grade.finalGrade,
      status: grade.status
    });

    // 5. Insert Homework
    const startDate = new Date();
    const dueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
    
    const homeworkData = {
      studentId: studentId,
      title: `Algebra Assignment ${timestamp}`,
      subject: "Mathematics",
      status: "active" as const,
      priority: "medium" as const,
      description: "Complete exercises 1-20 from chapter 5",
      startDate: startDate,
      dueDate: dueDate,
      durationDays: 7,
      homeworkId: homeworkId
    };
    
    const homework = await Homework.create(homeworkData);
    console.log("✅ Homework inserted:", { 
      id: homework._id, 
      title: homework.title, 
      subject: homework.subject,
      dueDate: homework.dueDate.toISOString().split('T')[0]
    });

    // 6. Insert Exam
    const examDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000); // 14 days from now
    
    const examData = {
      studentId: studentId,
      title: `Mathematics Midterm ${timestamp}`,
      subject: "Mathematics",
      type: "midterm" as const,
      date: examDate,
      startTime: "10:00",
      endTime: "12:00",
      room: "Room A-101",
      duration: "2 hours",
      examId: examId
    };
    
    const exam = await Exam.create(examData);
    console.log("✅ Exam inserted:", { 
      id: exam._id, 
      title: exam.title, 
      type: exam.type,
      date: exam.date.toISOString().split('T')[0],
      time: `${exam.startTime}-${exam.endTime}`
    });

    // 7. Insert Announcement
    const announcementData = {
      title: `Demo Announcement ${timestamp}`,
      type: "info" as const,
      priority: "medium" as const,
      content: "This is a demo announcement created for testing purposes. It contains important information for students and parents.",
      date: new Date(),
      postedBy: "Admin",
      announcementId: announcementId
    };
    
    const announcement = await Announcement.create(announcementData);
    console.log("✅ Announcement inserted:", { 
      id: announcement._id, 
      title: announcement.title, 
      type: announcement.type,
      priority: announcement.priority
    });

    console.log("🎉 All demo data inserted successfully!");
    console.log(`\n📝 IMPORTANT: Use this userId for frontend testing: ${user._id}`);
    console.log(`   Frontend URL: http://localhost:5174/student/${user._id}/dashboard\n`);

    res.status(201).json({
      success: true,
      message: "Demo data inserted successfully",
      data: {
        user: { 
          id: user._id, 
          userId: user._id,  // Same as id, for clarity
          name: user.name, 
          email: user.email,
          role: user.role 
        },
        student: { 
          id: student._id, 
          studentId: student._id,  // The student document _id
          userId: user._id,  // The user document _id (use this in frontend URLs)
          name: student.name, 
          gradeLevel: student.gradeLevel 
        },
        schedule: { id: schedule._id, subject: schedule.subject, day: schedule.day },
        grade: { id: grade._id, subject: grade.subject, finalGrade: grade.finalGrade },
        homework: { id: homework._id, title: homework.title, dueDate: homework.dueDate },
        exam: { id: exam._id, title: exam.title, date: exam.date },
        announcement: { id: announcement._id, title: announcement.title, type: announcement.type }
      }
    });

  } catch (error: any) {
    console.error("❌ Error inserting demo data:", error);
    next(error);
  }
};

import { Request, Response } from "express";
import Student from "../models/Student.model.js";
import ClassSchedule from "../models/ClassSchedule.model.js";
import Grade from "../models/Grade.model.js";
import Homework from "../models/Homework.model.js";
import Exam from "../models/Exam.model.js";

/**
 * Migrate old data to link to correct student documents
 * GET /api/debug/migrate-wissal
 */
export const migrateWissalData = async (req: Request, res: Response) => {
  try {
    console.log("🔄 Starting migration for Wissal's data...");

    const userId = "68d440c75a3bf315fb0ddc7b"; // Wissal's User ID
    const oldStudentId = "68d440c75a3bf315fb0ddc7b"; // Old Student._id (same as User._id by coincidence)
    
    // Find Wissal's correct Student document
    const student = await Student.findOne({ userId: userId });
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found for userId: " + userId
      });
    }

    const newStudentId = student._id;
    console.log(`✅ Found student: ${student.name}`);
    console.log(`   User ID: ${userId}`);
    console.log(`   Old Student ID: ${oldStudentId}`);
    console.log(`   New Student ID: ${newStudentId}`);

    // Update all related collections
    const updates = {
      schedules: 0,
      grades: 0,
      homework: 0,
      exams: 0
    };

    // Update ClassSchedule
    const scheduleUpdate = await ClassSchedule.updateMany(
      { studentId: oldStudentId },
      { $set: { studentId: newStudentId } }
    );
    updates.schedules = scheduleUpdate.modifiedCount;
    console.log(`✅ Updated ${updates.schedules} schedule records`);

    // Update Grades
    const gradeUpdate = await Grade.updateMany(
      { studentId: oldStudentId },
      { $set: { studentId: newStudentId } }
    );
    updates.grades = gradeUpdate.modifiedCount;
    console.log(`✅ Updated ${updates.grades} grade records`);

    // Update Homework
    const homeworkUpdate = await Homework.updateMany(
      { studentId: oldStudentId },
      { $set: { studentId: newStudentId } }
    );
    updates.homework = homeworkUpdate.modifiedCount;
    console.log(`✅ Updated ${updates.homework} homework records`);

    // Update Exams
    const examUpdate = await Exam.updateMany(
      { studentId: oldStudentId },
      { $set: { studentId: newStudentId } }
    );
    updates.exams = examUpdate.modifiedCount;
    console.log(`✅ Updated ${updates.exams} exam records`);

    console.log("🎉 Migration complete!");

    res.status(200).json({
      success: true,
      message: "Data migration completed successfully",
      data: {
        student: {
          name: student.name,
          userId: userId,
          oldStudentId: oldStudentId,
          newStudentId: newStudentId.toString()
        },
        updates: updates
      }
    });

  } catch (error: any) {
    console.error("❌ Error during migration:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


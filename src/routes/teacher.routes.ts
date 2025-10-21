import express from 'express';
import { verifyToken } from '../middlewares/auth.middleware.js';
import { requireRole, requireTeacherForClass } from '../middlewares/role.middleware.js';
import {
  getProfile,
  getDashboard,
  getSchedule,
  getClasses,
  getGrades,
  getGradesByClass,
  addGrade,
  updateGrade,
  deleteGrade,
  getHomework,
  getHomeworkByClass,
  getHomeworks,
  getHomeworksByClass,
  addHomework,
  updateHomework,
  deleteHomework,
  getExams,
  addAnnouncement,
  getAnnouncement,
  getMessages,
  getMessagesByToken,
  getAttendance,
  getAttendanceByClass,
  toggleAttendance,
  getStudents,
  getStudentsByClass,
  addStudent,
  updateStudent,
  deleteStudent
} from '../controllers/teacher.controller.js';

const router = express.Router();

// All teacher routes require authentication and teacher role
// NOTE: Authentication temporarily disabled for testing
// TODO: Re-enable verifyToken and requireRole('teacher') for production
// router.use(verifyToken);
// router.use(requireRole('teacher'));

// Teacher routes with proper REST structure
router.get('/:teacherId/profile', getProfile);
router.get('/:teacherId/dashboard', getDashboard);
router.get('/:teacherId/schedule', getSchedule);
router.get('/:teacherId/classes', getClasses);
router.get('/:teacherId/grades', getGrades);
router.get('/:teacherId/grades/:className', getGradesByClass);
router.post('/:teacherId/grades', addGrade);
router.put('/:teacherId/grades/:gradeId', updateGrade);
router.delete('/:teacherId/grades/:gradeId', deleteGrade);
router.get('/:teacherId/homework', getHomework);
router.get('/:teacherId/homework/:classId', getHomeworkByClass);
// New homework management routes
router.get('/:teacherId/homeworks', getHomeworks);
router.get('/:teacherId/homeworks/:className', getHomeworksByClass);
router.post('/:teacherId/homeworks', addHomework);
router.put('/:teacherId/homeworks/:homeworkId', updateHomework);
router.delete('/:teacherId/homeworks/:homeworkId', deleteHomework);
router.get('/:teacherId/exams', getExams);

// Exam management routes
router.post('/:teacherId/exam', async (req, res) => {
  try {
    const { teacherId } = req.params;
    const examData = req.body;
    
    console.log('📝 Adding exam for teacher:', teacherId);
    console.log('📋 Exam data:', examData);
    
    // Import Exam model
    const Exam = (await import('../models/Exam.model.js')).default;
    
    // Create new exam
    const newExam = new Exam({
      ...examData,
      teacherId: teacherId,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    const savedExam = await newExam.save();
    
    console.log('✅ Exam created successfully:', savedExam._id);
    
    res.status(201).json({
      success: true,
      message: 'Exam created successfully',
      data: savedExam
    });
  } catch (error) {
    console.error('❌ Error creating exam:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to create exam',
      details: error.message
    });
  }
});

router.put('/:teacherId/exam/:examId', async (req, res) => {
  try {
    const { teacherId, examId } = req.params;
    const updateData = req.body;
    
    console.log('🔄 Updating exam:', examId, 'for teacher:', teacherId);
    console.log('📋 Update data:', updateData);
    
    // Import Exam model
    const Exam = (await import('../models/Exam.model.js')).default;
    
    // Update exam
    updateData.updatedAt = new Date();
    const updatedExam = await Exam.findByIdAndUpdate(
      examId,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!updatedExam) {
      return res.status(404).json({
        success: false,
        error: 'Exam not found'
      });
    }
    
    console.log('✅ Exam updated successfully:', updatedExam._id);
    
    res.status(200).json({
      success: true,
      message: 'Exam updated successfully',
      data: updatedExam
    });
  } catch (error) {
    console.error('❌ Error updating exam:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to update exam',
      details: error.message
    });
  }
});

router.delete('/:teacherId/exam/:examId', async (req, res) => {
  try {
    const { teacherId, examId } = req.params;
    
    console.log('🗑️ Deleting exam:', examId, 'for teacher:', teacherId);
    
    // Import Exam model
    const Exam = (await import('../models/Exam.model.js')).default;
    
    // Delete exam
    const deletedExam = await Exam.findByIdAndDelete(examId);
    
    if (!deletedExam) {
      return res.status(404).json({
        success: false,
        error: 'Exam not found'
      });
    }
    
    console.log('✅ Exam deleted successfully:', examId);
    
    res.status(200).json({
      success: true,
      message: 'Exam deleted successfully',
      data: { examId }
    });
  } catch (error) {
    console.error('❌ Error deleting exam:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to delete exam',
      details: error.message
    });
  }
});

// Test management routes
router.post('/:teacherId/test', async (req, res) => {
  try {
    const { teacherId } = req.params;
    const testData = req.body;
    
    console.log('🧪 Adding test for teacher:', teacherId);
    console.log('📋 Test data:', testData);
    
    // Import Test model
    const Test = (await import('../models/Test.model.js')).default;
    
    // Create new test
    const newTest = new Test({
      ...testData,
      teacherId: teacherId,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    const savedTest = await newTest.save();
    
    console.log('✅ Test created successfully:', savedTest._id);
    
    res.status(201).json({
      success: true,
      message: 'Test created successfully',
      data: savedTest
    });
  } catch (error) {
    console.error('❌ Error creating test:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to create test',
      details: error.message
    });
  }
});

router.put('/:teacherId/test/:testId', async (req, res) => {
  try {
    const { teacherId, testId } = req.params;
    const updateData = req.body;
    
    console.log('🔄 Updating test:', testId, 'for teacher:', teacherId);
    console.log('📋 Update data:', updateData);
    
    // Import Test model
    const Test = (await import('../models/Test.model.js')).default;
    
    // Update test
    updateData.updatedAt = new Date();
    const updatedTest = await Test.findByIdAndUpdate(
      testId,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!updatedTest) {
      return res.status(404).json({
        success: false,
        error: 'Test not found'
      });
    }
    
    console.log('✅ Test updated successfully:', updatedTest._id);
    
    res.status(200).json({
      success: true,
      message: 'Test updated successfully',
      data: updatedTest
    });
  } catch (error) {
    console.error('❌ Error updating test:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to update test',
      details: error.message
    });
  }
});

router.delete('/:teacherId/test/:testId', async (req, res) => {
  try {
    const { teacherId, testId } = req.params;
    
    console.log('🗑️ Deleting test:', testId, 'for teacher:', teacherId);
    
    // Import Test model
    const Test = (await import('../models/Test.model.js')).default;
    
    // Delete test
    const deletedTest = await Test.findByIdAndDelete(testId);
    
    if (!deletedTest) {
      return res.status(404).json({
        success: false,
        error: 'Test not found'
      });
    }
    
    console.log('✅ Test deleted successfully:', testId);
    
    res.status(200).json({
      success: true,
      message: 'Test deleted successfully',
      data: { testId }
    });
  } catch (error) {
    console.error('❌ Error deleting test:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to delete test',
      details: error.message
    });
  }
});

router.get('/:teacherId/announcement', getAnnouncement);
router.post('/:teacherId/announcement', addAnnouncement);
router.get('/:teacherId/messages', getMessages);
router.get('/:teacherId/messages/:tokenUserId', getMessagesByToken);
router.get('/:teacherId/attendance', getAttendance);
router.get('/:teacherId/attendance/:className', getAttendanceByClass);
router.put('/attendance/:studentId', toggleAttendance);

// Student management routes
router.get('/:teacherId/students', getStudents);
router.get('/:teacherId/students/:className', getStudentsByClass);
router.post('/:teacherId/students', addStudent);
router.put('/:teacherId/students/:studentId', updateStudent);
router.delete('/:teacherId/students/:studentId', deleteStudent);

export default router;


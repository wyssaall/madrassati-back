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
  getHomework,
  getHomeworkByClass,
  getExams,
  getAnnouncement,
  getMessages,
  getMessagesByToken,
  getAttendance,
  getAttendanceByClass
} from '../controllers/teacher.controller.js';

const router = express.Router();

// All teacher routes require authentication and teacher role
router.use(verifyToken);
router.use(requireRole('teacher'));

// Teacher routes
router.get('/profile', getProfile);
router.get('/dashboard', getDashboard);
router.get('/schedule', getSchedule);
router.get('/classes', getClasses);
router.get('/grades', getGrades);
router.get('/grades/:classId', getGradesByClass);
router.get('/homework', getHomework);
router.get('/homework/:classId', getHomeworkByClass);
router.get('/exams', getExams);
router.get('/announcement', getAnnouncement);
router.get('/messages', getMessages);
router.get('/messages/:tokenUserId', getMessagesByToken);
router.get('/attendance', getAttendance);
router.get('/attendance/:classId', getAttendanceByClass);

export default router;


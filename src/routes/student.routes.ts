import express from 'express';
import { validateObjectId } from '../middlewares/validate.middleware.js';
import {
  getProfile,
  getDashboard,
  getSchedule,
  getGrades,
  getHomework,
  getHomeworks,
  getExams,
  getTests,
  getAnnouncement
} from '../controllers/student.controller.js';

const router = express.Router();

// Student routes with dynamic ID parameter
// Note: Authentication temporarily disabled for testing
// TODO: Re-enable verifyToken and requireRole('student') for production
router.get('/:id/profile', validateObjectId('id'), getProfile);
router.get('/:id/dashboard', validateObjectId('id'), getDashboard);
router.get('/:id/schedule', validateObjectId('id'), getSchedule);
router.get('/:id/grades', validateObjectId('id'), getGrades);
router.get('/:id/homework', validateObjectId('id'), getHomeworks);
router.get('/:id/exams', validateObjectId('id'), getExams);
router.get('/:id/tests', validateObjectId('id'), getTests);
router.get('/:id/announcements', validateObjectId('id'), getAnnouncement);

export default router;
import express from 'express';
import { verifyToken } from '../middlewares/auth.middleware.js';
import { requireRole } from '../middlewares/role.middleware.js';
import {
  getProfile,
  getDashboard,
  getSchedule,
  getGrades,
  getHomework,
  getExams,
  getAnnouncement
} from '../controllers/parent.controller.js';

const router = express.Router();

// All parent routes require authentication and parent role
router.use(verifyToken);
router.use(requireRole('parent'));

// Parent routes
router.get('/profile', getProfile);
router.get('/dashboard', getDashboard);
router.get('/schedule', getSchedule);
router.get('/grades', getGrades);
router.get('/homework', getHomework);
router.get('/exams', getExams);
router.get('/announcement', getAnnouncement);

export default router;


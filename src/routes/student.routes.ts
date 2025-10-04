import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth';
import { requireRole } from '../middleware/requireRole';
import {
  getStudentProfile,
  getStudentDashboard,
  getStudentSchedule,
  getStudentGrades,
  getStudentHomework,
  getStudentExams,
  getStudentAnnouncements
} from '../controllers/studentController';

const router = Router();

// Toutes les routes nécessitent une authentification et le rôle étudiant
router.use(requireAuth);
router.use(requireRole('student'));

// Routes étudiant
router.get('/profile', getStudentProfile);
router.get('/dashboard', getStudentDashboard);
router.get('/schedule', getStudentSchedule);
router.get('/grades', getStudentGrades);
router.get('/homework', getStudentHomework);
router.get('/exams', getStudentExams);
router.get('/announcement', getStudentAnnouncements);

export default router;

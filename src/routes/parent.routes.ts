import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth';
import { requireRole } from '../middleware/requireRole';
import {
  getParentProfile,
  getParentDashboard,
  getParentSchedule,
  getParentGrades,
  getParentHomework,
  getParentExams,
  getParentAnnouncements
} from '../controllers/parentController';

const router = Router();

// Toutes les routes nécessitent une authentification et le rôle parent
router.use(requireAuth);
router.use(requireRole('parent'));

// Routes parent
router.get('/profile', getParentProfile);
router.get('/dashboard', getParentDashboard);
router.get('/schedule', getParentSchedule);
router.get('/grades', getParentGrades);
router.get('/homework', getParentHomework);
router.get('/exams', getParentExams);
router.get('/announcement', getParentAnnouncements);

export default router;

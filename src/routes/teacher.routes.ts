import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth';
import { requireRole } from '../middleware/requireRole';
import {
  getTeacherProfile,
  getTeacherDashboard,
  getTeacherSchedule,
  getTeacherClasses,
  getTeacherGrades,
  getTeacherGradesByClass,
  createTeacherGrade,
  getTeacherHomework,
  getTeacherHomeworkByClass,
  createTeacherHomework,
  getTeacherExams,
  createTeacherExam,
  getTeacherAnnouncements,
  createTeacherAnnouncement,
  getTeacherMessages,
  createTeacherMessage,
  getTeacherMessageThread,
  getTeacherAttendance,
  createTeacherAttendance,
  getTeacherAttendanceByClass
} from '../controllers/teacherController';

const router = Router();

// Toutes les routes nécessitent une authentification et le rôle enseignant
router.use(requireAuth);
router.use(requireRole('teacher'));

// Routes enseignant
router.get('/profile', getTeacherProfile);
router.get('/dashboard', getTeacherDashboard);
router.get('/schedule', getTeacherSchedule);
router.get('/classes', getTeacherClasses);

// Routes notes
router.get('/grades', getTeacherGrades);
router.get('/grades/:classId', getTeacherGradesByClass);
router.post('/grades', createTeacherGrade);

// Routes devoirs
router.get('/homework', getTeacherHomework);
router.get('/homework/:classId', getTeacherHomeworkByClass);
router.post('/homework', createTeacherHomework);

// Routes examens
router.get('/exams', getTeacherExams);
router.post('/exams', createTeacherExam);

// Routes annonces
router.get('/announcement', getTeacherAnnouncements);
router.post('/announcement', createTeacherAnnouncement);

// Routes messages
router.get('/messages', getTeacherMessages);
router.post('/messages', createTeacherMessage);
router.get('/messages/thread/:threadId', getTeacherMessageThread);

// Routes présence
router.get('/attendance', getTeacherAttendance);
router.post('/attendance', createTeacherAttendance);
router.get('/attendance/:classId', getTeacherAttendanceByClass);

export default router;

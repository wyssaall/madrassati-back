import express from 'express';
import { verifyToken } from '../middlewares/auth.middleware.js';
import { requireRole } from '../middlewares/role.middleware.js';
import {
  getChildren,
  getParentProfile,
  getChildSchedule,
  getChildGrades,
  getChildHomework,
  getChildExams,
  getChildTests,
  getChildAnnouncements,
  getChildAttendance,
  getMessages
} from '../controllers/parent.controller.js';

const router = express.Router();

// All parent routes require authentication and parent role
// TODO: Re-enable authentication for production
// router.use(verifyToken);
// router.use(requireRole('parent'));

// Parent routes with proper REST structure
router.get('/:parentId', getChildren);
router.get('/:parentId/profile', getParentProfile);
router.get('/:parentId/child/:childId/schedule', getChildSchedule);
router.get('/:parentId/child/:childId/grades', getChildGrades);
router.get('/:parentId/child/:childId/homework', getChildHomework);
router.get('/:parentId/child/:childId/exams', getChildExams);
router.get('/:parentId/child/:childId/tests', getChildTests);
router.get('/:parentId/child/:childId/announcements', getChildAnnouncements);
router.get('/:parentId/child/:childId/attendance', getChildAttendance);
router.get('/:parentId/messages', getMessages);

export default router;


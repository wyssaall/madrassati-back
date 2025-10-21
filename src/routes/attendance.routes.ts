import express from 'express';
import { markAttendance, getStudentsByClass } from '../controllers/attendance.controller.js';

const router = express.Router();

// GET /api/attendance/class/:className
router.get('/class/:className', getStudentsByClass);

// POST /api/attendance/mark
router.post('/mark', markAttendance);

export default router;



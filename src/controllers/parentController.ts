import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/requireAuth';

export const getParentProfile = (req: AuthRequest, res: Response): void => {
  res.json({
    route: '/parent/profile',
    status: 'ok',
    message: 'Parent profile retrieved successfully',
    data: {
      id: req.user?.id,
      email: req.user?.email,
      role: req.user?.role,
      profile: {
        fullName: 'Fatma Ben Ali',
        phoneNumber: '+216 12 345 679',
        children: [
          { id: 'STU001', name: 'Ahmed Ben Ali', grade: '3ème année', class: '3A' },
          { id: 'STU002', name: 'Amina Ben Ali', grade: '1ère année', class: '1B' }
        ]
      }
    }
  });
};

export const getParentDashboard = (req: AuthRequest, res: Response): void => {
  res.json({
    route: '/parent/dashboard',
    status: 'ok',
    message: 'Parent dashboard data retrieved successfully',
    data: {
      children: [
        {
          id: 'STU001',
          name: 'Ahmed Ben Ali',
          recentGrades: [
            { subject: 'Mathématiques', grade: 18, maxGrade: 20, date: '2024-01-10' },
            { subject: 'Français', grade: 16, maxGrade: 20, date: '2024-01-08' }
          ],
          attendance: { present: 18, absent: 2, late: 1 },
          upcomingExams: [
            { subject: 'Mathématiques', date: '2024-01-15' },
            { subject: 'Sciences', date: '2024-01-18' }
          ]
        }
      ]
    }
  });
};

export const getParentSchedule = (req: AuthRequest, res: Response): void => {
  res.json({
    route: '/parent/schedule',
    status: 'ok',
    message: 'Parent schedule retrieved successfully',
    data: {
      children: [
        {
          id: 'STU001',
          name: 'Ahmed Ben Ali',
          schedule: [
            { day: 'Lundi', subject: 'Mathématiques', time: '08:00-09:00', teacher: 'M. Dupont' },
            { day: 'Lundi', subject: 'Français', time: '09:00-10:00', teacher: 'Mme Martin' }
          ]
        }
      ]
    }
  });
};

export const getParentGrades = (req: AuthRequest, res: Response): void => {
  res.json({
    route: '/parent/grades',
    status: 'ok',
    message: 'Parent grades retrieved successfully',
    data: {
      children: [
        {
          id: 'STU001',
          name: 'Ahmed Ben Ali',
          grades: [
            { subject: 'Mathématiques', average: 17.5, grades: [18, 17, 16, 19] },
            { subject: 'Français', average: 15.2, grades: [16, 14, 15, 16] }
          ]
        }
      ]
    }
  });
};

export const getParentHomework = (req: AuthRequest, res: Response): void => {
  res.json({
    route: '/parent/homework',
    status: 'ok',
    message: 'Parent homework retrieved successfully',
    data: {
      children: [
        {
          id: 'STU001',
          name: 'Ahmed Ben Ali',
          homework: [
            { 
              subject: 'Mathématiques', 
              title: 'Exercices de géométrie', 
              dueDate: '2024-01-20',
              status: 'pending'
            }
          ]
        }
      ]
    }
  });
};

export const getParentExams = (req: AuthRequest, res: Response): void => {
  res.json({
    route: '/parent/exams',
    status: 'ok',
    message: 'Parent exams retrieved successfully',
    data: {
      children: [
        {
          id: 'STU001',
          name: 'Ahmed Ben Ali',
          exams: [
            { 
              subject: 'Mathématiques', 
              title: 'Contrôle de géométrie', 
              date: '2024-01-15',
              time: '09:00'
            }
          ]
        }
      ]
    }
  });
};

export const getParentAnnouncements = (req: AuthRequest, res: Response): void => {
  res.json({
    route: '/parent/announcement',
    status: 'ok',
    message: 'Parent announcements retrieved successfully',
    data: {
      announcements: [
        { 
          id: 1, 
          title: 'Réunion parents-professeurs', 
          content: 'La réunion parents-professeurs aura lieu le 25 janvier à 18h',
          date: '2024-01-12',
          priority: 'high'
        }
      ]
    }
  });
};

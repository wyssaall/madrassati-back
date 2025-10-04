import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/requireAuth';

export const getStudentProfile = (req: AuthRequest, res: Response): void => {
  res.json({
    route: '/student/profile',
    status: 'ok',
    message: 'Student profile retrieved successfully',
    data: {
      id: req.user?.id,
      email: req.user?.email,
      role: req.user?.role,
      profile: {
        fullName: 'Ahmed Ben Ali',
        phoneNumber: '+216 12 345 678',
        grade: '3ème année',
        class: '3A',
        studentId: 'STU001'
      }
    }
  });
};

export const getStudentDashboard = (req: AuthRequest, res: Response): void => {
  res.json({
    route: '/student/dashboard',
    status: 'ok',
    message: 'Student dashboard data retrieved successfully',
    data: {
      upcomingExams: [
        { id: 1, subject: 'Mathématiques', date: '2024-01-15', time: '09:00' },
        { id: 2, subject: 'Sciences', date: '2024-01-18', time: '10:30' }
      ],
      recentGrades: [
        { subject: 'Mathématiques', grade: 18, maxGrade: 20, date: '2024-01-10' },
        { subject: 'Français', grade: 16, maxGrade: 20, date: '2024-01-08' }
      ],
      pendingHomework: [
        { id: 1, subject: 'Histoire', title: 'Révolution française', dueDate: '2024-01-20' },
        { id: 2, subject: 'Géographie', title: 'Capitaux européens', dueDate: '2024-01-22' }
      ]
    }
  });
};

export const getStudentSchedule = (req: AuthRequest, res: Response): void => {
  res.json({
    route: '/student/schedule',
    status: 'ok',
    message: 'Student schedule retrieved successfully',
    data: {
      schedule: [
        { day: 'Lundi', subject: 'Mathématiques', time: '08:00-09:00', teacher: 'M. Dupont' },
        { day: 'Lundi', subject: 'Français', time: '09:00-10:00', teacher: 'Mme Martin' },
        { day: 'Lundi', subject: 'Sciences', time: '10:30-11:30', teacher: 'M. Bernard' },
        { day: 'Mardi', subject: 'Histoire', time: '08:00-09:00', teacher: 'Mme Dubois' },
        { day: 'Mardi', subject: 'Géographie', time: '09:00-10:00', teacher: 'M. Leroy' }
      ]
    }
  });
};

export const getStudentGrades = (req: AuthRequest, res: Response): void => {
  res.json({
    route: '/student/grades',
    status: 'ok',
    message: 'Student grades retrieved successfully',
    data: {
      grades: [
        { subject: 'Mathématiques', average: 17.5, grades: [18, 17, 16, 19] },
        { subject: 'Français', average: 15.2, grades: [16, 14, 15, 16] },
        { subject: 'Sciences', average: 18.0, grades: [18, 18, 18, 18] },
        { subject: 'Histoire', average: 16.8, grades: [17, 16, 17, 17] }
      ]
    }
  });
};

export const getStudentHomework = (req: AuthRequest, res: Response): void => {
  res.json({
    route: '/student/homework',
    status: 'ok',
    message: 'Student homework retrieved successfully',
    data: {
      homework: [
        { 
          id: 1, 
          subject: 'Mathématiques', 
          title: 'Exercices de géométrie', 
          dueDate: '2024-01-20',
          status: 'pending',
          description: 'Résoudre les exercices 1 à 10 page 45'
        },
        { 
          id: 2, 
          subject: 'Français', 
          title: 'Rédaction', 
          dueDate: '2024-01-22',
          status: 'completed',
          description: 'Rédiger un texte de 200 mots sur le thème de l\'amitié'
        }
      ]
    }
  });
};

export const getStudentExams = (req: AuthRequest, res: Response): void => {
  res.json({
    route: '/student/exams',
    status: 'ok',
    message: 'Student exams retrieved successfully',
    data: {
      exams: [
        { 
          id: 1, 
          subject: 'Mathématiques', 
          title: 'Contrôle de géométrie', 
          date: '2024-01-15',
          time: '09:00',
          duration: 90,
          location: 'Salle 201'
        },
        { 
          id: 2, 
          subject: 'Sciences', 
          title: 'Examen de physique', 
          date: '2024-01-18',
          time: '10:30',
          duration: 120,
          location: 'Laboratoire A'
        }
      ]
    }
  });
};

export const getStudentAnnouncements = (req: AuthRequest, res: Response): void => {
  res.json({
    route: '/student/announcement',
    status: 'ok',
    message: 'Student announcements retrieved successfully',
    data: {
      announcements: [
        { 
          id: 1, 
          title: 'Réunion parents-professeurs', 
          content: 'La réunion parents-professeurs aura lieu le 25 janvier à 18h',
          date: '2024-01-12',
          priority: 'high'
        },
        { 
          id: 2, 
          title: 'Sortie éducative', 
          content: 'Sortie au musée des sciences prévue le 30 janvier',
          date: '2024-01-10',
          priority: 'medium'
        }
      ]
    }
  });
};

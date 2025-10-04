import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/requireAuth';

export const getTeacherProfile = (req: AuthRequest, res: Response): void => {
  res.json({
    route: '/teacher/profile',
    status: 'ok',
    message: 'Teacher profile retrieved successfully',
    data: {
      id: req.user?.id,
      email: req.user?.email,
      role: req.user?.role,
      profile: {
        fullName: 'M. Jean Dupont',
        phoneNumber: '+216 12 345 680',
        subjects: ['Mathématiques', 'Physique'],
        teacherId: 'TCH001',
        experience: '15 ans'
      }
    }
  });
};

export const getTeacherDashboard = (req: AuthRequest, res: Response): void => {
  res.json({
    route: '/teacher/dashboard',
    status: 'ok',
    message: 'Teacher dashboard data retrieved successfully',
    data: {
      classes: [
        { id: 'CLS001', name: '3ème A', subject: 'Mathématiques', studentsCount: 25 },
        { id: 'CLS002', name: '3ème B', subject: 'Mathématiques', studentsCount: 23 }
      ],
      upcomingExams: [
        { id: 1, class: '3ème A', subject: 'Mathématiques', date: '2024-01-15' },
        { id: 2, class: '3ème B', subject: 'Mathématiques', date: '2024-01-16' }
      ],
      pendingGrading: [
        { id: 1, class: '3ème A', assignment: 'Contrôle de géométrie', studentsCount: 25 },
        { id: 2, class: '3ème B', assignment: 'Exercices d\'algèbre', studentsCount: 23 }
      ]
    }
  });
};

export const getTeacherSchedule = (req: AuthRequest, res: Response): void => {
  res.json({
    route: '/teacher/schedule',
    status: 'ok',
    message: 'Teacher schedule retrieved successfully',
    data: {
      schedule: [
        { day: 'Lundi', class: '3ème A', subject: 'Mathématiques', time: '08:00-09:00', room: 'Salle 201' },
        { day: 'Lundi', class: '3ème B', subject: 'Mathématiques', time: '09:00-10:00', room: 'Salle 202' },
        { day: 'Mardi', class: '3ème A', subject: 'Physique', time: '08:00-09:00', room: 'Laboratoire A' }
      ]
    }
  });
};

export const getTeacherClasses = (req: AuthRequest, res: Response): void => {
  res.json({
    route: '/teacher/classes',
    status: 'ok',
    message: 'Teacher classes retrieved successfully',
    data: {
      classes: [
        { 
          id: 'CLS001', 
          name: '3ème A', 
          subject: 'Mathématiques', 
          studentsCount: 25,
          grade: '3ème année'
        },
        { 
          id: 'CLS002', 
          name: '3ème B', 
          subject: 'Mathématiques', 
          studentsCount: 23,
          grade: '3ème année'
        }
      ]
    }
  });
};

export const getTeacherGrades = (req: AuthRequest, res: Response): void => {
  res.json({
    route: '/teacher/grades',
    status: 'ok',
    message: 'Teacher grades retrieved successfully',
    data: {
      grades: [
        { 
          id: 1, 
          student: 'Ahmed Ben Ali', 
          class: '3ème A', 
          subject: 'Mathématiques', 
          grade: 18, 
          maxGrade: 20,
          date: '2024-01-10'
        }
      ]
    }
  });
};

export const getTeacherGradesByClass = (req: AuthRequest, res: Response): void => {
  const { classId } = req.params;
  res.json({
    route: `/teacher/grades/${classId}`,
    status: 'ok',
    message: `Grades for class ${classId} retrieved successfully`,
    data: {
      classId,
      grades: [
        { student: 'Ahmed Ben Ali', grade: 18, maxGrade: 20, date: '2024-01-10' },
        { student: 'Fatma Ben Ali', grade: 16, maxGrade: 20, date: '2024-01-10' }
      ]
    }
  });
};

export const createTeacherGrade = (req: AuthRequest, res: Response): void => {
  res.json({
    route: '/teacher/grades',
    status: 'ok',
    message: 'Grade created successfully',
    data: {
      grade: {
        id: 1,
        student: req.body.student,
        class: req.body.class,
        subject: req.body.subject,
        grade: req.body.grade,
        maxGrade: req.body.maxGrade,
        date: new Date().toISOString()
      }
    }
  });
};

export const getTeacherHomework = (req: AuthRequest, res: Response): void => {
  res.json({
    route: '/teacher/homework',
    status: 'ok',
    message: 'Teacher homework retrieved successfully',
    data: {
      homework: [
        { 
          id: 1, 
          title: 'Exercices de géométrie', 
          class: '3ème A', 
          dueDate: '2024-01-20',
          studentsCount: 25
        }
      ]
    }
  });
};

export const getTeacherHomeworkByClass = (req: AuthRequest, res: Response): void => {
  const { classId } = req.params;
  res.json({
    route: `/teacher/homework/${classId}`,
    status: 'ok',
    message: `Homework for class ${classId} retrieved successfully`,
    data: {
      classId,
      homework: [
        { 
          id: 1, 
          title: 'Exercices de géométrie', 
          dueDate: '2024-01-20',
          description: 'Résoudre les exercices 1 à 10'
        }
      ]
    }
  });
};

export const createTeacherHomework = (req: AuthRequest, res: Response): void => {
  res.json({
    route: '/teacher/homework',
    status: 'ok',
    message: 'Homework created successfully',
    data: {
      homework: {
        id: 1,
        title: req.body.title,
        class: req.body.class,
        dueDate: req.body.dueDate,
        description: req.body.description
      }
    }
  });
};

export const getTeacherExams = (req: AuthRequest, res: Response): void => {
  res.json({
    route: '/teacher/exams',
    status: 'ok',
    message: 'Teacher exams retrieved successfully',
    data: {
      exams: [
        { 
          id: 1, 
          title: 'Contrôle de géométrie', 
          class: '3ème A', 
          date: '2024-01-15',
          duration: 90
        }
      ]
    }
  });
};

export const createTeacherExam = (req: AuthRequest, res: Response): void => {
  res.json({
    route: '/teacher/exams',
    status: 'ok',
    message: 'Exam created successfully',
    data: {
      exam: {
        id: 1,
        title: req.body.title,
        class: req.body.class,
        date: req.body.date,
        duration: req.body.duration
      }
    }
  });
};

export const getTeacherAnnouncements = (req: AuthRequest, res: Response): void => {
  res.json({
    route: '/teacher/announcement',
    status: 'ok',
    message: 'Teacher announcements retrieved successfully',
    data: {
      announcements: [
        { 
          id: 1, 
          title: 'Réunion parents-professeurs', 
          content: 'La réunion parents-professeurs aura lieu le 25 janvier à 18h',
          date: '2024-01-12'
        }
      ]
    }
  });
};

export const createTeacherAnnouncement = (req: AuthRequest, res: Response): void => {
  res.json({
    route: '/teacher/announcement',
    status: 'ok',
    message: 'Announcement created successfully',
    data: {
      announcement: {
        id: 1,
        title: req.body.title,
        content: req.body.content,
        targetAudience: req.body.targetAudience,
        date: new Date().toISOString()
      }
    }
  });
};

export const getTeacherMessages = (req: AuthRequest, res: Response): void => {
  res.json({
    route: '/teacher/messages',
    status: 'ok',
    message: 'Teacher messages retrieved successfully',
    data: {
      messages: [
        { 
          id: 1, 
          sender: 'Mme Martin', 
          subject: 'Question sur le devoir', 
          date: '2024-01-12',
          isRead: false
        }
      ]
    }
  });
};

export const createTeacherMessage = (req: AuthRequest, res: Response): void => {
  res.json({
    route: '/teacher/messages',
    status: 'ok',
    message: 'Message sent successfully',
    data: {
      message: {
        id: 1,
        recipient: req.body.recipient,
        subject: req.body.subject,
        content: req.body.content,
        date: new Date().toISOString()
      }
    }
  });
};

export const getTeacherMessageThread = (req: AuthRequest, res: Response): void => {
  const { threadId } = req.params;
  res.json({
    route: `/teacher/messages/thread/${threadId}`,
    status: 'ok',
    message: `Message thread ${threadId} retrieved successfully`,
    data: {
      threadId,
      messages: [
        { 
          id: 1, 
          sender: 'Mme Martin', 
          content: 'Question sur le devoir de mathématiques',
          date: '2024-01-12'
        },
        { 
          id: 2, 
          sender: 'M. Dupont', 
          content: 'Je vais vérifier et vous répondre',
          date: '2024-01-12'
        }
      ]
    }
  });
};

export const getTeacherAttendance = (req: AuthRequest, res: Response): void => {
  res.json({
    route: '/teacher/attendance',
    status: 'ok',
    message: 'Teacher attendance retrieved successfully',
    data: {
      attendance: [
        { 
          id: 1, 
          student: 'Ahmed Ben Ali', 
          class: '3ème A', 
          date: '2024-01-12',
          status: 'present'
        }
      ]
    }
  });
};

export const createTeacherAttendance = (req: AuthRequest, res: Response): void => {
  res.json({
    route: '/teacher/attendance',
    status: 'ok',
    message: 'Attendance recorded successfully',
    data: {
      attendance: {
        id: 1,
        student: req.body.student,
        class: req.body.class,
        date: req.body.date,
        status: req.body.status
      }
    }
  });
};

export const getTeacherAttendanceByClass = (req: AuthRequest, res: Response): void => {
  const { classId } = req.params;
  res.json({
    route: `/teacher/attendance/${classId}`,
    status: 'ok',
    message: `Attendance for class ${classId} retrieved successfully`,
    data: {
      classId,
      attendance: [
        { student: 'Ahmed Ben Ali', date: '2024-01-12', status: 'present' },
        { student: 'Fatma Ben Ali', date: '2024-01-12', status: 'absent' }
      ]
    }
  });
};

import { Response, NextFunction } from 'express';
import { AuthRequest } from './requireAuth';

export type UserRole = 'student' | 'parent' | 'teacher' | 'admin';

export const requireRole = (...roles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: {
          message: 'Access denied. User not authenticated.',
        },
      });
      return;
    }

    if (!roles.includes(req.user.role as UserRole)) {
      res.status(403).json({
        success: false,
        error: {
          message: `Access denied. Required roles: ${roles.join(', ')}. Your role: ${req.user.role}`,
        },
      });
      return;
    }

    next();
  };
};

// Middleware spécifiques pour chaque rôle
export const requireStudent = requireRole('student');
export const requireParent = requireRole('parent');
export const requireTeacher = requireRole('teacher');
export const requireAdmin = requireRole('admin');

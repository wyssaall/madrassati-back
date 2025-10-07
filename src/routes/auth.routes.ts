import express from 'express';
import { body } from 'express-validator';
import { login, register } from '../controllers/auth.controller.js';
import { validateEmail, validateRequiredString, handleValidationErrors } from '../middlewares/validate.middleware.js';

const router = express.Router();

/**
 * POST /api/auth/register
 * Register endpoint for new users
 */
router.post('/register', 
  [
    body('name')
      .trim()
      .isLength({ min: 1, max: 255 })
      .withMessage('Name must be between 1 and 255 characters')
      .notEmpty()
      .withMessage('Name is required'),
    body('email')
      .isEmail()
      .withMessage('Invalid email format')
      .normalizeEmail(),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long'),
    body('role')
      .isIn(['student', 'teacher', 'parent'])
      .withMessage('Role must be one of: student, teacher, parent'),
    handleValidationErrors
  ],
  register
);

/**
 * POST /api/auth/login
 * Login endpoint for users
 */
router.post('/login', 
  [
    body('email')
      .isEmail()
      .withMessage('Invalid email format')
      .normalizeEmail(),
    body('password')
      .notEmpty()
      .withMessage('Password is required'),
    handleValidationErrors
  ],
  login
);

export default router;

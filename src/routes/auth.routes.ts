import express from 'express';
import { body } from 'express-validator';
import { login, register, logout } from '../controllers/auth.controller.js';
import { validateEmail, validateRequiredString, handleValidationErrors } from '../middlewares/validate.middleware.js';

const router = express.Router();

/**
 * POST /api/auth/register
 * Register endpoint for new users
 */
router.post('/register', register);

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

/**
 * POST /api/auth/logout
 * Logout endpoint for users
 */
router.post('/logout', logout);

/**
 * POST /api/auth/register-test
 * Test registration endpoint without validation
 */
router.post('/register-test', register);

export default router;

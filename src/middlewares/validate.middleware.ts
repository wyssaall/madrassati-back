import { body, param, validationResult } from 'express-validator';
import mongoose from 'mongoose';

/**
 * Handle validation errors from express-validator
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array()
    });
  }
  
  next();
};

/**
 * Validate ObjectId format for route parameters
 * @param {string} paramName - Name of the parameter to validate
 * @returns {Array} Express-validator middleware array
 */
export const validateObjectId = (paramName) => {
  return [
    param(paramName)
      .custom((value) => {
        if (!mongoose.Types.ObjectId.isValid(value)) {
          throw new Error(`Invalid ${paramName} format`);
        }
        return true;
      }),
    handleValidationErrors
  ];
};

/**
 * Validate email format
 * @param {string} fieldName - Name of the field to validate (default: 'email')
 * @returns {Array} Express-validator middleware array
 */
export const validateEmail = (fieldName = 'email') => {
  return [
    body(fieldName)
      .isEmail()
      .withMessage('Invalid email format')
      .normalizeEmail(),
    handleValidationErrors
  ];
};

/**
 * Validate password strength
 * @param {string} fieldName - Name of the field to validate (default: 'password')
 * @returns {Array} Express-validator middleware array
 */
export const validatePassword = (fieldName = 'password') => {
  return [
    body(fieldName)
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
    handleValidationErrors
  ];
};

/**
 * Validate required string field
 * @param {string} fieldName - Name of the field to validate
 * @param {number} minLength - Minimum length (default: 1)
 * @param {number} maxLength - Maximum length (default: 255)
 * @returns {Array} Express-validator middleware array
 */
export const validateRequiredString = (fieldName, minLength = 1, maxLength = 255) => {
  return [
    body(fieldName)
      .trim()
      .isLength({ min: minLength, max: maxLength })
      .withMessage(`${fieldName} must be between ${minLength} and ${maxLength} characters`)
      .notEmpty()
      .withMessage(`${fieldName} is required`),
    handleValidationErrors
  ];
};

/**
 * Validate optional string field
 * @param {string} fieldName - Name of the field to validate
 * @param {number} maxLength - Maximum length (default: 255)
 * @returns {Array} Express-validator middleware array
 */
export const validateOptionalString = (fieldName, maxLength = 255) => {
  return [
    body(fieldName)
      .optional()
      .trim()
      .isLength({ max: maxLength })
      .withMessage(`${fieldName} must not exceed ${maxLength} characters`),
    handleValidationErrors
  ];
};

/**
 * Validate numeric field
 * @param {string} fieldName - Name of the field to validate
 * @param {number} min - Minimum value (default: 0)
 * @param {number} max - Maximum value (default: 100)
 * @returns {Array} Express-validator middleware array
 */
export const validateNumeric = (fieldName, min = 0, max = 100) => {
  return [
    body(fieldName)
      .isNumeric()
      .withMessage(`${fieldName} must be a number`)
      .isFloat({ min, max })
      .withMessage(`${fieldName} must be between ${min} and ${max}`),
    handleValidationErrors
  ];
};

/**
 * Validate role field
 * @param {string} fieldName - Name of the field to validate (default: 'role')
 * @returns {Array} Express-validator middleware array
 */
export const validateRole = (fieldName = 'role') => {
  return [
    body(fieldName)
      .isIn(['student', 'teacher', 'parent', 'admin'])
      .withMessage(`${fieldName} must be one of: student, teacher, parent, admin`),
    handleValidationErrors
  ];
};


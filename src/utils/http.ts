import { Response } from 'express';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export interface ApiError {
  code: 'VALIDATION_ERROR' | 'UNAUTHORIZED' | 'FORBIDDEN' | 'NOT_FOUND' | 'CONFLICT' | 'SERVER_ERROR';
  message: string;
  details?: any;
}

export const sendSuccess = <T>(res: Response, data: T, statusCode: number = 200): void => {
  const response: ApiResponse<T> = {
    success: true,
    data
  };
  res.status(statusCode).json(response);
};

export const sendError = (res: Response, error: ApiError, statusCode?: number): void => {
  const response: ApiResponse = {
    success: false,
    error
  };
  
  const httpStatus = statusCode || getHttpStatusFromErrorCode(error.code);
  res.status(httpStatus).json(response);
};

const getHttpStatusFromErrorCode = (code: string): number => {
  switch (code) {
    case 'VALIDATION_ERROR':
      return 400;
    case 'UNAUTHORIZED':
      return 401;
    case 'FORBIDDEN':
      return 403;
    case 'NOT_FOUND':
      return 404;
    case 'CONFLICT':
      return 409;
    case 'SERVER_ERROR':
    default:
      return 500;
  }
};

// Helpers pour les erreurs communes
export const createValidationError = (message: string, details?: any): ApiError => ({
  code: 'VALIDATION_ERROR',
  message,
  details
});

export const createUnauthorizedError = (message: string = 'Unauthorized'): ApiError => ({
  code: 'UNAUTHORIZED',
  message
});

export const createForbiddenError = (message: string = 'Forbidden'): ApiError => ({
  code: 'FORBIDDEN',
  message
});

export const createNotFoundError = (message: string = 'Not found'): ApiError => ({
  code: 'NOT_FOUND',
  message
});

export const createConflictError = (message: string = 'Conflict'): ApiError => ({
  code: 'CONFLICT',
  message
});

export const createServerError = (message: string = 'Internal server error'): ApiError => ({
  code: 'SERVER_ERROR',
  message
});

import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, JWTPayload } from '../utils/jwt';
import { sendError, createUnauthorizedError } from '../utils/http';

export interface AuthRequest extends Request {
  user?: JWTPayload;
}

export const requireAuth = (req: AuthRequest, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      sendError(res, createUnauthorizedError('Token d\'accès requis'));
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    if (!token) {
      sendError(res, createUnauthorizedError('Token d\'accès requis'));
      return;
    }

    // Vérifier le token d'accès
    const payload = verifyAccessToken(token);
    req.user = payload;
    
    next();
  } catch (error) {
    sendError(res, createUnauthorizedError('Token d\'accès invalide ou expiré'));
  }
};

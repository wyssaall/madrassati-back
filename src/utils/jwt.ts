import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import { IUser, UserRole } from '../models/User';

export interface JWTPayload {
  id: string;
  email: string;
  role: UserRole;
  linkedId?: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

/**
 * Génère un access token
 * @param user - Utilisateur pour lequel générer le token
 * @returns string - Access token
 */
export const signAccessToken = (user: IUser): string => {
  const payload: JWTPayload = {
    id: (user._id as any).toString(),
    email: user.email,
    role: user.role,
    linkedId: user.linkedId
  };

  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
    algorithm: 'HS256'
  } as jwt.SignOptions);
};

/**
 * Génère un refresh token
 * @param user - Utilisateur pour lequel générer le token
 * @returns string - Refresh token
 */
export const signRefreshToken = (user: IUser): string => {
  const payload: JWTPayload = {
    id: (user._id as any).toString(),
    email: user.email,
    role: user.role,
    linkedId: user.linkedId
  };

  return jwt.sign(payload, config.jwtRefreshSecret, {
    expiresIn: config.jwtRefreshExpiresIn,
    algorithm: 'HS256'
  } as jwt.SignOptions);
};

/**
 * Génère une paire de tokens (access + refresh)
 * @param user - Utilisateur pour lequel générer les tokens
 * @returns TokenPair - Paire de tokens avec durée d'expiration
 */
export const generateTokenPair = (user: IUser): TokenPair => {
  return {
    accessToken: signAccessToken(user),
    refreshToken: signRefreshToken(user),
    expiresIn: config.jwtExpiresIn
  };
};

/**
 * Vérifie un access token
 * @param token - Access token à vérifier
 * @returns JWTPayload - Payload du token
 */
export const verifyAccessToken = (token: string): JWTPayload => {
  try {
    return jwt.verify(token, config.jwtSecret, { algorithms: ['HS256'] }) as JWTPayload;
  } catch (error) {
    throw new Error('Token d\'accès invalide ou expiré');
  }
};

/**
 * Vérifie un refresh token
 * @param token - Refresh token à vérifier
 * @returns JWTPayload - Payload du token
 */
export const verifyRefreshToken = (token: string): JWTPayload => {
  try {
    return jwt.verify(token, config.jwtRefreshSecret, { algorithms: ['HS256'] }) as JWTPayload;
  } catch (error) {
    throw new Error('Refresh token invalide ou expiré');
  }
};

/**
 * Décode un token sans vérification (pour debug)
 * @param token - Token à décoder
 * @returns any - Payload décodé
 */
export const decodeToken = (token: string): any => {
  return jwt.decode(token);
};

import { Request, Response } from 'express';
import { User, IUser } from '../models/User';
import { generateTokenPair, verifyRefreshToken } from '../utils/jwt';
import { hashPassword, comparePassword } from '../utils/passwords';
import { sendSuccess, sendError, createValidationError, createUnauthorizedError, createConflictError, createServerError } from '../utils/http';
import { validateData, formatZodErrors, registerSchema, loginSchema, refreshSchema } from '../utils/validation';
import { AuthRequest } from '../middleware/requireAuth';

/**
 * Inscription d'un nouvel utilisateur
 */
export const registerController = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validation des données d'entrée
    const validation = validateData(registerSchema, req.body);
    if (!validation.success) {
      const errorMessages = formatZodErrors(validation.errors);
      sendError(res, createValidationError('Données d\'inscription invalides', errorMessages));
      return;
    }

    const { email, password, role = 'student', profile } = validation.data;

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      sendError(res, createConflictError('Un utilisateur avec cet email existe déjà'));
      return;
    }

    // Hasher le mot de passe
    const passwordHash = await hashPassword(password);

    // Créer le nouvel utilisateur
    const newUser = new User({
      email,
      passwordHash,
      role,
      profile: profile || {}
    });

    const savedUser = await newUser.save();

    // Générer les tokens
    const tokens = generateTokenPair(savedUser);

    // Retourner la réponse sans le hash du mot de passe
    const userResponse = {
      id: (savedUser._id as any).toString(),
      email: savedUser.email,
      role: savedUser.role,
      profile: savedUser.profile,
      linkedId: savedUser.linkedId,
      createdAt: savedUser.createdAt
    };

    sendSuccess(res, {
      user: userResponse,
      tokens
    }, 201);

  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error);
    sendError(res, createServerError('Erreur lors de l\'inscription'));
  }
};

/**
 * Connexion d'un utilisateur
 */
export const loginController = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validation des données d'entrée
    const validation = validateData(loginSchema, req.body);
    if (!validation.success) {
      const errorMessages = formatZodErrors(validation.errors);
      sendError(res, createValidationError('Données de connexion invalides', errorMessages));
      return;
    }

    const { email, password } = validation.data;

    // Trouver l'utilisateur avec le mot de passe
    const user = await User.findOne({ email }).select('+passwordHash');
    if (!user) {
      sendError(res, createUnauthorizedError('Email ou mot de passe incorrect'));
      return;
    }

    // Vérifier le mot de passe
    const isPasswordValid = await comparePassword(password, user.passwordHash);
    if (!isPasswordValid) {
      sendError(res, createUnauthorizedError('Email ou mot de passe incorrect'));
      return;
    }

    // Mettre à jour la dernière connexion
    user.lastLoginAt = new Date();
    await user.save();

    // Générer les tokens
    const tokens = generateTokenPair(user);

    // Retourner la réponse sans le hash du mot de passe
    const userResponse = {
      id: (user._id as any).toString(),
      email: user.email,
      role: user.role,
      profile: user.profile,
      linkedId: user.linkedId,
      lastLoginAt: user.lastLoginAt
    };

    sendSuccess(res, {
      user: userResponse,
      tokens
    });

  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    sendError(res, createServerError('Erreur lors de la connexion'));
  }
};

/**
 * Rafraîchissement du token d'accès
 */
export const refreshController = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validation des données d'entrée
    const validation = validateData(refreshSchema, req.body);
    if (!validation.success) {
      const errorMessages = formatZodErrors(validation.errors);
      sendError(res, createValidationError('Données de refresh invalides', errorMessages));
      return;
    }

    const { refreshToken } = validation.data;

    // Vérifier le refresh token
    let payload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch (error) {
      sendError(res, createUnauthorizedError('Refresh token invalide ou expiré'));
      return;
    }

    // Trouver l'utilisateur
    const user = await User.findById(payload.id);
    if (!user) {
      sendError(res, createUnauthorizedError('Utilisateur non trouvé'));
      return;
    }

    // Générer de nouveaux tokens (rotation)
    const tokens = generateTokenPair(user);

    sendSuccess(res, {
      tokens
    });

  } catch (error) {
    console.error('Erreur lors du refresh:', error);
    sendError(res, createServerError('Erreur lors du refresh du token'));
  }
};

/**
 * Récupération du profil de l'utilisateur connecté
 */
export const meController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, createUnauthorizedError('Utilisateur non authentifié'));
      return;
    }

    // Récupérer l'utilisateur depuis la base de données
    const user = await User.findById(req.user.id);
    if (!user) {
      sendError(res, createUnauthorizedError('Utilisateur non trouvé'));
      return;
    }

    // Retourner les informations de l'utilisateur
    const userResponse = {
      id: (user._id as any).toString(),
      email: user.email,
      role: user.role,
      profile: user.profile,
      linkedId: user.linkedId,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    sendSuccess(res, {
      user: userResponse
    });

  } catch (error) {
    console.error('Erreur lors de la récupération du profil:', error);
    sendError(res, createServerError('Erreur lors de la récupération du profil'));
  }
};

/**
 * Déconnexion de l'utilisateur
 */
export const logoutController = async (req: Request, res: Response): Promise<void> => {
  try {
    // Pour une déconnexion simple, on retourne juste un succès
    // Dans une implémentation plus avancée, on pourrait :
    // - Ajouter le token à une blacklist
    // - Supprimer le cookie de refresh token
    // - Notifier d'autres services

    sendSuccess(res, {
      ok: true,
      message: 'Déconnexion réussie'
    });

  } catch (error) {
    console.error('Erreur lors de la déconnexion:', error);
    sendError(res, createServerError('Erreur lors de la déconnexion'));
  }
};

import { z } from 'zod';
import { UserRole, Gender } from '../models/User';

// Schéma pour le profil utilisateur
const userProfileSchema = z.object({
  fullName: z.string().min(1, 'Le nom complet est requis').max(100, 'Le nom ne peut pas dépasser 100 caractères').optional(),
  phone: z.string().regex(/^[\+]?[0-9\s\-\(\)]{8,20}$/, 'Format de téléphone invalide').optional(),
  avatarUrl: z.string().url('URL d\'avatar invalide').optional(),
  gender: z.enum(['M', 'F', 'O'], {
    errorMap: () => ({ message: 'Le genre doit être M, F ou O' })
  }).optional(),
});

// Schéma pour l'inscription
export const registerSchema = z.object({
  email: z.string()
    .email('Format d\'email invalide')
    .min(1, 'L\'email est requis')
    .max(255, 'L\'email ne peut pas dépasser 255 caractères')
    .toLowerCase(),
  password: z.string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .max(128, 'Le mot de passe ne peut pas dépasser 128 caractères')
    .regex(/^(?=.*[A-Z])(?=.*[0-9])/, 'Le mot de passe doit contenir au moins une majuscule et un chiffre'),
  role: z.enum(['student', 'parent', 'teacher', 'admin'], {
    errorMap: () => ({ message: 'Le rôle doit être student, parent, teacher ou admin' })
  }).default('student').optional(),
  profile: userProfileSchema.optional(),
});

// Schéma pour la connexion
export const loginSchema = z.object({
  email: z.string()
    .email('Format d\'email invalide')
    .min(1, 'L\'email est requis')
    .toLowerCase(),
  password: z.string()
    .min(1, 'Le mot de passe est requis'),
});

// Schéma pour le refresh token
export const refreshSchema = z.object({
  refreshToken: z.string()
    .min(1, 'Le refresh token est requis'),
});

// Schéma pour la mise à jour du profil
export const updateProfileSchema = z.object({
  profile: userProfileSchema.partial(),
});

// Schéma pour le changement de mot de passe
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Le mot de passe actuel est requis'),
  newPassword: z.string()
    .min(8, 'Le nouveau mot de passe doit contenir au moins 8 caractères')
    .max(128, 'Le nouveau mot de passe ne peut pas dépasser 128 caractères')
    .regex(/^(?=.*[A-Z])(?=.*[0-9])/, 'Le nouveau mot de passe doit contenir au moins une majuscule et un chiffre'),
});

// Types TypeScript dérivés des schémas
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshInput = z.infer<typeof refreshSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

// Fonction utilitaire pour valider les données
export const validateData = <T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; errors: z.ZodError } => {
  try {
    const validatedData = schema.parse(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error };
    }
    throw error;
  }
};

// Fonction pour formater les erreurs Zod
export const formatZodErrors = (errors: z.ZodError): string[] => {
  return errors.errors.map(err => {
    const path = err.path.length > 0 ? `${err.path.join('.')}: ` : '';
    return `${path}${err.message}`;
  });
};

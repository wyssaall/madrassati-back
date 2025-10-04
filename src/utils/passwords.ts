import bcrypt from 'bcryptjs';
import { config } from '../config/env';

/**
 * Hash un mot de passe avec bcrypt
 * @param password - Mot de passe en clair
 * @returns Promise<string> - Hash du mot de passe
 */
export const hashPassword = async (password: string): Promise<string> => {
  try {
    const salt = await bcrypt.genSalt(config.bcryptRounds);
    return await bcrypt.hash(password, salt);
  } catch (error) {
    throw new Error('Erreur lors du hashage du mot de passe');
  }
};

/**
 * Compare un mot de passe avec son hash
 * @param password - Mot de passe en clair
 * @param hashedPassword - Hash du mot de passe
 * @returns Promise<boolean> - True si les mots de passe correspondent
 */
export const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  try {
    return await bcrypt.compare(password, hashedPassword);
  } catch (error) {
    throw new Error('Erreur lors de la comparaison des mots de passe');
  }
};

/**
 * Valide la force d'un mot de passe
 * @param password - Mot de passe à valider
 * @returns Object avec isValid et errors
 */
export const validatePasswordStrength = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Le mot de passe doit contenir au moins 8 caractères');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins une majuscule');
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins un chiffre');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

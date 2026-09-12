import { WaitlistFormData } from '../types';

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export const validateWaitlistForm = (data: WaitlistFormData): ValidationResult => {
  const trimmedName = data.name.trim();
  const trimmedEmail = data.email.trim();

  if (!trimmedName) {
    return { isValid: false, error: 'Please enter your name.' };
  }

  if (!trimmedEmail) {
    return { isValid: false, error: 'Please enter your email address.' };
  }

  // Standard email validation regex
  const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
  if (!emailRegex.test(trimmedEmail)) {
    return { isValid: false, error: 'Please enter a valid email address.' };
  }

  return { isValid: true };
};
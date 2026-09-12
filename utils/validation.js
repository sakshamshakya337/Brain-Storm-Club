/**
 * Centralized Validation Utilities (Backend)
 * These rules enforce strict data integrity across the application.
 */

// Matches exactly 8 digits (standard LPU format)
export const REGISTRATION_NUMBER_REGEX = /^\d{8}$/;

// Matches exactly 10 digits
export const PHONE_REGEX = /^\d{10}$/;

// Standard email validation (HTML5 compatible)
export const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

// Allows letters, spaces, hyphens, and apostrophes. Does not allow digits or symbols.
export const NAME_REGEX = /^[A-Za-z\s\-\']+$/;

// UPI/Transaction ID format (Alphanumeric, max 30)
export const TRANSACTION_ID_REGEX = /^[A-Za-z0-9]{1,30}$/;


export const validateRegistrationNumber = (val) => {
  if (!val) return 'Registration number is required.';
  if (!REGISTRATION_NUMBER_REGEX.test(val.trim())) return 'Registration number must contain exactly 8 digits.';
  return null;
};

export const validatePhone = (val, fieldName = 'Phone number') => {
  if (!val) return `${fieldName} is required.`;
  if (!PHONE_REGEX.test(val.trim())) return `${fieldName} must contain exactly 10 digits.`;
  return null;
};

export const validateEmail = (val) => {
  if (!val) return 'Email is required.';
  if (!EMAIL_REGEX.test(val.trim())) return 'Please enter a valid email address.';
  return null;
};

export const validateName = (val, fieldName = 'Name') => {
  if (!val || !val.trim()) return `${fieldName} is required.`;
  if (!NAME_REGEX.test(val.trim())) return `${fieldName} contains invalid characters.`;
  if (val.trim().length < 2 || val.trim().length > 100) return `${fieldName} must be between 2 and 100 characters.`;
  return null;
};

export const validateRequiredText = (val, fieldName = 'Field', min = 1, max = 500) => {
  const trimmed = val ? val.trim() : '';
  if (!trimmed) return `${fieldName} is required.`;
  if (trimmed.length < min) return `${fieldName} must be at least ${min} characters.`;
  if (trimmed.length > max) return `${fieldName} cannot exceed ${max} characters.`;
  return null;
};

export const validateTransactionId = (val) => {
  if (!val || !val.trim()) return 'Transaction ID is required.';
  if (!TRANSACTION_ID_REGEX.test(val.trim())) return 'Transaction ID must be alphanumeric and up to 30 characters.';
  return null;
};

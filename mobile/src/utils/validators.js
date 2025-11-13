/**
 * Validation Utilities
 * Input validation functions
 */

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password) => {
  // Minimum 8 characters
  return password && password.length >= 8;
};

export const validateMoodScore = (score) => {
  return score >= 1 && score <= 10;
};

export const validatePhone = (phone) => {
  // Basic phone validation (digits, dashes, spaces, parentheses)
  const phoneRegex = /^[\d\s\-\(\)]+$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
};

export const validateSessionType = (type) => {
  const validTypes = ['check-in', 'gentle_deep', 'micro_practice'];
  return validTypes.includes(type);
};


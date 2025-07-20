/**
 * Security utilities for input validation, sanitization, and XSS protection
 */

/**
 * HTML entities for encoding
 */
const HTML_ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
};

/**
 * Escape HTML entities to prevent XSS attacks
 */
export const escapeHtml = (text: string): string => {
  if (typeof text !== 'string') {
    return '';
  }
  return text.replace(/[&<>"'/]/g, (match) => HTML_ENTITIES[match] || match);
};

/**
 * Sanitize user input by removing potentially dangerous characters
 */
export const sanitizeInput = (input: string, options: {
  allowNumbers?: boolean;
  allowSpaces?: boolean;
  allowSpecialChars?: boolean;
  maxLength?: number;
} = {}): string => {
  if (typeof input !== 'string') {
    return '';
  }

  const {
    allowNumbers = true,
    allowSpaces = true,
    allowSpecialChars = false,
    maxLength = 1000,
  } = options;

  let sanitized = input.trim();

  // Limit length
  if (maxLength > 0) {
    sanitized = sanitized.substring(0, maxLength);
  }

  // Remove null bytes and control characters
  // eslint-disable-next-line no-control-regex
  sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

  // Build allowed character pattern
  let pattern = 'a-zA-Z';
  if (allowNumbers) pattern += '0-9';
  if (allowSpaces) pattern += ' ';
  if (allowSpecialChars) pattern += '._\\-@'; // Escape the dash

  // Remove characters not in the allowed set
  const regex = new RegExp(`[^${pattern}]`, 'g');
  sanitized = sanitized.replace(regex, '');

  return sanitized;
};

/**
 * Validate and sanitize username input
 */
export const validateUsername = (username: string): { isValid: boolean; sanitized: string; error?: string } => {
  if (!username || typeof username !== 'string') {
    return { isValid: false, sanitized: '', error: 'Username is required' };
  }

  // Check length before sanitization
  if (username.length < 3) {
    return { isValid: false, sanitized: username, error: 'Username must be at least 3 characters' };
  }

  if (username.length > 60) {
    return { isValid: false, sanitized: username, error: 'Username must be less than 60 characters' };
  }

  const sanitized = sanitizeInput(username, {
    allowNumbers: true,
    allowSpaces: false,
    allowSpecialChars: true,
    maxLength: 60,
  });

  if (!sanitized) {
    return { isValid: false, sanitized, error: 'Username is required' };
  }

  // Check for valid username pattern (alphanumeric, dots, dashes, underscores, @)
  if (!/^[a-zA-Z0-9._@\\-]+$/.test(sanitized)) {
    return { isValid: false, sanitized, error: 'Username contains invalid characters' };
  }

  return { isValid: true, sanitized };
};

/**
 * Validate email address
 */
export const validateEmail = (email: string): { isValid: boolean; sanitized: string; error?: string } => {
  if (!email || typeof email !== 'string') {
    return { isValid: false, sanitized: '', error: 'Email is required' };
  }

  // Check length before sanitization
  if (email.length > 254) {
    return { isValid: false, sanitized: email, error: 'Email address too long' };
  }

  const sanitized = sanitizeInput(email, {
    allowNumbers: true,
    allowSpaces: false,
    allowSpecialChars: true,
    maxLength: 254,
  });

  if (!sanitized) {
    return { isValid: false, sanitized, error: 'Email is required' };
  }

  // Basic email regex (not perfect but sufficient for basic validation)
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(sanitized)) {
    return { isValid: false, sanitized, error: 'Invalid email format' };
  }

  return { isValid: true, sanitized };
};

/**
 * Validate password strength
 */
export const validatePassword = (password: string): { isValid: boolean; error?: string; strength: 'weak' | 'medium' | 'strong' } => {
  if (!password) {
    return { isValid: false, error: 'Password is required', strength: 'weak' };
  }

  if (password.length < 8) {
    return { isValid: false, error: 'Password must be at least 8 characters', strength: 'weak' };
  }

  if (password.length > 128) {
    return { isValid: false, error: 'Password must be less than 128 characters', strength: 'weak' };
  }

  // Check for common weak patterns
  const commonPasswords = ['password', '123456', 'qwerty', 'admin', 'login'];
  if (commonPasswords.some(common => password.toLowerCase().includes(common))) {
    return { isValid: false, error: 'Password contains common patterns', strength: 'weak' };
  }

  // Strength calculation
  let strength: 'weak' | 'medium' | 'strong' = 'weak';
  let score = 0;

  // Length bonus
  if (password.length >= 12) score += 2;
  else if (password.length >= 8) score += 1;

  // Character diversity
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^a-zA-Z0-9]/.test(password)) score += 1;

  if (score >= 5) strength = 'strong';
  else if (score >= 3) strength = 'medium';

  return { isValid: true, strength };
};

/**
 * Sanitize search query input
 */
export const sanitizeSearchQuery = (query: string): string => {
  return sanitizeInput(query, {
    allowNumbers: true,
    allowSpaces: true,
    allowSpecialChars: true,
    maxLength: 255,
  });
};

/**
 * Generate a random nonce for CSRF protection
 */
export const generateNonce = (): string => {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

/**
 * Simple rate limiter for authentication attempts
 */
class RateLimiter {
  private attempts: Map<string, { count: number; resetTime: number }> = new Map();
  private maxAttempts: number;
  private windowMs: number;

  constructor(maxAttempts = 5, windowMs = 15 * 60 * 1000) {
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
  }

  isAllowed(key: string): boolean {
    const now = Date.now();
    const record = this.attempts.get(key);

    if (!record || now > record.resetTime) {
      this.attempts.set(key, { count: 1, resetTime: now + this.windowMs });
      return true;
    }

    if (record.count >= this.maxAttempts) {
      return false;
    }

    record.count++;
    return true;
  }

  getRemainingTime(key: string): number {
    const record = this.attempts.get(key);
    if (!record) return 0;
    
    const now = Date.now();
    return Math.max(0, record.resetTime - now);
  }

  reset(key: string): void {
    this.attempts.delete(key);
  }
}

export const authRateLimiter = new RateLimiter(5, 15 * 60 * 1000); // 5 attempts per 15 minutes
/**
 * CSRF (Cross-Site Request Forgery) protection utilities
 */

const CSRF_TOKEN_KEY = 'tmd_csrf_token';
const CSRF_TOKEN_HEADER = 'X-CSRF-Token';

/**
 * Generate a cryptographically secure CSRF token
 */
export const generateCSRFToken = (): string => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

/**
 * Store CSRF token in session storage
 */
export const setCSRFToken = (token: string): void => {
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.setItem(CSRF_TOKEN_KEY, token);
  }
};

/**
 * Get CSRF token from session storage
 */
export const getCSRFToken = (): string | null => {
  if (typeof sessionStorage !== 'undefined') {
    return sessionStorage.getItem(CSRF_TOKEN_KEY);
  }
  return null;
};

/**
 * Initialize CSRF protection by generating and storing a token
 */
export const initCSRFProtection = (): string => {
  let token = getCSRFToken();
  
  if (!token) {
    token = generateCSRFToken();
    setCSRFToken(token);
  }
  
  return token;
};

/**
 * Get CSRF headers for API requests
 */
export const getCSRFHeaders = (): Record<string, string> => {
  const token = getCSRFToken();
  
  if (token) {
    return {
      [CSRF_TOKEN_HEADER]: token,
    };
  }
  
  return {};
};

/**
 * Clear CSRF token (useful for logout)
 */
export const clearCSRFToken = (): void => {
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.removeItem(CSRF_TOKEN_KEY);
  }
};

/**
 * Validate origin for CSRF protection
 */
export const isValidOrigin = (origin: string, allowedOrigins: string[]): boolean => {
  if (!origin) return false;
  
  return allowedOrigins.some(allowed => {
    if (allowed === '*') return true;
    if (allowed === origin) return true;
    
    // Support wildcard subdomains (e.g., *.tangomarathons.com)
    if (allowed.startsWith('*.')) {
      const domain = allowed.substring(2);
      return origin.endsWith(domain);
    }
    
    return false;
  });
};

/**
 * CSRF protection middleware for form submissions
 */
export const validateCSRFForForm = (): boolean => {
  const token = getCSRFToken();
  
  if (!token) {
    console.warn('CSRF token not found - form submission blocked');
    return false;
  }
  
  // In a real implementation, this would validate against the server
  // For now, we just ensure a token exists
  return true;
};
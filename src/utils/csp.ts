/**
 * Content Security Policy (CSP) utilities and configuration
 * Helps prevent XSS, code injection, and other security vulnerabilities
 */

/**
 * Generate a nonce for inline scripts and styles
 */
export const generateCSPNonce = (): string => {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array));
};

/**
 * CSP directive configuration
 */
export const CSP_DIRECTIVES = {
  // Allow scripts only from same origin and specific CDNs
  'script-src': [
    "'self'",
    "'unsafe-eval'", // Required for Vue development
    "https://cdn.quasar.dev",
    "https://fonts.googleapis.com",
  ].join(' '),

  // Allow styles from same origin and inline styles with nonce
  'style-src': [
    "'self'",
    "'unsafe-inline'", // Required for Quasar components
    "https://fonts.googleapis.com",
    "https://cdn.quasar.dev",
  ].join(' '),

  // Allow images from same origin, data URLs, and specific domains
  'img-src': [
    "'self'",
    "data:",
    "https:",
    "*.tangomarathons.com",
  ].join(' '),

  // Allow fonts from same origin and Google Fonts
  'font-src': [
    "'self'",
    "data:",
    "https://fonts.gstatic.com",
    "https://cdn.quasar.dev",
  ].join(' '),

  // Restrict connection sources
  'connect-src': [
    "'self'",
    "https://www.tangomarathons.com",
    "http://localhost:*", // For development
    "ws://localhost:*", // For HMR in development
    "wss://localhost:*",
  ].join(' '),

  // No plugins allowed
  'object-src': "'none'",

  // Base URI restricted to same origin
  'base-uri': "'self'",

  // Form actions restricted to same origin
  'form-action': [
    "'self'",
    "https://www.tangomarathons.com",
  ].join(' '),

  // Frame ancestors (for embedding)
  'frame-ancestors': "'none'",

  // Upgrade insecure requests in production
  'upgrade-insecure-requests': '',

  // Block mixed content
  'block-all-mixed-content': '',
};

/**
 * Generate CSP header value
 */
export const generateCSPHeader = (isDevelopment = false): string => {
  const directives = { ...CSP_DIRECTIVES };

  if (isDevelopment) {
    // Relax some restrictions for development
    directives['script-src'] += " 'unsafe-eval'";
    directives['connect-src'] += " ws: wss:";
    
    // Remove upgrade insecure requests for development
    delete directives['upgrade-insecure-requests'];
    delete directives['block-all-mixed-content'];
  }

  return Object.entries(directives)
    .map(([directive, value]) => `${directive}${value ? ' ' + value : ''}`)
    .join('; ');
};

/**
 * Apply CSP via meta tag (fallback if server headers not available)
 */
export const applyCSPMetaTag = (isDevelopment = false): void => {
  if (typeof document === 'undefined') return;

  // Check if CSP meta tag already exists
  let metaTag = document.querySelector('meta[http-equiv="Content-Security-Policy"]') as HTMLMetaElement;
  
  if (!metaTag) {
    metaTag = document.createElement('meta');
    metaTag.httpEquiv = 'Content-Security-Policy';
    document.head.appendChild(metaTag);
  }

  metaTag.content = generateCSPHeader(isDevelopment);
};

/**
 * Security headers configuration for development server
 */
export const SECURITY_HEADERS = {
  // Prevent clickjacking
  'X-Frame-Options': 'DENY',
  
  // Enable XSS filtering
  'X-XSS-Protection': '1; mode=block',
  
  // Prevent MIME type sniffing
  'X-Content-Type-Options': 'nosniff',
  
  // Referrer policy
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  
  // Feature policy
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
  
  // HSTS (for HTTPS)
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
};
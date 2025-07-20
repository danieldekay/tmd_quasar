import { boot } from 'quasar/wrappers';
import { applyCSPMetaTag } from '../utils/csp';
import { initCSRFProtection } from '../utils/csrf';

/**
 * Security initialization boot file
 * Applies security measures that need to be set up early in the application lifecycle
 */
export default boot(({ app }) => {
  const isDevelopment = process.env.NODE_ENV === 'development';

  try {
    // Initialize Content Security Policy
    applyCSPMetaTag(isDevelopment);

    // Initialize CSRF protection
    initCSRFProtection();

    // Add global error handler for security-related errors
    app.config.errorHandler = (error, instance, info) => {
      // Log security-related errors (but don't expose sensitive info)
      if (error.name === 'SecurityError' || error.message?.includes('CSP')) {
        console.warn('Security policy violation detected:', {
          type: error.name,
          info: info,
          // Don't log the full error message to prevent information disclosure
        });
      } else {
        // Log other errors normally in development
        if (isDevelopment) {
          console.error('Vue error:', error, info);
        } else {
          // In production, log minimal information
          console.error('Application error occurred');
        }
      }
    };

    // Add security headers via meta tags (fallback for when server headers aren't available)
    if (typeof document !== 'undefined') {
      const securityMeta = [
        { name: 'X-Content-Type-Options', content: 'nosniff' },
        { name: 'X-Frame-Options', content: 'DENY' },
        { name: 'X-XSS-Protection', content: '1; mode=block' },
        { name: 'Referrer-Policy', content: 'strict-origin-when-cross-origin' },
      ];

      securityMeta.forEach(({ name, content }) => {
        const existingMeta = document.querySelector(`meta[name="${name}"]`);
        if (!existingMeta) {
          const meta = document.createElement('meta');
          meta.name = name;
          meta.content = content;
          document.head.appendChild(meta);
        }
      });
    }

    console.log('Security measures initialized successfully');
  } catch (error) {
    console.error('Failed to initialize security measures:', error);
  }
});
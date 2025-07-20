import { describe, it, expect, beforeEach } from 'vitest';
import {
  escapeHtml,
  sanitizeInput,
  validateUsername,
  validateEmail,
  validatePassword,
  sanitizeSearchQuery,
  generateNonce,
  authRateLimiter,
} from '../security';

describe('Security Utils', () => {
  describe('escapeHtml', () => {
    it('should escape HTML entities', () => {
      expect(escapeHtml('<script>alert("xss")</script>')).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;');
      expect(escapeHtml('Hello & "World"')).toBe('Hello &amp; &quot;World&quot;');
      expect(escapeHtml("It's a 'test'")).toBe('It&#x27;s a &#x27;test&#x27;');
    });

    it('should handle non-string input', () => {
      expect(escapeHtml(null as unknown as string)).toBe('');
      expect(escapeHtml(undefined as unknown as string)).toBe('');
      expect(escapeHtml(123 as unknown as string)).toBe('');
    });
  });

  describe('sanitizeInput', () => {
    it('should remove control characters and limit length', () => {
      const input = 'Test\x00\x08\x1F input';
      expect(sanitizeInput(input)).toBe('Test input');
    });

    it('should respect length limits', () => {
      const longInput = 'a'.repeat(2000);
      expect(sanitizeInput(longInput, { maxLength: 50 }).length).toBe(50);
    });

    it('should handle character filtering options', () => {
      expect(sanitizeInput('Test123', { allowNumbers: false })).toBe('Test');
      expect(sanitizeInput('Test 123', { allowSpaces: false })).toBe('Test123');
      expect(sanitizeInput('Test@123', { allowSpecialChars: false })).toBe('Test123');
    });

    it('should handle non-string input', () => {
      expect(sanitizeInput(null as unknown as string)).toBe('');
      expect(sanitizeInput(undefined as unknown as string)).toBe('');
    });
  });

  describe('validateUsername', () => {
    it('should validate correct usernames', () => {
      const result = validateUsername('testuser123');
      expect(result.isValid).toBe(true);
      expect(result.sanitized).toBe('testuser123');
    });

    it('should reject empty usernames', () => {
      const result = validateUsername('');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Username is required');
    });

    it('should reject short usernames', () => {
      const result = validateUsername('ab');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Username must be at least 3 characters');
    });

    it('should reject long usernames', () => {
      const result = validateUsername('a'.repeat(70));
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Username must be less than 60 characters');
    });

    it('should sanitize and validate usernames with special chars', () => {
      const result = validateUsername('test.user@example_123-');
      expect(result.isValid).toBe(true);
      expect(result.sanitized).toBe('test.user@example_123-');
    });
  });

  describe('validateEmail', () => {
    it('should validate correct emails', () => {
      const result = validateEmail('test@example.com');
      expect(result.isValid).toBe(true);
      expect(result.sanitized).toBe('test@example.com');
    });

    it('should reject invalid email formats', () => {
      const result = validateEmail('invalid-email');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Invalid email format');
    });

    it('should reject empty emails', () => {
      const result = validateEmail('');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Email is required');
    });
  });

  describe('validatePassword', () => {
    it('should validate strong passwords', () => {
      const result = validatePassword('StrongPass123!');
      expect(result.isValid).toBe(true);
      expect(result.strength).toBe('strong');
    });

    it('should reject short passwords', () => {
      const result = validatePassword('weak');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Password must be at least 8 characters');
    });

    it('should reject common passwords', () => {
      const result = validatePassword('password123');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Password contains common patterns');
    });

    it('should assess password strength correctly', () => {
      expect(validatePassword('simplepass').strength).toBe('weak');
      expect(validatePassword('SimplePass1').strength).toBe('medium');
      expect(validatePassword('ComplexPass123!@#').strength).toBe('strong');
    });
  });

  describe('sanitizeSearchQuery', () => {
    it('should sanitize search queries', () => {
      const malicious = '<script>alert("xss")</script>tango';
      const sanitized = sanitizeSearchQuery(malicious);
      expect(sanitized).not.toContain('<script>');
      expect(sanitized).toContain('tango');
    });

    it('should preserve valid search characters', () => {
      const query = 'tango marathon 2024 @location';
      const sanitized = sanitizeSearchQuery(query);
      expect(sanitized).toBe(query);
    });
  });

  describe('generateNonce', () => {
    it('should generate random nonces', () => {
      const nonce1 = generateNonce();
      const nonce2 = generateNonce();
      
      expect(nonce1).toHaveLength(32);
      expect(nonce2).toHaveLength(32);
      expect(nonce1).not.toBe(nonce2);
    });
  });

  describe('authRateLimiter', () => {
    beforeEach(() => {
      authRateLimiter.reset('test-key');
    });

    it('should allow requests within limit', () => {
      for (let i = 0; i < 5; i++) {
        expect(authRateLimiter.isAllowed('test-key')).toBe(true);
      }
    });

    it('should block requests after limit exceeded', () => {
      // Exhaust the limit
      for (let i = 0; i < 5; i++) {
        authRateLimiter.isAllowed('test-key');
      }
      
      // Next request should be blocked
      expect(authRateLimiter.isAllowed('test-key')).toBe(false);
    });

    it('should return remaining time when blocked', () => {
      // Exhaust the limit
      for (let i = 0; i < 5; i++) {
        authRateLimiter.isAllowed('test-key');
      }
      
      const remainingTime = authRateLimiter.getRemainingTime('test-key');
      expect(remainingTime).toBeGreaterThan(0);
    });

    it('should reset limits', () => {
      // Exhaust the limit
      for (let i = 0; i < 5; i++) {
        authRateLimiter.isAllowed('test-key');
      }
      
      // Reset and try again
      authRateLimiter.reset('test-key');
      expect(authRateLimiter.isAllowed('test-key')).toBe(true);
    });
  });
});
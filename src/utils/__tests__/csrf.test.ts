import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  generateCSRFToken,
  setCSRFToken,
  getCSRFToken,
  initCSRFProtection,
  getCSRFHeaders,
  clearCSRFToken,
  isValidOrigin,
  validateCSRFForForm,
} from '../csrf';

// Mock sessionStorage
const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock,
});

describe('CSRF Protection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('generateCSRFToken', () => {
    it('should generate random tokens', () => {
      const token1 = generateCSRFToken();
      const token2 = generateCSRFToken();
      
      expect(token1).toHaveLength(64); // 32 bytes * 2 hex chars
      expect(token2).toHaveLength(64);
      expect(token1).not.toBe(token2);
      expect(token1).toMatch(/^[a-f0-9]{64}$/);
    });
  });

  describe('setCSRFToken and getCSRFToken', () => {
    it('should store and retrieve CSRF tokens', () => {
      const token = 'test-csrf-token';
      sessionStorageMock.getItem.mockReturnValue(token);
      
      setCSRFToken(token);
      
      expect(sessionStorageMock.setItem).toHaveBeenCalledWith('tmd_csrf_token', token);
      expect(getCSRFToken()).toBe(token);
    });

    it('should return null when no token exists', () => {
      sessionStorageMock.getItem.mockReturnValue(null);
      expect(getCSRFToken()).toBe(null);
    });
  });

  describe('initCSRFProtection', () => {
    it('should return existing token if available', () => {
      const existingToken = 'existing-token';
      sessionStorageMock.getItem.mockReturnValue(existingToken);
      
      const token = initCSRFProtection();
      expect(token).toBe(existingToken);
    });

    it('should generate new token if none exists', () => {
      sessionStorageMock.getItem.mockReturnValue(null);
      
      const token = initCSRFProtection();
      expect(token).toHaveLength(64);
      expect(sessionStorageMock.setItem).toHaveBeenCalledWith('tmd_csrf_token', token);
    });
  });

  describe('getCSRFHeaders', () => {
    it('should return headers with CSRF token', () => {
      const token = 'test-token';
      sessionStorageMock.getItem.mockReturnValue(token);
      
      const headers = getCSRFHeaders();
      expect(headers).toEqual({
        'X-CSRF-Token': token,
      });
    });

    it('should return empty headers when no token', () => {
      sessionStorageMock.getItem.mockReturnValue(null);
      
      const headers = getCSRFHeaders();
      expect(headers).toEqual({});
    });
  });

  describe('clearCSRFToken', () => {
    it('should remove CSRF token from storage', () => {
      clearCSRFToken();
      expect(sessionStorageMock.removeItem).toHaveBeenCalledWith('tmd_csrf_token');
    });
  });

  describe('isValidOrigin', () => {
    it('should validate exact origin matches', () => {
      const allowedOrigins = ['https://example.com'];
      expect(isValidOrigin('https://example.com', allowedOrigins)).toBe(true);
      expect(isValidOrigin('https://evil.com', allowedOrigins)).toBe(false);
    });

    it('should handle wildcard origins', () => {
      const allowedOrigins = ['*'];
      expect(isValidOrigin('https://example.com', allowedOrigins)).toBe(true);
      expect(isValidOrigin('https://evil.com', allowedOrigins)).toBe(true);
    });

    it('should handle subdomain wildcards', () => {
      const allowedOrigins = ['*.example.com'];
      expect(isValidOrigin('https://app.example.com', allowedOrigins)).toBe(true);
      expect(isValidOrigin('https://api.example.com', allowedOrigins)).toBe(true);
      expect(isValidOrigin('https://example.com', allowedOrigins)).toBe(true);
      expect(isValidOrigin('https://evil.com', allowedOrigins)).toBe(false);
    });

    it('should reject empty origins', () => {
      const allowedOrigins = ['https://example.com'];
      expect(isValidOrigin('', allowedOrigins)).toBe(false);
    });
  });

  describe('validateCSRFForForm', () => {
    it('should return true when token exists', () => {
      sessionStorageMock.getItem.mockReturnValue('test-token');
      expect(validateCSRFForForm()).toBe(true);
    });

    it('should return false when no token exists', () => {
      sessionStorageMock.getItem.mockReturnValue(null);
      
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      expect(validateCSRFForForm()).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith('CSRF token not found - form submission blocked');
      consoleSpy.mockRestore();
    });
  });
});
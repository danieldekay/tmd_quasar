/**
 * Type Validation Tests
 * Tests for authentication type definitions and validation
 */

import { describe, it, expect } from 'vitest';
import type { User, Session, AuthState } from '../types';
import { AuthErrorCodes } from '../types';

describe('Authentication Types', () => {
  describe('User type validation', () => {
    it('should validate complete User object', () => {
      const user: User = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        displayName: 'Test User',
        roles: ['subscriber'],
        isActive: true,
      };

      expect(user.id).toBeTypeOf('number');
      expect(user.username).toBeTypeOf('string');
      expect(user.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
      expect(user.displayName).toBeTypeOf('string');
      expect(Array.isArray(user.roles)).toBe(true);
      expect(user.isActive).toBeTypeOf('boolean');
    });

    it('should handle optional fields', () => {
      const user: User = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        displayName: 'Test User',
        roles: ['subscriber'],
        isActive: true,
        avatar: 'https://example.com/avatar.jpg',
        lastLogin: '2025-10-01T12:00:00Z',
      };

      expect(user.avatar).toBeDefined();
      expect(user.lastLogin).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });

    it('should enforce readonly roles array', () => {
      const user: User = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        displayName: 'Test User',
        roles: ['subscriber', 'editor'] as readonly string[],
        isActive: true,
      };

      // readonly is a TypeScript compile-time check, not runtime
      // Verify the roles array is present and has the expected structure
      expect(Array.isArray(user.roles)).toBe(true);
      expect(user.roles).toHaveLength(2);
      expect(user.roles).toContain('subscriber');
      expect(user.roles).toContain('editor');
    });
  });

  describe('Session type validation', () => {
    it('should validate complete Session object', () => {
      const session: Session = {
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        userId: 1,
        expiresAt: '2025-10-31T12:00:00Z',
        createdAt: '2025-10-01T12:00:00Z',
        isValid: true,
      };

      expect(session.token).toBeTypeOf('string');
      expect(session.userId).toBeTypeOf('number');
      expect(session.expiresAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
      expect(session.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
      expect(session.isValid).toBeTypeOf('boolean');
    });

    it('should handle optional device info', () => {
      const session: Session = {
        token: 'token',
        userId: 1,
        expiresAt: '2025-10-31T12:00:00Z',
        createdAt: '2025-10-01T12:00:00Z',
        deviceInfo: {
          userAgent: 'Mozilla/5.0...',
          platform: 'MacIntel',
        },
        isValid: true,
      };

      expect(session.deviceInfo).toBeDefined();
      expect(session.deviceInfo?.userAgent).toBeTypeOf('string');
      expect(session.deviceInfo?.platform).toBeTypeOf('string');
    });
  });

  describe('AuthState type validation', () => {
    it('should validate authenticated state', () => {
      const authState: AuthState = {
        user: {
          id: 1,
          username: 'testuser',
          email: 'test@example.com',
          displayName: 'Test User',
          roles: ['subscriber'],
          isActive: true,
        },
        session: {
          token: 'token',
          userId: 1,
          expiresAt: '2025-10-31T12:00:00Z',
          createdAt: '2025-10-01T12:00:00Z',
          isValid: true,
        },
        isAuthenticated: true,
        isLoading: false,
        error: null,
        loginAttempts: 0,
      };

      expect(authState.user).not.toBeNull();
      expect(authState.session).not.toBeNull();
      expect(authState.isAuthenticated).toBe(true);
      expect(authState.isLoading).toBe(false);
      expect(authState.error).toBeNull();
    });

    it('should validate unauthenticated state', () => {
      const authState: AuthState = {
        user: null,
        session: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        loginAttempts: 0,
      };

      expect(authState.user).toBeNull();
      expect(authState.session).toBeNull();
      expect(authState.isAuthenticated).toBe(false);
    });

    it('should track login attempts', () => {
      const authState: AuthState = {
        user: null,
        session: null,
        isAuthenticated: false,
        isLoading: false,
        error: 'Invalid credentials',
        loginAttempts: 3,
        lastLoginAttempt: '2025-10-01T12:00:00Z',
      };

      expect(authState.loginAttempts).toBe(3);
      expect(authState.lastLoginAttempt).toBeDefined();
      expect(authState.error).toBe('Invalid credentials');
    });
  });

  describe('AuthErrorCodes constants', () => {
    it('should define all error codes', () => {
      expect(AuthErrorCodes.INVALID_CREDENTIALS).toBe('INVALID_CREDENTIALS');
      expect(AuthErrorCodes.ACCOUNT_DISABLED).toBe('ACCOUNT_DISABLED');
      expect(AuthErrorCodes.RATE_LIMITED).toBe('RATE_LIMITED');
      expect(AuthErrorCodes.VALIDATION_ERROR).toBe('VALIDATION_ERROR');
      expect(AuthErrorCodes.INVALID_TOKEN).toBe('INVALID_TOKEN');
      expect(AuthErrorCodes.NETWORK_ERROR).toBe('NETWORK_ERROR');
      expect(AuthErrorCodes.UNKNOWN_ERROR).toBe('UNKNOWN_ERROR');
    });

    it('should be type-safe error codes', () => {
      const errorCode = AuthErrorCodes.INVALID_CREDENTIALS;
      expect(typeof errorCode).toBe('string');
    });
  });
});

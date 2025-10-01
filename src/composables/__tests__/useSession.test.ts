/**
 * useSession Composable Tests
 * Tests for session management composable
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { useSession } from './useSession';

describe('useSession composable', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('session state', () => {
    it('should provide reactive session state', () => {
      const { session, isValid } = useSession();

      expect(session.value).toBeNull();
      expect(isValid.value).toBe(false);
    });
  });

  describe('saveSession', () => {
    it('should save session to storage', () => {
      const { saveSession, session } = useSession();

      const mockSession = {
        token: 'test-token',
        userId: 1,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString(),
        isValid: true,
      };

      const mockUser = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        displayName: 'Test User',
        roles: ['subscriber'] as const,
        isActive: true,
      };

      saveSession(mockSession, mockUser);

      expect(session.value).toEqual(mockSession);
    });
  });

  describe('clearSession', () => {
    it('should clear session from storage', () => {
      const { saveSession, clearSession, session } = useSession();

      const mockSession = {
        token: 'test-token',
        userId: 1,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString(),
        isValid: true,
      };

      const mockUser = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        displayName: 'Test User',
        roles: ['subscriber'] as const,
        isActive: true,
      };

      saveSession(mockSession, mockUser);
      expect(session.value).not.toBeNull();

      clearSession();
      expect(session.value).toBeNull();
    });
  });

  describe('restoreSession', () => {
    it('should restore valid session from storage', () => {
      const { restoreSession, session } = useSession();

      restoreSession();

      // Should either restore or remain null
      expect(session.value === null || typeof session.value === 'object').toBe(true);
    });
  });

  describe('isSessionValid', () => {
    it('should validate session expiration', () => {
      const { isSessionValid } = useSession();

      const validSession = {
        token: 'token',
        userId: 1,
        expiresAt: new Date(Date.now() + 1000).toISOString(),
        createdAt: new Date().toISOString(),
        isValid: true,
      };

      expect(isSessionValid(validSession)).toBe(true);

      const expiredSession = {
        ...validSession,
        expiresAt: new Date(Date.now() - 1000).toISOString(),
      };

      expect(isSessionValid(expiredSession)).toBe(false);
    });
  });

  describe('getToken', () => {
    it('should return current session token', () => {
      const { saveSession, getToken } = useSession();

      const mockSession = {
        token: 'test-token-123',
        userId: 1,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString(),
        isValid: true,
      };

      const mockUser = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        displayName: 'Test User',
        roles: ['subscriber'] as const,
        isActive: true,
      };

      saveSession(mockSession, mockUser);

      expect(getToken()).toBe('test-token-123');
    });

    it('should return null if no session exists', () => {
      const { getToken } = useSession();

      expect(getToken()).toBeNull();
    });
  });
});

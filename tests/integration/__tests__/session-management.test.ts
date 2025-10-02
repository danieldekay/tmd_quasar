/**
 * Session Management Integration Tests
 * Tests for session persistence, restoration, and lifecycle
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { sessionService } from 'src/services/sessionService';
import type { Session, User } from 'src/services/types';

describe('Session Management Integration', () => {
  const mockUser: User = {
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
    displayName: 'Test User',
    roles: ['subscriber'],
    isActive: true,
  };

  const createMockSession = (overrides?: Partial<Session>): Session => ({
    token: 'test-token-12345',
    userId: 1,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
    isValid: true,
    ...overrides,
  });

  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('Session persistence', () => {
    it('should save and retrieve session from localStorage', () => {
      const session = createMockSession();

      sessionService.saveSession(session, mockUser);

      const retrieved = sessionService.getSession();
      expect(retrieved).toEqual(session);
    });

    it('should persist user data with session', () => {
      const session = createMockSession();

      sessionService.saveSession(session, mockUser);

      const storedUser = localStorage.getItem('tmd_user');
      expect(storedUser).toBeTruthy();

      const parsedUser = JSON.parse(storedUser!);
      expect(parsedUser).toEqual(mockUser);
    });

    it('should persist token separately for easy access', () => {
      const session = createMockSession({ token: 'quick-access-token' });

      sessionService.saveSession(session, mockUser);

      const token = sessionService.getToken();
      expect(token).toBe('quick-access-token');
    });

    it('should handle multiple session updates', () => {
      const session1 = createMockSession({ token: 'token-1' });
      sessionService.saveSession(session1, mockUser);

      const session2 = createMockSession({ token: 'token-2', userId: 2 });
      sessionService.saveSession(session2, { ...mockUser, id: 2, username: 'user2' });

      const retrieved = sessionService.getSession();
      expect(retrieved?.token).toBe('token-2');
      expect(retrieved?.userId).toBe(2);
    });
  });

  describe('Session restoration', () => {
    it('should restore valid session on app startup', () => {
      const session = createMockSession();
      sessionService.saveSession(session, mockUser);

      // Simulate app restart by clearing in-memory cache
      sessionService.clearSession();

      // Restore from localStorage
      const restored = sessionService.getSession();
      expect(restored).toEqual(session);
    });

    it('should not restore expired sessions', () => {
      const expiredSession = createMockSession({
        expiresAt: new Date(Date.now() - 1000).toISOString(),
        isValid: false,
      });

      sessionService.saveSession(expiredSession, mockUser);

      const isValid = sessionService.isSessionValid(expiredSession);
      expect(isValid).toBe(false);
    });

    it('should handle corrupted localStorage data gracefully', () => {
      localStorage.setItem('tmd_session', 'corrupted-json-data{{{');

      const session = sessionService.getSession();
      expect(session).toBeNull();
    });

    it('should handle missing localStorage data', () => {
      const session = sessionService.getSession();
      expect(session).toBeNull();

      const token = sessionService.getToken();
      expect(token).toBeNull();
    });
  });

  describe('Session validation', () => {
    it('should validate session expiration time', () => {
      const validSession = createMockSession({
        expiresAt: new Date(Date.now() + 1000).toISOString(),
      });

      expect(sessionService.isSessionValid(validSession)).toBe(true);

      const expiredSession = createMockSession({
        expiresAt: new Date(Date.now() - 1000).toISOString(),
      });

      expect(sessionService.isSessionValid(expiredSession)).toBe(false);
    });

    it('should validate 30-day session duration', () => {
      const session = createMockSession();
      const expirationDate = new Date(session.expiresAt);
      const creationDate = new Date(session.createdAt);

      const durationMs = expirationDate.getTime() - creationDate.getTime();
      const durationDays = durationMs / (1000 * 60 * 60 * 24);

      expect(durationDays).toBeGreaterThanOrEqual(29);
      expect(durationDays).toBeLessThanOrEqual(31);
    });

    it('should check isValid flag', () => {
      const invalidSession = createMockSession({ isValid: false });

      expect(sessionService.isSessionValid(invalidSession)).toBe(false);
    });

    it('should require token presence', () => {
      const sessionWithoutToken = createMockSession({ token: '' });

      expect(sessionService.isSessionValid(sessionWithoutToken)).toBe(false);
    });
  });

  describe('Session clearing', () => {
    it('should remove all session data from localStorage', () => {
      const session = createMockSession();
      sessionService.saveSession(session, mockUser);

      expect(localStorage.getItem('tmd_session')).toBeTruthy();
      expect(localStorage.getItem('tmd_auth_token')).toBeTruthy();
      expect(localStorage.getItem('tmd_user')).toBeTruthy();

      sessionService.clearSession();

      expect(localStorage.getItem('tmd_session')).toBeNull();
      expect(localStorage.getItem('tmd_auth_token')).toBeNull();
      expect(localStorage.getItem('tmd_user')).toBeNull();
    });

    it('should handle clearing non-existent session', () => {
      expect(() => sessionService.clearSession()).not.toThrow();
    });

    it('should clear in-memory session cache', () => {
      const session = createMockSession();
      sessionService.saveSession(session, mockUser);

      const retrieved1 = sessionService.getSession();
      expect(retrieved1).not.toBeNull();

      sessionService.clearSession();

      const retrieved2 = sessionService.getSession();
      expect(retrieved2).toBeNull();
    });
  });

  describe('Concurrent session handling', () => {
    it('should handle rapid save operations', () => {
      for (let i = 0; i < 10; i++) {
        const session = createMockSession({ token: `token-${i}` });
        sessionService.saveSession(session, mockUser);
      }

      const final = sessionService.getSession();
      expect(final?.token).toBe('token-9');
    });

    it('should maintain consistency across multiple reads', () => {
      const session = createMockSession();
      sessionService.saveSession(session, mockUser);

      const read1 = sessionService.getSession();
      const read2 = sessionService.getSession();
      const read3 = sessionService.getSession();

      expect(read1).toEqual(read2);
      expect(read2).toEqual(read3);
    });
  });

  describe('Storage event handling', () => {
    it('should detect external localStorage changes', () => {
      const session = createMockSession();
      sessionService.saveSession(session, mockUser);

      // Simulate external change (e.g., another tab)
      const modifiedSession = { ...session, token: 'externally-modified-token' };
      localStorage.setItem('tmd_session', JSON.stringify(modifiedSession));

      // Force re-read from localStorage
      sessionService.clearSession();
      const retrieved = sessionService.getSession();

      expect(retrieved?.token).toBe('externally-modified-token');
    });

    it('should handle localStorage quota exceeded', () => {
      const hugeSession = createMockSession({
        token: 'x'.repeat(5 * 1024 * 1024), // 5MB token
      });

      // Should handle gracefully even if quota is exceeded
      expect(() => sessionService.saveSession(hugeSession, mockUser)).not.toThrow();
    });
  });

  describe('Session metadata', () => {
    it('should track session creation time', () => {
      const before = new Date();
      const session = createMockSession();
      sessionService.saveSession(session, mockUser);
      const after = new Date();

      const retrieved = sessionService.getSession();
      const createdAt = new Date(retrieved!.createdAt);

      expect(createdAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(createdAt.getTime()).toBeLessThanOrEqual(after.getTime());
    });

    it('should calculate remaining session time', () => {
      const session = createMockSession();
      sessionService.saveSession(session, mockUser);

      const retrieved = sessionService.getSession();
      const expiresAt = new Date(retrieved!.expiresAt);
      const now = new Date();
      const remaining = expiresAt.getTime() - now.getTime();

      // Should be close to 30 days
      expect(remaining).toBeGreaterThan(29 * 24 * 60 * 60 * 1000);
    });
  });
});

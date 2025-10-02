import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { sessionService } from '../sessionService';
import type { Session, User } from '../types';

describe('sessionService', () => {
  const mockUser: User = {
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
    displayName: 'Test User',
    roles: ['subscriber'],
    isActive: true,
  };

  const mockSession: Session = {
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    userId: 1,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
    isValid: true,
  };

  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('saveSession', () => {
    it('should save session to localStorage', () => {
      sessionService.saveSession(mockSession, mockUser);

      const savedSession = localStorage.getItem('tmd_session');
      const savedToken = localStorage.getItem('tmd_auth_token');
      const savedUser = localStorage.getItem('tmd_user');

      expect(savedSession).toBeDefined();
      expect(savedToken).toBe(mockSession.token);
      expect(savedUser).toBeDefined();
    });
  });

  describe('saveRefreshToken', () => {
    it('should save refresh token separately', () => {
      const refreshToken = 'refresh-token-123';
      sessionService.saveRefreshToken(refreshToken);

      const saved = localStorage.getItem('tmd_refresh_token');
      expect(saved).toBe(refreshToken);
    });
  });

  describe('getSession', () => {
    it('should retrieve saved session', () => {
      sessionService.saveSession(mockSession, mockUser);

      const retrieved = sessionService.getSession();

      expect(retrieved).toBeDefined();
      expect(retrieved?.token).toBe(mockSession.token);
      expect(retrieved?.userId).toBe(mockSession.userId);
    });

    it('should return null when no session exists', () => {
      const retrieved = sessionService.getSession();
      expect(retrieved).toBeNull();
    });
  });

  describe('getUser', () => {
    it('should retrieve saved user', () => {
      sessionService.saveSession(mockSession, mockUser);

      const retrieved = sessionService.getUser();

      expect(retrieved).toBeDefined();
      expect(retrieved?.username).toBe(mockUser.username);
      expect(retrieved?.email).toBe(mockUser.email);
    });

    it('should return null when no user exists', () => {
      const retrieved = sessionService.getUser();
      expect(retrieved).toBeNull();
    });
  });

  describe('getToken', () => {
    it('should retrieve token', () => {
      sessionService.saveSession(mockSession, mockUser);

      const token = sessionService.getToken();
      expect(token).toBe(mockSession.token);
    });
  });

  describe('getRefreshToken', () => {
    it('should retrieve refresh token', () => {
      const refreshToken = 'refresh-token-123';
      sessionService.saveRefreshToken(refreshToken);

      const retrieved = sessionService.getRefreshToken();
      expect(retrieved).toBe(refreshToken);
    });
  });

  describe('isSessionValid', () => {
    it('should return true for valid session', () => {
      const isValid = sessionService.isSessionValid(mockSession);
      expect(isValid).toBe(true);
    });

    it('should return false for expired session', () => {
      const expiredSession = {
        ...mockSession,
        expiresAt: new Date(Date.now() - 1000).toISOString(),
      };

      const isValid = sessionService.isSessionValid(expiredSession);
      expect(isValid).toBe(false);
    });
  });

  describe('clearSession', () => {
    it('should remove all session data', () => {
      sessionService.saveSession(mockSession, mockUser);
      sessionService.saveRefreshToken('refresh-token');

      sessionService.clearSession();

      expect(sessionService.getSession()).toBeNull();
      expect(sessionService.getUser()).toBeNull();
      expect(sessionService.getToken()).toBeNull();
      expect(sessionService.getRefreshToken()).toBeNull();
    });
  });
});

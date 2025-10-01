/**
 * Auth Flow Integration Tests
 * Tests for complete authentication flow from login to logout
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useAuthStore } from 'src/stores/authStore';
import { authService } from 'src/services/authService';
import { sessionService } from 'src/services/sessionService';

describe('Complete Authentication Flow', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('Successful login flow', () => {
    it('should complete full login sequence', async () => {
      const store = useAuthStore();

      // Initial state - not authenticated
      expect(store.isAuthenticated).toBe(false);
      expect(store.user).toBeNull();

      // Perform login
      const credentials = {
        username: 'testuser',
        password: 'password123',
      };

      await store.login(credentials);

      // Post-login state
      expect(store.isAuthenticated).toBe(true);
      expect(store.user).not.toBeNull();
      expect(store.user?.username).toBe('testuser');

      // Session should be persisted
      const session = sessionService.getSession();
      expect(session).not.toBeNull();
      expect(session?.token).toBeDefined();
      expect(session?.isValid).toBe(true);

      // Token should be in localStorage
      const token = sessionService.getToken();
      expect(token).toBeTruthy();
    });

    it('should restore session on page reload', async () => {
      const store = useAuthStore();

      // Login and persist session
      await store.login({
        username: 'testuser',
        password: 'password123',
      });

      const originalToken = sessionService.getToken();

      // Simulate page reload by creating new store instance
      setActivePinia(createPinia());
      const newStore = useAuthStore();

      // Initial state should be unauthenticated
      expect(newStore.isAuthenticated).toBe(false);

      // Restore session
      await newStore.restoreSession();

      // Should restore authenticated state
      expect(newStore.isAuthenticated).toBe(true);
      expect(newStore.user).not.toBeNull();
      expect(sessionService.getToken()).toBe(originalToken);
    });
  });

  describe('Failed login flow', () => {
    it('should handle invalid credentials', async () => {
      const store = useAuthStore();

      const invalidCredentials = {
        username: 'wronguser',
        password: 'wrongpassword',
      };

      await expect(store.login(invalidCredentials)).rejects.toThrow();

      // Should remain unauthenticated
      expect(store.isAuthenticated).toBe(false);
      expect(store.user).toBeNull();

      // No session should be persisted
      const session = sessionService.getSession();
      expect(session).toBeNull();
    });

    it('should implement progressive delays after failed attempts', async () => {
      const store = useAuthStore();

      const credentials = {
        username: 'testuser',
        password: 'wrongpassword',
      };

      // First failed attempt - no delay
      const start1 = Date.now();
      await expect(store.login(credentials)).rejects.toThrow();
      const duration1 = Date.now() - start1;
      expect(duration1).toBeLessThan(100);

      // Second failed attempt - 1 second delay
      const start2 = Date.now();
      await expect(store.login(credentials)).rejects.toThrow();
      const duration2 = Date.now() - start2;
      expect(duration2).toBeGreaterThanOrEqual(1000);

      // Third failed attempt - 5 second delay
      const start3 = Date.now();
      await expect(store.login(credentials)).rejects.toThrow();
      const duration3 = Date.now() - start3;
      expect(duration3).toBeGreaterThanOrEqual(5000);
    });
  });

  describe('Logout flow', () => {
    it('should complete full logout sequence', async () => {
      const store = useAuthStore();

      // Login first
      await store.login({
        username: 'testuser',
        password: 'password123',
      });

      expect(store.isAuthenticated).toBe(true);

      // Perform logout
      await store.logout();

      // Post-logout state
      expect(store.isAuthenticated).toBe(false);
      expect(store.user).toBeNull();

      // Session should be cleared
      const session = sessionService.getSession();
      expect(session).toBeNull();

      // Token should be removed from localStorage
      const token = sessionService.getToken();
      expect(token).toBeNull();
    });

    it('should clear all authentication data on logout', async () => {
      const store = useAuthStore();

      // Login and verify data exists
      await store.login({
        username: 'testuser',
        password: 'password123',
      });

      expect(localStorage.getItem('tmd_auth_token')).toBeTruthy();
      expect(localStorage.getItem('tmd_session')).toBeTruthy();

      // Logout
      await store.logout();

      // All auth data should be cleared
      expect(localStorage.getItem('tmd_auth_token')).toBeNull();
      expect(localStorage.getItem('tmd_session')).toBeNull();
      expect(localStorage.getItem('tmd_user')).toBeNull();
    });
  });

  describe('Session expiration flow', () => {
    it('should detect expired sessions', () => {
      const store = useAuthStore();

      const expiredSession = {
        token: 'expired-token',
        userId: 1,
        expiresAt: new Date(Date.now() - 1000).toISOString(),
        createdAt: new Date(Date.now() - 31 * 24 * 60 * 60 * 1000).toISOString(),
        isValid: false,
      };

      sessionService.saveSession(expiredSession, {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        displayName: 'Test User',
        roles: ['subscriber'],
        isActive: true,
      });

      // Attempt to restore expired session
      store.restoreSession();

      // Should not restore authenticated state
      expect(store.isAuthenticated).toBe(false);
      expect(store.user).toBeNull();
    });

    it('should handle session expiration during use', async () => {
      const store = useAuthStore();

      // Login with session that will expire soon
      await store.login({
        username: 'testuser',
        password: 'password123',
      });

      expect(store.isAuthenticated).toBe(true);

      // Manually expire the session
      const session = sessionService.getSession();
      if (session) {
        const expiredSession = {
          ...session,
          expiresAt: new Date(Date.now() - 1000).toISOString(),
          isValid: false,
        };
        sessionService.saveSession(expiredSession, store.user!);
      }

      // Verify session should fail
      await expect(authService.verify()).rejects.toThrow();

      // Store should update to unauthenticated
      expect(store.isAuthenticated).toBe(false);
    });
  });

  describe('Token verification flow', () => {
    it('should verify valid tokens', async () => {
      const store = useAuthStore();

      await store.login({
        username: 'testuser',
        password: 'password123',
      });

      // Verify token
      const result = await authService.verify();

      expect(result.success).toBe(true);
      expect(result.user).toBeDefined();
    });

    it('should reject invalid tokens', async () => {
      // Set invalid token
      sessionService.saveSession(
        {
          token: 'invalid-token',
          userId: 999,
          expiresAt: new Date(Date.now() + 1000).toISOString(),
          createdAt: new Date().toISOString(),
          isValid: true,
        },
        {
          id: 999,
          username: 'fake',
          email: 'fake@example.com',
          displayName: 'Fake User',
          roles: ['subscriber'],
          isActive: true,
        },
      );

      // Verification should fail
      await expect(authService.verify()).rejects.toThrow();
    });
  });
});

/**
 * Authentication Store Tests
 * Tests for Pinia authentication state management
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useAuthStore } from './authStore';
import type { User, Session } from '../services/types';

describe('useAuthStore', () => {
  beforeEach(() => {
    // Create a fresh pinia instance for each test
    setActivePinia(createPinia());
  });

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const store = useAuthStore();

      expect(store.user).toBeNull();
      expect(store.session).toBeNull();
      expect(store.isAuthenticated).toBe(false);
      expect(store.isLoading).toBe(false);
      expect(store.error).toBeNull();
      expect(store.loginAttempts).toBe(0);
    });
  });

  describe('setUser', () => {
    it('should set user and update authentication status', () => {
      const store = useAuthStore();
      const mockUser: User = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        displayName: 'Test User',
        roles: ['subscriber'],
        isActive: true,
      };

      store.setUser(mockUser);

      expect(store.user).toEqual(mockUser);
    });
  });

  describe('setSession', () => {
    it('should set session data', () => {
      const store = useAuthStore();
      const mockSession: Session = {
        token: 'test-token',
        userId: 1,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString(),
        isValid: true,
      };

      store.setSession(mockSession);

      expect(store.session).toEqual(mockSession);
    });
  });

  describe('login action', () => {
    it('should set loading state during login', async () => {
      const store = useAuthStore();

      const loginPromise = store.login({
        identifier: 'testuser',
        password: 'password',
      });

      expect(store.isLoading).toBe(true);

      await loginPromise;
    });

    it('should set user and session on successful login', async () => {
      const store = useAuthStore();

      await store.login({
        identifier: 'testuser',
        password: 'password',
      });

      expect(store.user).not.toBeNull();
      expect(store.session).not.toBeNull();
      expect(store.isAuthenticated).toBe(true);
      expect(store.isLoading).toBe(false);
      expect(store.error).toBeNull();
      expect(store.loginAttempts).toBe(0);
    });

    it('should set error on failed login', async () => {
      const store = useAuthStore();

      await store.login({
        identifier: 'invalid',
        password: 'wrong',
      });

      expect(store.user).toBeNull();
      expect(store.session).toBeNull();
      expect(store.isAuthenticated).toBe(false);
      expect(store.isLoading).toBe(false);
      expect(store.error).not.toBeNull();
      expect(store.loginAttempts).toBeGreaterThan(0);
    });

    it('should increment login attempts on failure', async () => {
      const store = useAuthStore();

      await store.login({ identifier: 'invalid', password: 'wrong' });
      expect(store.loginAttempts).toBe(1);

      await store.login({ identifier: 'invalid', password: 'wrong' });
      expect(store.loginAttempts).toBe(2);
    });

    it('should reset login attempts on successful login', async () => {
      const store = useAuthStore();

      // Failed attempts
      await store.login({ identifier: 'invalid', password: 'wrong' });
      expect(store.loginAttempts).toBeGreaterThan(0);

      // Successful login
      await store.login({ identifier: 'testuser', password: 'password' });
      expect(store.loginAttempts).toBe(0);
    });
  });

  describe('logout action', () => {
    it('should clear all authentication data', async () => {
      const store = useAuthStore();

      // First login
      await store.login({
        identifier: 'testuser',
        password: 'password',
      });

      // Then logout
      await store.logout();

      expect(store.user).toBeNull();
      expect(store.session).toBeNull();
      expect(store.isAuthenticated).toBe(false);
      expect(store.error).toBeNull();
    });
  });

  describe('verify action', () => {
    it('should verify and restore session', async () => {
      const store = useAuthStore();

      await store.verify();

      // Should either restore session or remain unauthenticated
      expect(store.isLoading).toBe(false);
    });
  });

  describe('getters', () => {
    it('should compute isAuthenticated correctly', () => {
      const store = useAuthStore();

      expect(store.isAuthenticated).toBe(false);

      store.setUser({
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        displayName: 'Test User',
        roles: ['subscriber'],
        isActive: true,
      });

      store.setSession({
        token: 'token',
        userId: 1,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString(),
        isValid: true,
      });

      expect(store.isAuthenticated).toBe(true);
    });
  });

  describe('progressive delays', () => {
    it('should calculate progressive delay for login attempts', () => {
      const store = useAuthStore();

      expect(store.getLoginDelay(0)).toBe(0);
      expect(store.getLoginDelay(1)).toBe(0);
      expect(store.getLoginDelay(2)).toBe(1000);
      expect(store.getLoginDelay(3)).toBe(5000);
      expect(store.getLoginDelay(4)).toBeGreaterThanOrEqual(30000);
    });
  });
});

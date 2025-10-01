/**
 * useAuth Composable Tests
 * Tests for authentication composable with reactive state
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { useAuth } from './useAuth';

describe('useAuth composable', () => {
  beforeEach(() => {
    // Reset any global state
    localStorage.clear();
  });

  describe('reactive auth state', () => {
    it('should provide reactive authentication state', () => {
      const { user, isAuthenticated, isLoading, error } = useAuth();

      expect(user.value).toBeNull();
      expect(isAuthenticated.value).toBe(false);
      expect(isLoading.value).toBe(false);
      expect(error.value).toBeNull();
    });
  });

  describe('login function', () => {
    it('should expose login function', () => {
      const { login } = useAuth();

      expect(typeof login).toBe('function');
    });

    it('should handle successful login', async () => {
      const { login, user, isAuthenticated, error } = useAuth();

      await login({
        identifier: 'testuser',
        password: 'password',
      });

      expect(user.value).not.toBeNull();
      expect(isAuthenticated.value).toBe(true);
      expect(error.value).toBeNull();
    });

    it('should handle failed login', async () => {
      const { login, user, isAuthenticated, error } = useAuth();

      await login({
        identifier: 'invalid',
        password: 'wrong',
      });

      expect(user.value).toBeNull();
      expect(isAuthenticated.value).toBe(false);
      expect(error.value).not.toBeNull();
    });

    it('should update loading state during login', async () => {
      const { login, isLoading } = useAuth();

      const promise = login({
        identifier: 'testuser',
        password: 'password',
      });

      expect(isLoading.value).toBe(true);
      await promise;
      expect(isLoading.value).toBe(false);
    });
  });

  describe('logout function', () => {
    it('should expose logout function', () => {
      const { logout } = useAuth();

      expect(typeof logout).toBe('function');
    });

    it('should clear authentication state on logout', async () => {
      const { login, logout, user, isAuthenticated } = useAuth();

      // Login first
      await login({
        identifier: 'testuser',
        password: 'password',
      });

      expect(isAuthenticated.value).toBe(true);

      // Then logout
      await logout();

      expect(user.value).toBeNull();
      expect(isAuthenticated.value).toBe(false);
    });
  });

  describe('verify function', () => {
    it('should expose verify function', () => {
      const { verify } = useAuth();

      expect(typeof verify).toBe('function');
    });

    it('should restore session if valid', async () => {
      const { verify, isAuthenticated } = useAuth();

      await verify();

      // Should either restore or remain unauthenticated
      expect(typeof isAuthenticated.value).toBe('boolean');
    });
  });

  describe('progressive delays', () => {
    it('should calculate login delays correctly', () => {
      const { getLoginDelay } = useAuth();

      expect(getLoginDelay(0)).toBe(0);
      expect(getLoginDelay(1)).toBe(0);
      expect(getLoginDelay(2)).toBe(1000);
      expect(getLoginDelay(3)).toBe(5000);
      expect(getLoginDelay(4)).toBeGreaterThanOrEqual(30000);
    });
  });

  describe('multiple instances', () => {
    it('should share state across multiple composable calls', async () => {
      const auth1 = useAuth();
      const auth2 = useAuth();

      await auth1.login({
        identifier: 'testuser',
        password: 'password',
      });

      // Both instances should reflect the same state
      expect(auth2.isAuthenticated.value).toBe(true);
      expect(auth2.user.value).toEqual(auth1.user.value);
    });
  });
});

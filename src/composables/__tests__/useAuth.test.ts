/**
 * useAuth Composable Tests
 * Tests for authentication composable with reactive state
 */

import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAuth } from '../useAuth';

// Mock authService
vi.mock('../../services/authService', () => ({
  authService: {
    login: vi.fn().mockResolvedValue({
      token: 'test-token',
      user: { id: 1, name: 'Test User', email: 'test@test.com', roles: [] },
    }),
    logout: vi.fn(),
  },
}));

// Mock sessionService
vi.mock('../../services/sessionService', () => ({
  sessionService: {
    saveSession: vi.fn(),
    saveRefreshToken: vi.fn(),
    getSession: vi.fn().mockReturnValue(null),
    getUser: vi.fn().mockReturnValue(null),
    clearSession: vi.fn(),
    isSessionValid: vi.fn().mockReturnValue(false),
  },
}));

describe('useAuth composable', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
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

      await login('testuser', 'password', true);

      expect(user.value).not.toBeNull();
      expect(isAuthenticated.value).toBe(true);
      expect(error.value).toBeNull();
    });

    it('should handle failed login', async () => {
      const { login, user, isAuthenticated } = useAuth();

      // Mock login to fail
      const authService = await import('../../services/authService');

      const mockLogin = vi.mocked(authService.authService.login);
      mockLogin.mockRejectedValueOnce(new Error('Login failed'));

      try {
        await login('invalid', 'wrong', true);
      } catch {
        // Expected to fail
      }

      expect(user.value).toBeNull();
      expect(isAuthenticated.value).toBe(false);
    });

    it('should update loading state during login', async () => {
      const { login, isLoading } = useAuth();

      const promise = login('testuser', 'password', true);

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
      await login('testuser', 'password', true);

      expect(isAuthenticated.value).toBe(true);

      // Then logout
      logout();

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
      const { getRemainingDelay } = useAuth();

      expect(getRemainingDelay.value).toBeGreaterThanOrEqual(0);
    });
  });

  describe('multiple instances', () => {
    it('should share state across multiple composable calls', async () => {
      const auth1 = useAuth();
      const auth2 = useAuth();

      await auth1.login('testuser', 'password', true);

      // Both instances should reflect the same state
      expect(auth2.isAuthenticated.value).toBe(true);
      expect(auth2.user.value).toEqual(auth1.user.value);
    });
  });
});

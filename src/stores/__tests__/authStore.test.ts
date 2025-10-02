/* eslint-disable @typescript-eslint/unbound-method */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useAuthStore } from '../authStore';
import type { User } from '../authStore';

// Mock services
vi.mock('../../services/authService', () => ({
  authService: {
    login: vi.fn(),
    logout: vi.fn(),
    refreshToken: vi.fn(),
  },
}));

vi.mock('../../services/sessionService', () => ({
  sessionService: {
    saveSession: vi.fn(),
    saveRefreshToken: vi.fn(),
    getSession: vi.fn(),
    getUser: vi.fn(),
    getToken: vi.fn(),
    getRefreshToken: vi.fn(),
    clearSession: vi.fn(),
  },
}));

vi.mock('../../utils/cookies', () => ({
  setJWTToken: vi.fn(),
  getJWTToken: vi.fn(),
  setRefreshToken: vi.fn(),
  getRefreshToken: vi.fn(),
  clearJWTTokens: vi.fn(),
}));

describe('useAuthStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const store = useAuthStore();

      expect(store.user).toBeNull();
      expect(store.token).toBeNull();
      expect(store.isAuthenticated).toBe(false);
      expect(store.isLoading).toBe(false);
      expect(store.error).toBeNull();
      expect(store.loginAttempts).toBe(0);
    });
  });

  describe('setUser', () => {
    it('should set user', () => {
      const store = useAuthStore();
      const mockUser: User = {
        id: 1,
        name: 'Test User',
        username: 'testuser',
        email: 'test@example.com',
        roles: ['subscriber'],
      };

      store.setUser(mockUser);

      expect(store.user).toEqual(mockUser);
    });
  });

  describe('login', () => {
    it('should successfully login', async () => {
      const { authService } = await import('../../services/authService');
      const store = useAuthStore();

      const mockResponse = {
        token: 'test-token',
        refreshToken: 'test-refresh',
        user: {
          id: 1,
          name: 'Test User',
          email: 'test@example.com',
          roles: [],
        },
      };

      vi.mocked(authService.login).mockResolvedValueOnce(mockResponse);

      const result = await store.login({
        username: 'testuser',
        password: 'password',
      });

      expect(result).toBe(true);
      expect(store.token).toBe('test-token');
      expect(store.user).toBeDefined();
      expect(store.isAuthenticated).toBe(true);
      expect(store.loginAttempts).toBe(0);
    });

    it('should handle login failure', async () => {
      const { authService } = await import('../../services/authService');
      const store = useAuthStore();

      vi.mocked(authService.login).mockRejectedValueOnce(new Error('Invalid credentials'));

      const result = await store.login({
        username: 'testuser',
        password: 'wrong',
      });

      expect(result).toBe(false);
      expect(store.token).toBeNull();
      expect(store.user).toBeNull();
      expect(store.error).toBeDefined();
      expect(store.loginAttempts).toBeGreaterThan(0);
    });
  });

  describe('logout', () => {
    it('should clear authentication state', async () => {
      const { authService } = await import('../../services/authService');
      const store = useAuthStore();

      // Login first to set state
      const mockResponse = {
        token: 'test-token',
        refreshToken: 'test-refresh',
        user: {
          id: 1,
          name: 'Test',
          email: 'test@example.com',
          roles: [],
        },
      };

      vi.mocked(authService.login).mockResolvedValueOnce(mockResponse);
      await store.login({ username: 'test', password: 'pass' });

      // Verify logged in
      expect(store.isAuthenticated).toBe(true);

      // Now logout
      store.logout();

      expect(store.user).toBeNull();
      expect(store.token).toBeNull();
      expect(store.isAuthenticated).toBe(false);
    });
  });

  describe('computed properties', () => {
    it('should calculate isAuthenticated correctly', async () => {
      const { authService } = await import('../../services/authService');
      const store = useAuthStore();

      expect(store.isAuthenticated).toBe(false);

      // Login to set authenticated state
      const mockResponse = {
        token: 'test-token',
        refreshToken: 'test-refresh',
        user: {
          id: 1,
          name: 'Test',
          email: 'test@example.com',
          roles: [],
        },
      };

      vi.mocked(authService.login).mockResolvedValueOnce(mockResponse);
      await store.login({ username: 'test', password: 'pass' });

      expect(store.isAuthenticated).toBe(true);
    });

    it('should check user roles correctly', () => {
      const store = useAuthStore();

      store.setUser({
        id: 1,
        name: 'Admin',
        email: 'admin@example.com',
        roles: ['administrator'],
      });

      expect(store.hasRole('administrator')).toBe(true);
      expect(store.hasRole('subscriber')).toBe(false);
      expect(store.isAdmin).toBe(true);
    });
  });
});

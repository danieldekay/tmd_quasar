import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router';
import { requireAuth, redirectIfAuthenticated } from '../guards';
import { useAuthStore } from '../../stores/authStore';

// Mock the auth store
vi.mock('../../stores/authStore', () => ({
  useAuthStore: vi.fn(),
}));

describe('Router Guards', () => {
  let mockAuthStore: {
    isAuthenticated: boolean;
    isLoadingStoredAuth: boolean;
    loadStoredAuth: ReturnType<typeof vi.fn>;
  };
  let mockNext: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // Mock the auth store
    mockAuthStore = {
      isAuthenticated: false,
      isLoadingStoredAuth: false,
      loadStoredAuth: vi.fn().mockResolvedValue(false),
    };

    (useAuthStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue(mockAuthStore);

    // Mock the next function
    mockNext = vi.fn();
  });

  describe('requireAuth', () => {
    it('should redirect to login when user is not authenticated', async () => {
      mockAuthStore.isAuthenticated = false;

      const to = { fullPath: '/protected' } as RouteLocationNormalized;
      const from = {} as RouteLocationNormalized;

      await requireAuth(to, from, mockNext as NavigationGuardNext);

      expect(mockNext).toHaveBeenCalledWith({
        path: '/auth/login',
        query: { redirect: '/protected' },
      });
    });

    it('should allow access when user is authenticated', async () => {
      mockAuthStore.isAuthenticated = true;

      const to = { fullPath: '/protected' } as RouteLocationNormalized;
      const from = {} as RouteLocationNormalized;

      await requireAuth(to, from, mockNext as NavigationGuardNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should load stored auth if not authenticated and not loading', async () => {
      mockAuthStore.isAuthenticated = false;
      mockAuthStore.isLoadingStoredAuth = false;

      const to = { fullPath: '/protected' } as RouteLocationNormalized;
      const from = {} as RouteLocationNormalized;

      await requireAuth(to, from, mockNext as NavigationGuardNext);

      expect(mockAuthStore.loadStoredAuth).toHaveBeenCalled();
    });
  });

  describe('redirectIfAuthenticated', () => {
    it('should redirect authenticated users away from login page', () => {
      mockAuthStore.isAuthenticated = true;

      const to = {
        path: '/auth/login',
        query: { redirect: '/dashboard' },
      } as unknown as RouteLocationNormalized;
      const from = {} as RouteLocationNormalized;

      redirectIfAuthenticated(to, from, mockNext as NavigationGuardNext);

      expect(mockNext).toHaveBeenCalledWith({ path: '/dashboard' });
    });

    it('should redirect to home if no redirect query parameter', () => {
      mockAuthStore.isAuthenticated = true;

      const to = {
        path: '/auth/login',
        query: {},
      } as unknown as RouteLocationNormalized;
      const from = {} as RouteLocationNormalized;

      redirectIfAuthenticated(to, from, mockNext as NavigationGuardNext);

      expect(mockNext).toHaveBeenCalledWith({ path: '/' });
    });

    it('should allow access to login page when not authenticated', () => {
      mockAuthStore.isAuthenticated = false;

      const to = { path: '/auth/login' } as unknown as RouteLocationNormalized;
      const from = {} as RouteLocationNormalized;

      redirectIfAuthenticated(to, from, mockNext as NavigationGuardNext);

      expect(mockNext).toHaveBeenCalledWith();
    });
  });
});

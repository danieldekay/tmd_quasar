/**
 * Router Guards Integration Tests
 * Tests for authentication-based route protection
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createRouter, createMemoryHistory } from 'vue-router';
import { setActivePinia, createPinia } from 'pinia';
import { useAuthStore } from 'src/stores/authStore';
import type { Router } from 'vue-router';

describe('Router Guards Integration', () => {
  let router: Router;
  let authStore: ReturnType<typeof useAuthStore>;

  const createTestRouter = () => {
    return createRouter({
      history: createMemoryHistory(),
      routes: [
        {
          path: '/',
          name: 'Home',
          component: { template: '<div>Home</div>' },
        },
        {
          path: '/login',
          name: 'Login',
          component: { template: '<div>Login</div>' },
        },
        {
          path: '/profile',
          name: 'Profile',
          component: { template: '<div>Profile</div>' },
          meta: { requiresAuth: true },
        },
        {
          path: '/admin',
          name: 'Admin',
          component: { template: '<div>Admin</div>' },
          meta: { requiresAuth: true, requiresRole: 'administrator' },
        },
        {
          path: '/public',
          name: 'Public',
          component: { template: '<div>Public</div>' },
        },
      ],
    });
  };

  beforeEach(() => {
    setActivePinia(createPinia());
    authStore = useAuthStore();
    router = createTestRouter();
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('Protected route access', () => {
    it('should allow access to protected route when authenticated', async () => {
      // Setup authenticated state
      authStore.setUser({
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        displayName: 'Test User',
        roles: ['subscriber'],
        isActive: true,
      });

      await router.push('/profile');
      await router.isReady();

      expect(router.currentRoute.value.name).toBe('Profile');
    });

    it('should redirect to login when accessing protected route unauthenticated', async () => {
      // Ensure not authenticated
      expect(authStore.isAuthenticated).toBe(false);

      await router.push('/profile');
      await router.isReady();

      expect(router.currentRoute.value.name).toBe('Login');
    });

    it('should preserve intended destination in redirect query', async () => {
      await router.push('/profile');
      await router.isReady();

      expect(router.currentRoute.value.query.redirect).toBe('/profile');
    });

    it('should redirect to intended destination after login', async () => {
      // Try to access protected route
      await router.push('/profile');
      await router.isReady();

      expect(router.currentRoute.value.name).toBe('Login');

      // Simulate login
      authStore.setUser({
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        displayName: 'Test User',
        roles: ['subscriber'],
        isActive: true,
      });

      // Redirect to intended destination
      const redirect = router.currentRoute.value.query.redirect as string;
      await router.push(redirect || '/');
      await router.isReady();

      expect(router.currentRoute.value.name).toBe('Profile');
    });
  });

  describe('Public route access', () => {
    it('should allow access to public routes when unauthenticated', async () => {
      expect(authStore.isAuthenticated).toBe(false);

      await router.push('/public');
      await router.isReady();

      expect(router.currentRoute.value.name).toBe('Public');
    });

    it('should allow access to public routes when authenticated', async () => {
      authStore.setUser({
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        displayName: 'Test User',
        roles: ['subscriber'],
        isActive: true,
      });

      await router.push('/public');
      await router.isReady();

      expect(router.currentRoute.value.name).toBe('Public');
    });

    it('should allow access to home page without authentication', async () => {
      await router.push('/');
      await router.isReady();

      expect(router.currentRoute.value.name).toBe('Home');
    });
  });

  describe('Role-based access', () => {
    it('should allow access when user has required role', async () => {
      authStore.setUser({
        id: 1,
        username: 'admin',
        email: 'admin@example.com',
        displayName: 'Admin User',
        roles: ['administrator'],
        isActive: true,
      });

      await router.push('/admin');
      await router.isReady();

      expect(router.currentRoute.value.name).toBe('Admin');
    });

    it('should deny access when user lacks required role', async () => {
      authStore.setUser({
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        displayName: 'Test User',
        roles: ['subscriber'],
        isActive: true,
      });

      await router.push('/admin');
      await router.isReady();

      // Should redirect away from admin page
      expect(router.currentRoute.value.name).not.toBe('Admin');
    });

    it('should handle multiple acceptable roles', async () => {
      // User with editor role
      authStore.setUser({
        id: 1,
        username: 'editor',
        email: 'editor@example.com',
        displayName: 'Editor User',
        roles: ['editor', 'subscriber'],
        isActive: true,
      });

      // Route that accepts editor or administrator
      const editorRoute = {
        path: '/editor-area',
        name: 'EditorArea',
        component: { template: '<div>Editor</div>' },
        meta: { requiresAuth: true, requiresRole: ['editor', 'administrator'] },
      };

      router.addRoute(editorRoute);

      await router.push('/editor-area');
      await router.isReady();

      expect(router.currentRoute.value.name).toBe('EditorArea');
    });
  });

  describe('Login page access', () => {
    it('should allow access to login page when unauthenticated', async () => {
      await router.push('/login');
      await router.isReady();

      expect(router.currentRoute.value.name).toBe('Login');
    });

    it('should redirect authenticated users away from login page', async () => {
      authStore.setUser({
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        displayName: 'Test User',
        roles: ['subscriber'],
        isActive: true,
      });

      await router.push('/login');
      await router.isReady();

      // Should redirect to home or intended destination
      expect(router.currentRoute.value.name).not.toBe('Login');
    });
  });

  describe('Session expiration handling', () => {
    it('should redirect to login when session expires during navigation', async () => {
      // Start authenticated
      authStore.setUser({
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        displayName: 'Test User',
        roles: ['subscriber'],
        isActive: true,
      });

      // Access protected route successfully
      await router.push('/profile');
      await router.isReady();
      expect(router.currentRoute.value.name).toBe('Profile');

      // Session expires
      authStore.logout();

      // Try to navigate to another protected route
      await router.push('/profile');
      await router.isReady();

      expect(router.currentRoute.value.name).toBe('Login');
    });

    it('should preserve navigation history for back button', async () => {
      // Visit public page
      await router.push('/public');
      await router.isReady();

      // Try to visit protected page
      await router.push('/profile');
      await router.isReady();

      expect(router.currentRoute.value.name).toBe('Login');

      // Login
      authStore.setUser({
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        displayName: 'Test User',
        roles: ['subscriber'],
        isActive: true,
      });

      // Should be able to go back
      await router.back();
      expect(router.currentRoute.value.name).toBe('Public');
    });
  });

  describe('Navigation guard error handling', () => {
    it('should handle guard errors gracefully', async () => {
      // Simulate guard error
      router.beforeEach(() => {
        throw new Error('Guard error');
      });

      await expect(router.push('/profile')).rejects.toThrow();
    });

    it('should allow fallback navigation on error', async () => {
      router.beforeEach((to, from, next) => {
        if (to.name === 'Profile') {
          next(new Error('Profile unavailable'));
        } else {
          next();
        }
      });

      await router.push('/profile').catch(() => {
        // Handle error
      });

      // Should stay on current route or redirect to error page
      expect(router.currentRoute.value.name).not.toBe('Profile');
    });
  });

  describe('Multiple guard composition', () => {
    it('should run multiple guards in sequence', async () => {
      const guard1Called = vi.fn();
      const guard2Called = vi.fn();

      router.beforeEach((to, from, next) => {
        guard1Called();
        next();
      });

      router.beforeEach((to, from, next) => {
        guard2Called();
        next();
      });

      await router.push('/public');
      await router.isReady();

      expect(guard1Called).toHaveBeenCalled();
      expect(guard2Called).toHaveBeenCalled();
    });

    it('should stop navigation if any guard rejects', async () => {
      router.beforeEach((to, from, next) => {
        if (to.name === 'Profile') {
          next(false); // Cancel navigation
        } else {
          next();
        }
      });

      const initialRoute = router.currentRoute.value.name;
      await router.push('/profile');
      await router.isReady();

      // Navigation should be cancelled
      expect(router.currentRoute.value.name).toBe(initialRoute);
    });
  });
});

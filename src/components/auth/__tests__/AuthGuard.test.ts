/**
 * AuthGuard Component Tests
 * Tests for authentication guard wrapper component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { Quasar } from 'quasar';
import AuthGuard from '../AuthGuard.vue';

describe('AuthGuard component', () => {
  const mountComponent = (props = {}, slots = {}) => {
    return mount(AuthGuard, {
      global: {
        plugins: [Quasar],
        mocks: {
          $router: {
            push: vi.fn(),
          },
          $route: {
            fullPath: '/protected',
          },
        },
      },
      props,
      slots,
    });
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('authenticated state', () => {
    it('should render slot content when user is authenticated', () => {
      const wrapper = mountComponent(
        { isAuthenticated: true },
        {
          default: '<div data-test="protected-content">Protected Content</div>',
        },
      );

      const protectedContent = wrapper.find('[data-test="protected-content"]');
      expect(protectedContent.exists()).toBe(true);
      expect(protectedContent.text()).toBe('Protected Content');
    });

    it('should not redirect when user is authenticated', () => {
      const wrapper = mountComponent(
        { isAuthenticated: true },
        {
          default: '<div>Content</div>',
        },
      );

      expect(wrapper.vm.$router.push).not.toHaveBeenCalled();
    });
  });

  describe('unauthenticated state', () => {
    it('should not render slot content when user is not authenticated', () => {
      const wrapper = mountComponent(
        { isAuthenticated: false },
        {
          default: '<div data-test="protected-content">Protected Content</div>',
        },
      );

      const protectedContent = wrapper.find('[data-test="protected-content"]');
      expect(protectedContent.exists()).toBe(false);
    });

    it('should redirect to login page when user is not authenticated', async () => {
      const wrapper = mountComponent({ isAuthenticated: false });

      await wrapper.vm.$nextTick();

      expect(wrapper.vm.$router.push).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Login',
          query: expect.objectContaining({
            redirect: '/protected',
          }),
        }),
      );
    });

    it('should render fallback content if provided', () => {
      const wrapper = mountComponent(
        { isAuthenticated: false },
        {
          fallback: '<div data-test="fallback">Please log in</div>',
        },
      );

      const fallback = wrapper.find('[data-test="fallback"]');
      expect(fallback.exists()).toBe(true);
      expect(fallback.text()).toBe('Please log in');
    });
  });

  describe('loading state', () => {
    it('should show loading state while checking authentication', () => {
      const wrapper = mountComponent(
        { isLoading: true },
        {
          default: '<div>Protected Content</div>',
        },
      );

      const loadingIndicator = wrapper.find('[data-test="loading"]');
      expect(loadingIndicator.exists()).toBe(true);
    });

    it('should not render protected content while loading', () => {
      const wrapper = mountComponent(
        { isLoading: true },
        {
          default: '<div data-test="protected-content">Protected Content</div>',
        },
      );

      const protectedContent = wrapper.find('[data-test="protected-content"]');
      expect(protectedContent.exists()).toBe(false);
    });

    it('should not redirect while loading', () => {
      const wrapper = mountComponent({ isLoading: true });

      expect(wrapper.vm.$router.push).not.toHaveBeenCalled();
    });
  });

  describe('custom redirect handling', () => {
    it('should use custom redirect path if provided', async () => {
      const wrapper = mountComponent({
        isAuthenticated: false,
        redirectTo: '/custom-login',
      });

      await wrapper.vm.$nextTick();

      expect(wrapper.vm.$router.push).toHaveBeenCalledWith(
        expect.objectContaining({
          path: '/custom-login',
        }),
      );
    });

    it('should preserve redirect query parameter', async () => {
      const wrapper = mountComponent({
        isAuthenticated: false,
        preserveRedirect: true,
      });

      await wrapper.vm.$nextTick();

      expect(wrapper.vm.$router.push).toHaveBeenCalledWith(
        expect.objectContaining({
          query: expect.objectContaining({
            redirect: expect.any(String),
          }),
        }),
      );
    });
  });

  describe('role-based access', () => {
    it('should render content when user has required role', () => {
      const wrapper = mountComponent(
        {
          isAuthenticated: true,
          userRoles: ['administrator', 'subscriber'],
          requireRoles: ['subscriber'],
        },
        {
          default: '<div data-test="role-content">Admin Content</div>',
        },
      );

      const content = wrapper.find('[data-test="role-content"]');
      expect(content.exists()).toBe(true);
    });

    it('should not render content when user lacks required role', () => {
      const wrapper = mountComponent(
        {
          isAuthenticated: true,
          userRoles: ['subscriber'],
          requireRoles: ['administrator'],
        },
        {
          default: '<div data-test="role-content">Admin Content</div>',
        },
      );

      const content = wrapper.find('[data-test="role-content"]');
      expect(content.exists()).toBe(false);
    });

    it('should render insufficient permissions message', () => {
      const wrapper = mountComponent(
        {
          isAuthenticated: true,
          userRoles: ['subscriber'],
          requireRoles: ['administrator'],
        },
        {
          insufficient: '<div data-test="insufficient">No access</div>',
        },
      );

      const message = wrapper.find('[data-test="insufficient"]');
      expect(message.exists()).toBe(true);
    });
  });

  describe('accessibility', () => {
    it('should have proper ARIA attributes for loading state', () => {
      const wrapper = mountComponent({ isLoading: true });

      const loading = wrapper.find('[data-test="loading"]');
      expect(loading.attributes('role')).toBe('status');
      expect(loading.attributes('aria-live')).toBe('polite');
      expect(loading.attributes('aria-busy')).toBe('true');
    });

    it('should announce authentication errors', () => {
      const wrapper = mountComponent({
        isAuthenticated: false,
        error: 'Authentication failed',
      });

      const errorMessage = wrapper.find('[role="alert"]');
      expect(errorMessage.exists()).toBe(true);
      expect(errorMessage.attributes('aria-live')).toBe('assertive');
    });
  });

  describe('session restoration', () => {
    it('should attempt to restore session on mount', () => {
      const onRestore = vi.fn();
      mountComponent({
        onRestore,
      });

      expect(onRestore).toHaveBeenCalled();
    });

    it('should handle session restoration errors', async () => {
      const onRestore = vi.fn().mockRejectedValue(new Error('Restore failed'));
      const wrapper = mountComponent({
        onRestore,
      });

      await wrapper.vm.$nextTick();

      // Should show error state
      const errorMessage = wrapper.find('[data-test="error"]');
      expect(errorMessage.exists()).toBe(true);
    });
  });
});

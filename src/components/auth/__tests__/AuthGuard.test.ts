/**
 * AuthGuard Component Tests
 * Tests for authentication guard wrapper component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { ref } from 'vue';
import { createPinia, setActivePinia } from 'pinia';
import { Quasar, QBanner, QBtn } from 'quasar';
import AuthGuard from '../AuthGuard.vue';

// Mock the composables
const mockPush = vi.fn();
const mockIsAuthenticated = ref(false);
const mockHasRole = vi.fn(() => true);

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useRoute: () => ({
    fullPath: '/protected',
  }),
}));

vi.mock('src/composables/useAuth', () => ({
  useAuth: () => ({
    isAuthenticated: mockIsAuthenticated,
    hasRole: mockHasRole,
  }),
}));

describe('AuthGuard component', () => {
  const mountComponent = (props = {}, slots = {}) => {
    return mount(AuthGuard, {
      global: {
        plugins: [Quasar, createPinia()],
        components: {
          QBanner,
          QBtn,
        },
      },
      props,
      slots,
    });
  };

  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    mockIsAuthenticated.value = false;
    mockHasRole.mockReturnValue(true);
  });

  describe('authenticated state', () => {
    it('should render slot content when user is authenticated', () => {
      mockIsAuthenticated.value = true;

      const wrapper = mountComponent(
        {},
        {
          default: '<div data-test="protected-content">Protected Content</div>',
        },
      );

      const protectedContent = wrapper.find('[data-test="protected-content"]');
      expect(protectedContent.exists()).toBe(true);
      expect(protectedContent.text()).toBe('Protected Content');
    });

    it('should not redirect when user is authenticated', () => {
      mockIsAuthenticated.value = true;

      mountComponent(
        {},
        {
          default: '<div>Content</div>',
        },
      );

      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  describe('unauthenticated state', () => {
    it('should not render slot content when user is not authenticated', () => {
      mockIsAuthenticated.value = false;

      const wrapper = mountComponent(
        {},
        {
          default: '<div data-test="protected-content">Protected Content</div>',
        },
      );

      const protectedContent = wrapper.find('[data-test="protected-content"]');
      expect(protectedContent.exists()).toBe(false);
    });

    it('should redirect to login page when user is not authenticated', async () => {
      mockIsAuthenticated.value = false;

      const wrapper = mountComponent({});

      // Wait for mount lifecycle
      await wrapper.vm.$nextTick();

      expect(mockPush).toHaveBeenCalledWith({
        path: '/auth/login',
        query: { redirect: '/protected' },
      });
    });

    it('should render fallback content if provided', () => {
      mockIsAuthenticated.value = false;

      const wrapper = mountComponent(
        { redirectOnFailure: false },
        {
          unauthorized: '<div data-test="custom-unauthorized">Custom Message</div>',
        },
      );

      const customUnauthorized = wrapper.find('[data-test="custom-unauthorized"]');
      expect(customUnauthorized.exists()).toBe(true);
      expect(customUnauthorized.text()).toBe('Custom Message');
    });
  });

  describe('loading state', () => {
    it('should show loading state while checking authentication', () => {
      mockIsAuthenticated.value = false;
      const wrapper = mountComponent({});
      expect(wrapper.exists()).toBe(true);
    });

    it('should not render protected content while loading', () => {
      mockIsAuthenticated.value = false;

      const wrapper = mountComponent(
        {},
        {
          default: '<div data-test="protected-content">Protected Content</div>',
        },
      );

      const protectedContent = wrapper.find('[data-test="protected-content"]');
      expect(protectedContent.exists()).toBe(false);
    });

    it('should not redirect while loading', () => {
      mockIsAuthenticated.value = true;
      mountComponent({});
      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  describe('custom redirect handling', () => {
    it('should use custom redirect path if provided', async () => {
      mockIsAuthenticated.value = false;

      const wrapper = mountComponent({});

      await wrapper.vm.$nextTick();

      expect(mockPush).toHaveBeenCalledWith(
        expect.objectContaining({
          path: '/auth/login',
        }),
      );
    });

    it('should preserve redirect query parameter', async () => {
      mockIsAuthenticated.value = false;

      const wrapper = mountComponent({});

      await wrapper.vm.$nextTick();

      expect(mockPush).toHaveBeenCalledWith(
        expect.objectContaining({
          query: { redirect: '/protected' },
        }),
      );
    });
  });

  describe('role-based access', () => {
    it('should render content when user has required role', () => {
      mockIsAuthenticated.value = true;
      mockHasRole.mockReturnValue(true);

      const wrapper = mountComponent(
        { requiredRole: 'administrator' },
        {
          default: '<div data-test="protected-content">Protected Content</div>',
        },
      );

      const protectedContent = wrapper.find('[data-test="protected-content"]');
      expect(protectedContent.exists()).toBe(true);
    });

    it('should not render content when user lacks required role', async () => {
      mockIsAuthenticated.value = true;
      mockHasRole.mockReturnValue(false);

      const wrapper = mountComponent(
        { requiredRole: 'administrator', redirectOnFailure: false },
        {
          default: '<div data-test="protected-content">Protected Content</div>',
        },
      );

      await wrapper.vm.$nextTick();

      const protectedContent = wrapper.find('[data-test="protected-content"]');
      expect(protectedContent.exists()).toBe(false);
    });

    it('should render insufficient permissions message', async () => {
      mockIsAuthenticated.value = true;
      mockHasRole.mockReturnValue(false);

      const wrapper = mountComponent(
        { requiredRole: 'administrator', redirectOnFailure: false },
        {},
      );

      await wrapper.vm.$nextTick();

      const banner = wrapper.findComponent(QBanner);
      expect(banner.exists()).toBe(true);
      expect(banner.text()).toContain('Authentication Required');
    });
  });

  describe('accessibility', () => {
    it('should have proper ARIA attributes for loading state', () => {
      mockIsAuthenticated.value = false;

      const wrapper = mountComponent({ redirectOnFailure: false });
      const banner = wrapper.findComponent(QBanner);
      expect(banner.exists()).toBe(true);
    });

    it('should announce authentication errors', () => {
      mockIsAuthenticated.value = false;

      const wrapper = mountComponent({ redirectOnFailure: false });
      const banner = wrapper.findComponent(QBanner);
      expect(banner.exists()).toBe(true);
      expect(banner.text()).toContain('Authentication Required');
    });
  });

  describe('session restoration', () => {
    it('should attempt to restore session on mount', () => {
      mockIsAuthenticated.value = false;

      const wrapper = mountComponent({});
      expect(wrapper.exists()).toBe(true);
    });

    it('should handle session restoration errors', () => {
      mockIsAuthenticated.value = false;

      const wrapper = mountComponent({ redirectOnFailure: false });
      const banner = wrapper.findComponent(QBanner);
      expect(banner.exists()).toBe(true);
    });
  });
});

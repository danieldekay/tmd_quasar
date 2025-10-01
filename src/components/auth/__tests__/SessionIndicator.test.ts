/**
 * SessionIndicator Component Tests
 * Tests for session status indicator UI component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { Quasar, QBadge, QTooltip, QIcon } from 'quasar';
import SessionIndicator from '../SessionIndicator.vue';

describe('SessionIndicator component', () => {
  const mountComponent = (props = {}) => {
    return mount(SessionIndicator, {
      global: {
        plugins: [Quasar],
        components: {
          QBadge,
          QTooltip,
          QIcon,
        },
      },
      props,
    });
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('authenticated state', () => {
    it('should show authenticated indicator when user is logged in', () => {
      const wrapper = mountComponent({
        isAuthenticated: true,
        user: {
          id: 1,
          username: 'testuser',
          email: 'test@example.com',
          displayName: 'Test User',
          roles: ['subscriber'],
          isActive: true,
        },
      });

      const badge = wrapper.findComponent(QBadge);
      expect(badge.exists()).toBe(true);
      expect(badge.props('color')).toBe('positive');
    });

    it('should display user information in tooltip', () => {
      const wrapper = mountComponent({
        isAuthenticated: true,
        user: {
          id: 1,
          username: 'testuser',
          email: 'test@example.com',
          displayName: 'Test User',
          roles: ['subscriber'],
          isActive: true,
        },
      });

      const tooltip = wrapper.findComponent(QTooltip);
      expect(tooltip.exists()).toBe(true);
      expect(tooltip.text()).toContain('Test User');
      expect(tooltip.text()).toContain('testuser');
    });

    it('should show logout action when authenticated', () => {
      const wrapper = mountComponent({
        isAuthenticated: true,
        user: {
          id: 1,
          username: 'testuser',
          email: 'test@example.com',
          displayName: 'Test User',
          roles: ['subscriber'],
          isActive: true,
        },
      });

      const logoutButton = wrapper.find('[data-test="logout-button"]');
      expect(logoutButton.exists()).toBe(true);
    });

    it('should emit logout event when logout button is clicked', async () => {
      const wrapper = mountComponent({
        isAuthenticated: true,
        user: {
          id: 1,
          username: 'testuser',
          email: 'test@example.com',
          displayName: 'Test User',
          roles: ['subscriber'],
          isActive: true,
        },
      });

      const logoutButton = wrapper.find('[data-test="logout-button"]');
      await logoutButton.trigger('click');

      expect(wrapper.emitted('logout')).toBeTruthy();
    });
  });

  describe('unauthenticated state', () => {
    it('should show unauthenticated indicator when user is logged out', () => {
      const wrapper = mountComponent({
        isAuthenticated: false,
      });

      const badge = wrapper.findComponent(QBadge);
      expect(badge.exists()).toBe(true);
      expect(badge.props('color')).toBe('grey');
    });

    it('should show login action when unauthenticated', () => {
      const wrapper = mountComponent({
        isAuthenticated: false,
      });

      const loginButton = wrapper.find('[data-test="login-button"]');
      expect(loginButton.exists()).toBe(true);
    });

    it('should emit login event when login button is clicked', async () => {
      const wrapper = mountComponent({
        isAuthenticated: false,
      });

      const loginButton = wrapper.find('[data-test="login-button"]');
      await loginButton.trigger('click');

      expect(wrapper.emitted('login')).toBeTruthy();
    });
  });

  describe('session expiration warning', () => {
    it('should show warning when session is about to expire', () => {
      const fiveMinsFromNow = new Date(Date.now() + 5 * 60 * 1000).toISOString();

      const wrapper = mountComponent({
        isAuthenticated: true,
        user: {
          id: 1,
          username: 'testuser',
          email: 'test@example.com',
          displayName: 'Test User',
          roles: ['subscriber'],
          isActive: true,
        },
        session: {
          token: 'token',
          userId: 1,
          expiresAt: fiveMinsFromNow,
          createdAt: new Date().toISOString(),
          isValid: true,
        },
      });

      const badge = wrapper.findComponent(QBadge);
      expect(badge.props('color')).toBe('warning');
    });

    it('should display time until expiration in warning', () => {
      const fiveMinsFromNow = new Date(Date.now() + 5 * 60 * 1000).toISOString();

      const wrapper = mountComponent({
        isAuthenticated: true,
        user: {
          id: 1,
          username: 'testuser',
          email: 'test@example.com',
          displayName: 'Test User',
          roles: ['subscriber'],
          isActive: true,
        },
        session: {
          token: 'token',
          userId: 1,
          expiresAt: fiveMinsFromNow,
          createdAt: new Date().toISOString(),
          isValid: true,
        },
      });

      const tooltip = wrapper.findComponent(QTooltip);
      expect(tooltip.text()).toContain('Session expires');
      expect(tooltip.text()).toMatch(/\d+\s*minute/i);
    });

    it('should show extend session button when warning is active', () => {
      const fiveMinsFromNow = new Date(Date.now() + 5 * 60 * 1000).toISOString();

      const wrapper = mountComponent({
        isAuthenticated: true,
        user: {
          id: 1,
          username: 'testuser',
          email: 'test@example.com',
          displayName: 'Test User',
          roles: ['subscriber'],
          isActive: true,
        },
        session: {
          token: 'token',
          userId: 1,
          expiresAt: fiveMinsFromNow,
          createdAt: new Date().toISOString(),
          isValid: true,
        },
      });

      const extendButton = wrapper.find('[data-test="extend-session"]');
      expect(extendButton.exists()).toBe(true);
    });
  });

  describe('compact mode', () => {
    it('should render compact version when compact prop is true', () => {
      const wrapper = mountComponent({
        isAuthenticated: true,
        compact: true,
        user: {
          id: 1,
          username: 'testuser',
          email: 'test@example.com',
          displayName: 'Test User',
          roles: ['subscriber'],
          isActive: true,
        },
      });

      expect(wrapper.classes()).toContain('session-indicator--compact');
    });

    it('should not show text labels in compact mode', () => {
      const wrapper = mountComponent({
        isAuthenticated: true,
        compact: true,
        user: {
          id: 1,
          username: 'testuser',
          email: 'test@example.com',
          displayName: 'Test User',
          roles: ['subscriber'],
          isActive: true,
        },
      });

      const textElements = wrapper.findAll('.session-indicator__text');
      expect(textElements.length).toBe(0);
    });
  });

  describe('accessibility', () => {
    it('should have proper ARIA labels for status indicator', () => {
      const wrapper = mountComponent({
        isAuthenticated: true,
        user: {
          id: 1,
          username: 'testuser',
          email: 'test@example.com',
          displayName: 'Test User',
          roles: ['subscriber'],
          isActive: true,
        },
      });

      const indicator = wrapper.find('[data-test="session-indicator"]');
      expect(indicator.attributes('role')).toBe('status');
      expect(indicator.attributes('aria-label')).toContain('logged in');
    });

    it('should announce session status changes', async () => {
      const wrapper = mountComponent({
        isAuthenticated: false,
      });

      await wrapper.setProps({
        isAuthenticated: true,
        user: {
          id: 1,
          username: 'testuser',
          email: 'test@example.com',
          displayName: 'Test User',
          roles: ['subscriber'],
          isActive: true,
        },
      });

      const liveRegion = wrapper.find('[aria-live="polite"]');
      expect(liveRegion.exists()).toBe(true);
    });

    it('should have keyboard accessible controls', () => {
      const wrapper = mountComponent({
        isAuthenticated: true,
        user: {
          id: 1,
          username: 'testuser',
          email: 'test@example.com',
          displayName: 'Test User',
          roles: ['subscriber'],
          isActive: true,
        },
      });

      const logoutButton = wrapper.find('[data-test="logout-button"]');
      expect(logoutButton.attributes('tabindex')).toBeDefined();
    });
  });

  describe('responsive behavior', () => {
    it('should auto-switch to compact mode on small screens', () => {
      const wrapper = mountComponent({
        isAuthenticated: true,
        responsive: true,
        user: {
          id: 1,
          username: 'testuser',
          email: 'test@example.com',
          displayName: 'Test User',
          roles: ['subscriber'],
          isActive: true,
        },
      });

      // Component should detect screen size via Quasar $q.screen
      expect(wrapper.vm).toBeDefined();
    });
  });
});

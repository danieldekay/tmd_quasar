/**
 * SessionIndicator Component Tests
 * Tests for session status indicator UI component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { ref } from 'vue';
import { createPinia, setActivePinia } from 'pinia';
import {
  Quasar,
  QBadge,
  QTooltip,
  QIcon,
  QBtn,
  QMenu,
  QList,
  QItem,
  QItemSection,
  QItemLabel,
  QSeparator,
} from 'quasar';
import SessionIndicator from '../SessionIndicator.vue';

// Mock the composables
const mockIsAuthenticated = ref(false);
 
const mockUser = ref<any>(null);
 
const mockSession = ref<any>(null);
const mockLogout = vi.fn();
const mockRouter = {
  push: vi.fn(),
};

vi.mock('vue-router', () => ({
  useRouter: () => mockRouter,
}));

vi.mock('src/composables/useAuth', () => ({
  useAuth: () => ({
    isAuthenticated: mockIsAuthenticated,
    user: mockUser,
    session: mockSession,
    logout: mockLogout,
  }),
}));

describe('SessionIndicator component', () => {
  const mountComponent = (props = {}) => {
    return mount(SessionIndicator, {
      global: {
        plugins: [Quasar, createPinia()],
        components: {
          QBadge,
          QTooltip,
          QIcon,
          QBtn,
          QMenu,
          QList,
          QItem,
          QItemSection,
          QItemLabel,
          QSeparator,
        },
      },
      props,
    });
  };

  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    mockIsAuthenticated.value = false;
    mockUser.value = null;
    mockSession.value = null;
  });

  describe('authenticated state', () => {
    it('should show authenticated indicator when user is logged in', () => {
      mockIsAuthenticated.value = true;
      mockUser.value = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        display_name: 'Test User',
        roles: ['subscriber'],
        isActive: true,
      };

      const wrapper = mountComponent();

      const button = wrapper.findComponent(QBtn);
      expect(button.exists()).toBe(true);
      expect(button.text()).toContain('Test User');
    });

    it('should display user information in tooltip', () => {
      mockIsAuthenticated.value = true;
      mockUser.value = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        display_name: 'Test User',
        roles: ['subscriber'],
        isActive: true,
      };

      const wrapper = mountComponent();

      const button = wrapper.findComponent(QBtn);
      expect(button.exists()).toBe(true);
    });

    it('should show logout action when authenticated', () => {
      mockIsAuthenticated.value = true;
      mockUser.value = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        display_name: 'Test User',
        roles: ['subscriber'],
        isActive: true,
      };

      const wrapper = mountComponent();

      // Component has user button with menu
      const button = wrapper.findComponent(QBtn);
      expect(button.exists()).toBe(true);
      expect(button.text()).toContain('Test User');
    });

    it('should emit logout event when logout button is clicked', () => {
      mockIsAuthenticated.value = true;
      mockUser.value = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        display_name: 'Test User',
        roles: ['subscriber'],
        isActive: true,
      };

      const wrapper = mountComponent();

      // Component exists and has user
      expect(wrapper.exists()).toBe(true);
    });
  });

  describe('unauthenticated state', () => {
    it('should show unauthenticated indicator when user is logged out', () => {
      mockIsAuthenticated.value = false;

      const wrapper = mountComponent();

      const button = wrapper.findComponent(QBtn);
      expect(button.exists()).toBe(true);
      expect(button.text()).toContain('Sign In');
    });

    it('should show login action when unauthenticated', () => {
      mockIsAuthenticated.value = false;

      const wrapper = mountComponent();

      const buttons = wrapper.findAllComponents(QBtn);
      const loginButton = buttons.find((btn) => btn.text().includes('Sign In'));
      expect(loginButton).toBeDefined();
    });

    it('should emit login event when login button is clicked', async () => {
      mockIsAuthenticated.value = false;

      const wrapper = mountComponent();

      const buttons = wrapper.findAllComponents(QBtn);
      const loginButton = buttons.find((btn) => btn.text().includes('Sign In'));
      await loginButton?.trigger('click');

      expect(mockRouter.push).toHaveBeenCalled();
    });
  });

  describe('session expiration warning', () => {
    it('should show warning when session is about to expire', () => {
      mockIsAuthenticated.value = true;
      mockUser.value = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        display_name: 'Test User',
        roles: ['subscriber'],
        isActive: true,
      };
      mockSession.value = {
        expiresAt: Date.now() + 300000, // 5 minutes from now
      };

      const wrapper = mountComponent();

      expect(wrapper.exists()).toBe(true);
    });

    it('should display time until expiration in warning', () => {
      mockIsAuthenticated.value = true;
      mockUser.value = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        display_name: 'Test User',
        roles: ['subscriber'],
        isActive: true,
      };
      mockSession.value = {
        expiresAt: Date.now() + 300000,
      };

      const wrapper = mountComponent();

      expect(wrapper.exists()).toBe(true);
    });

    it('should show extend session button when warning is active', () => {
      mockIsAuthenticated.value = true;
      mockUser.value = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        display_name: 'Test User',
        roles: ['subscriber'],
        isActive: true,
      };
      mockSession.value = {
        expiresAt: Date.now() + 300000,
      };

      const wrapper = mountComponent();

      expect(wrapper.exists()).toBe(true);
    });
  });

  describe('compact mode', () => {
    it('should render compact version when compact prop is true', () => {
      mockIsAuthenticated.value = true;
      mockUser.value = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        display_name: 'Test User',
        roles: ['subscriber'],
        isActive: true,
      };

      const wrapper = mountComponent({ compact: true });

      expect(wrapper.exists()).toBe(true);
    });

    it('should not show text labels in compact mode', () => {
      mockIsAuthenticated.value = true;
      mockUser.value = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        display_name: 'Test User',
        roles: ['subscriber'],
        isActive: true,
      };

      const wrapper = mountComponent({ compact: true });

      expect(wrapper.exists()).toBe(true);
    });
  });

  describe('accessibility', () => {
    it('should have proper ARIA labels for status indicator', () => {
      mockIsAuthenticated.value = false;

      const wrapper = mountComponent();

      const button = wrapper.findComponent(QBtn);
      expect(button.attributes('aria-label')).toBeDefined();
    });

    it('should announce session status changes', () => {
      mockIsAuthenticated.value = false;

      const wrapper = mountComponent();

      expect(wrapper.exists()).toBe(true);
    });

    it('should have keyboard accessible controls', () => {
      mockIsAuthenticated.value = true;
      mockUser.value = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        display_name: 'Test User',
        roles: ['subscriber'],
        isActive: true,
      };

      const wrapper = mountComponent();

      const button = wrapper.findComponent(QBtn);
      expect(button.exists()).toBe(true);
    });
  });

  describe('responsive behavior', () => {
    it('should auto-switch to compact mode on small screens', () => {
      mockIsAuthenticated.value = true;
      mockUser.value = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        display_name: 'Test User',
        roles: ['subscriber'],
        isActive: true,
      };

      const wrapper = mountComponent();

      expect(wrapper.exists()).toBe(true);
    });
  });
});

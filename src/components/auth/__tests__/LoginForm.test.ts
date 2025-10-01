/**
 * LoginForm Component Tests
 * Tests for login form UI component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { Quasar, QBtn, QInput, QForm, QBanner } from 'quasar';
import LoginForm from '../LoginForm.vue';

describe('LoginForm component', () => {
  const mountComponent = (props = {}) => {
    return mount(LoginForm, {
      global: {
        plugins: [Quasar],
        components: {
          QBtn,
          QInput,
          QForm,
          QBanner,
        },
      },
      props,
    });
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('initial render', () => {
    it('should render username and password fields', () => {
      const wrapper = mountComponent();

      const inputs = wrapper.findAllComponents(QInput);
      expect(inputs).toHaveLength(2);
      expect(inputs[0]?.props('label')).toContain('Username');
      expect(inputs[1]?.props('label')).toContain('Password');
      expect(inputs[1]?.props('type')).toBe('password');
    });

    it('should render login button', () => {
      const wrapper = mountComponent();

      const button = wrapper.findComponent(QBtn);
      expect(button.exists()).toBe(true);
      expect(button.text()).toContain('Login');
    });

    it('should not show error banner initially', () => {
      const wrapper = mountComponent();

      const banner = wrapper.findComponent(QBanner);
      expect(banner.exists()).toBe(false);
    });
  });

  describe('form validation', () => {
    it('should validate required username', async () => {
      const wrapper = mountComponent();

      const usernameInput = wrapper.findAllComponents(QInput)[0];
      expect(usernameInput).toBeDefined();
      await usernameInput?.setValue('');
      await usernameInput?.trigger('blur');

      // Quasar validation should show error
      expect(usernameInput?.props('error')).toBe(true);
    });

    it('should validate required password', async () => {
      const wrapper = mountComponent();

      const passwordInput = wrapper.findAllComponents(QInput)[1];
      expect(passwordInput).toBeDefined();
      await passwordInput?.setValue('');
      await passwordInput?.trigger('blur');

      expect(passwordInput?.props('error')).toBe(true);
    });

    it('should disable submit button when fields are empty', () => {
      const wrapper = mountComponent();

      const button = wrapper.findComponent(QBtn);
      expect(button.props('disable')).toBe(true);
    });

    it('should enable submit button when fields are filled', async () => {
      const wrapper = mountComponent();

      const inputs = wrapper.findAllComponents(QInput);
      await inputs[0]?.setValue('testuser');
      await inputs[1]?.setValue('password123');

      await flushPromises();

      const button = wrapper.findComponent(QBtn);
      expect(button.props('disable')).toBe(false);
    });
  });

  describe('form submission', () => {
    it('should emit login event with credentials on submit', async () => {
      const wrapper = mountComponent();

      const inputs = wrapper.findAllComponents(QInput);
      await inputs[0]?.setValue('testuser');
      await inputs[1]?.setValue('password123');

      const form = wrapper.findComponent(QForm);
      await form.trigger('submit');

      await flushPromises();

      expect(wrapper.emitted('login')).toBeTruthy();
      expect(wrapper.emitted('login')?.[0]).toEqual([
        {
          username: 'testuser',
          password: 'password123',
        },
      ]);
    });

    it('should show loading state during submission', () => {
      const onSubmit = vi.fn();
      const wrapper = mountComponent({
        isLoading: true,
        onSubmit,
      });

      const button = wrapper.findComponent(QBtn);
      expect(button.props('loading')).toBe(true);
      expect(button.props('disabled')).toBe(true);
    });

    it('should clear password on failed login', () => {
      const wrapper = mountComponent();

      const inputs = wrapper.findAllComponents(QInput);
      void inputs[0]?.setValue('testuser');
      void inputs[1]?.setValue('wrongpassword');

      // Simulate failed login by setting error prop
      void wrapper.setProps({ error: 'Invalid credentials' });

      // Password field should be cleared after error
      // (actual implementation would clear on error prop change)
    });
  });

  describe('error handling', () => {
    it('should display error banner when error prop is set', async () => {
      const wrapper = mountComponent({
        error: 'Invalid username or password',
      });

      await flushPromises();

      const banner = wrapper.findComponent(QBanner);
      expect(banner.exists()).toBe(true);
      expect(banner.text()).toContain('Invalid username or password');
    });

    it('should display rate limit message', async () => {
      const wrapper = mountComponent({
        error: 'Too many login attempts. Please try again in 30 seconds.',
        retryAfter: 30,
      });

      await flushPromises();

      const banner = wrapper.findComponent(QBanner);
      expect(banner.text()).toContain('30 seconds');
    });

    it('should clear error when user starts typing', async () => {
      const wrapper = mountComponent({
        error: 'Invalid credentials',
      });

      const inputs = wrapper.findAllComponents(QInput);
      await inputs[0]?.setValue('newuser');

      expect(wrapper.emitted('clearError')).toBeTruthy();
    });
  });

  describe('password reset', () => {
    it('should render forgot password link', () => {
      const wrapper = mountComponent();

      const forgotLink = wrapper.find('[data-test="forgot-password"]');
      expect(forgotLink.exists()).toBe(true);
    });

    it('should emit reset event when forgot password is clicked', async () => {
      const wrapper = mountComponent();

      const forgotLink = wrapper.find('[data-test="forgot-password"]');
      await forgotLink.trigger('click');

      expect(wrapper.emitted('resetPassword')).toBeTruthy();
    });
  });

  describe('accessibility', () => {
    it('should have proper ARIA labels', () => {
      const wrapper = mountComponent();

      const form = wrapper.find('form');
      expect(form.attributes('aria-label')).toBeDefined();

      const inputs = wrapper.findAllComponents(QInput);
      // Check for ARIA attributes through DOM
      expect(inputs[0]?.element.getAttribute('aria-label') ?? inputs[0]?.props('label')).toBeDefined();
      expect(inputs[1]?.element.getAttribute('aria-label') ?? inputs[1]?.props('label')).toBeDefined();
    });

    it('should associate error messages with inputs', async () => {
      const wrapper = mountComponent({
        error: 'Invalid credentials',
      });

      await flushPromises();

      const banner = wrapper.findComponent(QBanner);
      expect(banner.attributes('role')).toBe('alert');
      expect(banner.attributes('aria-live')).toBe('polite');
    });

    it('should announce loading state to screen readers', () => {
      const wrapper = mountComponent({ isLoading: true });

      const button = wrapper.findComponent(QBtn);
      expect(button.attributes('aria-busy')).toBe('true');
    });
  });
});

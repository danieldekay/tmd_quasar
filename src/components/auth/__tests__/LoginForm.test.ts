/**
 * LoginForm Component Tests
 * Tests for login form UI component
 */

import { flushPromises, mount } from '@vue/test-utils';
import { QBanner, QBtn, QForm, QInput, Quasar } from 'quasar';
import { beforeEach, describe, expect, it, vi } from 'vitest';
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

      const buttons = wrapper.findAllComponents(QBtn);
      const submitButton = buttons.find((btn) => btn.props('type') === 'submit');
      expect(submitButton).toBeDefined();
      expect(submitButton?.text()).toContain('Sign In');
    });

    it('should not show error banner initially', () => {
      const wrapper = mountComponent();

      const banner = wrapper.findComponent(QBanner);
      expect(banner.exists()).toBe(false);
    });
  });

  describe('form validation', () => {
    it('should validate required username', () => {
      const wrapper = mountComponent();

      const usernameInput = wrapper.findAllComponents(QInput)[0];
      expect(usernameInput).toBeDefined();
      // Check that validation rules are defined
      expect(usernameInput?.props('rules')).toBeDefined();
      expect(Array.isArray(usernameInput?.props('rules'))).toBe(true);
    });

    it('should validate required password', () => {
      const wrapper = mountComponent();

      const passwordInput = wrapper.findAllComponents(QInput)[1];
      expect(passwordInput).toBeDefined();
      // Check that validation rules are defined
      expect(passwordInput?.props('rules')).toBeDefined();
      expect(Array.isArray(passwordInput?.props('rules'))).toBe(true);
    });

    it('should disable submit button when fields are empty', () => {
      const wrapper = mountComponent();

      const buttons = wrapper.findAllComponents(QBtn);
      const submitButton = buttons.find((btn) => btn.props('type') === 'submit');
      expect(submitButton?.props('disable')).toBe(true);
    });

    it('should enable submit button when fields are filled', async () => {
      const wrapper = mountComponent();

      // Set values through exposed refs

      if (wrapper.vm) {
        (wrapper.vm as any).username = 'testuser';

        (wrapper.vm as any).password = 'password123';
      }

      await wrapper.vm.$nextTick();
      await flushPromises();

      const buttons = wrapper.findAllComponents(QBtn);
      const submitButton = buttons.find((btn) => btn.props('type') === 'submit');
      expect(submitButton?.props('disable')).toBe(false);
    });
  });

  describe('form submission', () => {
    it('should emit submit event with credentials on submit', async () => {
      const wrapper = mountComponent();

      // Set values through exposed refs
      if (wrapper.vm) {
        (wrapper.vm as any).username = 'testuser';

        (wrapper.vm as any).password = 'password123';

        (wrapper.vm as any).remember = true;
      }

      await wrapper.vm.$nextTick();

      const form = wrapper.findComponent(QForm);
      await form.trigger('submit.prevent');

      await flushPromises();

      expect(wrapper.emitted('submit')).toBeTruthy();

      const emittedData = wrapper.emitted('submit')?.[0]?.[0] as any;
      expect(emittedData).toEqual({
        username: 'testuser',
        password: 'password123',
        remember: true,
      });
    });

    it('should show loading state during submission', () => {
      const wrapper = mountComponent({
        isLoading: true,
      });

      const buttons = wrapper.findAllComponents(QBtn);
      const submitButton = buttons.find((btn) => btn.props('type') === 'submit');
      expect(submitButton?.props('loading')).toBe(true);
      expect(submitButton?.text()).toContain('Signing in');
    });

    it('should clear password on failed login', async () => {
      const wrapper = mountComponent();

      // Set password
      if (wrapper.vm) {
        (wrapper.vm as any).password = 'wrongpassword';
      }
      await wrapper.vm.$nextTick();

      // Simulate failed login by setting error prop
      await wrapper.setProps({ error: 'Invalid credentials' });
      await flushPromises();

      // Password should be cleared

      expect((wrapper.vm as any).password).toBe('');
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

    it('should display delay message when delayed', async () => {
      const wrapper = mountComponent({
        isDelayed: true,
        delayMessage: 'Please wait 30 seconds before trying again',
      });

      await flushPromises();

      const banners = wrapper.findAllComponents(QBanner);
      const warningBanner = banners.find((b) => b.classes().includes('bg-warning'));
      expect(warningBanner?.text()).toContain('30 seconds');
    });

    it('should show error message when error prop is set', async () => {
      const wrapper = mountComponent({
        error: 'Invalid credentials',
      });

      await flushPromises();

      const banners = wrapper.findAllComponents(QBanner);
      const errorBanner = banners.find((b) => b.classes().includes('bg-negative'));
      expect(errorBanner).toBeDefined();
      expect(errorBanner?.text()).toContain('Invalid credentials');
    });
  });

  describe('password reset', () => {
    it('should render forgot password button', () => {
      const wrapper = mountComponent();

      const buttons = wrapper.findAllComponents(QBtn);
      const forgotButton = buttons.find((btn) => {
        const label = btn.props('label');
        return typeof label === 'string' && label.includes('Forgot');
      });
      expect(forgotButton).toBeDefined();
    });

    it('should emit forgotPassword event when forgot password is clicked', async () => {
      const wrapper = mountComponent();

      const buttons = wrapper.findAllComponents(QBtn);
      const forgotButton = buttons.find((btn) => {
        const label = btn.props('label');
        return typeof label === 'string' && label.includes('Forgot');
      });
      await forgotButton?.trigger('click');

      expect(wrapper.emitted('forgotPassword')).toBeTruthy();
    });
  });

  describe('accessibility', () => {
    it('should have proper ARIA labels on inputs', () => {
      const wrapper = mountComponent();

      const inputs = wrapper.findAllComponents(QInput);
      // Check that inputs have aria-label in their attributes
      // QInput passes aria-label to the native input element
      expect(inputs[0]?.vm.$attrs['aria-label']).toBeDefined();
      expect(inputs[1]?.vm.$attrs['aria-label']).toBeDefined();
    });

    it('should display error message in banner', async () => {
      const wrapper = mountComponent({
        error: 'Invalid credentials',
      });

      await flushPromises();

      const banners = wrapper.findAllComponents(QBanner);
      const errorBanner = banners.find((b) => b.classes().includes('bg-negative'));
      expect(errorBanner).toBeDefined();
      expect(errorBanner?.text()).toContain('Invalid credentials');
    });

    it('should announce loading state to screen readers', () => {
      const wrapper = mountComponent({ isLoading: true });

      const buttons = wrapper.findAllComponents(QBtn);
      const submitButton = buttons.find((btn) => btn.props('type') === 'submit');
      // Button has aria-busy attribute defined
      expect(submitButton?.attributes('aria-busy')).toBeDefined();
    });
  });
});

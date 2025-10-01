/**
 * Authentication Service Contract Tests
 * Tests for TMD authentication API endpoints
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { authService } from '../authService';
import type { LoginCredentials } from './types';

describe('authService - Contract Tests', () => {
  beforeEach(() => {
    // Clear any mocks before each test
    vi.clearAllMocks();
  });

  describe('POST /wp-json/tmd/v3/auth/login', () => {
    it('should successfully login with valid credentials', async () => {
      const credentials: LoginCredentials = {
        identifier: 'testuser',
        password: 'testpass123',
        rememberMe: true,
      };

      const response = await authService.login(credentials);

      expect(response).toBeDefined();
      expect(response.success).toBe(true);
      expect(response.data).toBeDefined();
      expect(response.data?.token).toBeTruthy();
      expect(response.data?.user).toBeDefined();
      expect(response.data?.user.id).toBeTypeOf('number');
      expect(response.data?.user.username).toBeTypeOf('string');
      expect(response.data?.user.email).toBeTypeOf('string');
      expect(response.data?.user.displayName).toBeTypeOf('string');
      expect(Array.isArray(response.data?.user.roles)).toBe(true);
      expect(response.data?.expiresAt).toMatch(/^\d{4}-\d{2}-\d{2}T/); // ISO date format
    });

    it('should reject login with invalid credentials', async () => {
      const credentials: LoginCredentials = {
        identifier: 'invalid',
        password: 'wrong',
      };

      const response = await authService.login(credentials);

      expect(response.success).toBe(false);
      expect(response.error).toBeDefined();
      expect(response.error?.code).toBe('INVALID_CREDENTIALS');
      expect(response.error?.message).toBeTruthy();
    });

    it('should handle account disabled error', async () => {
      const credentials: LoginCredentials = {
        identifier: 'disabled_user',
        password: 'password',
      };

      const response = await authService.login(credentials);

      expect(response.success).toBe(false);
      expect(response.error).toBeDefined();
      expect(response.error?.code).toBe('ACCOUNT_DISABLED');
    });

    it('should handle rate limiting', async () => {
      const credentials: LoginCredentials = {
        identifier: 'testuser',
        password: 'wrong',
      };

      // Simulate multiple failed attempts
      for (let i = 0; i < 5; i++) {
        await authService.login(credentials);
      }

      const response = await authService.login(credentials);

      expect(response.success).toBe(false);
      expect(response.error?.code).toBe('RATE_LIMITED');
      expect(response.error?.retryAfter).toBeTypeOf('number');
    });

    it('should validate required fields', async () => {
      const credentials = {
        identifier: '',
        password: '',
      } as LoginCredentials;

      const response = await authService.login(credentials);

      expect(response.success).toBe(false);
      expect(response.error?.code).toBe('VALIDATION_ERROR');
      expect(response.error?.details).toBeDefined();
    });
  });

  describe('POST /wp-json/tmd/v3/auth/logout', () => {
    it('should successfully logout with valid token', async () => {
      const response = await authService.logout();

      expect(response).toBeDefined();
      expect(response.success).toBe(true);
      expect(response.message).toBeTruthy();
    });

    it('should handle invalid token on logout', async () => {
      // Set invalid token
      const response = await authService.logout();

      expect(response.success).toBe(false);
      expect(response.error?.code).toBe('INVALID_TOKEN');
    });
  });

  describe('GET /wp-json/tmd/v3/auth/verify', () => {
    it('should verify valid token and return user data', async () => {
      const response = await authService.verify();

      expect(response).toBeDefined();
      expect(response.success).toBe(true);
      expect(response.data).toBeDefined();
      expect(response.data?.user).toBeDefined();
      expect(response.data?.user.id).toBeTypeOf('number');
      expect(response.data?.expiresAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });

    it('should reject invalid or expired token', async () => {
      const response = await authService.verify();

      expect(response.success).toBe(false);
      expect(response.error?.code).toBe('INVALID_TOKEN');
    });

    it('should handle disabled account on verification', async () => {
      const response = await authService.verify();

      expect(response.success).toBe(false);
      expect(response.error?.code).toBe('ACCOUNT_DISABLED');
    });
  });

  describe('GET /wp-json/tmd/v3/auth/reset-password-url', () => {
    it('should return password reset URL', async () => {
      const response = await authService.getResetPasswordUrl();

      expect(response).toBeDefined();
      expect(response.success).toBe(true);
      expect(response.data).toBeDefined();
      expect(response.data?.resetUrl).toBeTruthy();
      expect(response.data?.resetUrl).toMatch(/^https?:\/\//); // Valid URL
    });
  });
});

 
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { authService } from '../authService';
import type { LoginCredentials } from '../../stores/authStore';

vi.mock('../../boot/apollo', () => ({
  apolloClient: {
    mutate: vi.fn(),
    query: vi.fn(),
  },
}));

describe('authService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('login', () => {
    it('should successfully login with valid credentials', async () => {
      const { apolloClient } = await import('../../boot/apollo');

      vi.mocked(apolloClient.mutate).mockResolvedValueOnce({
        data: {
          login: {
            authToken: 'test-auth-token',
            refreshToken: 'test-refresh-token',
            user: {
              id: 'dXNlcjox',
              name: 'Test User',
              email: 'test@example.com',
            },
          },
        },
      } as never);

      const credentials: LoginCredentials = {
        username: 'testuser',
        password: 'testpass123',
      };

      const response = await authService.login(credentials);

      expect(response).toBeDefined();
      expect(response.token).toBe('test-auth-token');
      expect(response.refreshToken).toBe('test-refresh-token');
      expect(response.user).toBeDefined();
      expect(response.user?.name).toBe('Test User');
      expect(response.user?.email).toBe('test@example.com');
    });

    it('should throw error on failed login', async () => {
      const { apolloClient } = await import('../../boot/apollo');

      vi.mocked(apolloClient.mutate).mockRejectedValueOnce(new Error('Invalid credentials'));

      const credentials: LoginCredentials = {
        username: 'invalid',
        password: 'wrong',
      };

      await expect(authService.login(credentials)).rejects.toThrow();
    });
  });

  describe('refreshToken', () => {
    it('should successfully refresh token', async () => {
      const { apolloClient } = await import('../../boot/apollo');

      vi.mocked(apolloClient.mutate).mockResolvedValueOnce({
        data: {
          refreshJwtAuthToken: {
            authToken: 'new-auth-token',
          },
        },
      } as never);

      const response = await authService.refreshToken('old-refresh-token');

      expect(response).toBeDefined();
      expect(response.token).toBe('new-auth-token');
      expect(response.refreshToken).toBe('old-refresh-token');
      expect(response.user).toBeNull();
    });
  });

  describe('validateToken', () => {
    it('should return true for valid token', async () => {
      const { apolloClient } = await import('../../boot/apollo');

      vi.mocked(apolloClient.query).mockResolvedValueOnce({
        data: {
          viewer: {
            id: 'dXNlcjox',
            name: 'Test User',
            email: 'test@example.com',
            roles: { nodes: [{ name: 'subscriber' }] },
          },
        },
        loading: false,
        networkStatus: 7,
      });

      const isValid = await authService.validateToken('valid-token');
      expect(isValid).toBe(true);
    });

    it('should return false for invalid token', async () => {
      const { apolloClient } = await import('../../boot/apollo');

      vi.mocked(apolloClient.query).mockRejectedValueOnce(new Error('Invalid token'));

      const isValid = await authService.validateToken('invalid-token');
      expect(isValid).toBe(false);
    });
  });

  describe('logout', () => {
    it('should be a no-op function', () => {
      expect(typeof authService.logout).toBe('function');
    });
  });
});

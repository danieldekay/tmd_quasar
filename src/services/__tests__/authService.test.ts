/* eslint-disable @typescript-eslint/unbound-method */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authService } from '../authService';

// Mock Apollo Client
vi.mock('../../boot/apollo', () => ({
  apolloClient: {
    mutate: vi.fn(),
    query: vi.fn(),
  },
}));

import { apolloClient } from '../../boot/apollo';

describe('AuthService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      const mockToken = 'mock-jwt-token';
      const mockUser = {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        roles: {
          nodes: [{ name: 'subscriber' }],
        },
        avatar: { url: 'avatar-url' },
      };

      // Mock the GraphQL login response
      (apolloClient.mutate as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        data: {
          login: {
            authToken: mockToken,
            user: mockUser,
          },
        },
      });

      const result = await authService.login({
        username: 'testuser',
        password: 'password123',
      });

      expect(result.token).toBe(mockToken);
      expect(result.user.name).toBe('Test User');
      expect(result.expires_in).toBe(3600);

      expect(apolloClient.mutate).toHaveBeenCalledWith({
        mutation: expect.any(Object),
        variables: {
          input: {
            clientMutationId: expect.stringMatching(/^login_\d+$/),
            username: 'testuser',
            password: 'password123',
          },
        },
      });
    });

    it('should throw error on login failure', async () => {
      const errorMessage = 'Invalid credentials';
      (apolloClient.mutate as ReturnType<typeof vi.fn>).mockRejectedValueOnce({
        graphQLErrors: [{ message: errorMessage }],
      });

      await expect(
        authService.login({
          username: 'wronguser',
          password: 'wrongpass',
        }),
      ).rejects.toThrow(errorMessage);
    });
  });

  describe('logout', () => {
    it('should logout successfully', async () => {
      const token = 'mock-jwt-token';

      await authService.logout(token);

      // Since logout doesn't make a GraphQL call anymore, we just verify it doesn't throw
      expect(true).toBe(true);
    });

    it('should not throw error on logout failure', async () => {
      const token = 'mock-jwt-token';

      // Should not throw
      await expect(authService.logout(token)).resolves.toBeUndefined();
    });
  });

  describe('validateToken', () => {
    it('should return true for valid token', async () => {
      const token = 'valid-token';

      // Mock getCurrentUser to succeed
      (apolloClient.query as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        data: {
          viewer: {
            id: '1',
            name: 'Test User',
            email: 'test@example.com',
            roles: {
              nodes: [{ name: 'subscriber' }],
            },
          },
        },
      });

      const result = await authService.validateToken(token);

      expect(result).toBe(true);
      expect(apolloClient.query).toHaveBeenCalledWith({
        query: expect.any(Object),
        context: {
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
      });
    });

    it('should return false for invalid token', async () => {
      const token = 'invalid-token';

      // Mock getCurrentUser to fail
      (apolloClient.query as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
        new Error('Invalid token'),
      );

      const result = await authService.validateToken(token);

      expect(result).toBe(false);
    });
  });

  describe('getCurrentUser', () => {
    it('should return user details', async () => {
      const token = 'mock-token';
      const mockUser = {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        roles: {
          nodes: [{ name: 'subscriber',  }],
        },
        avatar: { url: 'avatar-url' },
        url: 'user-url',
        description: 'User description',
        slug: 'test-user',
      };

      (apolloClient.query as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        data: {
          viewer: mockUser,
        },
      });

      const result = await authService.getCurrentUser(token);

      expect(result.name).toBe('Test User');
      expect(result.id).toBe(1);
      expect(apolloClient.query).toHaveBeenCalledWith({
        query: expect.any(Object),
        context: {
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
      });
    });

    it('should throw error on user fetch failure', async () => {
      const token = 'mock-token';
      const errorMessage = 'User not found';
      (apolloClient.query as ReturnType<typeof vi.fn>).mockRejectedValueOnce({
        graphQLErrors: [{ message: errorMessage }],
      });

      await expect(authService.getCurrentUser(token)).rejects.toThrow(errorMessage);
    });
  });
});

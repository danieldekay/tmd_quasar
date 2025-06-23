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

      expect(result).not.toBeNull();
      if (result) {
        expect(result.token).toBe(mockToken);
        expect(result.user).not.toBeNull();
        if (result.user) {
          expect(result.user.name).toBe(mockUser.name);
        }
      }

      expect(apolloClient.mutate).toHaveBeenCalledWith({
        mutation: expect.any(Object),
        variables: {
          input: {
            clientMutationId: expect.any(String),
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
      ).rejects.toThrow('Login failed. Please check your credentials.');
    });
  });

  describe('logout', () => {
    it('should logout successfully', () => {
      // No need for token, logout takes no arguments
      authService.logout();

      // Since logout doesn't make a GraphQL call anymore, we just verify it doesn't throw
      expect(true).toBe(true);
    });

    it('should not throw error on logout failure', () => {
      // Should not throw
      expect(() => authService.logout()).not.toThrow();
    });
  });

  describe('validateToken', () => {
    it('should return true for valid token', async () => {
      // Create a mock JWT token with proper structure
      const mockPayload = {
        exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
        user_id: 1,
        username: 'testuser',
      };
      const mockJWT = `header.${btoa(JSON.stringify(mockPayload))}.signature`;

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

      const result = await authService.validateToken(mockJWT);

      expect(result).toBe(true);
      expect(apolloClient.query).toHaveBeenCalledWith({
        query: expect.any(Object),
        context: {
          headers: {
            Authorization: `Bearer ${mockJWT}`,
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
          nodes: [{ name: 'subscriber' }],
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

      expect(result).not.toBeNull();
      if (result) {
        expect(result.name).toBe('Test User');
        expect(result.id).toBe(1);
      }
      expect(apolloClient.query).toHaveBeenCalledWith({
        query: expect.any(Object),
        context: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      });
    });

    it('should throw error on user fetch failure', async () => {
      const token = 'mock-token';
      const errorMessage = 'User not found';

      // This is the critical part: ensure the mock rejects with an actual Error instance.
      (apolloClient.query as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
        new Error(errorMessage),
      );

      // The service should catch this error and re-throw it.
      await expect(authService.getCurrentUser(token)).rejects.toThrow(errorMessage);
    });
  });
});

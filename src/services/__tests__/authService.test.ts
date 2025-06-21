import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authService } from '../authService';

// Mock axios
vi.mock('../../boot/axios', () => ({
  api: {
    post: vi.fn(),
    get: vi.fn(),
  },
}));

import { api } from '../../boot/axios';

describe('AuthService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      const mockToken = 'mock-jwt-token';
      const mockUser = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        roles: ['subscriber'],
      };

      // Mock the token response
      (api.post as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        data: {
          token: mockToken,
          expires_in: 3600,
        },
      });

      // Mock the user details response
      (api.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        data: mockUser,
      });

      const result = await authService.login({
        username: 'testuser',
        password: 'password123',
      });

      expect(result.token).toBe(mockToken);
      expect(result.user).toEqual(mockUser);
      expect(result.expires_in).toBe(3600);

      expect(api.post).toHaveBeenCalledWith('/jwt-auth/v1/token', {
        username: 'testuser',
        password: 'password123',
      });

      expect(api.get).toHaveBeenCalledWith('/wp/v2/users/me', {
        headers: { Authorization: `Bearer ${mockToken}` },
      });
    });

    it('should throw error on login failure', async () => {
      const errorMessage = 'Invalid credentials';
      (api.post as ReturnType<typeof vi.fn>).mockRejectedValueOnce({
        response: {
          data: { message: errorMessage },
        },
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
      (api.post as ReturnType<typeof vi.fn>).mockResolvedValueOnce({});

      await authService.logout(token);

      expect(api.post).toHaveBeenCalledWith(
        '/jwt-auth/v1/token/revoke',
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
    });

    it('should not throw error on logout failure', async () => {
      const token = 'mock-jwt-token';
      (api.post as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error('Network error'));

      // Should not throw
      await expect(authService.logout(token)).resolves.toBeUndefined();
    });
  });

  describe('validateToken', () => {
    it('should return true for valid token', async () => {
      const token = 'valid-token';
      (api.post as ReturnType<typeof vi.fn>).mockResolvedValueOnce({});

      const result = await authService.validateToken(token);

      expect(result).toBe(true);
      expect(api.post).toHaveBeenCalledWith(
        '/jwt-auth/v1/token/validate',
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
    });

    it('should return false for invalid token', async () => {
      const token = 'invalid-token';
      (api.post as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error('Invalid token'));

      const result = await authService.validateToken(token);

      expect(result).toBe(false);
    });
  });

  describe('getCurrentUser', () => {
    it('should return user details', async () => {
      const token = 'mock-token';
      const mockUser = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        roles: ['subscriber'],
        avatar_urls: { '96': 'avatar-url' },
      };

      (api.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        data: mockUser,
      });

      const result = await authService.getCurrentUser(token);

      expect(result).toEqual(mockUser);
      expect(api.get).toHaveBeenCalledWith('/wp/v2/users/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
    });

    it('should throw error on user fetch failure', async () => {
      const token = 'mock-token';
      const errorMessage = 'User not found';
      (api.get as ReturnType<typeof vi.fn>).mockRejectedValueOnce({
        response: {
          data: { message: errorMessage },
        },
      });

      await expect(authService.getCurrentUser(token)).rejects.toThrow(errorMessage);
    });
  });
});

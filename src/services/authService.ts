import { api } from '../boot/axios';
import type { User, AuthResponse, LoginCredentials } from '../stores/authStore';

class AuthService {
  private readonly baseUrl = process.env.WORDPRESS_API_URL || 'http://localhost:10014/wp-json';

  /**
   * Login user with username and password
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await api.post('/jwt-auth/v1/token', {
        username: credentials.username,
        password: credentials.password,
      });

      const { token } = response.data;

      // Get full user details
      const userDetails = await this.getCurrentUser(token);

      return {
        token,
        user: userDetails,
        expires_in: response.data.expires_in,
      };
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response: { data: { message?: string } } };
        throw new Error(axiosError.response?.data?.message || 'Login failed');
      }
      throw new Error('Login failed');
    }
  }

  /**
   * Logout user and invalidate token
   */
  async logout(token: string): Promise<void> {
    try {
      await api.post(
        '/jwt-auth/v1/token/revoke',
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
    } catch (error) {
      // Don't throw error on logout failure
      console.warn('Logout API call failed:', error);
    }
  }

  /**
   * Refresh JWT token
   */
  async refreshToken(token: string): Promise<AuthResponse> {
    try {
      const response = await api.post(
        '/jwt-auth/v1/token/refresh',
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const { token: newToken } = response.data;
      const userDetails = await this.getCurrentUser(newToken);

      return {
        token: newToken,
        user: userDetails,
        expires_in: response.data.expires_in,
      };
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response: { data: { message?: string } } };
        throw new Error(axiosError.response?.data?.message || 'Token refresh failed');
      }
      throw new Error('Token refresh failed');
    }
  }

  /**
   * Validate JWT token
   */
  async validateToken(token: string): Promise<boolean> {
    try {
      await api.post(
        '/jwt-auth/v1/token/validate',
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get current user details
   */
  async getCurrentUser(token: string): Promise<User> {
    try {
      const response = await api.get('/wp/v2/users/me', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const userData = response.data;

      return {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        roles: userData.roles || [],
        avatar_urls: userData.avatar_urls,
        url: userData.url,
        description: userData.description,
        link: userData.link,
        slug: userData.slug,
      };
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response: { data: { message?: string } } };
        throw new Error(axiosError.response?.data?.message || 'Failed to get user details');
      }
      throw new Error('Failed to get user details');
    }
  }

  /**
   * Register new user (if enabled)
   */
  async register(userData: {
    username: string;
    email: string;
    password: string;
    name?: string;
  }): Promise<AuthResponse> {
    try {
      await api.post('/wp/v2/users', {
        username: userData.username,
        email: userData.email,
        password: userData.password,
        name: userData.name || userData.username,
      });

      // After registration, login the user
      return await this.login({
        username: userData.username,
        password: userData.password,
      });
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response: { data: { message?: string } } };
        throw new Error(axiosError.response?.data?.message || 'Registration failed');
      }
      throw new Error('Registration failed');
    }
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string): Promise<void> {
    try {
      await api.post('/wp/v2/users/lost-password', {
        user_login: email,
      });
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response: { data: { message?: string } } };
        throw new Error(axiosError.response?.data?.message || 'Password reset request failed');
      }
      throw new Error('Password reset request failed');
    }
  }

  /**
   * Reset password with reset key
   */
  async resetPassword(resetKey: string, newPassword: string): Promise<void> {
    try {
      await api.post('/wp/v2/users/reset-password', {
        key: resetKey,
        password: newPassword,
      });
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response: { data: { message?: string } } };
        throw new Error(axiosError.response?.data?.message || 'Password reset failed');
      }
      throw new Error('Password reset failed');
    }
  }
}

export const authService = new AuthService();

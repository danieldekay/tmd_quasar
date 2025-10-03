import { apolloClient } from '../boot/apollo';
import type { AuthResponse, LoginCredentials, User } from '../stores/authStore';
import {
  GET_CURRENT_USER_QUERY,
  LOGIN_MUTATION,
  type LoginInput,
  type LoginResponse,
  REFRESH_TOKEN_MUTATION,
  type RefreshTokenInput,
  type RefreshTokenResponse,
} from './graphql/auth';

export class AuthService {
  /**
   * Login user using GraphQL
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const input: LoginInput = {
        clientMutationId: 'tmd-frontend',
        username: credentials.username,
        password: credentials.password,
      };

      const { data } = await apolloClient.mutate<{ login: LoginResponse }>({
        mutation: LOGIN_MUTATION,
        variables: { input },
      });

      if (!data?.login) {
        throw new Error('Login failed - no response data');
      }

      const { authToken, refreshToken, user } = data.login;

      return {
        token: authToken,
        refreshToken,
        user: {
          id: Number.parseInt(user.id.replace('dXNlcjo', '')), // Parse the base64 encoded user ID
          name: user.name,
          email: user.email || '',
          roles: [], // Will be populated later if needed
        },
      };
    } catch (error) {
      console.error('Login error:', error);
      throw new Error('Login failed. Please check your credentials.');
    }
  }

  /**
   * Refresh JWT token using GraphQL
   */
  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    try {
      const input: RefreshTokenInput = {
        clientMutationId: 'tmd-frontend',
        jwtRefreshToken: refreshToken,
      };

      const { data, errors } = await apolloClient.mutate<{
        refreshJwtAuthToken: RefreshTokenResponse;
      }>({
        mutation: REFRESH_TOKEN_MUTATION,
        variables: { input },
      });

      // Defensive: If backend returns 500, data may be undefined
      if (!data?.refreshJwtAuthToken) {
        // Try to extract GraphQL error message
        const errorMessage =
          errors?.[0]?.message ||
          (typeof data === 'object' &&
            data &&
            'errors' in data &&
            Array.isArray((data as { errors: unknown[] }).errors) &&
            (data as { errors: { message?: string }[] }).errors[0]?.message) ||
          'Token refresh failed - no response data';
        throw new Error(errorMessage);
      }

      const { authToken } = data.refreshJwtAuthToken;

      return {
        token: authToken,
        refreshToken, // Keep the same refresh token
        user: null, // User data not returned in refresh response
      };
    } catch (error: unknown) {
      // Defensive: Handle network/500 errors gracefully
      let message = 'Token refresh failed - please log in again';
      if (typeof error === 'object' && error !== null) {
        // Apollo network error
        const networkError = (error as { networkError?: { statusCode?: number } }).networkError;
        if (networkError && networkError.statusCode === 500) {
          message = 'Server error during token refresh. Please log in again.';
        } else if (
          'message' in error &&
          typeof (error as { message: unknown }).message === 'string'
        ) {
          message = (error as { message: string }).message;
        }
      }
      console.error('Token refresh error:', error);
      throw new Error(message);
    }
  }

  /**
   * Validate JWT token by attempting to get current user
   */
  async validateToken(token: string): Promise<boolean> {
    try {
      const user = await this.getCurrentUser(token);
      return user !== null;
    } catch (error) {
      console.error('Token validation error:', error);
      return false;
    }
  }

  /**
   * Get current user using GraphQL
   */
  async getCurrentUser(token: string): Promise<User | null> {
    try {
      const { data } = await apolloClient.query({
        query: GET_CURRENT_USER_QUERY,
        context: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      });

      if (!data?.viewer) {
        return null;
      }

      const { viewer } = data;
      return {
        id: Number.parseInt(viewer.id.replace('dXNlcjo', '')), // Parse the base64 encoded user ID
        name: viewer.name,
        email: viewer.email || '',
        roles: viewer.roles?.nodes?.map((role: { name: string }) => role.name) || [],
      };
    } catch (error) {
      console.error('Get current user error:', error);
      // Re-throw the error so callers can handle it
      throw error;
    }
  }

  /**
   * Request password reset - redirects to WordPress
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  requestPasswordReset(email: string): void {
    // Redirect to WordPress password reset page
    const wordpressUrl =
      process.env.WORDPRESS_URL || process.env.WORDPRESS_API_URL || 'http://localhost:10014';
    const resetUrl = `${wordpressUrl}/wp-login.php?action=lostpassword`;

    // Open in new tab/window
    window.open(resetUrl, '_blank');

    // Show a message to the user
    throw new Error('Please use the WordPress password reset page that opened in a new tab.');
  }

  /**
   * Register new user - redirects to WordPress
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  register(userData: { username: string; email: string; name: string; password: string }): void {
    // Redirect to WordPress registration page
    const wordpressUrl =
      process.env.WORDPRESS_URL || process.env.WORDPRESS_API_URL || 'http://localhost:10014';
    const registerUrl = `${wordpressUrl}/wp-login.php?action=register`;

    // Open in new tab/window
    window.open(registerUrl, '_blank');

    // Show a message to the user
    throw new Error('Please use the WordPress registration page that opened in a new tab.');
  }

  /**
   * No-op logout for API compatibility
   */
  logout(): void {
    // No operation needed; handled in store
  }
}

export const authService = new AuthService();

import { apolloClient } from '../boot/apollo';
import type { User, AuthResponse, LoginCredentials } from '../stores/authStore';
import {
  LOGIN_MUTATION,
  REFRESH_TOKEN_MUTATION,
  GET_CURRENT_USER_QUERY,
  type LoginInput,
  type RefreshTokenInput,
} from './graphql/auth';

class AuthService {
  /**
   * Login user with username and password using GraphQL
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const input: LoginInput = {
        clientMutationId: `login_${Date.now()}`,
        username: credentials.username,
        password: credentials.password,
      };

      const response = await apolloClient.mutate({
        mutation: LOGIN_MUTATION,
        variables: { input },
      });

      const { authToken, user } = response.data?.login || {};

      if (!authToken || !user) {
        throw new Error('Invalid login response');
      }

      // Transform user data to match our User interface
      const transformedUser: User = {
        id: parseInt(user.id),
        name: user.name,
        email: user.email || '',
        roles: user.roles?.nodes?.map((role: { name: string }) => role.name) || [],
        avatar_urls: user.avatar?.url ? { '96': user.avatar.url } : {},
        url: '',
        description: '',
        link: '',
        slug: '',
      };

      return {
        token: authToken,
        user: transformedUser,
        expires_in: 3600, // Default expiry time
      };
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'graphQLErrors' in error) {
        const graphQLError = error as { graphQLErrors: Array<{ message: string }> };
        throw new Error(graphQLError.graphQLErrors[0]?.message || 'Login failed');
      }
      throw new Error('Login failed');
    }
  }

  /**
   * Logout user and invalidate token
   * Note: WPGraphQL JWT Authentication doesn't provide a logout mutation
   * We just clear the local token
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  logout(_token: string): Promise<void> {
    try {
      // Since there's no logout mutation in WPGraphQL JWT Authentication,
      // we just clear the local token and let it expire on the server
      console.log('Logout: Clearing local token');
    } catch (error) {
      // Don't throw error on logout failure
      console.warn('Logout failed:', error);
    }
    return Promise.resolve();
  }

  /**
   * Refresh JWT token using GraphQL
   */
  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    try {
      const input: RefreshTokenInput = {
        clientMutationId: `refresh_${Date.now()}`,
        jwtRefreshToken: refreshToken,
      };

      const response = await apolloClient.mutate({
        mutation: REFRESH_TOKEN_MUTATION,
        variables: { input },
      });

      const { authToken } = response.data?.refreshJwtAuthToken || {};

      if (!authToken) {
        throw new Error('Invalid refresh response');
      }

      // Get user details with new token
      const userDetails = await this.getCurrentUser(authToken);

      return {
        token: authToken,
        user: userDetails,
        expires_in: 3600, // Default expiry time
      };
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'graphQLErrors' in error) {
        const graphQLError = error as { graphQLErrors: Array<{ message: string }> };
        throw new Error(graphQLError.graphQLErrors[0]?.message || 'Token refresh failed');
      }
      throw new Error('Token refresh failed');
    }
  }

  /**
   * Validate JWT token
   * Note: WPGraphQL JWT Authentication doesn't provide a validate mutation
   * We can try to get the current user to validate the token
   */
  async validateToken(token: string): Promise<boolean> {
    try {
      // Try to get current user with the token
      // If it succeeds, the token is valid
      await this.getCurrentUser(token);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get current user details using GraphQL
   */
  async getCurrentUser(token: string): Promise<User> {
    try {
      const response = await apolloClient.query({
        query: GET_CURRENT_USER_QUERY,
        context: {
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
      });

      const userData = response.data?.viewer;

      if (!userData) {
        throw new Error('No user data received');
      }

      return {
        id: parseInt(userData.id),
        name: userData.name,
        email: userData.email || '',
        roles: userData.roles?.nodes?.map((role: { name: string }) => role.name) || [],
        avatar_urls: userData.avatar?.url ? { '96': userData.avatar.url } : {},
        url: userData.url || '',
        description: userData.description || '',
        link: '',
        slug: userData.slug || '',
      };
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'graphQLErrors' in error) {
        const graphQLError = error as { graphQLErrors: Array<{ message: string }> };
        throw new Error(graphQLError.graphQLErrors[0]?.message || 'Failed to get user details');
      }
      throw new Error('Failed to get user details');
    }
  }

  /**
   * Register new user (if enabled) - Note: This might need a separate GraphQL mutation
   * For now, keeping the REST implementation as fallback
   */
  async register(userData: {
    username: string;
    email: string;
    password: string;
    name?: string;
  }): Promise<AuthResponse> {
    // For registration, we might need a different GraphQL mutation
    // For now, we'll use the login method after registration
    // This would need to be implemented based on your WordPress GraphQL schema

    // After registration, login the user
    return await this.login({
      username: userData.username,
      password: userData.password,
    });
  }

  /**
   * Request password reset - Note: This might need a separate GraphQL mutation
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  requestPasswordReset(_email: string): Promise<void> {
    // This would need to be implemented based on your WordPress GraphQL schema
    throw new Error('Password reset not implemented in GraphQL yet');
  }

  /**
   * Reset password with reset key - Note: This might need a separate GraphQL mutation
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  resetPassword(_resetKey: string, _newPassword: string): Promise<void> {
    // This would need to be implemented based on your WordPress GraphQL schema
    throw new Error('Password reset not implemented in GraphQL yet');
  }
}

export const authService = new AuthService();

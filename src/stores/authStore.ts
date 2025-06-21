import { defineStore } from 'pinia';
import { ref, computed, readonly } from 'vue';
import { authService } from '../services/authService';
import {
  setJWTToken,
  getJWTToken,
  setRefreshToken,
  getRefreshToken,
  clearJWTTokens,
} from '../utils/cookies';

export interface User {
  id: number;
  name: string;
  display_name?: string;
  username?: string;
  email: string;
  roles: string[];
  avatar_urls?: Record<string, string>;
  url?: string;
  description?: string;
  link?: string;
  slug?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
  expires_in?: number;
  refresh_token?: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
  remember?: boolean;
}

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(null);
  const token = ref<string | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Computed
  const isAuthenticated = computed(() => Boolean(token.value && user.value));
  const hasRole = computed(() => (role: string) => user.value?.roles.includes(role) ?? false);
  const isAdmin = computed(() => hasRole.value('administrator'));
  const canManageOptions = computed(
    () => hasRole.value('administrator') || hasRole.value('manage_options'),
  );

  // Actions
  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await authService.login(credentials);

      token.value = response.token;
      user.value = response.user;

      // Store tokens in cookies
      setJWTToken(response.token, credentials.remember);
      if (response.refresh_token) {
        setRefreshToken(response.refresh_token, credentials.remember);
      }

      return true;
    } catch (err) {
      console.error('Login error:', err);
      error.value = err instanceof Error ? err.message : 'Login failed';
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      if (token.value) {
        await authService.logout(token.value);
      }
    } catch (err) {
      console.warn('Logout error:', err);
    } finally {
      // Clear state regardless of API call success
      token.value = null;
      user.value = null;
      error.value = null;

      // Clear stored tokens
      clearJWTTokens();
    }
  };

  const refreshToken = async (): Promise<boolean> => {
    const refreshTokenValue = getRefreshToken();
    if (!refreshTokenValue) return false;

    try {
      const response = await authService.refreshToken(refreshTokenValue);
      token.value = response.token;
      user.value = response.user;

      // Update stored tokens
      setJWTToken(response.token, true); // Assume remember me for refresh
      if (response.refresh_token) {
        setRefreshToken(response.refresh_token, true);
      }

      return true;
    } catch (err) {
      console.warn('Token refresh failed:', err);
      await logout();
      return false;
    }
  };

  const loadStoredAuth = async (): Promise<boolean> => {
    const storedToken = getJWTToken();
    const refreshTokenValue = getRefreshToken();

    if (!storedToken) {
      return false;
    }

    try {
      // Set the token immediately for better UX
      token.value = storedToken;

      // Try to validate the token in the background
      try {
        const isValid = await authService.validateToken(storedToken);
        if (!isValid) {
          console.warn('Stored token validation failed, attempting refresh');
          // Try to refresh the token
          if (refreshTokenValue) {
            const refreshSuccess = await refreshToken();
            if (!refreshSuccess) {
              console.warn('Token refresh failed, but keeping user logged in for better UX');
            }
          }
        }
      } catch (validationError) {
        console.warn('Token validation error:', validationError);
        // Try to refresh the token
        if (refreshTokenValue) {
          const refreshSuccess = await refreshToken();
          if (!refreshSuccess) {
            console.warn('Token refresh failed, but keeping user logged in for better UX');
          }
        }
      }

      // Try to get user data from the token or refresh
      if (!user.value) {
        try {
          // Try to get user profile to populate user data
          const userService = (await import('../services/userService')).userService;
          const userProfile = await userService.getCurrentUserProfile(storedToken);

          user.value = {
            id: userProfile.id,
            name: userProfile.name,
            display_name: userProfile.display_name,
            username: userProfile.username,
            email: userProfile.email,
            roles: userProfile.roles,
            ...(userProfile.avatar_urls && { avatar_urls: userProfile.avatar_urls }),
            ...(userProfile.url && { url: userProfile.url }),
            ...(userProfile.description && { description: userProfile.description }),
            ...(userProfile.link && { link: userProfile.link }),
            ...(userProfile.slug && { slug: userProfile.slug }),
          };
        } catch (profileError) {
          console.warn('Failed to load user profile:', profileError);
          // Don't log out - let the user continue with potentially limited functionality
          // Try to get basic user info from GraphQL instead
          try {
            const basicUser = await authService.getCurrentUser(storedToken);
            user.value = basicUser;
          } catch (graphqlError) {
            console.warn('GraphQL user query also failed:', graphqlError);
            // Still don't log out - let the user continue
          }
        }
      }

      return true;
    } catch (err) {
      console.warn('Failed to load stored auth:', err);
      await logout();
      return false;
    }
  };

  const clearError = (): void => {
    error.value = null;
  };

  return {
    // State
    user: readonly(user),
    token: readonly(token),
    isLoading: readonly(isLoading),
    error: readonly(error),

    // Computed
    isAuthenticated,
    hasRole,
    isAdmin,
    canManageOptions,

    // Actions
    login,
    logout,
    refreshToken,
    loadStoredAuth,
    clearError,
  };
});

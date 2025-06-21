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
  refreshToken?: string;
  user: User | null;
  expires_in?: number;
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
  const isLoadingStoredAuth = ref(false);
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
      if (response.refreshToken) {
        setRefreshToken(response.refreshToken, credentials.remember);
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

  const logout = (): void => {
    try {
      // No logout API call needed - just clear local state
      console.log('Logout: Clearing local state');
    } catch (err) {
      console.warn('Logout error:', err);
    } finally {
      // Clear state regardless of API call success
      token.value = null;
      user.value = null;
      error.value = null;
      isLoadingStoredAuth.value = false;

      // Clear stored tokens
      clearJWTTokens();
    }
  };

  const refreshToken = async (): Promise<boolean> => {
    try {
      // Get stored refresh token
      const storedRefreshToken = getRefreshToken();

      if (!storedRefreshToken) {
        console.warn('No refresh token available - user needs to log in again');
        logout();
        return false;
      }

      const response = await authService.refreshToken(storedRefreshToken);

      token.value = response.token;

      // Update stored token
      setJWTToken(response.token, true);

      // If we have user data from the refresh, update it
      if (response.user) {
        user.value = response.user;
      }

      // Show success notification
      try {
        const { useAuthNotifications } = await import('../composables/useAuthNotifications');
        const authNotifications = useAuthNotifications();
        authNotifications.showTokenRefreshed();
      } catch (notificationError) {
        console.warn('Failed to show token refresh notification:', notificationError);
      }

      return true;
    } catch (error) {
      console.warn('Token refresh failed:', error);
      logout();
      return false;
    }
  };

  const attemptAutoRelogin = async (): Promise<boolean> => {
    console.log('Attempting automatic re-login...');

    // First try to refresh token if we have a refresh token
    const storedRefreshToken = getRefreshToken();
    if (storedRefreshToken) {
      const refreshSuccess = await refreshToken();
      if (refreshSuccess) {
        console.log('Successfully refreshed token');
        return true;
      }
    }

    // If refresh failed or no refresh token, try to validate stored token
    const storedToken = getJWTToken();
    if (storedToken) {
      try {
        const isValid = await authService.validateToken(storedToken);
        if (isValid) {
          // Token is still valid, might have been a temporary network issue
          token.value = storedToken;

          // Try to get user data if we don't have it
          if (!user.value) {
            try {
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
              console.warn('Failed to load user profile during auto-relogin:', profileError);
              // Try GraphQL fallback
              try {
                const basicUser = await authService.getCurrentUser(storedToken);
                user.value = basicUser;
              } catch (graphqlError) {
                console.warn('GraphQL user query also failed during auto-relogin:', graphqlError);
              }
            }
          }

          console.log('Token validation successful - user re-authenticated');
          return true;
        }
      } catch (validationError) {
        console.warn('Token validation failed during auto-relogin:', validationError);
      }
    }

    // All auto-relogin attempts failed
    console.log('Auto-relogin failed - user needs to log in manually');
    logout();
    return false;
  };

  const loadStoredAuth = async (): Promise<boolean> => {
    // Prevent concurrent calls - wait for existing call to complete
    if (isLoadingStoredAuth.value) {
      // Wait for the current loading to finish
      while (isLoadingStoredAuth.value) {
        await new Promise((resolve) => setTimeout(resolve, 50));
      }
      // Return current authentication status
      return isAuthenticated.value;
    }

    const storedToken = getJWTToken();

    if (!storedToken) {
      return false;
    }

    isLoadingStoredAuth.value = true;

    try {
      // Set the token immediately for better UX
      token.value = storedToken;

      // Try to validate the token in the background
      try {
        const isValid = await authService.validateToken(storedToken);
        if (!isValid) {
          console.warn('Stored token validation failed');
          // Since we don't have refresh tokens, we'll just clear the invalid token
          // and let the user log in again
          logout();
          return false;
        }
      } catch (validationError) {
        console.warn('Token validation error:', validationError);
        // Clear invalid token and let user log in again
        logout();
        return false;
      }

      // Try to get user data from the token
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
      logout();
      return false;
    } finally {
      isLoadingStoredAuth.value = false;
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
    isLoadingStoredAuth: readonly(isLoadingStoredAuth),
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
    attemptAutoRelogin,
    clearError,
  };
});

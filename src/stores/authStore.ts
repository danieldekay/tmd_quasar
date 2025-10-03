import { defineStore } from 'pinia';
import { computed, readonly, ref } from 'vue';
import { useTokenRefresh } from '../composables/useTokenRefresh';
import { authService } from '../services/authService';
import { sessionService } from '../services/sessionService';
import type { User as ImportedUser, Session } from '../services/types';
import {
  clearJWTTokens,
  getJWTToken,
  getRefreshToken,
  setJWTToken,
  setRefreshToken,
} from '../utils/cookies';
import { getJwtExpiration } from '../utils/jwt';

// Re-export User type for backward compatibility
export interface User {
  id: number;
  name: string;
  display_name?: string;
  username?: string;
  email: string;
  roles: string[] | { nodes: Array<{ name: string }> };
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
  const hasAttemptedStoredAuth = ref(false);
  const error = ref<string | null>(null);

  // Progressive delay protection for brute force
  const loginAttempts = ref(0);
  const lastFailedLoginTime = ref<number | null>(null);

  // Initialize token refresh composable
  const { initializeTokenState, clearTokenState } = useTokenRefresh();

  // Computed
  const isAuthenticated = computed(() => Boolean(token.value && user.value));
  const hasRole = computed(() => (role: string) => {
    if (!user.value?.roles) return false;

    // Handle different possible formats of roles
    if (Array.isArray(user.value.roles)) {
      return user.value.roles.includes(role);
    }

    // If roles is an object with nodes (GraphQL format)
    if (user.value.roles && typeof user.value.roles === 'object' && 'nodes' in user.value.roles) {
      const roleNodes = (user.value.roles as { nodes: Array<{ name: string }> }).nodes;
      if (Array.isArray(roleNodes)) {
        return roleNodes.some((node) => node?.name === role);
      }
    }

    return false;
  });
  const isAdmin = computed(() => hasRole.value('administrator'));
  const canManageOptions = computed(
    () => hasRole.value('administrator') || hasRole.value('manage_options'),
  );

  /**
   * Calculate delay for progressive brute force protection
   * Returns delay in milliseconds: 0s, 1s, 5s, 30s, 30s, ...
   */
  const getLoginDelay = computed(() => {
    const delays = [0, 1000, 5000, 30000]; // 0s, 1s, 5s, 30s
    return delays[Math.min(loginAttempts.value, delays.length - 1)];
  });

  /* --------------------------------------------------------------------------
   *  Internal: automatic token refresh handling
   * ------------------------------------------------------------------------*/
  let refreshTimeout: ReturnType<typeof setTimeout> | null = null;

  const scheduleRefresh = (jwt: string | null): void => {
    if (refreshTimeout) {
      clearTimeout(refreshTimeout);
      refreshTimeout = null;
    }

    if (!jwt) return;

    const expMs = getJwtExpiration(jwt);
    if (!expMs) return;

    // Refresh 60 s before expiry if possible
    const delay = expMs - Date.now() - 60000;
    if (delay > 0) {
      refreshTimeout = setTimeout(() => {
        /* eslint-disable @typescript-eslint/no-floating-promises */
        refreshToken();
        /* eslint-enable @typescript-eslint/no-floating-promises */
      }, delay);
    }
  };

  // Actions
  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    isLoading.value = true;
    error.value = null;

    try {
      // Apply progressive delay for brute force protection
      const delay = getLoginDelay.value ?? 0;
      if (delay > 0) {
        await new Promise((resolve) => setTimeout(resolve, delay));
      }

      const response = await authService.login(credentials);

      token.value = response.token;
      user.value = response.user;

      // Reset login attempts on successful login
      loginAttempts.value = 0;
      lastFailedLoginTime.value = null;

      // Create session object for sessionService
      const session: Session = {
        token: response.token,
        userId: response.user?.id ?? 0,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
        createdAt: new Date().toISOString(),
        isValid: true,
      };

      // Convert User to sessionService format
      const sessionUser: ImportedUser = {
        id: response.user?.id ?? 0,
        username: response.user?.username ?? response.user?.name ?? '',
        email: response.user?.email ?? '',
        displayName: response.user?.display_name ?? response.user?.name ?? '',
        roles: Array.isArray(response.user?.roles)
          ? response.user.roles
          : (response.user?.roles?.nodes?.map((n) => n.name) ?? []),
        isActive: true,
      };

      // Store session using sessionService
      sessionService.saveSession(session, sessionUser);

      // Also store in cookies for backward compatibility
      setJWTToken(response.token, credentials.remember);
      if (response.refreshToken) {
        setRefreshToken(response.refreshToken, credentials.remember);
        sessionService.saveRefreshToken(response.refreshToken);

        // Initialize proactive token refresh
        const expiresAt = new Date(Date.now() + (response.expires_in || 30 * 60) * 1000);
        initializeTokenState(response.token, response.refreshToken, expiresAt);
      }

      scheduleRefresh(response.token);
      return true;
    } catch (err) {
      console.error('Login error:', err);
      error.value = err instanceof Error ? err.message : 'Login failed';

      // Increment login attempts on failure
      loginAttempts.value++;
      lastFailedLoginTime.value = Date.now();

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
      hasAttemptedStoredAuth.value = false;

      // Clear token refresh state
      clearTokenState();

      // Reset login attempt tracking
      loginAttempts.value = 0;
      lastFailedLoginTime.value = null;

      // Clear sessionService storage
      sessionService.clearSession();

      // Clear stored tokens
      clearJWTTokens();

      if (refreshTimeout) {
        clearTimeout(refreshTimeout);
        refreshTimeout = null;
      }
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
      scheduleRefresh(response.token);

      // If we have user data from the refresh, update it
      if (response.user) {
        user.value = response.user;
      }

      // Note: Success notification removed - useAuthNotifications can't be called from Pinia store
      // The UI can show success state through other means (like updating the auth state)

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
          scheduleRefresh(storedToken);

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

    // If we've already attempted to load stored auth and failed, don't try again
    if (hasAttemptedStoredAuth.value && !isAuthenticated.value) {
      return false;
    }

    const storedToken = getJWTToken();

    if (!storedToken) {
      hasAttemptedStoredAuth.value = true;
      return false;
    }

    isLoadingStoredAuth.value = true;

    try {
      // Set the token immediately for better UX
      token.value = storedToken;
      scheduleRefresh(storedToken);

      // Try to validate the token in the background
      try {
        const isValid = await authService.validateToken(storedToken);
        if (!isValid) {
          console.warn('Stored token validation failed');
          // Since we don't have refresh tokens, we'll just clear the invalid token
          // and let the user log in again
          logout();
          hasAttemptedStoredAuth.value = true;
          return false;
        }
      } catch (validationError) {
        console.warn('Token validation error:', validationError);
        // Clear invalid token and let user log in again
        logout();
        hasAttemptedStoredAuth.value = true;
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

      hasAttemptedStoredAuth.value = true;
      return true;
    } catch (err) {
      console.warn('Failed to load stored auth:', err);
      logout();
      hasAttemptedStoredAuth.value = true;
      return false;
    } finally {
      isLoadingStoredAuth.value = false;
    }
  };

  const clearError = (): void => {
    error.value = null;
  };

  /**
   * Set user directly (for testing or session restoration)
   */
  const setUser = (newUser: User | null): void => {
    user.value = newUser;
  };

  /**
   * Restore session from sessionService
   */
  const restoreSession = (): boolean => {
    const session = sessionService.getSession();
    const storedUser = sessionService.getUser();

    if (!session || !storedUser || !sessionService.isSessionValid(session)) {
      return false;
    }

    // Convert stored user to User type
    const convertedUser: User = {
      id: storedUser.id,
      name: storedUser.displayName,
      display_name: storedUser.displayName,
      username: storedUser.username,
      email: storedUser.email,
      roles: Array.isArray(storedUser.roles) ? storedUser.roles : [],
    };

    token.value = session.token;
    user.value = convertedUser;

    scheduleRefresh(session.token);
    return true;
  };

  return {
    // State
    user: readonly(user),
    token: readonly(token),
    isLoading: readonly(isLoading),
    isLoadingStoredAuth: readonly(isLoadingStoredAuth),
    hasAttemptedStoredAuth: readonly(hasAttemptedStoredAuth),
    error: readonly(error),
    loginAttempts: readonly(loginAttempts),
    getLoginDelay,

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
    setUser,
    restoreSession,
  };
});

/**
 * useAuth Composable
 * Provides reactive authentication state and methods
 */

import { storeToRefs } from 'pinia';
import { useAuthStore } from 'src/stores/authStore';
import { computed } from 'vue';

/**
 * Authentication composable
 * Provides reactive access to authentication state and methods
 * Shared across all component instances
 */
export function useAuth() {
  const authStore = useAuthStore();

  // Reactive state from store
  const { user, isAuthenticated, isLoading, error, loginAttempts, getLoginDelay } =
    storeToRefs(authStore);

  // Computed properties
  const isAdmin = computed(() => authStore.isAdmin);
  const canManageOptions = computed(() => authStore.canManageOptions);

  /**
   * Check if user has a specific role
   */
  const hasRole = (role: string): boolean => {
    return authStore.hasRole(role);
  };

  /**
   * Login with credentials
   */
  const login = async (username: string, password: string, remember = true): Promise<boolean> => {
    return await authStore.login({ username, password, remember });
  };

  /**
   * Logout current user
   */
  const logout = (): void => {
    authStore.logout();
  };

  /**
   * Refresh authentication token
   */
  const refresh = async (): Promise<boolean> => {
    return await authStore.refreshToken();
  };

  /**
   * Verify current session
   */
  const verify = async (): Promise<boolean> => {
    return await authStore.loadStoredAuth();
  };

  /**
   * Restore session from storage
   */
  const restoreSession = (): boolean => {
    return authStore.restoreSession();
  };

  /**
   * Clear authentication error
   */
  const clearError = (): void => {
    authStore.clearError();
  };

  /**
   * Calculate remaining delay for next login attempt
   */
  const getRemainingDelay = computed(() => {
    return getLoginDelay.value ?? 0;
  });

  /**
   * Check if login is currently delayed
   */
  const isLoginDelayed = computed(() => {
    return (getLoginDelay.value ?? 0) > 0;
  });

  /**
   * Get delay message for UI display
   */
  const getDelayMessage = computed(() => {
    const delay = getLoginDelay.value ?? 0;
    if (delay === 0) return null;

    const seconds = Math.ceil(delay / 1000);
    if (seconds === 1) return 'Please wait 1 second before trying again';
    if (seconds < 60) return `Please wait ${seconds} seconds before trying again`;

    const minutes = Math.ceil(seconds / 60);
    return `Please wait ${minutes} minute${minutes > 1 ? 's' : ''} before trying again`;
  });

  return {
    // State
    user: computed(() => user.value),
    isAuthenticated: computed(() => isAuthenticated.value),
    isLoading: computed(() => isLoading.value),
    error: computed(() => error.value),
    loginAttempts: computed(() => loginAttempts.value),

    // Computed properties
    isAdmin,
    canManageOptions,
    getRemainingDelay,
    isLoginDelayed,
    getDelayMessage,

    // Methods
    hasRole,
    login,
    logout,
    refresh,
    verify,
    restoreSession,
    clearError,
  };
}

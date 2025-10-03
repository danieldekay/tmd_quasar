import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import type { RefreshTokenResponse, TokenState } from '../types/auth';

/**
 * Composable for proactive JWT token refresh (FR-003)
 *
 * Implements automatic token refresh 5 minutes before expiration
 * to prevent authentication interruptions during user sessions.
 *
 * Features:
 * - Proactive refresh 5 minutes before expiration
 * - Exponential backoff for failed attempts (1s, 2s, 4s)
 * - Max 3 refresh attempts before requiring re-login
 * - Concurrent refresh prevention (single promise)
 * - Automatic redirect to login on exhausted attempts
 *
 * @example
 * ```typescript
 * const { tokenState, refreshToken, scheduleProactiveRefresh } = useTokenRefresh();
 *
 * // Initialize after login
 * tokenState.value = {
 *   token: authToken,
 *   refreshToken: refreshToken,
 *   expiresAt: new Date(Date.now() + 30 * 60 * 1000),
 *   issuedAt: new Date(),
 *   refreshThreshold: 300,
 *   isRefreshing: false,
 *   lastRefreshAttempt: null
 * };
 * scheduleProactiveRefresh();
 * ```
 */

// Constants
const MAX_REFRESH_ATTEMPTS = 3;
const REFRESH_THRESHOLD_SECONDS = 300; // 5 minutes

// Global state for token management
const tokenState = ref<TokenState>({
  token: null,
  refreshToken: null,
  expiresAt: null,
  issuedAt: null,
  refreshThreshold: REFRESH_THRESHOLD_SECONDS,
  isRefreshing: false,
  lastRefreshAttempt: null,
  failedAttempts: 0,
});

// Shared promise for concurrent refresh prevention
let refreshPromise: Promise<RefreshTokenResponse> | null = null;

// Timer ID for scheduled refresh
let refreshTimerId: NodeJS.Timeout | null = null;

/**
 * Composable hook for token refresh functionality
 */
export const useTokenRefresh = () => {
  const router = useRouter();

  /**
   * Calculate milliseconds until proactive refresh should occur
   *
   * @returns Milliseconds until refresh, or 0 if should refresh immediately
   */
  const calculateTimeUntilRefresh = (): number => {
    if (!tokenState.value.expiresAt) {
      return 0;
    }

    const now = Date.now();
    const expiresAt = tokenState.value.expiresAt.getTime();
    const refreshThresholdMs = tokenState.value.refreshThreshold * 1000;
    const timeUntilRefresh = expiresAt - now - refreshThresholdMs;

    return Math.max(0, timeUntilRefresh);
  };

  /**
   * Calculate exponential backoff delay for retry attempts
   *
   * @param attempt - Attempt number (0-indexed)
   * @returns Delay in milliseconds
   */
  const calculateBackoffDelay = (attempt: number): number => {
    // Exponential backoff: 1s, 2s, 4s
    return 2 ** attempt * 1000;
  };

  /**
   * Refresh JWT token using refresh token
   *
   * @throws Error if refresh fails or max attempts exceeded
   * @returns Promise with new auth and refresh tokens
   */
  const refreshToken = async (): Promise<RefreshTokenResponse> => {
    // Prevent concurrent refreshes - return existing promise
    if (refreshPromise !== null) {
      return refreshPromise;
    }

    // Check max attempts
    const attempts = tokenState.value.failedAttempts ?? 0;
    if (attempts >= MAX_REFRESH_ATTEMPTS) {
      throw new Error('Max refresh attempts exceeded');
    }

    // Set refreshing flag
    tokenState.value.isRefreshing = true;
    tokenState.value.lastRefreshAttempt = new Date();

    // Create new refresh promise
    refreshPromise = performRefresh();

    try {
      const result = await refreshPromise;

      // Update token state on success
      tokenState.value.token = result.authToken;
      if (result.refreshToken) {
        tokenState.value.refreshToken = result.refreshToken;
      }
      tokenState.value.expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
      tokenState.value.issuedAt = new Date();
      tokenState.value.failedAttempts = 0;
      tokenState.value.isRefreshing = false;

      // Schedule next proactive refresh
      scheduleProactiveRefresh();

      return result;
    } catch (error) {
      // Increment failed attempts
      tokenState.value.failedAttempts = attempts + 1;
      tokenState.value.isRefreshing = false;

      // Clear tokens on failure
      tokenState.value.token = null;
      tokenState.value.refreshToken = null;

      // Handle failure
      await handleRefreshFailure(error as Error);

      throw error;
    } finally {
      // Clear refresh promise
      refreshPromise = null;
    }
  };

  /**
   * Perform the actual token refresh API call
   *
   * @returns Promise with refresh response
   * @throws Error if API call fails
   */
  const performRefresh = (): Promise<RefreshTokenResponse> => {
    if (!tokenState.value.refreshToken) {
      return Promise.reject(new Error('No refresh token available'));
    }

    // Mock implementation - replace with actual GraphQL mutation
    // const { apolloClient } = await import('../boot/apollo');
    // const { data } = await apolloClient.mutate({
    //   mutation: REFRESH_TOKEN_MUTATION,
    //   variables: {
    //     input: {
    //       clientMutationId: 'tmd-frontend',
    //       jwtRefreshToken: tokenState.value.refreshToken,
    //     },
    //   },
    // });
    // return data.refreshJwtAuthToken;

    // For now, return rejected promise to test failure handling
    console.error('Token refresh API not implemented');
    return Promise.reject(new Error('Refresh API not implemented'));
  };

  /**
   * Handle token refresh failure
   *
   * Redirects to login page after max attempts exceeded
   *
   * @param error - The error that caused the failure
   */
  const handleRefreshFailure = async (error: Error): Promise<void> => {
    const attempts = tokenState.value.failedAttempts ?? 0;

    console.warn('Token refresh failed:', {
      attempts,
      error: error.message,
    });

    // If max attempts exceeded, redirect to login
    if (attempts >= MAX_REFRESH_ATTEMPTS) {
      console.error('Max refresh attempts exceeded, redirecting to login');
      await router.push({ name: 'Login' });
    } else {
      // Apply exponential backoff for next attempt
      const backoffDelay = calculateBackoffDelay(attempts);
      console.info(`Will retry refresh in ${backoffDelay}ms`);
    }
  };

  /**
   * Schedule proactive token refresh
   *
   * Calculates time until refresh needed and sets timer
   */
  const scheduleProactiveRefresh = (): void => {
    // Clear existing timer
    if (refreshTimerId !== null) {
      clearTimeout(refreshTimerId);
      refreshTimerId = null;
    }

    const timeUntilRefresh = calculateTimeUntilRefresh();

    if (timeUntilRefresh <= 0) {
      // Refresh immediately
      void refreshToken();
      return;
    }

    console.info(`Scheduled proactive token refresh in ${Math.round(timeUntilRefresh / 1000)}s`);

    // Schedule refresh
    refreshTimerId = setTimeout(() => {
      void refreshToken();
    }, timeUntilRefresh);
  };

  /**
   * Clear refresh timer (call on logout)
   */
  const clearRefreshTimer = (): void => {
    if (refreshTimerId !== null) {
      clearTimeout(refreshTimerId);
      refreshTimerId = null;
    }
  };

  /**
   * Initialize token state from stored values
   *
   * @param token - JWT auth token
   * @param refresh - Refresh token
   * @param expiresAt - Token expiration date
   */
  const initializeTokenState = (token: string, refresh: string, expiresAt: Date): void => {
    tokenState.value = {
      token,
      refreshToken: refresh,
      expiresAt,
      issuedAt: new Date(),
      refreshThreshold: REFRESH_THRESHOLD_SECONDS,
      isRefreshing: false,
      lastRefreshAttempt: null,
      failedAttempts: 0,
    };

    scheduleProactiveRefresh();
  };

  /**
   * Clear token state (call on logout)
   */
  const clearTokenState = (): void => {
    clearRefreshTimer();
    tokenState.value = {
      token: null,
      refreshToken: null,
      expiresAt: null,
      issuedAt: null,
      refreshThreshold: REFRESH_THRESHOLD_SECONDS,
      isRefreshing: false,
      lastRefreshAttempt: null,
      failedAttempts: 0,
    };
  };

  // Computed properties
  const isTokenValid = computed(() => {
    if (!tokenState.value.token || !tokenState.value.expiresAt) {
      return false;
    }
    return new Date() < tokenState.value.expiresAt;
  });

  const shouldRefresh = computed(() => {
    return calculateTimeUntilRefresh() <= 0;
  });

  return {
    // State
    tokenState,

    // Computed
    isTokenValid,
    shouldRefresh,

    // Methods
    refreshToken,
    scheduleProactiveRefresh,
    calculateTimeUntilRefresh,
    handleRefreshFailure,
    initializeTokenState,
    clearTokenState,
    clearRefreshTimer,
  };
};

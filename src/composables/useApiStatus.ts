import { ref, computed } from 'vue';
import { api } from '../boot/axios';

export interface ApiError {
  name: 'NetworkError' | 'APIUnavailable' | 'ServerError' | 'NotFoundError' | 'APIError';
  message: string;
  isOffline?: boolean;
  status?: number;
  originalError?: Error;
}

export interface ApiStatusState {
  isOnline: boolean;
  isApiAvailable: boolean;
  lastError: ApiError | null;
  consecutiveFailures: number;
  lastSuccessfulRequest: Date | null;
}

// Global state for API status
const apiState = ref<ApiStatusState>({
  isOnline: navigator.onLine,
  isApiAvailable: true,
  lastError: null,
  consecutiveFailures: 0,
  lastSuccessfulRequest: null,
});

// Constants for error handling
const MAX_CONSECUTIVE_FAILURES = 3;
const API_CHECK_INTERVAL = 30000; // 30 seconds

/**
 * Composable for managing API status and providing offline-aware error handling
 */
export const useApiStatus = () => {
  // Listen to browser online/offline events
  if (typeof window !== 'undefined') {
    window.addEventListener('online', () => {
      apiState.value.isOnline = true;
      // Reset consecutive failures when coming back online
      if (apiState.value.consecutiveFailures > 0) {
        console.info('Connection restored, resetting failure count');
        apiState.value.consecutiveFailures = 0;
      }
    });

    window.addEventListener('offline', () => {
      apiState.value.isOnline = false;
      apiState.value.isApiAvailable = false;
    });
  }

  /**
   * Check if error indicates offline/unavailable API
   */
  const isOfflineError = (error: unknown): boolean => {
    if (!error || typeof error !== 'object') return false;

    const apiError = error as ApiError;
    return Boolean(
      apiError.isOffline ||
        apiError.name === 'NetworkError' ||
        apiError.name === 'APIUnavailable' ||
        (apiError.status && apiError.status >= 500),
    );
  };

  /**
   * Record a successful API request
   */
  const recordSuccess = () => {
    apiState.value.isApiAvailable = true;
    apiState.value.lastError = null;
    apiState.value.consecutiveFailures = 0;
    apiState.value.lastSuccessfulRequest = new Date();
  };

  /**
   * Record a failed API request
   */
  const recordFailure = (error: unknown) => {
    const apiError = error as ApiError;
    apiState.value.lastError = apiError;
    apiState.value.consecutiveFailures++;

    if (isOfflineError(error) || apiState.value.consecutiveFailures >= MAX_CONSECUTIVE_FAILURES) {
      apiState.value.isApiAvailable = false;
    }

    console.warn('API request failed:', {
      error: apiError.message,
      consecutiveFailures: apiState.value.consecutiveFailures,
      isOffline: isOfflineError(error),
    });
  };

  /**
   * Test API connectivity
   */
  const testApiConnectivity = async (): Promise<boolean> => {
    try {
      // Use a lightweight endpoint to test connectivity
      await api.get('/health', { timeout: 5000 });
      recordSuccess();
      return true;
    } catch (error) {
      recordFailure(error);
      return false;
    }
  };

  /**
   * Get user-friendly error message based on current state
   */
  const getErrorMessage = (error?: unknown): string => {
    if (!apiState.value.isOnline) {
      return 'You appear to be offline. Please check your internet connection.';
    }

    if (!apiState.value.isApiAvailable) {
      return 'The API is currently unavailable. Please try again later.';
    }

    if (error && typeof error === 'object') {
      const apiError = error as ApiError;
      if (apiError.message) {
        return apiError.message;
      }
    }

    return 'Something went wrong. Please try again.';
  };

  /**
   * Get retry suggestion based on current state
   */
  const getRetryMessage = (): string => {
    if (!apiState.value.isOnline) {
      return 'Check your connection and try again';
    }

    if (apiState.value.consecutiveFailures >= MAX_CONSECUTIVE_FAILURES) {
      return 'The service appears to be experiencing issues. Try again in a few minutes.';
    }

    return 'Tap to retry';
  };

  /**
   * Enhanced error wrapper for API calls
   */
  const withApiErrorHandling = async <T>(
    apiCall: () => Promise<T>,
    options: { silent?: boolean; retries?: number } = {},
  ): Promise<T> => {
    const { silent = false, retries = 0 } = options;
    let lastError: unknown;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const result = await apiCall();
        recordSuccess();
        return result;
      } catch (error) {
        lastError = error;
        recordFailure(error);

        // Don't retry on client errors (4xx) except 404
        if (typeof error === 'object' && error !== null) {
          const apiError = error as ApiError;
          if (
            apiError.status &&
            apiError.status >= 400 &&
            apiError.status < 500 &&
            apiError.status !== 404
          ) {
            break;
          }
        }

        // Wait before retry
        if (attempt < retries) {
          await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        }
      }
    }

    if (!silent) {
      console.error('API call failed after retries:', lastError);
    }

    throw lastError;
  };

  // Computed properties for reactive state
  const isOffline = computed(() => !apiState.value.isOnline);
  const isApiDown = computed(() => !apiState.value.isApiAvailable);
  const hasRecentFailures = computed(() => apiState.value.consecutiveFailures > 0);
  const canRetry = computed(() => apiState.value.isOnline);

  // Periodic API health check (only if we have failures)
  let healthCheckInterval: NodeJS.Timeout | null = null;

  const startHealthCheck = () => {
    if (healthCheckInterval) return;

    healthCheckInterval = setInterval(() => {
      if (apiState.value.consecutiveFailures > 0 && apiState.value.isOnline) {
        void testApiConnectivity();
      }
    }, API_CHECK_INTERVAL);
  };

  const stopHealthCheck = () => {
    if (healthCheckInterval) {
      clearInterval(healthCheckInterval);
      healthCheckInterval = null;
    }
  };

  return {
    // State
    apiState: computed(() => apiState.value),
    isOffline,
    isApiDown,
    hasRecentFailures,
    canRetry,

    // Methods
    isOfflineError,
    recordSuccess,
    recordFailure,
    testApiConnectivity,
    getErrorMessage,
    getRetryMessage,
    withApiErrorHandling,
    startHealthCheck,
    stopHealthCheck,
  };
};

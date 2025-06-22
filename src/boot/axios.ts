import { boot } from 'quasar/wrappers';
import type { AxiosError, InternalAxiosRequestConfig } from 'axios';
import axios from 'axios';
import { getJWTToken } from '../utils/cookies';

// Extend axios config to include metadata
interface ExtendedAxiosRequestConfig extends InternalAxiosRequestConfig {
  metadata?: {
    startTime: number;
  };
}

// Enhanced error interface
interface APIError extends Error {
  name: string;
  status?: number;
  isOffline?: boolean;
  originalError?: AxiosError;
}

const api = axios.create({
  baseURL:
    process.env.API_BASE_URL || process.env.API_URL || 'http://localhost:10014/wp-json/tmd/v3',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout
});

// Track if we're currently attempting a re-login to avoid infinite loops
let isAttemptingRelogin = false;

// Request interceptor to add request metadata and auth token
api.interceptors.request.use(
  (config: ExtendedAxiosRequestConfig) => {
    // Add timestamp for request tracking
    config.metadata = { startTime: Date.now() };

    // Add authentication token if available
    const token = getJWTToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error: Error) => Promise.reject(error),
);

// Response interceptor to handle errors globally
api.interceptors.response.use(
  (response) => {
    // Calculate request duration for monitoring
    const duration =
      Date.now() - ((response.config as ExtendedAxiosRequestConfig).metadata?.startTime || 0);
    if (duration > 5000) {
      console.warn(`Slow API request: ${response.config.url} took ${duration}ms`);
    }
    return response;
  },
  async (error: AxiosError) => {
    // Create enhanced error with additional context
    const enhancedError: APIError = new Error() as APIError;
    enhancedError.name = 'APIError';

    if (!error.response && (error.code === 'ECONNABORTED' || error.code === 'ERR_NETWORK')) {
      // Network timeout or connection error
      enhancedError.message = 'API connection failed - please check your internet connection';
      enhancedError.name = 'NetworkError';
      enhancedError.isOffline = true;
      enhancedError.originalError = error;
    } else if (!error.response) {
      // Other network errors (DNS, etc.)
      enhancedError.message = 'API is currently unavailable';
      enhancedError.name = 'APIUnavailable';
      enhancedError.isOffline = true;
      enhancedError.originalError = error;
    } else if (error.response.status === 401) {
      // Unauthorized - try automatic re-login first
      enhancedError.message = 'Authentication required';
      enhancedError.name = 'UnauthorizedError';
      enhancedError.status = error.response.status;
      enhancedError.originalError = error;

      // Try automatic re-login if not already attempting
      if (!isAttemptingRelogin) {
        isAttemptingRelogin = true;

        try {
          // Note: Removed notification calls - useAuthNotifications can't be called from axios interceptor
          // The UI can show re-login state through other means (like auth store state changes)

          // Dynamically import auth store to avoid circular dependency
          const { useAuthStore } = await import('../stores/authStore');
          const authStore = useAuthStore();

          const reloginSuccess = await authStore.attemptAutoRelogin();

          if (reloginSuccess) {
            // Re-login successful, retry the original request
            console.log('Auto-relogin successful, retrying original request');
            // Note: Success notification removed - UI can show success through auth state

            // Update the authorization header with the new token
            const newToken = getJWTToken();
            if (newToken && error.config) {
              // Create a new config to avoid the request interceptor overwriting the token
              const retryConfig = {
                ...error.config,
                headers: {
                  ...error.config.headers,
                  Authorization: `Bearer ${newToken}`,
                },
              };

              // Retry the original request with the new token
              const response = await api.request(retryConfig);
              isAttemptingRelogin = false;
              return response;
            }
          } else {
            // Re-login failed
            console.log('Auto-relogin failed');
            // Note: Failure notification removed - UI can show failure through auth state
          }
        } catch (reloginError) {
          console.warn('Auto-relogin failed:', reloginError);
          // Note: Error notification removed - UI can show error through auth state
        } finally {
          isAttemptingRelogin = false;
        }
      }

      // Auto-relogin failed or not attempted, emit event for app to handle
      if (typeof window !== 'undefined' && window.location.pathname !== '/auth/login') {
        const currentPath = window.location.pathname + window.location.search;
        // Emit a custom event that the app can listen to for proper navigation
        const authRedirectEvent = new CustomEvent('auth:redirect', {
          detail: { redirectPath: currentPath },
        });
        window.dispatchEvent(authRedirectEvent);
      }
    } else if (error.response.status >= 500) {
      // Check for specific business logic errors that return 500 status
      const responseData = error.response.data as { code?: string; message?: string } | undefined;
      if (responseData?.code === 'interaction_exists') {
        enhancedError.message = 'You have already performed this interaction';
        enhancedError.name = 'InteractionExistsError';
        enhancedError.status = error.response.status;
        enhancedError.originalError = error;
      } else {
        // General server errors
        enhancedError.message = 'API server error - please try again later';
        enhancedError.name = 'ServerError';
        enhancedError.status = error.response.status;
        enhancedError.originalError = error;
      }
    } else if (error.response.status === 404) {
      // Not found errors
      enhancedError.message = 'Requested resource not found';
      enhancedError.name = 'NotFoundError';
      enhancedError.status = error.response.status;
      enhancedError.originalError = error;
    } else {
      // Other client errors
      enhancedError.message = error.message || 'API request failed';
      enhancedError.status = error.response?.status;
      enhancedError.originalError = error;
    }

    return Promise.reject(enhancedError);
  },
);

export default boot(({ app }) => {
  // Make axios available in the app
  app.config.globalProperties.$axios = axios;
  app.config.globalProperties.$api = api;
});

export { api };

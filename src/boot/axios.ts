import { boot } from 'quasar/wrappers';
import type { AxiosError, InternalAxiosRequestConfig } from 'axios';
import axios from 'axios';

// Extend axios config to include metadata
interface ExtendedAxiosRequestConfig extends InternalAxiosRequestConfig {
  metadata?: {
    startTime: number;
  };
}

// Enhanced error type for better error handling
interface APIError extends Error {
  name: 'NetworkError' | 'APIUnavailable' | 'ServerError' | 'NotFoundError' | 'APIError';
  isOffline?: boolean;
  status?: number;
  originalError?: AxiosError;
}

const api = axios.create({
  baseURL: process.env.WORDPRESS_API_URL || 'http://localhost:10014/wp-json/tmd/v3',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout
});

// Request interceptor to add request metadata
api.interceptors.request.use(
  (config: ExtendedAxiosRequestConfig) => {
    // Add timestamp for request tracking
    config.metadata = { startTime: Date.now() };
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
  (error: AxiosError) => {
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
    } else if (error.response.status >= 500) {
      // Server errors
      enhancedError.message = 'API server error - please try again later';
      enhancedError.name = 'ServerError';
      enhancedError.status = error.response.status;
      enhancedError.originalError = error;
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
  app.config.globalProperties.$axios = axios;
  app.config.globalProperties.$api = api;
});

export { api };

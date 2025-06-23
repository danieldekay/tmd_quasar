// api-tests/config.ts
export const API_BASE_URL_V2 = 'http://localhost:10014/wp-json/tmd/v2/'; // For v2 specific tests
export const API_BASE_URL_V3 = 'http://localhost:10014/wp-json/tmd/v3/'; // For v3 specific tests

// Default to v3 if not specified, or tests can pick explicitly
export const API_BASE_URL = API_BASE_URL_V3;

// Potentially add other shared configurations here, e.g., default headers, timeouts
export const DEFAULT_REQUEST_TIMEOUT = 30000; // 30 seconds

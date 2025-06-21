import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true, // Using globals for describe, it, expect, etc.
    environment: 'node', // Explicitly set to Node.js environment
    include: ['api-tests/**/*.spec.ts'], // Pattern to find API test files
    // setupFiles: ['./api-tests/setup.ts'], // Optional: for global setup for API tests if needed later
    // globalTeardown: ['./api-tests/teardown.ts'], // Optional: for global teardown
  },
  // Ensure this config does not conflict with or inherit browser-specific setups
  // from a root vitest.config.ts if it exists and is configured for browser/DOM.
  // This config is standalone for API tests.
  resolve: {
    // Add any aliases if your API client/utility code uses them,
    // though for direct axios calls, this might not be strictly necessary.
    // alias: {
    //   '@/': new URL('./src/', import.meta.url).pathname, // Example if API utils are in src
    // },
  },
});

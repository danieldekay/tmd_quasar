/**
 * Test credentials utility for development
 * Loads credentials from credentials.local.json (gitignored)
 */

interface TestCredentials {
  testUser: {
    username: string;
    password: string;
  };
  api: {
    baseUrl: string;
    graphqlEndpoint: string;
  };
}

let cachedCredentials: TestCredentials | null = null;

/**
 * Load test credentials from credentials.local.json
 */
export const loadTestCredentials = async (): Promise<TestCredentials> => {
  if (cachedCredentials) {
    return cachedCredentials;
  }

  try {
    // Dynamic import to avoid bundling in production
    const response = await fetch('/credentials.local.json');
    if (!response.ok) {
      throw new Error(`Failed to load credentials: ${response.status}`);
    }

    cachedCredentials = (await response.json()) as TestCredentials;
    return cachedCredentials;
  } catch (error) {
    console.error('Failed to load test credentials:', error);
    throw new Error(
      'Unable to load test credentials. Please create credentials.local.json with the required fields or provide credentials via environment variables.',
    );
  }
};

/**
 * Get test user credentials
 */
export const getTestUserCredentials = async (): Promise<{ username: string; password: string }> => {
  const credentials = await loadTestCredentials();
  return credentials.testUser;
};

/**
 * Get API configuration
 */
export const getApiConfig = async (): Promise<{ baseUrl: string; graphqlEndpoint: string }> => {
  const credentials = await loadTestCredentials();
  return credentials.api;
};

/**
 * Check if we're in development mode
 */
export const isDevelopment = (): boolean => {
  return import.meta.env.DEV || import.meta.env.MODE === 'development';
};

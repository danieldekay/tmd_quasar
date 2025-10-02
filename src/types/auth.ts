/**
 * Authentication type definitions
 * 
 * Defines types for JWT token management and authentication state
 */

/**
 * Token state interface for proactive JWT refresh (FR-003)
 * 
 * Tracks token lifecycle and refresh status to enable proactive
 * refresh 5 minutes before expiration
 */
export type TokenState = {
  /** Current JWT authentication token */
  token: string | null;
  
  /** Refresh token for obtaining new JWT */
  refreshToken: string | null;
  
  /** Token expiration timestamp */
  expiresAt: Date | null;
  
  /** Token issuance timestamp */
  issuedAt: Date | null;
  
  /** Time before expiration to trigger proactive refresh (seconds) */
  refreshThreshold: number;
  
  /** Flag indicating if refresh is currently in progress */
  isRefreshing: boolean;
  
  /** Timestamp of last refresh attempt */
  lastRefreshAttempt: Date | null;
  
  /** Count of consecutive failed refresh attempts */
  failedAttempts?: number;
};

/**
 * User authentication data from GraphQL login response
 */
export type AuthUser = {
  id: string;
  email: string;
  name: string;
  capabilities?: string[];
};

/**
 * Login response from GraphQL mutation
 */
export type LoginResponse = {
  authToken: string;
  refreshToken: string;
  user: AuthUser;
};

/**
 * Refresh token response from GraphQL mutation
 */
export type RefreshTokenResponse = {
  authToken: string;
  refreshToken?: string;
};

/**
 * Session Service
 * Handles session persistence and management in localStorage
 */

import type { Session, User } from './types';

const SESSION_KEY = 'tmd_session';
const TOKEN_KEY = 'tmd_auth_token';
const REFRESH_TOKEN_KEY = 'tmd_refresh_token';
const USER_KEY = 'tmd_user';

/**
 * Session Service
 * Manages JWT token storage and session lifecycle
 */
class SessionService {
  /**
   * Save session and user data to localStorage
   */
  saveSession(session: Session, user: User): void {
    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      localStorage.setItem(TOKEN_KEY, session.token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch (error) {
      console.error('Failed to save session:', error);
      // Handle quota exceeded or other localStorage errors gracefully
    }
  }

  /**
   * Save refresh token separately
   */
  saveRefreshToken(refreshToken: string): void {
    try {
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    } catch (error) {
      console.error('Failed to save refresh token:', error);
    }
  }

  /**
   * Get current session from localStorage
   */
  getSession(): Session | null {
    try {
      const sessionData = localStorage.getItem(SESSION_KEY);
      if (!sessionData) {
        return null;
      }

      const session = JSON.parse(sessionData) as Session;
      return session;
    } catch (error) {
      console.error('Failed to parse session:', error);
      // Clear corrupted data
      this.clearSession();
      return null;
    }
  }

  /**
   * Get stored user data
   */
  getUser(): User | null {
    try {
      const userData = localStorage.getItem(USER_KEY);
      if (!userData) {
        return null;
      }

      return JSON.parse(userData) as User;
    } catch (error) {
      console.error('Failed to parse user data:', error);
      return null;
    }
  }

  /**
   * Get authentication token
   */
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  /**
   * Get refresh token
   */
  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }

  /**
   * Check if session is valid (not expired)
   */
  isSessionValid(session: Session): boolean {
    if (!session || !session.token || !session.isValid) {
      return false;
    }

    try {
      const expiresAt = new Date(session.expiresAt);
      const now = new Date();
      return expiresAt > now;
    } catch (error) {
      console.error('Failed to validate session:', error);
      return false;
    }
  }

  /**
   * Clear all session data from localStorage
   */
  clearSession(): void {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  /**
   * Update session token (after refresh)
   */
  updateToken(newToken: string): void {
    try {
      localStorage.setItem(TOKEN_KEY, newToken);

      const session = this.getSession();
      if (session) {
        session.token = newToken;
        localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      }
    } catch (error) {
      console.error('Failed to update token:', error);
    }
  }

  /**
   * Get session metadata (creation time, expiration, etc.)
   */
  getSessionMetadata(): {
    createdAt: Date | null;
    expiresAt: Date | null;
    remainingTime: number | null; // milliseconds
  } {
    const session = this.getSession();
    if (!session) {
      return {
        createdAt: null,
        expiresAt: null,
        remainingTime: null,
      };
    }

    try {
      const createdAt = new Date(session.createdAt);
      const expiresAt = new Date(session.expiresAt);
      const now = new Date();
      const remainingTime = expiresAt.getTime() - now.getTime();

      return {
        createdAt,
        expiresAt,
        remainingTime: remainingTime > 0 ? remainingTime : 0,
      };
    } catch (error) {
      console.error('Failed to get session metadata:', error);
      return {
        createdAt: null,
        expiresAt: null,
        remainingTime: null,
      };
    }
  }

  /**
   * Check if session is expiring soon (within 5 minutes)
   */
  isSessionExpiringSoon(): boolean {
    const { remainingTime } = this.getSessionMetadata();
    if (remainingTime === null) {
      return false;
    }

    const FIVE_MINUTES = 5 * 60 * 1000;
    return remainingTime < FIVE_MINUTES && remainingTime > 0;
  }
}

// Export singleton instance
export const sessionService = new SessionService();

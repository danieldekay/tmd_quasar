/**
 * useSession Composable
 * Provides reactive session state and lifecycle management
 */

import { ref, computed, onMounted, onUnmounted } from 'vue';
import { sessionService } from 'src/services/sessionService';
import type { Session, User } from 'src/services/types';

/**
 * Session management composable
 * Handles session lifecycle, expiration warnings, and persistence
 */
export function useSession() {
  // Reactive state
  const session = ref<Session | null>(null);
  const sessionUser = ref<User | null>(null);
  const isValid = ref(false);
  const isExpiringSoon = ref(false);

  // Timer for checking session expiration
  let expirationCheckInterval: ReturnType<typeof setInterval> | null = null;

  /**
   * Load session from storage
   */
  const loadSession = (): void => {
    const storedSession = sessionService.getSession();
    const storedUser = sessionService.getUser();

    if (storedSession && storedUser) {
      session.value = storedSession;
      sessionUser.value = storedUser;
      isValid.value = sessionService.isSessionValid(storedSession);
      isExpiringSoon.value = sessionService.isSessionExpiringSoon();
    } else {
      session.value = null;
      sessionUser.value = null;
      isValid.value = false;
      isExpiringSoon.value = false;
    }
  };

  /**
   * Save session to storage
   */
  const saveSession = (newSession: Session, user: User): void => {
    sessionService.saveSession(newSession, user);
    session.value = newSession;
    sessionUser.value = user;
    isValid.value = sessionService.isSessionValid(newSession);
    isExpiringSoon.value = false;
  };

  /**
   * Clear session from storage
   */
  const clearSession = (): void => {
    sessionService.clearSession();
    session.value = null;
    sessionUser.value = null;
    isValid.value = false;
    isExpiringSoon.value = false;
  };

  /**
   * Restore session on mount
   */
  const restoreSession = (): void => {
    loadSession();
  };

  /**
   * Check if session is valid
   */
  const isSessionValid = (sessionToCheck: Session): boolean => {
    return sessionService.isSessionValid(sessionToCheck);
  };

  /**
   * Get current auth token
   */
  const getToken = (): string | null => {
    return sessionService.getToken();
  };

  /**
   * Get refresh token
   */
  const getRefreshToken = (): string | null => {
    return sessionService.getRefreshToken();
  };

  /**
   * Update token after refresh
   */
  const updateToken = (newToken: string): void => {
    sessionService.updateToken(newToken);
    if (session.value) {
      session.value.token = newToken;
    }
  };

  /**
   * Get session metadata (times, expiration)
   */
  const metadata = computed(() => {
    return sessionService.getSessionMetadata();
  });

  /**
   * Get remaining time in human-readable format
   */
  const remainingTime = computed(() => {
    const { remainingTime: remaining } = metadata.value;
    if (remaining === null) return null;

    const seconds = Math.floor(remaining / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} day${days > 1 ? 's' : ''}`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''}`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''}`;
    return `${seconds} second${seconds !== 1 ? 's' : ''}`;
  });

  /**
   * Check session expiration periodically
   */
  const startExpirationCheck = (): void => {
    // Check every minute
    expirationCheckInterval = setInterval(() => {
      if (session.value) {
        isValid.value = sessionService.isSessionValid(session.value);
        isExpiringSoon.value = sessionService.isSessionExpiringSoon();

        // If session expired, clear it
        if (!isValid.value) {
          clearSession();
        }
      }
    }, 60000); // 60 seconds
  };

  /**
   * Stop expiration check
   */
  const stopExpirationCheck = (): void => {
    if (expirationCheckInterval) {
      clearInterval(expirationCheckInterval);
      expirationCheckInterval = null;
    }
  };

  // Lifecycle hooks
  onMounted(() => {
    loadSession();
    startExpirationCheck();
  });

  onUnmounted(() => {
    stopExpirationCheck();
  });

  return {
    // State
    session: computed(() => session.value),
    user: computed(() => sessionUser.value),
    isValid: computed(() => isValid.value),
    isExpiringSoon: computed(() => isExpiringSoon.value),

    // Computed
    metadata,
    remainingTime,

    // Methods
    saveSession,
    clearSession,
    restoreSession,
    isSessionValid,
    getToken,
    getRefreshToken,
    updateToken,
  };
}

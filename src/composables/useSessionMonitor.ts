import { ref, onMounted, onUnmounted } from 'vue';
import { useAuthStore } from '../stores/authStore';
import { getJWTToken } from '../utils/cookies';

interface JWTPayload {
  exp?: number;
  iat?: number;
  [key: string]: unknown;
}

export function useSessionMonitor() {
  const authStore = useAuthStore();

  const isMonitoring = ref(false);
  const timeUntilExpiry = ref<number | null>(null);

  let checkInterval: NodeJS.Timeout | null = null;
  let refreshTimeout: NodeJS.Timeout | null = null;

  // Decode JWT token to get expiration time
  const decodeJWT = (token: string): JWTPayload | null => {
    try {
      const parts = token.split('.');
      if (parts.length !== 3 || !parts[1]) {
        throw new Error('Invalid JWT format');
      }

      const base64Url = parts[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join(''),
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.warn('Failed to decode JWT token:', error);
      return null;
    }
  };

  // Get token expiration time in milliseconds
  const getTokenExpirationTime = (): number | null => {
    const token = getJWTToken();
    if (!token) return null;

    const payload = decodeJWT(token);
    if (!payload?.exp) return null;

    // Convert from seconds to milliseconds
    return payload.exp * 1000;
  };

  // Check if token is expired or will expire soon
  const checkTokenExpiration = () => {
    const expirationTime = getTokenExpirationTime();
    if (!expirationTime) {
      timeUntilExpiry.value = null;
      return;
    }

    const now = Date.now();
    const timeLeft = expirationTime - now;
    timeUntilExpiry.value = timeLeft;

    // Token is already expired
    if (timeLeft <= 0) {
      console.log('Token has expired, attempting auto-relogin');
      void authStore.attemptAutoRelogin();
      return;
    }

    // Set timeout to attempt refresh when there's 10 minutes left
    const tenMinutes = 10 * 60 * 1000;
    if (timeLeft > tenMinutes && !refreshTimeout) {
      refreshTimeout = setTimeout(() => {
        console.log('Attempting proactive token refresh (10 minutes before expiry)');
        void authStore.attemptAutoRelogin();
        refreshTimeout = null;
      }, timeLeft - tenMinutes);
    }
  };

  // Start monitoring session
  const startMonitoring = () => {
    if (isMonitoring.value) return;

    console.log('Starting session monitoring');
    isMonitoring.value = true;

    // Check immediately
    checkTokenExpiration();

    // Check every minute
    checkInterval = setInterval(checkTokenExpiration, 60000);
  };

  // Stop monitoring session
  const stopMonitoring = () => {
    console.log('Stopping session monitoring');
    isMonitoring.value = false;

    if (checkInterval) {
      clearInterval(checkInterval);
      checkInterval = null;
    }

    if (refreshTimeout) {
      clearTimeout(refreshTimeout);
      refreshTimeout = null;
    }
  };

  // Get human-readable time until expiry
  const getTimeUntilExpiryString = (): string | null => {
    if (!timeUntilExpiry.value || timeUntilExpiry.value <= 0) return null;

    const minutes = Math.floor(timeUntilExpiry.value / (60 * 1000));
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      const remainingMinutes = minutes % 60;
      return `${hours}h ${remainingMinutes}m`;
    } else {
      return `${minutes}m`;
    }
  };

  // Manually refresh session
  const refreshSession = async (): Promise<boolean> => {
    console.log('Manually refreshing session');
    return await authStore.attemptAutoRelogin();
  };

  // Auto-start monitoring when authenticated
  onMounted(() => {
    if (authStore.isAuthenticated) {
      startMonitoring();
    }
  });

  // Clean up on unmount
  onUnmounted(() => {
    stopMonitoring();
  });

  return {
    isMonitoring,
    timeUntilExpiry,
    startMonitoring,
    stopMonitoring,
    refreshSession,
    getTimeUntilExpiryString,
    checkTokenExpiration,
  };
}

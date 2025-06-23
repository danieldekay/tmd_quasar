import { useQuasar } from 'quasar';

export function useAuthNotifications() {
  const $q = useQuasar();

  const showAutoReloginAttempt = () => {
    $q.notify({
      type: 'info',
      message: 'Session expired, attempting to reconnect...',
      icon: 'refresh',
      position: 'top',
      timeout: 2000,
      actions: [
        {
          icon: 'close',
          color: 'white',
          round: true,
          handler: () => {
            // Dismiss notification
          },
        },
      ],
    });
  };

  const showAutoReloginSuccess = () => {
    $q.notify({
      type: 'positive',
      message: 'Successfully reconnected to your session',
      icon: 'check_circle',
      position: 'top',
      timeout: 3000,
    });
  };

  const showAutoReloginFailed = () => {
    $q.notify({
      type: 'warning',
      message: 'Session expired. Please log in again.',
      icon: 'warning',
      position: 'top',
      timeout: 5000,
      actions: [
        {
          label: 'Login',
          color: 'white',
          handler: () => {
            // Redirect to login will happen automatically
          },
        },
      ],
    });
  };

  const showTokenRefreshed = () => {
    $q.notify({
      type: 'positive',
      message: 'Session refreshed successfully',
      icon: 'verified_user',
      position: 'top',
      timeout: 2000,
    });
  };

  const showNetworkError = () => {
    $q.notify({
      type: 'negative',
      message: 'Network connection issue. Please check your internet connection.',
      icon: 'wifi_off',
      position: 'top',
      timeout: 5000,
      actions: [
        {
          label: 'Retry',
          color: 'white',
          handler: () => {
            // Retry will be handled by the calling code
            window.location.reload();
          },
        },
      ],
    });
  };

  const showSessionWarning = (minutesLeft: number) => {
    $q.notify({
      type: 'warning',
      message: `Your session will expire in ${minutesLeft} minutes. Save your work!`,
      icon: 'schedule',
      position: 'top',
      timeout: 10000,
      actions: [
        {
          label: 'Extend Session',
          color: 'white',
          handler: () => {
            // This could trigger a token refresh
          },
        },
      ],
    });
  };

  return {
    showAutoReloginAttempt,
    showAutoReloginSuccess,
    showAutoReloginFailed,
    showTokenRefreshed,
    showNetworkError,
    showSessionWarning,
  };
}

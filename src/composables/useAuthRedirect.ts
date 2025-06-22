import { onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';

export const useAuthRedirect = () => {
  const router = useRouter();

  const handleAuthRedirect = (event: Event) => {
    const customEvent = event as CustomEvent<{ redirectPath: string }>;
    const { redirectPath } = customEvent.detail;
    void router.push(`/auth/login?redirect=${encodeURIComponent(redirectPath)}`);
  };

  onMounted(() => {
    window.addEventListener('auth:redirect', handleAuthRedirect);
  });

  onUnmounted(() => {
    window.removeEventListener('auth:redirect', handleAuthRedirect);
  });
};

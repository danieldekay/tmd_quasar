import { defineStore } from 'pinia';
import { ref, computed, readonly } from 'vue';
import { authService } from '../services/authService';

export interface User {
  id: number;
  name: string;
  email: string;
  roles: string[];
  avatar_urls?: Record<string, string>;
  url?: string;
  description?: string;
  link?: string;
  slug?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
  expires_in?: number;
}

export interface LoginCredentials {
  username: string;
  password: string;
  remember?: boolean;
}

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(null);
  const token = ref<string | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Computed
  const isAuthenticated = computed(() => Boolean(token.value && user.value));
  const hasRole = computed(() => (role: string) => user.value?.roles.includes(role) ?? false);
  const isAdmin = computed(() => hasRole.value('administrator'));

  // Actions
  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await authService.login(credentials);

      token.value = response.token;
      user.value = response.user;

      // Store token based on remember preference
      if (credentials.remember) {
        localStorage.setItem('auth_token', response.token);
        localStorage.setItem('auth_user', JSON.stringify(response.user));
      } else {
        sessionStorage.setItem('auth_token', response.token);
        sessionStorage.setItem('auth_user', JSON.stringify(response.user));
      }

      return true;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Login failed';
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      if (token.value) {
        await authService.logout(token.value);
      }
    } catch (err) {
      console.warn('Logout error:', err);
    } finally {
      // Clear state regardless of API call success
      token.value = null;
      user.value = null;
      error.value = null;

      // Clear stored data
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      sessionStorage.removeItem('auth_token');
      sessionStorage.removeItem('auth_user');
    }
  };

  const refreshToken = async (): Promise<boolean> => {
    if (!token.value) return false;

    try {
      const response = await authService.refreshToken(token.value);
      token.value = response.token;
      user.value = response.user;

      // Update stored token
      const storage = localStorage.getItem('auth_token') ? localStorage : sessionStorage;
      storage.setItem('auth_token', response.token);
      storage.setItem('auth_user', JSON.stringify(response.user));

      return true;
    } catch (err) {
      console.warn('Token refresh failed:', err);
      await logout();
      return false;
    }
  };

  const loadStoredAuth = async (): Promise<boolean> => {
    // Try localStorage first (remember me), then sessionStorage
    let storedToken = localStorage.getItem('auth_token');
    let storedUser = localStorage.getItem('auth_user');

    if (!storedToken || !storedUser) {
      storedToken = sessionStorage.getItem('auth_token');
      storedUser = sessionStorage.getItem('auth_user');
    }

    if (!storedToken || !storedUser) {
      return false;
    }

    try {
      // Validate stored token
      const isValid = await authService.validateToken(storedToken);
      if (!isValid) {
        throw new Error('Stored token is invalid');
      }

      token.value = storedToken;
      user.value = JSON.parse(storedUser) as User;

      // Try to refresh token in background
      void refreshToken();

      return true;
    } catch (err) {
      console.warn('Failed to load stored auth:', err);
      await logout();
      return false;
    }
  };

  const clearError = (): void => {
    error.value = null;
  };

  return {
    // State
    user: readonly(user),
    token: readonly(token),
    isLoading: readonly(isLoading),
    error: readonly(error),

    // Computed
    isAuthenticated,
    hasRole,
    isAdmin,

    // Actions
    login,
    logout,
    refreshToken,
    loadStoredAuth,
    clearError,
  };
});

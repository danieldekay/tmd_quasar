import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router';
import { useAuthStore } from '../stores/authStore';

/**
 * Require authentication to access route
 */
export const requireAuth = async (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext,
): Promise<void> => {
  const authStore = useAuthStore();

  // Load stored authentication if not already loaded
  if (!authStore.isAuthenticated) {
    await authStore.loadStoredAuth();
  }

  if (authStore.isAuthenticated) {
    next();
  } else {
    next({
      path: '/auth/login',
      query: { redirect: to.fullPath },
    });
  }
};

/**
 * Require specific role to access route
 */
export const requireRole = (requiredRole: string) => {
  return async (
    to: RouteLocationNormalized,
    from: RouteLocationNormalized,
    next: NavigationGuardNext,
  ): Promise<void> => {
    const authStore = useAuthStore();

    // Load stored authentication if not already loaded
    if (!authStore.isAuthenticated) {
      await authStore.loadStoredAuth();
    }

    if (authStore.isAuthenticated && authStore.hasRole(requiredRole)) {
      next();
    } else if (!authStore.isAuthenticated) {
      next({
        path: '/auth/login',
        query: { redirect: to.fullPath },
      });
    } else {
      next({
        path: '/auth/unauthorized',
      });
    }
  };
};

/**
 * Require admin role to access route
 */
export const requireAdmin = async (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext,
): Promise<void> => {
  const authStore = useAuthStore();

  // Load stored authentication if not already loaded
  if (!authStore.isAuthenticated) {
    await authStore.loadStoredAuth();
  }

  if (authStore.isAuthenticated && authStore.isAdmin) {
    next();
  } else if (!authStore.isAuthenticated) {
    next({
      path: '/auth/login',
      query: { redirect: to.fullPath },
    });
  } else {
    next({
      path: '/auth/unauthorized',
    });
  }
};

/**
 * Require manage_options capability to access route
 */
export const requireManageOptions = async (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext,
): Promise<void> => {
  const authStore = useAuthStore();

  // Load stored authentication if not already loaded
  if (!authStore.isAuthenticated) {
    await authStore.loadStoredAuth();
  }

  if (authStore.isAuthenticated && authStore.canManageOptions) {
    next();
  } else if (!authStore.isAuthenticated) {
    next({
      path: '/auth/login',
      query: { redirect: to.fullPath },
    });
  } else {
    next({
      path: '/auth/unauthorized',
    });
  }
};

/**
 * Redirect authenticated users away from auth pages
 */
export const redirectIfAuthenticated = (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext,
): void => {
  const authStore = useAuthStore();

  if (authStore.isAuthenticated) {
    // Redirect to intended page or home
    const redirect = to.query.redirect as string;
    next({ path: redirect || '/' });
  } else {
    next();
  }
};

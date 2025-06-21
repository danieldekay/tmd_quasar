import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router';
import { useAuthStore } from '../stores/authStore';

/**
 * Require authentication to access route
 */
export const requireAuth = (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext,
): void => {
  const authStore = useAuthStore();

  if (!authStore.isAuthenticated) {
    // Redirect to login with return URL
    next({
      path: '/login',
      query: { redirect: to.fullPath },
    });
  } else {
    next();
  }
};

/**
 * Require specific role to access route
 */
export const requireRole =
  (role: string) =>
  (to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext): void => {
    const authStore = useAuthStore();

    if (!authStore.isAuthenticated) {
      next({
        path: '/login',
        query: { redirect: to.fullPath },
      });
    } else if (!authStore.hasRole(role)) {
      // Redirect to unauthorized page or home
      next({ path: '/unauthorized' });
    } else {
      next();
    }
  };

/**
 * Require admin role to access route
 */
export const requireAdmin = (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext,
): void => {
  const authStore = useAuthStore();

  if (!authStore.isAuthenticated) {
    next({
      path: '/login',
      query: { redirect: to.fullPath },
    });
  } else if (!authStore.isAdmin) {
    next({ path: '/unauthorized' });
  } else {
    next();
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

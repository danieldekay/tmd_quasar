<template>
  <div v-if="canAccessContent" class="auth-guard-content">
    <slot />
  </div>
  <div v-else-if="!redirectOnFailure" class="auth-guard-unauthorized">
    <slot name="unauthorized">
      <q-banner class="bg-warning text-dark" rounded>
        <template #avatar>
          <q-icon name="lock" color="dark" />
        </template>
        <div class="text-h6">Authentication Required</div>
        <div class="text-body2">You must be logged in to view this content.</div>
        <template #action>
          <q-btn flat color="dark" label="Sign In" @click="redirectToLogin" />
        </template>
      </q-banner>
    </slot>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuth } from 'src/composables/useAuth';

/**
 * AuthGuard Component
 *
 * Component-level authentication protection wrapper.
 * Use this to conditionally render content based on authentication state.
 *
 * For route-level protection, use navigation guards in router/guards.ts.
 *
 * @example
 * <AuthGuard>
 *   <ProtectedContent />
 * </AuthGuard>
 *
 * @example With custom unauthorized message
 * <AuthGuard :redirect-on-failure="false">
 *   <ProtectedContent />
 *   <template #unauthorized>
 *     <CustomUnauthorizedMessage />
 *   </template>
 * </AuthGuard>
 */

// Props
interface Props {
  /** Whether to redirect to login page when not authenticated (default: true) */
  redirectOnFailure?: boolean;
  /** Required role to access content */
  requiredRole?: string;
}

const props = withDefaults(defineProps<Props>(), {
  redirectOnFailure: true,
});

// Composables
const { isAuthenticated, hasRole } = useAuth();
const router = useRouter();
const route = useRoute();

// Computed
const hasRequiredRole = computed(() => {
  if (!props.requiredRole) return true;
  return hasRole(props.requiredRole);
});

const canAccessContent = computed(() => {
  return isAuthenticated.value && hasRequiredRole.value;
});

// Methods
const redirectToLogin = (): void => {
  void router.push({
    path: '/auth/login',
    query: { redirect: route.fullPath },
  });
};

// Lifecycle
onMounted(() => {
  // Redirect to login if not authenticated and redirectOnFailure is true
  if (!canAccessContent.value && props.redirectOnFailure) {
    redirectToLogin();
  }
});

// Expose for testing
defineExpose({
  isAuthenticated,
  hasRequiredRole,
  canAccessContent,
  redirectToLogin,
});
</script>

<style lang="scss" scoped>
.auth-guard-content {
  width: 100%;
  height: 100%;
}

.auth-guard-unauthorized {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  min-height: 200px;

  .q-banner {
    max-width: 600px;
    width: 100%;
  }
}

// Mobile-first responsive design
@media (max-width: 600px) {
  .auth-guard-unauthorized {
    padding: 16px;
  }
}
</style>

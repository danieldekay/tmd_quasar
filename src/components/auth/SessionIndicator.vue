<template>
  <div class="session-indicator" :class="statusClass">
    <q-btn
      v-if="!isAuthenticated"
      flat
      dense
      color="primary"
      icon="login"
      label="Sign In"
      aria-label="Sign in to your account"
      @click="navigateToLogin"
    />

    <div v-else class="session-info">
      <!-- User Info -->
      <q-btn
        flat
        dense
        :icon="userIcon"
        :label="displayName"
        class="session-user-btn"
        aria-label="View account menu"
      >
        <q-menu>
          <q-list style="min-width: 200px">
            <!-- User Details -->
            <q-item>
              <q-item-section>
                <q-item-label class="text-weight-bold">
                  {{ user?.displayName || user?.username || 'User' }}
                </q-item-label>
                <q-item-label caption>{{ user?.email || '' }}</q-item-label>
              </q-item-section>
            </q-item>

            <q-separator />

            <!-- Session Status -->
            <q-item v-if="session">
              <q-item-section avatar>
                <q-icon :name="statusIcon" :color="statusColor" />
              </q-item-section>
              <q-item-section>
                <q-item-label caption>Session Status</q-item-label>
                <q-item-label>{{ statusText }}</q-item-label>
              </q-item-section>
            </q-item>

            <!-- Expiration Warning -->
            <q-item v-if="isExpiringSoon && session">
              <q-item-section avatar>
                <q-icon name="schedule" color="warning" />
              </q-item-section>
              <q-item-section>
                <q-item-label caption>Session Expires</q-item-label>
                <q-item-label class="text-warning">{{ timeRemaining }}</q-item-label>
              </q-item-section>
            </q-item>

            <q-separator />

            <!-- Profile Link -->
            <q-item clickable @click="navigateToProfile">
              <q-item-section avatar>
                <q-icon name="person" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Profile</q-item-label>
              </q-item-section>
            </q-item>

            <!-- Logout -->
            <q-item clickable @click="handleLogout">
              <q-item-section avatar>
                <q-icon name="logout" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Sign Out</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </q-btn>

      <!-- Session Expiration Badge -->
      <q-badge
        v-if="isExpiringSoon"
        color="warning"
        floating
        rounded
        :aria-label="`Session expires ${timeRemaining}`"
      >
        <q-icon name="schedule" size="xs" />
      </q-badge>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from 'src/composables/useAuth';
import { useSession } from 'src/composables/useSession';

/**
 * SessionIndicator Component
 *
 * Displays current authentication and session status.
 * Shows user info, session expiration warnings, and provides quick access to profile and logout.
 *
 * Mobile-first design with responsive layout and accessibility features.
 *
 * @example
 * <SessionIndicator />
 */

// Composables
const { isAuthenticated, user, logout } = useAuth();
const { session, isValid, isExpiringSoon, getRemainingTime } = useSession();
const router = useRouter();

// Computed
const displayName = computed(() => {
  if (!user.value) return '';
  return user.value.displayName || user.value.username || 'User';
});

const userIcon = computed(() => {
  if (!user.value) return 'person';

  // Show admin icon for administrators
  if (user.value.roles?.includes('administrator')) {
    return 'admin_panel_settings';
  }

  return 'person';
});

const statusClass = computed(() => {
  if (!isAuthenticated.value) return 'session-indicator--logged-out';
  if (!isValid.value) return 'session-indicator--invalid';
  if (isExpiringSoon.value) return 'session-indicator--expiring';
  return 'session-indicator--active';
});

const statusIcon = computed(() => {
  if (!isValid.value) return 'error';
  if (isExpiringSoon.value) return 'warning';
  return 'check_circle';
});

const statusColor = computed(() => {
  if (!isValid.value) return 'negative';
  if (isExpiringSoon.value) return 'warning';
  return 'positive';
});

const statusText = computed(() => {
  if (!isValid.value) return 'Invalid';
  if (isExpiringSoon.value) return 'Expiring Soon';
  return 'Active';
});

const timeRemaining = computed(() => {
  if (!session.value) return '';
  return getRemainingTime();
});

// Methods
const navigateToLogin = (): void => {
  void router.push('/auth/login');
};

const navigateToProfile = (): void => {
  void router.push('/profile');
};

const handleLogout = (): void => {
  logout();
  void router.push('/auth/login');
};

// Expose for testing
defineExpose({
  isAuthenticated,
  user,
  session,
  isValid,
  isExpiringSoon,
  timeRemaining,
  displayName,
  statusClass,
  handleLogout,
});
</script>

<style lang="scss" scoped>
.session-indicator {
  display: flex;
  align-items: center;
  gap: 8px;

  &--logged-out {
    // Styles for logged out state
  }

  &--invalid {
    .session-user-btn {
      color: $negative;
    }
  }

  &--expiring {
    .session-user-btn {
      color: $warning;
    }
  }

  &--active {
    .session-user-btn {
      color: $primary;
    }
  }
}

.session-info {
  position: relative;
  display: flex;
  align-items: center;
}

.session-user-btn {
  text-transform: none;

  // Truncate long names on mobile
  :deep(.q-btn__content) {
    max-width: 150px;

    @media (max-width: 600px) {
      max-width: 100px;
    }
  }

  :deep(.block) {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

// Ensure good contrast for accessibility
.q-item-label {
  &.text-warning {
    font-weight: 500;
  }
}

// Mobile-first responsive design
@media (max-width: 600px) {
  .session-indicator {
    gap: 4px;
  }
}
</style>

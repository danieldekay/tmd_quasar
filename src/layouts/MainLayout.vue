<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer" />

        <q-toolbar-title> Tango Marathon Directory </q-toolbar-title>

        <q-btn flat round dense icon="search" />

        <!-- User Authentication Section -->
        <div v-if="authStore.isAuthenticated" class="row items-center q-gutter-sm">
          <!-- Welcome Message -->
          <div class="text-caption q-mr-sm">Welcome, {{ getUserDisplayName() }}!</div>

          <!-- Admin Icon for users with manage_options -->
          <q-btn
            v-if="authStore.canManageOptions"
            flat
            round
            dense
            icon="admin_panel_settings"
            color="warning"
            class="q-mr-sm"
            @click="$router.push('/debug')"
          >
            <q-tooltip>Admin Panel</q-tooltip>
          </q-btn>

          <q-btn flat round dense icon="notifications" />

          <!-- User Avatar with Menu -->
          <q-btn flat round dense>
            <q-avatar size="36px" class="q-ml-sm">
              <img
                v-if="getUserAvatar()"
                :src="getUserAvatar()"
                :alt="authStore.user?.name || 'User'"
              />
              <q-icon v-else name="person" size="24px" />
            </q-avatar>
          </q-btn>

          <q-menu>
            <q-list style="min-width: 200px">
              <q-item>
                <q-item-section avatar>
                  <q-avatar size="40px">
                    <img
                      v-if="getUserAvatar()"
                      :src="getUserAvatar()"
                      :alt="authStore.user?.name || 'User'"
                    />
                    <q-icon v-else name="person" size="24px" />
                  </q-avatar>
                </q-item-section>
                <q-item-section>
                  <q-item-label>
                    {{ authStore.user?.name || 'User' }}
                    <q-chip
                      v-if="authStore.canManageOptions"
                      color="warning"
                      text-color="white"
                      size="sm"
                      class="q-ml-xs"
                    >
                      Admin
                    </q-chip>
                  </q-item-label>
                  <q-item-label caption>{{ authStore.user?.email || 'No email' }}</q-item-label>
                </q-item-section>
              </q-item>

              <q-separator />

              <q-item clickable v-close-popup @click="$router.push('/profile')">
                <q-item-section avatar>
                  <q-icon name="person" />
                </q-item-section>
                <q-item-section>Profile</q-item-section>
              </q-item>

              <q-item clickable v-close-popup @click="$router.push('/favorites')">
                <q-item-section avatar>
                  <q-icon name="favorite" />
                </q-item-section>
                <q-item-section>My Favorites</q-item-section>
                <q-item-section side v-if="getInteractionCounts().total > 0">
                  <div class="row items-center q-gutter-xs">
                    <q-badge
                      v-if="getInteractionCounts().likes > 0"
                      :label="getInteractionCounts().likes"
                      color="red-6"
                      rounded
                    >
                      <q-tooltip>{{ getInteractionCounts().likes }} Likes</q-tooltip>
                    </q-badge>
                    <q-badge
                      v-if="getInteractionCounts().bookmarks > 0"
                      :label="getInteractionCounts().bookmarks"
                      color="amber-6"
                      rounded
                    >
                      <q-tooltip>{{ getInteractionCounts().bookmarks }} Bookmarks</q-tooltip>
                    </q-badge>
                    <q-badge
                      v-if="getInteractionCounts().reminders > 0"
                      :label="getInteractionCounts().reminders"
                      color="green-6"
                      rounded
                    >
                      <q-tooltip>{{ getInteractionCounts().reminders }} Reminders</q-tooltip>
                    </q-badge>
                  </div>
                </q-item-section>
              </q-item>

              <q-item clickable v-close-popup @click="$router.push('/dashboard')">
                <q-item-section avatar>
                  <q-icon name="dashboard" />
                </q-item-section>
                <q-item-section>Dashboard</q-item-section>
              </q-item>

              <!-- Admin Menu Item -->
              <q-item
                v-if="authStore.canManageOptions"
                clickable
                v-close-popup
                @click="$router.push('/debug')"
              >
                <q-item-section avatar>
                  <q-icon name="admin_panel_settings" color="warning" />
                </q-item-section>
                <q-item-section>Admin Panel</q-item-section>
              </q-item>

              <q-separator />

              <q-item clickable v-close-popup @click="handleLogout">
                <q-item-section avatar>
                  <q-icon name="logout" />
                </q-item-section>
                <q-item-section>Sign Out</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </div>

        <!-- Login Button for unauthenticated users -->
        <q-btn v-else flat color="white" label="Login" @click="$router.push('/auth/login')" />
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered class="bg-grey-1">
      <q-list>
        <q-item-label header> Navigation </q-item-label>

        <q-item v-for="link in linksList" :key="link.title" clickable v-ripple :to="link.link">
          <q-item-section avatar>
            <q-icon :name="link.icon" />
          </q-item-section>
          <q-item-section>
            {{ link.title }}
          </q-item-section>
        </q-item>

        <!-- User-specific navigation -->
        <template v-if="authStore.isAuthenticated">
          <q-separator class="q-my-md" />

          <q-item-label header> My Account </q-item-label>

          <q-item clickable v-ripple to="/favorites">
            <q-item-section avatar>
              <q-icon name="favorite" />
            </q-item-section>
            <q-item-section> My Favorites </q-item-section>
            <q-item-section side v-if="getInteractionCounts().total > 0">
              <div class="row items-center q-gutter-xs">
                <q-badge
                  v-if="getInteractionCounts().likes > 0"
                  :label="getInteractionCounts().likes"
                  color="red-6"
                  rounded
                >
                  <q-tooltip>{{ getInteractionCounts().likes }} Likes</q-tooltip>
                </q-badge>
                <q-badge
                  v-if="getInteractionCounts().bookmarks > 0"
                  :label="getInteractionCounts().bookmarks"
                  color="amber-6"
                  rounded
                >
                  <q-tooltip>{{ getInteractionCounts().bookmarks }} Bookmarks</q-tooltip>
                </q-badge>
                <q-badge
                  v-if="getInteractionCounts().reminders > 0"
                  :label="getInteractionCounts().reminders"
                  color="green-6"
                  rounded
                >
                  <q-tooltip>{{ getInteractionCounts().reminders }} Reminders</q-tooltip>
                </q-badge>
              </div>
            </q-item-section>
          </q-item>

          <q-item clickable v-ripple to="/dashboard">
            <q-item-section avatar>
              <q-icon name="dashboard" />
            </q-item-section>
            <q-item-section> Dashboard </q-item-section>
          </q-item>

          <q-item clickable v-ripple to="/profile">
            <q-item-section avatar>
              <q-icon name="person" />
            </q-item-section>
            <q-item-section> Profile </q-item-section>
          </q-item>
        </template>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { Notify } from 'quasar';
import { useAuthStore } from '../stores/authStore';
import { useSessionMonitor } from '../composables/useSessionMonitor';
import { useInteractionCache } from '../composables/useInteractionCache';

const router = useRouter();
const authStore = useAuthStore();
const sessionMonitor = useSessionMonitor();
const interactionCache = useInteractionCache();

interface LinkProps {
  title: string;
  icon: string;
  link: string;
}

const linksList: LinkProps[] = [
  {
    title: 'Home',
    icon: 'home',
    link: '/',
  },
  {
    title: 'Events',
    icon: 'event',
    link: '/events',
  },
  {
    title: 'Events (Q)',
    icon: 'event_note',
    link: '/events-q',
  },
  {
    title: 'DJs',
    icon: 'music_note',
    link: '/djs',
  },
  {
    title: 'Teachers',
    icon: 'school',
    link: '/teachers',
  },
  {
    title: 'Couples',
    icon: 'people',
    link: '/couples',
  },
  {
    title: 'Event Series',
    icon: 'event_repeat',
    link: '/event-series',
  },
  {
    title: 'About',
    icon: 'info',
    link: '/about',
  },
  // Debug link only for admin users
  ...(authStore.canManageOptions
    ? [
        {
          title: 'Debug',
          icon: 'bug_report',
          link: '/debug',
        },
      ]
    : []),
];

const leftDrawerOpen = ref(false);

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value;
}

const handleLogout = async () => {
  try {
    authStore.logout();
    Notify.create({
      type: 'positive',
      message: 'Signed out successfully',
      position: 'top',
    });
    await router.push('/');
  } catch (error) {
    console.error('Logout error:', error);
    Notify.create({
      type: 'negative',
      message: 'Failed to sign out',
      position: 'top',
    });
  }
};

// Load stored authentication on app start
onMounted(async () => {
  await authStore.loadStoredAuth();
});

// Watch authentication state to start/stop session monitoring
watch(
  () => authStore.isAuthenticated,
  (isAuthenticated) => {
    if (isAuthenticated) {
      sessionMonitor.startMonitoring();
    } else {
      sessionMonitor.stopMonitoring();
    }
  },
  { immediate: true },
);

function getUserDisplayName(): string {
  if (!authStore.user?.name) return 'User';

  // Try to get first name from full name
  const nameParts = authStore.user.name.trim().split(' ');
  return nameParts[0] || authStore.user.name;
}

function getUserAvatar(): string {
  // First try WordPress avatar
  if (authStore.user?.avatar_urls?.['96']) {
    return authStore.user.avatar_urls['96'];
  }

  // Fallback to Gravatar if user has email
  if (authStore.user?.email) {
    const email = authStore.user.email.trim().toLowerCase();
    // Use a simple hash for Gravatar fallback
    const hash = email
      .split('')
      .reduce((a, b) => {
        a = (a << 5) - a + b.charCodeAt(0);
        return a & a;
      }, 0)
      .toString(16)
      .padStart(8, '0');
    return `https://www.gravatar.com/avatar/${hash}?d=identicon&s=96`;
  }

  return '';
}

function getInteractionCounts(): {
  total: number;
  likes: number;
  bookmarks: number;
  reminders: number;
} {
  const counts = interactionCache.interactionCounts.value;
  return {
    total: counts.likes + counts.bookmarks + counts.reminders + counts.follows,
    likes: counts.likes,
    bookmarks: counts.bookmarks,
    reminders: counts.reminders,
  };
}
</script>

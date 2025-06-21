<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer" />

        <q-toolbar-title> Tango Marathon Directory </q-toolbar-title>

        <q-btn flat round dense icon="search" />

        <!-- User Authentication Section -->
        <div v-if="authStore.isAuthenticated" class="row items-center q-gutter-sm">
          <q-btn flat round dense icon="notifications" />

          <!-- User Menu -->
          <q-btn flat round dense>
            <q-avatar size="32px">
              <img
                v-if="authStore.user?.avatar_urls?.['96']"
                :src="authStore.user.avatar_urls['96']"
              />
              <q-icon v-else name="person" />
            </q-avatar>
          </q-btn>

          <q-menu>
            <q-list style="min-width: 200px">
              <q-item>
                <q-item-section>
                  <q-item-label>{{ authStore.user?.name }}</q-item-label>
                  <q-item-label caption>{{ authStore.user?.email }}</q-item-label>
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
              </q-item>

              <q-item clickable v-close-popup @click="$router.push('/dashboard')">
                <q-item-section avatar>
                  <q-icon name="dashboard" />
                </q-item-section>
                <q-item-section>Dashboard</q-item-section>
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
        <q-btn
          v-else
          flat
          round
          dense
          icon="login"
          @click="$router.push('/login')"
          aria-label="Sign In"
        />
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

        <q-separator class="q-my-md" />

        <q-item-label header> Event Types </q-item-label>

        <q-item clickable v-ripple to="/events?type=marathon">
          <q-item-section avatar>
            <q-icon name="event" />
          </q-item-section>
          <q-item-section> Marathons </q-item-section>
        </q-item>

        <q-item clickable v-ripple to="/events?type=festival">
          <q-item-section avatar>
            <q-icon name="celebration" />
          </q-item-section>
          <q-item-section> Festivals </q-item-section>
        </q-item>

        <q-item clickable v-ripple to="/events?type=encuentro">
          <q-item-section avatar>
            <q-icon name="groups" />
          </q-item-section>
          <q-item-section> Encuentros </q-item-section>
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
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { useAuthStore } from '../stores/authStore';

const router = useRouter();
const $q = useQuasar();
const authStore = useAuthStore();

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
  {
    title: 'Debug',
    icon: 'bug_report',
    link: '/debug',
  },
];

const leftDrawerOpen = ref(false);

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value;
}

const handleLogout = async () => {
  try {
    await authStore.logout();
    $q.notify({
      type: 'positive',
      message: 'Signed out successfully',
      position: 'top',
    });
    await router.push('/');
  } catch (error) {
    console.error('Logout error:', error);
    $q.notify({
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
</script>

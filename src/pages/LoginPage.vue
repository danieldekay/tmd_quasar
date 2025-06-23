<template>
  <q-page class="flex flex-center bg-grey-1">
    <div class="login-container">
      <q-card class="login-card q-pa-lg">
        <q-card-section class="text-center">
          <div class="text-h4 q-mb-sm">Welcome Back</div>
          <div class="text-body2 text-grey-6">Sign in to your Tango Marathons account</div>
        </q-card-section>

        <q-card-section>
          <q-form @submit="handleLogin" class="q-gutter-md">
            <q-input
              v-model="form.username"
              label="Username or Email"
              type="text"
              outlined
              :rules="[(val) => !!val || 'Username is required']"
              :disable="isLoading"
            >
              <template #prepend>
                <q-icon name="person" />
              </template>
            </q-input>

            <q-input
              v-model="form.password"
              label="Password"
              :type="showPassword ? 'text' : 'password'"
              outlined
              :rules="[(val) => !!val || 'Password is required']"
              :disable="isLoading"
            >
              <template #prepend>
                <q-icon name="lock" />
              </template>
              <template #append>
                <q-icon
                  :name="showPassword ? 'visibility' : 'visibility_off'"
                  class="cursor-pointer"
                  @click="showPassword = !showPassword"
                />
              </template>
            </q-input>

            <div class="row items-center justify-between">
              <q-checkbox v-model="form.remember" label="Remember me" :disable="isLoading" />
              <q-btn
                flat
                color="primary"
                label="Forgot password?"
                :disable="isLoading"
                @click="redirectToForgotPassword"
              />
            </div>

            <q-btn
              type="submit"
              color="primary"
              size="lg"
              class="full-width"
              :loading="isLoading"
              :disable="!form.username || !form.password"
            >
              {{ isLoading ? 'Signing in...' : 'Sign In' }}
            </q-btn>
          </q-form>
        </q-card-section>

        <q-card-section class="text-center">
          <div class="text-body2 text-grey-6">
            Don't have an account?
            <q-btn
              flat
              color="primary"
              label="Sign up"
              :disable="isLoading"
              @click="redirectToRegister"
            />
          </div>
        </q-card-section>

        <!-- Version -->
        <q-card-section class="text-center q-pt-none">
          <div class="text-caption text-grey-6">v{{ version }}</div>
        </q-card-section>

        <!-- Debug Information (only shown on localhost) -->
        <q-card-section v-if="isLocalhost" class="q-pt-none">
          <q-separator class="q-my-md" />
          <q-expansion-item
            icon="bug_report"
            label="Debug Information"
            header-class="text-caption text-grey-6"
            class="debug-section"
          >
            <q-card-section class="q-pt-none">
              <div class="text-caption text-grey-7 q-mb-sm">Environment Variables:</div>
              <div class="debug-grid">
                <div class="debug-item">
                  <span class="debug-label">API_BASE_URL:</span>
                  <span class="debug-value">{{ envInfo.apiBaseUrl }}</span>
                </div>
                <div class="debug-item">
                  <span class="debug-label">GRAPHQL_ENDPOINT:</span>
                  <span class="debug-value">{{ envInfo.graphqlEndpoint }}</span>
                </div>
                <div class="debug-item">
                  <span class="debug-label">WORDPRESS_URL:</span>
                  <span class="debug-value">{{ envInfo.wordpressUrl }}</span>
                </div>
                <div class="debug-item">
                  <span class="debug-label">NODE_ENV:</span>
                  <span class="debug-value">{{ envInfo.nodeEnv }}</span>
                </div>
                <div class="debug-item">
                  <span class="debug-label">VUE_ROUTER_MODE:</span>
                  <span class="debug-value">{{ envInfo.routerMode }}</span>
                </div>
              </div>

              <div class="text-caption text-grey-7 q-mt-md q-mb-sm">App Info:</div>
              <div class="debug-grid">
                <div class="debug-item">
                  <span class="debug-label">Current URL:</span>
                  <span class="debug-value">{{ currentUrl }}</span>
                </div>
                <div class="debug-item">
                  <span class="debug-label">User Agent:</span>
                  <span class="debug-value">{{ userAgent }}</span>
                </div>
              </div>
            </q-card-section>
          </q-expansion-item>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { Notify } from 'quasar';
import { useAuthStore } from '../stores/authStore';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - JSON import for version reading
import pkg from '../../package.json';
const { version } = pkg as { version: string };

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

// Form state
const form = reactive({
  username: '',
  password: '',
  remember: false,
});

const showPassword = ref(false);
const isLoading = ref(false);

// Debug flag
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const debug = ref(true);

// Debug information
const isLocalhost = computed(() => {
  if (typeof window === 'undefined') return false;
  return (
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname.includes('192.168.')
  );
});

const envInfo = computed(() => ({
  apiBaseUrl: process.env.API_BASE_URL || 'Not set',
  graphqlEndpoint: process.env.GRAPHQL_ENDPOINT || 'Not set',
  wordpressUrl: process.env.WORDPRESS_URL || process.env.WORDPRESS_API_URL || 'Not set',
  nodeEnv: process.env.NODE_ENV || 'development',
  routerMode: process.env.VUE_ROUTER_MODE || 'hash',
}));

const currentUrl = computed(() => {
  if (typeof window === 'undefined') return 'Server-side rendering';
  return window.location.href;
});

const userAgent = computed(() => {
  if (typeof window === 'undefined') return 'Server-side rendering';
  return `${window.navigator.userAgent.substring(0, 50)}...`;
});

// Redirect functions for password reset and sign-up
const wordpressUrl =
  process.env.WORDPRESS_URL || process.env.WORDPRESS_API_URL || 'http://localhost:10014';

const redirectToForgotPassword = (): void => {
  window.open(`${wordpressUrl}/wp-login.php?action=lostpassword`, '_blank');
};

const redirectToRegister = (): void => {
  window.open(`${wordpressUrl}/wp-login.php?action=register`, '_blank');
};

// Handle login
const handleLogin = async (): Promise<void> => {
  if (!form.username || !form.password) return;

  isLoading.value = true;
  authStore.clearError();

  try {
    const success = await authStore.login({
      username: form.username,
      password: form.password,
      remember: form.remember,
    });

    if (success) {
      Notify.create({
        type: 'positive',
        message: 'Welcome back!',
        position: 'top',
      });

      // Redirect to intended page or home
      const redirect = route.query.redirect as string;
      await router.push(redirect || '/');
    } else {
      Notify.create({
        type: 'negative',
        message: authStore.error || 'Login failed',
        position: 'top',
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    Notify.create({
      type: 'negative',
      message: 'An unexpected error occurred',
      position: 'top',
    });
  } finally {
    isLoading.value = false;
  }
};

// Check if user is already authenticated
onMounted(() => {
  if (authStore.isAuthenticated) {
    const redirect = route.query.redirect as string;
    void router.push(redirect || '/');
  }
});
</script>

<style lang="scss" scoped>
.login-container {
  width: 100%;
  max-width: 400px;
  padding: 20px;
}

.login-card {
  width: 100%;
}

.debug-section {
  .debug-grid {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .debug-item {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    font-size: 12px;
    line-height: 1.4;
  }

  .debug-label {
    font-weight: 500;
    color: #666;
    min-width: 120px;
    margin-right: 8px;
  }

  .debug-value {
    color: #333;
    word-break: break-all;
    text-align: right;
    flex: 1;
  }
}
</style>

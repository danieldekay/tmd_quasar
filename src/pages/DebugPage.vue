<template>
  <q-page class="q-pa-md">
    <h2 class="text-h4 q-mb-md">Debug Information</h2>

    <!-- Authentication Status -->
    <q-card class="q-mb-md">
      <q-card-section>
        <div class="text-h6">Authentication Status</div>
        <q-list>
          <q-item>
            <q-item-section>
              <q-item-label>Status</q-item-label>
              <q-item-label caption>
                <q-chip
                  :color="authStore.isAuthenticated ? 'positive' : 'negative'"
                  text-color="white"
                  size="sm"
                >
                  {{ authStore.isAuthenticated ? 'Authenticated' : 'Not Authenticated' }}
                </q-chip>
              </q-item-label>
            </q-item-section>
          </q-item>

          <q-item v-if="authStore.isAuthenticated">
            <q-item-section>
              <q-item-label>User</q-item-label>
              <q-item-label caption
                >{{ authStore.user?.name || 'Unknown' }} ({{
                  authStore.user?.email || 'No email'
                }})</q-item-label
              >
            </q-item-section>
          </q-item>

          <q-item v-if="authStore.isAuthenticated">
            <q-item-section>
              <q-item-label>User ID</q-item-label>
              <q-item-label caption>{{ authStore.user?.id || 'Unknown' }}</q-item-label>
            </q-item-section>
          </q-item>

          <q-item v-if="authStore.isAuthenticated">
            <q-item-section>
              <q-item-label>Roles</q-item-label>
              <q-item-label caption>
                <q-chip
                  v-for="role in authStore.user?.roles || []"
                  :key="role"
                  color="primary"
                  text-color="white"
                  size="sm"
                  class="q-mr-xs"
                >
                  {{ role }}
                </q-chip>
              </q-item-label>
            </q-item-section>
          </q-item>

          <q-item v-if="authStore.isAuthenticated">
            <q-item-section>
              <q-item-label>Token Status</q-item-label>
              <q-item-label caption>
                <q-chip
                  :color="authStore.token ? 'positive' : 'negative'"
                  text-color="white"
                  size="sm"
                >
                  {{ authStore.token ? 'Valid Token' : 'No Token' }}
                </q-chip>
              </q-item-label>
            </q-item-section>
          </q-item>

          <q-item v-if="authStore.isAuthenticated">
            <q-item-section>
              <q-item-label>Admin Access</q-item-label>
              <q-item-label caption>
                <q-chip
                  :color="authStore.isAdmin ? 'warning' : 'grey'"
                  text-color="white"
                  size="sm"
                >
                  {{ authStore.isAdmin ? 'Admin User' : 'Regular User' }}
                </q-chip>
              </q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
    </q-card>

    <!-- API Configuration -->
    <q-card class="q-mb-md">
      <q-card-section>
        <div class="text-h6">API Configuration</div>
        <q-list>
          <q-item>
            <q-item-section>
              <q-item-label>Base API URL</q-item-label>
              <q-item-label caption>{{ apiBaseUrl }}</q-item-label>
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section>
              <q-item-label>GraphQL Endpoint</q-item-label>
              <q-item-label caption>{{ graphqlUrl }}</q-item-label>
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section>
              <q-item-label>API Timeout</q-item-label>
              <q-item-label caption>{{ apiTimeout }}ms</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
    </q-card>

    <!-- API Endpoints -->
    <q-card class="q-mb-md">
      <q-card-section>
        <div class="text-h6">API Endpoints</div>
        <q-list>
          <q-item v-for="(endpoint, index) in apiEndpoints" :key="index">
            <q-item-section>
              <q-item-label>{{ endpoint.name }}</q-item-label>
              <q-item-label caption>{{ endpoint.url }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
    </q-card>

    <!-- Frontend Routes -->
    <q-card class="q-mb-md">
      <q-card-section>
        <div class="text-h6">Frontend Routes</div>
        <q-list>
          <q-item v-for="(route, index) in frontendRoutes" :key="index">
            <q-item-section>
              <q-item-label>{{ route.name }}</q-item-label>
              <q-item-label caption>{{ route.path }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
    </q-card>

    <!-- Environment -->
    <q-card class="q-mb-md">
      <q-card-section>
        <div class="text-h6">Environment</div>
        <q-list>
          <q-item>
            <q-item-section>
              <q-item-label>Node Environment</q-item-label>
              <q-item-label caption>{{ nodeEnv }}</q-item-label>
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section>
              <q-item-label>Router Mode</q-item-label>
              <q-item-label caption>{{ routerMode }}</q-item-label>
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section>
              <q-item-label>Build Time</q-item-label>
              <q-item-label caption>{{ buildTime }}</q-item-label>
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section>
              <q-item-label>App Version</q-item-label>
              <q-item-label caption>{{ appVersion }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
    </q-card>

    <!-- Browser Information -->
    <q-card class="q-mb-md">
      <q-card-section>
        <div class="text-h6">Browser Information</div>
        <q-list>
          <q-item>
            <q-item-section>
              <q-item-label>User Agent</q-item-label>
              <q-item-label caption>{{ userAgent }}</q-item-label>
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section>
              <q-item-label>Language</q-item-label>
              <q-item-label caption>{{ browserLanguage }}</q-item-label>
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section>
              <q-item-label>Online Status</q-item-label>
              <q-item-label caption>
                <q-chip :color="isOnline ? 'positive' : 'negative'" text-color="white" size="sm">
                  {{ isOnline ? 'Online' : 'Offline' }}
                </q-chip>
              </q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
    </q-card>

    <!-- Storage Information -->
    <q-card class="q-mb-md">
      <q-card-section>
        <div class="text-h6">Storage Information</div>
        <q-list>
          <q-item>
            <q-item-section>
              <q-item-label>Local Storage</q-item-label>
              <q-item-label caption>{{
                localStorageAvailable ? 'Available' : 'Not Available'
              }}</q-item-label>
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section>
              <q-item-label>Session Storage</q-item-label>
              <q-item-label caption>{{
                sessionStorageAvailable ? 'Available' : 'Not Available'
              }}</q-item-label>
            </q-item-section>
          </q-item>
          <q-item v-if="authStore.isAuthenticated">
            <q-item-section>
              <q-item-label>Token Storage</q-item-label>
              <q-item-label caption>{{ tokenStorageLocation }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
    </q-card>

    <!-- API Metrics -->
    <q-card class="q-mb-md">
      <q-card-section>
        <div class="row items-center q-mb-md">
          <div class="text-h6 col">API Metrics</div>
          <q-btn
            flat
            dense
            round
            icon="refresh"
            @click="refreshMetrics"
            class="q-ml-auto"
          >
            <q-tooltip>Refresh Metrics</q-tooltip>
          </q-btn>
        </div>

        <!-- Summary Statistics -->
        <div class="row q-col-gutter-md q-mb-md">
          <div class="col-12 col-sm-6 col-md-3">
            <q-card flat bordered>
              <q-card-section class="text-center">
                <div class="text-h4 text-primary">{{ metrics.totalRequests }}</div>
                <div class="text-caption text-grey-7">Total Requests</div>
              </q-card-section>
            </q-card>
          </div>
          <div class="col-12 col-sm-6 col-md-3">
            <q-card flat bordered>
              <q-card-section class="text-center">
                <div class="text-h4 text-positive">{{ metrics.successRate }}%</div>
                <div class="text-caption text-grey-7">Success Rate</div>
              </q-card-section>
            </q-card>
          </div>
          <div class="col-12 col-sm-6 col-md-3">
            <q-card flat bordered>
              <q-card-section class="text-center">
                <div class="text-h4 text-negative">{{ metrics.errorRate }}%</div>
                <div class="text-caption text-grey-7">Error Rate</div>
              </q-card-section>
            </q-card>
          </div>
          <div class="col-12 col-sm-6 col-md-3">
            <q-card flat bordered>
              <q-card-section class="text-center">
                <div class="text-h4 text-info">{{ metrics.avgResponseTime }}ms</div>
                <div class="text-caption text-grey-7">Avg Response</div>
              </q-card-section>
            </q-card>
          </div>
        </div>

        <!-- Response Time Percentiles -->
        <div class="q-mb-md">
          <div class="text-subtitle2 q-mb-sm">Response Time Percentiles</div>
          <q-list bordered separator>
            <q-item>
              <q-item-section>
                <q-item-label>P50 (Median)</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-chip size="sm" color="grey-3" text-color="grey-9">{{ metrics.p50 }}ms</q-chip>
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>
                <q-item-label>P95</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-chip size="sm" color="grey-3" text-color="grey-9">{{ metrics.p95 }}ms</q-chip>
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>
                <q-item-label>P99</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-chip size="sm" color="grey-3" text-color="grey-9">{{ metrics.p99 }}ms</q-chip>
              </q-item-section>
            </q-item>
          </q-list>
        </div>

        <!-- Error Breakdown -->
        <div class="q-mb-md">
          <div class="text-subtitle2 q-mb-sm">Error Breakdown</div>
          <q-list bordered separator>
            <q-item>
              <q-item-section>
                <q-item-label>Network Errors</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-chip size="sm" color="negative" text-color="white"
                  >{{ metrics.networkErrors }}</q-chip
                >
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>
                <q-item-label>Server Errors (5xx)</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-chip size="sm" color="warning" text-color="white"
                  >{{ metrics.serverErrors }}</q-chip
                >
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>
                <q-item-label>Client Errors (4xx)</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-chip size="sm" color="orange" text-color="white"
                  >{{ metrics.clientErrors }}</q-chip
                >
              </q-item-section>
            </q-item>
          </q-list>
        </div>

        <!-- Top Endpoints -->
        <div class="q-mb-md">
          <div class="text-subtitle2 q-mb-sm">Top 5 Endpoints by Request Volume</div>
          <q-table
            flat
            bordered
            :rows="topEndpoints"
            :columns="endpointColumns"
            row-key="endpoint"
            :pagination="{ rowsPerPage: 5 }"
            :rows-per-page-options="[5]"
            dense
          />
        </div>

        <!-- Time Window Information -->
        <div class="text-caption text-grey-7">
          <q-icon name="info" size="sm" class="q-mr-xs" />
          Metrics collected over {{ metrics.timeWindowMinutes }} minute rolling window ({{
            metrics.windowSize
          }}
          samples)
        </div>
      </q-card-section>
    </q-card>

    <!-- Actions -->
    <q-card>
      <q-card-section>
        <div class="text-h6">Debug Actions</div>
        <div class="row q-gutter-sm">
          <q-btn
            v-if="authStore.isAuthenticated"
            color="warning"
            label="Refresh Token"
            @click="refreshToken"
            :loading="authStore.isLoading"
          />
          <q-btn
            v-if="authStore.isAuthenticated"
            color="negative"
            label="Logout"
            @click="handleLogout"
            :loading="authStore.isLoading"
          />
          <q-btn
            color="primary"
            label="Test API Connection"
            @click="testApiConnection"
            :loading="testingApi"
          />
          <q-btn color="secondary" label="Clear Storage" @click="clearStorage" />
          <q-btn color="info" label="Reset Metrics" @click="resetMetrics" />
          <q-btn color="accent" label="Export Metrics" @click="exportMetrics" />
        </div>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { Notify } from 'quasar';
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { api } from '../boot/axios';
import {
  exportMetricsJSON,
  getMetrics,
  getTopEndpoints,
  resetMetrics as resetMetricsService,
} from '../services/metricsService';
import { useAuthStore } from '../stores/authStore';

const router = useRouter();
const authStore = useAuthStore();
const testingApi = ref(false);

// Metrics state
const metricsData = ref(getMetrics());

// Computed metrics for display
const metrics = computed(() => {
  const data = metricsData.value;
  return {
    totalRequests: data.requestMetrics.totalRequests,
    successRate: data.requestMetrics.successRate.toFixed(1),
    errorRate: (data.errorMetrics.errorRate * 100).toFixed(1),
    avgResponseTime: Math.round(data.performanceMetrics.averageResponseTime),
    p50: Math.round(data.performanceMetrics.p50ResponseTime),
    p95: Math.round(data.performanceMetrics.p95ResponseTime),
    p99: Math.round(data.performanceMetrics.p99ResponseTime),
    networkErrors: data.errorMetrics.networkErrors,
    serverErrors: data.errorMetrics.serverErrors,
    clientErrors: data.errorMetrics.clientErrors,
    timeWindowMinutes: Math.round(data.timeWindow.windowSizeMinutes),
    windowSize: data.timeWindow.currentSampleCount,
  };
});

const topEndpoints = computed(() => {
  return getTopEndpoints(5).map((ep) => ({
    endpoint: ep.endpoint,
    requests: ep.totalRequests,
    success: ep.successCount,
    failures: ep.failureCount,
    errorRate: `${(ep.errorRate * 100).toFixed(1)}%`,
    avgTime: `${Math.round(ep.averageResponseTime)}ms`,
  }));
});

const endpointColumns = [
  {
    name: 'endpoint',
    label: 'Endpoint',
    field: 'endpoint',
    align: 'left' as const,
    sortable: true,
  },
  {
    name: 'requests',
    label: 'Requests',
    field: 'requests',
    align: 'center' as const,
    sortable: true,
  },
  {
    name: 'success',
    label: 'Success',
    field: 'success',
    align: 'center' as const,
    sortable: true,
  },
  {
    name: 'failures',
    label: 'Failures',
    field: 'failures',
    align: 'center' as const,
    sortable: true,
  },
  {
    name: 'errorRate',
    label: 'Error Rate',
    field: 'errorRate',
    align: 'center' as const,
    sortable: true,
  },
  {
    name: 'avgTime',
    label: 'Avg Time',
    field: 'avgTime',
    align: 'center' as const,
    sortable: true,
  },
];

// Metrics actions
const refreshMetrics = () => {
  metricsData.value = getMetrics();
  Notify.create({
    type: 'info',
    message: 'Metrics refreshed',
    position: 'top',
    timeout: 1000,
  });
};

const resetMetrics = () => {
  resetMetricsService();
  metricsData.value = getMetrics();
  Notify.create({
    type: 'positive',
    message: 'Metrics reset successfully',
    position: 'top',
  });
};

const exportMetrics = () => {
  try {
    const json = exportMetricsJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tmd-metrics-${new Date().toISOString()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    Notify.create({
      type: 'positive',
      message: 'Metrics exported successfully',
      position: 'top',
    });
  } catch {
    Notify.create({
      type: 'negative',
      message: 'Error exporting metrics',
      position: 'top',
    });
  }
};

// Environment variables
const apiBaseUrl = ref(api.defaults.baseURL || 'Not configured');
const graphqlUrl = ref(`${process.env.WORDPRESS_API_URL || 'http://localhost:10014'}/graphql`);
const apiTimeout = ref(api.defaults.timeout || 30000);
const nodeEnv = ref(process.env.NODE_ENV || 'development');
const routerMode = ref(process.env.VUE_ROUTER_MODE || 'hash');
const buildTime = ref(process.env.BUILD_TIME || new Date().toISOString());
const appVersion = ref(process.env.APP_VERSION || '1.0.0');

// Browser information
const userAgent = ref(navigator.userAgent);
const browserLanguage = ref(navigator.language);
const isOnline = ref(navigator.onLine);
const localStorageAvailable = ref(typeof localStorage !== 'undefined');
const sessionStorageAvailable = ref(typeof sessionStorage !== 'undefined');

// Computed properties
const tokenStorageLocation = computed(() => {
  if (localStorage.getItem('auth_token')) {
    return 'Local Storage (Remember Me)';
  } else if (sessionStorage.getItem('auth_token')) {
    return 'Session Storage (Temporary)';
  }
  return 'Not Stored';
});

// API endpoints
const apiEndpoints = ref([
  {
    name: 'Events (V3 API)',
    url: '/wp-json/tmd/v3/events?_embed=true',
  },
  {
    name: 'Single Event (V3 API)',
    url: '/wp-json/tmd/v3/events/:id?_embed=true',
  },
  {
    name: 'DJs (V3 API)',
    url: '/wp-json/tmd/v3/djs?_embed=true',
  },
  {
    name: 'Teachers (V3 API)',
    url: '/wp-json/tmd/v3/teachers?_embed=true',
  },
  {
    name: 'Couples (V3 API)',
    url: '/wp-json/tmd/v3/couples?_embed=true',
  },
  {
    name: 'Event Series (V3 API)',
    url: '/wp-json/tmd/v3/event-series?_embed=true',
  },
  {
    name: 'GraphQL Endpoint',
    url: '/graphql',
  },
]);

// Frontend routes
const frontendRoutes = ref([
  { name: 'Home', path: '/' },
  { name: 'Events List', path: '/events' },
  { name: 'Event Detail', path: '/events/:id' },
  { name: 'DJs', path: '/djs' },
  { name: 'DJ Detail', path: '/djs/:id' },
  { name: 'Teachers', path: '/teachers' },
  { name: 'Teacher Detail', path: '/teachers/:id' },
  { name: 'Couples', path: '/couples' },
  { name: 'Couple Detail', path: '/couples/:id' },
  { name: 'Event Series', path: '/event-series' },
  { name: 'Event Series Detail', path: '/event-series/:id' },
  { name: 'About', path: '/about' },
  { name: 'Debug', path: '/debug' },
  { name: 'Login', path: '/auth/login' },
  { name: 'Unauthorized', path: '/auth/unauthorized' },
]);

// Actions
const refreshToken = async () => {
  try {
    const success = await authStore.refreshToken();
    if (success) {
      Notify.create({
        type: 'positive',
        message: 'Token refreshed successfully',
        position: 'top',
      });
    } else {
      Notify.create({
        type: 'negative',
        message: 'Failed to refresh token',
        position: 'top',
      });
    }
  } catch {
    Notify.create({
      type: 'negative',
      message: 'Error refreshing token',
      position: 'top',
    });
  }
};

const handleLogout = async () => {
  try {
    authStore.logout();
    Notify.create({
      type: 'positive',
      message: 'Logged out successfully',
      position: 'top',
    });
    await router.push('/');
  } catch {
    Notify.create({
      type: 'negative',
      message: 'Error during logout',
      position: 'top',
    });
  }
};

const testApiConnection = async () => {
  testingApi.value = true;
  try {
    const response = await api.get('/events?per_page=1');
    Notify.create({
      type: 'positive',
      message: `API connection successful (${response.status})`,
      position: 'top',
    });
  } catch (error) {
    Notify.create({
      type: 'negative',
      message: `API connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      position: 'top',
    });
  } finally {
    testingApi.value = false;
  }
};

const clearStorage = () => {
  try {
    localStorage.clear();
    sessionStorage.clear();
    Notify.create({
      type: 'positive',
      message: 'Storage cleared successfully',
      position: 'top',
    });
  } catch {
    Notify.create({
      type: 'negative',
      message: 'Error clearing storage',
      position: 'top',
    });
  }
};

// Listen for online/offline status changes
onMounted(() => {
  window.addEventListener('online', () => {
    isOnline.value = true;
  });
  window.addEventListener('offline', () => {
    isOnline.value = false;
  });
});
</script>

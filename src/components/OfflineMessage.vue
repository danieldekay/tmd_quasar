<template>
  <div v-if="show" class="offline-message">
    <!-- Offline Banner -->
    <q-banner v-if="isOffline" class="bg-negative text-white q-mb-md" :icon="icon" dense>
      <template v-slot:avatar>
        <q-icon :name="icon" color="white" />
      </template>
      {{ message }}
      <template v-slot:action>
        <q-btn
          v-if="canRetry"
          flat
          color="white"
          :label="retryLabel"
          :loading="retrying"
          @click="handleRetry"
          size="sm"
        />
      </template>
    </q-banner>

    <!-- API Down Banner -->
    <q-banner v-else-if="isApiDown" class="bg-warning text-dark q-mb-md" :icon="icon" dense>
      <template v-slot:avatar>
        <q-icon :name="icon" color="amber-8" />
      </template>
      {{ message }}
      <template v-slot:action>
        <q-btn
          v-if="canRetry"
          flat
          color="amber-8"
          :label="retryLabel"
          :loading="retrying"
          @click="handleRetry"
          size="sm"
        />
      </template>
    </q-banner>

    <!-- General Error State -->
    <q-card v-else-if="error && !isOffline && !isApiDown" flat bordered class="bg-grey-1 q-mb-md">
      <q-card-section class="row items-center">
        <q-icon :name="icon" color="negative" size="md" class="q-mr-md" />
        <div class="col">
          <div class="text-subtitle2 text-negative">{{ title || 'Connection Error' }}</div>
          <div class="text-caption text-grey-7">{{ message }}</div>
        </div>
        <q-btn
          v-if="canRetry"
          outline
          color="negative"
          :label="retryLabel"
          :loading="retrying"
          @click="handleRetry"
          size="sm"
        />
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useApiStatus } from '../composables/useApiStatus';

interface Props {
  error?: unknown;
  show?: boolean | undefined;
  title?: string | undefined;
  customMessage?: string | undefined;
  showRetry?: boolean | undefined;
  retryLabel?: string | undefined;
}

interface Emits {
  (e: 'retry'): void;
}

const props = withDefaults(defineProps<Props>(), {
  show: true,
  showRetry: true,
  retryLabel: 'Retry',
});

const emit = defineEmits<Emits>();

const apiStatus = useApiStatus();
const retrying = ref(false);

// Computed properties for reactive state
const isOffline = computed(() => apiStatus.isOffline.value);
const isApiDown = computed(() => apiStatus.isApiDown.value);
const canRetry = computed(() => props.showRetry && apiStatus.canRetry.value);

const message = computed(() => {
  if (props.customMessage) return props.customMessage;
  return apiStatus.getErrorMessage(props.error);
});

const icon = computed(() => {
  if (isOffline.value) return 'wifi_off';
  if (isApiDown.value) return 'cloud_off';
  return 'error_outline';
});

const handleRetry = async () => {
  retrying.value = true;

  try {
    // Test connectivity first if we think we're offline
    if (isOffline.value || isApiDown.value) {
      await apiStatus.testApiConnectivity();
    }

    emit('retry');
  } finally {
    retrying.value = false;
  }
};

// Start health check when component mounts if there are failures
if (apiStatus.hasRecentFailures.value) {
  apiStatus.startHealthCheck();
}
</script>

<style lang="scss" scoped>
.offline-message {
  .q-banner {
    border-radius: 4px;
  }

  .q-card {
    border-radius: 4px;
  }
}
</style>

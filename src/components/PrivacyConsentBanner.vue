<template>
  <q-banner
    v-if="showBanner"
    class="privacy-banner bg-blue-grey-8 text-white"
    :class="{ 'fixed-bottom z-max': !inline }"
  >
    <div class="row items-center q-gutter-md">
      <div class="col-12 col-md-auto">
        <div class="text-subtitle2 q-mb-xs">🍪 Privacy & Cookies</div>
        <div class="text-body2">
          We use cookies and similar technologies to enhance your experience, analyze site usage,
          and provide personalized features. By continuing to use our site, you consent to our
          <a href="/privacy" target="_blank" class="text-light-blue-3">Privacy Policy</a>.
        </div>
      </div>
      
      <div class="col-12 col-md-auto text-right">
        <div class="row q-gutter-sm justify-end">
          <q-btn
            flat
            dense
            color="white"
            label="Manage"
            @click="showPreferences = true"
            class="text-caption"
          />
          <q-btn
            flat
            dense
            color="white"
            label="Accept All"
            @click="acceptAll"
            class="text-caption"
          />
          <q-btn
            flat
            dense
            color="white"
            label="Necessary Only"
            @click="acceptNecessary"
            class="text-caption"
          />
        </div>
      </div>
    </div>

    <template #action>
      <q-btn
        flat
        round
        dense
        icon="close"
        color="white"
        @click="acceptNecessary"
        aria-label="Close banner"
      />
    </template>
  </q-banner>

  <!-- Privacy Preferences Dialog -->
  <q-dialog v-model="showPreferences" persistent>
    <q-card style="min-width: 400px; max-width: 600px">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">Privacy Preferences</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section>
        <div class="text-body2 text-grey-7 q-mb-md">
          Choose which types of cookies and data processing you're comfortable with.
          You can change these preferences at any time.
        </div>

        <div class="q-gutter-md">
          <div class="preference-item">
            <q-checkbox
              v-model="preferences.necessary"
              disable
              label="Necessary Cookies"
              color="primary"
            />
            <div class="text-caption text-grey-6 q-ml-md">
              Required for basic site functionality, security, and authentication.
              These cannot be disabled.
            </div>
          </div>

          <div class="preference-item">
            <q-checkbox
              v-model="preferences.analytics"
              label="Analytics & Performance"
              color="primary"
            />
            <div class="text-caption text-grey-6 q-ml-md">
              Help us improve our service by analyzing site usage patterns (anonymized).
            </div>
          </div>

          <div class="preference-item">
            <q-checkbox
              v-model="preferences.preferences"
              label="Personalization"
              color="primary"
            />
            <div class="text-caption text-grey-6 q-ml-md">
              Remember your preferences and customize your experience.
            </div>
          </div>

          <div class="preference-item">
            <q-checkbox
              v-model="preferences.marketing"
              label="Marketing & Communication"
              color="primary"
            />
            <div class="text-caption text-grey-6 q-ml-md">
              Show relevant content and offers based on your interests.
            </div>
          </div>
        </div>
      </q-card-section>

      <q-card-actions align="right" class="q-pa-md">
        <q-btn flat label="Save Preferences" color="primary" @click="savePreferences" />
        <q-btn flat label="Accept All" color="positive" @click="acceptAll" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue';
import { Notify } from 'quasar';
import { 
  needsConsentBanner, 
  getConsentPreferences, 
  saveConsentPreferences,
  type ConsentPreferences 
} from '../utils/privacy';

interface Props {
  inline?: boolean; // Show inline instead of fixed banner
  autoShow?: boolean; // Automatically show banner if consent needed
}

const props = withDefaults(defineProps<Props>(), {
  inline: false,
  autoShow: true,
});

// Component state
const showBanner = ref(false);
const showPreferences = ref(false);

// Reactive preferences
const preferences = reactive<ConsentPreferences>({
  necessary: true,
  analytics: false,
  marketing: false,
  preferences: false,
  timestamp: Date.now(),
  version: '1.0',
});

// Computed
const shouldShowBanner = computed(() => {
  return props.autoShow && needsConsentBanner();
});

// Methods
const acceptAll = (): void => {
  saveConsentPreferences({
    necessary: true,
    analytics: true,
    marketing: true,
    preferences: true,
  });

  showBanner.value = false;
  showPreferences.value = false;

  Notify.create({
    type: 'positive',
    message: 'Privacy preferences saved',
    position: 'top',
    timeout: 2000,
  });

  emitConsentChange();
};

const acceptNecessary = (): void => {
  saveConsentPreferences({
    necessary: true,
    analytics: false,
    marketing: false,
    preferences: false,
  });

  showBanner.value = false;
  showPreferences.value = false;

  Notify.create({
    type: 'info',
    message: 'Only necessary cookies accepted',
    position: 'top',
    timeout: 2000,
  });

  emitConsentChange();
};

const savePreferences = (): void => {
  saveConsentPreferences({
    necessary: preferences.necessary,
    analytics: preferences.analytics,
    marketing: preferences.marketing,
    preferences: preferences.preferences,
  });

  showBanner.value = false;
  showPreferences.value = false;

  Notify.create({
    type: 'positive',
    message: 'Privacy preferences saved',
    position: 'top',
    timeout: 2000,
  });

  emitConsentChange();
};

// Emit consent change event for parent components
const emitConsentChange = (): void => {
  const consent = getConsentPreferences();
  window.dispatchEvent(new CustomEvent('privacy:consent-changed', {
    detail: { consent }
  }));
};

// Lifecycle
onMounted(() => {
  // Load current preferences
  const currentPreferences = getConsentPreferences();
  Object.assign(preferences, currentPreferences);

  // Show banner if consent is needed
  if (shouldShowBanner.value) {
    showBanner.value = true;
  }
});

// Expose methods for parent components
const showConsentBanner = (): void => {
  showBanner.value = true;
};

const showPreferenceDialog = (): void => {
  const currentPreferences = getConsentPreferences();
  Object.assign(preferences, currentPreferences);
  showPreferences.value = true;
};

defineExpose({
  showConsentBanner,
  showPreferenceDialog,
});
</script>

<style scoped lang="scss">
.privacy-banner {
  border-radius: 0;
  
  @media (max-width: 768px) {
    .row {
      flex-direction: column;
      text-align: center;
      
      .col-md-auto {
        margin-bottom: 16px;
      }
    }
  }
}

.preference-item {
  padding: 12px 0;
  border-bottom: 1px solid #eee;
  
  &:last-child {
    border-bottom: none;
  }
}

.z-max {
  z-index: 9999;
}
</style>
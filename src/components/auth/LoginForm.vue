<template>
  <q-form @submit.prevent="handleSubmit" class="q-gutter-md">
    <!-- Username Input -->
    <q-input
      v-model="username"
      label="Username or Email"
      type="text"
      outlined
      :rules="[(val) => !!val || 'Username is required']"
      :disable="isLoading || isDelayed"
      :error="hasError && !username"
      error-message="Username is required"
      aria-label="Username or email address"
      data-testid="username-input"
    >
      <template #prepend>
        <q-icon name="person" />
      </template>
    </q-input>

    <!-- Password Input -->
    <q-input
      v-model="password"
      :label="passwordLabel"
      :type="showPassword ? 'text' : 'password'"
      outlined
      :rules="[(val) => !!val || 'Password is required']"
      :disable="isLoading || isDelayed"
      :error="hasError && !password"
      error-message="Password is required"
      aria-label="Password"
      data-testid="password-input"
    >
      <template #prepend>
        <q-icon name="lock" />
      </template>
      <template #append>
        <q-icon
          :name="showPassword ? 'visibility' : 'visibility_off'"
          class="cursor-pointer"
          :aria-label="showPassword ? 'Hide password' : 'Show password'"
          @click="showPassword = !showPassword"
        />
      </template>
    </q-input>

    <!-- Remember Me & Forgot Password -->
    <div class="row items-center justify-between">
      <q-checkbox
        v-model="remember"
        label="Remember me"
        :disable="isLoading || isDelayed"
        aria-label="Remember me for 30 days"
      />
      <q-btn
        flat
        color="primary"
        label="Forgot password?"
        :disable="isLoading || isDelayed"
        aria-label="Reset your password on the main TMD site"
        @click="$emit('forgotPassword')"
      />
    </div>

    <!-- Progressive Delay Message -->
    <q-banner v-if="isDelayed && delayMessage" class="bg-warning text-dark" rounded dense>
      <template #avatar>
        <q-icon name="schedule" color="dark" />
      </template>
      {{ delayMessage }}
    </q-banner>

    <!-- Error Message -->
    <q-banner v-if="error" class="bg-negative text-white" rounded dense>
      <template #avatar>
        <q-icon name="error" color="white" />
      </template>
      {{ error }}
    </q-banner>

    <!-- Submit Button -->
    <q-btn
      type="submit"
      color="primary"
      size="lg"
      class="full-width"
      :loading="isLoading"
      :disable="!isFormValid || isDelayed"
      :aria-busy="isLoading"
      :aria-label="isLoading ? 'Signing in...' : 'Sign in to your account'"
    >
      {{ buttonText }}
    </q-btn>

    <!-- Sign Up Link -->
    <div class="text-center q-mt-md">
      <div class="text-body2 text-grey-6">
        Don't have an account?
        <q-btn
          flat
          color="primary"
          label="Sign up"
          :disable="isLoading || isDelayed"
          aria-label="Create a new account on the main TMD site"
          @click="$emit('signUp')"
        />
      </div>
    </div>
  </q-form>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';

/**
 * LoginForm Component
 *
 * Reusable login form with progressive delay protection and accessibility features.
 * Follows TMD Quasar constitutional requirements for mobile-first design.
 */

// Props
interface Props {
  isLoading?: boolean;
  error?: string | null;
  isDelayed?: boolean;
  delayMessage?: string;
  passwordLabel?: string;
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false,
  error: null,
  isDelayed: false,
  delayMessage: '',
  passwordLabel: 'Password',
});

// Emits
const emit = defineEmits<{
  submit: [credentials: { username: string; password: string; remember: boolean }];
  forgotPassword: [];
  signUp: [];
}>();

// Form state
const username = ref('');
const password = ref('');
const remember = ref(false);
const showPassword = ref(false);
const hasError = ref(false);

// Computed
const isFormValid = computed(() => {
  return username.value.trim() !== '' && password.value.trim() !== '';
});

const _buttonText = computed(() => {
  if (props.isLoading) return 'Signing in...';
  if (props.isDelayed) return 'Please wait...';
  return 'Sign In';
});

// Watch for errors to show validation
watch(
  () => props.error,
  (newError) => {
    if (newError) {
      hasError.value = true;
      // Clear password on error for security
      password.value = '';
    }
  },
);

// Methods
const handleSubmit = (): void => {
  if (!isFormValid.value || props.isLoading || props.isDelayed) {
    return;
  }

  hasError.value = false;

  emit('submit', {
    username: username.value.trim(),
    password: password.value,
    remember: remember.value,
  });
};

// Expose methods for testing
defineExpose({
  username,
  password,
  remember,
  showPassword,
  handleSubmit,
});
</script>

<style lang="scss" scoped>
// Component-specific styles
.q-form {
  width: 100%;
}

// Ensure good contrast for accessibility
.q-banner {
  margin-bottom: 16px;
}

// Mobile-first responsive adjustments
@media (max-width: 600px) {
  .row {
    flex-direction: column;
    gap: 8px;

    .q-checkbox {
      margin-bottom: 8px;
    }
  }
}
</style>

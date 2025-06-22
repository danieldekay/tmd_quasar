<template>
  <router-view />
</template>

<script setup lang="ts">
import { useAuthRedirect } from './composables/useAuthRedirect';

// Handle authentication redirects from axios interceptor
useAuthRedirect();
</script>

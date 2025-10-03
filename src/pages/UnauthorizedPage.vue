<template>
  <q-page class="flex flex-center bg-grey-1">
    <div class="unauthorized-container text-center">
      <q-icon name="security" size="8rem" color="orange" class="q-mb-lg" />

      <div class="text-h4 q-mb-md">Access Denied</div>

      <div class="text-body1 text-grey-7 q-mb-lg">
        You don't have permission to access this page.
      </div>

      <div class="q-gutter-md">
        <q-btn color="primary" label="Go Home" icon="home" @click="$router.push('/')" />

        <q-btn
          outline
          color="primary"
          label="Contact Support"
          icon="support_agent"
          @click="contactSupport"
        />
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar';

const $q = useQuasar();

const contactSupport = () => {
  $q.notify({
    type: 'info',
    message: 'Please contact the administrator for access',
    position: 'top',
  });
};
</script>

<style lang="scss" scoped>
.unauthorized-container {
  max-width: 500px;
  padding: 40px 20px;
}
</style>

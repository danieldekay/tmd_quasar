<template>
  <div class="list-empty-state">
    <q-card flat bordered class="empty-state-card">
      <q-card-section class="text-center q-py-xl">
        <q-icon :name="icon" :color="iconColor" :size="iconSize" class="q-mb-lg" />

        <div class="text-h6 text-weight-medium q-mb-sm">
          {{ title }}
        </div>

        <div class="text-subtitle2 text-grey-6 q-mb-lg">
          {{ message }}
        </div>

        <div v-if="$slots.actions" class="empty-state-actions">
          <slot name="actions" />
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup lang="ts">
interface Props {
  icon?: string | undefined;
  iconColor?: string | undefined;
  iconSize?: string | undefined;
  title?: string | undefined;
  message?: string | undefined;
}

withDefaults(defineProps<Props>(), {
  icon: 'inbox',
  iconColor: 'grey-5',
  iconSize: '4em',
  title: 'No items found',
  message: 'There are no items to display at the moment.',
});
</script>

<style lang="scss" scoped>
.list-empty-state {
  .empty-state-card {
    border-radius: 8px;
    min-height: 200px;

    .empty-state-actions {
      .q-btn {
        margin: 0 8px;
      }
    }
  }
}
</style>

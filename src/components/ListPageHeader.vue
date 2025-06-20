<template>
  <div class="list-page-header q-pa-lg">
    <div class="row items-center justify-between">
      <!-- Title and Description -->
      <div class="col-auto">
        <h1 class="text-h3 text-weight-light q-ma-none">{{ title }}</h1>
        <p v-if="subtitle" class="text-subtitle1 text-grey-7 q-mt-sm q-mb-none">
          {{ subtitle }}
        </p>
      </div>

      <!-- Stats Section -->
      <div v-if="showStats" class="col-auto">
        <q-card flat class="stats-card">
          <q-card-section class="text-center q-pa-md">
            <div class="text-h4 text-primary text-weight-bold">
              {{ formatCount(totalCount || 0) }}
            </div>
            <div class="text-caption text-grey-6">{{ statsLabel }}</div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Action Buttons -->
      <div v-if="$slots.actions" class="col-auto">
        <div class="row q-gutter-sm">
          <slot name="actions" />
        </div>
      </div>
    </div>

    <!-- Additional Content -->
    <div v-if="$slots.content" class="row q-mt-md">
      <div class="col-12">
        <slot name="content" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title: string;
  subtitle?: string | undefined;
  showStats?: boolean | undefined;
  totalCount?: number | undefined;
  statsLabel?: string | undefined;
}

withDefaults(defineProps<Props>(), {
  showStats: false,
  totalCount: 0,
  statsLabel: 'Total Items',
});

/**
 * Format count with locale-specific thousands separators
 */
const formatCount = (count: number): string => {
  return count.toLocaleString();
};
</script>

<style lang="scss" scoped>
.list-page-header {
  .stats-card {
    min-width: 120px;
    border: 1px solid rgba(0, 0, 0, 0.12);
    border-radius: 8px;

    &:hover {
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
  }
}

// Responsive adjustments
@media (max-width: 768px) {
  .list-page-header {
    .row {
      flex-direction: column;
      align-items: flex-start !important;
      gap: 1rem;
    }

    .col-auto:last-child {
      width: 100%;

      .row {
        justify-content: flex-start;
      }
    }

    .stats-card {
      align-self: flex-start;
    }
  }
}
</style>

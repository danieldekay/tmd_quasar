<template>
  <q-card-section class="table-navbar q-pa-lg border-bottom">
    <div class="row items-center justify-between">
      <!-- Results Info -->
      <div class="results-info">
        <div class="text-h6 text-weight-medium">
          {{ formatResultsText() }}
          <span v-if="hasActiveFilters" class="text-grey-6">
            (filtered from {{ totalCount?.toLocaleString() }})
          </span>
        </div>
        <div v-if="showPaginationInfo" class="text-caption text-grey-6 q-mt-xs">
          Page {{ currentPage }} of {{ totalPages }}
        </div>
      </div>

      <!-- Action Buttons and View Options -->
      <div class="navbar-actions row items-center q-gutter-sm">
        <!-- Pagination Controls -->
        <div
          v-if="showPagination && totalPages && filteredCount > 0"
          class="pagination-controls row items-center q-gutter-xs"
        >
          <q-btn
            flat
            dense
            icon="first_page"
            :disable="currentPage === 1"
            @click="$emit('update:currentPage', 1)"
            class="pagination-btn"
          >
            <q-tooltip>First Page</q-tooltip>
          </q-btn>
          <q-btn
            flat
            dense
            icon="chevron_left"
            :disable="(currentPage ?? 1) === 1"
            @click="$emit('update:currentPage', (currentPage ?? 1) - 1)"
            class="pagination-btn"
          >
            <q-tooltip>Previous Page</q-tooltip>
          </q-btn>
          <span class="pagination-current text-body2 text-weight-medium q-mx-sm">
            {{ currentPage }} / {{ totalPages }}
          </span>
          <q-btn
            flat
            dense
            icon="chevron_right"
            :disable="(currentPage ?? 1) === (totalPages ?? 1)"
            @click="$emit('update:currentPage', (currentPage ?? 1) + 1)"
            class="pagination-btn"
          >
            <q-tooltip>Next Page</q-tooltip>
          </q-btn>
          <q-btn
            flat
            dense
            icon="last_page"
            :disable="currentPage === totalPages"
            @click="$emit('update:currentPage', totalPages)"
            class="pagination-btn"
          >
            <q-tooltip>Last Page</q-tooltip>
          </q-btn>
        </div>

        <!-- Reload Button -->
        <q-btn
          flat
          round
          dense
          color="primary"
          icon="refresh"
          :loading="loading"
          @click="$emit('reload')"
          class="reload-btn"
        >
          <q-tooltip>Reload {{ itemName }}</q-tooltip>
        </q-btn>

        <!-- Rows Per Page Selector -->
        <q-select
          v-if="showRowsPerPage"
          :model-value="rowsPerPage"
          :options="rowsPerPageOptions"
          label="Per page"
          dense
          outlined
          style="min-width: 100px"
          @update:model-value="$emit('update:rowsPerPage', $event)"
        />

        <!-- Additional Action Slot -->
        <slot name="actions" />
      </div>
    </div>
  </q-card-section>
</template>

<script setup lang="ts">
export interface TableNavbarProps {
  // Results display
  filteredCount: number;
  totalCount?: number;
  itemName: string;
  itemNamePlural?: string;
  hasActiveFilters?: boolean;

  // Pagination
  currentPage?: number;
  totalPages?: number;
  showPaginationInfo?: boolean;
  showPagination?: boolean;

  // Rows per page
  rowsPerPage?: number;
  rowsPerPageOptions?: number[];
  showRowsPerPage?: boolean;

  // State
  loading?: boolean;
}

const props = withDefaults(defineProps<TableNavbarProps>(), {
  itemNamePlural: '',
  hasActiveFilters: false,
  showPaginationInfo: true,
  showPagination: true,
  showRowsPerPage: true,
  rowsPerPageOptions: () => [10, 20, 50, 100],
  loading: false,
  currentPage: 1,
  totalPages: 1,
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const emit = defineEmits<{
  reload: [];
  'update:rowsPerPage': [value: number];
  'update:currentPage': [value: number];
}>();

const formatResultsText = () => {
  const count = props.filteredCount;
  const plural = props.itemNamePlural || `${props.itemName}s`;

  return `${count.toLocaleString()} ${count === 1 ? props.itemName : plural}`;
};
</script>

<style scoped>
.table-navbar {
  background-color: #fafafa;
}

.reload-btn {
  transition: transform 0.2s ease;
}

.reload-btn:hover {
  transform: rotate(90deg);
}

.navbar-actions {
  flex-shrink: 0;
}

.border-bottom {
  border-bottom: 1px solid #e0e0e0;
}

.pagination-btn {
  min-width: 32px;
}

.pagination-controls {
  background: rgba(0, 0, 0, 0.03);
  border-radius: 4px;
  padding: 4px;
}
</style>

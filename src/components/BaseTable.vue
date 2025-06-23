<template>
  <div class="base-table-container">
    <!-- Top Pagination (when enabled) -->
    <div
      v-if="showTopPagination && !loading && !error && rows.length > 0"
      class="top-pagination q-mb-md"
    >
      <div class="pagination-controls">
        <div class="pagination-info">
          <span class="text-body2 text-grey-7">
            Showing {{ startItem }}-{{ endItem }} of {{ totalItems }} items
          </span>
        </div>
        <div class="pagination-buttons">
          <q-btn
            flat
            dense
            icon="first_page"
            :disable="currentPageValue === 1"
            @click="goToPage(1)"
            class="pagination-btn"
          >
            <q-tooltip>First Page</q-tooltip>
          </q-btn>
          <q-btn
            flat
            dense
            icon="chevron_left"
            :disable="currentPageValue === 1"
            @click="goToPage(currentPageValue - 1)"
            class="pagination-btn"
          >
            <q-tooltip>Previous Page</q-tooltip>
          </q-btn>
          <span class="pagination-current text-body2 text-weight-medium q-mx-sm">
            {{ currentPageValue }} / {{ totalPages }}
          </span>
          <q-btn
            flat
            dense
            icon="chevron_right"
            :disable="currentPageValue === totalPages"
            @click="goToPage(currentPageValue + 1)"
            class="pagination-btn"
          >
            <q-tooltip>Next Page</q-tooltip>
          </q-btn>
          <q-btn
            flat
            dense
            icon="last_page"
            :disable="currentPageValue === totalPages"
            @click="goToPage(totalPages)"
            class="pagination-btn"
          >
            <q-tooltip>Last Page</q-tooltip>
          </q-btn>
          <q-select
            v-model="internalRowsPerPage"
            :options="rowsPerPageOptions"
            dense
            outlined
            class="rows-per-page-select q-ml-md"
            style="min-width: 80px"
            @update:model-value="updateRowsPerPage"
          >
            <template v-slot:prepend>
              <span class="text-caption text-grey-6">Rows:</span>
            </template>
          </q-select>
        </div>
      </div>
    </div>

    <!-- Table -->
    <q-table
      :rows="rows"
      :columns="computedColumns"
      :row-key="rowKey"
      :loading="loading"
      :pagination="tablePagination"
      :rows-per-page-options="[]"
      flat
      class="base-table"
      separator="horizontal"
      @request="onRequest"
      @row-click="onRowClick"
    >
      <!-- Header Template -->
      <template v-slot:header="props">
        <q-tr :props="props" class="table-header">
          <q-th
            v-for="col in props.cols"
            :key="col.name"
            :props="props"
            class="table-header-cell"
            :style="col.style"
          >
            {{ col.label }}
          </q-th>
        </q-tr>
      </template>

      <!-- Body Template -->
      <template v-slot:body="props">
        <q-tr
          :props="props"
          class="table-row"
          :class="{ 'cursor-pointer': clickableRows }"
          @click="handleRowClick(props.row, props.rowIndex)"
        >
          <slot name="body" :props="props" />
        </q-tr>
      </template>

      <!-- Loading Template -->
      <template v-slot:loading>
        <q-inner-loading showing color="primary">
          <div class="loading-content">
            <q-spinner-dots size="50px" />
            <div class="text-subtitle1 q-mt-md">{{ loadingMessage }}</div>
          </div>
        </q-inner-loading>
      </template>

      <!-- No Data Template -->
      <template v-slot:no-data="{ message }">
        <div class="full-width text-center q-pa-xl">
          <q-icon :name="emptyIcon" size="4em" class="text-grey-4 q-mb-md" />
          <div class="text-h6 text-grey-6 q-mb-sm">{{ emptyTitle }}</div>
          <div class="text-body2 text-grey-5">{{ emptyMessage || message }}</div>
          <slot name="empty-actions" />
        </div>
      </template>
    </q-table>

    <!-- Bottom Pagination (always shown when there are multiple pages) -->
    <div v-if="totalPages > 1 && !loading && !error" class="bottom-pagination q-mt-md">
      <div class="pagination-controls">
        <div class="pagination-info">
          <span class="text-caption text-grey-6">
            Page {{ currentPageValue }} of {{ totalPages }} • {{ totalItems }} total items
          </span>
        </div>
        <div class="pagination-buttons">
          <q-btn
            flat
            dense
            icon="first_page"
            :disable="currentPageValue === 1"
            @click="goToPage(1)"
            class="pagination-btn"
          />
          <q-btn
            flat
            dense
            icon="chevron_left"
            :disable="currentPageValue === 1"
            @click="goToPage(currentPageValue - 1)"
            class="pagination-btn"
          />
          <span class="pagination-current text-body2 text-weight-medium q-mx-sm">
            {{ currentPageValue }} / {{ totalPages }}
          </span>
          <q-btn
            flat
            dense
            icon="chevron_right"
            :disable="currentPageValue === totalPages"
            @click="goToPage(currentPageValue + 1)"
            class="pagination-btn"
          />
          <q-btn
            flat
            dense
            icon="last_page"
            :disable="currentPageValue === totalPages"
            @click="goToPage(totalPages)"
            class="pagination-btn"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" generic="T extends Record<string, unknown>">
import { ref, computed, watch } from 'vue';

interface Column<T> {
  name: string;
  label: string;
  field: string | ((row: T) => unknown);
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
  style?: string;
  headerStyle?: string;
  sort?: (a: unknown, b: unknown, rowA?: T, rowB?: T) => number;
  // Additional properties for compatibility with existing table columns
  required?: boolean;
  format?: (val: unknown, row?: T) => string;
  classes?: string;
  headerClasses?: string;
}

interface Props<T> {
  // Data
  rows: T[];
  columns: Column<T>[];
  rowKey?: string;

  // Pagination
  currentPage?: number;
  rowsPerPage?: number;
  totalItems?: number;
  rowsPerPageOptions?: number[];
  showTopPagination?: boolean;

  // Sorting
  sortBy?: string;
  descending?: boolean;
  enableSorting?: boolean;

  // Behavior
  clickableRows?: boolean;
  loading?: boolean;
  error?: string | null;

  // Customization
  loadingMessage?: string;
  emptyIcon?: string;
  emptyTitle?: string;
  emptyMessage?: string;
}

interface Emits<T> {
  (e: 'update:currentPage', value: number): void;
  (e: 'update:rowsPerPage', value: number): void;
  (e: 'update:sortBy', value: string): void;
  (e: 'update:descending', value: boolean): void;
  (e: 'row-click', row: T, index: number): void;
  (e: 'request', requestProp: Record<string, unknown>): void;
}

const props = withDefaults(defineProps<Props<T>>(), {
  rowKey: 'id',
  currentPage: 1,
  rowsPerPage: 20,
  totalItems: 0,
  rowsPerPageOptions: () => [10, 20, 50, 100],
  showTopPagination: false,
  sortBy: '',
  descending: false,
  enableSorting: true,
  clickableRows: true,
  loading: false,
  error: null,
  loadingMessage: 'Loading...',
  emptyIcon: 'inbox',
  emptyTitle: 'No data found',
  emptyMessage: 'There are no items to display.',
});

const emit = defineEmits<Emits<T>>();

// Internal state
const internalRowsPerPage = ref(props.rowsPerPage);

// Computed properties
const currentPageValue = computed(() => props.currentPage || 1);

const totalPages = computed(() => {
  return Math.ceil(props.totalItems / internalRowsPerPage.value) || 1;
});

const startItem = computed(() => {
  return (currentPageValue.value - 1) * internalRowsPerPage.value + 1;
});

const endItem = computed(() => {
  return Math.min(currentPageValue.value * internalRowsPerPage.value, props.totalItems);
});

const tablePagination = computed(() => ({
  page: currentPageValue.value,
  rowsPerPage: internalRowsPerPage.value,
  rowsNumber: props.totalItems,
  sortBy: props.sortBy,
  descending: props.descending,
}));

// Computed columns with default sortable setting
const computedColumns = computed(() => {
  return props.columns.map((col) => ({
    ...col,
    sortable: col.sortable !== false && props.enableSorting, // Enable sorting by default unless explicitly disabled
  }));
});

// Methods
const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value && page !== currentPageValue.value) {
    emit('update:currentPage', page);
  }
};

const updateRowsPerPage = (newValue: number) => {
  internalRowsPerPage.value = newValue;
  emit('update:rowsPerPage', newValue);
  // Reset to first page when changing rows per page
  if (currentPageValue.value > 1) {
    emit('update:currentPage', 1);
  }
};

const handleRowClick = (row: T, index: number) => {
  if (props.clickableRows) {
    emit('row-click', row, index);
  }
};

const onRequest = (requestProp: Record<string, unknown>) => {
  // Handle sorting updates
  if (requestProp.pagination && typeof requestProp.pagination === 'object') {
    const pagination = requestProp.pagination as {
      sortBy?: string;
      descending?: boolean;
      page?: number;
      rowsPerPage?: number;
    };

    if (pagination.sortBy !== undefined && pagination.sortBy !== props.sortBy) {
      emit('update:sortBy', pagination.sortBy);
    }

    if (pagination.descending !== undefined && pagination.descending !== props.descending) {
      emit('update:descending', pagination.descending);
    }

    if (pagination.page !== undefined && pagination.page !== currentPageValue.value) {
      emit('update:currentPage', pagination.page);
    }

    if (
      pagination.rowsPerPage !== undefined &&
      pagination.rowsPerPage !== internalRowsPerPage.value
    ) {
      internalRowsPerPage.value = pagination.rowsPerPage;
      emit('update:rowsPerPage', pagination.rowsPerPage);
    }
  }

  emit('request', requestProp);
};

const onRowClick = (evt: Event, row: T, index: number) => {
  handleRowClick(row, index);
};

// Watch for external changes to rowsPerPage
watch(
  () => props.rowsPerPage,
  (newValue) => {
    internalRowsPerPage.value = newValue;
  },
);
</script>

<style lang="scss" scoped>
.base-table-container {
  .base-table {
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

    .table-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

      .table-header-cell {
        color: white !important;
        font-weight: 600 !important;
        font-size: 13px !important;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        padding: 14px 12px !important;
        border-bottom: none !important;
      }
    }

    .table-row {
      transition: all 0.2s ease;
      border-bottom: 1px solid #f0f0f0;

      &:nth-child(even) {
        background-color: #fafafa;
      }

      &:hover {
        transform: translateY(-1px);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      }

      :deep(.q-td) {
        padding: 14px 12px !important;
        vertical-align: top;
        border-bottom: none !important;
      }
    }

    .loading-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: #666;
    }
  }

  .pagination-controls {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    border-radius: 8px;

    .pagination-info {
      flex: 1;
    }

    .pagination-buttons {
      display: flex;
      align-items: center;
      gap: 4px;

      .pagination-btn {
        min-width: 36px;
        height: 36px;

        &:hover:not(:disabled) {
          background-color: rgba(255, 255, 255, 0.2);
        }
      }

      .pagination-current {
        min-width: 60px;
        text-align: center;
        color: #1976d2;
        font-weight: 600;
      }

      .rows-per-page-select {
        :deep(.q-field__control) {
          height: 36px;
          min-height: 36px;
        }
      }
    }
  }

  .top-pagination {
    .pagination-controls {
      background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
    }
  }

  .bottom-pagination {
    .pagination-controls {
      background: linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%);

      .pagination-info {
        font-size: 12px;
      }
    }
  }
}

// Responsive design
@media (max-width: 768px) {
  .base-table-container {
    .pagination-controls {
      flex-direction: column;
      gap: 12px;
      text-align: center;

      .pagination-info {
        order: 2;
      }

      .pagination-buttons {
        order: 1;
        justify-content: center;
      }
    }
  }
}

@media (max-width: 480px) {
  .base-table-container {
    .pagination-buttons {
      .rows-per-page-select {
        display: none;
      }
    }
  }
}
</style>

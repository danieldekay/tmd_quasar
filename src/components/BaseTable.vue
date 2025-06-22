<template>
  <q-card flat bordered class="base-table-card">
    <!-- Table Navbar -->
    <slot name="navbar" />

    <!-- Table -->
    <div>
      <q-table
        :rows="rows"
        :columns="columns"
        :row-key="rowKey"
        :pagination="pagination"
        :loading="loading"
        @request="handleRequest"
        flat
        class="base-table"
        @row-click="handleRowClick"
      >
        <!-- Custom cell templates -->
        <slot name="body" />

        <!-- Pass through all other table slots -->
        <template v-for="(_, slot) in $slots" v-slot:[slot]="scope" :key="slot">
          <slot v-if="slot !== 'navbar' && slot !== 'body'" :name="slot" v-bind="scope" />
        </template>
      </q-table>
    </div>
  </q-card>
</template>

<script setup lang="ts" generic="T extends Record<string, unknown>">
interface Column<T> {
  name: string;
  label: string;
  field: string | ((row: T) => unknown);
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
  style?: string;
  headerStyle?: string;
  sort?: (a: unknown, b: unknown, rowA?: T, rowB?: T) => number;
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
  pagination: {
    page: number;
    rowsPerPage: number;
    rowsNumber: number;
    sortBy?: string;
    descending?: boolean;
  };

  // State
  loading?: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const props = withDefaults(defineProps<Props<T>>(), {
  rowKey: 'id',
  loading: false,
});

const emit = defineEmits<{
  request: [requestProp: Record<string, unknown>];
  'row-click': [evt: Event, row: T];
}>();

// Methods
const handleRequest = (requestProp: Record<string, unknown>) => {
  emit('request', requestProp);
};

const handleRowClick = (evt: Event, row: T) => {
  emit('row-click', evt, row);
};
</script>

<style lang="scss" scoped>
.base-table-card {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.base-table {
  :deep(.q-table tbody tr) {
    cursor: pointer;
    transition: background-color 0.2s ease;

    &:hover {
      background-color: rgba(25, 118, 210, 0.04);
    }
  }

  :deep(.q-table th) {
    font-weight: 600;
    color: #424242;
  }
}
</style>

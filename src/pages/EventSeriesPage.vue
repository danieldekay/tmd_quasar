<template>
  <BaseListPage
    title="Event Series"
    :loading="loading"
    loading-message="Loading event series..."
    :error="error"
    error-title="Failed to Load Event Series"
    :show-empty-state="!loading && !error && eventSeries.length === 0"
    empty-state-icon="event_repeat"
    empty-state-title="No event series found"
    empty-state-message="No event series match your current search criteria."
    :enable-search="true"
    :search-query="searchQuery"
    search-placeholder="Search event series..."
    :has-active-filters="hasActiveFilters"
    :active-filter-count="activeFilterCount"
    :show-stats="true"
    :total-count="filteredEventSeries.length"
    :stats-label="formatSeriesText(filteredEventSeries.length)"
    :display-count="filteredEventSeries.length"
    :show-results-header="!loading && !error && eventSeries.length > 0"
    enable-pull-to-refresh
    @update:search-query="searchQuery = $event"
    @clear-filters="clearFilters"
    @retry="loadEventSeries"
    @pull-to-refresh="handlePullToRefresh"
  >
    <template #content>
      <BaseTable
        :rows="paginatedEventSeries"
        :columns="columns"
        :current-page="pagination.currentPage.value"
        :rows-per-page="pagination.rowsPerPage.value"
        :total-items="filteredEventSeries.length"
        :loading="loading"
        :error="error"
        :clickable-rows="true"
        :show-top-pagination="true"
        loading-message="Loading event series..."
        empty-icon="event_repeat"
        empty-title="No event series found"
        empty-message="No event series match your current search criteria."
        @update:current-page="pagination.goToPage"
        @update:rows-per-page="pagination.setRowsPerPage"
        @row-click="navigateToSeries"
      >
        <template #body="{ props }">
          <q-td key="logo" :props="props">
            <q-avatar size="40px" rounded>
              <img
                :src="props.row.acf?.logo || 'https://cdn.quasar.dev/img/mountains.jpg'"
                :alt="`Logo of ${props.row.title}`"
              />
            </q-avatar>
          </q-td>

          <q-td key="title" :props="props">
            <div class="series-title">{{ props.row.title }}</div>
            <div
              v-if="props.row.acf?.description"
              class="series-description text-caption text-grey-6"
            >
              {{ truncateDescription(props.row.acf.description) }}
            </div>
          </q-td>

          <q-td key="start_date" :props="props">
            <div v-if="props.row.start_date" class="date-content">
              <q-icon name="event" size="xs" class="q-mr-xs text-primary" />
              {{ formatDate(props.row.start_date) }}
            </div>
            <span v-else class="text-grey-5">—</span>
          </q-td>

          <q-td key="registration_start_date" :props="props">
            <div v-if="props.row.registration_start_date" class="date-content">
              <q-icon name="how_to_reg" size="xs" class="q-mr-xs text-secondary" />
              {{ formatDate(props.row.registration_start_date) }}
            </div>
            <span v-else class="text-grey-5">TBD</span>
          </q-td>

          <q-td key="date_added" :props="props">
            <div class="date-content">
              <q-icon name="calendar_today" size="xs" class="q-mr-xs text-accent" />
              {{ formatDate(props.row.date) }}
            </div>
          </q-td>

          <q-td key="city" :props="props">
            <div v-if="props.row.city" class="location-content">
              <q-icon name="location_city" size="xs" class="q-mr-xs text-primary" />
              {{ props.row.city }}
            </div>
            <span v-else class="text-grey-5">—</span>
          </q-td>

          <q-td key="country" :props="props">
            <div v-if="props.row.country" class="location-content">
              <q-icon name="flag" size="xs" class="q-mr-xs text-secondary" />
              {{ props.row.country }}
            </div>
            <span v-else class="text-grey-5">—</span>
          </q-td>

          <q-td key="website" :props="props">
            <q-btn
              v-if="props.row.acf?.website"
              flat
              round
              color="secondary"
              icon="launch"
              size="sm"
              :href="props.row.acf.website"
              target="_blank"
              @click.stop
            >
              <q-tooltip>Visit Website</q-tooltip>
            </q-btn>
            <span v-else class="text-grey-5">—</span>
          </q-td>
        </template>
      </BaseTable>
    </template>
  </BaseListPage>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { eventSeriesService } from '../services';
import type { EventSeries } from '../services/types';
import { useFormatters } from '../composables/useFormatters';
import { useTablePagination } from '../composables/useTablePagination';
import BaseListPage from '../components/BaseListPage.vue';
import BaseTable from '../components/BaseTable.vue';

const router = useRouter();
const $q = useQuasar();
const { formatDate } = useFormatters();

// Pagination
const pagination = useTablePagination({
  initialRowsPerPage: 20,
  rowsPerPageOptions: [10, 20, 50, 100],
});

// State
const eventSeries = ref<EventSeries[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);
const searchQuery = ref('');

// Helper function for date sorting
const sortByDate = (a: unknown, b: unknown): number => {
  const getDateValue = (value: unknown): number => {
    if (!value) return 0;
    if (typeof value === 'string') {
      const date = new Date(value);
      return isNaN(date.getTime()) ? 0 : date.getTime();
    }
    return 0;
  };

  return getDateValue(a) - getDateValue(b);
};

// Table columns
const columns = [
  {
    name: 'logo',
    label: 'Logo',
    field: 'logo',
    align: 'center' as const,
    style: 'width: 80px;',
    sortable: false,
  },
  {
    name: 'title',
    label: 'Event Series',
    field: 'title',
    align: 'left' as const,
    style: 'width: 40%;',
    sortable: true,
  },
  {
    name: 'start_date',
    label: 'Start Date',
    field: 'start_date',
    align: 'left' as const,
    style: 'width: 15%;',
    sortable: true,
    sort: sortByDate,
  },
  {
    name: 'registration_start_date',
    label: 'Registration',
    field: 'registration_start_date',
    align: 'left' as const,
    style: 'width: 15%;',
    sortable: true,
    sort: sortByDate,
  },
  {
    name: 'date_added',
    label: 'Added',
    field: 'date',
    align: 'left' as const,
    style: 'width: 15%;',
    sortable: true,
    sort: sortByDate,
  },
  {
    name: 'city',
    label: 'City',
    field: 'city',
    align: 'left' as const,
    style: 'width: 120px;',
    sortable: true,
  },
  {
    name: 'country',
    label: 'Country',
    field: 'country',
    align: 'left' as const,
    style: 'width: 120px;',
    sortable: true,
  },
  {
    name: 'website',
    label: 'Website',
    field: 'website',
    align: 'center' as const,
    style: 'width: 100px;',
    sortable: false,
  },
];

// Computed properties
const filteredEventSeries = computed(() => {
  if (!searchQuery.value.trim()) {
    return eventSeries.value;
  }

  const query = searchQuery.value.toLowerCase().trim();
  return eventSeries.value.filter((series) => {
    return (
      series.title.toLowerCase().includes(query) ||
      (series.acf?.description && series.acf.description.toLowerCase().includes(query))
    );
  });
});

const paginatedEventSeries = computed(() => {
  const start = (pagination.currentPage.value - 1) * pagination.rowsPerPage.value;
  const end = start + pagination.rowsPerPage.value;
  return filteredEventSeries.value.slice(start, end);
});

const hasActiveFilters = computed(() => {
  return !!searchQuery.value.trim();
});

const activeFilterCount = computed(() => {
  return searchQuery.value.trim() ? 1 : 0;
});

// Methods
const formatSeriesText = (count: number): string => {
  return pagination.formatItemsText(count, 'event series', 'event series');
};

const truncateDescription = (description: string): string => {
  if (!description) return '';
  const maxLength = 100;
  return description.length > maxLength ? description.substring(0, maxLength) + '...' : description;
};

const navigateToSeries = (series: EventSeries) => {
  void router.push(`/event-series/${series.id}`);
};

const loadEventSeries = async (showNotification = false) => {
  try {
    loading.value = true;
    error.value = null;
    eventSeries.value = await eventSeriesService.getEventSeries();

    if (showNotification) {
      $q?.notify?.({
        type: 'positive',
        message: 'Event series refreshed successfully',
        position: 'top',
        timeout: 2000,
      });
    }
  } catch (err) {
    console.error('Error loading event series:', err);
    error.value = 'Failed to load event series';
  } finally {
    loading.value = false;
  }
};

const clearFilters = () => {
  searchQuery.value = '';
  pagination.goToFirstPage();
};

const handlePullToRefresh = (done: () => void) => {
  void loadEventSeries(true).finally(() => {
    done();
  });
};

// Watch for changes in filtered results to update pagination
watch(filteredEventSeries, (newResults) => {
  pagination.setTotalItems(newResults.length);
});

onMounted(() => {
  void loadEventSeries();
});
</script>

<style lang="scss" scoped>
.series-title {
  color: #1976d2;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.4;
  margin-bottom: 4px;
}

.series-description {
  font-size: 11px;
  line-height: 1.3;
}

.date-content {
  display: flex;
  align-items: center;
  font-size: 13px;

  .q-icon {
    opacity: 0.8;
  }
}
</style>

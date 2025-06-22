<template>
  <q-page class="event-series-directory">
    <!-- Header Section -->
    <ListPageHeader
      title="Event Series Directory"
      subtitle="Discover tango event series from around the world"
      :show-stats="true"
      :total-count="eventSeries.length"
      stats-label="Total Event Series"
    />

    <!-- Filters Section -->
    <div class="q-px-lg q-pb-lg">
      <ListFilters
        :enable-search="true"
        :search-query="searchQuery"
        search-placeholder="Search by series name or description..."
        :search-debounce="300"
        :has-active-filters="hasActiveFilters"
        :active-filter-count="activeFilterCount"
        @update:search-query="onSearchChange"
        @clear-filters="clearAllFilters"
      >
        <template #active-filters>
          <q-chip
            v-if="searchQuery"
            removable
            @remove="clearSearch"
            color="primary"
            text-color="white"
            size="sm"
            icon="search"
          >
            Search: "{{ searchQuery }}"
          </q-chip>
        </template>
      </ListFilters>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-section q-px-lg">
      <q-card flat bordered>
        <q-card-section class="text-center q-py-xl">
          <q-spinner-dots color="primary" size="3em" />
          <p class="text-subtitle1 q-mt-md text-grey-6">Loading event series...</p>
        </q-card-section>
      </q-card>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-section q-px-lg">
      <OfflineMessage :error="error" title="Failed to Load Event Series" @retry="retryLoad" />
    </div>

    <!-- Results Section -->
    <div v-else class="results-section q-px-lg q-pb-lg">
      <q-card flat bordered class="content-card">
        <!-- Search and Filter Controls -->
        <div class="q-pa-md border-bottom">
          <div class="row q-gutter-md items-center">
            <div class="col-12 col-md-6">
              <q-input
                v-model="searchQuery"
                filled
                placeholder="Search event series..."
                clearable
                dense
                @update:model-value="onSearchChange"
              >
                <template v-slot:prepend>
                  <q-icon name="search" />
                </template>
              </q-input>
            </div>
            <div class="col-12 col-md-auto">
              <q-btn
                flat
                color="primary"
                icon="refresh"
                label="Reload"
                @click="() => loadEventSeries(true)"
                :loading="loading"
              />
            </div>
            <div class="col-12 col-md-auto">
              <q-btn
                v-if="hasActiveFilters"
                flat
                color="secondary"
                icon="clear"
                label="Clear Filters"
                @click="clearAllFilters"
              />
            </div>
          </div>
        </div>

        <!-- Quasar Table -->
        <q-table
          :rows="filteredEventSeries"
          :columns="columns"
          :loading="loading"
          :pagination="pagination"
          :rows-per-page-options="[10, 20, 50, 100]"
          :filter="searchQuery"
          row-key="id"
          flat
          @row-click="handleRowClick"
          @request="onRequest"
          class="event-series-table"
          binary-state-sort
        >
          <template #body-cell-logo="props">
            <q-td :props="props" class="cursor-pointer">
              <q-avatar size="40px" rounded>
                <img
                  :src="props.row.acf?.logo || 'https://cdn.quasar.dev/img/mountains.jpg'"
                  :alt="`Logo of ${props.row.title}`"
                />
              </q-avatar>
            </q-td>
          </template>

          <template #body-cell-title="props">
            <q-td :props="props" class="cursor-pointer">
              <div class="series-title">{{ formatText(props.row.title) }}</div>
              <div
                v-if="props.row.acf?.description"
                class="series-description text-caption text-grey-6"
              >
                {{ formatText(truncateDescription(props.row.acf.description)) }}
              </div>
            </q-td>
          </template>

          <template #body-cell-start_date="props">
            <q-td :props="props" class="cursor-pointer">
              <div v-if="props.row.start_date" class="date-content">
                <q-icon name="event" size="xs" class="q-mr-xs text-primary" />
                {{ formatDate(props.row.start_date) }}
              </div>
              <span v-else class="text-grey-5">—</span>
            </q-td>
          </template>

          <template #body-cell-registration_start_date="props">
            <q-td :props="props" class="cursor-pointer">
              <div v-if="props.row.registration_start_date" class="date-content">
                <q-icon name="how_to_reg" size="xs" class="q-mr-xs text-secondary" />
                {{ formatDate(props.row.registration_start_date) }}
              </div>
              <span v-else class="text-grey-5">TBD</span>
            </q-td>
          </template>

          <template #body-cell-date_added="props">
            <q-td :props="props" class="cursor-pointer">
              <div class="date-content">
                <q-icon name="calendar_today" size="xs" class="q-mr-xs text-accent" />
                {{ formatDate(props.row.date) }}
              </div>
            </q-td>
          </template>

          <template #body-cell-city="props">
            <q-td :props="props" class="cursor-pointer">
              <div v-if="props.row.city" class="location-content">
                <q-icon name="location_city" size="xs" class="q-mr-xs text-primary" />
                {{ formatText(props.row.city) }}
              </div>
              <span v-else class="text-grey-5">—</span>
            </q-td>
          </template>

          <template #body-cell-country="props">
            <q-td :props="props" class="cursor-pointer">
              <div v-if="props.row.country" class="location-content">
                <q-icon name="flag" size="xs" class="q-mr-xs text-secondary" />
                {{ formatText(props.row.country) }}
              </div>
              <span v-else class="text-grey-5">—</span>
            </q-td>
          </template>

          <template #body-cell-website="props">
            <q-td :props="props" class="cursor-pointer">
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
        </q-table>
      </q-card>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { eventSeriesService } from '../services';
import type { EventSeries } from '../services/types';
import { useFormatters } from '../composables/useFormatters';
import ListPageHeader from '../components/ListPageHeader.vue';
import ListFilters from '../components/ListFilters.vue';
import OfflineMessage from '../components/OfflineMessage.vue';

const router = useRouter();
const $q = useQuasar();
const { formatDate, formatText } = useFormatters();

// State
const eventSeries = ref<EventSeries[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);
const searchQuery = ref('');

// Quasar table pagination (using Quasar's built-in format)
const pagination = ref({
  sortBy: 'date',
  descending: true,
  page: 1,
  rowsPerPage: 20,
  rowsNumber: 0,
});

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

// Table columns (using Quasar's built-in sorting)
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

// Computed properties (using Quasar's built-in filtering)
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

const hasActiveFilters = computed(() => {
  return !!searchQuery.value.trim();
});

const activeFilterCount = computed(() => {
  return searchQuery.value.trim() ? 1 : 0;
});

// Methods
const truncateDescription = (description: string): string => {
  if (!description) return '';
  const maxLength = 100;
  return description.length > maxLength ? description.substring(0, maxLength) + '...' : description;
};

const navigateToSeries = (series: EventSeries) => {
  void router.push(`/event-series/${series.id}`);
};

// Quasar table request handler (for pagination and sorting)
const onRequest = (props: {
  pagination: { sortBy?: string; descending: boolean; page: number; rowsPerPage: number };
}) => {
  const { page, rowsPerPage, sortBy, descending } = props.pagination;

  pagination.value.page = page;
  pagination.value.rowsPerPage = rowsPerPage;
  pagination.value.sortBy = sortBy || 'date';
  pagination.value.descending = descending;
  pagination.value.rowsNumber = filteredEventSeries.value.length;
};

const loadEventSeries = async (showNotification = false) => {
  try {
    loading.value = true;
    error.value = null;
    // Get the first page to retrieve total count, then fetch all if needed
    const response = await eventSeriesService.getEventSeries();

    // If we have more than 10 items, fetch all of them
    if (response.total > 10) {
      const allResponse = await eventSeriesService.getEventSeries({ per_page: response.total });
      eventSeries.value = allResponse.eventSeries;
    } else {
      eventSeries.value = response.eventSeries;
    }

    pagination.value.rowsNumber = eventSeries.value.length;

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

const clearAllFilters = () => {
  searchQuery.value = '';
  pagination.value.page = 1;
};

const clearSearch = () => {
  searchQuery.value = '';
  pagination.value.page = 1;
};

const onSearchChange = () => {
  pagination.value.page = 1;
};

const handleRowClick = (evt: Event, row: Record<string, unknown>) => {
  navigateToSeries(row as unknown as EventSeries);
};

const retryLoad = () => {
  error.value = null;
  void loadEventSeries();
};

// Watch for changes in filtered results to update pagination
watch(filteredEventSeries, (newResults) => {
  pagination.value.rowsNumber = newResults.length;
  if (pagination.value.page > Math.ceil(newResults.length / pagination.value.rowsPerPage)) {
    pagination.value.page = 1;
  }
});

onMounted(() => {
  void loadEventSeries();
});
</script>

<style lang="scss" scoped>
.event-series-directory {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;
}

.loading-section,
.error-section {
  margin-bottom: 16px;
}

.content-card {
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.border-bottom {
  border-bottom: 1px solid #e0e0e0;
}

.event-series-table {
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

.location-content {
  display: flex;
  align-items: flex-start;
  gap: 6px;

  .q-icon {
    margin-top: 2px;
    opacity: 0.8;
  }

  div {
    line-height: 1.3;
  }
}
</style>

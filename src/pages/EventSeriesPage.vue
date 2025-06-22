<template>
  <q-page class="event-series-directory">
    <!-- Header Section -->
    <ListPageHeader
      title="Event Series"
      :show-stats="true"
      :total-count="eventSeries.length"
      :stats-label="formatSeriesText(eventSeries.length)"
    />

    <!-- Filters Section -->
    <div class="q-px-lg q-pb-lg">
      <ListFilters
        :enable-search="true"
        :search-query="searchQuery"
        search-placeholder="Search event series..."
        :search-debounce="300"
        :has-active-filters="hasActiveFilters"
        :active-filter-count="activeFilterCount"
        @update:search-query="searchQuery = $event"
        @clear-filters="clearFilters"
      />
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
      <OfflineMessage :error="error" title="Failed to Load Event Series" @retry="loadEventSeries" />
    </div>

    <!-- Results Section -->
    <div v-else class="results-section q-px-lg q-pb-lg">
      <q-card flat bordered class="content-card">
        <!-- Event Series Table -->
        <BaseTable
          :rows="paginatedEventSeries"
          :columns="columns"
          :loading="loading"
          :pagination="tablePagination"
          row-key="id"
          @request="onRequest"
          @row-click="handleRowClick"
        >
          <template #navbar>
            <TableNavbar
              :filtered-count="filteredEventSeries.length"
              :total-count="eventSeries.length"
              :has-active-filters="hasActiveFilters"
              :current-page="tablePagination.page"
              :total-pages="Math.ceil(filteredEventSeries.length / tablePagination.rowsPerPage)"
              :rows-per-page="tablePagination.rowsPerPage"
              :loading="loading"
              item-name="event series"
              item-name-plural="event series"
              @reload="loadEventSeries"
              @update:rows-per-page="handleRowsPerPageChange"
              @update:current-page="goToPage"
            />
          </template>
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
        </BaseTable>
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
import BaseTable from '../components/BaseTable.vue';
import TableNavbar from '../components/TableNavbar.vue';
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

const tablePagination = ref({
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
  const start = (tablePagination.value.page - 1) * tablePagination.value.rowsPerPage;
  const end = start + tablePagination.value.rowsPerPage;
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
  if (count === 1) {
    return '1 event series';
  }
  return `${count.toLocaleString()} event series`;
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
    // Get the first page to retrieve total count, then fetch all if needed
    const response = await eventSeriesService.getEventSeries();

    // If we have more than 10 items, fetch all of them
    if (response.total > 10) {
      const allResponse = await eventSeriesService.getEventSeries({ per_page: response.total });
      eventSeries.value = allResponse.eventSeries;
    } else {
      eventSeries.value = response.eventSeries;
    }

    tablePagination.value.rowsNumber = eventSeries.value.length;

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
  tablePagination.value.page = 1;
};

const onRequest = (requestProp: Record<string, unknown>) => {
  const requestProps = requestProp as {
    pagination: { page: number; rowsPerPage: number; sortBy?: string; descending: boolean };
  };
  const { page, rowsPerPage, sortBy, descending } = requestProps.pagination;

  tablePagination.value.page = page;
  tablePagination.value.rowsPerPage = rowsPerPage;
  tablePagination.value.sortBy = sortBy || 'date';
  tablePagination.value.descending = descending;

  // For client-side pagination, we don't need to reload data
};

const handleRowsPerPageChange = (newRowsPerPage: number) => {
  tablePagination.value.rowsPerPage = newRowsPerPage;
  tablePagination.value.page = 1;
};

const goToPage = (page: number) => {
  tablePagination.value.page = page;
};

const handleRowClick = (evt: Event, row: Record<string, unknown>) => {
  navigateToSeries(row as unknown as EventSeries);
};

// Watch for changes in filtered results to update pagination
watch(filteredEventSeries, (newResults) => {
  tablePagination.value.rowsNumber = newResults.length;
  if (
    tablePagination.value.page > Math.ceil(newResults.length / tablePagination.value.rowsPerPage)
  ) {
    tablePagination.value.page = 1;
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

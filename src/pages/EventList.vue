<template>
  <q-pull-to-refresh @refresh="handlePullToRefresh">
    <q-page class="events-directory">
      <!-- Header Section -->
      <ListPageHeader
        title="Events"
        v-bind="!filters.showPastEvents ? { subtitle: '(Future Events Only)' } : {}"
        :show-stats="true"
        :total-count="pagination.rowsNumber"
        :stats-label="formatEventsText(pagination.rowsNumber)"
      />

      <!-- Filters Section -->
      <div class="q-px-lg q-pb-lg">
        <q-card flat bordered class="filters-card">
          <q-card-section>
            <div class="row q-gutter-md">
              <div class="col-xs-12 col-sm-6 col-md-3">
                <q-select
                  v-model="filters.selectedCountry"
                  :options="countryOptions"
                  label="Filter by Country"
                  clearable
                  dense
                  outlined
                  emit-value
                  map-options
                  :option-label="getCountryName"
                  :option-value="(opt) => opt"
                  @update:model-value="onFilterChange"
                >
                  <template v-slot:prepend>
                    <q-icon name="flag" />
                  </template>
                </q-select>
              </div>

              <div class="col-xs-12 col-sm-6 col-md-2">
                <div class="q-mt-sm">
                  <q-checkbox
                    v-model="filters.showPastEvents"
                    label="Include past events"
                    color="primary"
                    @update:model-value="onFilterChange"
                  />
                </div>
              </div>

              <div class="col-xs-12 col-sm-6 col-md-2">
                <q-btn
                  flat
                  color="primary"
                  icon="refresh"
                  label="Clear Filters"
                  @click="clearFilters"
                  :disable="!hasActiveFilters()"
                />
              </div>
            </div>

            <!-- Active Filters Display -->
            <div v-if="hasActiveFilters()" class="q-mt-md">
              <q-chip
                v-if="filters.selectedCountry"
                removable
                @remove="clearCountryFilter"
                color="secondary"
                text-color="white"
                size="sm"
                icon="flag"
              >
                {{ getCountryName(filters.selectedCountry) }}
              </q-chip>
              <q-chip
                v-if="filters.showPastEvents"
                removable
                @remove="clearPastEventsFilter"
                color="primary"
                text-color="white"
                size="sm"
                icon="event"
              >
                Include Past Events
              </q-chip>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Events Table -->
      <div class="q-px-lg q-pb-lg">
        <q-card flat bordered class="content-card">
          <q-table
            :rows="events"
            :columns="columns"
            :loading="loading"
            :pagination="pagination"
            row-key="id"
            @request="onRequest"
            @row-click="handleRowClick"
            :rows-per-page-options="[10, 20, 50, 100]"
            binary-state-sort
            flat
            bordered
            class="events-table"
          >
            <!-- Search Input -->
            <template #top>
              <div class="row full-width items-center q-gutter-md">
                <div class="col">
                  <q-input
                    v-model="searchQuery"
                    placeholder="Search events, cities, or countries"
                    dense
                    outlined
                    clearable
                    @update:model-value="onSearchChange"
                    @clear="onSearchChange"
                  >
                    <template v-slot:prepend>
                      <q-icon name="search" />
                    </template>
                  </q-input>
                </div>
                <div class="col-auto">
                  <q-btn
                    flat
                    round
                    color="primary"
                    icon="refresh"
                    @click="handleRefresh"
                    :loading="loading"
                  >
                    <q-tooltip>Refresh Events</q-tooltip>
                  </q-btn>
                </div>
              </div>
            </template>

            <!-- Custom Cell Templates -->
            <template #body-cell-title="props">
              <q-td :props="props" class="event-title-cell cursor-pointer">
                <div class="event-title-content">
                  <div class="event-title text-weight-medium">
                    {{ formatText(props.row.title) }}
                  </div>
                  <div v-if="props.row.subtitle" class="event-subtitle text-caption text-grey-6">
                    {{ formatText(props.row.subtitle) }}
                  </div>
                </div>
              </q-td>
            </template>

            <template #body-cell-start_date="props">
              <q-td :props="props" class="date-cell cursor-pointer">
                <div class="date-content">
                  <q-icon name="event" size="xs" class="q-mr-xs text-primary" />
                  <span class="text-weight-medium">{{ formatDate(props.row.start_date) }}</span>
                </div>
              </q-td>
            </template>

            <template #body-cell-city="props">
              <q-td :props="props" class="city-cell cursor-pointer">
                <div class="city-content">
                  <q-icon name="place" size="xs" class="q-mr-xs text-accent" />
                  <div>
                    <div class="text-weight-medium">
                      {{ formatText(capitalizeCity(props.row.city)) }}
                    </div>
                  </div>
                </div>
              </q-td>
            </template>

            <template #body-cell-country="props">
              <q-td :props="props" class="country-cell cursor-pointer">
                <div class="country-content">
                  <q-icon name="flag" size="xs" class="q-mr-xs text-accent" />
                  <div>
                    <div class="text-weight-medium">{{ getCountryName(props.row.country) }}</div>
                  </div>
                </div>
              </q-td>
            </template>

            <template #body-cell-category="props">
              <q-td :props="props" class="category-cell cursor-pointer">
                <q-chip
                  v-if="getEventCategory(props.row.taxonomies)"
                  :label="getEventCategory(props.row.taxonomies)"
                  :color="getEventCategoryColor(props.row.taxonomies).color"
                  :text-color="getEventCategoryColor(props.row.taxonomies).textColor"
                  size="sm"
                  dense
                  class="category-chip"
                />
                <span v-else class="text-grey-5">—</span>
              </q-td>
            </template>

            <template #body-cell-teachers="props">
              <q-td :props="props" class="cursor-pointer">
                <span class="text-grey-5">TBD</span>
              </q-td>
            </template>

            <template #body-cell-status="props">
              <q-td :props="props" class="cursor-pointer">
                <span class="text-grey-5">—</span>
              </q-td>
            </template>

            <!-- No Data State -->
            <template #no-data>
              <div class="text-center q-py-xl">
                <q-icon name="event_busy" size="3em" color="grey-4" />
                <p class="text-subtitle1 q-mt-md text-grey-6">No events found</p>
                <q-btn
                  v-if="hasActiveFilters()"
                  flat
                  color="primary"
                  label="Clear Filters"
                  @click="clearFilters"
                />
              </div>
            </template>

            <!-- Loading State -->
            <template #loading>
              <q-inner-loading showing color="primary" />
            </template>
          </q-table>
        </q-card>
      </div>

      <!-- Error State -->
      <div v-if="error" class="error-section q-px-lg">
        <OfflineMessage :error="error" title="Failed to Load Events" @retry="handleRefresh" />
      </div>
    </q-page>
  </q-pull-to-refresh>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { eventListService, type EventListItem } from '../services';
import { useFormatters } from '../composables/useFormatters';
import { useEventFilters } from '../composables/useEventFilters';
import { useCountries } from '../composables/useCountries';
import OfflineMessage from '../components/OfflineMessage.vue';
import ListPageHeader from '../components/ListPageHeader.vue';

const router = useRouter();
const $q = useQuasar();

// Use composables
const {
  filters,
  clearAllFilters: clearFilters,
  hasActiveFilters,
  initializeFilters,
} = useEventFilters();

const { getCountryName, getCountryOptionsFromCodes } = useCountries();

// State
const events = ref<EventListItem[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);
const searchQuery = ref('');

const allCountries = ref<Set<string>>(new Set());

const updateCountrySet = (events: EventListItem[]) => {
  events.forEach((e) => {
    if (e.country) allCountries.value.add(e.country);
  });
};

const countryOptions = computed(() => getCountryOptionsFromCodes(allCountries.value));

const { formatDate, getEventCategory, getEventCategoryColor, formatText } = useFormatters();

// Helper function to capitalize city names
const capitalizeCity = (city: string): string => {
  if (!city) return '';
  return city
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

// Table columns
const columns = [
  {
    name: 'title',
    label: 'Event',
    field: 'title',
    align: 'left' as const,
    sortable: true,
  },
  {
    name: 'start_date',
    label: 'Dates',
    field: 'start_date',
    align: 'left' as const,
    sortable: true,
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
    name: 'category',
    label: 'Category',
    field: 'category_name',
    align: 'center' as const,
    sortable: true,
  },
  {
    name: 'teachers',
    label: 'Teachers',
    field: 'teachers',
    align: 'left' as const,
    sortable: false,
  },
  {
    name: 'status',
    label: 'Status',
    field: 'status',
    align: 'center' as const,
    sortable: true,
  },
];

// Pagination state
const pagination = ref({
  sortBy: 'start_date',
  descending: true,
  page: 1,
  rowsPerPage: 20,
  rowsNumber: 0,
});

const formatEventsText = (count: number): string => {
  if (count === 1) {
    return '1 event';
  }
  return `${count.toLocaleString()} events`;
};

// Handle q-table request
const onRequest = async (requestProp: {
  pagination: { page: number; rowsPerPage: number; sortBy?: string; descending: boolean };
}) => {
  const { page, rowsPerPage, sortBy, descending } = requestProp.pagination;

  pagination.value.page = page;
  pagination.value.rowsPerPage = rowsPerPage;
  pagination.value.sortBy = sortBy || 'start_date';
  pagination.value.descending = descending;

  await loadEvents();
};

// Load events from API
const loadEvents = async (forceReload = false) => {
  loading.value = true;
  error.value = null;

  try {
    const params: Record<string, unknown> = {
      page: pagination.value.page,
      perPage: pagination.value.rowsPerPage,
      orderby: pagination.value.sortBy === 'start_date' ? 'meta_value' : 'title',
      order: pagination.value.descending ? 'desc' : 'asc',
      meta_key: pagination.value.sortBy === 'start_date' ? 'start_date' : undefined,
      taxonomies: true,
    };

    // Filter for future events at API level when not showing past events
    if (!filters.value.showPastEvents) {
      const today = new Date().toISOString().split('T')[0];
      params.meta_query = JSON.stringify([
        {
          key: 'start_date',
          value: today,
          compare: '>=',
          type: 'DATE',
        },
      ]);
    }

    if (filters.value.selectedCountry) {
      params.country = filters.value.selectedCountry;
    }
    if (searchQuery.value) {
      params.search = searchQuery.value;
    }
    if (forceReload) {
      params._t = Date.now();
    }

    const response = await eventListService.getEvents(params);

    events.value = response.events;
    pagination.value.rowsNumber = response.totalCount;

    updateCountrySet(response.events);

    if (forceReload) {
      $q?.notify?.({
        type: 'positive',
        message: 'Events refreshed successfully',
        position: 'top',
        timeout: 2000,
      });
    }
  } catch (err) {
    console.error('Error loading events:', err);
    error.value = 'Failed to load events';
  } finally {
    loading.value = false;
  }
};

// Navigation
const navigateToEvent = (event: EventListItem) => {
  void router.push(`/events/${event.id}`);
};

const handleRowClick = (evt: Event, row: Record<string, unknown>) => {
  navigateToEvent(row as unknown as EventListItem);
};

// Refresh and filter handlers
const handleRefresh = () => {
  void loadEvents(true);
};

const handlePullToRefresh = (done: () => void) => {
  void loadEvents(true).finally(() => {
    done();
  });
};

// Filter change handlers
const onFilterChange = () => {
  pagination.value.page = 1; // Reset to first page
  void loadEvents();
};

const onSearchChange = () => {
  pagination.value.page = 1; // Reset to first page
  void loadEvents();
};

const clearCountryFilter = () => {
  filters.value.selectedCountry = null;
  onFilterChange();
};

const clearPastEventsFilter = () => {
  filters.value.showPastEvents = false;
  onFilterChange();
};

// Watch for filter changes
watch(
  [() => filters.value.selectedCountry, () => filters.value.showPastEvents],
  () => {
    pagination.value.page = 1; // Reset to first page
    void loadEvents();
  },
  { deep: true },
);

onMounted(() => {
  initializeFilters();
  void loadEvents();
});
</script>

<style lang="scss" scoped>
// Page layout
.events-directory {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;
}

.page-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 16px;
}

.header-section {
  margin-bottom: 16px;

  :deep(.list-page-header) {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    border-radius: 8px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.2);
  }
}

.filters-section {
  margin-bottom: 16px;

  .country-select {
    :deep(.q-field__control) {
      border-radius: 6px;
    }
  }

  .checkbox-container {
    display: flex;
    align-items: center;
    height: 56px;
    padding-left: 12px;

    .past-events-checkbox {
      :deep(.q-checkbox__label) {
        font-weight: 500;
        color: #495057;
      }
    }
  }
}

.loading-section,
.error-section {
  margin-bottom: 16px;

  .loading-card {
    border-radius: 8px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
  }
}

.content-section {
  .content-card {
    border-radius: 8px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
    overflow: hidden;
    background: rgba(255, 255, 255, 0.98);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.3);
  }

  .results-header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 16px 20px;

    .results-info {
      .text-h6 {
        color: white;
        font-weight: 600;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
        font-size: 1.1rem;
      }

      .text-caption {
        color: rgba(255, 255, 255, 0.9);
        font-weight: 500;
      }

      .text-grey-6 {
        color: rgba(255, 255, 255, 0.7) !important;
      }
    }

    .results-actions {
      .refresh-btn-small {
        background: rgba(255, 255, 255, 0.2);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.3);

        &:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: translateY(-1px);
        }
      }

      .pagination-controls {
        display: flex;
        align-items: center;
        gap: 2px;

        .q-btn {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);

          &:hover:not(.disabled) {
            background: rgba(255, 255, 255, 0.2);
          }

          &.disabled {
            opacity: 0.4;
          }
        }

        .page-info {
          color: rgba(255, 255, 255, 0.9);
          font-weight: 500;
          min-width: 60px;
          text-align: center;
        }
      }

      .rows-per-page-select {
        min-width: 80px;

        :deep(.q-field__control) {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 4px;
          color: white;

          &:hover {
            background: rgba(255, 255, 255, 0.15);
          }
        }

        :deep(.q-field__native) {
          color: white;
          font-size: 12px;
        }

        :deep(.q-field__append) {
          color: rgba(255, 255, 255, 0.8);
        }
      }
    }
  }
}

.border-bottom {
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
}

.hover-highlight:hover {
  background-color: rgba(25, 118, 210, 0.08) !important;
  transition: background-color 0.2s ease;
}

.event-title {
  max-width: 250px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.event-title-cell {
  max-width: 250px !important;
  padding: 16px 12px !important;
}

.event-title-content {
  .event-title {
    color: #1976d2;
    font-size: 14px;
    line-height: 1.4;
    max-width: none;
    white-space: normal;
    overflow: visible;
    text-overflow: initial;
  }

  .event-subtitle {
    margin-top: 2px;
    font-size: 11px;
  }
}

.events-table {
  min-width: 800px;
}

.modern-table {
  border-radius: 6px !important;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  :deep(.q-table__top) {
    padding: 12px 16px;
    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  }

  :deep(.q-table__bottom) {
    padding: 10px 16px;
    background-color: #fafafa;
    border-top: 1px solid #e0e0e0;
  }
}

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

    .sort-icon {
      color: rgba(255, 255, 255, 0.7);
      transition: all 0.2s ease;

      &.active-sort {
        color: white;
        transform: scale(1.1);
      }
    }
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

.date-cell {
  .date-content {
    display: flex;
    align-items: center;
    font-size: 13px;

    .q-icon {
      opacity: 0.8;
    }
  }
}

.city-cell {
  .city-content {
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
}

.country-cell {
  .country-content {
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
}

.category-cell {
  text-align: center;

  .category-chip {
    font-weight: 500;
    border-radius: 4px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    transition: all 0.2s ease;

    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
    }
  }
}

.edition-cell {
  .edition-content {
    display: flex;
    align-items: center;
    font-size: 13px;

    .text-weight-medium {
      font-weight: 500;
    }
  }
}

// Enhanced responsive design
@media (max-width: 1024px) {
  .page-container {
    padding: 12px;
  }

  .results-header {
    .results-actions {
      .pagination-controls {
        .page-info {
          min-width: 50px;
          font-size: 11px;
        }

        .q-btn {
          min-width: 32px;
          min-height: 32px;
        }
      }

      .rows-per-page-select {
        min-width: 70px;

        :deep(.q-field__native) {
          font-size: 11px;
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .page-container {
    padding: 8px;
  }

  .header-section,
  .filters-section,
  .content-section {
    margin-bottom: 12px;
  }

  .event-title-cell {
    max-width: 150px !important;
  }

  .events-table {
    min-width: 600px;
  }

  .table-row {
    :deep(.q-td) {
      padding: 10px 8px !important;
      font-size: 12px;
    }
  }

  .table-header-cell {
    padding: 10px 8px !important;
    font-size: 11px !important;
  }

  .results-header {
    padding: 12px 16px !important;
    .row {
      flex-direction: column;
      gap: 12px;
    }

    .results-info {
      text-align: center;
    }

    .results-actions {
      justify-content: center;

      .row {
        flex-wrap: wrap;
        justify-content: center;
        gap: 8px;
      }

      .pagination-controls {
        order: 1;
      }

      .rows-per-page-select {
        order: 2;
      }

      .refresh-btn-small {
        order: 3;
      }
    }
  }
}

// Filter section enhancements
:deep(.filters-section) {
  .list-filters {
    .filters-card {
      border-radius: 8px;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.3);
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);

      .q-card-section {
        background: transparent;
      }
    }
  }
}
</style>

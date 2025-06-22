<template>
  <q-pull-to-refresh @refresh="handlePullToRefresh">
    <q-page class="events-directory">
      <!-- Header Section -->
      <ListPageHeader
        title="Events"
        v-bind="!filters.showPastEvents ? { subtitle: '(Future Events Only)' } : {}"
        :show-stats="true"
        :total-count="state.totalCount"
        :stats-label="formatEventsText(state.totalCount)"
      />

      <!-- Filters Section -->
      <div class="q-px-lg q-pb-lg">
        <ListFilters
          :enable-search="true"
          :search-query="filters.searchQuery"
          search-placeholder="Search events, cities, or countries"
          :search-debounce="300"
          :has-active-filters="hasFilters()"
          :active-filter-count="filterCount()"
          @update:search-query="(val) => updateFilter('searchQuery', val)"
          @clear-filters="clearFilters"
        >
          <template #filters>
            <div class="col-xs-12 col-sm-6 col-md-3">
              <q-select
                :model-value="filters.selectedCountry"
                @update:model-value="(val) => updateFilter('selectedCountry', val)"
                :options="countryOptions"
                label="Filter by Country"
                clearable
                dense
                outlined
                emit-value
                map-options
                :option-label="getCountryName"
                :option-value="(opt) => opt"
              >
                <template v-slot:prepend>
                  <q-icon name="flag" />
                </template>
              </q-select>
            </div>

            <div class="col-xs-12 col-sm-6 col-md-2">
              <div class="q-mt-sm">
                <q-checkbox
                  :model-value="filters.showPastEvents"
                  @update:model-value="(val) => updateFilter('showPastEvents', val)"
                  label="Include past events"
                  color="primary"
                />
              </div>
            </div>
          </template>

          <template #active-filters>
            <q-chip
              v-if="filters.searchQuery"
              removable
              @remove="updateFilter('searchQuery', '')"
              color="primary"
              text-color="white"
              size="sm"
              icon="search"
            >
              Search: "{{ filters.searchQuery }}"
            </q-chip>
            <q-chip
              v-if="filters.selectedCountry"
              removable
              @remove="updateFilter('selectedCountry', null)"
              color="secondary"
              text-color="white"
              size="sm"
              icon="flag"
            >
              {{ getCountryName(filters.selectedCountry) }}
            </q-chip>
          </template>
        </ListFilters>
      </div>

      <!-- Loading State -->
      <div v-if="state.loading" class="loading-section q-px-lg">
        <q-card flat bordered>
          <q-card-section class="text-center q-py-xl">
            <q-spinner-dots color="primary" size="3em" />
            <p class="text-subtitle1 q-mt-md text-grey-6">Loading events...</p>
          </q-card-section>
        </q-card>
      </div>

      <!-- Error State -->
      <div v-else-if="state.error" class="error-section q-px-lg">
        <OfflineMessage :error="state.error" title="Failed to Load Events" @retry="handleRefresh" />
      </div>

      <!-- Results Section -->
      <div v-else class="results-section q-px-lg q-pb-lg">
        <q-card flat bordered class="content-card">
          <!-- Events Table -->
          <BaseTable
            :rows="filteredEvents"
            :columns="columns"
            :loading="state.loading"
            :pagination="tablePagination"
            row-key="id"
            @request="onRequest"
            @row-click="handleRowClick"
          >
            <template #navbar>
              <TableNavbar
                :filtered-count="filteredEvents.length"
                :total-count="state.totalCount"
                :has-active-filters="hasFilters()"
                :current-page="tablePagination.page"
                :total-pages="Math.ceil(state.totalCount / tablePagination.rowsPerPage)"
                :rows-per-page="tablePagination.rowsPerPage"
                :loading="state.loading"
                item-name="event"
                @reload="handleRefresh"
                @update:rows-per-page="handleRowsPerPageChange"
                @update:current-page="goToPage"
              />
            </template>
            <template #body-cell-title="props">
              <q-td :props="props" class="event-title-cell cursor-pointer">
                <div class="event-title-content">
                  <div class="event-title text-weight-medium">{{ props.row.title }}</div>
                  <div v-if="props.row.subtitle" class="event-subtitle text-caption text-grey-6">
                    {{ props.row.subtitle }}
                  </div>
                </div>
              </q-td>
            </template>
            <template #body-cell-dates="props">
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
                    <div class="text-weight-medium">{{ capitalizeCity(props.row.city) }}</div>
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
          </BaseTable>
        </q-card>
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
import ListFilters from '../components/ListFilters.vue';
import BaseTable from '../components/BaseTable.vue';
import TableNavbar from '../components/TableNavbar.vue';

const router = useRouter();
const $q = useQuasar();

// Use composables
const {
  filters,
  updateFilter,
  clearAllFilters: clearFilters,
  hasActiveFilters: hasFilters,
  activeFilterCount: filterCount,
  initializeFilters,
} = useEventFilters();

const { getCountryName, getCountryOptionsFromCodes } = useCountries();

// State
const state = ref({
  events: [] as EventListItem[],
  loading: false,
  error: null as string | null,
  totalCount: 0,
  totalPages: 0,
  currentPage: 1,
  hasNextPage: false,
  hasPrevPage: false,
});

const allCountries = ref<Set<string>>(new Set());

const updateCountrySet = (events: EventListItem[]) => {
  events.forEach((e) => {
    if (e.country) allCountries.value.add(e.country);
  });
};

const countryOptions = computed(() => getCountryOptionsFromCodes(allCountries.value));

const { formatDate, getEventCategory, getEventCategoryColor } = useFormatters();

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
    name: 'dates',
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

const filteredEvents = computed(() => {
  const events = state.value.events || [];

  // If we're showing past events, return all events since API filtering is not applied
  // If we're not showing past events, the API already filtered for future events
  if (filters.value.showPastEvents) {
    return events;
  }

  // API already filtered for future events, so just return them
  return events;
});

const tablePagination = ref({
  sortBy: 'start_date',
  descending: false,
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

const onRequest = (requestProp: Record<string, unknown>) => {
  const requestProps = requestProp as {
    pagination: { page: number; rowsPerPage: number; sortBy?: string; descending: boolean };
  };
  const { page, rowsPerPage, sortBy, descending } = requestProps.pagination;

  tablePagination.value.page = page;
  tablePagination.value.rowsPerPage = rowsPerPage;
  tablePagination.value.sortBy = sortBy || 'start_date';
  tablePagination.value.descending = descending;

  void loadEvents(page);
};

const loadEvents = async (page?: number, forceReload = false) => {
  state.value.loading = true;
  state.value.error = null;

  try {
    const params: Record<string, unknown> = {
      page: page || state.value.currentPage,
      perPage: filters.value.rowsPerPage,
      orderby: filters.value.sortBy === 'start_date' ? 'meta_value' : 'title',
      order: filters.value.descending ? 'desc' : 'asc',
      meta_key: filters.value.sortBy === 'start_date' ? 'start_date' : undefined,
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
    if (filters.value.searchQuery) {
      params.search = filters.value.searchQuery;
    }
    if (forceReload) {
      params._t = Date.now();
    }

    const response = await eventListService.getEvents(params);

    state.value.events = response.events;
    state.value.totalCount = response.totalCount;
    state.value.totalPages = response.totalPages;
    state.value.currentPage = response.currentPage;
    state.value.hasNextPage = response.hasNextPage;
    state.value.hasPrevPage = response.hasPrevPage;

    // Update pagination object
    tablePagination.value.rowsNumber = response.totalCount;
    tablePagination.value.page = response.currentPage;

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
    state.value.error = 'Failed to load events';
  } finally {
    state.value.loading = false;
  }
};

const navigateToEvent = (event: EventListItem) => {
  void router.push(`/events/${event.id}`);
};

const handleRowClick = (evt: Event, row: Record<string, unknown>) => {
  navigateToEvent(row as unknown as EventListItem);
};

const handleRefresh = () => {
  void loadEvents(1, true);
};

const handlePullToRefresh = (done: () => void) => {
  void loadEvents(1, true).finally(() => {
    done();
  });
};

const goToPage = (page: number) => {
  if (page >= 1 && page <= state.value.totalPages && page !== state.value.currentPage) {
    void loadEvents(page);
  }
};

const handleRowsPerPageChange = (newRowsPerPage: number) => {
  updateFilter('rowsPerPage', newRowsPerPage);
  void loadEvents(1); // Reset to first page when changing rows per page
};

// Watch for filter changes
watch(
  [
    () => filters.value.selectedCountry,
    () => filters.value.searchQuery,
    () => filters.value.showPastEvents,
  ],
  () => {
    void loadEvents(1);
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

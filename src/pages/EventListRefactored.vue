<template>
  <q-pull-to-refresh @refresh="handlePullToRefresh">
    <q-page class="events-page">
      <div class="page-container">
        <!-- Use our standardized header -->
        <div class="header-section">
          <ListPageHeader
            title="Events"
            v-bind="!filters.showPastEvents ? { subtitle: '(Future Events Only)' } : {}"
            :show-stats="true"
            :total-count="state.totalCount"
            :stats-label="formatEventsText(state.totalCount)"
          />
        </div>

        <!-- Use our standardized filters -->
        <div class="filters-section">
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
              <!-- Custom filter content goes here -->
              <div class="col-12 col-md-6">
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
                  option-label="name"
                  option-value="code"
                  class="country-select"
                >
                  <template v-slot:prepend>
                    <q-icon name="flag" />
                  </template>
                </q-select>
              </div>

              <div class="col-12 col-md-6">
                <div class="checkbox-container">
                  <q-checkbox
                    :model-value="filters.showPastEvents"
                    @update:model-value="(val) => updateFilter('showPastEvents', val)"
                    label="Include past events"
                    color="primary"
                    class="past-events-checkbox"
                  />
                </div>
              </div>
            </template>
          </ListFilters>
        </div>

        <!-- Loading State -->
        <div v-if="state.loading" class="loading-section">
          <q-card flat bordered class="loading-card">
            <q-card-section class="text-center q-py-xl">
              <q-spinner-dots color="primary" size="3em" />
              <p class="text-subtitle1 q-mt-md text-grey-6">Loading events...</p>
            </q-card-section>
          </q-card>
        </div>

        <!-- Error State -->
        <div v-else-if="state.error" class="error-section">
          <OfflineMessage
            :error="state.error"
            title="Failed to Load Events"
            @retry="handleRefresh"
          />
        </div>

        <!-- Content Section -->
        <div v-else class="content-section">
          <q-card flat bordered class="content-card">
            <!-- Results Header -->
            <q-card-section class="results-header border-bottom">
              <div class="row items-center justify-between">
                <div class="results-info">
                  <div class="text-h6 text-weight-medium">
                    {{ formatEventsText(filteredEvents.length) }}
                    <span v-if="hasFilters()" class="text-grey-6">
                      (filtered from {{ state.totalCount.toLocaleString() }})
                    </span>
                  </div>
                  <div class="text-caption text-grey-6 q-mt-xs">
                    Page {{ state.currentPage }} of {{ state.totalPages }}
                    <span v-if="state.totalCount > 0" class="q-ml-sm">
                      • Showing {{ (state.currentPage - 1) * filters.rowsPerPage + 1 }}-{{
                        Math.min(state.currentPage * filters.rowsPerPage, state.totalCount)
                      }}
                      of {{ state.totalCount }}
                    </span>
                  </div>
                </div>
                <div class="results-actions">
                  <div class="row items-center q-gutter-sm">
                    <!-- Pagination Controls -->
                    <div class="pagination-controls">
                      <q-btn
                        flat
                        round
                        icon="first_page"
                        color="white"
                        text-color="rgba(255,255,255,0.8)"
                        size="sm"
                        :disable="state.currentPage <= 1"
                        @click="goToPage(1)"
                        title="First page"
                      />
                      <q-btn
                        flat
                        round
                        icon="chevron_left"
                        color="white"
                        text-color="rgba(255,255,255,0.8)"
                        size="sm"
                        :disable="!state.hasPrevPage"
                        @click="goToPage(state.currentPage - 1)"
                        title="Previous page"
                      />
                      <span class="page-info text-caption q-mx-sm">
                        {{ state.currentPage }} / {{ state.totalPages }}
                      </span>
                      <q-btn
                        flat
                        round
                        icon="chevron_right"
                        color="white"
                        text-color="rgba(255,255,255,0.8)"
                        size="sm"
                        :disable="!state.hasNextPage"
                        @click="goToPage(state.currentPage + 1)"
                        title="Next page"
                      />
                      <q-btn
                        flat
                        round
                        icon="last_page"
                        color="white"
                        text-color="rgba(255,255,255,0.8)"
                        size="sm"
                        :disable="state.currentPage >= state.totalPages"
                        @click="goToPage(state.totalPages)"
                        title="Last page"
                      />
                    </div>

                    <!-- Rows per page selector -->
                    <q-select
                      v-model="filters.rowsPerPage"
                      :options="[10, 20, 50, 100]"
                      dense
                      borderless
                      color="white"
                      label-color="rgba(255,255,255,0.8)"
                      popup-content-class="pagination-select-popup"
                      class="rows-per-page-select"
                      @update:model-value="handleRowsPerPageChange"
                    >
                      <template v-slot:prepend>
                        <span class="text-caption text-white q-mr-xs">Rows:</span>
                      </template>
                    </q-select>

                    <!-- Refresh button -->
                    <q-btn
                      round
                      color="white"
                      text-color="primary"
                      icon="refresh"
                      :loading="state.loading"
                      @click="handleRefresh"
                      title="Refresh events"
                      size="sm"
                      class="refresh-btn-small"
                    />
                  </div>
                </div>
              </div>
            </q-card-section>

            <!-- Events Table -->
            <q-table
              :rows="filteredEvents"
              :columns="columns"
              row-key="id"
              :pagination="tablePagination"
              @request="onTableRequest"
              flat
              class="events-table modern-table"
              :rows-per-page-options="[10, 20, 50]"
              separator="horizontal"
            >
              <template v-slot:header="props">
                <q-tr :props="props" class="table-header">
                  <q-th
                    v-for="col in props.cols"
                    :key="col.name"
                    :props="props"
                    class="table-header-cell"
                  >
                    <div class="flex items-center">
                      <span class="text-weight-bold">{{ col.label }}</span>
                      <q-icon
                        v-if="col.sortable"
                        :name="
                          col.name === tablePagination.sortBy
                            ? tablePagination.descending
                              ? 'arrow_downward'
                              : 'arrow_upward'
                            : 'unfold_more'
                        "
                        size="xs"
                        class="q-ml-xs sort-icon"
                        :class="{ 'active-sort': col.name === tablePagination.sortBy }"
                      />
                    </div>
                  </q-th>
                </q-tr>
              </template>

              <template v-slot:body="props">
                <q-tr
                  :props="props"
                  class="table-row hover-highlight cursor-pointer"
                  @click="navigateToEvent(props.row)"
                >
                  <q-td key="title" :props="props" class="event-title-cell">
                    <div class="event-title-content">
                      <div class="event-title text-weight-medium">{{ props.row.title }}</div>
                      <div
                        v-if="props.row.subtitle"
                        class="event-subtitle text-caption text-grey-6"
                      >
                        {{ props.row.subtitle }}
                      </div>
                    </div>
                  </q-td>

                  <q-td key="edition" :props="props" class="edition-cell">
                    <div class="edition-content">
                      <span class="text-weight-medium">{{ props.row.edition }}</span>
                    </div>
                  </q-td>

                  <q-td key="start_date" :props="props" class="date-cell">
                    <div class="date-content">
                      <q-icon name="event" size="xs" class="q-mr-xs text-primary" />
                      <span class="text-weight-medium">{{ formatDate(props.row.start_date) }}</span>
                    </div>
                  </q-td>

                  <q-td key="registration_start_date" :props="props" class="date-cell">
                    <div class="date-content">
                      <q-icon name="how_to_reg" size="xs" class="q-mr-xs text-secondary" />
                      <span
                        :class="
                          props.row.registration_start_date ? 'text-weight-medium' : 'text-grey-6'
                        "
                      >
                        {{
                          props.row.registration_start_date
                            ? formatDate(props.row.registration_start_date)
                            : 'TBD'
                        }}
                      </span>
                    </div>
                  </q-td>

                  <q-td key="location" :props="props" class="location-cell">
                    <div class="location-content">
                      <q-icon name="place" size="xs" class="q-mr-xs text-accent" />
                      <div>
                        <div class="text-weight-medium">{{ capitalizeCity(props.row.city) }}</div>
                        <div class="text-caption text-grey-6">
                          {{ getCountryName(props.row.country) }}
                        </div>
                      </div>
                    </div>
                  </q-td>

                  <q-td key="category" :props="props" class="category-cell">
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
                </q-tr>
              </template>

              <template v-slot:no-data>
                <div class="full-width text-center q-pa-lg">
                  <ListEmptyState
                    icon="event"
                    title="No events found"
                    message="No events match your current filters. Try adjusting your search criteria."
                  />
                </div>
              </template>
            </q-table>
          </q-card>
        </div>
      </div>
    </q-page>
  </q-pull-to-refresh>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { eventListService, type EventListItem } from '../services';
import type { EventTableColumn } from '../interfaces/EventView';
import { useFormatters } from '../composables/useFormatters';
import { useEventFilters } from '../composables/useEventFilters';
import { useCountries } from '../composables/useCountries';
import OfflineMessage from '../components/OfflineMessage.vue';
import ListPageHeader from '../components/ListPageHeader.vue';
import ListFilters from '../components/ListFilters.vue';
import ListEmptyState from '../components/ListEmptyState.vue';

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

const { formatDate, formatLocation, getEventCategory, getEventCategoryColor } = useFormatters();

// Helper function to capitalize city names
const capitalizeCity = (city: string): string => {
  if (!city) return '';
  return city
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

const columns: EventTableColumn[] = [
  {
    name: 'title',
    label: 'Event',
    field: (row: EventListItem) => row.title || '',
    sortable: true,
    align: 'left',
    style: 'width: 20%; max-width: 200px;',
    classes: 'event-title-cell',
  },
  {
    name: 'edition',
    label: 'Edition',
    field: (row: EventListItem) => row.edition || '',
    sortable: true,
    align: 'center',
    style: 'width: 8%;',
  },
  {
    name: 'start_date',
    label: 'Event Date',
    field: (row) => row.start_date,
    sortable: true,
    align: 'left',
    format: (val) => formatDate(val),
    style: 'width: 15%;',
  },
  {
    name: 'registration_start_date',
    label: 'Registration',
    field: (row) => row.registration_start_date,
    sortable: true,
    align: 'left',
    format: (val) => (val ? formatDate(val) : 'TBD'),
    style: 'width: 12%;',
  },
  {
    name: 'location',
    label: 'Location',
    field: (row) => formatLocation(row.city, row.country),
    sortable: true,
    align: 'left',
    style: 'width: 20%;',
  },
  {
    name: 'category',
    label: 'Category',
    field: (row: EventListItem) => getEventCategory(row.taxonomies),
    sortable: true,
    align: 'center',
    style: 'width: 15%;',
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

const tablePagination = computed({
  get: () => ({
    sortBy: filters.value.sortBy,
    descending: filters.value.descending,
    page: state.value.currentPage,
    rowsPerPage: filters.value.rowsPerPage,
    rowsNumber: state.value.totalCount,
  }),
  set: (val) => {
    updateFilter('sortBy', val.sortBy);
    updateFilter('descending', val.descending);
    updateFilter('rowsPerPage', val.rowsPerPage);
  },
});

const formatEventsText = (count: number): string => {
  if (count === 1) {
    return '1 event';
  }
  return `${count.toLocaleString()} events`;
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

const onTableRequest = (props: {
  pagination: {
    sortBy: string;
    descending: boolean;
    page: number;
    rowsPerPage: number;
  };
}) => {
  updateFilter('sortBy', props.pagination.sortBy);
  updateFilter('descending', props.pagination.descending);
  updateFilter('rowsPerPage', props.pagination.rowsPerPage);
  void loadEvents(props.pagination.page);
};

const navigateToEvent = (event: EventListItem) => {
  void router.push(`/events/${event.id}`);
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
.events-page {
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

.location-cell {
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

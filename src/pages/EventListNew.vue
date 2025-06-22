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
            <!-- Desktop filters layout -->
            <div class="gt-sm">
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

              <div class="col-xs-12 col-sm-6 col-md-3">
                <q-input
                  :model-value="formatDateRange(filters.startDateRange)"
                  label="Event Date Range"
                  dense
                  outlined
                  clearable
                  @clear="updateFilter('startDateRange', { from: null, to: null })"
                >
                  <template v-slot:prepend>
                    <q-icon name="event" />
                  </template>
                  <template v-slot:append>
                    <q-icon name="event" class="cursor-pointer">
                      <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                        <q-date
                          :model-value="filters.startDateRange"
                          @update:model-value="(val) => updateFilter('startDateRange', val)"
                          range
                          mask="YYYY-MM-DD"
                          today-btn
                        />
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>
                <div class="q-mt-xs">
                  <q-btn
                    size="sm"
                    outline
                    color="primary"
                    label="Next 9 months"
                    @click="applyQuickStartDateFilter"
                    class="q-mr-xs"
                  />
                  <q-btn
                    size="sm"
                    flat
                    color="grey"
                    label="Clear"
                    @click="updateFilter('startDateRange', { from: null, to: null })"
                  />
                </div>
              </div>

              <div class="col-xs-12 col-sm-12 col-md-4">
                <q-input
                  :model-value="formatDateRange(filters.registrationDateRange)"
                  label="Registration Date Range"
                  dense
                  outlined
                  clearable
                  @clear="updateFilter('registrationDateRange', { from: null, to: null })"
                >
                  <template v-slot:prepend>
                    <q-icon name="how_to_reg" />
                  </template>
                  <template v-slot:append>
                    <q-icon name="event" class="cursor-pointer">
                      <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                        <q-date
                          :model-value="filters.registrationDateRange"
                          @update:model-value="(val) => updateFilter('registrationDateRange', val)"
                          range
                          mask="YYYY-MM-DD"
                          today-btn
                        />
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>
                <div class="q-mt-xs">
                  <q-btn
                    size="sm"
                    outline
                    color="primary"
                    label="Next 4 months"
                    @click="applyQuickRegistrationFilter"
                    class="q-mr-xs"
                  />
                  <q-btn
                    size="sm"
                    flat
                    color="grey"
                    label="Clear"
                    @click="updateFilter('registrationDateRange', { from: null, to: null })"
                  />
                </div>
              </div>
            </div>

            <!-- Mobile filters layout -->
            <div class="lt-md">
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

              <q-checkbox
                :model-value="filters.showPastEvents"
                @update:model-value="(val) => updateFilter('showPastEvents', val)"
                label="Include past events"
                color="primary"
              />

              <div>
                <q-input
                  :model-value="formatDateRange(filters.startDateRange)"
                  label="Event Date Range"
                  dense
                  outlined
                  clearable
                  @clear="updateFilter('startDateRange', { from: null, to: null })"
                >
                  <template v-slot:prepend>
                    <q-icon name="event" />
                  </template>
                  <template v-slot:append>
                    <q-icon name="event" class="cursor-pointer">
                      <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                        <q-date
                          :model-value="filters.startDateRange"
                          @update:model-value="(val) => updateFilter('startDateRange', val)"
                          range
                          mask="YYYY-MM-DD"
                          today-btn
                        />
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>
                <div class="q-mt-xs">
                  <q-btn
                    size="sm"
                    outline
                    color="primary"
                    label="Next 9 months"
                    @click="applyQuickStartDateFilter"
                    class="q-mr-xs"
                  />
                  <q-btn
                    size="sm"
                    flat
                    color="grey"
                    label="Clear"
                    @click="updateFilter('startDateRange', { from: null, to: null })"
                  />
                </div>
              </div>

              <div>
                <q-input
                  :model-value="formatDateRange(filters.registrationDateRange)"
                  label="Registration Date Range"
                  dense
                  outlined
                  clearable
                  @clear="updateFilter('registrationDateRange', { from: null, to: null })"
                >
                  <template v-slot:prepend>
                    <q-icon name="how_to_reg" />
                  </template>
                  <template v-slot:append>
                    <q-icon name="event" class="cursor-pointer">
                      <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                        <q-date
                          :model-value="filters.registrationDateRange"
                          @update:model-value="(val) => updateFilter('registrationDateRange', val)"
                          range
                          mask="YYYY-MM-DD"
                          today-btn
                        />
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>
                <div class="q-mt-xs">
                  <q-btn
                    size="sm"
                    outline
                    color="primary"
                    label="Next 4 months"
                    @click="applyQuickRegistrationFilter"
                    class="q-mr-xs"
                  />
                  <q-btn
                    size="sm"
                    flat
                    color="grey"
                    label="Clear"
                    @click="updateFilter('registrationDateRange', { from: null, to: null })"
                  />
                </div>
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
          <!-- Results Header -->
          <q-card-section class="results-header q-pa-lg border-bottom">
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
            bordered
            class="events-table"
          >
            <!-- Custom cell templates from original EventList.vue would go here -->
            <template v-slot:body-cell-title="props">
              <q-td :props="props" class="event-title-cell">
                <div class="event-title">{{ props.row.title }}</div>
              </q-td>
            </template>

            <template v-slot:body-cell-category="props">
              <q-td :props="props">
                <q-chip
                  v-if="getEventCategory(props.row.taxonomies)"
                  :label="getEventCategory(props.row.taxonomies)"
                  :color="getEventCategoryColor(props.row.taxonomies).color"
                  :text-color="getEventCategoryColor(props.row.taxonomies).textColor"
                  size="sm"
                  dense
                />
              </q-td>
            </template>

            <template v-slot:body="props">
              <q-tr
                :props="props"
                class="hover-highlight cursor-pointer"
                @click="navigateToEvent(props.row)"
              >
                <q-td key="title" :props="props" class="event-title-cell">
                  <div class="event-title">{{ props.row.title }}</div>
                </q-td>
                <q-td key="start_date" :props="props">
                  {{ formatDate(props.row.start_date) }}
                </q-td>
                <q-td key="registration_start_date" :props="props">
                  {{
                    props.row.registration_start_date
                      ? formatDate(props.row.registration_start_date)
                      : 'TBD'
                  }}
                </q-td>
                <q-td key="location" :props="props">
                  {{ formatLocation(props.row.city, props.row.country) }}
                </q-td>
                <q-td key="category" :props="props">
                  <q-chip
                    v-if="getEventCategory(props.row.taxonomies)"
                    :label="getEventCategory(props.row.taxonomies)"
                    :color="getEventCategoryColor(props.row.taxonomies).color"
                    :text-color="getEventCategoryColor(props.row.taxonomies).textColor"
                    size="sm"
                    dense
                  />
                </q-td>
              </q-tr>
            </template>

            <template v-slot:no-data>
              <ListEmptyState
                icon="event"
                title="No events found"
                message="No events match your current filters. Try adjusting your search criteria."
              />
            </template>
          </q-table>
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
import type { EventTableColumn } from '../interfaces/EventView';
import { useFormatters } from '../composables/useFormatters';
import { useEventFilters } from '../composables/useEventFilters';
import OfflineMessage from '../components/OfflineMessage.vue';
import ListPageHeader from '../components/ListPageHeader.vue';
import ListFilters from '../components/ListFilters.vue';
import ListEmptyState from '../components/ListEmptyState.vue';

const router = useRouter();
const $q = useQuasar();

// Use filter composable with cookie persistence
const {
  filters,
  updateFilter,
  clearAllFilters: clearFilters,
  hasActiveFilters: hasFilters,
  activeFilterCount: filterCount,
  applyQuickStartDateFilter,
  applyQuickRegistrationFilter,
  formatDateRange,
  initializeFilters,
} = useEventFilters();

// State for events and pagination
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

// Country management
const allCountries = ref<Set<string>>(new Set());

const updateCountrySet = (events: EventListItem[]) => {
  events.forEach((e) => {
    if (e.country) allCountries.value.add(e.country);
  });
};

// Country mapping (same as original)
const countryMap: Record<string, string> = {
  US: 'United States',
  DE: 'Germany',
  FR: 'France',
  UK: 'United Kingdom',
  ES: 'Spain',
  IT: 'Italy',
  AR: 'Argentina',
  BR: 'Brazil',
  CH: 'Switzerland',
  AT: 'Austria',
  NL: 'Netherlands',
  BE: 'Belgium',
  DK: 'Denmark',
  SE: 'Sweden',
  NO: 'Norway',
  FI: 'Finland',
  PL: 'Poland',
  CZ: 'Czech Republic',
  HU: 'Hungary',
  GR: 'Greece',
  PT: 'Portugal',
};

let regionNames: Intl.DisplayNames | undefined;
try {
  regionNames = new Intl.DisplayNames(['en'], { type: 'region' });
} catch {
  regionNames = undefined;
}

const getCountryName = (code: string): string => {
  return countryMap[code] ?? regionNames?.of(code) ?? code;
};

const countryOptions = computed(() =>
  Array.from(allCountries.value).sort((a, b) => getCountryName(a).localeCompare(getCountryName(b))),
);

// Use shared formatters
const { formatDate, formatLocation, getEventCategory, getEventCategoryColor } = useFormatters();

// Table columns configuration (same as original)
const columns: EventTableColumn[] = [
  {
    name: 'title',
    label: 'Event',
    field: (row: EventListItem) => row.title ?? '',
    sortable: true,
    align: 'left',
    style: 'width: 25%; max-width: 250px;',
    classes: 'event-title-cell',
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

// Client-side filtering for past events
const filteredEvents = computed(() => {
  const events = state.value.events || [];

  if (filters.value.showPastEvents) {
    return events;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return events.filter((event: EventListItem) => {
    const eventDate = new Date(event.start_date);
    if (eventDate && !isNaN(eventDate.getTime())) {
      eventDate.setHours(0, 0, 0, 0);
      return eventDate >= today;
    }
    return false;
  });
});

// Table pagination state
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

// Format events text
const formatEventsText = (count: number): string => {
  if (count === 1) {
    return '1 event';
  }
  return `${count.toLocaleString()} events`;
};

// Load events (same logic as original)
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
    };

    // Add filters
    if (filters.value.selectedCountry) {
      params.country = filters.value.selectedCountry;
    }
    if (filters.value.startDateRange.from) {
      params.start_date_from = filters.value.startDateRange.from;
    }
    if (filters.value.startDateRange.to) {
      params.start_date_to = filters.value.startDateRange.to;
    }
    if (filters.value.registrationDateRange.from) {
      params.registration_start_date_from = filters.value.registrationDateRange.from;
    }
    if (filters.value.registrationDateRange.to) {
      params.registration_start_date_to = filters.value.registrationDateRange.to;
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
    $q?.notify?.({
      type: 'negative',
      message: state.value.error,
      position: 'top',
    });
  } finally {
    state.value.loading = false;
  }
};

// Table request handler
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

// Navigation
const navigateToEvent = (event: EventListItem) => {
  void router.push(`/events/${event.id}`);
};

// Refresh handlers
const handleRefresh = () => {
  void loadEvents(1, true);
};

const handlePullToRefresh = (done: () => void) => {
  void loadEvents(1, true).finally(() => {
    done();
  });
};

// Watch for filter changes and reload
watch(
  [
    () => filters.value.selectedCountry,
    () => filters.value.startDateRange,
    () => filters.value.registrationDateRange,
    () => filters.value.searchQuery,
    () => filters.value.showPastEvents,
  ],
  () => {
    void loadEvents(1);
  },
  { deep: true },
);

// Initialize on mount
onMounted(() => {
  initializeFilters();
  void loadEvents();
});
</script>

<style lang="scss" scoped>
.border-bottom {
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
}

.content-card {
  border-radius: 8px;
}

.hover-highlight:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.event-title {
  max-width: 250px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.event-title-cell {
  max-width: 250px !important;
}

.events-table {
  min-width: 800px;
}

// Mobile responsive
@media (max-width: 1023px) {
  .events-table {
    .q-table__container {
      overflow-x: auto;
    }
  }
}
</style>

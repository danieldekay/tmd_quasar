<template>
  <q-pull-to-refresh @refresh="handlePullToRefresh">
    <q-page padding>
      <div class="row q-col-gutter-lg">
        <div class="col-12">
          <div class="row items-center justify-between q-mb-lg">
            <h1 class="text-h4 q-my-none">
              Events
              <span v-if="!filters.showPastEvents" class="text-subtitle2 text-grey-6">
                (Future Events Only)
              </span>
            </h1>
            <q-btn
              round
              color="primary"
              icon="refresh"
              :loading="state.loading"
              @click="handleRefresh"
              title="Refresh events"
              size="md"
            />
          </div>
        </div>

        <!-- Filter Controls Section -->
        <div class="col-12">
          <q-card flat bordered class="q-pa-md q-mb-lg">
            <!-- Mobile: Collapsible filters -->
            <div class="lt-md">
              <div class="row items-center q-mb-md">
                <div class="col">
                  <div class="text-h6">Filters</div>
                </div>
                <div class="col-auto">
                  <q-btn
                    :icon="filtersExpanded ? 'expand_less' : 'expand_more'"
                    flat
                    round
                    @click="filtersExpanded = !filtersExpanded"
                    :label="hasFilters() ? `${filterCount()} active` : ''"
                    :color="hasFilters() ? 'primary' : 'grey'"
                  />
                </div>
              </div>

              <q-slide-transition>
                <div v-show="filtersExpanded">
                  <!-- Search Row -->
                  <div class="q-mb-md">
                    <q-input
                      :model-value="filters.searchQuery"
                      @update:model-value="(val) => updateFilter('searchQuery', String(val || ''))"
                      label="Search events, cities, or countries"
                      dense
                      outlined
                      clearable
                      debounce="300"
                    >
                      <template v-slot:prepend>
                        <q-icon name="search" />
                      </template>
                    </q-input>
                  </div>

                  <!-- Filter Controls - Stacked on mobile -->
                  <div class="column q-gutter-md">
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

                    <!-- Show Past Events Toggle -->
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
                                @update:model-value="
                                  (val) => updateFilter('registrationDateRange', val)
                                "
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

                  <!-- Clear All Filters -->
                  <div class="q-mt-md" v-if="hasFilters()">
                    <q-btn
                      outline
                      color="negative"
                      label="Clear All Filters"
                      @click="clearFilters"
                      size="sm"
                    />
                  </div>
                </div>
              </q-slide-transition>
            </div>

            <!-- Desktop: Expanded filters -->
            <div class="gt-sm">
              <div class="text-h6 q-mb-md">Filters</div>

              <!-- Search Row -->
              <div class="row q-col-gutter-md q-mb-md">
                <div class="col-12">
                  <q-input
                    :model-value="filters.searchQuery"
                    @update:model-value="(val) => updateFilter('searchQuery', String(val || ''))"
                    label="Search events, cities, or countries"
                    dense
                    outlined
                    clearable
                    debounce="300"
                  >
                    <template v-slot:prepend>
                      <q-icon name="search" />
                    </template>
                  </q-input>
                </div>
              </div>

              <!-- Filter Controls Row -->
              <div class="row q-col-gutter-md">
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
                            @update:model-value="
                              (val) => updateFilter('registrationDateRange', val)
                            "
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

              <!-- Clear All Filters -->
              <div class="row q-mt-md" v-if="hasFilters()">
                <div class="col-12">
                  <q-btn
                    outline
                    color="negative"
                    label="Clear All Filters"
                    @click="clearFilters"
                    size="sm"
                  />
                </div>
              </div>
            </div>
          </q-card>
        </div>

        <!-- Loading State -->
        <div v-if="state.loading" class="col-12 text-center">
          <q-spinner color="primary" size="3em" />
          <p class="q-mt-md">Loading events...</p>
        </div>

        <!-- Error State -->
        <div v-else-if="state.error" class="col-12 text-center">
          <q-banner class="bg-negative text-white">
            {{ state.error }}
          </q-banner>
        </div>

        <!-- Events List -->
        <template v-else>
          <div class="col-12">
            <!-- Results Summary -->
            <div class="q-mb-md">
              <div class="text-subtitle2 text-grey-7">
                {{ state.totalCount }} event{{ state.totalCount !== 1 ? 's' : '' }} found
                <span v-if="state.totalPages > 1">
                  (Page {{ state.currentPage }} of {{ state.totalPages }})
                </span>
              </div>
            </div>

            <!-- Mobile: Card View -->
            <div class="lt-md">
              <div class="q-gutter-md">
                <q-card
                  v-for="event in filteredEvents"
                  :key="event.id"
                  flat
                  bordered
                  class="cursor-pointer hover-highlight"
                  @click="navigateToEvent(event)"
                >
                  <q-card-section>
                    <div class="text-h6 event-title">{{ event.title }}</div>
                    <div
                      class="text-caption text-grey-6 q-mb-sm"
                      v-if="getEventCategory(event.taxonomies)"
                    >
                      {{ getEventCategory(event.taxonomies) }}
                    </div>

                    <div class="row q-col-gutter-sm q-mb-sm">
                      <div class="col-6">
                        <div class="text-caption text-grey-7">Event Date</div>
                        <div class="text-body2">{{ formatDate(event.start_date) }}</div>
                        <div
                          class="text-caption text-grey-6"
                          v-if="event.end_date && event.end_date !== event.start_date"
                        >
                          to {{ formatDate(event.end_date) }}
                        </div>
                      </div>
                      <div class="col-6">
                        <div class="text-caption text-grey-7">Registration</div>
                        <div class="text-body2" v-if="event.registration_start_date">
                          {{ formatDate(event.registration_start_date) }}
                        </div>
                        <div class="text-body2 text-grey-5" v-else>Not available</div>
                      </div>
                    </div>

                    <div class="row q-col-gutter-sm items-center">
                      <div class="col">
                        <div class="text-caption text-grey-7">Location</div>
                        <div class="text-body2">
                          {{ formatLocation(event.city, event.country) }}
                        </div>
                        <div class="text-caption text-grey-6" v-if="event.venue_name">
                          {{ event.venue_name }}
                        </div>
                      </div>
                      <div class="col-auto" v-if="getEventCategory(event.taxonomies)">
                        <q-chip
                          :color="getEventCategoryColor(event.taxonomies).color"
                          :text-color="getEventCategoryColor(event.taxonomies).textColor"
                          :icon="getEventCategoryColor(event.taxonomies).icon"
                          size="sm"
                          :label="getEventCategory(event.taxonomies)"
                        />
                      </div>
                    </div>
                  </q-card-section>
                </q-card>
              </div>

              <!-- Mobile Pagination -->
              <div class="q-mt-lg" v-if="state.totalPages > 1">
                <q-pagination
                  v-model="state.currentPage"
                  :max="state.totalPages"
                  :max-pages="5"
                  direction-links
                  boundary-links
                  @update:model-value="loadEvents"
                  color="primary"
                  size="md"
                />
              </div>
            </div>

            <!-- Desktop: Table View -->
            <div class="gt-sm">
              <div class="table-container">
                <q-table
                  :rows="filteredEvents"
                  :columns="columns"
                  row-key="id"
                  :loading="state.loading"
                  v-model:pagination="tablePagination"
                  @request="onTableRequest"
                  :rows-per-page-options="[10, 20, 50, 100]"
                  dense
                  class="events-table"
                  server-pagination
                >
                  <template v-slot:body="props">
                    <q-tr
                      :props="props"
                      @click="navigateToEvent(props.row)"
                      class="cursor-pointer hover-highlight"
                    >
                      <q-td key="title" :props="props" class="event-title-cell">
                        <div class="text-weight-medium event-title">{{ props.row.title }}</div>
                        <div class="text-caption text-grey-6" v-if="props.row.event_category">
                          {{ props.row.event_category }}
                        </div>
                      </q-td>
                      <q-td key="start_date" :props="props">
                        <div>{{ formatDate(props.row.start_date) }}</div>
                        <div
                          class="text-caption text-grey-6"
                          v-if="props.row.end_date && props.row.end_date !== props.row.start_date"
                        >
                          to {{ formatDate(props.row.end_date) }}
                        </div>
                      </q-td>
                      <q-td key="registration_start_date" :props="props">
                        <div v-if="props.row.registration_start_date">
                          {{ formatDate(props.row.registration_start_date) }}
                        </div>
                        <div v-else class="text-grey-5">Not available</div>
                      </q-td>
                      <q-td key="location" :props="props">
                        <div class="text-weight-medium">
                          {{ formatLocation(props.row.city, props.row.country) }}
                        </div>
                        <div class="text-caption text-grey-6" v-if="props.row.venue_name">
                          {{ props.row.venue_name }}
                        </div>
                      </q-td>
                      <q-td key="category" :props="props">
                        <q-chip
                          v-if="getEventCategory(props.row.taxonomies)"
                          :color="getEventCategoryColor(props.row.taxonomies).color"
                          :text-color="getEventCategoryColor(props.row.taxonomies).textColor"
                          :icon="getEventCategoryColor(props.row.taxonomies).icon"
                          size="sm"
                          :label="getEventCategory(props.row.taxonomies)"
                        />
                        <span v-else class="text-grey-5">—</span>
                      </q-td>
                    </q-tr>
                  </template>
                </q-table>
              </div>
            </div>
          </div>
        </template>
      </div>
    </q-page>
  </q-pull-to-refresh>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { eventListService as eventService } from '../services';
import type { EventListItem } from '../services/types';
import type { EventTableColumn } from '../interfaces/EventView';
import { useFormatters } from '../composables/useFormatters';
import { useEventFilters } from '../composables/useEventFilters';

const router = useRouter();
const $q = useQuasar();

// Mobile filter state
const filtersExpanded = ref(false);

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

// Add country mapping
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

// Fallback using Intl.DisplayNames for codes not in the static map
let regionNames: Intl.DisplayNames | undefined;
try {
  regionNames = new Intl.DisplayNames(['en'], { type: 'region' });
} catch {
  regionNames = undefined;
}

const getCountryName = (code: string): string => {
  return countryMap[code] ?? regionNames?.of(code) ?? code;
};

// Options displayed in the dropdown
const countryOptions = computed(() =>
  Array.from(allCountries.value).sort((a, b) => getCountryName(a).localeCompare(getCountryName(b))),
);

// Use shared formatters
const { formatDate, formatLocation, getEventCategory, getEventCategoryColor } = useFormatters();

// Table columns configuration
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

// Client-side filtering for past events (since server might return all)
const filteredEvents = computed(() => {
  const events = state.value.events || [];

  if (filters.value.showPastEvents) {
    return events;
  }

  // Filter out past events
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

// Table pagination state (synced with filters)
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

// Load events with server-side pagination and filtering
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

    // Add cache busting for force reload
    if (forceReload) {
      params._t = Date.now();
    }

    const response = await eventService.getEvents(params);

    state.value.events = response.events;
    state.value.totalCount = response.totalCount;
    state.value.totalPages = response.totalPages;
    state.value.currentPage = response.currentPage;
    state.value.hasNextPage = response.hasNextPage;
    state.value.hasPrevPage = response.hasPrevPage;

    updateCountrySet(response.events);

    if (forceReload) {
      $q.notify({
        type: 'positive',
        message: 'Events refreshed successfully',
        position: 'top',
        timeout: 2000,
      });
    }
  } catch (err) {
    console.error('Error loading events:', err);
    state.value.error = 'Failed to load events';
    $q.notify({
      type: 'negative',
      message: state.value.error,
      position: 'top',
    });
  } finally {
    state.value.loading = false;
  }
};

// Table request handler for sorting and pagination
const onTableRequest = (props: {
  pagination: {
    sortBy: string;
    descending: boolean;
    page: number;
    rowsPerPage: number;
  };
}) => {
  // Update filters
  updateFilter('sortBy', props.pagination.sortBy);
  updateFilter('descending', props.pagination.descending);
  updateFilter('rowsPerPage', props.pagination.rowsPerPage);

  // Load new page
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
.hover-highlight:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.table-container {
  overflow-x: auto;
}

.events-table {
  min-width: 800px;
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

// Mobile card styles
@media (max-width: 1023px) {
  .q-card {
    transition: all 0.2s ease;

    &:hover {
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
  }
}
</style>

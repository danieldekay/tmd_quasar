<template>
  <q-page padding>
    <div class="row q-col-gutter-lg">
      <div class="col-12">
        <h1 class="text-h4 q-mb-lg">
          Events
          <span v-if="!showPastEvents" class="text-subtitle2 text-grey-6">
            (Future Events Only)
          </span>
        </h1>
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
                  :label="hasActiveFilters ? `${activeFilterCount} active` : ''"
                  :color="hasActiveFilters ? 'primary' : 'grey'"
                />
              </div>
            </div>

            <q-slide-transition>
              <div v-show="filtersExpanded">
                <!-- Search Row -->
                <div class="q-mb-md">
                  <q-input
                    v-model="state.searchQuery"
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
                    v-model="state.selectedCountry"
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
                    v-model="showPastEvents"
                    label="Include past events"
                    color="primary"
                  />

                  <div>
                    <q-input
                      :model-value="formatDateRange(startDateRange)"
                      label="Event Date Range"
                      dense
                      outlined
                      clearable
                      @clear="startDateRange = { from: null, to: null }"
                    >
                      <template v-slot:prepend>
                        <q-icon name="event" />
                      </template>
                      <template v-slot:append>
                        <q-icon name="event" class="cursor-pointer">
                          <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                            <q-date v-model="startDateRange" range mask="YYYY-MM-DD" today-btn />
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
                        @click="startDateRange = { from: null, to: null }"
                      />
                    </div>
                  </div>

                  <div>
                    <q-input
                      :model-value="formatDateRange(registrationDateRange)"
                      label="Registration Date Range"
                      dense
                      outlined
                      clearable
                      @clear="registrationDateRange = { from: null, to: null }"
                    >
                      <template v-slot:prepend>
                        <q-icon name="how_to_reg" />
                      </template>
                      <template v-slot:append>
                        <q-icon name="event" class="cursor-pointer">
                          <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                            <q-date
                              v-model="registrationDateRange"
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
                        @click="registrationDateRange = { from: null, to: null }"
                      />
                    </div>
                  </div>
                </div>

                <!-- Clear All Filters -->
                <div class="q-mt-md" v-if="hasActiveFilters">
                  <q-btn
                    outline
                    color="negative"
                    label="Clear All Filters"
                    @click="clearAllFilters"
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
                  v-model="state.searchQuery"
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
                  v-model="state.selectedCountry"
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
                    v-model="showPastEvents"
                    label="Include past events"
                    color="primary"
                  />
                </div>
              </div>

              <div class="col-xs-12 col-sm-6 col-md-3">
                <q-input
                  :model-value="formatDateRange(startDateRange)"
                  label="Event Date Range"
                  dense
                  outlined
                  clearable
                  @clear="startDateRange = { from: null, to: null }"
                >
                  <template v-slot:prepend>
                    <q-icon name="event" />
                  </template>
                  <template v-slot:append>
                    <q-icon name="event" class="cursor-pointer">
                      <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                        <q-date v-model="startDateRange" range mask="YYYY-MM-DD" today-btn />
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
                    @click="startDateRange = { from: null, to: null }"
                  />
                </div>
              </div>

              <div class="col-xs-12 col-sm-12 col-md-4">
                <q-input
                  :model-value="formatDateRange(registrationDateRange)"
                  label="Registration Date Range"
                  dense
                  outlined
                  clearable
                  @clear="registrationDateRange = { from: null, to: null }"
                >
                  <template v-slot:prepend>
                    <q-icon name="how_to_reg" />
                  </template>
                  <template v-slot:append>
                    <q-icon name="event" class="cursor-pointer">
                      <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                        <q-date v-model="registrationDateRange" range mask="YYYY-MM-DD" today-btn />
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
                    @click="registrationDateRange = { from: null, to: null }"
                  />
                </div>
              </div>
            </div>

            <!-- Clear All Filters -->
            <div class="row q-mt-md" v-if="hasActiveFilters">
              <div class="col-12">
                <q-btn
                  outline
                  color="negative"
                  label="Clear All Filters"
                  @click="clearAllFilters"
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
              {{ sortedAndFilteredEvents.length }} event{{
                sortedAndFilteredEvents.length !== 1 ? 's' : ''
              }}
              found
            </div>
          </div>

          <!-- Mobile: Card View -->
          <div class="lt-md">
            <div class="q-gutter-md">
              <q-card
                v-for="event in sortedAndFilteredEvents"
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
                      <div class="text-body2">{{ formatLocation(event.city, event.country) }}</div>
                      <div class="text-caption text-grey-6" v-if="event.venue_name">
                        {{ event.venue_name }}
                      </div>
                    </div>
                    <div class="col-auto" v-if="getEventCategory(event.taxonomies)">
                      <q-chip
                        color="primary"
                        text-color="white"
                        size="sm"
                        :label="getEventCategory(event.taxonomies)"
                      />
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </div>

          <!-- Desktop: Table View -->
          <div class="gt-sm">
            <div class="table-container">
              <q-table
                :rows="sortedAndFilteredEvents"
                :columns="columns"
                row-key="id"
                :loading="state.loading"
                v-model:pagination="tablePagination"
                @request="onRequest"
                @scroll="onScroll"
                virtual-scroll
                :virtual-scroll-item-size="48"
                :rows-per-page-options="[10, 20, 50, 100]"
                dense
                class="events-table"
                :sort-method="customSort"
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
                        color="primary"
                        text-color="white"
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
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { eventListService as eventService } from '../services';
import type { EventListItem } from '../services/types';
import type { EventViewState, EventTableColumn } from '../interfaces/EventView';
import { useFormatters } from '../composables/useFormatters';

const router = useRouter();
const $q = useQuasar();

// Mobile filter state
const filtersExpanded = ref(false);

// Show past events toggle (default to false - only show future events)
const showPastEvents = ref(false);

const state = ref<EventViewState>({
  events: [],
  loading: false,
  error: null,
  searchQuery: '',
  selectedCountry: null,
  selectedDateRange: {
    from: null,
    to: null,
  },
  pagination: {
    page: 1,
    rowsPerPage: 20,
    rowsNumber: 0,
  },
});

// Separate pagination state for table with sorting
const tablePagination = ref({
  sortBy: 'start_date',
  descending: false,
  page: 1,
  rowsPerPage: 20,
  rowsNumber: 0,
});

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
  // Add more mappings as needed
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

// Use shared formatters
const { formatDate, formatLocation, getEventCategory } = useFormatters();

// Helper functions for better data display

// Keep a master list of all countries we have encountered
const allCountries = ref<Set<string>>(new Set());

const updateCountrySet = (events: EventListItem[]) => {
  events.forEach((e) => {
    if (e.country) allCountries.value.add(e.country);
  });
};

// Options displayed in the dropdown
const countryOptions = computed(() =>
  Array.from(allCountries.value).sort((a, b) => getCountryName(a).localeCompare(getCountryName(b))),
);

// Improved columns with better data handling
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

// Add date filter state
const startDateRange = ref<{ from: string | null; to: string | null }>({
  from: null,
  to: null,
});
const registrationDateRange = ref<{ from: string | null; to: string | null }>({
  from: null,
  to: null,
});

// Helper to check if any filters are active
const hasActiveFilters = computed(() => {
  return !!(
    state.value.searchQuery ||
    state.value.selectedCountry ||
    startDateRange.value.from ||
    startDateRange.value.to ||
    registrationDateRange.value.from ||
    registrationDateRange.value.to ||
    showPastEvents.value // Include the past events toggle in active filters
  );
});

// Count active filters for mobile display
const activeFilterCount = computed(() => {
  let count = 0;
  if (state.value.searchQuery) count++;
  if (state.value.selectedCountry) count++;
  if (startDateRange.value.from || startDateRange.value.to) count++;
  if (registrationDateRange.value.from || registrationDateRange.value.to) count++;
  if (showPastEvents.value) count++; // Count past events toggle
  return count;
});

// Clear all filters function
const clearAllFilters = () => {
  state.value.searchQuery = '';
  state.value.selectedCountry = null;
  startDateRange.value = { from: null, to: null };
  registrationDateRange.value = { from: null, to: null };
  showPastEvents.value = false; // Reset to default (hide past events)
  filtersExpanded.value = false;
};

// Quick filter helpers
const toIso = (d: Date): string => d.toISOString().split('T')[0] ?? '';

const applyQuickRegistrationFilter = () => {
  const today = new Date();
  const future = new Date();
  future.setMonth(future.getMonth() + 4);
  registrationDateRange.value = {
    from: toIso(today),
    to: toIso(future),
  };
};

const applyQuickStartDateFilter = () => {
  const today = new Date();
  const future = new Date();
  future.setMonth(future.getMonth() + 9);
  startDateRange.value = {
    from: toIso(today),
    to: toIso(future),
  };
};

// Format date range for display
const formatDateRange = (range: { from: string | null; to: string | null }): string => {
  if (!range.from && !range.to) return '';
  if (range.from && range.to) return `${range.from} - ${range.to}`;
  return range.from || range.to || '';
};

// Simple debounce helper
function debounce<T extends (...args: unknown[]) => void>(fn: T, delay = 400) {
  let timeout: ReturnType<typeof setTimeout> | undefined;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
}

// Unified & debounced watcher for country and date filters
const refetchEvents = debounce(async () => {
  state.value.loading = true;
  try {
    const filters = {
      ...(state.value.selectedCountry ? { country: state.value.selectedCountry } : {}),
      ...(startDateRange.value.from
        ? { start_date_from: `${startDateRange.value.from}T00:00:00+00:00` }
        : {}),
      ...(startDateRange.value.to
        ? { start_date_to: `${startDateRange.value.to}T23:59:59+00:00` }
        : {}),
      ...(registrationDateRange.value.from
        ? { registration_start_date_from: `${registrationDateRange.value.from}T00:00:00+00:00` }
        : {}),
      ...(registrationDateRange.value.to
        ? { registration_start_date_to: `${registrationDateRange.value.to}T23:59:59+00:00` }
        : {}),
    } as const;

    const events = await eventService.getEvents(filters);

    state.value.events = events;
    updateCountrySet(events);
    state.value.pagination.rowsNumber = events.length;
  } catch (error) {
    console.error('Error loading filtered events:', error);
    $q.notify({
      type: 'negative',
      message: 'Failed to load filtered events',
      position: 'top',
    });
  } finally {
    state.value.loading = false;
  }
}, 400);

watch(
  [() => state.value.selectedCountry, startDateRange, registrationDateRange],
  () => refetchEvents(),
  { deep: true },
);

// Update filteredEvents to handle search filtering and past events
const filteredEvents = computed(() => {
  const events = state.value.events || [];
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Set to start of day for accurate comparison

  const filtered = events.filter((event: EventListItem) => {
    // Filter by search query
    const matchesSearch =
      !state.value.searchQuery ||
      event.title.toLowerCase().includes(state.value.searchQuery.toLowerCase()) ||
      event.event_name?.toLowerCase().includes(state.value.searchQuery.toLowerCase()) ||
      event.city?.toLowerCase().includes(state.value.searchQuery.toLowerCase()) ||
      event.country?.toLowerCase().includes(state.value.searchQuery.toLowerCase()) ||
      getCountryName(event.country || '')
        .toLowerCase()
        .includes(state.value.searchQuery.toLowerCase());

    // Filter by date (show only future events unless showPastEvents is true)
    let matchesDateFilter = true;
    if (!showPastEvents.value) {
      // Only show future events (default behavior)
      const eventDate = new Date(event.start_date);
      if (eventDate && !isNaN(eventDate.getTime())) {
        eventDate.setHours(0, 0, 0, 0);
        matchesDateFilter = eventDate >= today;
      } else {
        console.warn('Invalid event date:', event.start_date, 'for event:', event.title);
        matchesDateFilter = false; // Exclude events with invalid dates
      }
    }

    return matchesSearch && matchesDateFilter;
  });

  return filtered;
});

// Custom sort function for the table
const customSort = (
  rows: readonly EventListItem[],
  sortBy: string,
  descending: boolean,
): readonly EventListItem[] => {
  const data = [...rows] as EventListItem[];

  if (sortBy) {
    data.sort((a, b) => {
      let aVal: string | number | Date;
      let bVal: string | number | Date;

      switch (sortBy) {
        case 'title':
          aVal = a.title?.toLowerCase() || '';
          bVal = b.title?.toLowerCase() || '';
          break;
        case 'start_date':
        case 'registration_start_date':
          aVal = new Date((a[sortBy as keyof EventListItem] as string) || '1900-01-01');
          bVal = new Date((b[sortBy as keyof EventListItem] as string) || '1900-01-01');
          break;
        case 'location':
          aVal = formatLocation(a.city, a.country).toLowerCase();
          bVal = formatLocation(b.city, b.country).toLowerCase();
          break;
        case 'category':
          aVal = getEventCategory(a.taxonomies).toLowerCase();
          bVal = getEventCategory(b.taxonomies).toLowerCase();
          break;
        default:
          aVal = (a[sortBy as keyof EventListItem] as string) || '';
          bVal = (b[sortBy as keyof EventListItem] as string) || '';
      }

      if (aVal < bVal) return descending ? 1 : -1;
      if (aVal > bVal) return descending ? -1 : 1;
      return 0;
    });
  }

  return data as readonly EventListItem[];
};

// Sorted and filtered events for table
const sortedAndFilteredEvents = computed(() => {
  const filtered = filteredEvents.value;
  return customSort(filtered, tablePagination.value.sortBy, tablePagination.value.descending);
});

// Watch for changes to update rowsNumber
watch(
  sortedAndFilteredEvents,
  (newEvents) => {
    tablePagination.value.rowsNumber = newEvents.length;
  },
  { immediate: true },
);

const navigateToEvent = (event: EventListItem) => {
  void router.push(`/events/${event.id}`);
};

const loadEvents = async () => {
  state.value.loading = true;
  state.value.error = null;
  try {
    const events = await eventService.getEvents({
      page: state.value.pagination.page,
      perPage: state.value.pagination.rowsPerPage,
    });
    state.value.events = events;
    updateCountrySet(events);
    state.value.pagination.rowsNumber = events.length;
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

const loadMoreEvents = async () => {
  if (state.value.loading) return;

  state.value.loading = true;
  try {
    const nextPage = state.value.pagination.page + 1;
    const newEvents = await eventService.loadMoreEvents(nextPage, {
      _embed: true,
      per_page: 100,
      orderby: 'start_date',
      order: 'desc',
    });

    if (newEvents && newEvents.length > 0) {
      state.value.events = [...state.value.events, ...newEvents];
      updateCountrySet(newEvents);
      state.value.pagination.page = nextPage;
      state.value.pagination.rowsNumber += newEvents.length;
    }
  } catch (error) {
    console.error('Error loading more events:', error);
    $q.notify({
      type: 'negative',
      message: 'Failed to load more events',
      position: 'top',
    });
  } finally {
    state.value.loading = false;
  }
};

const onRequest = (props: {
  pagination: {
    sortBy: string;
    descending: boolean;
    page: number;
    rowsPerPage: number;
    rowsNumber?: number;
  };
  filter?: unknown;
  getCellValue: (col: unknown, row: unknown) => unknown;
}) => {
  // Update table pagination with sorting information
  tablePagination.value = {
    sortBy: props.pagination.sortBy,
    descending: props.pagination.descending,
    page: props.pagination.page,
    rowsPerPage: props.pagination.rowsPerPage,
    rowsNumber: props.pagination.rowsNumber || tablePagination.value.rowsNumber,
  };

  // Also update the main state pagination for consistency
  state.value.pagination = {
    page: props.pagination.page,
    rowsPerPage: props.pagination.rowsPerPage,
    rowsNumber: props.pagination.rowsNumber || state.value.pagination.rowsNumber,
  };
};

// Add infinite scroll handler
const onScroll = (event: UIEvent) => {
  const target = event.target as HTMLElement;
  const scrollPosition = target.scrollTop + target.clientHeight;
  const scrollHeight = target.scrollHeight;

  // Load more when user scrolls to bottom
  if (scrollHeight - scrollPosition < 100) {
    void loadMoreEvents();
  }
};

onMounted(loadEvents);
</script>

<style lang="scss" scoped>
.q-date {
  width: 100%;
  max-width: 300px;
}

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

<template>
  <q-page class="gradient-background-page">
    <!-- Header -->
    <div class="page-header-styling q-pa-lg">
      <div class="row items-center justify-between">
        <div class="col">
          <h1 class="text-h4 text-weight-bold q-mb-xs">Events Directory</h1>
          <p class="text-subtitle1 text-grey-6 q-ma-none">
            {{ listState.totalCount.toLocaleString() }} / {{ overallTotalCount.toLocaleString() }}
            events found based on filters
          </p>
        </div>
        <div class="col-auto">
          <q-btn round color="primary" icon="refresh" @click="refresh" :loading="listState.loading">
            <q-tooltip>Refresh Events</q-tooltip>
          </q-btn>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="q-px-lg q-pb-md">
      <q-card flat bordered class="filters-card-wrapper q-pa-md">
        <q-card-section class="q-pa-none">
          <div class="row q-gutter-md items-center">
            <!-- Search -->
            <div class="col-12 col-md-3">
              <q-input
                :model-value="listFilters.searchQuery"
                @update:model-value="handleSearchInput"
                placeholder="Search events, cities..."
                dense
                outlined
                clearable
                @clear="updateSearch('')"
              >
                <template v-slot:prepend>
                  <q-icon name="search" />
                </template>
              </q-input>
            </div>

            <!-- Country Filter -->
            <div class="col-12 col-md-3">
              <q-select
                :model-value="listFilters.country"
                @update:model-value="updateFilter('country', $event)"
                :options="countryOptions"
                label="Filter by Country"
                dense
                outlined
                clearable
                emit-value
                map-options
                :option-label="getCountryName"
                :option-value="(opt: string) => opt"
              >
                <template v-slot:prepend>
                  <q-icon name="flag" />
                </template>
              </q-select>
            </div>

            <!-- Category Filter -->
            <div class="col-12 col-md-3">
              <q-select
                :model-value="listFilters.category"
                @update:model-value="updateFilter('category', $event)"
                :options="categoryOptions"
                label="Filter by Category"
                dense
                outlined
                clearable
                emit-value
                map-options
              >
                <template v-slot:prepend>
                  <q-icon name="category" />
                </template>
              </q-select>
            </div>

            <!-- Past Events Toggle -->
            <div class="col-12 col-md-auto">
              <q-toggle
                :model-value="listFilters.showPastEvents"
                @update:model-value="updateFilter('showPastEvents', $event)"
                label="Include Past Events"
                color="primary"
              />
            </div>

            <!-- Clear Filters -->
            <div class="col-12 col-md-auto">
              <q-btn
                flat
                color="grey-7"
                icon="clear_all"
                label="Clear Filters"
                @click="clearListFilters"
                :disable="!hasActiveFilters"
              />
            </div>
          </div>

          <!-- Active Filters Display -->
          <div v-if="hasActiveFilters" class="q-mt-md">
            <q-chip
              v-if="listFilters.country"
              removable
              @remove="updateFilter('country', null)"
              size="sm"
              icon="flag"
            >
              {{ getCountryName(listFilters.country) }}
            </q-chip>
            <q-chip
              v-if="listFilters.category"
              removable
              @remove="updateFilter('category', null)"
              size="sm"
              icon="category"
            >
              {{ getCategoryLabel(listFilters.category) }}
            </q-chip>
            <q-chip
              v-if="listFilters.showPastEvents"
              removable
              @remove="updateFilter('showPastEvents', false)"
              size="sm"
              icon="event"
            >
              Include Past Events
            </q-chip>
            <q-chip
              v-if="listFilters.searchQuery"
              removable
              @remove="updateSearch('')"
              size="sm"
              icon="search"
            >
              Search: "{{ listFilters.searchQuery }}"
            </q-chip>
          </div>
        </q-card-section>
      </q-card>
    </div>

    <!-- View Toggle -->
    <div class="q-px-lg q-pb-md">
      <div class="row items-center justify-between">
        <div class="col-auto">
          <q-btn-toggle
            v-model="currentView"
            :options="viewOptions"
            flat
            toggle-color="primary"
            class="view-toggle"
          />
        </div>
        <div class="col-auto">
          <div class="text-caption text-grey-6">
            {{ currentView === 'table' ? 'Table View' : 'Calendar View' }}
          </div>
        </div>
      </div>
    </div>

    <!-- Calendar View -->
    <div v-if="currentView === 'calendar'" class="q-px-lg q-pb-lg">
      <q-card flat bordered class="calendar-card-wrapper">
        <EventCalendar
          :events="listState.items"
          @date-selected="onDateSelected"
          @event-selected="onEventSelected"
        />
      </q-card>
    </div>

    <!-- Events Table -->
    <div v-if="currentView === 'table'" class="q-px-lg q-pb-lg">
      <q-card flat bordered class="table-card-wrapper">
        <div class="styled-q-table">
          <q-table
            :rows="listState.items"
            :columns="columns"
            :loading="listState.loading"
            v-model:pagination="tablePagination"
            row-key="id"
            @request="onTableRequest"
            @row-click="handleRowClick"
            :rows-per-page-options="[10, 20, 50, 100]"
            binary-state-sort
            flat
            bordered
          >
            <!-- Custom Cell Templates -->
            <template #body-cell-title="props">
              <q-td :props="props" class="event-title-cell cursor-pointer">
                <div class="event-title-content">
                  <div class="event-title text-weight-medium">
                    <q-badge v-if="props.row.edition" color="primary" class="q-mr-sm">
                      {{ Number(props.row.edition) || props.row.edition }}
                    </q-badge>
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
                  <q-icon name="event" size="xs" class="q-mr-xs" />
                  <span class="text-weight-medium">{{ formatDate(props.row.start_date) }}</span>
                </div>
              </q-td>
            </template>

            <template #body-cell-city="props">
              <q-td :props="props" class="city-cell cursor-pointer">
                <div class="city-content">
                  <q-icon name="place" size="xs" class="q-mr-xs" />
                  <span class="text-weight-medium">{{
                    formatText(capitalizeCity(props.row.city))
                  }}</span>
                </div>
              </q-td>
            </template>

            <template #body-cell-country="props">
              <q-td :props="props" class="country-cell cursor-pointer">
                <div class="country-content">
                  <q-icon name="flag" size="xs" class="q-mr-xs" />
                  <span class="text-weight-medium">{{ getCountryName(props.row.country) }}</span>
                </div>
              </q-td>
            </template>

            <template #body-cell-category="props">
              <q-td :props="props" class="category-cell cursor-pointer">
                <span v-if="getEventCategory(props.row.taxonomies)">
                  {{ getEventCategory(props.row.taxonomies) }}
                </span>
                <span v-else class="text-grey-5">—</span>
              </q-td>
            </template>

            <!-- No Data State -->
            <template #no-data>
              <div class="text-center q-py-xl full-width">
                <q-icon name="event_busy" size="4em" color="grey-4" />
                <p class="text-h6 q-mt-md text-grey-6">No events found</p>
                <p class="text-body2 text-grey-5 q-mb-md">
                  Try adjusting your search criteria or filters
                </p>
                <q-btn
                  v-if="hasActiveFilters"
                  flat
                  color="primary"
                  label="Clear All Filters"
                  @click="clearListFilters"
                />
              </div>
            </template>

            <!-- Loading State -->
            <template #loading>
              <q-inner-loading showing color="primary" />
            </template>
          </q-table>
        </div>
      </q-card>
    </div>

    <!-- Error State -->
    <div v-if="listState.error" class="error-section q-px-lg q-pb-lg">
      <q-banner rounded class="bg-negative text-white" icon="error">
        <template v-slot:avatar>
          <q-icon name="error" color="white" />
        </template>
        {{ listState.error }}
        <template v-slot:action>
          <q-btn flat color="white" label="Retry" @click="retry" />
        </template>
      </q-banner>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { eventListService, type EventListItem } from '../services';
import type { PaginatedEventsResponse } from '../services/eventListService';
import { useFormatters } from '../composables/useFormatters';
import { useCountries } from '../composables/useCountries';
import { useGenericList, type ListFilters } from '../composables/useGenericList';
import EventCalendar from '../components/EventCalendar.vue';
import type { CalendarEvent } from '../composables/useEventCalendar';

interface EventListFilters extends ListFilters {
  country: string | null;
  category: string | null;
  showPastEvents: boolean;
}

const router = useRouter();
const $q = useQuasar();

// Composables
const { getCountryName, getCountryOptionsFromCodes } = useCountries();
const { formatDate, getEventCategory, formatText } = useFormatters();

// State for overall total count (unfiltered)
const overallTotalCount = ref(0);
const allCountriesSet = ref<Set<string>>(new Set()); // To populate country dropdown

// View state
const currentView = ref<'table' | 'calendar'>('table');
const viewOptions = [
  { label: 'Table', value: 'table', icon: 'table_rows' },
  { label: 'Calendar', value: 'calendar', icon: 'calendar_month' }
];

// --- useGenericList Setup ---
const {
  state: listState,
  filters: listFilters,
  // pagination: listPagination, // We use tablePagination which is a computed from useGenericList
  hasActiveFilters,
  tablePagination,
  retry,
  refresh,
  updateFilter,
  clearFilters: clearListFilters, // Renamed to avoid conflict
  updateSearch,
  onTableRequest,
  initialize,
} = useGenericList<EventListItem, EventListFilters>({
  fetchFn: async (
    params,
  ): Promise<{
    items: EventListItem[];
    totalCount: number;
    totalPages: number;
    currentPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  }> => {
    const apiParams: Record<string, unknown> = {
      page: params.page,
      perPage: params.perPage,
      orderby: params.sortBy === 'start_date' ? 'meta_value' : 'title',
      order: params.descending ? 'desc' : 'asc',
      meta_key: params.sortBy === 'start_date' ? 'start_date' : undefined,
      taxonomies: true,
    };

    if (!params.filters.showPastEvents) {
      const today = new Date();
      today.setDate(today.getDate() - 4); // Show events ending recently
      const minDate = today.toISOString().split('T')[0];
      apiParams.meta_query = JSON.stringify([
        { key: 'start_date', value: minDate, compare: '>=', type: 'DATE' },
      ]);
    }

    if (params.filters.country) apiParams.country = params.filters.country;
    if (params.filters.category) apiParams.category = params.filters.category;
    if (params.filters.searchQuery) apiParams.search = params.filters.searchQuery;
    if (params.forceReload) apiParams._t = Date.now();

    const response: PaginatedEventsResponse = await eventListService.getEvents(apiParams);

    // Update overall total count and country set only on initial load or forced refresh without filters
    // This is a simplified approach. A more robust solution might fetch this separately.
    if (overallTotalCount.value === 0 || (params.forceReload && !hasActiveFilters.value)) {
      try {
        const totalResponse = await eventListService.getEvents({
          page: 1,
          perPage: 1,
          taxonomies: true,
        });
        overallTotalCount.value = totalResponse.totalCount;
      } catch (err) {
        console.warn('Failed to load overall total count:', err);
        overallTotalCount.value = response.totalCount; // Fallback
      }
    }
    // Update country set from the current items for the dropdown
    response.events.forEach((e: EventListItem) => {
      if (e.country) allCountriesSet.value.add(e.country);
    });

    return {
      items: response.events,
      totalCount: response.totalCount,
      // Assuming API provides these, if not, calculate based on totalCount and perPage
      totalPages: Math.ceil(response.totalCount / params.perPage),
      currentPage: params.page,
      hasNextPage: params.page * params.perPage < response.totalCount,
      hasPrevPage: params.page > 1,
    };
  },
  defaultFilters: {
    searchQuery: '',
    country: null,
    category: null,
    showPastEvents: false,
  },
  defaultPagination: {
    sortBy: 'start_date',
    descending: true,
    rowsPerPage: 20,
  },
  persistenceKey: 'eventListState',
  searchDebounce: 500,
});
// --- End useGenericList Setup ---

// Computed
const countryOptions = computed(() => getCountryOptionsFromCodes(allCountriesSet.value));

const categoryOptions = computed(() => [
  { label: 'Conference', value: 'conference' },
  { label: 'Encuentro', value: 'encuentro' },
  { label: 'Festival', value: 'festival' },
  { label: 'Festivalito', value: 'festivalito' },
  { label: 'Learning', value: 'learning' },
  { label: 'Learning Weekend', value: 'learning-weekend' },
  { label: 'Marathon', value: 'marathon' },
  { label: 'Milonga Weekend', value: 'milonga-weekend' },
  { label: 'Other', value: 'other' },
  { label: 'Seminars', value: 'seminars' },
  { label: 'Tango Camp', value: 'tango-camp' },
  { label: 'Tango Holiday', value: 'tango-holiday' },
]);

// Table columns
const columns = [
  {
    name: 'title',
    label: 'Event',
    field: 'title',
    align: 'left' as const,
    sortable: true,
    style: 'min-width: 300px',
  },
  {
    name: 'start_date',
    label: 'Dates',
    field: 'start_date',
    align: 'left' as const,
    sortable: true,
    style: 'min-width: 120px',
  },
  {
    name: 'city',
    label: 'City',
    field: 'city',
    align: 'left' as const,
    sortable: true,
    style: 'min-width: 120px',
  },
  {
    name: 'country',
    label: 'Country',
    field: 'country',
    align: 'left' as const,
    sortable: true,
    style: 'min-width: 120px',
  },
  {
    name: 'category',
    label: 'Category',
    field: (row: EventListItem) => getEventCategory(row.taxonomies) || '', // Use getter for sorting/display
    align: 'center' as const,
    sortable: true,
    style: 'min-width: 100px',
  },
];

// Helper functions
const capitalizeCity = (city: string): string => {
  if (!city) return '';
  return city
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

const getCategoryLabel = (categoryValue: string | null): string => {
  if (!categoryValue) return '';
  const option = categoryOptions.value.find((opt) => opt.value === categoryValue);
  return option ? option.label : categoryValue;
};

// Event handlers
const handleRowClick = (evt: Event, row: EventListItem) => {
  const eventId = row.id;
  void router.push(`/events/${eventId}`);
};

// Calendar event handlers
const onDateSelected = (date: string) => {
  console.log('Date selected:', date);
};

const onEventSelected = (event: CalendarEvent) => {
  void router.push(`/events/${event.id}`);
};

// Wrapper to satisfy Quasar input typing (string | number | null)
const handleSearchInput = (value: string | number | null) => {
  updateSearch(typeof value === 'string' ? value : '');
};

// Watch for listState items to update allCountriesSet for the dropdown
watch(
  () => listState.value.items,
  (newItems) => {
    newItems.forEach((e) => {
      if (e.country) allCountriesSet.value.add(e.country);
    });
  },
  { deep: true },
);

// Lifecycle
onMounted(() => {
  initialize(); // This will call loadState and then loadData
  // Fetch initial set of countries for the dropdown if not persisted
  if (allCountriesSet.value.size === 0) {
    eventListService
      .getEvents({ perPage: 200, taxonomies: false }) // Fetch a larger set to populate countries
      .then((response) => {
        response.events.forEach((e) => {
          if (e.country) allCountriesSet.value.add(e.country);
        });
      })
      .catch((err) => console.warn('Failed to pre-populate country list', err));
  }
  // Fetch overall total count initially
  eventListService
    .getEvents({ page: 1, perPage: 1, taxonomies: true })
    .then((response) => {
      overallTotalCount.value = response.totalCount;
    })
    .catch((err) => console.warn('Failed to load initial overall total count:', err));
});

// Notification for successful refresh
watch(
  () => listState.value.loading,
  (newLoading, oldLoading) => {
    if (oldLoading && !newLoading && !listState.value.error && $q.platform.is.desktop) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const lastRefreshTime = (refresh as any).lastRefreshTime; // Assuming refresh might store this
      if (lastRefreshTime && Date.now() - lastRefreshTime < 1000) {
        // Check if refresh was called recently
        $q.notify({
          type: 'positive',
          message: 'Events refreshed successfully',
          position: 'top',
          timeout: 2000,
        });
      }
    }
  },
);
</script>

<style lang="scss" scoped>
// Page-specific styles that were previously here have been moved to global SASS files.
// This component now relies on those global styles (e.g., .gradient-background-page, .page-header-styling, .filters-card-wrapper, .table-card-wrapper, .styled-q-table).

// Cell specific styling (remains scoped as it's highly contextual to this table's data)
.event-title-cell {
  .event-title-content {
    .event-title {
      font-size: 14px;
      line-height: 1.4;
      max-width: none; // Allow full wrap
      white-space: normal;
      overflow: visible;
      text-overflow: initial;
    }
    .event-subtitle {
      margin-top: 2px;
      font-size: 11px;
    }
  }
}

.date-cell .date-content,
.city-cell .city-content,
.country-cell .country-content {
  display: flex;
  align-items: center;
  font-size: 13px;
  .q-icon {
    opacity: 0.8;
  }
}

.category-cell {
  text-align: center;
}

// Responsive adjustments for elements within this page, if any, that are not covered by global table/card styles.
// For example, if the filter layout needs specific tweaks for this page only on mobile.
// @media (max-width: $breakpoint-sm-max) {
//   .filters-section .filters-card-wrapper .row .col-12 {
//      // This was a general rule, so it's better handled by Quasar's grid or utility classes.
//      // If truly specific and needed: margin-bottom: 8px;
//   }
// }
</style>

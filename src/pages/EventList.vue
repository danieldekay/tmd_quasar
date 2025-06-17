<template>
  <q-page padding>
    <div class="row q-col-gutter-lg">
      <div class="col-12">
        <h1 class="text-h4 q-mb-lg">Events</h1>
      </div>
      <!-- Filter Controls -->
      <div class="col-12 row q-col-gutter-md q-mb-md">
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
          />
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
            <template v-slot:append>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                  <q-date v-model="startDateRange" range mask="YYYY-MM-DD" today-btn />
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
          <q-btn
            class="q-mt-xs"
            size="sm"
            outline
            color="primary"
            label="Next 9 mo"
            @click="applyQuickStartDateFilter"
          />
        </div>
        <div class="col-xs-12 col-sm-6 col-md-3">
          <q-input
            :model-value="formatDateRange(registrationDateRange)"
            label="Registration Date Range"
            dense
            outlined
            clearable
            @clear="registrationDateRange = { from: null, to: null }"
          >
            <template v-slot:append>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                  <q-date v-model="registrationDateRange" range mask="YYYY-MM-DD" today-btn />
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
          <q-btn
            class="q-mt-xs"
            size="sm"
            outline
            color="primary"
            label="Next 4 mo"
            @click="applyQuickRegistrationFilter"
          />
        </div>
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
          <q-table
            :rows="filteredEvents"
            :columns="columns"
            row-key="id"
            :loading="state.loading"
            v-model:pagination="state.pagination"
            @request="onRequest"
            @scroll="onScroll"
            virtual-scroll
            :virtual-scroll-item-size="48"
            :rows-per-page-options="[10, 20, 50, 100]"
          >
            <template v-slot:body="props">
              <q-tr :props="props" @click="navigateToEvent(props.row)" class="cursor-pointer">
                <q-td key="title" :props="props">
                  <div class="text-weight-medium">{{ props.row.title }}</div>
                  <div class="text-caption">{{ props.row.event_category }}</div>
                </q-td>
                <q-td key="start_date" :props="props">
                  {{ formatDate(props.row.start_date) }}
                </q-td>
                <q-td key="registration_start_date" :props="props">
                  {{ formatDate(props.row.registration_start_date) }}
                </q-td>
                <q-td key="location" :props="props">
                  {{ formatLocation(props.row.city, props.row.country) }}
                </q-td>
                <q-td key="category" :props="props">
                  {{ props.row.event_category }}
                </q-td>
              </q-tr>
            </template>
          </q-table>
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
    rowsPerPage: 10,
    rowsNumber: 0,
  },
});

// Add country mapping
const countryMap: Record<string, string> = {
  US: 'United States',
  DE: 'Germany',
  FR: 'France',
  // Add more mappings as needed
};

// Fallback using Intl.DisplayNames for codes not in the static map
let regionNames: Intl.DisplayNames | undefined;
try {
  // Some browsers/environments might not support it yet
  regionNames = new Intl.DisplayNames(['en'], { type: 'region' });
} catch {
  regionNames = undefined;
}

const getCountryName = (code: string): string => {
  return countryMap[code] ?? regionNames?.of(code) ?? code;
};

// Use shared formatters (declare early so columns can reference them)
const { formatDate, formatLocation } = useFormatters();

// Helper to get month abbreviation from date string (YYYY-MM-DD)
const getMonthAbbr = (dateStr: string): string => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleString(undefined, { month: 'short' });
};

// Determine if an event is mainly a weekend (<=3 days and covers Saturday & Sunday)
const isWeekendEvent = (start: string, end: string): boolean => {
  if (!start || !end) return false;
  const s = new Date(start);
  const e = new Date(end);
  const diffDays = (e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24) + 1;
  // Check if range includes Saturday (6) and Sunday (0)
  const includesSaturday =
    [s, e].some((d) => d.getDay() === 6) || (s.getDay() < 6 && e.getDay() >= 6);
  const includesSunday =
    [s, e].some((d) => d.getDay() === 0) || (s.getDay() < 0 && e.getDay() >= 0);
  return diffDays <= 3 && includesSaturday && includesSunday;
};

// Keep a master list of all countries we have encountered so the select retains every option
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

const columns: EventTableColumn[] = [
  {
    name: 'title',
    label: 'Event',
    field: (row: EventListItem) => row.title ?? '',
    sortable: true,
    align: 'left',
    style: 'width: 30%',
  },
  {
    name: 'start_date',
    label: 'Start Date',
    field: (row) => row.start_date,
    sortable: true,
    align: 'left',
    format: (val) => formatDate(val),
    style: 'width: 14%',
  },
  {
    name: 'registration_start_date',
    label: 'Registration Opens',
    field: (row) => row.registration_start_date,
    sortable: true,
    align: 'left',
    format: (val) => formatDate(val),
    style: 'width: 14%',
  },
  {
    name: 'month',
    label: 'Month',
    field: (row: EventListItem) => getMonthAbbr(row.start_date),
    sortable: true,
    align: 'left',
    style: 'width: 10%',
  },
  {
    name: 'weekend',
    label: 'Weekend',
    field: (row: EventListItem) => (isWeekendEvent(row.start_date, row.end_date) ? 'Yes' : ''),
    sortable: false,
    align: 'center',
    style: 'width: 8%',
  },
  {
    name: 'location',
    label: 'Location',
    field: (row) => formatLocation(row.city, row.country),
    sortable: true,
    align: 'left',
    style: 'width: 22%',
  },
  {
    name: 'category',
    label: 'Category',
    field: (row: EventListItem) => row.event_category ?? '',
    sortable: true,
    align: 'left',
    style: 'width: 20%',
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

// Format date for display
const formatDateRange = (range: { from: string | null; to: string | null }): string => {
  if (!range.from && !range.to) return '';
  if (range.from && range.to) return `${range.from} - ${range.to}`;
  return range.from || range.to || '';
};

// Simple debounce helper (avoids external dependency)
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

// Update filteredEvents to only handle search filtering
const filteredEvents = computed(() => {
  const events = state.value.events || [];
  return events.filter((event: EventListItem) => {
    const matchesSearch =
      !state.value.searchQuery ||
      event.title.toLowerCase().includes(state.value.searchQuery.toLowerCase()) ||
      event.event_name?.toLowerCase().includes(state.value.searchQuery.toLowerCase()) ||
      event.city?.toLowerCase().includes(state.value.searchQuery.toLowerCase()) ||
      event.country?.toLowerCase().includes(state.value.searchQuery.toLowerCase());
    return matchesSearch;
  });
});

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
</style>

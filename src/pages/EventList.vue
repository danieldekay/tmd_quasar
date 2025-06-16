<template>
  <q-page padding>
    <div class="row q-col-gutter-lg">
      <div class="col-12">
        <h1 class="text-h4 q-mb-lg">Events</h1>
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
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { wordpressService } from '../services/wordpress';
import type { Event } from '../services/wordpress';
import type { EventViewState, EventTableColumn } from '../interfaces/EventView';

const router = useRouter();
const $q = useQuasar();

const state = ref<EventViewState>({
  events: [],
  loading: false,
  error: null,
  viewMode: 'table',
  searchQuery: '',
  filters: {
    eventType: [],
    country: [],
    dateRange: {
      start: null,
      end: null,
    },
  },
  pagination: {
    page: 1,
    rowsPerPage: 10,
    total: 0,
  },
  sortBy: {
    field: 'start_date',
    direction: 'asc',
  },
});

const columns: EventTableColumn[] = [
  {
    name: 'title',
    label: 'Event',
    field: (row) => row.title,
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
    field: (row) => row.event_category,
    sortable: true,
    align: 'left',
    style: 'width: 20%',
  },
];

const filteredEvents = computed(() => {
  return state.value.events.filter((event) => {
    const searchLower = state.value.searchQuery.toLowerCase();
    return (
      event.title.toLowerCase().includes(searchLower) ||
      event.city.toLowerCase().includes(searchLower) ||
      event.country.toLowerCase().includes(searchLower)
    );
  });
});

const formatDate = (date: unknown): string => {
  if (!date) return '';
  if (typeof date === 'string') {
    const trimmed = date.trim();
    if (!trimmed) return '';
    const d = new Date(trimmed);
    if (isNaN(d.getTime())) return '';
    try {
      const isoString = d.toISOString();
      if (!isoString) return '';
      const parts = isoString.split('T');
      return parts[0] || '';
    } catch {
      return '';
    }
  }
  if (typeof date === 'number') {
    if (!isFinite(date)) return '';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    try {
      const isoString = d.toISOString();
      if (!isoString) return '';
      const parts = isoString.split('T');
      return parts[0] || '';
    } catch {
      return '';
    }
  }
  return '';
};

const formatLocation = (city?: string, country?: string): string => {
  if (city && country) return `${city}, ${country}`;
  if (city) return city;
  if (country) return country;
  return '—';
};

const navigateToEvent = (event: Event) => {
  void router.push(`/events/${event.id}`);
};

interface ApiError extends Error {
  response?: {
    status: number;
    data?: unknown;
  };
  request?: unknown;
}

const loadEvents = async () => {
  state.value.loading = true;
  state.value.error = null;

  try {
    const events = await wordpressService.getEvents({
      _embed: true,
      per_page: 100,
      orderby: 'start_date',
      order: 'desc',
    });

    if (!events || events.length === 0) {
      state.value.error = 'No events found. Please check back later.';
      return;
    }

    state.value.events = events;
    state.value.pagination.total = events.length;
  } catch (err: unknown) {
    console.error('Error loading events:', err);
    const apiError = err as ApiError;

    if (apiError.response) {
      switch (apiError.response.status) {
        case 404:
          state.value.error = 'Events endpoint not found. Please contact support.';
          break;
        case 401:
          state.value.error = 'Authentication required. Please log in.';
          break;
        case 403:
          state.value.error = 'Access denied. Please check your permissions.';
          break;
        case 500:
          state.value.error = 'Server error. Please try again later.';
          break;
        default:
          state.value.error = `Failed to load events (${apiError.response.status}). Please try again.`;
      }
    } else if (apiError.request) {
      state.value.error = 'Network error. Please check your connection.';
    } else {
      state.value.error = 'An unexpected error occurred. Please try again.';
    }
  } finally {
    state.value.loading = false;
  }
};

const loadMoreEvents = async () => {
  if (state.value.loading) return;

  state.value.loading = true;
  try {
    const nextPage = state.value.pagination.page + 1;
    const newEvents = await wordpressService.loadMoreEvents(nextPage, {
      _embed: true,
      per_page: 100,
      orderby: 'start_date',
      order: 'desc',
    });

    if (newEvents && newEvents.length > 0) {
      state.value.events = [...state.value.events, ...newEvents];
      state.value.pagination.page = nextPage;
      state.value.pagination.total += newEvents.length;
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
    total: props.pagination.rowsNumber || state.value.pagination.total,
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

onMounted(async () => {
  await loadEvents();
});
</script>

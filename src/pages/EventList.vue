<template>
  <q-page padding>
    <div class="row q-mb-md items-center">
      <div class="col-12 col-md-6">
        <q-input
          v-model="state.searchQuery"
          dense
          outlined
          placeholder="Search events..."
          class="q-mr-md"
        >
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
      </div>
      <div class="col-12 col-md-6 text-right">
        <q-btn-toggle
          v-model="state.viewMode"
          :options="[
            { label: 'Table', value: 'table' },
            { label: 'Cards', value: 'card' },
          ]"
          flat
          class="q-mr-md"
        />
        <q-btn round color="primary" icon="refresh" @click="loadEvents" :loading="state.loading">
          <q-tooltip>Reload events</q-tooltip>
        </q-btn>
      </div>
    </div>

    <!-- Error State -->
    <div v-if="state.error" class="q-mb-md">
      <q-banner class="bg-negative text-white">
        {{ state.error }}
        <template v-slot:action>
          <q-btn flat label="Retry" @click="loadEvents" />
        </template>
      </q-banner>
    </div>

    <!-- Table View -->
    <q-table
      v-if="state.viewMode === 'table'"
      :rows="filteredEvents"
      :columns="columns"
      row-key="id"
      :loading="state.loading"
      v-model:pagination="state.pagination"
      v-model:sort-by="state.sortBy.field"
      v-model:sort-desc="state.sortBy.direction"
      binary-state-sort
    >
      <template v-slot:body="props">
        <q-tr :props="props" @click="navigateToEvent(props.row)" class="cursor-pointer">
          <q-td v-for="col in props.cols" :key="col.name" :props="props">
            {{ typeof col.field === 'function' ? col.field(props.row) : props.row[col.field] }}
          </q-td>
        </q-tr>
      </template>
    </q-table>

    <!-- Card View -->
    <div v-else class="row q-col-gutter-md">
      <div v-for="event in filteredEvents" :key="event.id" class="col-12 col-sm-6 col-md-4">
        <q-card class="cursor-pointer" @click="navigateToEvent(event)">
          <q-img :src="'https://cdn.quasar.dev/img/mountains.jpg'" :ratio="16 / 9">
            <div class="absolute-bottom text-subtitle2 text-center bg-transparent">
              {{ event.title }}
            </div>
          </q-img>

          <q-card-section>
            <div class="text-subtitle2">{{ formatDate(event.start_date) }}</div>
            <div class="text-caption">{{ event.city }}, {{ event.country }}</div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { wordpressService } from '../services/wordpress';
import type { Event } from '../services/wordpress';
import type { EventViewState, EventTableColumn } from '../interfaces/EventView';

const router = useRouter();

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
  },
  {
    name: 'start_date',
    label: 'Start Date',
    field: (row) => row.start_date,
    sortable: true,
    align: 'left',
    format: (val) => formatDate(val),
  },
  {
    name: 'location',
    label: 'Location',
    field: (row) => `${row.city}, ${row.country}`,
    sortable: true,
    align: 'left',
  },
  {
    name: 'category',
    label: 'Category',
    field: (row) => row.event_category,
    sortable: true,
    align: 'left',
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

const formatDate = (date: string | number | boolean | null): string => {
  if (!date || typeof date !== 'string') return '';
  return new Date(date).toLocaleDateString();
};

const navigateToEvent = async (event: Event) => {
  await router.push(`/events/${event.id}`);
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

    const sortedEvents = [...events].sort((a, b) => {
      const aDate = a.start_date ? new Date(a.start_date).getTime() : 0;
      const bDate = b.start_date ? new Date(b.start_date).getTime() : 0;
      return state.value.sortBy.direction === 'asc' ? aDate - bDate : bDate - aDate;
    });

    state.value.events = sortedEvents;
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

onMounted(async () => {
  await loadEvents();
});
</script>

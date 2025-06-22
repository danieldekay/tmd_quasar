<template>
  <q-page class="event-list-page">
    <!-- Header -->
    <div class="page-header q-pa-lg">
      <div class="row items-center justify-between">
        <div class="col">
          <h1 class="text-h4 text-weight-bold q-mb-xs">Events Directory</h1>
          <p class="text-subtitle1 text-grey-6 q-ma-none">
            {{ pagination.rowsNumber.toLocaleString() }} / {{ totalCount.toLocaleString() }} events
            found based on filters
          </p>
        </div>
        <div class="col-auto">
          <q-btn round color="primary" icon="refresh" @click="refreshData" :loading="loading">
            <q-tooltip>Refresh Events</q-tooltip>
          </q-btn>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="filters-section q-px-lg q-pb-md">
      <q-card flat bordered class="filters-card">
        <q-card-section>
          <div class="row q-gutter-md">
            <!-- Search -->
            <div class="col-12 col-md-4">
              <q-input
                v-model="searchQuery"
                placeholder="Search events, cities, or countries..."
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

            <!-- Country Filter -->
            <div class="col-12 col-md-3">
              <q-select
                v-model="selectedCountry"
                :options="countryOptions"
                label="Filter by Country"
                dense
                outlined
                clearable
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

            <!-- Category Filter -->
            <div class="col-12 col-md-4">
              <q-select
                v-model="selectedCategory"
                :options="categoryOptions"
                label="Filter by Category"
                dense
                outlined
                clearable
                emit-value
                map-options
                @update:model-value="onFilterChange"
              >
                <template v-slot:prepend>
                  <q-icon name="category" />
                </template>
              </q-select>
            </div>

            <!-- Past Events Toggle -->
            <div class="col-12 col-md-2">
              <q-toggle
                v-model="showPastEvents"
                label="Include Past Events"
                color="primary"
                @update:model-value="onFilterChange"
              />
            </div>

            <!-- Clear Filters -->
            <div class="col-12 col-md-2">
              <q-btn
                flat
                color="grey-7"
                icon="clear_all"
                label="Clear Filters"
                @click="clearFilters"
                :disable="!hasActiveFilters"
              />
            </div>
          </div>

          <!-- Active Filters Display -->
          <div v-if="hasActiveFilters" class="q-mt-md">
            <q-chip
              v-if="selectedCountry"
              removable
              @remove="clearCountryFilter"
              size="sm"
              icon="flag"
            >
              {{ getCountryName(selectedCountry) }}
            </q-chip>
            <q-chip
              v-if="selectedCategory"
              removable
              @remove="clearCategoryFilter"
              size="sm"
              icon="category"
            >
              {{ getCategoryLabel(selectedCategory) }}
            </q-chip>
            <q-chip
              v-if="showPastEvents"
              removable
              @remove="clearPastEventsFilter"
              size="sm"
              icon="event"
            >
              Include Past Events
            </q-chip>
            <q-chip v-if="searchQuery" removable @remove="clearSearch" size="sm" icon="search">
              Search: "{{ searchQuery }}"
            </q-chip>
          </div>
        </q-card-section>
      </q-card>
    </div>

    <!-- Events Table -->
    <div class="table-section q-px-lg q-pb-lg">
      <q-card flat bordered class="table-card">
        <q-table
          :rows="events"
          :columns="columns"
          :loading="loading"
          v-model:pagination="pagination"
          row-key="id"
          @request="onRequest"
          @row-click="handleRowClick"
          :rows-per-page-options="[10, 20, 50, 100]"
          binary-state-sort
          flat
          bordered
          class="events-table"
        >
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
            <div class="text-center q-py-xl">
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
      <q-banner class="bg-negative" icon="error">
        <template v-slot:avatar>
          <q-icon name="error" color="white" />
        </template>
        Failed to load events
        <template v-slot:action>
          <q-btn flat color="white" label="Retry" @click="refreshData" />
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
import { useFormatters } from '../composables/useFormatters';
import { useCountries } from '../composables/useCountries';

const router = useRouter();
const $q = useQuasar();

// Composables
const { getCountryName, getCountryOptionsFromCodes } = useCountries();
const { formatDate, getEventCategory, formatText } = useFormatters();

// State
const events = ref<EventListItem[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);
const searchQuery = ref('');
const selectedCountry = ref<string | null>(null);
const showPastEvents = ref(false);
const allCountries = ref<Set<string>>(new Set());
const selectedCategory = ref<string | null>(null);
const totalCount = ref(0);

// Computed
const countryOptions = computed(() => getCountryOptionsFromCodes(allCountries.value));

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

const hasActiveFilters = computed(() => {
  return (
    searchQuery.value || selectedCountry.value || showPastEvents.value || selectedCategory.value
  );
});

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
    field: 'category_name',
    align: 'center' as const,
    sortable: true,
    style: 'min-width: 100px',
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

// Helper functions
const capitalizeCity = (city: string): string => {
  if (!city) return '';
  return city
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

const getCategoryLabel = (category: string): string => {
  switch (category) {
    case 'conference':
      return 'Conference';
    case 'encuentro':
      return 'Encuentro';
    case 'festival':
      return 'Festival';
    case 'festivalito':
      return 'Festivalito';
    case 'learning':
      return 'Learning';
    case 'learning-weekend':
      return 'Learning Weekend';
    case 'marathon':
      return 'Marathon';
    case 'milonga-weekend':
      return 'Milonga Weekend';
    case 'other':
      return 'Other';
    case 'seminars':
      return 'Seminars';
    case 'tango-camp':
      return 'Tango Camp';
    case 'tango-holiday':
      return 'Tango Holiday';
    default:
      return category;
  }
};

const updateCountrySet = (events: EventListItem[]) => {
  events.forEach((e) => {
    if (e.country) allCountries.value.add(e.country);
  });
};

// API functions
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
    if (!showPastEvents.value) {
      const today = new Date();
      today.setDate(today.getDate() - 4);
      const minDate = today.toISOString().split('T')[0];
      params.meta_query = JSON.stringify([
        {
          key: 'start_date',
          value: minDate,
          compare: '>=',
          type: 'DATE',
        },
      ]);
    }

    if (selectedCountry.value) {
      params.country = selectedCountry.value;
    }
    if (selectedCategory.value) {
      params.category = selectedCategory.value;
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

    // Load total count without filters if we don't have it yet or if it's a fresh load
    if (totalCount.value === 0 || forceReload) {
      try {
        const totalParams = {
          page: 1,
          perPage: 1,
          orderby: 'start_date' as const,
          order: 'desc' as const,
          meta_key: 'start_date',
          taxonomies: true,
        };
        const totalResponse = await eventListService.getEvents(totalParams);
        totalCount.value = totalResponse.totalCount;
      } catch (totalErr) {
        console.warn('Failed to load total count:', totalErr);
        // If we can't get the total, use the current count as fallback
        totalCount.value = response.totalCount;
      }
    }

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
    error.value = 'Failed to load events';
  } finally {
    loading.value = false;
  }
};

// Event handlers
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

const handleRowClick = (evt: Event, row: Record<string, unknown>) => {
  const eventId = row.id as number;
  void router.push(`/events/${eventId}`);
};

const refreshData = () => {
  void loadEvents(true);
};

const onSearchChange = () => {
  pagination.value.page = 1;
  void loadEvents();
};

const onFilterChange = () => {
  pagination.value.page = 1;
  void loadEvents();
};

const clearFilters = () => {
  searchQuery.value = '';
  selectedCountry.value = null;
  showPastEvents.value = false;
  selectedCategory.value = null;
  pagination.value.page = 1;
  void loadEvents();
};

const clearCountryFilter = () => {
  selectedCountry.value = null;
  onFilterChange();
};

const clearPastEventsFilter = () => {
  showPastEvents.value = false;
  onFilterChange();
};

const clearSearch = () => {
  searchQuery.value = '';
  onSearchChange();
};

const clearCategoryFilter = () => {
  selectedCategory.value = null;
  onFilterChange();
};

// Watchers
watch(
  [selectedCountry, showPastEvents, selectedCategory],
  () => {
    pagination.value.page = 1;
    void loadEvents();
  },
  { deep: true },
);

// Lifecycle
onMounted(() => {
  void loadEvents();
});
</script>

<style lang="scss" scoped>
.event-list-page {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;
}

.page-header {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.filters-section {
  .filters-card {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    border-radius: 12px;
    margin-top: 1rem;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.3);
  }
}

.table-section {
  .table-card {
    background: rgba(255, 255, 255, 0.98);
    backdrop-filter: blur(10px);
    border-radius: 12px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.3);
    overflow: hidden;
  }

  .events-table {
    :deep(.q-table__top) {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 16px 20px;
    }

    :deep(.q-table__bottom) {
      background-color: #fafafa;
      border-top: 1px solid #e0e0e0;
      padding: 12px 20px;
    }

    :deep(.q-table thead th) {
      background: white;
      color: black !important;
      font-weight: 600 !important;
      font-size: 13px !important;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      padding: 14px 12px !important;
      border-bottom: none !important;

      .q-icon {
        color: rgba(255, 255, 255, 0.7);
        transition: all 0.2s ease;

        &.q-table__sort-icon--active {
          color: white;
          transform: scale(1.1);
        }
      }
    }

    :deep(.q-table tbody tr) {
      transition: all 0.2s ease;
      border-bottom: 1px solid #f0f0f0;

      &:nth-child(even) {
        background-color: #fafafa;
      }

      &:hover {
        background-color: rgba(25, 118, 210, 0.08) !important;
        transform: translateY(-1px);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      }

      .q-td {
        padding: 14px 12px !important;
        vertical-align: top;
        border-bottom: none !important;
      }
    }
  }
}

.event-title-cell {
  .event-title-content {
    .event-title {
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
}

.date-cell,
.city-cell,
.country-cell {
  .date-content,
  .city-content,
  .country-content {
    display: flex;
    align-items: center;
    font-size: 13px;

    .q-icon {
      opacity: 0.8;
    }
  }
}

.category-cell {
  text-align: center;
}

.error-section {
  .q-banner {
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
}

// Responsive design
@media (max-width: 768px) {
  .page-header {
    .text-h4 {
      font-size: 1.5rem;
    }
  }

  .filters-section {
    .filters-card {
      .row {
        .col-12 {
          margin-bottom: 8px;
        }
      }
    }
  }

  .table-section {
    .events-table {
      :deep(.q-table thead th) {
        padding: 10px 8px !important;
        font-size: 11px !important;
      }

      :deep(.q-table tbody tr .q-td) {
        padding: 10px 8px !important;
        font-size: 12px;
      }
    }
  }
}
</style>

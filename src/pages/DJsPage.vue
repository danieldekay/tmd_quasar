<template>
  <q-page class="dj-directory">
    <!-- Header Section -->
    <div class="page-header q-pa-lg">
      <div class="row items-center justify-between">
        <div>
          <h1 class="text-h3 text-weight-light q-ma-none">DJ Directory</h1>
          <p class="text-subtitle1 text-grey-7 q-mt-sm q-mb-none">
            Discover tango DJs from around the world
          </p>
        </div>
        <div class="header-stats">
          <q-card flat class="stats-card">
            <q-card-section class="text-center q-pa-md">
              <div class="text-h4 text-primary text-weight-bold">
                {{ totalDJs.toLocaleString() }}
              </div>
              <div class="text-caption text-grey-6">Total DJs</div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>

    <!-- Filters Section -->
    <div class="filters-section q-px-lg q-pb-lg">
      <q-card flat bordered class="filters-card">
        <q-card-section class="q-pa-lg">
          <div class="row q-col-gutter-lg">
            <!-- Search -->
            <div class="col-12 col-md-6">
              <q-input
                v-model="searchQuery"
                placeholder="Search by DJ name (min 3 characters)..."
                outlined
                dense
                clearable
                @update:model-value="onSearchChange"
                class="search-input"
              >
                <template v-slot:prepend>
                  <q-icon name="search" color="grey-6" />
                </template>
                <template v-slot:append v-if="searchQuery">
                  <q-spinner-hourglass
                    v-if="loading && searchQuery.length >= 3"
                    color="primary"
                    size="16px"
                    class="q-mr-sm"
                  />
                  <q-chip
                    removable
                    @remove="clearSearch"
                    color="primary"
                    text-color="white"
                    size="sm"
                  >
                    "{{ searchQuery }}"
                  </q-chip>
                </template>
              </q-input>
            </div>

            <!-- Country Filter -->
            <div class="col-12 col-md-4">
              <q-select
                v-model="selectedCountry"
                :options="countryOptions"
                label="Country"
                outlined
                dense
                clearable
                emit-value
                map-options
                @update:model-value="onCountryChange"
                class="country-select"
              >
                <template v-slot:prepend>
                  <q-icon name="public" color="grey-6" />
                </template>
              </q-select>
            </div>

            <!-- Activity Filters -->
            <div class="col-12 col-md-2">
              <q-btn-dropdown
                outline
                color="grey-7"
                label="Activities"
                icon="filter_list"
                dense
                class="full-width"
              >
                <q-list>
                  <q-item
                    v-for="activity in activityFilters"
                    :key="activity.key"
                    clickable
                    @click="toggleActivityFilter(activity.key)"
                  >
                    <q-item-section avatar>
                      <q-checkbox :model-value="activity.active" :color="activity.color" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>{{ activity.label }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-btn-dropdown>
            </div>
          </div>

          <!-- Active Filters Display -->
          <div v-if="hasActiveFilters" class="row q-mt-md">
            <div class="col-12">
              <div class="text-caption text-grey-6 q-mb-xs">Active filters:</div>
              <div class="row q-gutter-xs">
                <q-chip
                  v-if="searchQuery"
                  removable
                  @remove="clearSearch"
                  color="primary"
                  text-color="white"
                  size="sm"
                  icon="search"
                >
                  Search: "{{ searchQuery }}"
                </q-chip>
                <q-chip
                  v-if="selectedCountry"
                  removable
                  @remove="clearCountry"
                  color="secondary"
                  text-color="white"
                  size="sm"
                  icon="public"
                >
                  {{ getCountryName(selectedCountry) }}
                </q-chip>
                <q-chip
                  v-for="activity in activeActivityFilters"
                  :key="activity.key"
                  removable
                  @remove="toggleActivityFilter(activity.key)"
                  :color="activity.color"
                  text-color="white"
                  size="sm"
                  :icon="activity.icon"
                >
                  {{ activity.label }}
                </q-chip>
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-section q-px-lg">
      <q-card flat bordered>
        <q-card-section class="text-center q-py-xl">
          <q-spinner-dots color="primary" size="3em" />
          <p class="text-subtitle1 q-mt-md text-grey-6">Loading DJs...</p>
        </q-card-section>
      </q-card>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-section q-px-lg">
      <OfflineMessage :error="error" title="Failed to Load DJs" @retry="retryLoad" />
    </div>

    <!-- Results Section -->
    <div v-else class="results-section q-px-lg q-pb-lg">
      <q-card flat bordered class="results-card">
        <!-- Results Header -->
        <q-card-section class="results-header q-pa-lg border-bottom">
          <div class="row items-center justify-between">
            <div class="results-info">
              <div class="text-h6 text-weight-medium">
                {{ filteredCount.toLocaleString() }}
                {{ filteredCount === 1 ? 'DJ' : 'DJs' }}
                <span v-if="hasActiveFilters" class="text-grey-6">
                  (filtered from {{ totalDJs.toLocaleString() }})
                </span>
              </div>
              <div class="text-caption text-grey-6 q-mt-xs">
                Page {{ pagination.page }} of
                {{ Math.ceil(filteredCount / pagination.rowsPerPage) }}
              </div>
            </div>

            <!-- View Options -->
            <div class="view-options">
              <q-select
                v-model="pagination.rowsPerPage"
                :options="[10, 20, 50, 100]"
                label="Per page"
                dense
                outlined
                style="min-width: 100px"
                @update:model-value="onPerPageChange"
              />
            </div>
          </div>
        </q-card-section>

        <!-- Table View -->
        <div>
          <q-table
            :key="`table-${searchQuery}-${selectedCountry}-${activeActivityFilters.map((f) => f.key).join(',')}`"
            :rows="djs"
            :columns="columns"
            row-key="id"
            :pagination="pagination"
            :loading="loading"
            @request="onRequest"
            flat
            class="dj-table"
            @row-click="onRowClick"
          >
            <!-- Custom cell templates -->
            <template v-slot:body-cell-name="props">
              <q-td :props="props" class="cursor-pointer">
                <div class="dj-name-cell">
                  <div class="text-weight-medium text-primary">{{ props.value }}</div>
                  <div v-if="props.row.tmd_dj_city" class="text-caption text-grey-6">
                    {{ props.row.tmd_dj_city }}
                  </div>
                </div>
              </q-td>
            </template>

            <template v-slot:body-cell-country="props">
              <q-td :props="props" class="cursor-pointer">
                <div v-if="props.value" class="country-cell">
                  <q-badge :label="props.value" color="grey-6" class="q-mr-xs" />
                  <span class="text-body2">{{ getCountryName(props.value) }}</span>
                </div>
              </q-td>
            </template>

            <!-- Activity checkboxes with better styling -->
            <template v-slot:body-cell-marathons="props">
              <q-td :props="props" class="cursor-pointer">
                <q-icon
                  :name="
                    props.row.tmd_dj_activity_marathons === '1'
                      ? 'check_circle'
                      : 'radio_button_unchecked'
                  "
                  :color="props.row.tmd_dj_activity_marathons === '1' ? 'red-6' : 'grey-4'"
                  size="sm"
                />
              </q-td>
            </template>

            <template v-slot:body-cell-festivals="props">
              <q-td :props="props" class="cursor-pointer">
                <q-icon
                  :name="
                    props.row.tmd_dj_activity_festivals === '1'
                      ? 'check_circle'
                      : 'radio_button_unchecked'
                  "
                  :color="props.row.tmd_dj_activity_festivals === '1' ? 'purple-6' : 'grey-4'"
                  size="sm"
                />
              </q-td>
            </template>

            <template v-slot:body-cell-encuentros="props">
              <q-td :props="props" class="cursor-pointer">
                <q-icon
                  :name="
                    props.row.tmd_dj_activity_encuentros === '1'
                      ? 'check_circle'
                      : 'radio_button_unchecked'
                  "
                  :color="props.row.tmd_dj_activity_encuentros === '1' ? 'blue-6' : 'grey-4'"
                  size="sm"
                />
              </q-td>
            </template>

            <template v-slot:body-cell-milongas="props">
              <q-td :props="props" class="cursor-pointer">
                <q-icon
                  :name="
                    props.row.tmd_dj_activity_milongas === '1'
                      ? 'check_circle'
                      : 'radio_button_unchecked'
                  "
                  :color="props.row.tmd_dj_activity_milongas === '1' ? 'teal-6' : 'grey-4'"
                  size="sm"
                />
              </q-td>
            </template>

            <template v-slot:body-cell-travel="props">
              <q-td :props="props" class="cursor-pointer">
                <q-icon
                  :name="
                    props.row.tmd_dj_activity_milongas_travel === '1'
                      ? 'check_circle'
                      : 'radio_button_unchecked'
                  "
                  :color="props.row.tmd_dj_activity_milongas_travel === '1' ? 'green-6' : 'grey-4'"
                  size="sm"
                />
              </q-td>
            </template>

            <template v-slot:body-cell-links="props">
              <q-td :props="props" class="cursor-pointer">
                <div class="links-cell row q-gutter-xs">
                  <q-btn
                    v-if="props.row.tmd_dj_webpage"
                    flat
                    round
                    dense
                    color="primary"
                    icon="language"
                    size="sm"
                    :href="props.row.tmd_dj_webpage"
                    target="_blank"
                    @click.stop
                  >
                    <q-tooltip>Website</q-tooltip>
                  </q-btn>
                  <q-btn
                    v-if="props.row.tmd_dj_link_to_facebook"
                    flat
                    round
                    dense
                    color="blue"
                    icon="facebook"
                    size="sm"
                    :href="props.row.tmd_dj_link_to_facebook"
                    target="_blank"
                    @click.stop
                  >
                    <q-tooltip>Facebook</q-tooltip>
                  </q-btn>
                </div>
              </q-td>
            </template>

            <template v-slot:body-cell-date_added="props">
              <q-td :props="props" class="cursor-pointer">
                <div class="text-caption">{{ formatDate(props.value) }}</div>
              </q-td>
            </template>

            <template v-slot:body-cell-last_updated="props">
              <q-td :props="props" class="cursor-pointer">
                <div class="text-caption">{{ formatDate(props.value) }}</div>
              </q-td>
            </template>
          </q-table>
        </div>
      </q-card>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { djService, type DJParams } from '../services/djService';
import type { DJ } from '../services/types';
import { useFormatters } from '../composables/useFormatters';
import { useCountries } from '../composables/useCountries';
import OfflineMessage from '../components/OfflineMessage.vue';

const router = useRouter();
const { formatDate } = useFormatters();
const { getCountryName, getAllCountryOptions } = useCountries();

// State
const djs = ref<DJ[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);
const searchQuery = ref('');
const selectedCountry = ref<string | null>(null);
const totalDJs = ref(0);
const filteredCount = ref(0);
let searchTimeout: NodeJS.Timeout | null = null;
let countryTimeout: NodeJS.Timeout | null = null;
let currentRequest: AbortController | null = null;

// Activity filters
const activityFilters = ref([
  { key: 'marathons', label: 'Marathons', color: 'red', icon: 'run_circle', active: false },
  { key: 'festivals', label: 'Festivals', color: 'purple', icon: 'celebration', active: false },
  { key: 'encuentros', label: 'Encuentros', color: 'blue', icon: 'groups', active: false },
  { key: 'milongas', label: 'Milongas', color: 'teal', icon: 'music_note', active: false },
  { key: 'travel', label: 'Travel', color: 'green', icon: 'travel_explore', active: false },
]);

const countryOptions = computed(() => {
  return getAllCountryOptions().map(({ code, name }) => ({
    label: name,
    value: code,
  }));
});

const pagination = ref({
  sortBy: 'date',
  descending: true,
  page: 1,
  rowsPerPage: 20,
  rowsNumber: 0,
});

// Computed properties
const hasActiveFilters = computed(() => {
  return !!(
    searchQuery.value ||
    selectedCountry.value ||
    activityFilters.value.some((f) => f.active)
  );
});

const activeActivityFilters = computed(() => {
  return activityFilters.value.filter((f) => f.active);
});

// Table columns
const columns = computed(() => [
  {
    name: 'id',
    label: 'ID',
    field: 'id',
    sortable: true,
    align: 'left' as const,
    style: 'width: 80px',
  },
  {
    name: 'name',
    label: 'DJ Name',
    field: (row: DJ) => row.tmd_dj_name || row.title,
    sortable: true,
    align: 'left' as const,
    style: 'width: 200px',
  },
  {
    name: 'country',
    label: 'Country',
    field: 'tmd_dj_country',
    sortable: true,
    align: 'left' as const,
    style: 'width: 160px',
  },
  {
    name: 'marathons',
    label: 'Marathons',
    field: 'marathons',
    sortable: false,
    align: 'center' as const,
    style: 'width: 90px',
  },
  {
    name: 'festivals',
    label: 'Festivals',
    field: 'festivals',
    sortable: false,
    align: 'center' as const,
    style: 'width: 90px',
  },
  {
    name: 'encuentros',
    label: 'Encuentros',
    field: 'encuentros',
    sortable: false,
    align: 'center' as const,
    style: 'width: 90px',
  },
  {
    name: 'milongas',
    label: 'Milongas',
    field: 'milongas',
    sortable: false,
    align: 'center' as const,
    style: 'width: 90px',
  },
  {
    name: 'travel',
    label: 'Travel',
    field: 'travel',
    sortable: false,
    align: 'center' as const,
    style: 'width: 80px',
  },
  {
    name: 'links',
    label: 'Links',
    field: 'links',
    sortable: false,
    align: 'center' as const,
    style: 'width: 120px',
  },
  {
    name: 'date_added',
    label: 'Added',
    field: 'date',
    sortable: true,
    align: 'left' as const,
    style: 'width: 100px',
  },
  {
    name: 'last_updated',
    label: 'Updated',
    field: 'modified',
    sortable: true,
    align: 'left' as const,
    style: 'width: 100px',
  },
]);

// Methods
const loadDJs = async (params: DJParams = {}) => {
  try {
    // Cancel any ongoing request
    if (currentRequest) {
      currentRequest.abort();
    }

    // Create new abort controller for this request
    currentRequest = new AbortController();

    loading.value = true;
    const response = await djService.getDJs(params, currentRequest.signal);
    djs.value = response.djs;
    totalDJs.value = response.total;
    filteredCount.value = response.total;
    pagination.value.rowsNumber = response.total;
    currentRequest = null;
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'AbortError') {
      // Request was cancelled, ignore
      return;
    }
    console.error('Error loading DJs:', err);
    error.value = 'Failed to load DJs';
    currentRequest = null;
  } finally {
    loading.value = false;
  }
};

const onRequest = async (requestProps: {
  pagination: { page: number; rowsPerPage: number; sortBy?: string; descending: boolean };
}) => {
  const { page, rowsPerPage, sortBy, descending } = requestProps.pagination;

  pagination.value.page = page;
  pagination.value.rowsPerPage = rowsPerPage;
  pagination.value.sortBy = sortBy || 'date';
  pagination.value.descending = descending;

  const params: DJParams = {
    page,
    per_page: rowsPerPage,
    orderby: sortBy || 'date',
    order: descending ? 'desc' : 'asc',
  };

  if (searchQuery.value.trim()) {
    params.search = searchQuery.value.trim();
  }

  if (selectedCountry.value) {
    params.country = selectedCountry.value;
  }

  await loadDJs(params);
};

const onSearchChange = () => {
  // Clear existing timeout
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }

  // Only search if 3+ characters or empty (to clear search)
  if (searchQuery.value.length >= 3 || searchQuery.value.length === 0) {
    searchTimeout = setTimeout(() => {
      pagination.value.page = 1;
      void onRequest({ pagination: pagination.value });
      searchTimeout = null;
    }, 1000); // Increased to 1 second as requested
  }
};

const onCountryChange = () => {
  // Clear existing timeout
  if (countryTimeout) {
    clearTimeout(countryTimeout);
  }

  countryTimeout = setTimeout(() => {
    pagination.value.page = 1;
    void onRequest({ pagination: pagination.value });
    countryTimeout = null;
  }, 150); // Debounce country changes too
};

const onPerPageChange = () => {
  pagination.value.page = 1;
  void onRequest({ pagination: pagination.value });
};

const onRowClick = (evt: Event | null, row: DJ) => {
  void router.push(`/djs/${row.id}`);
};

const retryLoad = () => {
  error.value = null;
  void onRequest({ pagination: pagination.value });
};

// Filter methods
const clearSearch = () => {
  if (searchTimeout) {
    clearTimeout(searchTimeout);
    searchTimeout = null;
  }
  searchQuery.value = '';
  pagination.value.page = 1;
  void onRequest({ pagination: pagination.value });
};

const clearCountry = () => {
  if (countryTimeout) {
    clearTimeout(countryTimeout);
    countryTimeout = null;
  }
  selectedCountry.value = null;
  pagination.value.page = 1;
  void onRequest({ pagination: pagination.value });
};

const toggleActivityFilter = (key: string) => {
  const filter = activityFilters.value.find((f) => f.key === key);
  if (filter) {
    filter.active = !filter.active;
    // TODO: Implement activity filtering logic
  }
};

onMounted(() => {
  void onRequest({ pagination: pagination.value });
});

// Cleanup timeouts on unmount
onUnmounted(() => {
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }
  if (countryTimeout) {
    clearTimeout(countryTimeout);
  }
  if (currentRequest) {
    currentRequest.abort();
  }
});
</script>

<style lang="scss" scoped>
.dj-directory {
  background: #fafafa;
  min-height: 100vh;
}

.page-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;

  .stats-card {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.2);
  }
}

.filters-card {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.results-card {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.border-bottom {
  border-bottom: 1px solid #e0e0e0;
}

.dj-table {
  :deep(.q-table tbody tr) {
    cursor: pointer;
    transition: background-color 0.2s ease;

    &:hover {
      background-color: rgba(25, 118, 210, 0.04);
    }
  }

  :deep(.q-table th) {
    font-weight: 600;
    color: #424242;
  }
}

.dj-name-cell {
  .text-primary {
    color: #1976d2 !important;
  }
}

.country-cell {
  display: flex;
  align-items: center;
}

.links-cell {
  justify-content: center;
}

.search-input :deep(.q-field__control) {
  border-radius: 8px;
}

.country-select :deep(.q-field__control) {
  border-radius: 8px;
}

@media (max-width: 768px) {
  .page-header {
    .row {
      flex-direction: column;
      text-align: center;

      .header-stats {
        margin-top: 1rem;
      }
    }
  }

  .view-options {
    justify-content: center;
    margin-top: 1rem;
  }
}
</style>

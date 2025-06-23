<template>
  <q-page class="gradient-background-page">
    <!-- Header -->
    <div class="page-header-styling q-pa-lg">
      <div class="row items-center justify-between">
        <div class="col">
          <h1 class="text-h4 text-weight-bold q-mb-xs">DJs Directory</h1>
          <p class="text-subtitle1 text-grey-6 q-ma-none">
            {{ listState.totalCount.toLocaleString() }} / {{ overallTotalCount.toLocaleString() }}
            DJs found based on filters
          </p>
        </div>
        <div class="col-auto">
          <q-btn round color="primary" icon="refresh" @click="refresh" :loading="listState.loading">
            <q-tooltip>Refresh DJs</q-tooltip>
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
            <div class="col-12 col-md-4">
              <q-input
                :model-value="listFilters.searchQuery"
                @update:model-value="updateSearch"
                placeholder="Search DJs, cities, or countries..."
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
                :option-value="(opt) => opt"
              >
                <template v-slot:prepend>
                  <q-icon name="flag" />
                </template>
              </q-select>
            </div>

            <!-- Activity Type Filter -->
            <div class="col-12 col-md-3">
              <q-select
                :model-value="listFilters.activityType"
                @update:model-value="updateFilter('activityType', $event)"
                :options="activityTypeOptions"
                label="Filter by Activity Type"
                dense
                outlined
                clearable
                emit-value
                map-options
              >
                <template v-slot:prepend>
                  <q-icon name="music_note" />
                </template>
              </q-select>
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
              v-if="listFilters.activityType"
              removable
              @remove="updateFilter('activityType', null)"
              size="sm"
              icon="music_note"
            >
              {{ getActivityTypeLabel(listFilters.activityType) }}
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

    <!-- DJs Table -->
    <div class="q-px-lg q-pb-lg">
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
            <template #body-cell-name="props">
              <q-td :props="props" class="dj-name-cell cursor-pointer">
                <div class="dj-name-content">
                  <div class="dj-name text-weight-medium">
                    {{ formatText(props.row.tmd_dj_name || props.row.title) }}
                  </div>
                  <div
                    v-if="
                      props.row.tmd_dj_real_name &&
                      props.row.tmd_dj_real_name !== (props.row.tmd_dj_name || props.row.title)
                    "
                    class="dj-real-name text-caption text-grey-6"
                  >
                    {{ formatText(props.row.tmd_dj_real_name) }}
                  </div>
                </div>
              </q-td>
            </template>

            <template #body-cell-city="props">
              <q-td :props="props" class="city-cell cursor-pointer">
                <div class="city-content">
                  <q-icon name="place" size="xs" class="q-mr-xs" />
                  <span class="text-weight-medium">{{
                    formatText(capitalizeCity(props.row.tmd_dj_city || ''))
                  }}</span>
                </div>
              </q-td>
            </template>

            <template #body-cell-country="props">
              <q-td :props="props" class="country-cell cursor-pointer">
                <div class="country-content">
                  <q-icon name="flag" size="xs" class="q-mr-xs" />
                  <span class="text-weight-medium">{{
                    getCountryName(props.row.tmd_dj_country || '')
                  }}</span>
                </div>
              </q-td>
            </template>

            <template #body-cell-tmd_dj_activity_marathons="props">
              <q-td :props="props" class="activity-cell cursor-pointer text-center">
                <q-checkbox
                  :model-value="props.row.tmd_dj_activity_marathons === '1'"
                  disable
                  dense
                  color="red-7"
                />
              </q-td>
            </template>

            <template #body-cell-tmd_dj_activity_festivals="props">
              <q-td :props="props" class="activity-cell cursor-pointer text-center">
                <q-checkbox
                  :model-value="props.row.tmd_dj_activity_festivals === '1'"
                  disable
                  dense
                  color="purple-6"
                />
              </q-td>
            </template>

            <template #body-cell-tmd_dj_activity_encuentros="props">
              <q-td :props="props" class="activity-cell cursor-pointer text-center">
                <q-checkbox
                  :model-value="props.row.tmd_dj_activity_encuentros === '1'"
                  disable
                  dense
                  color="blue-6"
                />
              </q-td>
            </template>

            <template #body-cell-tmd_dj_activity_milongas="props">
              <q-td :props="props" class="activity-cell cursor-pointer text-center">
                <q-checkbox
                  :model-value="props.row.tmd_dj_activity_milongas === '1'"
                  disable
                  dense
                  color="teal-6"
                />
              </q-td>
            </template>

            <!-- No Data State -->
            <template #no-data>
              <div class="text-center q-py-xl full-width">
                <q-icon name="music_off" size="4em" color="grey-4" />
                <p class="text-h6 q-mt-md text-grey-6">No DJs found</p>
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
import { djService, type DJ } from '../services';
import { useFormatters } from '../composables/useFormatters';
import { useCountries } from '../composables/useCountries';
import { useGenericList, type ListFilters } from '../composables/useGenericList';

interface DJListFilters extends ListFilters {
  country: string | null;
  activityType: string | null;
}

const router = useRouter();
const $q = useQuasar();

// Composables
const { getCountryName, getCountryOptionsFromCodes } = useCountries();
const { formatText } = useFormatters();

// State
const overallTotalCount = ref(0);
const allCountriesSet = ref<Set<string>>(new Set());

// --- useGenericList Setup ---
const {
  state: listState,
  filters: listFilters,
  hasActiveFilters,
  tablePagination,
  retry,
  refresh,
  updateFilter,
  clearFilters: clearListFilters,
  updateSearch,
  onTableRequest,
  initialize,
} = useGenericList<DJ, DJListFilters>({
  fetchFn: async (
    params,
  ): Promise<{
    items: DJ[];
    totalCount: number;
    totalPages: number;
    currentPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  }> => {
    const apiParams: Record<string, unknown> = {
      page: params.page,
      perPage: params.perPage,
      orderby: params.sortBy === 'name' ? 'title' : params.sortBy, // Assuming 'name' corresponds to 'title'
      order: params.descending ? 'desc' : 'asc',
      meta_fields:
        'tmd_dj_name,tmd_dj_country,tmd_dj_city,tmd_dj_real_name,tmd_dj_activity_marathons,tmd_dj_activity_festivals,tmd_dj_activity_encuentros,tmd_dj_activity_milongas',
    };

    if (params.filters.country) apiParams.country = params.filters.country;
    if (params.filters.activityType) apiParams.activity_type = params.filters.activityType;
    if (params.filters.searchQuery) apiParams.search = params.filters.searchQuery;
    if (params.forceReload) apiParams._t = Date.now();

    const response = await djService.getDJs(apiParams);

    if (overallTotalCount.value === 0 || (params.forceReload && !hasActiveFilters.value)) {
      try {
        const totalResponse = await djService.getDJs({ page: 1, perPage: 1 });
        overallTotalCount.value = totalResponse.total;
      } catch (err) {
        console.warn('Failed to load overall DJ total count:', err);
        overallTotalCount.value = response.total; // Fallback
      }
    }
    response.djs.forEach((dj) => {
      if (dj.tmd_dj_country) allCountriesSet.value.add(dj.tmd_dj_country);
    });

    return {
      items: response.djs,
      totalCount: response.total,
      totalPages: Math.ceil(response.total / params.perPage),
      currentPage: params.page,
      hasNextPage: params.page * params.perPage < response.total,
      hasPrevPage: params.page > 1,
    };
  },
  defaultFilters: {
    searchQuery: '',
    country: null,
    activityType: null,
  },
  defaultPagination: {
    sortBy: 'name', // Default sort by name (title)
    descending: false,
    rowsPerPage: 20,
  },
  persistenceKey: 'djListState',
  searchDebounce: 500,
});
// --- End useGenericList Setup ---

// Computed
const countryOptions = computed(() => getCountryOptionsFromCodes(allCountriesSet.value));

const activityTypeOptions = computed(() => [
  { label: 'Marathon', value: 'marathon' },
  { label: 'Festival', value: 'festival' },
  { label: 'Encuentro', value: 'encuentro' },
  { label: 'Milonga', value: 'milonga' },
]);

// Table columns
const columns = [
  {
    name: 'name',
    label: 'DJ Name',
    field: (row: DJ) => row.tmd_dj_name || row.title, // Handles potential missing tmd_dj_name
    align: 'left' as const,
    sortable: true,
    style: 'min-width: 250px',
  },
  {
    name: 'city',
    label: 'City',
    field: (row: DJ) => row.tmd_dj_city || '',
    align: 'left' as const,
    sortable: true, // Consider if API supports sorting by city
    style: 'min-width: 120px',
  },
  {
    name: 'country',
    label: 'Country',
    field: (row: DJ) => row.tmd_dj_country || '',
    align: 'left' as const,
    sortable: true, // Consider if API supports sorting by country
    style: 'min-width: 120px',
  },
  {
    name: 'tmd_dj_activity_marathons',
    label: 'Marathon',
    field: 'tmd_dj_activity_marathons',
    align: 'center' as const,
    sortable: false, // Typically not sortable
    style: 'min-width: 90px; text-align: center;',
  },
  {
    name: 'tmd_dj_activity_festivals',
    label: 'Festival',
    field: 'tmd_dj_activity_festivals',
    align: 'center' as const,
    sortable: false,
    style: 'min-width: 90px; text-align: center;',
  },
  {
    name: 'tmd_dj_activity_encuentros',
    label: 'Encuentro',
    field: 'tmd_dj_activity_encuentros',
    align: 'center' as const,
    sortable: false,
    style: 'min-width: 90px; text-align: center;',
  },
  {
    name: 'tmd_dj_activity_milongas',
    label: 'Milonga',
    field: 'tmd_dj_activity_milongas',
    align: 'center' as const,
    sortable: false,
    style: 'min-width: 90px; text-align: center;',
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

const getActivityTypeLabel = (activityValue: string | null): string => {
  if (!activityValue) return '';
  const option = activityTypeOptions.value.find((opt) => opt.value === activityValue);
  return option ? option.label : activityValue;
};

// Event handlers
const handleRowClick = (evt: Event, row: DJ) => {
  const djId = row.id;
  void router.push(`/djs/${djId}`);
};

// Watch for listState items to update allCountriesSet for the dropdown
watch(
  () => listState.value.items,
  (newItems) => {
    newItems.forEach((dj) => {
      if (dj.tmd_dj_country) allCountriesSet.value.add(dj.tmd_dj_country);
    });
  },
  { deep: true },
);

// Lifecycle
onMounted(() => {
  initialize();
  if (allCountriesSet.value.size === 0) {
    djService
      .getDJs({ perPage: 200 }) // Fetch a larger set to populate countries
      .then((response) => {
        response.djs.forEach((dj) => {
          if (dj.tmd_dj_country) allCountriesSet.value.add(dj.tmd_dj_country);
        });
      })
      .catch((err) => console.warn('Failed to pre-populate DJ country list', err));
  }
  djService
    .getDJs({ page: 1, perPage: 1 })
    .then((response) => {
      overallTotalCount.value = response.total;
    })
    .catch((err) => console.warn('Failed to load initial overall DJ total count:', err));
});

// Notification for successful refresh
watch(
  () => listState.value.loading,
  (newLoading, oldLoading) => {
    if (oldLoading && !newLoading && !listState.value.error && $q.platform.is.desktop) {
      // A bit of a hack to guess if it was a user-triggered refresh action
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const lastRefreshTime = (refresh as any).lastRefreshTime;
      if (lastRefreshTime && Date.now() - lastRefreshTime < 1000) {
        $q.notify({
          type: 'positive',
          message: 'DJs refreshed successfully',
          position: 'top',
          timeout: 2000,
        });
      }
    }
  },
);
</script>

<style lang="scss" scoped>
// Page-specific styles are largely moved to global SASS.
// Scoped styles here are for highly contextual elements within this page's unique structure.

.dj-name-cell {
  .dj-name-content {
    .dj-name {
      font-size: 14px;
      line-height: 1.4;
      max-width: none;
      white-space: normal;
      overflow: visible;
      text-overflow: initial;
    }
    .dj-real-name {
      margin-top: 2px;
      font-size: 11px;
    }
  }
}

.city-cell .city-content,
.country-cell .country-content {
  display: flex;
  align-items: center;
  font-size: 13px;
  .q-icon {
    opacity: 0.8;
  }
}

// .activity-cell is a new common class for all activity columns for consistency
.activity-cell {
  // text-align: center; // This is in column definition style
  .q-checkbox {
    // No specific margin needed if dense and text-align center are used
  }
}

// Responsive adjustments specific to this page's layout, if any remain.
// Most should be handled by global styles or Quasar utilities.
</style>

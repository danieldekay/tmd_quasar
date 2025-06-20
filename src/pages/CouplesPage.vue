<template>
  <BaseListPage
    title="Teaching Partnerships"
    subtitle="Discover talented tango teaching partnerships from around the world"
    :total-count="state.totalCount"
    stats-label="Total Partnerships"
    :loading="state.loading"
    :error="state.error"
    :show-empty-state="state.items.length === 0 && !state.loading && !state.error"
    empty-state-icon="favorite"
    empty-state-title="No Teaching Partnerships Found"
    empty-state-message="There are no teaching partnerships to display at the moment."
    :search-query="filters.searchQuery"
    :has-active-filters="hasActiveFilters"
    :active-filter-count="activeFilterCount"
    :display-count="state.items.length"
    :current-page="state.currentPage"
    :total-pages="state.totalPages"
    :show-pagination="state.totalPages > 1"
    @update:search-query="updateFilter('searchQuery', $event)"
    @clear-filters="clearFilters"
    @retry="retry"
  >
    <template #header-actions>
      <q-btn
        color="primary"
        icon="add"
        label="Add Partnership"
        unelevated
        @click="$router.push('/couples/new')"
      />
    </template>

    <template #filters>
      <div class="col-12 col-md-4">
        <q-select
          :model-value="filters.country"
          :options="countryOptions"
          outlined
          dense
          placeholder="Filter by country"
          clearable
          emit-value
          map-options
          @update:model-value="updateFilter('country', $event || '')"
        >
          <template #prepend>
            <q-icon name="flag" />
          </template>
        </q-select>
      </div>
      <div class="col-12 col-md-4">
        <q-select
          :model-value="filters.partnershipStyle"
          :options="partnershipStyleOptions"
          outlined
          dense
          placeholder="Filter by partnership style"
          clearable
          emit-value
          map-options
          @update:model-value="updateFilter('partnershipStyle', $event || '')"
        >
          <template #prepend>
            <q-icon name="style" />
          </template>
        </q-select>
      </div>
    </template>

    <template #active-filters>
      <q-chip
        v-if="filters.country"
        removable
        color="primary"
        text-color="white"
        :label="`Country: ${getCountryName(filters.country)}`"
        @remove="updateFilter('country', '')"
      />
      <q-chip
        v-if="filters.partnershipStyle"
        removable
        color="secondary"
        text-color="white"
        :label="`Style: ${filters.partnershipStyle}`"
        @remove="updateFilter('partnershipStyle', '')"
      />
    </template>

    <template #content>
      <BaseTable
        :rows="state.items"
        :columns="columns"
        :loading="state.loading"
        :error="state.error"
        :current-page="state.currentPage"
        :rows-per-page="pagination.rowsPerPage"
        :total-items="state.totalCount"
        :sort-by="pagination.sortBy"
        :descending="pagination.descending"
        :show-top-pagination="false"
        row-key="id"
        @update:current-page="updatePagination({ page: $event })"
        @update:rows-per-page="updatePagination({ rowsPerPage: $event })"
        @update:sort-by="updatePagination({ sortBy: $event })"
        @update:descending="updatePagination({ descending: $event })"
        @row-click="handleRowClick"
      >
        <template #body="{ props }">
          <q-td key="names" :props="props">
            <div class="text-weight-medium">{{ getCoupleNames(props.row) }}</div>
            <div class="text-caption text-grey-6 q-mt-xs">
              <template v-if="props.row._embedded?.teachers">
                <q-btn
                  v-for="teacher in props.row._embedded.teachers"
                  :key="teacher.id"
                  :label="teacher.title"
                  :to="`/teachers/${teacher.id}`"
                  flat
                  dense
                  color="primary"
                  size="sm"
                  class="q-mr-xs"
                >
                  <q-tooltip>View {{ teacher.role }} profile</q-tooltip>
                </q-btn>
              </template>
            </div>
          </q-td>
          <q-td key="location" :props="props">
            <div v-if="props.row.meta_box?.city || props.row.meta_box?.country">
              <q-icon name="place" size="xs" class="q-mr-xs" />
              {{ getLocationText(props.row) }}
            </div>
            <span v-else class="text-grey-5">-</span>
          </q-td>
          <q-td key="partnership_style" :props="props">
            <q-chip
              v-if="props.row.meta_box?.partnership_style"
              :label="props.row.meta_box.partnership_style"
              color="purple"
              text-color="white"
              size="sm"
              dense
            />
            <span v-else class="text-grey-5">-</span>
          </q-td>
          <q-td key="partnership_started" :props="props">
            <div v-if="props.row.meta_box?.partnership_started" class="text-caption">
              {{ props.row.meta_box.partnership_started }}
            </div>
            <span v-else class="text-grey-5">-</span>
          </q-td>
          <q-td key="website" :props="props">
            <q-btn
              v-if="props.row.meta_box?.website"
              flat
              round
              color="secondary"
              icon="launch"
              size="sm"
              :href="props.row.meta_box.website"
              target="_blank"
            >
              <q-tooltip>Visit Website</q-tooltip>
            </q-btn>
            <span v-else class="text-grey-5">-</span>
          </q-td>
          <q-td key="date" :props="props">
            <div class="text-caption">{{ formatDate(props.row.date) }}</div>
          </q-td>
          <q-td key="actions" :props="props">
            <div class="row q-gutter-xs">
              <q-btn
                flat
                round
                color="primary"
                icon="visibility"
                size="sm"
                :to="`/couples/${props.row.id}`"
              >
                <q-tooltip>View Details</q-tooltip>
              </q-btn>
              <q-btn
                flat
                round
                color="secondary"
                icon="edit"
                size="sm"
                @click.stop="editCouple(props.row)"
              >
                <q-tooltip>Edit Couple</q-tooltip>
              </q-btn>
            </div>
          </q-td>
        </template>
      </BaseTable>
    </template>
  </BaseListPage>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import BaseListPage from '../components/BaseListPage.vue';
import BaseTable from '../components/BaseTable.vue';
import { useGenericList } from '../composables/useGenericList';
import { coupleService } from '../services';
import type { Couple } from '../services/types';
import { useFormatters } from '../composables/useFormatters';
import { useCountries } from '../composables/useCountries';

const router = useRouter();
const { formatDate } = useFormatters();
const { getCountryName } = useCountries();

// Define filters interface
interface CoupleFilters {
  searchQuery: string;
  country: string;
  partnershipStyle: string;
  [key: string]: string; // Index signature for compatibility with ListFilters
}

// Table columns
const columns = [
  {
    name: 'names',
    label: 'Names',
    field: (row: Couple) => getCoupleNames(row),
    align: 'left' as const,
    sortable: true,
  },
  {
    name: 'location',
    label: 'Location',
    field: (row: Couple) => getLocationText(row),
    align: 'left' as const,
    sortable: true,
  },
  {
    name: 'partnership_style',
    label: 'Partnership Style',
    field: (row: Couple) => row.meta_box?.partnership_style || '',
    align: 'center' as const,
    sortable: true,
    style: 'width: 140px',
  },
  {
    name: 'partnership_started',
    label: 'Partnership Started',
    field: (row: Couple) => row.meta_box?.partnership_started || '',
    align: 'center' as const,
    sortable: true,
    style: 'width: 120px',
  },
  {
    name: 'website',
    label: 'Website',
    field: 'website',
    align: 'center' as const,
    sortable: false,
    style: 'width: 80px',
  },
  {
    name: 'date',
    label: 'Added',
    field: 'date',
    align: 'left' as const,
    sortable: true,
    style: 'width: 120px',
  },
  {
    name: 'actions',
    label: 'Actions',
    field: 'actions',
    align: 'center' as const,
    sortable: false,
    style: 'width: 120px',
  },
];

// Fetch function for the generic list
const fetchCouples = async (params: {
  page: number;
  perPage: number;
  sortBy: string;
  descending: boolean;
  filters: CoupleFilters;
}) => {
  const { page, perPage, sortBy, descending, filters } = params;

  // Build API parameters
  const apiParams: Record<string, unknown> = {
    page,
    per_page: perPage,
    orderby: sortBy === 'names' ? 'title' : sortBy,
    order: descending ? 'desc' : 'asc',
  };

  // Add filters
  if (filters.country) {
    apiParams.country = filters.country;
  }
  if (filters.searchQuery) {
    apiParams.search = filters.searchQuery;
  }

  try {
    const couples = await coupleService.getCouples(apiParams);

    // Filter by partnership style locally since API might not support this filter
    let filteredCouples = couples || [];

    if (filters.partnershipStyle) {
      filteredCouples = filteredCouples.filter(
        (couple) => couple.meta_box?.partnership_style === filters.partnershipStyle,
      );
    }

    // Since we're getting all couples and filtering locally,
    // we need to implement pagination manually
    const totalCount = filteredCouples.length;
    const totalPages = Math.ceil(totalCount / perPage);
    const startIndex = (page - 1) * perPage;
    const endIndex = startIndex + perPage;
    const paginatedCouples = filteredCouples.slice(startIndex, endIndex);

    return {
      items: paginatedCouples,
      totalCount,
      totalPages,
      currentPage: page,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    };
  } catch (error) {
    console.error('Error fetching couples:', error);
    throw error;
  }
};

// Use the generic list composable
const {
  state,
  filters,
  pagination,
  hasActiveFilters,
  activeFilterCount,
  updateFilter,
  updatePagination,
  clearFilters,
  retry,
  initialize,
} = useGenericList<Couple, CoupleFilters>({
  fetchFn: fetchCouples,
  defaultFilters: {
    searchQuery: '',
    country: '',
    partnershipStyle: '',
  },
  defaultPagination: {
    page: 1,
    rowsPerPage: 20,
    sortBy: 'names',
    descending: false,
  },
  persistenceKey: 'couples-filters',
  enableSearch: true,
  searchMinLength: 2,
  searchDebounce: 300,
});

// Filter options
const countryOptions = computed(() => {
  const countries = new Set<string>();
  state.value.items.forEach((couple) => {
    if (couple.meta_box?.country) {
      countries.add(couple.meta_box.country);
    }
  });
  return Array.from(countries)
    .map((code) => ({
      label: getCountryName(code),
      value: code,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
});

const partnershipStyleOptions = computed(() => {
  const styles = new Set<string>();
  state.value.items.forEach((couple) => {
    if (couple.meta_box?.partnership_style) {
      styles.add(couple.meta_box.partnership_style);
    }
  });
  return Array.from(styles)
    .map((style) => ({
      label: style,
      value: style,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
});

// Helper functions
const getCoupleNames = (couple: Couple): string => {
  // First priority: use embedded teacher data if available
  if (couple._embedded?.teachers) {
    const teachers = couple._embedded.teachers;
    const leaderName = teachers.find((t) => t.role === 'leader')?.title || 'Unknown';
    const followerName = teachers.find((t) => t.role === 'follower')?.title || 'Unknown';
    return `${followerName} & ${leaderName}`;
  }

  // Fallback to leader_name and follower_name if available
  if (couple.leader_name && couple.follower_name) {
    return `${couple.follower_name} & ${couple.leader_name}`;
  }

  // Last resort: decode HTML entities from title
  return decodeHtmlEntities(couple.title || 'Unknown Partnership');
};

const decodeHtmlEntities = (str: string): string => {
  const textarea = document.createElement('textarea');
  textarea.innerHTML = str;
  return textarea.value;
};

const getLocationText = (couple: Couple): string => {
  const city = couple.meta_box?.city || '';
  const country = couple.meta_box?.country || '';
  const countryName = country ? getCountryName(country) : '';
  return [city, countryName].filter(Boolean).join(', ');
};

// Event handlers
const handleRowClick = (couple: Couple) => {
  void router.push(`/couples/${couple.id}`);
};

const editCouple = (couple: Couple) => {
  void router.push(`/couples/${couple.id}/edit`);
};

// Initialize the component
onMounted(() => {
  initialize();
});
</script>

<style lang="scss" scoped>
// Any custom styles if needed
</style>

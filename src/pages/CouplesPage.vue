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
      >
        <template #body="{ props }">
          <q-td key="names" :props="props">
            <q-btn
              :label="getCoupleNames(props.row)"
              flat
              no-caps
              color="primary"
              class="text-weight-medium q-pa-none"
              style="text-align: left; justify-content: flex-start"
              :to="`/couples/${props.row.id}`"
            />
          </q-td>
          <q-td key="follower" :props="props">
            <div v-if="getFollowerName(props.row)">
              <q-btn
                :label="getFollowerName(props.row)"
                flat
                dense
                color="secondary"
                size="sm"
                :to="`/teachers/${getFollowerId(props.row)}`"
                v-if="getFollowerId(props.row)"
              >
                <q-tooltip>View follower profile</q-tooltip>
              </q-btn>
              <span v-else>{{ getFollowerName(props.row) }}</span>
            </div>
            <span v-else class="text-grey-5">-</span>
          </q-td>
          <q-td key="leader" :props="props">
            <div v-if="getLeaderName(props.row)">
              <q-btn
                :label="getLeaderName(props.row)"
                flat
                dense
                color="primary"
                size="sm"
                :to="`/teachers/${getLeaderId(props.row)}`"
                v-if="getLeaderId(props.row)"
              >
                <q-tooltip>View leader profile</q-tooltip>
              </q-btn>
              <span v-else>{{ getLeaderName(props.row) }}</span>
            </div>
            <span v-else class="text-grey-5">-</span>
          </q-td>
          <q-td key="both_roles" :props="props">
            <div v-if="getBothRolesName(props.row)">
              <q-btn
                :label="getBothRolesName(props.row)"
                flat
                dense
                color="purple"
                size="sm"
                :to="`/teachers/${getBothRolesId(props.row)}`"
                v-if="getBothRolesId(props.row)"
              >
                <q-tooltip>View teacher profile (both roles)</q-tooltip>
              </q-btn>
              <span v-else>{{ getBothRolesName(props.row) }}</span>
            </div>
            <span v-else class="text-grey-5">-</span>
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
          <q-td key="events_count" :props="props">
            <q-badge
              v-if="getEventsCount(props.row) > 0"
              :label="getEventsCount(props.row)"
              color="primary"
              rounded
            />
            <span v-else class="text-grey-5">0</span>
          </q-td>
          <q-td key="date" :props="props">
            <div class="text-caption">{{ formatDate(props.row.date) }}</div>
          </q-td>
        </template>
      </BaseTable>
    </template>
  </BaseListPage>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import BaseListPage from '../components/BaseListPage.vue';
import BaseTable from '../components/BaseTable.vue';
import { useGenericList } from '../composables/useGenericList';
import { coupleService } from '../services';
import type { Couple } from '../services/types';
import { useFormatters } from '../composables/useFormatters';
import { useCountries } from '../composables/useCountries';
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
    label: 'Partnership Name',
    field: (row: Couple) => getCoupleNames(row),
    align: 'left' as const,
    sortable: true,
  },
  {
    name: 'follower',
    label: 'Follower',
    field: (row: Couple) => getFollowerName(row),
    align: 'left' as const,
    sortable: true,
    style: 'width: 180px',
  },
  {
    name: 'leader',
    label: 'Leader',
    field: (row: Couple) => getLeaderName(row),
    align: 'left' as const,
    sortable: true,
    style: 'width: 180px',
  },
  {
    name: 'both_roles',
    label: 'Both/Double Role',
    field: (row: Couple) => getBothRolesName(row),
    align: 'left' as const,
    sortable: true,
    style: 'width: 180px',
  },
  {
    name: 'location',
    label: 'Location',
    field: (row: Couple) => getLocationText(row),
    align: 'left' as const,
    sortable: true,
    style: 'width: 150px',
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
    name: 'events_count',
    label: 'Events',
    field: (row: Couple) => getEventsCount(row),
    align: 'center' as const,
    sortable: true,
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

  // For local processing, we pull all data at once
  const apiParams: Record<string, unknown> = {
    per_page: 999, // Get all couples for local processing
    orderby: 'title', // Default ordering by title from API
    order: 'asc',
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

    // Apply local sorting
    if (sortBy && filteredCouples.length > 0) {
      filteredCouples.sort((a, b) => {
        let aVal: unknown;
        let bVal: unknown;

        switch (sortBy) {
          case 'names':
            aVal = getCoupleNames(a);
            bVal = getCoupleNames(b);
            break;
          case 'follower':
            aVal = getFollowerName(a);
            bVal = getFollowerName(b);
            break;
          case 'leader':
            aVal = getLeaderName(a);
            bVal = getLeaderName(b);
            break;
          case 'both_roles':
            aVal = getBothRolesName(a);
            bVal = getBothRolesName(b);
            break;
          case 'location':
            aVal = getLocationText(a);
            bVal = getLocationText(b);
            break;
          case 'partnership_style':
            aVal = a.meta_box?.partnership_style || '';
            bVal = b.meta_box?.partnership_style || '';
            break;
          case 'partnership_started':
            aVal = a.meta_box?.partnership_started || '';
            bVal = b.meta_box?.partnership_started || '';
            break;
          case 'events_count':
            aVal = getEventsCount(a);
            bVal = getEventsCount(b);
            break;
          case 'date':
            aVal = new Date(a.date || 0).getTime();
            bVal = new Date(b.date || 0).getTime();
            break;
          default:
            aVal = a.title || '';
            bVal = b.title || '';
        }

        // Handle string comparison
        if (typeof aVal === 'string' && typeof bVal === 'string') {
          const result = aVal.localeCompare(bVal);
          return descending ? -result : result;
        }

        // Handle numeric comparison
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          const result = aVal - bVal;
          return descending ? -result : result;
        }

        // Fallback comparison
        const aStr = typeof aVal === 'string' || typeof aVal === 'number' ? String(aVal) : '';
        const bStr = typeof bVal === 'string' || typeof bVal === 'number' ? String(bVal) : '';
        const result = aStr.localeCompare(bStr);
        return descending ? -result : result;
      });
    }

    // Since we're getting all couples and processing locally,
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
const getEventsCount = (couple: Couple): number => {
  // Check if couple has embedded events
  if (couple._embedded?.events) {
    return couple._embedded.events.length;
  }
  return 0;
};

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

const getFollowerName = (couple: Couple): string => {
  // Check embedded teachers first
  if (couple._embedded?.teachers) {
    const follower = couple._embedded.teachers.find((t) => t.role === 'follower');
    if (follower) return follower.title;
  }

  // Fallback to follower_name
  return couple.follower_name || '';
};

const getLeaderName = (couple: Couple): string => {
  // Check embedded teachers first
  if (couple._embedded?.teachers) {
    const leader = couple._embedded.teachers.find((t) => t.role === 'leader');
    if (leader) return leader.title;
  }

  // Fallback to leader_name
  return couple.leader_name || '';
};

const getBothRolesName = (couple: Couple): string => {
  // Check embedded teachers for those marked as both roles
  if (couple._embedded?.teachers) {
    const bothRoles = couple._embedded.teachers.find(
      (t) => t.role === 'both' || t.role === 'double-role',
    );
    if (bothRoles) return bothRoles.title;
  }

  // For now, return empty as this is a special case
  return '';
};

const getFollowerId = (couple: Couple): number | null => {
  // Check embedded teachers first
  if (couple._embedded?.teachers) {
    const follower = couple._embedded.teachers.find((t) => t.role === 'follower');
    if (follower) return follower.id;
  }

  // Fallback to follower_id
  return couple.follower_id || null;
};

const getLeaderId = (couple: Couple): number | null => {
  // Check embedded teachers first
  if (couple._embedded?.teachers) {
    const leader = couple._embedded.teachers.find((t) => t.role === 'leader');
    if (leader) return leader.id;
  }

  // Fallback to leader_id
  return couple.leader_id || null;
};

const getBothRolesId = (couple: Couple): number | null => {
  // Check embedded teachers for those marked as both roles
  if (couple._embedded?.teachers) {
    const bothRoles = couple._embedded.teachers.find(
      (t) => t.role === 'both' || t.role === 'double-role',
    );
    if (bothRoles) return bothRoles.id;
  }

  // For now, return null as this is a special case
  return null;
};

const getLocationText = (couple: Couple): string => {
  const city = couple.meta_box?.city || '';
  const country = couple.meta_box?.country || '';
  const countryName = country ? getCountryName(country) : '';
  return [city, countryName].filter(Boolean).join(', ');
};

// Event handlers - removed since we're using clickable names instead

// Initialize the component
onMounted(() => {
  initialize();
});
</script>

<style lang="scss" scoped>
// Any custom styles if needed
</style>

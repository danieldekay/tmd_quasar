<template>
  <BaseListPage
    title="Teaching Partnerships"
    subtitle="Discover talented tango teaching partnerships from around the world"
    :total-count="couples.length"
    stats-label="Total Partnerships"
    :loading="loading"
    :error="error"
    :show-empty-state="couples.length === 0 && !loading && !error"
    empty-state-icon="favorite"
    empty-state-title="No Teaching Partnerships Found"
    empty-state-message="There are no teaching partnerships to display at the moment."
    :search-query="searchQuery"
    :has-active-filters="hasActiveFilters"
    :active-filter-count="activeFilterCount"
    :display-count="filteredCouples.length"
    :current-page="pagination.currentPage.value"
    :total-pages="pagination.totalPages.value"
    :show-pagination="pagination.totalPages.value > 1"
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
          v-model="selectedCountry"
          :options="countryOptions"
          outlined
          dense
          placeholder="Filter by country"
          clearable
          emit-value
          map-options
        >
          <template #prepend>
            <q-icon name="flag" />
          </template>
        </q-select>
      </div>
      <div class="col-12 col-md-4">
        <q-select
          v-model="selectedPartnershipStyle"
          :options="partnershipStyleOptions"
          outlined
          dense
          placeholder="Filter by partnership style"
          clearable
          emit-value
          map-options
        >
          <template #prepend>
            <q-icon name="style" />
          </template>
        </q-select>
      </div>
    </template>

    <template #active-filters>
      <q-chip
        v-if="selectedCountry"
        removable
        color="primary"
        text-color="white"
        :label="`Country: ${getCountryName(selectedCountry)}`"
        @remove="selectedCountry = ''"
      />
      <q-chip
        v-if="selectedPartnershipStyle"
        removable
        color="secondary"
        text-color="white"
        :label="`Style: ${selectedPartnershipStyle}`"
        @remove="selectedPartnershipStyle = ''"
      />
    </template>

    <template #content>
      <BaseTable
        :rows="paginatedCouples"
        :columns="columns"
        :loading="loading"
        :error="error"
        :current-page="pagination.currentPage.value"
        :rows-per-page="pagination.rowsPerPage.value"
        :total-items="filteredCouples.length"
        :show-top-pagination="true"
        row-key="id"
        @update:current-page="pagination.goToPage($event)"
        @update:rows-per-page="pagination.setRowsPerPage($event)"
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
            <div v-if="props.row.city || props.row.country">
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
import { ref, computed, onMounted, watch } from 'vue';
import BaseListPage from '../components/BaseListPage.vue';
import BaseTable from '../components/BaseTable.vue';
import { useTablePagination } from '../composables/useTablePagination';
import { coupleService } from '../services';
import type { Couple } from '../services/types';
import { useFormatters } from '../composables/useFormatters';
import { useCountries } from '../composables/useCountries';
const { formatDate } = useFormatters();
const { getCountryName } = useCountries();

// Pagination
const pagination = useTablePagination({
  initialRowsPerPage: 20,
  rowsPerPageOptions: [10, 20, 50, 100],
});

// State
const couples = ref<Couple[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);
const searchQuery = ref('');
const selectedCountry = ref('');
const selectedPartnershipStyle = ref('');

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

// Computed properties for filtering and pagination
const filteredCouples = computed(() => {
  // Ensure we always return an array
  if (!couples.value || !Array.isArray(couples.value)) {
    return [];
  }

  let filtered = couples.value;

  // Apply search filter
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim();
    filtered = filtered.filter((couple) => {
      const name = getCoupleNames(couple).toLowerCase();
      const follower = getFollowerName(couple).toLowerCase();
      const leader = getLeaderName(couple).toLowerCase();
      return name.includes(query) || follower.includes(query) || leader.includes(query);
    });
  }

  // Apply country filter
  if (selectedCountry.value) {
    filtered = filtered.filter((couple) => couple.country === selectedCountry.value);
  }

  // Apply partnership style filter
  if (selectedPartnershipStyle.value) {
    filtered = filtered.filter(
      (couple) => couple.meta_box?.partnership_style === selectedPartnershipStyle.value,
    );
  }

  return filtered;
});

const paginatedCouples = computed(() => {
  // Ensure we always return an array
  if (!filteredCouples.value || !Array.isArray(filteredCouples.value)) {
    return [];
  }

  const start = (pagination.currentPage.value - 1) * pagination.rowsPerPage.value;
  const end = start + pagination.rowsPerPage.value;
  return filteredCouples.value.slice(start, end);
});

const hasActiveFilters = computed(() => {
  return !!(searchQuery.value.trim() || selectedCountry.value || selectedPartnershipStyle.value);
});

const activeFilterCount = computed(() => {
  let count = 0;
  if (searchQuery.value.trim()) count++;
  if (selectedCountry.value) count++;
  if (selectedPartnershipStyle.value) count++;
  return count;
});

// Filter options
const countryOptions = computed(() => {
  const countries = new Set<string>();
  if (couples.value && Array.isArray(couples.value)) {
    couples.value.forEach((couple) => {
      if (couple.country) {
        countries.add(couple.country);
      }
    });
  }
  return Array.from(countries)
    .map((code) => ({
      label: getCountryName(code),
      value: code,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
});

const partnershipStyleOptions = computed(() => {
  const styles = new Set<string>();
  if (couples.value && Array.isArray(couples.value)) {
    couples.value.forEach((couple) => {
      if (couple.meta_box?.partnership_style) {
        styles.add(couple.meta_box.partnership_style);
      }
    });
  }
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
  const city = couple.city || '';
  const country = couple.country || '';
  const countryName = country ? getCountryName(country) : '';
  return [city, countryName].filter(Boolean).join(', ');
};

// Event handlers - removed since we're using clickable names instead

// Update pagination total items
watch(filteredCouples, () => {
  pagination.totalItems.value = filteredCouples.value.length;
});

// Methods
const updateFilter = (key: string, value: string) => {
  if (key === 'searchQuery') {
    searchQuery.value = value;
  }
  // No need to handle other filters as they're directly bound
};

const clearFilters = () => {
  searchQuery.value = '';
  selectedCountry.value = '';
  selectedPartnershipStyle.value = '';
};

const retry = async () => {
  await fetchCouples();
};

// Fetch couples data
const fetchCouples = async () => {
  try {
    loading.value = true;
    error.value = null;

    const data = await coupleService.getCouples({
      per_page: 999, // Get all couples for local processing
      _embed: true,
      meta_fields: 'all',
    });

    couples.value = data || [];
  } catch (err) {
    console.error('Error fetching couples:', err);
    error.value = 'Failed to load teaching partnerships. Please try again.';
  } finally {
    loading.value = false;
  }
};

// Initialize the data on mount
onMounted(() => {
  void fetchCouples();
});
</script>

<style lang="scss" scoped>
// Any custom styles if needed
</style>

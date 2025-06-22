<template>
  <q-page class="couples-directory">
    <!-- Results Section -->
    <div class="results-section q-px-lg q-pb-lg">
      <BaseTable
        :rows="couples"
        :columns="columns"
        :loading="loading"
        :pagination="pagination"
        row-key="id"
        @request="onRequest"
        @row-click="handleRowClick"
      >
        <template #navbar>
          <TableNavbar
            :filtered-count="pagination.rowsNumber"
            :total-count="totalCouples"
            :has-active-filters="hasActiveFilters"
            :current-page="pagination.page"
            :total-pages="Math.ceil(pagination.rowsNumber / pagination.rowsPerPage)"
            :rows-per-page="pagination.rowsPerPage"
            :loading="loading"
            item-name="couple"
            @reload="fetchCouples"
            @update:rows-per-page="onPerPageChange"
            @update:current-page="goToPage"
          />
        </template>
        <template #body-cell-names="props">
          <q-td :props="props" class="cursor-pointer">
            <q-btn
              :label="getCoupleNames(props.row)"
              flat
              no-caps
              color="primary"
              class="text-weight-medium q-pa-none"
              style="text-align: left; justify-content: flex-start"
              :to="`/couples/${props.row.id}`"
              @click.stop
            />
          </q-td>
        </template>
        <template #body-cell-follower="props">
          <q-td :props="props" class="cursor-pointer">
            <div v-if="getFollowerName(props.row)">
              <q-btn
                :label="getFollowerName(props.row)"
                flat
                dense
                color="secondary"
                size="sm"
                :to="`/teachers/${getFollowerId(props.row)}`"
                v-if="getFollowerId(props.row)"
                @click.stop
              >
                <q-tooltip>View follower profile</q-tooltip>
              </q-btn>
              <span v-else>{{ getFollowerName(props.row) }}</span>
            </div>
            <span v-else class="text-grey-5">-</span>
          </q-td>
        </template>
        <template #body-cell-leader="props">
          <q-td :props="props" class="cursor-pointer">
            <div v-if="getLeaderName(props.row)">
              <q-btn
                :label="getLeaderName(props.row)"
                flat
                dense
                color="primary"
                size="sm"
                :to="`/teachers/${getLeaderId(props.row)}`"
                v-if="getLeaderId(props.row)"
                @click.stop
              >
                <q-tooltip>View leader profile</q-tooltip>
              </q-btn>
              <span v-else>{{ getLeaderName(props.row) }}</span>
            </div>
            <span v-else class="text-grey-5">-</span>
          </q-td>
        </template>
        <template #body-cell-both_roles="props">
          <q-td :props="props" class="cursor-pointer">
            <div v-if="getBothRolesName(props.row)">
              <q-btn
                :label="getBothRolesName(props.row)"
                flat
                dense
                color="purple"
                size="sm"
                :to="`/teachers/${getBothRolesId(props.row)}`"
                v-if="getBothRolesId(props.row)"
                @click.stop
              >
                <q-tooltip>View teacher profile (both roles)</q-tooltip>
              </q-btn>
              <span v-else>{{ getBothRolesName(props.row) }}</span>
            </div>
            <span v-else class="text-grey-5">-</span>
          </q-td>
        </template>
        <template #body-cell-city="props">
          <q-td :props="props" class="cursor-pointer">
            <div v-if="props.row.meta_box?.city" class="location-content">
              <q-icon name="location_city" size="xs" class="q-mr-xs text-primary" />
              {{ props.row.meta_box.city }}
            </div>
            <span v-else class="text-grey-5">—</span>
          </q-td>
        </template>
        <template #body-cell-country="props">
          <q-td :props="props" class="cursor-pointer">
            <div v-if="props.row.meta_box?.country" class="location-content">
              <q-icon name="flag" size="xs" class="q-mr-xs text-secondary" />
              {{ getCountryName(props.row.meta_box.country) }}
            </div>
            <span v-else class="text-grey-5">—</span>
          </q-td>
        </template>
        <template #body-cell-partnership_style="props">
          <q-td :props="props" class="cursor-pointer">
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
        </template>
        <template #body-cell-partnership_started="props">
          <q-td :props="props" class="cursor-pointer">
            <div v-if="props.row.meta_box?.partnership_started" class="text-caption">
              {{ props.row.meta_box.partnership_started }}
            </div>
            <span v-else class="text-grey-5">-</span>
          </q-td>
        </template>
        <template #body-cell-events_count="props">
          <q-td :props="props" class="cursor-pointer">
            <q-badge
              v-if="getEventsCount(props.row) > 0"
              :label="getEventsCount(props.row)"
              color="primary"
              rounded
            />
            <span v-else class="text-grey-5">0</span>
          </q-td>
        </template>
        <template #body-cell-date="props">
          <q-td :props="props" class="cursor-pointer">
            <div class="text-caption">{{ formatDate(props.row.date) }}</div>
          </q-td>
        </template>
      </BaseTable>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import BaseTable from '../components/BaseTable.vue';
import TableNavbar from '../components/TableNavbar.vue';
import { coupleService } from '../services';
import type { Couple } from '../services/types';
import { useFormatters } from '../composables/useFormatters';
import { useCountries } from '../composables/useCountries';

const { formatDate } = useFormatters();
const { getCountryName } = useCountries();

// State
const couples = ref<Couple[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);
const searchQuery = ref('');
const selectedCountry = ref('');
const selectedPartnershipStyle = ref('');
const totalCouples = ref(0);

const pagination = ref({
  sortBy: 'date',
  descending: true,
  page: 1,
  rowsPerPage: 20,
  rowsNumber: 0,
});

// Table columns
const columns = [
  {
    name: 'names',
    label: 'Partnership Name',
    field: (row: Record<string, unknown>) => getCoupleNames(row as unknown as Couple),
    align: 'left' as const,
    sortable: true,
  },
  {
    name: 'follower',
    label: 'Follower',
    field: (row: Record<string, unknown>) => getFollowerName(row as unknown as Couple),
    align: 'left' as const,
    sortable: true,
    style: 'width: 180px',
  },
  {
    name: 'leader',
    label: 'Leader',
    field: (row: Record<string, unknown>) => getLeaderName(row as unknown as Couple),
    align: 'left' as const,
    sortable: true,
    style: 'width: 180px',
  },
  {
    name: 'both_roles',
    label: 'Both/Double Role',
    field: (row: Record<string, unknown>) => getBothRolesName(row as unknown as Couple),
    align: 'left' as const,
    sortable: true,
    style: 'width: 180px',
  },
  {
    name: 'city',
    label: 'City',
    field: (row: Record<string, unknown>) => (row as unknown as Couple).meta_box?.city || '',
    align: 'left' as const,
    style: 'width: 120px',
    sortable: true,
  },
  {
    name: 'country',
    label: 'Country',
    field: (row: Record<string, unknown>) => (row as unknown as Couple).meta_box?.country || '',
    align: 'left' as const,
    style: 'width: 120px',
    sortable: true,
  },
  {
    name: 'partnership_style',
    label: 'Partnership Style',
    field: (row: Record<string, unknown>) =>
      (row as unknown as Couple).meta_box?.partnership_style || '',
    align: 'center' as const,
    sortable: true,
    style: 'width: 140px',
  },
  {
    name: 'partnership_started',
    label: 'Partnership Started',
    field: (row: Record<string, unknown>) =>
      (row as unknown as Couple).meta_box?.partnership_started || '',
    align: 'center' as const,
    sortable: true,
    style: 'width: 120px',
  },
  {
    name: 'events_count',
    label: 'Events',
    field: (row: Record<string, unknown>) => getEventsCount(row as unknown as Couple),
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
    style: 'width: 100px',
  },
];

// Computed properties
const hasActiveFilters = computed(() => {
  return !!(searchQuery.value.trim() || selectedCountry.value || selectedPartnershipStyle.value);
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

// Event handlers - removed since we're using clickable names instead

// Methods

const fetchCouples = async () => {
  try {
    loading.value = true;
    error.value = null;
    const response = await coupleService.getCouples();
    couples.value = response;
    totalCouples.value = response.length;
    pagination.value.rowsNumber = response.length;
  } catch (err) {
    console.error('Error loading couples:', err);
    error.value = 'Failed to load couples';
  } finally {
    loading.value = false;
  }
};

const onRequest = (requestProp: Record<string, unknown>) => {
  const requestProps = requestProp as {
    pagination: { page: number; rowsPerPage: number; sortBy?: string; descending: boolean };
  };
  const { page, rowsPerPage, sortBy, descending } = requestProps.pagination;

  pagination.value.page = page;
  pagination.value.rowsPerPage = rowsPerPage;
  pagination.value.sortBy = sortBy || 'date';
  pagination.value.descending = descending;
};

const onPerPageChange = (newRowsPerPage: number) => {
  pagination.value.rowsPerPage = newRowsPerPage;
  pagination.value.page = 1;
};

const goToPage = (page: number) => {
  pagination.value.page = page;
};

const handleRowClick = (evt: Event, couple: Record<string, unknown>) => {
  // Navigate to couple details page when implemented
  console.log('Navigate to couple:', couple);
};

// Initialize the component
onMounted(() => {
  void fetchCouples();
});
</script>

<style lang="scss" scoped>
.couples-directory {
  background: #fafafa;
  min-height: 100vh;
}

.results-section {
  padding-top: 20px;
}
</style>

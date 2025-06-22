<template>
  <q-page class="couples-directory">
    <!-- Header Section -->
    <ListPageHeader
      title="Couples Directory"
      subtitle="Discover tango couples from around the world"
      :show-stats="true"
      :total-count="totalCouples"
      stats-label="Total Couples"
    />

    <!-- Loading State -->
    <div v-if="loading" class="loading-section q-px-lg">
      <q-card flat bordered>
        <q-card-section class="text-center q-py-xl">
          <q-spinner-dots color="primary" size="3em" />
          <p class="text-subtitle1 q-mt-md text-grey-6">Loading couples...</p>
        </q-card-section>
      </q-card>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-section q-px-lg">
      <q-card flat bordered>
        <q-card-section class="text-center q-py-xl">
          <q-icon name="error_outline" color="negative" size="3em" />
          <p class="text-subtitle1 q-mt-md">{{ error }}</p>
          <q-btn color="primary" @click="retryLoad" label="Retry" class="q-mt-md" />
        </q-card-section>
      </q-card>
    </div>

    <!-- Results Section -->
    <div v-else class="results-section q-px-lg q-pb-lg">
      <q-card flat bordered class="content-card">
        <!-- Search and Filter Controls -->
        <div class="q-pa-md border-bottom">
          <div class="row q-gutter-md items-center">
            <div class="col-12 col-md-6">
              <q-input v-model="searchQuery" filled placeholder="Search couples..." clearable dense>
                <template v-slot:prepend>
                  <q-icon name="search" />
                </template>
              </q-input>
            </div>
            <div class="col-12 col-md-auto">
              <q-btn
                flat
                color="primary"
                icon="refresh"
                label="Reload"
                @click="() => fetchCouples(true)"
                :loading="loading"
              />
            </div>
            <div class="col-12 col-md-auto">
              <q-btn
                v-if="searchQuery.trim()"
                flat
                color="secondary"
                icon="clear"
                label="Clear Search"
                @click="searchQuery = ''"
              />
            </div>
          </div>
        </div>

        <!-- Quasar Table -->
        <q-table
          :rows="couples"
          :columns="columns"
          :loading="loading"
          :pagination="pagination"
          :rows-per-page-options="[10, 20, 50, 100]"
          :filter="searchQuery"
          row-key="id"
          flat
          @row-click="handleRowClick"
          @request="onRequest"
          class="couples-table"
          binary-state-sort
        >
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
        </q-table>
      </q-card>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { coupleService } from '../services';
import type { Couple } from '../services/types';
import { useFormatters } from '../composables/useFormatters';
import { useCountries } from '../composables/useCountries';
import ListPageHeader from '../components/ListPageHeader.vue';

const router = useRouter();
const $q = useQuasar();
const { formatDate } = useFormatters();
const { getCountryName } = useCountries();

// State
const couples = ref<Couple[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);
const totalCouples = ref(0);
const searchQuery = ref('');

// Quasar table pagination
const pagination = ref({
  sortBy: 'date',
  descending: true,
  page: 1,
  rowsPerPage: 20,
  rowsNumber: 0,
});

// Table columns (using Quasar's built-in sorting)
const columns = [
  {
    name: 'names',
    label: 'Partnership Name',
    field: (row: Record<string, unknown>) => getCoupleNames(row as unknown as Couple),
    align: 'left' as const,
    sortable: true,
    style: 'width: 25%;',
  },
  {
    name: 'follower',
    label: 'Follower',
    field: (row: Record<string, unknown>) => getFollowerName(row as unknown as Couple),
    align: 'left' as const,
    sortable: true,
    style: 'width: 15%;',
  },
  {
    name: 'leader',
    label: 'Leader',
    field: (row: Record<string, unknown>) => getLeaderName(row as unknown as Couple),
    align: 'left' as const,
    sortable: true,
    style: 'width: 15%;',
  },
  {
    name: 'both_roles',
    label: 'Both Roles',
    field: (row: Record<string, unknown>) => getBothRolesName(row as unknown as Couple),
    align: 'left' as const,
    sortable: true,
    style: 'width: 15%;',
  },
  {
    name: 'city',
    label: 'City',
    field: (row: Record<string, unknown>) => (row as unknown as Couple).meta_box?.city || '',
    align: 'left' as const,
    sortable: true,
    style: 'width: 10%;',
  },
  {
    name: 'country',
    label: 'Country',
    field: (row: Record<string, unknown>) => (row as unknown as Couple).meta_box?.country || '',
    align: 'left' as const,
    sortable: true,
    style: 'width: 10%;',
  },
  {
    name: 'partnership_style',
    label: 'Style',
    field: (row: Record<string, unknown>) =>
      (row as unknown as Couple).meta_box?.partnership_style || '',
    align: 'center' as const,
    sortable: true,
    style: 'width: 10%;',
  },
  {
    name: 'partnership_started',
    label: 'Started',
    field: (row: Record<string, unknown>) =>
      (row as unknown as Couple).meta_box?.partnership_started || '',
    align: 'center' as const,
    sortable: true,
    style: 'width: 8%;',
  },
  {
    name: 'events_count',
    label: 'Events',
    field: (row: Record<string, unknown>) => getEventsCount(row as unknown as Couple),
    align: 'center' as const,
    sortable: true,
    style: 'width: 8%;',
  },
  {
    name: 'date',
    label: 'Added',
    field: 'date',
    align: 'center' as const,
    sortable: true,
    style: 'width: 10%;',
  },
];

// Helper functions
const getCoupleNames = (couple: Couple): string => {
  return couple.title || 'Unknown Partnership';
};

const getFollowerName = (couple: Couple): string => {
  // Check embedded teachers first
  if (couple._embedded?.teachers) {
    const follower = couple._embedded.teachers.find((t) => t.role === 'follower');
    if (follower) return follower.title;
  }

  // Fallback to direct property
  return couple.follower_name || '';
};

const getLeaderName = (couple: Couple): string => {
  // Check embedded teachers first
  if (couple._embedded?.teachers) {
    const leader = couple._embedded.teachers.find((t) => t.role === 'leader');
    if (leader) return leader.title;
  }

  // Fallback to direct property
  return couple.leader_name || '';
};

const getBothRolesName = (couple: Couple): string => {
  // Check embedded teachers for both roles
  if (couple._embedded?.teachers) {
    const bothRoles = couple._embedded.teachers.find(
      (t) => t.role === 'both' || t.role === 'double-role',
    );
    if (bothRoles) return bothRoles.title;
  }

  return '';
};

const getFollowerId = (couple: Couple): string | null => {
  // Check embedded teachers first
  if (couple._embedded?.teachers) {
    const follower = couple._embedded.teachers.find((t) => t.role === 'follower');
    if (follower) return follower.id.toString();
  }

  // Fallback to direct property
  return couple.follower_id?.toString() || null;
};

const getLeaderId = (couple: Couple): string | null => {
  // Check embedded teachers first
  if (couple._embedded?.teachers) {
    const leader = couple._embedded.teachers.find((t) => t.role === 'leader');
    if (leader) return leader.id.toString();
  }

  // Fallback to direct property
  return couple.leader_id?.toString() || null;
};

const getBothRolesId = (couple: Couple): string | null => {
  // Check embedded teachers for both roles
  if (couple._embedded?.teachers) {
    const bothRoles = couple._embedded.teachers.find(
      (t) => t.role === 'both' || t.role === 'double-role',
    );
    if (bothRoles) return bothRoles.id.toString();
  }

  return null;
};

const getEventsCount = (couple: Couple): number => {
  // Check embedded events
  if (couple._embedded?.events) {
    return couple._embedded.events.length;
  }

  return 0;
};

// Quasar table request handler
const onRequest = (props: {
  pagination: { sortBy?: string; descending: boolean; page: number; rowsPerPage: number };
}) => {
  const { page, rowsPerPage, sortBy, descending } = props.pagination;

  pagination.value.page = page;
  pagination.value.rowsPerPage = rowsPerPage;
  pagination.value.sortBy = sortBy || 'date';
  pagination.value.descending = descending;
  pagination.value.rowsNumber = couples.value.length;
};

// Methods
const fetchCouples = async (showNotification = false) => {
  try {
    loading.value = true;
    error.value = null;

    // Get the first page to retrieve total count, then fetch all if needed
    const response = await coupleService.getCouples();

    // If we have more than 10 items, fetch all of them
    if (response.total > 10) {
      const allResponse = await coupleService.getCouples({ per_page: response.total });
      couples.value = allResponse.couples;
    } else {
      couples.value = response.couples;
    }

    totalCouples.value = couples.value.length;
    pagination.value.rowsNumber = couples.value.length;

    if (showNotification) {
      $q?.notify?.({
        type: 'positive',
        message: 'Couples refreshed successfully',
        position: 'top',
        timeout: 2000,
      });
    }
  } catch (err) {
    console.error('Error loading couples:', err);
    error.value = 'Failed to load couples';
  } finally {
    loading.value = false;
  }
};

const handleRowClick = (evt: Event, row: Record<string, unknown>) => {
  const couple = row as unknown as Couple;
  void router.push(`/couples/${couple.id}`);
};

const retryLoad = () => {
  error.value = null;
  void fetchCouples();
};

onMounted(() => {
  void fetchCouples();
});
</script>

<style lang="scss" scoped>
.couples-directory {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;
}

.loading-section,
.error-section {
  margin-bottom: 16px;
}

.content-card {
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.border-bottom {
  border-bottom: 1px solid #e0e0e0;
}

.couples-table {
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

.location-content {
  display: flex;
  align-items: center;
  font-size: 13px;

  .q-icon {
    opacity: 0.8;
  }
}
</style>

<template>
  <q-page class="teachers-directory">
    <!-- Header Section -->
    <ListPageHeader
      title="Teachers Directory"
      subtitle="Discover tango teachers from around the world"
      :show-stats="true"
      :total-count="totalTeachers"
      stats-label="Total Teachers"
    />

    <!-- Loading State -->
    <div v-if="loading" class="loading-section q-px-lg">
      <q-card flat bordered>
        <q-card-section class="text-center q-py-xl">
          <q-spinner-dots color="primary" size="3em" />
          <p class="text-subtitle1 q-mt-md text-grey-6">Loading teachers...</p>
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
              <q-input
                v-model="searchQuery"
                filled
                placeholder="Search teachers..."
                clearable
                dense
              >
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
                @click="() => fetchTeachers(true)"
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
          :rows="teachers"
          :columns="columns"
          :loading="loading"
          :pagination="pagination"
          :rows-per-page-options="[10, 20, 50, 100]"
          :filter="searchQuery"
          row-key="id"
          flat
          @row-click="handleRowClick"
          @request="onRequest"
          class="teachers-table"
          binary-state-sort
        >
          <template #body-cell-name="props">
            <q-td :props="props" class="cursor-pointer">
              <q-btn
                :label="getTeacherName(props.row)"
                flat
                no-caps
                color="primary"
                class="text-weight-medium q-pa-none"
                style="text-align: left; justify-content: flex-start"
                :to="`/teachers/${props.row.id}`"
                @click.stop
              />
            </q-td>
          </template>

          <template #body-cell-role="props">
            <q-td :props="props" class="cursor-pointer">
              <q-chip
                v-if="props.row.meta_box?.role"
                :label="formatRole(props.row.meta_box.role)"
                :color="getRoleColor(props.row.meta_box.role)"
                text-color="white"
                size="sm"
                dense
              />
              <span v-else class="text-grey-5">-</span>
            </q-td>
          </template>

          <template #body-cell-gender="props">
            <q-td :props="props" class="cursor-pointer">
              <q-icon
                v-if="props.row.meta_box?.gender"
                :name="getGenderIcon(props.row.meta_box.gender)"
                :color="getGenderColor(props.row.meta_box.gender)"
                size="sm"
              >
                <q-tooltip>{{ formatGender(props.row.meta_box.gender) }}</q-tooltip>
              </q-icon>
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

          <template #body-cell-specializations="props">
            <q-td :props="props" class="cursor-pointer">
              <div
                v-if="props.row.meta_box?.specializations?.length"
                class="specializations-container"
              >
                <q-chip
                  v-for="spec in props.row.meta_box.specializations.slice(0, 2)"
                  :key="spec"
                  :label="spec"
                  color="purple"
                  text-color="white"
                  size="xs"
                  dense
                  class="q-mr-xs"
                />
                <q-chip
                  v-if="props.row.meta_box.specializations.length > 2"
                  :label="`+${props.row.meta_box.specializations.length - 2}`"
                  color="grey"
                  text-color="white"
                  size="xs"
                  dense
                >
                  <q-tooltip>
                    All specializations: {{ props.row.meta_box.specializations.join(', ') }}
                  </q-tooltip>
                </q-chip>
              </div>
              <span v-else class="text-grey-5">-</span>
            </q-td>
          </template>

          <template #body-cell-teaching_since="props">
            <q-td :props="props" class="cursor-pointer">
              <div v-if="props.row.meta_box?.teaching_since" class="text-caption">
                {{ props.row.meta_box.teaching_since }}
              </div>
              <span v-else class="text-grey-5">-</span>
            </q-td>
          </template>

          <template #body-cell-dancing_since="props">
            <q-td :props="props" class="cursor-pointer">
              <div v-if="props.row.meta_box?.dancing_since" class="text-caption">
                {{ props.row.meta_box.dancing_since }}
              </div>
              <span v-else class="text-grey-5">-</span>
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
import { teacherService } from '../services';
import type { Teacher } from '../services/types';
import { useFormatters } from '../composables/useFormatters';
import { useCountries } from '../composables/useCountries';
import ListPageHeader from '../components/ListPageHeader.vue';

const router = useRouter();
const $q = useQuasar();
const { formatDate } = useFormatters();
const { getCountryName } = useCountries();

// State
const teachers = ref<Teacher[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);
const totalTeachers = ref(0);
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
    name: 'name',
    label: 'Name',
    field: (row: Record<string, unknown>) => getTeacherName(row as unknown as Teacher),
    align: 'left' as const,
    sortable: true,
    style: 'width: 25%;',
  },
  {
    name: 'role',
    label: 'Role',
    field: (row: Record<string, unknown>) => (row as unknown as Teacher).meta_box?.role || '',
    align: 'center' as const,
    sortable: true,
    style: 'width: 10%;',
  },
  {
    name: 'gender',
    label: 'Gender',
    field: (row: Record<string, unknown>) => (row as unknown as Teacher).meta_box?.gender || '',
    align: 'center' as const,
    sortable: true,
    style: 'width: 8%;',
  },
  {
    name: 'city',
    label: 'City',
    field: (row: Record<string, unknown>) => (row as unknown as Teacher).meta_box?.city || '',
    align: 'left' as const,
    sortable: true,
    style: 'width: 12%;',
  },
  {
    name: 'country',
    label: 'Country',
    field: (row: Record<string, unknown>) => (row as unknown as Teacher).meta_box?.country || '',
    align: 'left' as const,
    sortable: true,
    style: 'width: 12%;',
  },
  {
    name: 'specializations',
    label: 'Specializations',
    field: (row: Record<string, unknown>) =>
      (row as unknown as Teacher).meta_box?.specializations?.join(', ') || '',
    align: 'left' as const,
    sortable: true,
    style: 'width: 20%;',
  },
  {
    name: 'teaching_since',
    label: 'Teaching Since',
    field: (row: Record<string, unknown>) =>
      (row as unknown as Teacher).meta_box?.teaching_since || '',
    align: 'center' as const,
    sortable: true,
    style: 'width: 10%;',
  },
  {
    name: 'dancing_since',
    label: 'Dancing Since',
    field: (row: Record<string, unknown>) =>
      (row as unknown as Teacher).meta_box?.dancing_since || '',
    align: 'center' as const,
    sortable: true,
    style: 'width: 10%;',
  },
  {
    name: 'date',
    label: 'Added',
    field: 'date',
    align: 'center' as const,
    sortable: true,
    style: 'width: 8%;',
  },
];

// Helper functions
const getTeacherName = (teacher: Teacher): string => {
  if (teacher.meta_box?.first_name && teacher.meta_box?.last_name) {
    return `${teacher.meta_box.first_name} ${teacher.meta_box.last_name}`;
  }

  if (teacher.meta_box?.nickname) {
    return teacher.meta_box.nickname;
  }

  return teacher.title || 'Unknown Teacher';
};

const formatRole = (role: string): string => {
  return role.charAt(0).toUpperCase() + role.slice(1);
};

const getRoleColor = (role: string): string => {
  switch (role.toLowerCase()) {
    case 'leader':
      return 'primary';
    case 'follower':
      return 'secondary';
    case 'both':
      return 'purple';
    default:
      return 'grey';
  }
};

const formatGender = (gender: string): string => {
  switch (gender.toLowerCase()) {
    case 'm':
    case 'male':
      return 'Male';
    case 'f':
    case 'female':
      return 'Female';
    case 'nb':
    case 'non-binary':
      return 'Non-binary';
    default:
      return gender;
  }
};

const getGenderIcon = (gender: string): string => {
  switch (gender.toLowerCase()) {
    case 'm':
    case 'male':
      return 'male';
    case 'f':
    case 'female':
      return 'female';
    case 'nb':
    case 'non-binary':
      return 'transgender';
    default:
      return 'person';
  }
};

const getGenderColor = (gender: string): string => {
  switch (gender.toLowerCase()) {
    case 'm':
    case 'male':
      return 'blue';
    case 'f':
    case 'female':
      return 'pink';
    case 'nb':
    case 'non-binary':
      return 'purple';
    default:
      return 'grey';
  }
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
  pagination.value.rowsNumber = teachers.value.length;
};

// Methods
const fetchTeachers = async (showNotification = false) => {
  try {
    loading.value = true;
    error.value = null;

    // Get the first page to retrieve total count, then fetch all if needed
    const response = await teacherService.getTeachers();

    // If we have more than 10 items, fetch all of them
    if (response.total > 10) {
      const allResponse = await teacherService.getTeachers({ per_page: response.total });
      teachers.value = allResponse.teachers;
    } else {
      teachers.value = response.teachers;
    }

    totalTeachers.value = teachers.value.length;
    pagination.value.rowsNumber = teachers.value.length;

    if (showNotification) {
      $q?.notify?.({
        type: 'positive',
        message: 'Teachers refreshed successfully',
        position: 'top',
        timeout: 2000,
      });
    }
  } catch (err) {
    console.error('Error loading teachers:', err);
    error.value = 'Failed to load teachers';
  } finally {
    loading.value = false;
  }
};

const handleRowClick = (evt: Event, row: Record<string, unknown>) => {
  const teacher = row as unknown as Teacher;
  void router.push(`/teachers/${teacher.id}`);
};

const retryLoad = () => {
  error.value = null;
  void fetchTeachers();
};

onMounted(() => {
  void fetchTeachers();
});
</script>

<style lang="scss" scoped>
.teachers-directory {
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

.teachers-table {
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

.specializations-container {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}
</style>

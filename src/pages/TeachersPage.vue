<template>
  <q-page class="teachers-list-page">
    <!-- Header -->
    <div class="page-header q-pa-lg">
      <div class="row items-center justify-between">
        <div class="col">
          <h1 class="text-h4 text-weight-bold q-mb-xs">Teachers Directory</h1>
          <p class="text-subtitle1 text-grey-6 q-ma-none">
            {{ pagination.rowsNumber.toLocaleString() }} /
            {{ totalCount.toLocaleString() }} teachers found based on filters
          </p>
        </div>
        <div class="col-auto">
          <q-btn round color="primary" icon="refresh" @click="refreshData" :loading="loading">
            <q-tooltip>Refresh Teachers</q-tooltip>
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
                placeholder="Search teachers, cities, or countries..."
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

            <!-- Teacher Type Filter -->
            <div class="col-12 col-md-4">
              <q-select
                v-model="selectedTeacherType"
                :options="teacherTypeOptions"
                label="Filter by Teacher Type"
                dense
                outlined
                clearable
                emit-value
                map-options
                @update:model-value="onFilterChange"
              >
                <template v-slot:prepend>
                  <q-icon name="school" />
                </template>
              </q-select>
            </div>

            <!-- Clear Filters -->
            <div class="col-12 col-md-1">
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
              v-if="selectedTeacherType"
              removable
              @remove="clearTeacherTypeFilter"
              size="sm"
              icon="school"
            >
              {{ getTeacherTypeLabel(selectedTeacherType) }}
            </q-chip>
            <q-chip v-if="searchQuery" removable @remove="clearSearch" size="sm" icon="search">
              Search: "{{ searchQuery }}"
            </q-chip>
          </div>
        </q-card-section>
      </q-card>
    </div>

    <!-- Teachers Table -->
    <div class="table-section q-px-lg q-pb-lg">
      <q-card flat bordered class="table-card">
        <q-table
          :rows="teachers"
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
          class="teachers-table"
        >
          <!-- Custom Cell Templates -->
          <template #body-cell-name="props">
            <q-td :props="props" class="teacher-name-cell cursor-pointer">
              <div class="teacher-name-content">
                <div class="teacher-name text-weight-medium">
                  {{ formatText(props.row.title) }}
                </div>
                <div
                  v-if="
                    props.row.meta_box?.nickname && props.row.meta_box.nickname !== props.row.title
                  "
                  class="teacher-real-name text-caption text-grey-6"
                >
                  {{ formatText(props.row.meta_box.nickname) }}
                </div>
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

          <template #body-cell-teacher_type="props">
            <q-td :props="props" class="teacher-type-cell cursor-pointer">
              <q-chip
                v-if="props.row.teacher_type"
                size="sm"
                :color="getTeacherTypeColor(props.row.teacher_type)"
                text-color="white"
                :icon="getTeacherTypeIcon(props.row.teacher_type)"
              >
                {{ getTeacherTypeLabel(props.row.teacher_type) }}
              </q-chip>
              <span v-else class="text-grey-5">—</span>
            </q-td>
          </template>

          <template #body-cell-status="props">
            <q-td :props="props" class="cursor-pointer">
              <span>{{ getStatusLabel(props.row.status) }}</span>
            </q-td>
          </template>

          <!-- No Data State -->
          <template #no-data>
            <div class="text-center q-py-xl">
              <q-icon name="school" size="4em" color="grey-4" />
              <p class="text-h6 q-mt-md text-grey-6">No teachers found</p>
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
        Failed to load teachers
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
import { teacherService, type Teacher } from '../services';
import { useFormatters } from '../composables/useFormatters';
import { useCountries } from '../composables/useCountries';

const router = useRouter();
const $q = useQuasar();

// Composables
const { getCountryName, getCountryOptionsFromCodes } = useCountries();
const { formatText } = useFormatters();

// State
const teachers = ref<Teacher[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);
const searchQuery = ref('');
const selectedCountry = ref<string | null>(null);
const selectedTeacherType = ref<string | null>(null);
const allCountries = ref<Set<string>>(new Set());
const totalCount = ref(0);

// Computed
const countryOptions = computed(() => getCountryOptionsFromCodes(allCountries.value));

const teacherTypeOptions = computed(() => [
  { label: 'Leader', value: 'leader' },
  { label: 'Follower', value: 'follower' },
  { label: 'Both', value: 'both' },
  { label: 'Double Role', value: 'double-role' },
]);

const hasActiveFilters = computed(() => {
  return searchQuery.value || selectedCountry.value || selectedTeacherType.value;
});

// Table columns
const columns = [
  {
    name: 'name',
    label: 'Teacher Name',
    field: 'title',
    align: 'left' as const,
    sortable: true,
    style: 'min-width: 250px',
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
    name: 'teacher_type',
    label: 'Teacher Type',
    field: 'teacher_type',
    align: 'center' as const,
    sortable: true,
    style: 'min-width: 120px',
  },
  {
    name: 'status',
    label: 'Status',
    field: 'status',
    align: 'center' as const,
    sortable: true,
    style: 'min-width: 100px',
  },
];

// Pagination state
const pagination = ref({
  sortBy: 'name',
  descending: false,
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

const getStatusLabel = (status: string): string => {
  switch (status?.toLowerCase()) {
    case 'publish':
      return 'Published';
    case 'draft':
      return 'Draft';
    case 'private':
      return 'Private';
    default:
      return 'Unknown';
  }
};

const getTeacherTypeLabel = (teacherType: string): string => {
  switch (teacherType) {
    case 'leader':
      return 'Leader';
    case 'follower':
      return 'Follower';
    case 'both':
      return 'Both';
    case 'double-role':
      return 'Double Role';
    default:
      return teacherType;
  }
};

const getTeacherTypeColor = (teacherType: string): string => {
  switch (teacherType) {
    case 'leader':
      return 'blue-6';
    case 'follower':
      return 'pink-6';
    case 'both':
      return 'purple-6';
    case 'double-role':
      return 'orange-6';
    default:
      return 'grey-6';
  }
};

const getTeacherTypeIcon = (teacherType: string): string => {
  switch (teacherType) {
    case 'leader':
      return 'person';
    case 'follower':
      return 'person_outline';
    case 'both':
      return 'group';
    case 'double-role':
      return 'swap_horiz';
    default:
      return 'school';
  }
};

const updateCountrySet = (teachers: Teacher[]) => {
  teachers.forEach((teacher) => {
    if (teacher.country) allCountries.value.add(teacher.country);
  });
};

// API functions
const loadTeachers = async (forceReload = false) => {
  loading.value = true;
  error.value = null;

  try {
    const params: Record<string, unknown> = {
      page: pagination.value.page,
      perPage: pagination.value.rowsPerPage,
      orderby: pagination.value.sortBy === 'name' ? 'title' : pagination.value.sortBy,
      order: pagination.value.descending ? 'desc' : 'asc',
      meta_fields: 'country,city,teacher_type',
    };

    if (selectedCountry.value) {
      params.country = selectedCountry.value;
    }
    if (selectedTeacherType.value) {
      params.teacher_type = selectedTeacherType.value;
    }
    if (searchQuery.value) {
      params.search = searchQuery.value;
    }
    if (forceReload) {
      params._t = Date.now();
    }

    const response = await teacherService.getTeachers(params);

    teachers.value = response.teachers;
    pagination.value.rowsNumber = response.total;

    // Load total count without filters if we don't have it yet or if it's a fresh load
    if (totalCount.value === 0 || forceReload) {
      try {
        const totalParams = {
          page: 1,
          perPage: 1,
          orderby: 'title' as const,
          order: 'asc' as const,
          meta_fields: 'country,city,teacher_type',
        };
        const totalResponse = await teacherService.getTeachers(totalParams);
        totalCount.value = totalResponse.total;
      } catch (totalErr) {
        console.warn('Failed to load total count:', totalErr);
        totalCount.value = response.total;
      }
    }

    updateCountrySet(response.teachers);

    if (forceReload) {
      $q.notify({
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

// Event handlers
const onRequest = async (requestProp: {
  pagination: { page: number; rowsPerPage: number; sortBy?: string; descending: boolean };
}) => {
  const { page, rowsPerPage, sortBy, descending } = requestProp.pagination;

  pagination.value.page = page;
  pagination.value.rowsPerPage = rowsPerPage;
  pagination.value.sortBy = sortBy || 'name';
  pagination.value.descending = descending;

  await loadTeachers();
};

const handleRowClick = (evt: Event, row: Record<string, unknown>) => {
  const teacherId = row.id as number;
  void router.push(`/teachers/${teacherId}`);
};

const refreshData = () => {
  void loadTeachers(true);
};

const onSearchChange = () => {
  pagination.value.page = 1;
  void loadTeachers();
};

const onFilterChange = () => {
  pagination.value.page = 1;
  void loadTeachers();
};

const clearFilters = () => {
  searchQuery.value = '';
  selectedCountry.value = null;
  selectedTeacherType.value = null;
  pagination.value.page = 1;
  void loadTeachers();
};

const clearCountryFilter = () => {
  selectedCountry.value = null;
  onFilterChange();
};

const clearTeacherTypeFilter = () => {
  selectedTeacherType.value = null;
  onFilterChange();
};

const clearSearch = () => {
  searchQuery.value = '';
  onSearchChange();
};

// Watchers
watch(
  [selectedCountry, selectedTeacherType],
  () => {
    pagination.value.page = 1;
    void loadTeachers();
  },
  { deep: true },
);

// Lifecycle
onMounted(() => {
  void loadTeachers();
});
</script>

<style lang="scss" scoped>
.teachers-list-page {
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

  .teachers-table {
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
        color: rgba(0, 0, 0, 0.7);
        transition: all 0.2s ease;

        &.q-table__sort-icon--active {
          color: black;
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

.teacher-name-cell {
  .teacher-name-content {
    .teacher-name {
      font-size: 14px;
      line-height: 1.4;
      max-width: none;
      white-space: normal;
      overflow: visible;
      text-overflow: initial;
    }

    .teacher-real-name {
      margin-top: 2px;
      font-size: 11px;
    }
  }
}

.city-cell,
.country-cell {
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

.teacher-type-cell {
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
    .teachers-table {
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

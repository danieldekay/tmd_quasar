<template>
  <q-page class="teachers-directory">
    <!-- Results Section -->
    <div class="results-section q-px-lg q-pb-lg">
      <BaseTable
        :rows="teachers"
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
            :total-count="totalTeachers"
            :has-active-filters="hasActiveFilters"
            :current-page="pagination.page"
            :total-pages="Math.ceil(pagination.rowsNumber / pagination.rowsPerPage)"
            :rows-per-page="pagination.rowsPerPage"
            :loading="loading"
            item-name="teacher"
            @reload="loadTeachers"
            @update:rows-per-page="onPerPageChange"
            @update:current-page="goToPage"
          />
        </template>
        <template #body-cell-photo="props">
          <q-td :props="props">
            <q-avatar size="40px">
              <img
                :src="getTeacherPhoto()"
                :alt="`Photo of ${getTeacherName(props.row)}`"
                @error="handleImageError"
              />
            </q-avatar>
          </q-td>
        </template>
        <template #body-cell-name="props">
          <q-td :props="props" class="cursor-pointer">
            <div class="text-weight-medium">{{ getTeacherName(props.row) }}</div>
          </q-td>
        </template>
        <template #body-cell-location="props">
          <q-td :props="props" class="cursor-pointer">
            <div v-if="props.row.meta_box?.city || props.row.meta_box?.country">
              <q-icon name="place" size="xs" class="q-mr-xs" />
              {{ getLocationText(props.row) }}
            </div>
            <span v-else class="text-grey-5">-</span>
          </q-td>
        </template>
        <template #body-cell-role="props">
          <q-td :props="props" class="cursor-pointer">
            <q-chip
              v-if="props.row.meta_box?.role"
              :label="props.row.meta_box.role"
              :color="props.row.meta_box.role === 'leader' ? 'blue' : 'pink'"
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
              :name="props.row.meta_box.gender === 'man' ? 'male' : 'female'"
              :color="props.row.meta_box.gender === 'man' ? 'blue' : 'pink'"
              size="sm"
            />
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
        <template #body-cell-couples_count="props">
          <q-td :props="props" class="cursor-pointer">
            <q-badge
              v-if="getCouplesCount(props.row) > 0"
              :label="getCouplesCount(props.row)"
              color="secondary"
              rounded
            />
            <span v-else class="text-grey-5">0</span>
          </q-td>
        </template>
        <template #body-cell-website="props">
          <q-td :props="props" class="cursor-pointer">
            <q-btn
              v-if="props.row.meta_box?.website"
              flat
              round
              color="secondary"
              icon="launch"
              size="sm"
              :href="props.row.meta_box.website"
              target="_blank"
              @click.stop
            >
              <q-tooltip>Visit Website</q-tooltip>
            </q-btn>
            <span v-else class="text-grey-5">-</span>
          </q-td>
        </template>
        <template #body-cell-date="props">
          <q-td :props="props" class="cursor-pointer">
            <div class="text-caption">{{ formatDate(props.row.date) }}</div>
          </q-td>
        </template>
        <template #body-cell-actions="props">
          <q-td :props="props" class="cursor-pointer">
            <div class="row q-gutter-xs">
              <q-btn
                flat
                round
                color="primary"
                icon="visibility"
                size="sm"
                :to="`/teachers/${props.row.id}`"
                @click.stop
              >
                <q-tooltip>View Details</q-tooltip>
              </q-btn>
              <q-btn
                flat
                round
                color="secondary"
                icon="edit"
                size="sm"
                @click.stop="editTeacher(props.row)"
              >
                <q-tooltip>Edit Teacher</q-tooltip>
              </q-btn>
            </div>
          </q-td>
        </template>
      </BaseTable>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import BaseTable from '../components/BaseTable.vue';
import TableNavbar from '../components/TableNavbar.vue';
import { teacherService } from '../services';
import type { Teacher } from '../services/types';
import { useFormatters } from '../composables/useFormatters';
import { useCountries } from '../composables/useCountries';

const router = useRouter();
const { formatDate } = useFormatters();
const { getCountryName } = useCountries();

// State
const teachers = ref<Teacher[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);
const searchQuery = ref('');
const selectedCountry = ref('');
const selectedRole = ref('');
const selectedGender = ref('');
const totalTeachers = ref(0);

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
    name: 'photo',
    label: 'Photo',
    field: 'photo',
    align: 'center' as const,
    sortable: false,
    style: 'width: 60px',
  },
  {
    name: 'name',
    label: 'Name',
    field: (row: Teacher) => getTeacherName(row),
    align: 'left' as const,
    sortable: true,
  },
  {
    name: 'location',
    label: 'Location',
    field: (row: Teacher) => getLocationText(row),
    align: 'left' as const,
    sortable: true,
  },
  {
    name: 'role',
    label: 'Role',
    field: (row: Teacher) => row.meta_box?.role || '',
    align: 'center' as const,
    sortable: true,
    style: 'width: 100px',
  },
  {
    name: 'gender',
    label: 'Gender',
    field: (row: Teacher) => row.meta_box?.gender || '',
    align: 'center' as const,
    sortable: true,
    style: 'width: 80px',
  },
  {
    name: 'events_count',
    label: 'Events',
    field: (row: Teacher) => getEventsCount(row),
    align: 'center' as const,
    sortable: true,
    style: 'width: 80px',
  },
  {
    name: 'couples_count',
    label: 'Couples',
    field: (row: Teacher) => getCouplesCount(row),
    align: 'center' as const,
    sortable: true,
    style: 'width: 80px',
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
    style: 'width: 100px',
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

// Computed properties
const hasActiveFilters = computed(() => {
  return !!(
    searchQuery.value.trim() ||
    selectedCountry.value ||
    selectedRole.value ||
    selectedGender.value
  );
});

// Methods
const loadTeachers = async () => {
  try {
    loading.value = true;
    error.value = null;
    const response = await teacherService.getTeachers({ per_page: 999 });
    teachers.value = response;
    totalTeachers.value = response.length;
    pagination.value.rowsNumber = response.length;
  } catch (err) {
    console.error('Error loading teachers:', err);
    error.value = 'Failed to load teachers';
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

  // For now, we'll just use client-side pagination since we load all teachers
  // In the future, this could be enhanced to use server-side pagination
};

const onPerPageChange = (newRowsPerPage: number) => {
  pagination.value.rowsPerPage = newRowsPerPage;
  pagination.value.page = 1;
};

const goToPage = (page: number) => {
  pagination.value.page = page;
};

const handleRowClick = (evt: Event, teacher: Teacher) => {
  void router.push(`/teachers/${teacher.id}`);
};

// Helper functions
const getEventsCount = (teacher: Teacher): number => {
  if (teacher._embedded?.events) {
    return teacher._embedded.events.length;
  }
  return 0;
};

const getCouplesCount = (teacher: Teacher): number => {
  if (teacher._embedded?.couples) {
    return teacher._embedded.couples.length;
  }
  return 0;
};

const getTeacherName = (teacher: Teacher): string => {
  const firstName = teacher.meta_box?.first_name || '';
  const lastName = teacher.meta_box?.last_name || '';
  return `${firstName} ${lastName}`.trim() || teacher.title || 'Unknown';
};

const getLocationText = (teacher: Teacher): string => {
  const city = teacher.meta_box?.city || '';
  const country = teacher.meta_box?.country || '';
  const countryName = country ? getCountryName(country) : '';
  return [city, countryName].filter(Boolean).join(', ');
};

const getTeacherPhoto = (): string => {
  return 'https://cdn.quasar.dev/img/avatar.png';
};

const editTeacher = (teacher: Teacher) => {
  void router.push(`/teachers/${teacher.id}/edit`);
};

const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement;
  if (target) {
    target.src = 'https://cdn.quasar.dev/img/avatar.png';
  }
};

// Initialize the component
onMounted(() => {
  void loadTeachers();
});
</script>

<style lang="scss" scoped>
.teachers-directory {
  background: #fafafa;
  min-height: 100vh;
}

.results-section {
  padding-top: 20px;
}
</style>

<style lang="scss" scoped>
// Any custom styles if needed
</style>

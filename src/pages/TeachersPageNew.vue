<template>
  <BaseListPage
    title="Teachers"
    subtitle="Discover talented tango teachers from around the world"
    :total-count="teachers.length"
    stats-label="Total Teachers"
    :loading="loading"
    :error="error"
    :show-empty-state="teachers.length === 0 && !loading && !error"
    empty-state-icon="school"
    empty-state-title="No Teachers Found"
    empty-state-message="There are no teachers to display at the moment."
    :search-query="searchQuery"
    :has-active-filters="hasActiveFilters"
    :active-filter-count="activeFilterCount"
    :display-count="teachers.length"
    :current-page="pagination.currentPage.value"
    :total-pages="pagination.totalPages.value"
    :show-pagination="pagination.totalPages.value > 1"
    @update:search-query="updateFilter('searchQuery', $event)"
    @clear-filters="clearFilters"
    @retry="() => loadTeachers(true)"
  >
    <template #filters>
      <div class="col-12 col-md-4">
        <q-select
          :model-value="selectedCountry"
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
          :model-value="selectedRole"
          :options="roleOptions"
          outlined
          dense
          placeholder="Filter by role"
          clearable
          emit-value
          map-options
          @update:model-value="updateFilter('role', $event || '')"
        >
          <template #prepend>
            <q-icon name="person" />
          </template>
        </q-select>
      </div>
      <div class="col-12 col-md-4">
        <q-select
          :model-value="selectedGender"
          :options="genderOptions"
          outlined
          dense
          placeholder="Filter by gender"
          clearable
          emit-value
          map-options
          @update:model-value="updateFilter('gender', $event || '')"
        >
          <template #prepend>
            <q-icon name="wc" />
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
        @remove="updateFilter('country', '')"
      />
      <q-chip
        v-if="selectedRole"
        removable
        color="secondary"
        text-color="white"
        :label="`Role: ${selectedRole}`"
        @remove="updateFilter('role', '')"
      />
      <q-chip
        v-if="selectedGender"
        removable
        color="accent"
        text-color="white"
        :label="`Gender: ${selectedGender}`"
        @remove="updateFilter('gender', '')"
      />
    </template>

    <template #content>
      <BaseTable
        :rows="paginatedTeachers"
        :columns="columns"
        :loading="loading"
        :error="error"
        :current-page="pagination.currentPage.value"
        :rows-per-page="pagination.rowsPerPage.value"
        :total-items="filteredTeachers.length"
        :show-top-pagination="true"
        row-key="id"
        @update:current-page="pagination.goToPage"
        @update:rows-per-page="pagination.setRowsPerPage"
        @row-click="handleRowClick"
      >
        <template #body="{ props }">
          <q-td key="photo" :props="props">
            <q-avatar size="40px">
              <img
                :src="getTeacherPhoto()"
                :alt="`Photo of ${getTeacherName(props.row)}`"
                @error="handleImageError"
              />
            </q-avatar>
          </q-td>
          <q-td key="name" :props="props">
            <div class="text-weight-medium">{{ getTeacherName(props.row) }}</div>
          </q-td>
          <q-td key="location" :props="props">
            <div v-if="props.row.meta_box?.city || props.row.meta_box?.country">
              <q-icon name="place" size="xs" class="q-mr-xs" />
              {{ getLocationText(props.row) }}
            </div>
            <span v-else class="text-grey-5">-</span>
          </q-td>
          <q-td key="role" :props="props">
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
          <q-td key="gender" :props="props">
            <q-icon
              v-if="props.row.meta_box?.gender"
              :name="props.row.meta_box.gender === 'man' ? 'male' : 'female'"
              :color="props.row.meta_box.gender === 'man' ? 'blue' : 'pink'"
              size="sm"
            />
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
          <q-td key="couples_count" :props="props">
            <q-badge
              v-if="getCouplesCount(props.row) > 0"
              :label="getCouplesCount(props.row)"
              color="secondary"
              rounded
            />
            <span v-else class="text-grey-5">0</span>
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
                :to="`/teachers/${props.row.id}`"
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
    </template>
  </BaseListPage>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import BaseListPage from '../components/BaseListPage.vue';
import BaseTable from '../components/BaseTable.vue';
import { useTablePagination } from '../composables/useTablePagination';
import { teacherService } from '../services';
import type { Teacher } from '../services/types';
import { useFormatters } from '../composables/useFormatters';
import { useCountries } from '../composables/useCountries';

const router = useRouter();
const { formatDate } = useFormatters();
const { getCountryName } = useCountries();

// Pagination
const pagination = useTablePagination({
  initialRowsPerPage: 20,
  rowsPerPageOptions: [10, 20, 50, 100],
});

// State
const teachers = ref<Teacher[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);
const searchQuery = ref('');
const selectedCountry = ref('');
const selectedRole = ref('');
const selectedGender = ref('');

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

// Computed properties for filtering and pagination
const filteredTeachers = computed(() => {
  let filtered = teachers.value;

  // Apply search filter
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim();
    filtered = filtered.filter((teacher) => {
      const name = getTeacherName(teacher).toLowerCase();
      const location = getLocationText(teacher).toLowerCase();
      return name.includes(query) || location.includes(query);
    });
  }

  // Apply country filter
  if (selectedCountry.value) {
    filtered = filtered.filter((teacher) => teacher.meta_box?.country === selectedCountry.value);
  }

  // Apply role filter
  if (selectedRole.value) {
    filtered = filtered.filter((teacher) => teacher.meta_box?.role === selectedRole.value);
  }

  // Apply gender filter
  if (selectedGender.value) {
    filtered = filtered.filter((teacher) => teacher.meta_box?.gender === selectedGender.value);
  }

  return filtered;
});

const paginatedTeachers = computed(() => {
  const start = (pagination.currentPage.value - 1) * pagination.rowsPerPage.value;
  const end = start + pagination.rowsPerPage.value;
  return filteredTeachers.value.slice(start, end);
});

const hasActiveFilters = computed(() => {
  return !!(
    searchQuery.value.trim() ||
    selectedCountry.value ||
    selectedRole.value ||
    selectedGender.value
  );
});

const activeFilterCount = computed(() => {
  let count = 0;
  if (searchQuery.value.trim()) count++;
  if (selectedCountry.value) count++;
  if (selectedRole.value) count++;
  if (selectedGender.value) count++;
  return count;
});

// Filter options
const countryOptions = computed(() => {
  const countries = new Set<string>();
  teachers.value.forEach((teacher) => {
    if (teacher.meta_box?.country) {
      countries.add(teacher.meta_box.country);
    }
  });
  return Array.from(countries)
    .map((code) => ({
      label: getCountryName(code),
      value: code,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
});

const roleOptions = [
  { label: 'Leader', value: 'leader' },
  { label: 'Follower', value: 'follower' },
];

const genderOptions = [
  { label: 'Man', value: 'man' },
  { label: 'Woman', value: 'woman' },
];

// Helper functions
const getEventsCount = (teacher: Teacher): number => {
  // Check if teacher has embedded events
  if (teacher._embedded?.events) {
    return teacher._embedded.events.length;
  }
  // For now, return 0 as teachers don't seem to have direct event links
  // This could be enhanced later with a separate API call
  return 0;
};

const getCouplesCount = (teacher: Teacher): number => {
  // Check if teacher has embedded couples
  if (teacher._embedded?.couples) {
    return teacher._embedded.couples.length;
  }
  // For now, return 0 as teachers don't seem to have direct couple links
  // This could be enhanced later with a separate API call
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
  // TODO: Add proper photo field when available
  return 'https://cdn.quasar.dev/img/avatar.png';
};

// Methods
const loadTeachers = async (showNotification = false) => {
  try {
    loading.value = true;
    error.value = null;
    teachers.value = await teacherService.getTeachers({ per_page: 999 });

    if (showNotification) {
      // Add notification if you have useQuasar available
    }
  } catch (err) {
    console.error('Error loading teachers:', err);
    error.value = 'Failed to load teachers';
  } finally {
    loading.value = false;
  }
};

const clearFilters = () => {
  searchQuery.value = '';
  selectedCountry.value = '';
  selectedRole.value = '';
  selectedGender.value = '';
  pagination.goToFirstPage();
};

const updateFilter = (field: string, value: string) => {
  switch (field) {
    case 'searchQuery':
      searchQuery.value = value;
      break;
    case 'country':
      selectedCountry.value = value;
      break;
    case 'role':
      selectedRole.value = value;
      break;
    case 'gender':
      selectedGender.value = value;
      break;
  }
  pagination.goToFirstPage();
};

// Event handlers
const handleRowClick = (teacher: Teacher) => {
  void router.push(`/teachers/${teacher.id}`);
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

// Watch for changes in filtered results to update pagination
watch(filteredTeachers, (newResults) => {
  pagination.setTotalItems(newResults.length);
});

// Initialize the component
onMounted(() => {
  void loadTeachers();
});
</script>

<style lang="scss" scoped>
// Any custom styles if needed
</style>

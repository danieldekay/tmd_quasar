<template>
  <BaseListPage
    title="Teachers"
    subtitle="Discover talented tango teachers from around the world"
    :total-count="state.totalCount"
    stats-label="Total Teachers"
    :loading="state.loading"
    :error="state.error"
    :show-empty-state="state.items.length === 0 && !state.loading && !state.error"
    empty-state-icon="school"
    empty-state-title="No Teachers Found"
    empty-state-message="There are no teachers to display at the moment."
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
        label="Add Teacher"
        unelevated
        @click="$router.push('/teachers/new')"
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
          :model-value="filters.role"
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
          :model-value="filters.gender"
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
        v-if="filters.country"
        removable
        color="primary"
        text-color="white"
        :label="`Country: ${getCountryName(filters.country)}`"
        @remove="updateFilter('country', '')"
      />
      <q-chip
        v-if="filters.role"
        removable
        color="secondary"
        text-color="white"
        :label="`Role: ${filters.role}`"
        @remove="updateFilter('role', '')"
      />
      <q-chip
        v-if="filters.gender"
        removable
        color="accent"
        text-color="white"
        :label="`Gender: ${filters.gender}`"
        @remove="updateFilter('gender', '')"
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
import { computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import BaseListPage from '../components/BaseListPage.vue';
import BaseTable from '../components/BaseTable.vue';
import { useGenericList } from '../composables/useGenericList';
import { teacherService } from '../services';
import type { Teacher } from '../services/types';
import { useFormatters } from '../composables/useFormatters';
import { useCountries } from '../composables/useCountries';

const router = useRouter();
const { formatDate } = useFormatters();
const { getCountryName } = useCountries();

// Define filters interface
interface TeacherFilters {
  searchQuery: string;
  country: string;
  role: string;
  gender: string;
  [key: string]: string; // Index signature for compatibility with ListFilters
}

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

// Fetch function for the generic list
const fetchTeachers = async (params: {
  page: number;
  perPage: number;
  sortBy: string;
  descending: boolean;
  filters: TeacherFilters;
}) => {
  const { page, perPage, sortBy, descending, filters } = params;

  // For local processing, we pull all data at once
  const apiParams: Record<string, unknown> = {
    per_page: 999, // Get all teachers for local processing
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
    const teachers = await teacherService.getTeachers(apiParams);

    // Filter by role and gender locally since API might not support these filters
    let filteredTeachers = teachers || [];

    if (filters.role) {
      filteredTeachers = filteredTeachers.filter(
        (teacher) => teacher.meta_box?.role === filters.role,
      );
    }

    if (filters.gender) {
      filteredTeachers = filteredTeachers.filter(
        (teacher) => teacher.meta_box?.gender === filters.gender,
      );
    }

    // Apply local sorting
    if (sortBy && filteredTeachers.length > 0) {
      filteredTeachers.sort((a, b) => {
        let aVal: unknown;
        let bVal: unknown;

        switch (sortBy) {
          case 'name':
            aVal = getTeacherName(a);
            bVal = getTeacherName(b);
            break;
          case 'location':
            aVal = getLocationText(a);
            bVal = getLocationText(b);
            break;
          case 'role':
            aVal = a.meta_box?.role || '';
            bVal = b.meta_box?.role || '';
            break;
          case 'gender':
            aVal = a.meta_box?.gender || '';
            bVal = b.meta_box?.gender || '';
            break;
          case 'events_count':
            aVal = getEventsCount(a);
            bVal = getEventsCount(b);
            break;
          case 'couples_count':
            aVal = getCouplesCount(a);
            bVal = getCouplesCount(b);
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

    // Since we're getting all teachers and processing locally,
    // we need to implement pagination manually
    const totalCount = filteredTeachers.length;
    const totalPages = Math.ceil(totalCount / perPage);
    const startIndex = (page - 1) * perPage;
    const endIndex = startIndex + perPage;
    const paginatedTeachers = filteredTeachers.slice(startIndex, endIndex);

    return {
      items: paginatedTeachers,
      totalCount,
      totalPages,
      currentPage: page,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    };
  } catch (error) {
    console.error('Error fetching teachers:', error);
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
} = useGenericList<Teacher, TeacherFilters>({
  fetchFn: fetchTeachers,
  defaultFilters: {
    searchQuery: '',
    country: '',
    role: '',
    gender: '',
  },
  defaultPagination: {
    page: 1,
    rowsPerPage: 20,
    sortBy: 'name',
    descending: false,
  },
  persistenceKey: 'teachers-filters',
  enableSearch: true,
  searchMinLength: 2,
  searchDebounce: 300,
});

// Filter options
const countryOptions = computed(() => {
  const countries = new Set<string>();
  state.value.items.forEach((item) => {
    if (item.meta_box?.country) {
      countries.add(item.meta_box.country);
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

// Initialize the component
onMounted(() => {
  initialize();
});
</script>

<style lang="scss" scoped>
// Any custom styles if needed
</style>

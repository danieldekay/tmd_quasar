<template>
  <q-page padding>
    <div class="row q-col-gutter-lg">
      <div class="col-12">
        <div class="q-mb-lg">
          <h1 class="text-h4 q-mb-none">Teachers</h1>
          <p class="text-subtitle2 text-grey-7 q-mb-none">
            Discover talented tango teachers from around the world
          </p>
        </div>
      </div>

      <!-- Search and Filters -->
      <div class="col-12">
        <q-card flat bordered class="q-mb-lg">
          <q-card-section>
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-6">
                <q-input
                  v-model="searchQuery"
                  outlined
                  dense
                  placeholder="Search teachers by name, city, or country..."
                  clearable
                >
                  <template v-slot:prepend>
                    <q-icon name="search" />
                  </template>
                </q-input>
              </div>
              <div class="col-12 col-md-3">
                <q-select
                  v-model="selectedTeachingStyle"
                  :options="teachingStyleOptions"
                  outlined
                  dense
                  placeholder="Filter by teaching style"
                  clearable
                  emit-value
                  map-options
                >
                  <template v-slot:prepend>
                    <q-icon name="school" />
                  </template>
                </q-select>
              </div>
              <div class="col-12 col-md-3">
                <q-select
                  v-model="sortBy"
                  :options="sortOptions"
                  outlined
                  dense
                  emit-value
                  map-options
                >
                  <template v-slot:prepend>
                    <q-icon name="sort" />
                  </template>
                </q-select>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="col-12 text-center">
        <q-spinner color="primary" size="3em" />
        <p class="q-mt-md">Loading teachers...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="col-12 text-center">
        <q-banner class="bg-negative text-white">
          {{ error }}
        </q-banner>
      </div>

      <!-- Teachers Table -->
      <div v-else class="col-12">
        <q-table
          :rows="filteredTeachers"
          :columns="columns"
          row-key="id"
          :pagination="pagination"
          flat
          bordered
          class="teachers-table"
        >
          <template v-slot:body-cell-photo="props">
            <q-td :props="props">
              <q-avatar size="40px">
                <img
                  :src="props.row.acf?.photo || 'https://cdn.quasar.dev/img/avatar.png'"
                  :alt="`Photo of ${props.row.title}`"
                />
              </q-avatar>
            </q-td>
          </template>

          <template v-slot:body-cell-name="props">
            <q-td :props="props">
              <div class="text-weight-medium">{{ props.row.title }}</div>
            </q-td>
          </template>

          <template v-slot:body-cell-location="props">
            <q-td :props="props">
              <div v-if="props.row.city || props.row.country">
                <q-icon name="place" size="xs" class="q-mr-xs" />
                {{ [props.row.city, props.row.country].filter(Boolean).join(', ') }}
              </div>
              <span v-else class="text-grey-5">-</span>
            </q-td>
          </template>

          <template v-slot:body-cell-teaching_style="props">
            <q-td :props="props">
              <q-chip
                v-if="props.row.acf?.teaching_style"
                :label="props.row.acf.teaching_style"
                color="primary"
                text-color="white"
                size="sm"
                dense
              />
              <span v-else class="text-grey-5">-</span>
            </q-td>
          </template>

          <template v-slot:body-cell-website="props">
            <q-td :props="props">
              <q-btn
                v-if="props.row.acf?.website"
                flat
                round
                color="secondary"
                icon="launch"
                size="sm"
                :href="props.row.acf.website"
                target="_blank"
              >
                <q-tooltip>Visit Website</q-tooltip>
              </q-btn>
              <span v-else class="text-grey-5">-</span>
            </q-td>
          </template>

          <template v-slot:body-cell-date="props">
            <q-td :props="props">
              <div class="text-caption">{{ formatDate(props.row.date) }}</div>
            </q-td>
          </template>

          <template v-slot:body-cell-actions="props">
            <q-td :props="props">
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
                  @click="editTeacher(props.row)"
                >
                  <q-tooltip>Edit Teacher</q-tooltip>
                </q-btn>
              </div>
            </q-td>
          </template>

          <template v-slot:no-data>
            <div class="full-width row flex-center text-grey-7 q-gutter-sm">
              <q-icon size="2em" name="school" />
              <span>No teachers found</span>
            </div>
          </template>
        </q-table>
      </div>

      <!-- Results Summary -->
      <div class="col-12 text-center q-mt-md" v-if="!loading && !error">
        <p class="text-caption text-grey-7">
          Showing {{ filteredTeachers.length }} of {{ teachers.length }} teachers
        </p>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { teacherService } from '../services';
import type { Teacher } from '../services/types';
import { useFormatters } from '../composables/useFormatters';
import { useRouter } from 'vue-router';

const { formatDate } = useFormatters();
const router = useRouter();

const teachers = ref<Teacher[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);
const searchQuery = ref('');
const selectedTeachingStyle = ref<string | null>(null);
const sortBy = ref('name');

const pagination = ref({
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0,
});

const columns = [
  {
    name: 'photo',
    label: 'Photo',
    field: 'photo',
    align: 'center' as const,
    sortable: false,
  },
  {
    name: 'name',
    label: 'Name',
    field: 'title',
    align: 'left' as const,
    sortable: true,
  },
  {
    name: 'location',
    label: 'Location',
    field: (row: Teacher) => [row.city, row.country].filter(Boolean).join(', '),
    align: 'left' as const,
    sortable: true,
  },
  {
    name: 'teaching_style',
    label: 'Teaching Style',
    field: (row: Teacher) => row.acf?.teaching_style || '',
    align: 'left' as const,
    sortable: true,
  },
  {
    name: 'website',
    label: 'Website',
    field: 'website',
    align: 'center' as const,
    sortable: false,
  },
  {
    name: 'date',
    label: 'Added',
    field: 'date',
    align: 'left' as const,
    sortable: true,
  },
  {
    name: 'actions',
    label: 'Actions',
    field: 'actions',
    align: 'center' as const,
    sortable: false,
  },
];

const teachingStyleOptions = computed(() => {
  const styles = new Set<string>();
  // Ensure teachers.value is always an array
  const teachersArray = Array.isArray(teachers.value) ? teachers.value : [];
  teachersArray.forEach((teacher) => {
    if (teacher.acf?.teaching_style) {
      styles.add(teacher.acf.teaching_style);
    }
  });
  return Array.from(styles).map((style) => ({
    label: style,
    value: style,
  }));
});

const sortOptions = [
  { label: 'Name (A-Z)', value: 'name' },
  { label: 'Name (Z-A)', value: 'name_desc' },
  { label: 'Recently Added', value: 'date_desc' },
  { label: 'Oldest First', value: 'date' },
];

const filteredTeachers = computed(() => {
  // Ensure teachers.value is always an array
  const teachersArray = Array.isArray(teachers.value) ? teachers.value : [];
  let filtered = [...teachersArray];

  // Apply teaching style filter
  if (selectedTeachingStyle.value) {
    filtered = filtered.filter(
      (teacher) => teacher.acf?.teaching_style === selectedTeachingStyle.value,
    );
  }

  // Apply search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(
      (teacher) =>
        teacher.title.toLowerCase().includes(query) ||
        (teacher.acf?.teaching_style && teacher.acf.teaching_style.toLowerCase().includes(query)) ||
        (teacher.city && teacher.city.toLowerCase().includes(query)) ||
        (teacher.country && teacher.country.toLowerCase().includes(query)),
    );
  }

  // Apply sorting
  filtered.sort((a, b) => {
    switch (sortBy.value) {
      case 'name':
        return a.title.localeCompare(b.title);
      case 'name_desc':
        return b.title.localeCompare(a.title);
      case 'date':
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      case 'date_desc':
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      default:
        return 0;
    }
  });

  console.log('filteredTeachers computed - final filtered length:', filtered.length);
  return filtered;
});

const loadTeachers = async () => {
  try {
    const result = await teacherService.getTeachers();
    // Ensure result is always an array
    teachers.value = Array.isArray(result) ? result : [];
    pagination.value.rowsNumber = teachers.value.length;
  } catch (err) {
    console.error('Error loading teachers:', err);
    error.value = 'Failed to load teachers';
    // Ensure teachers.value is still an array even on error
    teachers.value = [];
  } finally {
    loading.value = false;
  }
};

const editTeacher = (teacher: Teacher) => {
  void router.push(`/teachers/${teacher.id}/edit`);
};

onMounted(loadTeachers);
</script>

<style lang="scss" scoped>
.teachers-table {
  .q-table__top {
    padding: 0;
  }

  .q-table tbody td {
    border-bottom: 1px solid rgba(0, 0, 0, 0.12);
  }

  .q-table thead th {
    background-color: #fafafa;
    font-weight: 600;
  }

  .q-table tbody tr:hover {
    background-color: rgba(0, 0, 0, 0.04);
  }
}

.q-chip {
  border-radius: 12px;
}
</style>

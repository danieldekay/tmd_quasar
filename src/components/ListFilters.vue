<template>
  <div class="list-filters">
    <q-card flat bordered class="filters-card">
      <q-card-section class="q-pa-lg">
        <!-- Mobile: Collapsible filters -->
        <div class="lt-md">
          <div class="row items-center justify-between q-mb-md">
            <div class="text-h6">Filters</div>
            <q-btn
              :icon="filtersExpanded ? 'expand_less' : 'expand_more'"
              flat
              round
              @click="filtersExpanded = !filtersExpanded"
              :label="hasActiveFilters ? `${activeFilterCount} active` : ''"
              :color="hasActiveFilters ? 'primary' : 'grey'"
            />
          </div>

          <q-slide-transition>
            <div v-show="filtersExpanded" class="mobile-filters">
              <!-- Search -->
              <div v-if="enableSearch" class="q-mb-md">
                <q-input
                  :model-value="searchQuery"
                  @update:model-value="$emit('update:searchQuery', String($event || ''))"
                  :label="searchPlaceholder"
                  dense
                  outlined
                  clearable
                  :debounce="searchDebounce"
                >
                  <template v-slot:prepend>
                    <q-icon name="search" />
                  </template>
                </q-input>
              </div>

              <!-- Custom Filter Content -->
              <div class="column q-gutter-md">
                <slot name="filters" />
              </div>

              <!-- Clear All Filters -->
              <div v-if="hasActiveFilters" class="q-mt-md">
                <q-btn
                  outline
                  color="negative"
                  label="Clear All Filters"
                  @click="$emit('clear-filters')"
                  size="sm"
                />
              </div>
            </div>
          </q-slide-transition>
        </div>

        <!-- Desktop: Expanded filters -->
        <div class="gt-sm">
          <div class="text-h6 q-mb-md">Filters</div>

          <!-- Search Row -->
          <div v-if="enableSearch" class="row q-mb-md">
            <div class="col-12">
              <q-input
                :model-value="searchQuery"
                @update:model-value="$emit('update:searchQuery', String($event || ''))"
                :label="searchPlaceholder"
                dense
                outlined
                clearable
                :debounce="searchDebounce"
              >
                <template v-slot:prepend>
                  <q-icon name="search" />
                </template>
              </q-input>
            </div>
          </div>

          <!-- Custom Filter Content -->
          <div class="row q-col-gutter-md">
            <slot name="filters" />
          </div>

          <!-- Clear All Filters -->
          <div v-if="hasActiveFilters" class="row q-mt-md">
            <div class="col-12">
              <q-btn
                outline
                color="negative"
                label="Clear All Filters"
                @click="$emit('clear-filters')"
                size="sm"
              />
            </div>
          </div>
        </div>

        <!-- Active Filters Display -->
        <div v-if="hasActiveFilters && $slots['active-filters']" class="row q-mt-md">
          <div class="col-12">
            <div class="text-caption text-grey-6 q-mb-xs">Active filters:</div>
            <div class="row q-gutter-xs">
              <slot name="active-filters" />
            </div>
          </div>
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

interface Props {
  enableSearch?: boolean | undefined;
  searchQuery?: string | undefined;
  searchPlaceholder?: string | undefined;
  searchDebounce?: number | undefined;
  hasActiveFilters?: boolean | undefined;
  activeFilterCount?: number | undefined;
}

interface Emits {
  (e: 'update:searchQuery', value: string): void;
  (e: 'clear-filters'): void;
}

withDefaults(defineProps<Props>(), {
  enableSearch: true,
  searchQuery: '',
  searchPlaceholder: 'Search...',
  searchDebounce: 300,
  hasActiveFilters: false,
  activeFilterCount: 0,
});

defineEmits<Emits>();

// Mobile filter state
const filtersExpanded = ref(false);
</script>

<style lang="scss" scoped>
.list-filters {
  .filters-card {
    border-radius: 8px;
  }

  .mobile-filters {
    .q-gutter-md > * {
      margin-bottom: 1rem;
    }
  }
}

// Responsive adjustments
@media (max-width: 1023px) {
  .list-filters {
    .lt-md {
      display: block;
    }
    .gt-sm {
      display: none;
    }
  }
}

@media (min-width: 1024px) {
  .list-filters {
    .lt-md {
      display: none;
    }
    .gt-sm {
      display: block;
    }
  }
}
</style>

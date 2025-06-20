<template>
  <q-pull-to-refresh v-if="enablePullToRefresh" @refresh="handlePullToRefresh">
    <q-page :padding="!fullWidth">
      <div :class="fullWidth ? '' : 'row q-col-gutter-lg'">
        <div :class="fullWidth ? '' : 'col-12'">
          <!-- Page Header -->
          <ListPageHeader
            :title="title"
            :subtitle="subtitle"
            :show-stats="showStats"
            :total-count="totalCount"
            :stats-label="statsLabel"
          >
            <template #actions>
              <slot name="header-actions" />
            </template>
            <template #content>
              <slot name="header-content" />
            </template>
          </ListPageHeader>

          <!-- Filters Section -->
          <div v-if="showFilters" class="q-px-lg q-pb-lg">
            <ListFilters
              :enable-search="enableSearch"
              :search-query="searchQuery"
              :search-placeholder="searchPlaceholder"
              :search-debounce="searchDebounce"
              :has-active-filters="hasActiveFilters"
              :active-filter-count="activeFilterCount"
              @update:search-query="$emit('update:searchQuery', $event)"
              @clear-filters="$emit('clear-filters')"
            >
              <template #filters>
                <slot name="filters" />
              </template>
              <template #active-filters>
                <slot name="active-filters" />
              </template>
            </ListFilters>
          </div>

          <!-- Loading State -->
          <div v-if="loading" class="loading-section q-px-lg">
            <q-card flat bordered>
              <q-card-section class="text-center q-py-xl">
                <q-spinner-dots color="primary" size="3em" />
                <p class="text-subtitle1 q-mt-md text-grey-6">{{ loadingMessage }}</p>
              </q-card-section>
            </q-card>
          </div>

          <!-- Error State -->
          <div v-else-if="error" class="error-section q-px-lg">
            <OfflineMessage :error="error" :title="errorTitle" @retry="$emit('retry')" />
          </div>

          <!-- Empty State -->
          <div v-else-if="showEmptyState" class="empty-section q-px-lg">
            <ListEmptyState
              :icon="emptyStateIcon"
              :title="emptyStateTitle"
              :message="emptyStateMessage"
            >
              <template #actions>
                <slot name="empty-actions" />
              </template>
            </ListEmptyState>
          </div>

          <!-- Content Section -->
          <div v-else class="content-section q-px-lg q-pb-lg">
            <q-card flat bordered class="content-card">
              <!-- Results Header -->
              <q-card-section v-if="showResultsHeader" class="results-header q-pa-lg border-bottom">
                <div class="row items-center justify-between">
                  <div class="results-info">
                    <div class="text-h6 text-weight-medium">
                      {{ formatResultsText(displayCount || 0) }}
                      <span v-if="hasActiveFilters" class="text-grey-6">
                        (filtered from {{ totalCount?.toLocaleString() }})
                      </span>
                    </div>
                    <div v-if="showPagination" class="text-caption text-grey-6 q-mt-xs">
                      Page {{ currentPage }} of {{ totalPages }}
                    </div>
                  </div>

                  <!-- View Options -->
                  <div class="view-options">
                    <slot name="view-options" />
                  </div>
                </div>
              </q-card-section>

              <!-- Main Content -->
              <div class="content-body">
                <slot name="content" />
              </div>

              <!-- Pagination -->
              <q-card-section v-if="showPagination" class="pagination-section">
                <slot name="pagination" />
              </q-card-section>
            </q-card>
          </div>
        </div>
      </div>
    </q-page>
  </q-pull-to-refresh>

  <!-- Non-pull-to-refresh version -->
  <q-page v-else :padding="!fullWidth">
    <div :class="fullWidth ? '' : 'row q-col-gutter-lg'">
      <div :class="fullWidth ? '' : 'col-12'">
        <!-- Page Header -->
        <ListPageHeader
          :title="title"
          :subtitle="subtitle"
          :show-stats="showStats"
          :total-count="totalCount"
          :stats-label="statsLabel"
        >
          <template #actions>
            <slot name="header-actions" />
          </template>
          <template #content>
            <slot name="header-content" />
          </template>
        </ListPageHeader>

        <!-- Filters Section -->
        <div v-if="showFilters" class="q-px-lg q-pb-lg">
          <ListFilters
            :enable-search="enableSearch"
            :search-query="searchQuery"
            :search-placeholder="searchPlaceholder"
            :search-debounce="searchDebounce"
            :has-active-filters="hasActiveFilters"
            :active-filter-count="activeFilterCount"
            @update:search-query="$emit('update:searchQuery', $event)"
            @clear-filters="$emit('clear-filters')"
          >
            <template #filters>
              <slot name="filters" />
            </template>
            <template #active-filters>
              <slot name="active-filters" />
            </template>
          </ListFilters>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="loading-section q-px-lg">
          <q-card flat bordered>
            <q-card-section class="text-center q-py-xl">
              <q-spinner-dots color="primary" size="3em" />
              <p class="text-subtitle1 q-mt-md text-grey-6">{{ loadingMessage }}</p>
            </q-card-section>
          </q-card>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="error-section q-px-lg">
          <OfflineMessage :error="error" :title="errorTitle" @retry="$emit('retry')" />
        </div>

        <!-- Empty State -->
        <div v-else-if="showEmptyState" class="empty-section q-px-lg">
          <ListEmptyState
            :icon="emptyStateIcon"
            :title="emptyStateTitle"
            :message="emptyStateMessage"
          >
            <template #actions>
              <slot name="empty-actions" />
            </template>
          </ListEmptyState>
        </div>

        <!-- Content Section -->
        <div v-else class="content-section q-px-lg q-pb-lg">
          <q-card flat bordered class="content-card">
            <!-- Results Header -->
            <q-card-section v-if="showResultsHeader" class="results-header q-pa-lg border-bottom">
              <div class="row items-center justify-between">
                <div class="results-info">
                  <div class="text-h6 text-weight-medium">
                    {{ formatResultsText(displayCount || 0) }}
                    <span v-if="hasActiveFilters" class="text-grey-6">
                      (filtered from {{ totalCount?.toLocaleString() }})
                    </span>
                  </div>
                  <div v-if="showPagination" class="text-caption text-grey-6 q-mt-xs">
                    Page {{ currentPage }} of {{ totalPages }}
                  </div>
                </div>

                <!-- View Options -->
                <div class="view-options">
                  <slot name="view-options" />
                </div>
              </div>
            </q-card-section>

            <!-- Main Content -->
            <div class="content-body">
              <slot name="content" />
            </div>

            <!-- Pagination -->
            <q-card-section v-if="showPagination" class="pagination-section">
              <slot name="pagination" />
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import ListPageHeader from './ListPageHeader.vue';
import ListFilters from './ListFilters.vue';
import ListEmptyState from './ListEmptyState.vue';
import OfflineMessage from './OfflineMessage.vue';

interface Props {
  // Page configuration
  title: string;
  subtitle?: string | undefined;
  fullWidth?: boolean;

  // Header configuration
  showStats?: boolean | undefined;
  totalCount?: number | undefined;
  statsLabel?: string | undefined;

  // Filter configuration
  showFilters?: boolean;
  enableSearch?: boolean | undefined;
  searchQuery?: string | undefined;
  searchPlaceholder?: string | undefined;
  searchDebounce?: number | undefined;
  hasActiveFilters?: boolean | undefined;
  activeFilterCount?: number | undefined;

  // State configuration
  loading?: boolean;
  loadingMessage?: string;
  error?: string | null;
  errorTitle?: string | undefined;

  // Empty state configuration
  showEmptyState?: boolean;
  emptyStateIcon?: string | undefined;
  emptyStateTitle?: string | undefined;
  emptyStateMessage?: string | undefined;

  // Results configuration
  showResultsHeader?: boolean;
  displayCount?: number;
  currentPage?: number;
  totalPages?: number;
  showPagination?: boolean;

  // Pull to refresh
  enablePullToRefresh?: boolean;
}

interface Emits {
  (e: 'update:searchQuery', value: string): void;
  (e: 'clear-filters'): void;
  (e: 'retry'): void;
  (e: 'pull-to-refresh', done: () => void): void;
}

withDefaults(defineProps<Props>(), {
  fullWidth: false,
  showStats: true,
  totalCount: 0,
  statsLabel: 'Total Items',
  showFilters: true,
  enableSearch: true,
  searchQuery: '',
  searchPlaceholder: 'Search...',
  searchDebounce: 300,
  hasActiveFilters: false,
  activeFilterCount: 0,
  loading: false,
  loadingMessage: 'Loading...',
  error: null,
  errorTitle: 'Failed to Load Data',
  showEmptyState: false,
  emptyStateIcon: 'inbox',
  emptyStateTitle: 'No items found',
  emptyStateMessage: 'There are no items to display at the moment.',
  showResultsHeader: true,
  displayCount: 0,
  currentPage: 1,
  totalPages: 1,
  showPagination: false,
  enablePullToRefresh: false,
});

const emit = defineEmits<Emits>();

/**
 * Format results text with proper pluralization
 */
const formatResultsText = (count: number): string => {
  const displayCount = count || 0;

  if (displayCount === 1) {
    return '1 item';
  }

  return `${displayCount.toLocaleString()} items`;
};

/**
 * Handle pull to refresh
 */
const handlePullToRefresh = (done: () => void) => {
  emit('pull-to-refresh', done);
};
</script>

<style lang="scss" scoped>
.border-bottom {
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
}

.content-card {
  border-radius: 8px;
}

.results-header {
  .results-info {
    flex: 1;
  }

  .view-options {
    flex-shrink: 0;
  }
}

.pagination-section {
  border-top: 1px solid rgba(0, 0, 0, 0.12);
  background-color: rgba(0, 0, 0, 0.02);
}

// Responsive adjustments
@media (max-width: 768px) {
  .results-header {
    .row {
      flex-direction: column;
      align-items: flex-start !important;
      gap: 1rem;
    }

    .view-options {
      width: 100%;
    }
  }
}
</style>

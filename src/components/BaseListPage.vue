<template>
  <q-page :class="fullWidth ? '' : 'base-list-page'">
    <q-pull-to-refresh v-if="enablePullToRefresh" @refresh="handlePullToRefresh">
      <div class="base-list-page-content-wrapper">
        <!-- Page Header -->
        <ListPageHeader
          :title="title"
          :subtitle="subtitle"
          :show-stats="showStats"
          :total-count="totalCount"
          :stats-label="statsLabel"
        >
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
          <q-card flat bordered class="styled-content-card">
            <!-- Results Header -->
            <q-card-section v-if="showResultsHeader" class="results-header q-pa-lg border-bottom-util">
              <div class="row items-center justify-between responsive-header-columns">
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
            <q-card-section v-if="showPagination" class="pagination-section-util">
              <slot name="pagination" />
            </q-card-section>
          </q-card>
        </div>
      </div>
    </q-pull-to-refresh>

    <div v-else class="base-list-page-content-wrapper">
      <!-- Page Header -->
      <ListPageHeader
        :title="title"
        :subtitle="subtitle"
        :show-stats="showStats"
        :total-count="totalCount"
        :stats-label="statsLabel"
      >
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
        <q-card flat bordered class="styled-content-card">
          <!-- Results Header -->
          <q-card-section v-if="showResultsHeader" class="results-header q-pa-lg border-bottom-util">
            <div class="row items-center justify-between responsive-header-columns">
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
          <q-card-section v-if="showPagination" class="pagination-section-util">
            <slot name="pagination" />
          </q-card-section>
        </q-card>
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
// .border-bottom has been replaced by .border-bottom-util utility class
// .content-card has been replaced by .styled-content-card utility class
// .pagination-section has been replaced by .pagination-section-util utility class
// Responsive adjustments for .results-header .row are now in .responsive-header-columns utility class

// Scoped styles that remain specific to BaseListPage's internal structure
.results-header {
  .results-info {
    flex: 1;
  }

  .view-options {
    flex-shrink: 0;
    // If .view-options needs width: 100% on mobile, it's handled by .responsive-header-columns
  }
}

// Ensure q-page content fills height if needed, especially for empty/loading states.
// This might be better handled by flex classes on q-page or its children if issues arise.
.base-list-page-content-wrapper {
  display: flex;
  flex-direction: column;
  min-height: inherit; // Inherit min-height from q-page if set (e.g. screen-height)

  .loading-section,
  .error-section,
  .empty-section {
    flex-grow: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%; // Ensure the inner card takes available width
    > .q-card {
      width: 100%;
      max-width: 600px; // Optional: constrain width of message cards
    }
  }
}
</style>

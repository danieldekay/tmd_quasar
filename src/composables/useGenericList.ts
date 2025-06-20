import { ref, computed, watch, nextTick } from 'vue';
import { useApiStatus } from './useApiStatus';

export interface GenericListState<T = unknown> {
  items: T[];
  loading: boolean;
  error: string | null;
  totalCount: number;
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ListPagination {
  page: number;
  rowsPerPage: number;
  sortBy: string;
  descending: boolean;
}

export interface ListFilters {
  searchQuery: string;
  [key: string]: unknown;
}

export interface UseGenericListOptions<T, F extends ListFilters> {
  /**
   * Function to fetch data from API
   */
  fetchFn: (params: {
    page: number;
    perPage: number;
    sortBy: string;
    descending: boolean;
    filters: F;
    forceReload?: boolean;
  }) => Promise<{
    items: T[];
    totalCount: number;
    totalPages: number;
    currentPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  }>;

  /**
   * Default filters
   */
  defaultFilters: F;

  /**
   * Default pagination settings
   */
  defaultPagination?: Partial<ListPagination>;

  /**
   * Cookie name for persistence (optional)
   */
  persistenceKey?: string;

  /**
   * Enable search functionality
   */
  enableSearch?: boolean;

  /**
   * Minimum characters for search
   */
  searchMinLength?: number;

  /**
   * Search debounce delay in ms
   */
  searchDebounce?: number;

  /**
   * Enable automatic retry on errors
   */
  enableRetry?: boolean;
}

const COOKIE_EXPIRY_DAYS = 30;

/**
 * Generic composable for managing list pages with consistent functionality
 */
export const useGenericList = <T, F extends ListFilters>(options: UseGenericListOptions<T, F>) => {
  const {
    fetchFn,
    defaultFilters,
    defaultPagination = {},
    persistenceKey,
    enableSearch = true,
    searchMinLength = 3,
    enableRetry = true,
  } = options;

  const apiStatus = useApiStatus();

  // Default pagination values
  const paginationDefaults: ListPagination = {
    page: 1,
    rowsPerPage: 20,
    sortBy: 'date',
    descending: true,
    ...defaultPagination,
  };

  // Reactive state
  const state = ref({
    items: [] as T[],
    loading: false,
    error: null as string | null,
    totalCount: 0,
    totalPages: 0,
    currentPage: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });

  const filters = ref<F>({ ...defaultFilters });
  const pagination = ref<ListPagination>({ ...paginationDefaults });

  /**
   * Save state to cookie if persistence is enabled
   */
  const saveState = () => {
    if (!persistenceKey) return;

    try {
      const stateData = {
        filters: filters.value,
        pagination: {
          rowsPerPage: pagination.value.rowsPerPage,
          sortBy: pagination.value.sortBy,
          descending: pagination.value.descending,
        },
      };

      const encodedData = encodeURIComponent(JSON.stringify(stateData));
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + COOKIE_EXPIRY_DAYS);

      document.cookie = `${persistenceKey}=${encodedData}; expires=${expiryDate.toUTCString()}; path=/; SameSite=Strict`;
    } catch (error) {
      console.warn('Failed to save list state to cookie:', error);
    }
  };

  /**
   * Load state from cookie if persistence is enabled
   */
  const loadState = () => {
    if (!persistenceKey) return;

    try {
      const cookies = document.cookie.split(';');
      const stateCookie = cookies.find((cookie) => cookie.trim().startsWith(`${persistenceKey}=`));

      if (stateCookie) {
        const cookieValue = stateCookie.split('=')[1];
        if (cookieValue) {
          const decodedValue = decodeURIComponent(cookieValue);
          const savedState = JSON.parse(decodedValue);

          // Merge with defaults to handle new properties
          if (savedState.filters) {
            filters.value = { ...defaultFilters, ...savedState.filters };
          }
          if (savedState.pagination) {
            pagination.value = {
              ...paginationDefaults,
              ...savedState.pagination,
              page: 1, // Always start from page 1
            };
          }
        }
      }
    } catch (error) {
      console.warn('Failed to load list state from cookie:', error);
    }
  };

  /**
   * Main function to load data
   */
  const loadData = async (page?: number, forceReload = false) => {
    state.value.loading = true;
    state.value.error = null;

    const currentPage = page || pagination.value.page;

    try {
      const params = {
        page: currentPage,
        perPage: pagination.value.rowsPerPage,
        sortBy: pagination.value.sortBy,
        descending: pagination.value.descending,
        filters: filters.value,
        forceReload,
      };

      const response = await fetchFn(params);

      (state.value.items as T[]) = response.items;
      state.value.totalCount = response.totalCount;
      state.value.totalPages = response.totalPages;
      state.value.currentPage = response.currentPage;
      state.value.hasNextPage = response.hasNextPage;
      state.value.hasPrevPage = response.hasPrevPage;

      pagination.value.page = response.currentPage;
    } catch (error) {
      console.error('Error loading data:', error);
      state.value.error = apiStatus.getErrorMessage(error);

      if (enableRetry) {
        // Auto-retry once for network errors
        if (apiStatus.isOffline.value && state.value.items.length === 0) {
          console.info('Offline detected, will retry when connection restored');
        }
      }
    } finally {
      state.value.loading = false;
    }
  };

  /**
   * Retry loading data
   */
  const retry = async () => {
    if (apiStatus.isOffline.value || apiStatus.isApiDown.value) {
      await apiStatus.testApiConnectivity();
    }
    await loadData(pagination.value.page, true);
  };

  /**
   * Update a specific filter
   */
  const updateFilter = <K extends keyof F>(key: K, value: F[K]) => {
    filters.value[key] = value;
    // Reset to first page when filters change
    pagination.value.page = 1;
  };

  /**
   * Update pagination settings
   */
  const updatePagination = (newPagination: Partial<ListPagination>) => {
    Object.assign(pagination.value, newPagination);
  };

  /**
   * Clear all filters
   */
  const clearFilters = () => {
    filters.value = { ...defaultFilters };
    pagination.value.page = 1;
  };

  /**
   * Refresh data (force reload)
   */
  const refresh = () => {
    return loadData(1, true);
  };

  /**
   * Check if any filters are active
   */
  const hasActiveFilters = computed(() => {
    return Object.keys(filters.value).some((key) => {
      const current = filters.value[key];
      const defaultValue = defaultFilters[key];

      if (typeof current === 'string' && typeof defaultValue === 'string') {
        return current !== defaultValue;
      }
      if (typeof current === 'object' && typeof defaultValue === 'object') {
        return JSON.stringify(current) !== JSON.stringify(defaultValue);
      }
      return current !== defaultValue;
    });
  });

  /**
   * Count active filters
   */
  const activeFilterCount = computed(() => {
    return Object.keys(filters.value).reduce((count, key) => {
      const current = filters.value[key];
      const defaultValue = defaultFilters[key];

      if (key === 'searchQuery' && current && current !== defaultValue) {
        return count + 1;
      }
      if (current !== defaultValue && current !== null && current !== undefined && current !== '') {
        return count + 1;
      }
      return count;
    }, 0);
  });

  /**
   * Search functionality with debounce
   */
  let searchTimeout: NodeJS.Timeout | null = null;
  const updateSearch = (query: string) => {
    if (!enableSearch) return;

    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    searchTimeout = setTimeout(() => {
      updateFilter('searchQuery' as keyof F, query as F[keyof F]);
    }, options.searchDebounce || 300);
  };

  /**
   * Check if search is valid
   */
  const isValidSearch = computed(() => {
    if (!enableSearch) return false;
    const query = filters.value.searchQuery as string;
    return query && query.length >= searchMinLength;
  });

  /**
   * Table pagination object for Quasar QTable
   */
  const tablePagination = computed({
    get: () => ({
      sortBy: pagination.value.sortBy,
      descending: pagination.value.descending,
      page: pagination.value.page,
      rowsPerPage: pagination.value.rowsPerPage,
      rowsNumber: state.value.totalCount,
    }),
    set: (val: { sortBy: string; descending: boolean; rowsPerPage: number }) => {
      updatePagination({
        sortBy: val.sortBy,
        descending: val.descending,
        rowsPerPage: val.rowsPerPage,
      });
    },
  });

  /**
   * Handle table request events from QTable
   */
  const onTableRequest = (props: {
    pagination: { sortBy: string; descending: boolean; page: number; rowsPerPage: number };
  }) => {
    updatePagination({
      sortBy: props.pagination.sortBy,
      descending: props.pagination.descending,
      rowsPerPage: props.pagination.rowsPerPage,
    });
    void loadData(props.pagination.page);
  };

  /**
   * Initialize the composable
   */
  const initialize = () => {
    loadState();
    void loadData();
  };

  // Watch for filter changes and reload data
  watch(
    filters,
    () => {
      void nextTick(() => {
        saveState();
        void loadData(1);
      });
    },
    { deep: true },
  );

  // Watch for pagination changes (except page) and reload
  watch(
    () => [pagination.value.sortBy, pagination.value.descending, pagination.value.rowsPerPage],
    () => {
      void nextTick(() => {
        saveState();
        void loadData(1);
      });
    },
  );

  return {
    // State
    state: computed(() => state.value),
    filters: computed(() => filters.value),
    pagination: computed(() => pagination.value),

    // Computed
    hasActiveFilters,
    activeFilterCount,
    isValidSearch,
    tablePagination,

    // Methods
    loadData,
    retry,
    refresh,
    updateFilter,
    updatePagination,
    clearFilters,
    updateSearch,
    onTableRequest,
    initialize,

    // Persistence
    saveState,
    loadState,
  };
};

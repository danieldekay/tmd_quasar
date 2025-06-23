import { ref, watch, nextTick } from 'vue';

export interface EventFilters {
  searchQuery: string;
  selectedCountry: string | null;
  selectedCategory: string | null;
  showPastEvents: boolean;
  startDateRange: { from: string | null; to: string | null };
  registrationDateRange: { from: string | null; to: string | null };
  sortBy: string;
  descending: boolean;
  rowsPerPage: number;
}

const COOKIE_NAME = 'tmd_event_filters';
const COOKIE_EXPIRY_DAYS = 30;

/**
 * Composable for managing event filters with cookie persistence
 */
export const useEventFilters = () => {
  // Default filter values
  const defaultFilters: EventFilters = {
    searchQuery: '',
    selectedCountry: null,
    selectedCategory: null,
    showPastEvents: false,
    startDateRange: { from: null, to: null },
    registrationDateRange: { from: null, to: null },
    sortBy: 'start_date',
    descending: true,
    rowsPerPage: 20,
  };

  // Reactive filter state
  const filters = ref<EventFilters>({ ...defaultFilters });

  /**
   * Save filters to cookie
   */
  const saveFilters = () => {
    try {
      const filterData = JSON.stringify(filters.value);
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + COOKIE_EXPIRY_DAYS);

      document.cookie = `${COOKIE_NAME}=${encodeURIComponent(filterData)}; expires=${expiryDate.toUTCString()}; path=/; SameSite=Strict`;
    } catch (error) {
      console.warn('Failed to save filters to cookie:', error);
    }
  };

  /**
   * Load filters from cookie
   */
  const loadFilters = (): EventFilters => {
    try {
      const cookies = document.cookie.split(';');
      const filterCookie = cookies.find((cookie) => cookie.trim().startsWith(`${COOKIE_NAME}=`));

      if (filterCookie) {
        const cookieValue = filterCookie.split('=')[1];
        if (cookieValue) {
          const decodedValue = decodeURIComponent(cookieValue);
          const savedFilters = JSON.parse(decodedValue) as EventFilters;

          // Merge with defaults to handle new filter properties
          return { ...defaultFilters, ...savedFilters };
        }
      }
    } catch (error) {
      console.warn('Failed to load filters from cookie:', error);
    }

    return { ...defaultFilters };
  };

  /**
   * Clear all filters and reset to defaults
   */
  const clearAllFilters = () => {
    filters.value = { ...defaultFilters };
    saveFilters();
  };

  /**
   * Update a specific filter
   */
  const updateFilter = <K extends keyof EventFilters>(key: K, value: EventFilters[K]) => {
    filters.value[key] = value;
  };

  /**
   * Check if any filters are active (different from defaults)
   */
  const hasActiveFilters = () => {
    return (
      filters.value.searchQuery !== defaultFilters.searchQuery ||
      filters.value.selectedCountry !== defaultFilters.selectedCountry ||
      filters.value.selectedCategory !== defaultFilters.selectedCategory ||
      filters.value.showPastEvents !== defaultFilters.showPastEvents ||
      filters.value.startDateRange.from !== defaultFilters.startDateRange.from ||
      filters.value.startDateRange.to !== defaultFilters.startDateRange.to ||
      filters.value.registrationDateRange.from !== defaultFilters.registrationDateRange.from ||
      filters.value.registrationDateRange.to !== defaultFilters.registrationDateRange.to
    );
  };

  /**
   * Count active filters for display
   */
  const activeFilterCount = () => {
    let count = 0;
    if (filters.value.searchQuery) count++;
    if (filters.value.selectedCountry) count++;
    if (filters.value.selectedCategory) count++;
    if (filters.value.showPastEvents) count++;
    if (filters.value.startDateRange.from || filters.value.startDateRange.to) count++;
    if (filters.value.registrationDateRange.from || filters.value.registrationDateRange.to) count++;
    return count;
  };

  /**
   * Apply quick date filters
   */
  const applyQuickStartDateFilter = () => {
    const today = new Date();
    const nineMonthsFromNow = new Date();
    nineMonthsFromNow.setMonth(today.getMonth() + 9);

    updateFilter('startDateRange', {
      from: today.toISOString().split('T')[0] ?? null,
      to: nineMonthsFromNow.toISOString().split('T')[0] ?? null,
    });
  };

  const applyQuickRegistrationFilter = () => {
    const today = new Date();
    const fourMonthsFromNow = new Date();
    fourMonthsFromNow.setMonth(today.getMonth() + 4);

    updateFilter('registrationDateRange', {
      from: today.toISOString().split('T')[0] ?? null,
      to: fourMonthsFromNow.toISOString().split('T')[0] ?? null,
    });
  };

  /**
   * Format date range for display
   */
  const formatDateRange = (range: { from: string | null; to: string | null }): string => {
    if (!range.from && !range.to) return '';
    if (range.from && range.to) return `${range.from} to ${range.to}`;
    if (range.from) return `From ${range.from}`;
    if (range.to) return `Until ${range.to}`;
    return '';
  };

  // Initialize filters from cookie on first load
  const initializeFilters = () => {
    const savedFilters = loadFilters();
    filters.value = savedFilters;
  };

  // Watch for filter changes and save to cookie
  watch(
    filters,
    () => {
      void nextTick(() => {
        saveFilters();
      });
    },
    { deep: true },
  );

  return {
    filters,
    updateFilter,
    clearAllFilters,
    hasActiveFilters,
    activeFilterCount,
    applyQuickStartDateFilter,
    applyQuickRegistrationFilter,
    formatDateRange,
    initializeFilters,
    saveFilters,
    loadFilters,
  };
};

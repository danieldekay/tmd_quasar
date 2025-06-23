import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useEventFilters, type EventFilters } from '../useEventFilters';
import { nextTick } from 'vue';

// Helper to set document.cookie
const setCookie = (name: string, value: string, expiryDays: number) => {
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + expiryDays);
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expiryDate.toUTCString()}; path=/; SameSite=Strict`;
};

// Helper to clear document.cookie
const clearCookie = (name: string) => {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Strict`;
};

const COOKIE_NAME = 'tmd_event_filters';

describe('useEventFilters', () => {
  let cookieSpyGet: ReturnType<typeof vi.spyOn>;
  let cookieSpySet: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    // Ensure a clean slate for cookies before each test
    clearCookie(COOKIE_NAME);
    // Spy on document.cookie
    cookieSpyGet = vi.spyOn(document, 'cookie', 'get');
    cookieSpySet = vi.spyOn(document, 'cookie', 'set');

    // Mock console.warn to avoid noise during tests for expected failures (like cookie parsing)
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    clearCookie(COOKIE_NAME);
  });

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

  it('should initialize with default filters when no cookie is set', () => {
    cookieSpyGet.mockReturnValue('');
    const { filters, initializeFilters } = useEventFilters();
    initializeFilters();
    expect(filters.value).toEqual(defaultFilters);
  });

  it('should load filters from cookie on initialization', () => {
    const saved: EventFilters = {
      ...defaultFilters,
      searchQuery: 'Test Query',
      selectedCountry: 'US',
    };
    setCookie(COOKIE_NAME, JSON.stringify(saved), 30);
    cookieSpyGet.mockReturnValue(`${COOKIE_NAME}=${encodeURIComponent(JSON.stringify(saved))}`);

    const { filters, initializeFilters } = useEventFilters();
    initializeFilters(); // This calls loadFilters

    expect(filters.value.searchQuery).toBe('Test Query');
    expect(filters.value.selectedCountry).toBe('US');
  });

  it('should save filters to cookie when filters change', async () => {
    const { updateFilter, initializeFilters } = useEventFilters();
    initializeFilters(); // Initialize to establish watcher

    // Clear any calls from initialization if necessary, though initializeFilters->loadFilters shouldn't set.
    cookieSpySet.mockClear();

    updateFilter('searchQuery', 'New Search');

    // Wait for Vue's reactivity and the watcher's nextTick to fire
    await nextTick(); // Initial update
    await nextTick(); // Watcher's internal nextTick for saveFilters

    expect(cookieSpySet).toHaveBeenCalled();
    const cookieSetValue = cookieSpySet.mock.calls[0]![0] as string;
    expect(cookieSetValue).toContain(`${COOKIE_NAME}=`);
    expect(decodeURIComponent(cookieSetValue.split('=')[1]!.split(';')[0]!)).toContain(
      '"searchQuery":"New Search"',
    );
  });

  it('should handle malformed cookie data gracefully', () => {
    cookieSpyGet.mockReturnValue(`${COOKIE_NAME}=thisisnotjson`);
    const { filters, initializeFilters } = useEventFilters();
    initializeFilters();
    expect(filters.value).toEqual(defaultFilters); // Should fall back to defaults
  });

  it('updateFilter should modify a specific filter', async () => {
    const { filters, updateFilter, initializeFilters } = useEventFilters();
    initializeFilters();
    updateFilter('selectedCountry', 'DE');
    await nextTick();
    expect(filters.value.selectedCountry).toBe('DE');
  });

  it('clearAllFilters should reset filters to defaults and save', async () => {
    const { filters, updateFilter, clearAllFilters, initializeFilters } = useEventFilters();
    initializeFilters();
    updateFilter('searchQuery', 'Something');
    await nextTick(); // Allow initial save

    clearAllFilters();
    await nextTick(); // Allow save after clear

    expect(filters.value).toEqual(defaultFilters);
    expect(cookieSpySet).toHaveBeenCalledTimes(2); // Initial + clear
    const lastCookieCall = cookieSpySet.mock.calls[
      cookieSpySet.mock.calls.length - 1
    ]![0] as string;
    expect(decodeURIComponent(lastCookieCall.split('=')[1]!.split(';')[0]!)).toBe(
      JSON.stringify(defaultFilters),
    );
  });

  describe('hasActiveFilters', () => {
    it('should return false for default filters', () => {
      const { filters, hasActiveFilters, initializeFilters } = useEventFilters();
      initializeFilters();
      filters.value = { ...defaultFilters }; // Ensure it's exactly default
      expect(hasActiveFilters()).toBe(false);
    });

    it('should return true if searchQuery is set', () => {
      const { updateFilter, hasActiveFilters, initializeFilters } = useEventFilters();
      initializeFilters();
      updateFilter('searchQuery', 'active');
      expect(hasActiveFilters()).toBe(true);
    });

    it('should return true if selectedCountry is set', () => {
      const { updateFilter, hasActiveFilters, initializeFilters } = useEventFilters();
      initializeFilters();
      updateFilter('selectedCountry', 'FR');
      expect(hasActiveFilters()).toBe(true);
    });

    it('should return true if showPastEvents is true', () => {
      const { updateFilter, hasActiveFilters, initializeFilters } = useEventFilters();
      initializeFilters();
      updateFilter('showPastEvents', true);
      expect(hasActiveFilters()).toBe(true);
    });

    it('should return true if startDateRange.from is set', () => {
      const { updateFilter, hasActiveFilters, initializeFilters } = useEventFilters();
      initializeFilters();
      updateFilter('startDateRange', { from: '2024-01-01', to: null });
      expect(hasActiveFilters()).toBe(true);
    });
  });

  describe('activeFilterCount', () => {
    it('should return 0 for default filters', () => {
      const { filters, activeFilterCount, initializeFilters } = useEventFilters();
      initializeFilters();
      filters.value = { ...defaultFilters };
      expect(activeFilterCount()).toBe(0);
    });

    it('should correctly count active filters', () => {
      const { updateFilter, activeFilterCount, initializeFilters } = useEventFilters();
      initializeFilters();
      updateFilter('searchQuery', 'test');
      updateFilter('selectedCountry', 'CA');
      updateFilter('showPastEvents', true);
      updateFilter('startDateRange', { from: '2024-01-01', to: '2024-02-01' });
      updateFilter('registrationDateRange', { from: '2023-12-01', to: null });
      expect(activeFilterCount()).toBe(5);
    });
  });

  describe('Quick Filters', () => {
    beforeEach(() => {
      // Set a fixed date for testing quick filters
      vi.useFakeTimers();
      vi.setSystemTime(new Date(2024, 0, 15)); // Jan 15, 2024
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('applyQuickStartDateFilter should set startDateRange from today to 9 months ahead', () => {
      const { filters, applyQuickStartDateFilter, initializeFilters } = useEventFilters();
      initializeFilters();
      applyQuickStartDateFilter();
      expect(filters.value.startDateRange.from).toBe('2024-01-15');
      expect(filters.value.startDateRange.to).toBe('2024-10-15'); // Jan + 9 months = Oct
    });

    it('applyQuickRegistrationFilter should set registrationDateRange from today to 4 months ahead', () => {
      const { filters, applyQuickRegistrationFilter, initializeFilters } = useEventFilters();
      initializeFilters();
      applyQuickRegistrationFilter();
      expect(filters.value.registrationDateRange.from).toBe('2024-01-15');
      expect(filters.value.registrationDateRange.to).toBe('2024-05-15'); // Jan + 4 months = May
    });
  });

  describe('formatDateRange', () => {
    const { formatDateRange } = useEventFilters(); // Can be called outside setup if it's pure

    it('should return empty string if no dates', () => {
      expect(formatDateRange({ from: null, to: null })).toBe('');
    });

    it('should format "From date" if only from is set', () => {
      expect(formatDateRange({ from: '2024-01-01', to: null })).toBe('From 2024-01-01');
    });

    it('should format "Until date" if only to is set', () => {
      expect(formatDateRange({ from: null, to: '2024-12-31' })).toBe('Until 2024-12-31');
    });

    it('should format "date to date" if both are set', () => {
      expect(formatDateRange({ from: '2024-01-01', to: '2024-02-01' })).toBe(
        '2024-01-01 to 2024-02-01',
      );
    });
  });

  it('should correctly merge partial saved filters with defaults', () => {
    const partialSavedFilters = {
      searchQuery: 'Partial Load Test',
      // selectedCountry is missing, should take default
      showPastEvents: true,
      // Other properties missing
    };
    setCookie(COOKIE_NAME, JSON.stringify(partialSavedFilters), 30);
    cookieSpyGet.mockReturnValue(
      `${COOKIE_NAME}=${encodeURIComponent(JSON.stringify(partialSavedFilters))}`,
    );

    const { filters, initializeFilters } = useEventFilters();
    initializeFilters();

    expect(filters.value.searchQuery).toBe('Partial Load Test');
    expect(filters.value.selectedCountry).toBe(defaultFilters.selectedCountry); // Should be default
    expect(filters.value.showPastEvents).toBe(true);
    expect(filters.value.sortBy).toBe(defaultFilters.sortBy); // Should be default
  });
});

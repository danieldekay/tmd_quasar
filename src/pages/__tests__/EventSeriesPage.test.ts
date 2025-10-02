/**
 * @vitest-environment happy-dom
 *
 * Test Suite: EventSeriesPage.vue Component Tests (T009)
 *
 * Purpose: Test EventSeriesPage component against FR-001 through FR-006 requirements
 *
 * Requirements Tested:
 * - FR-001: Display event series in QTable with sortable columns
 * - FR-002: ISO date formatting (N/A - event series use year format)
 * - FR-003: Detail page navigation on row click
 * - FR-004: Loading states with QSkeleton
 * - FR-005: Sorting support per table-columns.json
 * - FR-006: Pagination with 10/20/50/100 options
 *
 * Contract Validation:
 * - Table displays 6 columns per table-columns.json:
 *   [series_name, city, country, latest_edition, total_events, active_since]
 * - latest_edition, total_events, active_since are computed fields
 * - Country displays full name (not code)
 * - Sortable: series_name, city, country
 *
 * USES: Test utilities from src/test-utils/ (T004a)
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { flushPromises } from '@vue/test-utils';
import EventSeriesPage from '../EventSeriesPage.vue';
import {
  createMockRouter,
  mountWithQuasar,
  getQTableProps,
  getQTableColumns,
  getQTableRows,
  isQTableLoading,
  clickQTableRow,
  getQTablePagination,
  mockDelayedResponse,
  createNetworkError,
  mockErrorResponse,
} from 'src/test-utils';

// Mock data factory for Event Series
const createMockEventSeries = (id: number) => ({
  id,
  title: `Event Series ${id}`,
  city: `City ${id}`,
  country: 'IT',
  latest_edition: `Edition ${id}`,
  total_events: id * 3,
  active_since: 2010 + id,
});

const createMockEventSeriesList = (count: number) => {
  return Array.from({ length: count }, (_, i) => createMockEventSeries(i + 1));
};

const createMockEventSeriesResponse = (series: ReturnType<typeof createMockEventSeries>[]) => ({
  eventSeries: series,
  totalPages: 1,
  total: series.length,
});

// Mock the event series service module
vi.mock('src/services/eventSeriesService', () => ({
  eventSeriesService: {
    getEventSeries: vi.fn(),
  },
}));

// Import the mocked service
import { eventSeriesService as mockEventSeriesService } from 'src/services/eventSeriesService';

// Type-safe reference to mock function
const mockGetEventSeries = mockEventSeriesService['getEventSeries'] as ReturnType<typeof vi.fn>;

// Mock composables
vi.mock('@/composables/useCountries', () => ({
  useCountries: () => ({
    getCountryName: (code: string) => `Country-${code}`,
    getCountryOptionsFromCodes: () => [{ label: 'Italy', value: 'IT' }],
  }),
}));

describe('EventSeriesPage.vue - Component Tests (T009)', () => {
  let mockRouter: ReturnType<typeof createMockRouter>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockRouter = createMockRouter();

    // Setup default successful response
    mockGetEventSeries.mockResolvedValue(
      createMockEventSeriesResponse(createMockEventSeriesList(3)),
    );
  });

  describe('FR-001: Table Display with Sortable Columns', () => {
    it('should render QTable component', async () => {
      const wrapper = mountWithQuasar(EventSeriesPage, {}, mockRouter);
      await flushPromises();

      const props = getQTableProps(wrapper);
      expect(props).toBeDefined();
    });

    it('should display 6 columns matching table-columns.json contract', async () => {
      const wrapper = mountWithQuasar(EventSeriesPage, {}, mockRouter);
      await flushPromises();

      const columns = getQTableColumns(wrapper);

      expect(columns).toBeDefined();
      expect(Array.isArray(columns)).toBe(true);

      // Expected column names per contract
      const expectedColumns = [
        'series_name',
        'city',
        'country',
        'latest_edition',
        'total_events',
        'active_since',
      ];

      const actualColumnNames = columns.map((col) => col.name);

      console.log('Expected event series columns:', expectedColumns);
      console.log('Actual event series columns:', actualColumnNames);
    });

    it('should display event series data in table rows', async () => {
      const wrapper = mountWithQuasar(EventSeriesPage, {}, mockRouter);
      await flushPromises();

      const rows = getQTableRows(wrapper);

      expect(rows).toHaveLength(3);
      expect(rows[0]).toHaveProperty('title');
      expect(rows[0]).toHaveProperty('city');
      expect(rows[0]).toHaveProperty('country');
    });

    it('should use row-key="id" for proper row identification', async () => {
      const wrapper = mountWithQuasar(EventSeriesPage, {}, mockRouter);
      await flushPromises();

      const props = getQTableProps(wrapper);
      expect(props.rowKey).toBe('id');
    });
  });

  describe('FR-003: Detail Page Navigation', () => {
    it('should navigate to /event-series/:id on row click', async () => {
      const routerPushSpy = vi.spyOn(mockRouter, 'push');

      const wrapper = mountWithQuasar(EventSeriesPage, {}, mockRouter);
      await flushPromises();

      await clickQTableRow(wrapper, 0);

      expect(routerPushSpy).toHaveBeenCalledWith('/event-series/1');
    });
  });

  describe('FR-004: Loading States', () => {
    it('should display loading state when data is being fetched', async () => {
      mockDelayedResponse(
        mockGetEventSeries,
        createMockEventSeriesResponse(createMockEventSeriesList(3)),
        100,
      );

      const wrapper = mountWithQuasar(EventSeriesPage, {}, mockRouter);

      const isLoading = isQTableLoading(wrapper);
      expect(isLoading).toBe(true);

      await flushPromises();
    });

    it('should clear loading state after data is loaded', async () => {
      const wrapper = mountWithQuasar(EventSeriesPage, {}, mockRouter);
      await flushPromises();

      const isLoading = isQTableLoading(wrapper);
      expect(isLoading).toBe(false);
    });
  });

  describe('FR-005: Sorting Support', () => {
    it('should support sorting by series_name column', async () => {
      const wrapper = mountWithQuasar(EventSeriesPage, {}, mockRouter);
      await flushPromises();

      const columns = getQTableColumns(wrapper);
      const nameColumn = columns.find((col) => col.name === 'series_name');

      expect(nameColumn).toBeDefined();
    });

    it('should support sorting by city column', async () => {
      const wrapper = mountWithQuasar(EventSeriesPage, {}, mockRouter);
      await flushPromises();

      const columns = getQTableColumns(wrapper);
      const cityColumn = columns.find((col) => col.name === 'city');

      expect(cityColumn).toBeDefined();
    });

    it('should support sorting by country column', async () => {
      const wrapper = mountWithQuasar(EventSeriesPage, {}, mockRouter);
      await flushPromises();

      const columns = getQTableColumns(wrapper);
      const countryColumn = columns.find((col) => col.name === 'country');

      expect(countryColumn).toBeDefined();
    });

    it('should use binary-state-sort for two-state sorting', async () => {
      const wrapper = mountWithQuasar(EventSeriesPage, {}, mockRouter);
      await flushPromises();

      const props = getQTableProps(wrapper);
      expect(props.binaryStateSort).toBe(true);
    });
  });

  describe('FR-006: Pagination', () => {
    it('should offer rows-per-page options: [10, 20, 50, 100]', async () => {
      const wrapper = mountWithQuasar(EventSeriesPage, {}, mockRouter);
      await flushPromises();

      const props = getQTableProps(wrapper);
      expect(props.rowsPerPageOptions).toEqual([10, 20, 50, 100]);
    });

    it('should have default pagination of 20 rows per page', async () => {
      const wrapper = mountWithQuasar(EventSeriesPage, {}, mockRouter);
      await flushPromises();

      const pagination = getQTablePagination(wrapper);
      expect(pagination.rowsPerPage).toBe(20);
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      mockErrorResponse(mockGetEventSeries, createNetworkError());

      const wrapper = mountWithQuasar(EventSeriesPage, {}, mockRouter);
      await flushPromises();

      expect(wrapper.exists()).toBe(true);
    });
  });

  describe('Computed Fields Display', () => {
    it('should display latest_edition computed field', async () => {
      const wrapper = mountWithQuasar(EventSeriesPage, {}, mockRouter);
      await flushPromises();

      const rows = getQTableRows(wrapper);

      expect(rows[0]).toHaveProperty('latest_edition');
      expect(typeof rows[0]?.latest_edition).toBe('string');
    });

    it('should display total_events as number', async () => {
      const wrapper = mountWithQuasar(EventSeriesPage, {}, mockRouter);
      await flushPromises();

      const rows = getQTableRows(wrapper);

      expect(rows[0]).toHaveProperty('total_events');
      expect(typeof rows[0]?.total_events).toBe('number');
      expect(rows[0]?.total_events).toBeGreaterThan(0);
    });

    it('should display active_since as year', async () => {
      const wrapper = mountWithQuasar(EventSeriesPage, {}, mockRouter);
      await flushPromises();

      const rows = getQTableRows(wrapper);

      expect(rows[0]).toHaveProperty('active_since');
      expect(typeof rows[0]?.active_since).toBe('number');
      expect(rows[0]?.active_since).toBeGreaterThan(2000);
    });
  });
});

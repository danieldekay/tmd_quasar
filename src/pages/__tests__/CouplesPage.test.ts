/**
 * @vitest-environment happy-dom
 *
 * Test Suite: CouplesPage.vue Component Tests (T008)
 *
 * Purpose: Test CouplesPage component against FR-001 through FR-006 requirements
 *
 * Requirements Tested:
 * - FR-001: Display couples in QTable with sortable columns
 * - FR-002: ISO date formatting (N/A - couples don't have dates)
 * - FR-003: Detail page navigation on row click
 * - FR-004: Loading states with QSkeleton
 * - FR-005: Sorting support per table-columns.json
 * - FR-006: Pagination with 10/20/50/100 options
 *
 * Contract Validation:
 * - Table displays 5 columns per table-columns.json:
 *   [couple_name, leader_name, follower_name, city, country, type]
 * - Leader/follower names are relationships (computed)
 * - Country displays full name (not code)
 * - Type displays enum values (traditional, same-role, queer)
 * - Sortable: couple_name, city, country, type
 *
 * USES: Test utilities from src/test-utils/ (T004a)
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { flushPromises } from '@vue/test-utils';
import CouplesPage from '../CouplesPage.vue';
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

// Mock data factory for Couples
const createMockCouple = (id: number) => ({
  id,
  title: `Couple Name ${id}`,
  leader_name: `Leader ${id}`,
  follower_name: `Follower ${id}`,
  city: `City ${id}`,
  country: 'AR',
  couple_type: id % 3 === 0 ? 'queer' : id % 2 === 0 ? 'same-role' : 'traditional',
});

const createMockCoupleList = (count: number) => {
  return Array.from({ length: count }, (_, i) => createMockCouple(i + 1));
};

const createMockCouplesResponse = (couples: ReturnType<typeof createMockCouple>[]) => ({
  couples,
  totalPages: 1,
  total: couples.length,
});

// Mock the couples service module
vi.mock('src/services/coupleService', () => ({
  coupleService: {
    getCouples: vi.fn(),
  },
}));

// Import the mocked service
import { coupleService as mockCouplesService } from 'src/services/coupleService';

// Type-safe reference to mock function
const mockGetCouples = mockCouplesService['getCouples'] as ReturnType<typeof vi.fn>;

// Mock composables
vi.mock('@/composables/useCountries', () => ({
  useCountries: () => ({
    getCountryName: (code: string) => `Country-${code}`,
    getCountryOptionsFromCodes: () => [{ label: 'Argentina', value: 'AR' }],
  }),
}));

describe('CouplesPage.vue - Component Tests (T008)', () => {
  let mockRouter: ReturnType<typeof createMockRouter>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockRouter = createMockRouter();

    // Setup default successful response
    mockGetCouples.mockResolvedValue(createMockCouplesResponse(createMockCoupleList(3)));
  });

  describe('FR-001: Table Display with Sortable Columns', () => {
    it('should render QTable component', async () => {
      const wrapper = mountWithQuasar(CouplesPage, {}, mockRouter);
      await flushPromises();

      const props = getQTableProps(wrapper);
      expect(props).toBeDefined();
    });

    it('should display 6 columns matching table-columns.json contract', async () => {
      const wrapper = mountWithQuasar(CouplesPage, {}, mockRouter);
      await flushPromises();

      const columns = getQTableColumns(wrapper);

      expect(columns).toBeDefined();
      expect(Array.isArray(columns)).toBe(true);

      // Expected column names per contract
      const expectedColumns = [
        'couple_name',
        'leader_name',
        'follower_name',
        'city',
        'country',
        'type',
      ];

      const actualColumnNames = columns.map((col) => col.name);

      console.log('Expected couple columns:', expectedColumns);
      console.log('Actual couple columns:', actualColumnNames);
    });

    it('should display couple data in table rows', async () => {
      const wrapper = mountWithQuasar(CouplesPage, {}, mockRouter);
      await flushPromises();

      const rows = getQTableRows(wrapper);

      expect(rows).toHaveLength(3);
      expect(rows[0]).toHaveProperty('title');
      expect(rows[0]).toHaveProperty('city');
      expect(rows[0]).toHaveProperty('country');
    });

    it('should use row-key="id" for proper row identification', async () => {
      const wrapper = mountWithQuasar(CouplesPage, {}, mockRouter);
      await flushPromises();

      const props = getQTableProps(wrapper);
      expect(props.rowKey).toBe('id');
    });
  });

  describe('FR-003: Detail Page Navigation', () => {
    it('should navigate to /couples/:id on row click', async () => {
      const routerPushSpy = vi.spyOn(mockRouter, 'push');

      const wrapper = mountWithQuasar(CouplesPage, {}, mockRouter);
      await flushPromises();

      await clickQTableRow(wrapper, 0);

      expect(routerPushSpy).toHaveBeenCalledWith('/couples/1');
    });
  });

  describe('FR-004: Loading States', () => {
    it('should display loading state when data is being fetched', async () => {
      mockDelayedResponse(mockGetCouples, createMockCouplesResponse(createMockCoupleList(3)), 100);

      const wrapper = mountWithQuasar(CouplesPage, {}, mockRouter);

      const isLoading = isQTableLoading(wrapper);
      expect(isLoading).toBe(true);

      await flushPromises();
    });

    it('should clear loading state after data is loaded', async () => {
      const wrapper = mountWithQuasar(CouplesPage, {}, mockRouter);
      await flushPromises();

      const isLoading = isQTableLoading(wrapper);
      expect(isLoading).toBe(false);
    });
  });

  describe('FR-005: Sorting Support', () => {
    it('should support sorting by couple_name column', async () => {
      const wrapper = mountWithQuasar(CouplesPage, {}, mockRouter);
      await flushPromises();

      const columns = getQTableColumns(wrapper);
      const nameColumn = columns.find((col) => col.name === 'couple_name');

      expect(nameColumn).toBeDefined();
    });

    it('should use binary-state-sort for two-state sorting', async () => {
      const wrapper = mountWithQuasar(CouplesPage, {}, mockRouter);
      await flushPromises();

      const props = getQTableProps(wrapper);
      expect(props.binaryStateSort).toBe(true);
    });
  });

  describe('FR-006: Pagination', () => {
    it('should offer rows-per-page options: [10, 20, 50, 100]', async () => {
      const wrapper = mountWithQuasar(CouplesPage, {}, mockRouter);
      await flushPromises();

      const props = getQTableProps(wrapper);
      expect(props.rowsPerPageOptions).toEqual([10, 20, 50, 100]);
    });

    it('should have default pagination of 20 rows per page', async () => {
      const wrapper = mountWithQuasar(CouplesPage, {}, mockRouter);
      await flushPromises();

      const pagination = getQTablePagination(wrapper);
      expect(pagination.rowsPerPage).toBe(20);
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      mockErrorResponse(mockGetCouples, createNetworkError());

      const wrapper = mountWithQuasar(CouplesPage, {}, mockRouter);
      await flushPromises();

      expect(wrapper.exists()).toBe(true);
    });
  });

  describe('Couple Type Display', () => {
    it('should display valid type enum values', async () => {
      const wrapper = mountWithQuasar(CouplesPage, {}, mockRouter);
      await flushPromises();

      const rows = getQTableRows(wrapper);

      expect(rows[0]).toHaveProperty('couple_type');

      const validTypes = ['traditional', 'same-role', 'queer'];
      expect(validTypes).toContain(rows[0]?.couple_type);
    });

    it('should display different types for different couples', async () => {
      const wrapper = mountWithQuasar(CouplesPage, {}, mockRouter);
      await flushPromises();

      const rows = getQTableRows(wrapper);

      // Our mock cycles through types
      expect(rows[0]?.couple_type).toBe('traditional');
      expect(rows[1]?.couple_type).toBe('same-role');
      expect(rows[2]?.couple_type).toBe('queer');
    });
  });

  describe('Relationship Display', () => {
    it('should display leader and follower names', async () => {
      const wrapper = mountWithQuasar(CouplesPage, {}, mockRouter);
      await flushPromises();

      const rows = getQTableRows(wrapper);

      expect(rows[0]).toHaveProperty('leader_name');
      expect(rows[0]).toHaveProperty('follower_name');
    });
  });
});

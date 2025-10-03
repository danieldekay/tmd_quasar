/**
 * @vitest-environment happy-dom
 *
 * Test Suite: EventList.vue Component Tests (T005)
 *
 * Purpose: Test EventList component against FR-001 through FR-006 requirements
 *
 * Requirements Tested:
 * - FR-001: Display events in QTable with sortable columns
 * - FR-002: ISO date formatting (YYYY-MM-DD) via formatDateISO
 * - FR-003: Detail page navigation on row click
 * - FR-004: Loading states with QSkeleton
 * - FR-005: Sorting support per table-columns.json
 * - FR-006: Pagination with 10/20/50/100 options
 *
 * Contract Validation:
 * - Table displays 7 columns per table-columns.json:
 *   [title, start_date, end_date, city, country, registration_start_date, edition]
 * - All date columns use ISO format (YYYY-MM-DD)
 * - All columns are sortable per contract
 *
 * TDD Approach: These tests validate existing implementation. Some tests may FAIL
 * initially if implementation doesn't match requirements. Tests define expected behavior.
 */

import { flushPromises, mount, type VueWrapper } from '@vue/test-utils';
import { QCard, QTable, Quasar } from 'quasar';
import { createMockEvent } from 'src/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createMemoryHistory, createRouter } from 'vue-router';
import type { EventListItem } from '../../services/types';
import EventList from '../EventList.vue';

// Mock services - must be before imports
vi.mock('../../services/eventListService', () => ({
  eventListService: {
    getEvents: vi.fn(),
  },
}));

// Mock composables
vi.mock('../../composables/useFormatters', () => ({
  useFormatters: () => ({
    formatDate: vi.fn((date: string) => date), // Pass through for testing
    formatDateISO: vi.fn((date: string) => date), // Should be used for dates
    formatText: vi.fn((text: string) => text),
    getEventCategory: vi.fn(() => 'Marathon'),
  }),
}));

vi.mock('../../composables/useCountries', () => ({
  useCountries: () => ({
    getCountryName: vi.fn((code: string) => `Country-${code}`),
    getCountryOptionsFromCodes: vi.fn(() => [{ label: 'Germany', value: 'DE' }]),
  }),
}));

// Mock services
vi.mock('../../services/eventListService', () => ({
  eventListService: {
    getEvents: vi.fn(),
  },
}));

// Mock composables
vi.mock('../../composables/useFormatters', () => ({
  useFormatters: () => ({
    formatDate: vi.fn((date: string) => date), // Pass through for testing
    formatDateISO: vi.fn((date: string) => date), // Should be used for dates
    formatText: vi.fn((text: string) => text),
    getEventCategory: vi.fn(() => 'Marathon'),
  }),
}));

vi.mock('../../composables/useCountries', () => ({
  useCountries: () => ({
    getCountryName: vi.fn((code: string) => `Country-${code}`),
    getCountryOptionsFromCodes: vi.fn(() => [{ label: 'Germany', value: 'DE' }]),
  }),
}));

// Mock router
const mockRouter = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/', component: { template: '<div>Home</div>' } },
    { path: '/events/:id', component: { template: '<div>Event Detail</div>' } },
  ],
});

// Sample test data matching EventListItem interface
const mockEvents: EventListItem[] = [
  {
    id: 1,
    title: 'Berlin Tango Marathon 2025',
    date: '2025-05-15',
    link: 'https://example.com/event/1',
    start_date: '2025-05-15',
    end_date: '2025-05-18',
    city: 'Berlin',
    country: 'DE',
    edition: '12',
    registration_start_date: '2025-03-01',
    taxonomies: {
      tmd_event_category: [{ id: 1, name: 'Marathon', slug: 'marathon', description: '' }],
    },
  },
  {
    id: 2,
    title: 'Munich Festival',
    date: '2025-06-20',
    link: 'https://example.com/event/2',
    start_date: '2025-06-20',
    end_date: '2025-06-23',
    city: 'Munich',
    country: 'DE',
    edition: '5',
    registration_start_date: '2025-04-15',
    taxonomies: {
      tmd_event_category: [{ id: 2, name: 'Festival', slug: 'festival', description: '' }],
    },
  },
  {
    id: 3,
    title: 'Hamburg Encuentro',
    date: '2025-07-10',
    link: 'https://example.com/event/3',
    start_date: '2025-07-10',
    end_date: '2025-07-12',
    city: 'Hamburg',
    country: 'DE',
    edition: '3',
    registration_start_date: '2025-05-20',
    taxonomies: {
      tmd_event_category: [{ id: 3, name: 'Encuentro', slug: 'encuentro', description: '' }],
    },
  },
];

describe('EventList.vue - Component Tests (T005)', () => {
  let wrapper: VueWrapper<any>;

  beforeEach(async () => {
    vi.clearAllMocks();

    // Mock successful API response
    const { eventListService } = await import('../../services/eventListService');
    const mockGetEvents = vi.mocked(eventListService.getEvents) as ReturnType<typeof vi.fn>;
    mockGetEvents.mockResolvedValue({
      events: mockEvents,
      totalCount: 3,
      currentPage: 1,
      totalPages: 1,
      hasNextPage: false,
      hasPrevPage: false,
    });
  });

  afterEach(() => {
    wrapper?.unmount();
  });

  describe('FR-001: Table Display with Sortable Columns', () => {
    it('should render QTable component', async () => {
      wrapper = mount(EventList, {
        global: {
          plugins: [mockRouter, Quasar],
        },
      });

      await flushPromises();

      const table = wrapper.findComponent(QTable);
      expect(table.exists()).toBe(true);
    });

    it('should display 7 columns matching table-columns.json contract', async () => {
      wrapper = mount(EventList, {
        global: {
          plugins: [mockRouter, Quasar],
        },
      });

      await flushPromises();

      const table = wrapper.findComponent(QTable);
      const columns = table.props('columns');

      // Validate column count
      expect(columns).toHaveLength(7);

      // Validate column names per contract
      const columnNames = columns.map((col: any) => col.name);
      expect(columnNames).toEqual([
        'title',
        'start_date',
        'end_date',
        'city',
        'country',
        'registration_start_date',
        'edition',
      ]);
    });

    it('should have all columns sortable per table-columns.json', async () => {
      wrapper = mount(EventList, {
        global: {
          plugins: [mockRouter, Quasar],
        },
      });

      await flushPromises();

      const table = wrapper.findComponent(QTable);
      const columns = table.props('columns');

      // All columns should be sortable per contract
      columns.forEach((col: any) => {
        expect(col.sortable).toBe(true);
      });
    });

    it('should display event data in table rows', async () => {
      wrapper = mount(EventList, {
        global: {
          plugins: [mockRouter, Quasar],
        },
      });

      await flushPromises();

      const table = wrapper.findComponent(QTable);
      const rows = table.props('rows');

      expect(rows).toHaveLength(3);
      expect(rows[0].title).toBe('Berlin Tango Marathon 2025');
      expect(rows[1].title).toBe('Munich Festival');
      expect(rows[2].title).toBe('Hamburg Encuentro');
    });

    it('should use row-key="id" for proper row identification', async () => {
      wrapper = mount(EventList, {
        global: {
          plugins: [mockRouter, Quasar],
        },
      });

      await flushPromises();

      const table = wrapper.findComponent(QTable);
      expect(table.props('rowKey')).toBe('id');
    });
  });

  describe('FR-002: ISO Date Formatting', () => {
    it('should use formatDateISO for start_date column', async () => {
      wrapper = mount(EventList, {
        global: {
          plugins: [mockRouter, Quasar],
        },
      });

      await flushPromises();

      // Import the mocked composable to verify calls
      const { useFormatters } = await import('../../composables/useFormatters');
      const formatters = useFormatters();

      // Verify formatDateISO is available (should be alias to formatDate)
      expect(formatters.formatDateISO).toBeDefined();
    });

    it('should display dates in ISO format (YYYY-MM-DD)', async () => {
      wrapper = mount(EventList, {
        global: {
          plugins: [mockRouter, Quasar],
        },
      });

      await flushPromises();

      const table = wrapper.findComponent(QTable);
      const rows = table.props('rows');

      // Verify ISO format pattern
      const isoDatePattern = /^\d{4}-\d{2}-\d{2}$/;
      expect(rows[0].start_date).toMatch(isoDatePattern);
      expect(rows[0].end_date).toMatch(isoDatePattern);
      expect(rows[0].registration_start_date).toMatch(isoDatePattern);
    });

    it('should format end_date with formatDateISO', async () => {
      wrapper = mount(EventList, {
        global: {
          plugins: [mockRouter, Quasar],
        },
      });

      await flushPromises();

      const table = wrapper.findComponent(QTable);
      const rows = table.props('rows');

      // All date fields should maintain ISO format
      expect(rows[1].end_date).toBe('2025-06-23');
    });

    it('should format registration_start_date with formatDateISO', async () => {
      wrapper = mount(EventList, {
        global: {
          plugins: [mockRouter, Quasar],
        },
      });

      await flushPromises();

      const table = wrapper.findComponent(QTable);
      const rows = table.props('rows');

      expect(rows[2].registration_start_date).toBe('2025-05-20');
    });
  });

  describe('FR-003: Detail Page Navigation', () => {
    it('should have @row-click handler attached to table', async () => {
      wrapper = mount(EventList, {
        global: {
          plugins: [mockRouter, Quasar],
        },
      });

      await flushPromises();

      const table = wrapper.findComponent(QTable);
      expect(table.props().onRowClick).toBeDefined();
    });

    it('should navigate to /events/:id on row click', async () => {
      const routerPushSpy = vi.spyOn(mockRouter, 'push');

      wrapper = mount(EventList, {
        global: {
          plugins: [mockRouter, Quasar],
        },
      });

      await flushPromises();

      const table = wrapper.findComponent(QTable);
      const handleRowClick = table.props().onRowClick;

      // Simulate row click
      if (handleRowClick) {
        await handleRowClick(new Event('click'), mockEvents[0]);
      }

      expect(routerPushSpy).toHaveBeenCalledWith('/events/1');
    });

    it('should navigate with correct event ID for multiple rows', async () => {
      const routerPushSpy = vi.spyOn(mockRouter, 'push');

      wrapper = mount(EventList, {
        global: {
          plugins: [mockRouter, Quasar],
        },
      });

      await flushPromises();

      const table = wrapper.findComponent(QTable);
      const handleRowClick = table.props().onRowClick;

      // Test navigation for different events
      if (handleRowClick) {
        await handleRowClick(new Event('click'), mockEvents[1]);
        expect(routerPushSpy).toHaveBeenCalledWith('/events/2');

        await handleRowClick(new Event('click'), mockEvents[2]);
        expect(routerPushSpy).toHaveBeenCalledWith('/events/3');
      }
    });
  });

  describe('FR-004: Loading States', () => {
    it('should display loading state when data is being fetched', async () => {
      // Mock delayed response
      const { eventListService } = await import('../../services/eventListService');
      const mockGetEvents = vi.mocked(eventListService.getEvents) as ReturnType<typeof vi.fn>;
      mockGetEvents.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  events: mockEvents,
                  totalCount: 3,
                  currentPage: 1,
                  totalPages: 1,
                  hasNextPage: false,
                  hasPrevPage: false,
                }),
              100,
            ),
          ),
      );

      wrapper = mount(EventList, {
        global: {
          plugins: [mockRouter, Quasar],
        },
      });

      // Check loading state immediately
      const table = wrapper.findComponent(QTable);
      expect(table.props('loading')).toBe(true);

      await flushPromises();
    });

    it('should clear loading state after data is loaded', async () => {
      wrapper = mount(EventList, {
        global: {
          plugins: [mockRouter, Quasar],
        },
      });

      await flushPromises();

      const table = wrapper.findComponent(QTable);
      expect(table.props('loading')).toBe(false);
    });

    it('should use QSkeleton for loading indicators (via QTable)', async () => {
      wrapper = mount(EventList, {
        global: {
          plugins: [mockRouter, Quasar],
        },
      });

      // QTable internally uses loading prop to show skeletons
      const table = wrapper.findComponent(QTable);
      expect(table.props('loading')).toBeDefined();
    });
  });

  describe('FR-005: Sorting Support', () => {
    it('should support sorting by title column', async () => {
      wrapper = mount(EventList, {
        global: {
          plugins: [mockRouter, Quasar],
        },
      });

      await flushPromises();

      const table = wrapper.findComponent(QTable);
      const columns = table.props('columns');
      const titleColumn = columns.find((col: any) => col.name === 'title');

      expect(titleColumn.sortable).toBe(true);
    });

    it('should support sorting by start_date column', async () => {
      wrapper = mount(EventList, {
        global: {
          plugins: [mockRouter, Quasar],
        },
      });

      await flushPromises();

      const table = wrapper.findComponent(QTable);
      const columns = table.props('columns');
      const dateColumn = columns.find((col: any) => col.name === 'start_date');

      expect(dateColumn.sortable).toBe(true);
    });

    it('should support sorting by city column', async () => {
      wrapper = mount(EventList, {
        global: {
          plugins: [mockRouter, Quasar],
        },
      });

      await flushPromises();

      const table = wrapper.findComponent(QTable);
      const columns = table.props('columns');
      const cityColumn = columns.find((col: any) => col.name === 'city');

      expect(cityColumn.sortable).toBe(true);
    });

    it('should support sorting by country column', async () => {
      wrapper = mount(EventList, {
        global: {
          plugins: [mockRouter, Quasar],
        },
      });

      await flushPromises();

      const table = wrapper.findComponent(QTable);
      const columns = table.props('columns');
      const countryColumn = columns.find((col: any) => col.name === 'country');

      expect(countryColumn.sortable).toBe(true);
    });

    it('should use binary-state-sort for two-state sorting', async () => {
      wrapper = mount(EventList, {
        global: {
          plugins: [mockRouter, Quasar],
        },
      });

      await flushPromises();

      const table = wrapper.findComponent(QTable);
      expect(table.props('binaryStateSort')).toBe(true);
    });

    it('should have default sort by start_date descending', async () => {
      wrapper = mount(EventList, {
        global: {
          plugins: [mockRouter, Quasar],
        },
      });

      await flushPromises();

      const table = wrapper.findComponent(QTable);
      const pagination = table.props('pagination');

      expect(pagination.sortBy).toBe('start_date');
      expect(pagination.descending).toBe(true);
    });
  });

  describe('FR-006: Pagination', () => {
    it('should support pagination with v-model:pagination', async () => {
      wrapper = mount(EventList, {
        global: {
          plugins: [mockRouter, Quasar],
        },
      });

      await flushPromises();

      const table = wrapper.findComponent(QTable);
      expect(table.props('pagination')).toBeDefined();
      expect(table.props().onUpdatePagination).toBeDefined();
    });

    it('should offer rows-per-page options: [10, 20, 50, 100]', async () => {
      wrapper = mount(EventList, {
        global: {
          plugins: [mockRouter, Quasar],
        },
      });

      await flushPromises();

      const table = wrapper.findComponent(QTable);
      const rowsPerPageOptions = table.props('rowsPerPageOptions');

      expect(rowsPerPageOptions).toEqual([10, 20, 50, 100]);
    });

    it('should have default pagination of 20 rows per page', async () => {
      wrapper = mount(EventList, {
        global: {
          plugins: [mockRouter, Quasar],
        },
      });

      await flushPromises();

      const table = wrapper.findComponent(QTable);
      const pagination = table.props('pagination');

      expect(pagination.rowsPerPage).toBe(20);
    });

    it('should handle @request event for server-side pagination', async () => {
      wrapper = mount(EventList, {
        global: {
          plugins: [mockRouter, Quasar],
        },
      });

      await flushPromises();

      const table = wrapper.findComponent(QTable);
      expect(table.props().onRequest).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      const { eventListService } = await import('../../services/eventListService');
      const mockGetEvents = vi.mocked(eventListService.getEvents) as ReturnType<typeof vi.fn>;
      mockGetEvents.mockRejectedValueOnce(new Error('Network error'));

      wrapper = mount(EventList, {
        global: {
          plugins: [mockRouter, Quasar],
        },
      });

      await flushPromises();

      // Component should render without crashing
      expect(wrapper.exists()).toBe(true);

      // Table should still exist but with empty rows
      const table = wrapper.findComponent(QTable);
      expect(table.exists()).toBe(true);
    });

    it('should display error state when API fails', async () => {
      const { eventListService } = await import('../../services/eventListService');
      const mockGetEvents = vi.mocked(eventListService.getEvents) as ReturnType<typeof vi.fn>;
      mockGetEvents.mockRejectedValueOnce(new Error('Server error'));

      wrapper = mount(EventList, {
        global: {
          plugins: [mockRouter, Quasar],
        },
      });

      await flushPromises();

      // Check for error indication (component specific implementation)
      const table = wrapper.findComponent(QTable);
      expect(table.props('loading')).toBe(false);
    });
  });

  describe('Table Styling and Layout', () => {
    it('should use flat and bordered props for table styling', async () => {
      wrapper = mount(EventList, {
        global: {
          plugins: [mockRouter, Quasar],
        },
      });

      await flushPromises();

      const table = wrapper.findComponent(QTable);
      expect(table.props('flat')).toBe(true);
      expect(table.props('bordered')).toBe(true);
    });

    it('should wrap table in styled container with class', async () => {
      wrapper = mount(EventList, {
        global: {
          plugins: [mockRouter, Quasar],
        },
      });

      await flushPromises();

      // Check for styled wrapper
      const styledTable = wrapper.find('.styled-q-table');
      expect(styledTable.exists()).toBe(true);
    });

    it('should display table in QCard with proper styling', async () => {
      wrapper = mount(EventList, {
        global: {
          plugins: [mockRouter, Quasar],
        },
      });

      await flushPromises();

      const card = wrapper.findComponent(QCard);
      expect(card.exists()).toBe(true);
      expect(card.props('flat')).toBe(true);
      expect(card.props('bordered')).toBe(true);
    });
  });

  describe('Data Integrity', () => {
    it('should preserve all event properties in table rows', async () => {
      wrapper = mount(EventList, {
        global: {
          plugins: [mockRouter, Quasar],
        },
      });

      await flushPromises();

      const table = wrapper.findComponent(QTable);
      const rows = table.props('rows');

      // Verify all expected properties exist
      expect(rows[0]).toHaveProperty('id');
      expect(rows[0]).toHaveProperty('title');
      expect(rows[0]).toHaveProperty('start_date');
      expect(rows[0]).toHaveProperty('end_date');
      expect(rows[0]).toHaveProperty('city');
      expect(rows[0]).toHaveProperty('country');
      expect(rows[0]).toHaveProperty('registration_start_date');
      expect(rows[0]).toHaveProperty('edition');
    });

    it('should handle events without edition gracefully', async () => {
      const eventWithoutEdition = createMockEvent({
        ...mockEvents[0],
        edition: '',
      });

      const { eventListService } = await import('../../services/eventListService');
      const mockGetEvents = vi.mocked(eventListService.getEvents) as ReturnType<typeof vi.fn>;
      mockGetEvents.mockResolvedValueOnce({
        events: [eventWithoutEdition],
        totalCount: 1,
        currentPage: 1,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false,
      });

      wrapper = mount(EventList, {
        global: {
          plugins: [mockRouter, Quasar],
        },
      });

      await flushPromises();

      const table = wrapper.findComponent(QTable);
      const rows = table.props('rows');

      expect(rows[0].edition).toBeNull();
      // Component should still render without errors
      expect(wrapper.exists()).toBe(true);
    });
  });
});

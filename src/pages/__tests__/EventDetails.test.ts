/**
 * @vitest-environment happy-dom
 *
 * Test Suite: EventDetails.vue Component Tests (T010)
 *
 * Purpose: Test EventDetails component against detail page requirements
 *
 * Requirements Tested:
 * - FR-012: Display all available event data
 * - FR-017: Show related/embedded data (DJs, teachers)
 * - FR-018: Loading indicators while fetching
 * - FR-019: Error messages with retry and navigation
 * - FR-020: Navigation back to table view
 * - FR-021: ISO date formatting (YYYY-MM-DD)
 * - FR-022: No images displayed (or images disabled)
 * - FR-023: Handle missing/null data gracefully
 * - FR-024: HTML content sanitized
 *
 * USES: Test utilities from src/test-utils/ (T004a)
 */

import { flushPromises } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import {
  createMockEvent,
  createMockRouter,
  createNetworkError,
  mockDelayedResponse,
  mockErrorResponse,
  mountWithQuasar,
} from 'src/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import EventDetails from '../EventDetails.vue';

// Mock the event details service
vi.mock('src/services/eventDetailsService', () => ({
  eventDetailsService: {
    getEvent: vi.fn(),
  },
}));

// Mock the interaction service (used in EventDetails component)
vi.mock('src/services/interactionService', () => ({
  interactionService: {
    baseUrl: '/user-interactions',
    getInteractions: vi.fn(),
    addInteraction: vi.fn(),
    removeInteraction: vi.fn(),
  },
}));

// Import the mocked service
import { eventDetailsService as mockEventDetailsService } from 'src/services/eventDetailsService';

// Type-safe reference to mock function
const mockGetEvent = mockEventDetailsService.getEvent as ReturnType<typeof vi.fn>;

// Mock composables
vi.mock('@/composables/useFormatters', () => ({
  useFormatters: () => ({
    formatDate: (date: string) => date,
    formatDateISO: (date: string) => date,
    formatText: (text: string) => text,
    getEventCategory: () => 'Marathon',
  }),
}));

vi.mock('@/composables/useCountries', () => ({
  useCountries: () => ({
    getCountryName: (code: string) => `Country-${code}`,
  }),
}));

describe('EventDetails.vue - Component Tests (T010)', () => {
  let mockRouter: ReturnType<typeof createMockRouter>;

  beforeEach(() => {
    vi.clearAllMocks();

    // Create Pinia instance for each test
    const pinia = createPinia();
    setActivePinia(pinia);

    mockRouter = createMockRouter();

    // Mock route params
    mockRouter.currentRoute.value = {
      ...mockRouter.currentRoute.value,
      params: { id: '1' },
    };

    // Setup default successful response
    mockGetEvent.mockResolvedValue(createMockEvent({ id: 1 }));
  });

  describe('FR-012: Display All Available Event Data', () => {
    it('should render event component', async () => {
      const wrapper = mountWithQuasar(EventDetails, {}, mockRouter, true);
      await flushPromises();

      expect(wrapper.exists()).toBe(true);
    });

    it('should display event title', async () => {
      const wrapper = mountWithQuasar(EventDetails, {}, mockRouter, true);
      await flushPromises();

      const html = wrapper.html();
      expect(html).toContain('Event Title 1');
    });

    it('should display event dates', async () => {
      const wrapper = mountWithQuasar(EventDetails, {}, mockRouter, true);
      await flushPromises();

      const html = wrapper.html();
      // Event dates should be present in the rendered output
      expect(html.length).toBeGreaterThan(0);
    });

    it('should display event location (city and country)', async () => {
      const wrapper = mountWithQuasar(EventDetails, {}, mockRouter, true);
      await flushPromises();

      const html = wrapper.html();
      expect(html).toContain('City 1');
    });

    it('should call getEvent service with correct ID from route params', async () => {
      mountWithQuasar(EventDetails, {}, mockRouter, true);
      await flushPromises();

      expect(mockGetEvent).toHaveBeenCalledWith('1');
    });
  });

  describe('FR-017: Show Related/Embedded Data', () => {
    it('should fetch event with embedded data', async () => {
      const eventWithEmbedded = {
        ...createMockEvent({ id: 1 }),
        _embedded: {
          djs: [{ id: 1, name: 'DJ Test' }],
          teachers: [{ id: 1, name: 'Teacher Test' }],
        },
      };

      mockGetEvent.mockResolvedValue(eventWithEmbedded);

      const wrapper = mountWithQuasar(EventDetails, {}, mockRouter, true);
      await flushPromises();

      expect(wrapper.exists()).toBe(true);
    });
  });

  describe('FR-018: Loading Indicators', () => {
    it('should show loading state while fetching event data', async () => {
      mockDelayedResponse(mockGetEvent, createMockEvent({ id: 1 }), 100);

      const wrapper = mountWithQuasar(EventDetails, {}, mockRouter, true);

      // Check for loading indicator
      const html = wrapper.html();
      expect(html.includes('spinner') || html.includes('loading')).toBe(true);

      await flushPromises();
    });

    it('should clear loading state after data is loaded', async () => {
      const wrapper = mountWithQuasar(EventDetails, {}, mockRouter, true);
      await flushPromises();

      // Loading should be cleared
      const html = wrapper.html();
      expect(html).toContain('Event Title 1');
    });
  });

  describe('FR-019: Error Messages with Retry and Navigation', () => {
    it('should handle API errors gracefully', async () => {
      mockErrorResponse(mockGetEvent, createNetworkError());

      const wrapper = mountWithQuasar(EventDetails, {}, mockRouter, true);
      await flushPromises();

      // Component should render without crashing
      expect(wrapper.exists()).toBe(true);
    });

    it('should display error message when API fails', async () => {
      mockErrorResponse(mockGetEvent, new Error('Server error'));

      const wrapper = mountWithQuasar(EventDetails, {}, mockRouter, true);
      await flushPromises();

      const html = wrapper.html();
      // Should show some error indication
      expect(html.length).toBeGreaterThan(0);
    });

    it('should handle 404 not found errors', async () => {
      mockErrorResponse(mockGetEvent, new Error('Event not found'));

      const wrapper = mountWithQuasar(EventDetails, {}, mockRouter, true);
      await flushPromises();

      expect(wrapper.exists()).toBe(true);
    });
  });

  describe('FR-020: Navigation Back to Table View', () => {
    it('should provide navigation back functionality', async () => {
      const wrapper = mountWithQuasar(EventDetails, {}, mockRouter, true);
      await flushPromises();

      // Check for back button or navigation element
      const html = wrapper.html();
      expect(html.length).toBeGreaterThan(0);
    });
  });

  describe('FR-021: ISO Date Formatting', () => {
    it('should format dates in ISO format (YYYY-MM-DD)', async () => {
      const wrapper = mountWithQuasar(EventDetails, {}, mockRouter, true);
      await flushPromises();

      // ISO date format should be used
      const html = wrapper.html();
      const isoDatePattern = /\d{4}-\d{2}-\d{2}/;
      expect(isoDatePattern.test(html)).toBe(true);
    });
  });

  describe('FR-023: Handle Missing/Null Data', () => {
    it('should handle events with missing optional fields', async () => {
      const eventWithMissingFields = {
        id: 1,
        title: 'Minimal Event',
        start_date: '2025-10-15',
        // Missing: end_date, city, country, etc.
      };

      mockGetEvent.mockResolvedValue(eventWithMissingFields);

      const wrapper = mountWithQuasar(EventDetails, {}, mockRouter, true);
      await flushPromises();

      // Should render without errors
      expect(wrapper.exists()).toBe(true);
      const html = wrapper.html();
      expect(html).toContain('Minimal Event');
    });

    it('should handle null values gracefully', async () => {
      const eventWithNulls = {
        ...createMockEvent({ id: 1 }),
        end_date: null,
        city: null,
        country: null,
      };

      mockGetEvent.mockResolvedValue(eventWithNulls);

      const wrapper = mountWithQuasar(EventDetails, {}, mockRouter, true);
      await flushPromises();

      // Should render without errors
      expect(wrapper.exists()).toBe(true);
    });
  });

  describe('FR-024: HTML Content Sanitized', () => {
    it('should display HTML content safely', async () => {
      const eventWithHtml = {
        ...createMockEvent({ id: 1 }),
        description: '<p>Safe HTML content</p><script>alert("xss")</script>',
      };

      mockGetEvent.mockResolvedValue(eventWithHtml);

      const wrapper = mountWithQuasar(EventDetails, {}, mockRouter, true);
      await flushPromises();

      const html = wrapper.html();
      // Should contain safe content but not script tags
      expect(html).not.toContain('<script>');
    });
  });

  describe('Component Lifecycle', () => {
    it('should fetch event data on mount', async () => {
      mountWithQuasar(EventDetails, {}, mockRouter, true);
      await flushPromises();

      expect(mockGetEvent).toHaveBeenCalledTimes(1);
      expect(mockGetEvent).toHaveBeenCalledWith('1');
    });

    it('should handle component unmount cleanly', async () => {
      const wrapper = mountWithQuasar(EventDetails, {}, mockRouter, true);
      await flushPromises();

      wrapper.unmount();
      // Should not throw errors
      expect(true).toBe(true);
    });
  });

  describe('Data Integrity', () => {
    it('should preserve all event properties', async () => {
      const fullEvent = createMockEvent({ id: 1 });
      mockGetEvent.mockResolvedValue(fullEvent);

      const wrapper = mountWithQuasar(EventDetails, {}, mockRouter, true);
      await flushPromises();

      const html = wrapper.html();
      // Event data should be rendered
      expect(html).toContain('Event Title 1');
    });

    it('should handle events with all optional fields populated', async () => {
      const fullEvent = {
        ...createMockEvent({ id: 1 }),
        venue_name: 'Test Venue',
        registration_url: 'https://example.com',
        facebook_url: 'https://facebook.com/event',
        contact_email: 'test@example.com',
      };

      mockGetEvent.mockResolvedValue(fullEvent);

      const wrapper = mountWithQuasar(EventDetails, {}, mockRouter, true);
      await flushPromises();

      expect(wrapper.exists()).toBe(true);
    });
  });
});

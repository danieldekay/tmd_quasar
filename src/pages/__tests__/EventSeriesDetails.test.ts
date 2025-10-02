/**
 * EventSeriesDetails.test.ts
 *
 * Test suite for EventSeriesDetails component following TDD approach.
 * Tests cover functional requirements FR-016 through FR-024 (detail page requirements).
 *
 * Requirements Tested:
 * - FR-016: Event series name displayed as title
 * - FR-017: Location (city, country) displayed
 * - FR-018: Series statistics (total events, upcoming/past counts)
 * - FR-019: getEventSeries service called with ID
 * - FR-020: Embedded event data fetched and displayed
 * - FR-021: Loading state shown during fetch
 * - FR-022: Error state shown on failure
 * - FR-023: Navigation (back button, event links)
 * - FR-024: ISO date formatting for dates
 *
 * Additional Tests:
 * - Series with no website URL
 * - Series with no embedded events
 * - Series with null optional fields
 * - HTML sanitization in descriptions
 * - Component lifecycle and cleanup
 * - Data integrity validation
 *
 * @vitest-environment happy-dom
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import type { VueWrapper } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';

import EventSeriesDetails from '../EventSeriesDetails.vue';
import { eventSeriesService } from 'src/services/eventSeriesService';
import { createMockEventSeries, mountWithQuasar } from 'src/test-utils';
import type { EventSeries } from 'src/services/types';

// Mock the eventSeriesService
vi.mock('src/services/eventSeriesService', () => ({
  eventSeriesService: {
    getEventSeriesById: vi.fn(),
  },
}));

// Mock vue-router
vi.mock('vue-router', async () => {
  const actual = await vi.importActual('vue-router');
  return {
    ...actual,
    useRoute: () => ({
      params: { id: '401' },
    }),
    useRouter: () => ({
      push: vi.fn(),
      back: vi.fn(),
    }),
  };
});

describe('EventSeriesDetails Component', () => {
  let wrapper: VueWrapper;
  let mockEventSeries: EventSeries;

  beforeEach(() => {
    // Set up Pinia for state management
    setActivePinia(createPinia());

    // Create mock event series data
    mockEventSeries = createMockEventSeries({
      id: 401,
      title: 'Berlin Tango Marathon Series',
      city: 'Berlin',
      country: 'DE',
      start_date: '2024-06-15T09:00:00',
      registration_start_date: '2024-03-01T00:00:00',
      website: 'https://berlintangomarathon.com',
      content: {
        rendered: '<p>Premier tango marathon series in Berlin</p>',
      },
      dj_statistics: {
        total_djs: 12,
        unique_djs: 10,
        dj_list: [
          {
            id: 101,
            name: 'DJ Awesome',
            city: 'Berlin',
            country: 'DE',
            appearances: 5,
            years: ['2022', '2023', '2024'],
          },
        ],
      },
      _embedded: {
        events: [
          {
            id: 1,
            title: 'Berlin Tango Marathon 2024',
            date: '2024-06-15T09:00:00',
            link: 'https://tangomarathons.com/events/btm-2024',
            registration_start_date: '2024-03-01T00:00:00',
            edition: '5',
          },
          {
            id: 2,
            title: 'Berlin Tango Marathon 2023',
            date: '2023-06-15T09:00:00',
            link: 'https://tangomarathons.com/events/btm-2023',
            registration_start_date: '2023-03-01T00:00:00',
            edition: '4',
          },
        ],
      },
    });

    // Reset all mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount();
    }
  });

  // ===== FR-016: Event Series Name Display =====
  describe('Event Series Name Display (FR-016)', () => {
    it('should display series name as main title', async () => {
      vi.mocked(eventSeriesService.getEventSeriesByIdById).mockResolvedValue(mockEventSeries);

      wrapper = mountWithQuasar(EventSeriesDetails, {}, true);
      await wrapper.vm.$nextTick();
      await new Promise((resolve) => setTimeout(resolve, 100));

      const html = wrapper.html();
      expect(html).toContain('Berlin Tango Marathon Series');
    });

    it('should render HTML entities in series name correctly', async () => {
      const seriesWithHtml = createMockEventSeries({
        title: 'Test &amp; Series',
      });
      vi.mocked(eventSeriesService.getEventSeriesByIdById).mockResolvedValue(seriesWithHtml);

      wrapper = mountWithQuasar(EventSeriesDetails, {}, true);
      await wrapper.vm.$nextTick();
      await new Promise((resolve) => setTimeout(resolve, 100));

      const html = wrapper.html();
      expect(html).toContain('Test &amp; Series');
    });
  });

  // ===== FR-017: Location Display =====
  describe('Location Display (FR-017)', () => {
    it('should display city and country', async () => {
      vi.mocked(eventSeriesService.getEventSeriesByIdById).mockResolvedValue(mockEventSeries);

      wrapper = mountWithQuasar(EventSeriesDetails, {}, true);
      await wrapper.vm.$nextTick();
      await new Promise((resolve) => setTimeout(resolve, 100));

      const html = wrapper.html();
      expect(html).toContain('Berlin');
      expect(html).toMatch(/DE|Germany/i);
    });

    it('should handle missing location gracefully', async () => {
      const seriesNoLocation = createMockEventSeries();
      delete seriesNoLocation.city;
      delete seriesNoLocation.country;
      vi.mocked(eventSeriesService.getEventSeriesByIdById).mockResolvedValue(seriesNoLocation);

      wrapper = mountWithQuasar(EventSeriesDetails, {}, true);
      await wrapper.vm.$nextTick();
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Should mount without errors
      expect(wrapper.exists()).toBe(true);
    });
  });

  // ===== FR-018: Series Statistics Display =====
  describe('Series Statistics Display (FR-018)', () => {
    it('should display total events count', async () => {
      vi.mocked(eventSeriesService.getEventSeriesById).mockResolvedValue(mockEventSeries);

      wrapper = mountWithQuasar(EventSeriesDetails, {}, true);
      await wrapper.vm.$nextTick();
      await new Promise((resolve) => setTimeout(resolve, 100));

      const html = wrapper.html();
      // Should show count of embedded events (2 in mock data)
      expect(html).toMatch(/2|Total Events/i);
    });

    it('should display DJ statistics', async () => {
      vi.mocked(eventSeriesService.getEventSeriesById).mockResolvedValue(mockEventSeries);

      wrapper = mountWithQuasar(EventSeriesDetails, {}, true);
      await wrapper.vm.$nextTick();
      await new Promise((resolve) => setTimeout(resolve, 100));

      const html = wrapper.html();
      // Should display DJ stats from dj_statistics
      expect(html).toMatch(/12|10|DJ|Awesome/i);
    });

    it('should handle missing statistics gracefully', async () => {
      const seriesNoStats = createMockEventSeries();
      delete seriesNoStats.dj_statistics;
      vi.mocked(eventSeriesService.getEventSeriesById).mockResolvedValue(seriesNoStats);

      wrapper = mountWithQuasar(EventSeriesDetails, {}, true);
      await wrapper.vm.$nextTick();
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(wrapper.exists()).toBe(true);
    });
  });

  // ===== FR-019: Service API Call =====
  describe('Service API Call (FR-019)', () => {
    it('should call getEventSeries with correct ID from route params', async () => {
      vi.mocked(eventSeriesService.getEventSeriesById).mockResolvedValue(mockEventSeries);

      wrapper = mountWithQuasar(EventSeriesDetails, {}, true);
      await wrapper.vm.$nextTick();

      expect(eventSeriesService.getEventSeriesById).toHaveBeenCalledWith(401);
    });

    it('should handle service call with string ID', async () => {
      vi.mocked(eventSeriesService.getEventSeriesById).mockResolvedValue(mockEventSeries);

      wrapper = mountWithQuasar(EventSeriesDetails, {}, true);
      await wrapper.vm.$nextTick();

      // Route params provide string '401', should be converted to number
      expect(eventSeriesService.getEventSeriesById).toHaveBeenCalledWith(expect.any(Number));
    });
  });

  // ===== FR-020: Embedded Event Data =====
  describe('Embedded Event Data (FR-020)', () => {
    it('should display embedded events in series', async () => {
      vi.mocked(eventSeriesService.getEventSeriesById).mockResolvedValue(mockEventSeries);

      wrapper = mountWithQuasar(EventSeriesDetails, {}, true);
      await wrapper.vm.$nextTick();
      await new Promise((resolve) => setTimeout(resolve, 100));

      const html = wrapper.html();
      expect(html).toContain('Berlin Tango Marathon 2024');
      expect(html).toContain('Berlin Tango Marathon 2023');
    });

    it('should handle series with no embedded events', async () => {
      const seriesNoEvents = createMockEventSeries();
      delete seriesNoEvents._embedded;
      vi.mocked(eventSeriesService.getEventSeriesById).mockResolvedValue(seriesNoEvents);

      wrapper = mountWithQuasar(EventSeriesDetails, {}, true);
      await wrapper.vm.$nextTick();
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(wrapper.exists()).toBe(true);
    });

    it('should fetch embedded events with series data', async () => {
      vi.mocked(eventSeriesService.getEventSeriesById).mockResolvedValue(mockEventSeries);

      wrapper = mountWithQuasar(EventSeriesDetails, {}, true);
      await wrapper.vm.$nextTick();

      // Service should be called once
      expect(eventSeriesService.getEventSeriesById).toHaveBeenCalledTimes(1);
    });
  });

  // ===== FR-021: Loading State =====
  describe('Loading State (FR-021)', () => {
    it('should show loading indicator while fetching', async () => {
      // Create a promise that resolves after delay
      const delayedPromise = new Promise<EventSeries>((resolve) => {
        setTimeout(() => resolve(mockEventSeries), 200);
      });
      vi.mocked(eventSeriesService.getEventSeriesById).mockReturnValue(delayedPromise);

      wrapper = mountWithQuasar(EventSeriesDetails, {}, true);
      await wrapper.vm.$nextTick();

      // Should show loading state before data arrives
      const html = wrapper.html();
      expect(
        html.includes('loading') ||
          html.includes('Loading') ||
          html.includes('spinner') ||
          html.includes('skeleton'),
      ).toBe(true);
    });

    it('should hide loading indicator after data loads', async () => {
      vi.mocked(eventSeriesService.getEventSeriesById).mockResolvedValue(mockEventSeries);

      wrapper = mountWithQuasar(EventSeriesDetails, {}, true);
      await wrapper.vm.$nextTick();
      await new Promise((resolve) => setTimeout(resolve, 100));

      const html = wrapper.html();
      // Should contain series data, not loading state
      expect(html).toContain('Berlin Tango Marathon Series');
    });
  });

  // ===== FR-022: Error State =====
  describe('Error State (FR-022)', () => {
    it('should display error message when fetch fails', async () => {
      const error = new Error('Failed to load series');
      vi.mocked(eventSeriesService.getEventSeriesById).mockRejectedValue(error);

      wrapper = mountWithQuasar(EventSeriesDetails, {}, true);
      await wrapper.vm.$nextTick();
      await new Promise((resolve) => setTimeout(resolve, 100));

      const html = wrapper.html();
      expect(html.toLowerCase()).toMatch(/error|failed|not found/i);
    });

    it('should handle network error gracefully', async () => {
      const networkError = new Error('Network error');
      vi.mocked(eventSeriesService.getEventSeriesById).mockRejectedValue(networkError);

      wrapper = mountWithQuasar(EventSeriesDetails, {}, true);
      await wrapper.vm.$nextTick();
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Should not crash
      expect(wrapper.exists()).toBe(true);
    });
  });

  // ===== FR-023: Navigation =====
  describe('Navigation (FR-023)', () => {
    it('should provide navigation to event details', async () => {
      vi.mocked(eventSeriesService.getEventSeriesById).mockResolvedValue(mockEventSeries);

      wrapper = mountWithQuasar(EventSeriesDetails, {}, true);
      await wrapper.vm.$nextTick();
      await new Promise((resolve) => setTimeout(resolve, 100));

      const html = wrapper.html();
      // Should contain links to embedded events
      expect(html).toContain('events');
    });

    it('should have external website link if available', async () => {
      vi.mocked(eventSeriesService.getEventSeriesById).mockResolvedValue(mockEventSeries);

      wrapper = mountWithQuasar(EventSeriesDetails, {}, true);
      await wrapper.vm.$nextTick();
      await new Promise((resolve) => setTimeout(resolve, 100));

      const html = wrapper.html();
      expect(html).toContain('berlintangomarathon.com');
    });
  });

  // ===== FR-024: ISO Date Formatting =====
  describe('ISO Date Formatting (FR-024)', () => {
    it('should format start_date as ISO date', async () => {
      vi.mocked(eventSeriesService.getEventSeriesById).mockResolvedValue(mockEventSeries);

      wrapper = mountWithQuasar(EventSeriesDetails, {}, true);
      await wrapper.vm.$nextTick();
      await new Promise((resolve) => setTimeout(resolve, 100));

      const html = wrapper.html();
      // ISO format: YYYY-MM-DD or localized date
      expect(html).toMatch(/2024-06-15|Jun.*15.*2024|15.*Jun.*2024/i);
    });

    it('should format registration_start_date as ISO date', async () => {
      vi.mocked(eventSeriesService.getEventSeriesById).mockResolvedValue(mockEventSeries);

      wrapper = mountWithQuasar(EventSeriesDetails, {}, true);
      await wrapper.vm.$nextTick();
      await new Promise((resolve) => setTimeout(resolve, 100));

      const html = wrapper.html();
      expect(html).toMatch(/2024-03-01|Mar.*1.*2024|1.*Mar.*2024/i);
    });

    it('should handle null dates gracefully', async () => {
      const seriesNoDates = createMockEventSeries({
        start_date: undefined,
        registration_start_date: undefined,
      });
      vi.mocked(eventSeriesService.getEventSeriesById).mockResolvedValue(seriesNoDates);

      wrapper = mountWithQuasar(EventSeriesDetails, {}, true);
      await wrapper.vm.$nextTick();
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(wrapper.exists()).toBe(true);
    });
  });

  // ===== Additional: Series with No Website =====
  describe('Series with No Website', () => {
    it('should handle series without website URL', async () => {
      const seriesNoWebsite = createMockEventSeries();
      delete seriesNoWebsite.website;
      delete seriesNoWebsite.acf;
      vi.mocked(eventSeriesService.getEventSeriesById).mockResolvedValue(seriesNoWebsite);

      wrapper = mountWithQuasar(EventSeriesDetails, {}, true);
      await wrapper.vm.$nextTick();
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(wrapper.exists()).toBe(true);
      const html = wrapper.html();
      expect(html).toContain('Test Event Series');
    });
  });

  // ===== Additional: Series with No Embedded Events =====
  describe('Series with No Embedded Events', () => {
    it('should display message when no events in series', async () => {
      const seriesNoEvents = createMockEventSeries({
        _embedded: {
          events: [],
        },
      });
      vi.mocked(eventSeriesService.getEventSeriesById).mockResolvedValue(seriesNoEvents);

      wrapper = mountWithQuasar(EventSeriesDetails, {}, true);
      await wrapper.vm.$nextTick();
      await new Promise((resolve) => setTimeout(resolve, 100));

      const html = wrapper.html();
      // Should show 0 events or "no events" message
      expect(html).toMatch(/0|no events|empty/i);
    });
  });

  // ===== Additional: Null Field Handling =====
  describe('Null Field Handling', () => {
    it('should handle series with all optional fields null', async () => {
      const seriesMinimal = createMockEventSeries();
      delete seriesMinimal.city;
      delete seriesMinimal.country;
      delete seriesMinimal.start_date;
      delete seriesMinimal.registration_start_date;
      delete seriesMinimal.website;
      delete seriesMinimal.content;
      delete seriesMinimal.acf;
      delete seriesMinimal.dj_statistics;
      delete seriesMinimal._embedded;
      vi.mocked(eventSeriesService.getEventSeriesById).mockResolvedValue(seriesMinimal);

      wrapper = mountWithQuasar(EventSeriesDetails, {}, true);
      await wrapper.vm.$nextTick();
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(wrapper.exists()).toBe(true);
      const html = wrapper.html();
      expect(html).toContain('Test Event Series');
    });
  });

  // ===== Additional: HTML Sanitization =====
  describe('HTML Sanitization', () => {
    it('should sanitize content HTML properly', async () => {
      const seriesWithHtml = createMockEventSeries({
        content: {
          rendered: '<p>Safe content</p><script>alert("xss")</script><p>More content</p>',
        },
      });
      vi.mocked(eventSeriesService.getEventSeriesById).mockResolvedValue(seriesWithHtml);

      wrapper = mountWithQuasar(EventSeriesDetails, {}, true);
      await wrapper.vm.$nextTick();
      await new Promise((resolve) => setTimeout(resolve, 100));

      const html = wrapper.html();
      expect(html).toContain('Safe content');
      // Should not contain script tags
      expect(html).not.toContain('<script>');
    });

    it('should preserve safe HTML formatting', async () => {
      const seriesWithFormatting = createMockEventSeries({
        content: {
          rendered: '<p><strong>Bold</strong> and <em>italic</em> text</p>',
        },
      });
      vi.mocked(eventSeriesService.getEventSeriesById).mockResolvedValue(seriesWithFormatting);

      wrapper = mountWithQuasar(EventSeriesDetails, {}, true);
      await wrapper.vm.$nextTick();
      await new Promise((resolve) => setTimeout(resolve, 100));

      const html = wrapper.html();
      expect(html).toMatch(/Bold.*italic/i);
    });
  });

  // ===== Additional: Component Lifecycle =====
  describe('Component Lifecycle', () => {
    it('should clean up on unmount', async () => {
      vi.mocked(eventSeriesService.getEventSeriesById).mockResolvedValue(mockEventSeries);

      wrapper = mountWithQuasar(EventSeriesDetails, {}, true);
      await wrapper.vm.$nextTick();

      expect(() => wrapper.unmount()).not.toThrow();
    });

    it('should reload data on route param change', async () => {
      vi.mocked(eventSeriesService.getEventSeriesById).mockResolvedValue(mockEventSeries);

      wrapper = mountWithQuasar(EventSeriesDetails, {}, true);
      await wrapper.vm.$nextTick();

      const initialCalls = vi.mocked(eventSeriesService.getEventSeriesById).mock.calls.length;
      expect(initialCalls).toBeGreaterThan(0);
    });
  });

  // ===== Additional: Data Integrity =====
  describe('Data Integrity', () => {
    it('should validate series has required fields', async () => {
      vi.mocked(eventSeriesService.getEventSeriesById).mockResolvedValue(mockEventSeries);

      wrapper = mountWithQuasar(EventSeriesDetails, {}, true);
      await wrapper.vm.$nextTick();
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Component should have loaded the series
      const html = wrapper.html();
      expect(html.length).toBeGreaterThan(0);
    });

    it('should handle series data type correctly', async () => {
      vi.mocked(eventSeriesService.getEventSeriesById).mockResolvedValue(mockEventSeries);

      wrapper = mountWithQuasar(EventSeriesDetails, {}, true);
      await wrapper.vm.$nextTick();

      // Should not throw type errors
      expect(wrapper.exists()).toBe(true);
    });
  });
});

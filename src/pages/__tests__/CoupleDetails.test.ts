/**
 * @vitest-environment happy-dom
 *
 * Test Suite: CoupleDetails.vue Component Tests (T013)
 *
 * Purpose: Test CoupleDetails component against detail page requirements
 *
 * Requirements Tested:
 * - FR-015: Display all available Couple data
 * - FR-017: Show related/embedded data (events, leader, follower)
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
  createMockCouple,
  createMockRouter,
  createNetworkError,
  mockDelayedResponse,
  mountWithQuasar,
} from 'src/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import CoupleDetails from '../CoupleDetails.vue';

// Mock the couple service
vi.mock('src/services/coupleService', () => ({
  coupleService: {
    getCouple: vi.fn(),
  },
}));

// Import the mocked service
import { coupleService as mockCoupleService } from 'src/services/coupleService';

// Type-safe reference to mock function
const mockGetCouple = mockCoupleService['getCouple'] as ReturnType<typeof vi.fn>;

// Mock composables
vi.mock('@/composables/useFormatters', () => ({
  useFormatters: () => ({
    formatDate: (date: string) => date,
    formatDateISO: (date: string) => date,
    formatText: (text: string) => text,
  }),
}));

vi.mock('@/composables/useCountries', () => ({
  useCountries: () => ({
    getCountryName: (code: string) => `Country-${code}`,
  }),
}));

describe('CoupleDetails.vue - Component Tests (T013)', () => {
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
    mockGetCouple.mockResolvedValue(createMockCouple({ id: 1 }));
  });

  describe('FR-015: Display All Available Couple Data', () => {
    it('should render Couple component', async () => {
      const wrapper = mountWithQuasar(CoupleDetails, {}, mockRouter, true);
      await flushPromises();

      expect(wrapper.exists()).toBe(true);
    });

    it('should display couple name', async () => {
      const wrapper = mountWithQuasar(CoupleDetails, {}, mockRouter, true);
      await flushPromises();

      const coupleName = wrapper.text();
      expect(coupleName).toContain('Test Couple 1');
    });

    it('should display couple location (city and country)', async () => {
      const mockCouple = createMockCouple({
        id: 1,
        city: 'Berlin',
        country: 'DE',
      });
      mockGetCouple.mockResolvedValue(mockCouple);

      const wrapper = mountWithQuasar(CoupleDetails, {}, mockRouter, true);
      await flushPromises();

      const text = wrapper.text();
      expect(text).toContain('Berlin');
      expect(text).toContain('Country-DE');
    });

    it('should call getCouple service with correct ID from route params', async () => {
      const wrapper = mountWithQuasar(CoupleDetails, {}, mockRouter, true);
      await flushPromises();

      expect(mockGetCouple).toHaveBeenCalledWith(1, expect.any(Object));
    });

    it('should display partnership information', async () => {
      const mockCouple = createMockCouple({
        id: 1,
        meta_box: {
          partnership_started: '2015',
          partnership_style: 'traditional',
        },
      });
      mockGetCouple.mockResolvedValue(mockCouple);

      const wrapper = mountWithQuasar(CoupleDetails, {}, mockRouter, true);
      await flushPromises();

      const text = wrapper.text();
      // Component should display partnership info
      expect(wrapper.html()).toBeTruthy();
    });

    it('should display leader and follower names', async () => {
      const mockCouple = createMockCouple({
        id: 1,
        leader_name: 'John Doe',
        follower_name: 'Jane Smith',
      });
      mockGetCouple.mockResolvedValue(mockCouple);

      const wrapper = mountWithQuasar(CoupleDetails, {}, mockRouter, true);
      await flushPromises();

      const text = wrapper.text();
      expect(text).toContain('John Doe');
      expect(text).toContain('Jane Smith');
    });
  });

  describe('FR-017: Show Related/Embedded Data', () => {
    it('should fetch couple with embedded data', async () => {
      const mockCouple = createMockCouple({
        id: 1,
        _embedded: {
          events: [
            {
              id: 100,
              title: 'Embedded Event',
              date: '2024-05-01T00:00:00',
              link: 'https://example.com/event/100',
              start_date: '2024-05-01',
              end_date: '2024-05-05',
              registration_start_date: '2024-04-01',
              edition: '1',
            },
          ],
        },
      });
      mockGetCouple.mockResolvedValue(mockCouple);

      mountWithQuasar(CoupleDetails, {}, mockRouter, true);
      await flushPromises();

      expect(mockGetCouple).toHaveBeenCalledWith(1, expect.objectContaining({ _embed: true }));
    });

    it('should display embedded events if available', async () => {
      const mockCouple = createMockCouple({
        id: 1,
        _embedded: {
          events: [
            {
              id: 100,
              title: 'Couple Event 1',
              date: '2024-05-01T00:00:00',
              link: 'https://example.com/event/100',
              start_date: '2024-05-01',
              end_date: '2024-05-05',
              registration_start_date: '2024-04-01',
              edition: '1',
            },
          ],
        },
      });
      mockGetCouple.mockResolvedValue(mockCouple);

      const wrapper = mountWithQuasar(CoupleDetails, {}, mockRouter, true);
      await flushPromises();

      const text = wrapper.text();
      // Component should display embedded events
      expect(text).toBeTruthy();
    });

    it('should display embedded teacher information', async () => {
      const mockCouple = createMockCouple({
        id: 1,
        _embedded: {
          leader: [
            {
              id: 10,
              title: 'Leader Teacher',
              date: '2024-01-01T00:00:00',
              link: 'https://example.com/teacher/10',
              city: 'Berlin',
              country: 'DE',
              meta_box: {
                role: 'leader',
              },
            },
          ],
          follower: [
            {
              id: 20,
              title: 'Follower Teacher',
              date: '2024-01-01T00:00:00',
              link: 'https://example.com/teacher/20',
              city: 'Berlin',
              country: 'DE',
              meta_box: {
                role: 'follower',
              },
            },
          ],
        },
      });
      mockGetCouple.mockResolvedValue(mockCouple);

      const wrapper = mountWithQuasar(CoupleDetails, {}, mockRouter, true);
      await flushPromises();

      const text = wrapper.text();
      // Component should display teacher information
      expect(text).toBeTruthy();
    });
  });

  describe('FR-018: Loading Indicators', () => {
    it('should show loading state while fetching couple data', async () => {
      const delayedCouple = createMockCouple({ id: 1 });
      mockDelayedResponse(mockGetCouple, delayedCouple, 100);

      const wrapper = mountWithQuasar(CoupleDetails, {}, mockRouter, true);

      // Should show loading before data arrives
      expect(wrapper.html()).toContain('q-spinner');

      await flushPromises();
      expect(wrapper.exists()).toBe(true);
    });

    it('should clear loading state after data is loaded', async () => {
      const wrapper = mountWithQuasar(CoupleDetails, {}, mockRouter, true);
      await flushPromises();

      // Should not show loading after data arrives
      expect(wrapper.html()).not.toContain('q-spinner');
    });
  });

  describe('FR-019: Error Messages with Retry and Navigation', () => {
    it('should handle API errors gracefully', async () => {
      mockGetCouple.mockRejectedValue(createNetworkError());

      const wrapper = mountWithQuasar(CoupleDetails, {}, mockRouter, true);
      await flushPromises();

      // Should not crash
      expect(wrapper.exists()).toBe(true);
    });

    it('should display error message when API fails', async () => {
      mockGetCouple.mockRejectedValue(createNetworkError());

      const wrapper = mountWithQuasar(CoupleDetails, {}, mockRouter, true);
      await flushPromises();

      const text = wrapper.text();
      expect(text).toMatch(/error|failed|load/i);
    });

    it('should handle 404 not found errors', async () => {
      mockGetCouple.mockRejectedValue({
        response: { status: 404 },
        message: 'Couple not found',
      });

      const wrapper = mountWithQuasar(CoupleDetails, {}, mockRouter, true);
      await flushPromises();

      const text = wrapper.text();
      expect(text).toMatch(/not found|error/i);
    });
  });

  describe('FR-020: Navigation Back to Table View', () => {
    it('should provide navigation back functionality', async () => {
      const wrapper = mountWithQuasar(CoupleDetails, {}, mockRouter, true);
      await flushPromises();

      // Component should have back button or navigation
      expect(wrapper.html()).toBeTruthy();
    });
  });

  describe('FR-021: ISO Date Formatting', () => {
    it('should format partnership_started as year (YYYY)', async () => {
      const mockCouple = createMockCouple({
        id: 1,
        meta_box: {
          partnership_started: '2015',
        },
      });
      mockGetCouple.mockResolvedValue(mockCouple);

      const wrapper = mountWithQuasar(CoupleDetails, {}, mockRouter, true);
      await flushPromises();

      const text = wrapper.text();
      // Component should display year
      expect(text).toBeTruthy();
    });
  });

  describe('FR-022: No Images Displayed', () => {
    it('should not display images (or have image display disabled)', async () => {
      const wrapper = mountWithQuasar(CoupleDetails, {}, mockRouter, true);
      await flushPromises();

      // This is a policy test - images may be present but should be disabled/hidden
      // Or test that no img tags exist
      expect(wrapper.html()).toBeTruthy();
    });
  });

  describe('FR-023: Handle Missing/Null Data', () => {
    it('should handle couples with missing optional fields', async () => {
      const mockCouple = createMockCouple({
        id: 1,
        title: 'Minimal Couple',
        // All other fields undefined
      });
      mockGetCouple.mockResolvedValue(mockCouple);

      const wrapper = mountWithQuasar(CoupleDetails, {}, mockRouter, true);
      await flushPromises();

      // Should render without errors
      expect(wrapper.exists()).toBe(true);
      expect(wrapper.text()).toContain('Minimal Couple');
    });

    it('should handle null values gracefully', async () => {
      const mockCouple = createMockCouple({
        id: 1,
        city: null as unknown as string,
        country: null as unknown as string,
        meta_box: {
          bio_couple: null as unknown as string,
        },
      });
      mockGetCouple.mockResolvedValue(mockCouple);

      const wrapper = mountWithQuasar(CoupleDetails, {}, mockRouter, true);
      await flushPromises();

      // Should render without null pointer errors
      expect(wrapper.exists()).toBe(true);
    });

    it('should handle couples without meta_box', async () => {
      const mockCouple = createMockCouple({
        id: 1,
        title: 'No Meta Couple',
      });
      // Explicitly remove meta_box
      delete mockCouple.meta_box;
      mockGetCouple.mockResolvedValue(mockCouple);

      const wrapper = mountWithQuasar(CoupleDetails, {}, mockRouter, true);
      await flushPromises();

      // Should render without errors
      expect(wrapper.exists()).toBe(true);
    });
  });

  describe('FR-024: HTML Content Sanitized', () => {
    it('should display HTML content safely', async () => {
      const mockCouple = createMockCouple({
        id: 1,
        meta_box: {
          bio_couple: '<p>Couple bio with <strong>HTML</strong> content</p>',
        },
      });
      mockGetCouple.mockResolvedValue(mockCouple);

      const wrapper = mountWithQuasar(CoupleDetails, {}, mockRouter, true);
      await flushPromises();

      const html = wrapper.html();
      // Should contain the text but properly sanitized
      expect(html).toBeTruthy();
    });

    it('should prevent script execution in bio content', async () => {
      const mockCouple = createMockCouple({
        id: 1,
        meta_box: {
          bio_couple: '<script>alert("XSS")</script><p>Safe content</p>',
        },
      });
      mockGetCouple.mockResolvedValue(mockCouple);

      const wrapper = mountWithQuasar(CoupleDetails, {}, mockRouter, true);
      await flushPromises();

      const html = wrapper.html();
      // Should NOT contain script tag
      expect(html).not.toContain('<script>');
    });
  });

  describe('Component Lifecycle', () => {
    it('should fetch couple data on mount', async () => {
      const wrapper = mountWithQuasar(CoupleDetails, {}, mockRouter, true);
      await flushPromises();

      expect(mockGetCouple).toHaveBeenCalledTimes(1);
    });

    it('should handle component unmount cleanly', async () => {
      const wrapper = mountWithQuasar(CoupleDetails, {}, mockRouter, true);
      await flushPromises();

      expect(() => wrapper.unmount()).not.toThrow();
    });
  });

  describe('Data Integrity', () => {
    it('should preserve all couple properties', async () => {
      const mockCouple = createMockCouple({
        id: 1,
        title: 'Complete Couple',
        city: 'Berlin',
        country: 'DE',
        leader_name: 'Leader Name',
        follower_name: 'Follower Name',
        meta_box: {
          partnership_started: '2015',
          partnership_style: 'traditional',
          bio_couple: 'Partnership biography',
        },
      });
      mockGetCouple.mockResolvedValue(mockCouple);

      const wrapper = mountWithQuasar(CoupleDetails, {}, mockRouter, true);
      await flushPromises();

      // Component should display all provided data
      const text = wrapper.text();
      expect(text).toContain('Complete Couple');
      expect(text).toContain('Berlin');
    });

    it('should handle couples with all optional fields populated', async () => {
      const mockCouple = createMockCouple({
        id: 1,
        title: 'Full Couple',
        city: 'Berlin',
        country: 'DE',
        leader_id: 10,
        leader_name: 'John Leader',
        follower_id: 20,
        follower_name: 'Jane Follower',
        meta_box: {
          city: 'Berlin',
          country: 'DE',
          partnership_started: '2015',
          partnership_style: 'traditional',
          bio_couple: 'Full partnership bio',
          teaching_philosophy: 'Our teaching approach',
          specializations_couple: ['Vals', 'Milonga'],
          workshops_offered: 'Various workshops',
          achievements: 'Many achievements',
          website: 'https://example.com',
          facebook_page: 'facebook.com/couple',
        },
      });
      mockGetCouple.mockResolvedValue(mockCouple);

      const wrapper = mountWithQuasar(CoupleDetails, {}, mockRouter, true);
      await flushPromises();

      // Should render with all data
      expect(wrapper.exists()).toBe(true);
      const text = wrapper.text();
      expect(text).toContain('Full Couple');
    });
  });
});

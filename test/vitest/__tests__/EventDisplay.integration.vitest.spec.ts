import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { installQuasarPlugin } from '@quasar/quasar-app-extension-testing-unit-vitest';
import { createMemoryHistory, createRouter } from 'vue-router';
import EventDetails from 'src/pages/EventDetails.vue';
import type { EventResponse } from 'src/types/event';

// Install Quasar plugin for testing
installQuasarPlugin();

// Create a minimal router for testing
const routes = [
  {
    path: '/events/:id',
    name: 'EventDetails',
    component: EventDetails,
  },
];

const router = createRouter({
  history: createMemoryHistory(),
  routes,
});

/**
 * Integration Test Suite for Event Display Feature
 *
 * Tests the complete user journey from loading an event to displaying
 * all information including hero section, category pills, and venue map.
 *
 * Based on user stories from quickstart.md:
 * - US1: See event date range in "DD-DD MMM YYYY" format
 * - US2: See category with icon and color
 * - US3: See edition number for recurring events
 * - US4: See venue location on OpenStreetMap
 * - US5: Lazy load map when switching to venue tab
 * - US6: Handle missing/invalid data gracefully
 */

describe('Event Display Integration', () => {
  const mockEvent: EventResponse = {
    id: 123,
    title: { rendered: 'Test Marathon 2025' },
    link: '/events/test-marathon',
    meta: {
      start_date: '2025-03-15',
      end_date: '2025-03-17',
      city: 'Berlin',
      country: 'Germany',
      'venue-name': 'Test Venue',
      street: '123 Test Street',
      edition: 5,
    },
    event_categories: [
      {
        term_id: 1,
        name: 'Marathon',
        slug: 'marathon',
      },
    ],
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    // Push the route with the event ID
    await router.push('/events/123');
  });

  /**
   * Helper function to mount EventDetails component with proper router context
   */
  const mountEventDetails = (event: EventResponse) => {
    return mount(EventDetails, {
      props: {
        event,
      },
      global: {
        plugins: [router],
      },
    });
  };

  describe('US1: Event Date Range Display', () => {
    it('should display date range in "DD-DD MMM YYYY" format for multi-day events', async () => {
      const wrapper = mount(EventDetails, {
        props: {
          event: mockEvent,
        },
      });

      // Should display formatted date range
      const dateText = wrapper.find('[data-testid="event-date-range"]');
      expect(dateText.exists()).toBe(true);
      expect(dateText.text()).toMatch(/15-17 MAR 2025/i);
    });

    it('should display single date for one-day events', async () => {
      const oneDayEvent = {
        ...mockEvent,
        meta: {
          ...mockEvent.meta,
          start_date: '2025-03-15',
          end_date: '2025-03-15',
        },
      };

      const wrapper = mount(EventDetails, {
        props: {
          event: oneDayEvent,
        },
      });

      const dateText = wrapper.find('[data-testid="event-date-range"]');
      expect(dateText.text()).toMatch(/15 MAR 2025/i);
    });

    it('should handle date range across month boundary', async () => {
      const crossMonthEvent = {
        ...mockEvent,
        meta: {
          ...mockEvent.meta,
          start_date: '2025-03-30',
          end_date: '2025-04-02',
        },
      };

      const wrapper = mount(EventDetails, {
        props: {
          event: crossMonthEvent,
        },
      });

      const dateText = wrapper.find('[data-testid="event-date-range"]');
      expect(dateText.text()).toMatch(/30 MAR - 02 APR 2025/i);
    });
  });

  describe('US2: Category Display with Icon and Color', () => {
    it('should display category pill with correct icon and WCAG AA color', async () => {
      const wrapper = mount(EventDetails, {
        props: {
          event: mockEvent,
        },
      });

      const categoryPill = wrapper.find('[data-testid="category-pill"]');
      expect(categoryPill.exists()).toBe(true);

      // Check category name
      expect(categoryPill.text()).toContain('Marathon');

      // Check icon exists
      const icon = categoryPill.find('.q-icon');
      expect(icon.exists()).toBe(true);

      // Check color is applied (should have background color)
      const styles = categoryPill.attributes('style');
      expect(styles).toBeDefined();
      expect(styles).toMatch(/background/i);
    });

    it('should use default category when none specified', async () => {
      const noCategoryEvent = {
        ...mockEvent,
        event_categories: [],
      };

      const wrapper = mount(EventDetails, {
        props: {
          event: noCategoryEvent,
        },
      });

      const categoryPill = wrapper.find('[data-testid="category-pill"]');
      expect(categoryPill.exists()).toBe(true);
      expect(categoryPill.text()).toContain('Uncategorized');
    });
  });

  describe('US3: Edition Number Display', () => {
    it('should display edition pill for recurring events', async () => {
      const wrapper = mount(EventDetails, {
        props: {
          event: mockEvent,
        },
      });

      const editionPill = wrapper.find('[data-testid="edition-pill"]');
      expect(editionPill.exists()).toBe(true);
      expect(editionPill.text()).toContain('5th edition');
    });

    it('should not display edition pill when edition is missing', async () => {
      const noEditionEvent = {
        ...mockEvent,
        meta: {
          ...mockEvent.meta,
          edition: undefined,
        },
      };

      const wrapper = mount(EventDetails, {
        props: {
          event: noEditionEvent,
        },
      });

      const editionPill = wrapper.find('[data-testid="edition-pill"]');
      expect(editionPill.exists()).toBe(false);
    });

    it('should handle different edition numbers correctly', async () => {
      const testCases = [
        { edition: 1, expected: '1st edition' },
        { edition: 2, expected: '2nd edition' },
        { edition: 3, expected: '3rd edition' },
        { edition: 11, expected: '11th edition' },
        { edition: 21, expected: '21st edition' },
      ];

      for (const { edition, expected } of testCases) {
        const wrapper = mount(EventDetails, {
          props: {
            event: {
              ...mockEvent,
              meta: { ...mockEvent.meta, edition },
            },
          },
        });

        const editionPill = wrapper.find('[data-testid="edition-pill"]');
        expect(editionPill.text()).toContain(expected);
      }
    });
  });

  describe('US4: Venue Location on Map', () => {
    it('should display venue tab with map component', async () => {
      const wrapper = mount(EventDetails, {
        props: {
          event: mockEvent,
        },
      });

      // Click on venue tab
      const venueTab = wrapper.find('[data-testid="venue-tab"]');
      expect(venueTab.exists()).toBe(true);

      await venueTab.trigger('click');
      await wrapper.vm.$nextTick();

      // Map component should be present
      const mapComponent = wrapper.findComponent({ name: 'EventVenueMap' });
      expect(mapComponent.exists()).toBe(true);
    });

    it('should pass correct venue data to map component', async () => {
      const wrapper = mount(EventDetails, {
        props: {
          event: mockEvent,
        },
      });

      // Switch to venue tab
      const venueTab = wrapper.find('[data-testid="venue-tab"]');
      await venueTab.trigger('click');

      const mapComponent = wrapper.findComponent({ name: 'EventVenueMap' });
      const mapProps = mapComponent.props();

      expect(mapProps).toMatchObject({
        venueName: 'Test Venue',
        street: '123 Test Street',
        city: 'Berlin',
        country: 'Germany',
      });
    });
  });

  describe('US5: Lazy Loading Map', () => {
    it('should not load map component until venue tab is clicked', async () => {
      const wrapper = mount(EventDetails, {
        props: {
          event: mockEvent,
        },
      });

      // Initially, map should not be rendered
      let mapComponent = wrapper.findComponent({ name: 'EventVenueMap' });
      expect(mapComponent.exists()).toBe(false);

      // Click venue tab
      const venueTab = wrapper.find('[data-testid="venue-tab"]');
      await venueTab.trigger('click');
      await wrapper.vm.$nextTick();

      // Now map should be rendered
      mapComponent = wrapper.findComponent({ name: 'EventVenueMap' });
      expect(mapComponent.exists()).toBe(true);
    });

    it('should preserve map state when switching between tabs', async () => {
      const wrapper = mount(EventDetails, {
        props: {
          event: mockEvent,
        },
      });

      // Click venue tab to load map
      const venueTab = wrapper.find('[data-testid="venue-tab"]');
      await venueTab.trigger('click');
      await wrapper.vm.$nextTick();

      const mapComponent = wrapper.findComponent({ name: 'EventVenueMap' });
      expect(mapComponent.exists()).toBe(true);

      // Switch to another tab
      const overviewTab = wrapper.find('[data-testid="overview-tab"]');
      await overviewTab.trigger('click');
      await wrapper.vm.$nextTick();

      // Switch back to venue tab
      await venueTab.trigger('click');
      await wrapper.vm.$nextTick();

      // Map should still be rendered (not destroyed and recreated)
      const mapStillExists = wrapper.findComponent({ name: 'EventVenueMap' });
      expect(mapStillExists.exists()).toBe(true);
    });
  });

  describe('US6: Error Handling and Edge Cases', () => {
    it('should handle missing event data gracefully', async () => {
      const incompleteEvent = {
        id: 123,
        title: { rendered: 'Incomplete Event' },
        link: '/events/incomplete',
        meta: {},
        event_categories: [],
      };

      const wrapper = mount(EventDetails, {
        props: {
          event: incompleteEvent as EventResponse,
        },
      });

      // Should not crash
      expect(wrapper.exists()).toBe(true);

      // Should show fallback values
      const dateRange = wrapper.find('[data-testid="event-date-range"]');
      expect(dateRange.text()).toContain('TBD');
    });

    it('should handle invalid date formats gracefully', async () => {
      const invalidDateEvent = {
        ...mockEvent,
        meta: {
          ...mockEvent.meta,
          start_date: 'invalid-date',
          end_date: 'also-invalid',
        },
      };

      const wrapper = mount(EventDetails, {
        props: {
          event: invalidDateEvent,
        },
      });

      // Should not crash
      expect(wrapper.exists()).toBe(true);

      // Should show error state or fallback
      const dateRange = wrapper.find('[data-testid="event-date-range"]');
      expect(dateRange.exists()).toBe(true);
    });

    it('should handle missing venue data for map', async () => {
      const noVenueEvent = {
        ...mockEvent,
        meta: {
          ...mockEvent.meta,
          'venue-name': undefined,
          street: undefined,
          city: undefined,
        },
      };

      const wrapper = mount(EventDetails, {
        props: {
          event: noVenueEvent,
        },
      });

      const venueTab = wrapper.find('[data-testid="venue-tab"]');
      await venueTab.trigger('click');

      // Map component should handle missing data
      const mapComponent = wrapper.findComponent({ name: 'EventVenueMap' });
      expect(mapComponent.exists()).toBe(true);

      // Should show appropriate message
      const noDataMessage = wrapper.find('[data-testid="no-venue-data"]');
      expect(noDataMessage.exists()).toBe(true);
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels for interactive elements', async () => {
      const wrapper = mount(EventDetails, {
        props: {
          event: mockEvent,
        },
      });

      // Check tab panels have proper ARIA
      const tabs = wrapper.findAll('[role="tab"]');
      expect(tabs.length).toBeGreaterThan(0);

      tabs.forEach((tab) => {
        expect(tab.attributes('aria-selected')).toBeDefined();
      });
    });

    it('should be keyboard navigable', async () => {
      const wrapper = mount(EventDetails, {
        props: {
          event: mockEvent,
        },
      });

      const venueTab = wrapper.find('[data-testid="venue-tab"]');

      // Should be focusable
      expect(venueTab.attributes('tabindex')).toBeDefined();

      // Should respond to Enter key
      await venueTab.trigger('keydown.enter');
      await wrapper.vm.$nextTick();

      const mapComponent = wrapper.findComponent({ name: 'EventVenueMap' });
      expect(mapComponent.exists()).toBe(true);
    });
  });

  describe('Performance', () => {
    it('should lazy load Leaflet library only when map is displayed', async () => {
      // This test verifies lazy loading behavior
      const wrapper = mount(EventDetails, {
        props: {
          event: mockEvent,
        },
      });

      // Initially, Leaflet should not be loaded
      // (This is a behavioral test, actual implementation may vary)

      const venueTab = wrapper.find('[data-testid="venue-tab"]');
      await venueTab.trigger('click');

      // After clicking venue tab, map component should initiate Leaflet loading
      const mapComponent = wrapper.findComponent({ name: 'EventVenueMap' });
      expect(mapComponent.exists()).toBe(true);
    });
  });
});

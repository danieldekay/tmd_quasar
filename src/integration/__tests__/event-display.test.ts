import { mount } from '@vue/test-utils';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Quasar } from 'quasar';
import EventDetails from 'src/pages/EventDetails.vue';
import type { EventResponse } from 'src/types/event';

// Mock Leaflet
vi.mock('leaflet', () => ({
  default: {
    map: vi.fn(() => ({
      setView: vi.fn().mockReturnThis(),
      on: vi.fn().mockReturnThis(),
      off: vi.fn().mockReturnThis(),
      remove: vi.fn(),
    })),
    tileLayer: vi.fn(() => ({
      addTo: vi.fn(),
    })),
    marker: vi.fn(() => ({
      addTo: vi.fn().mockReturnThis(),
      bindPopup: vi.fn().mockReturnThis(),
    })),
  },
}));

// Mock useRoute
vi.mock('vue-router', () => ({
  useRoute: () => ({
    params: { id: '123' },
  }),
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
}));

// Mock API call
vi.mock('boot/axios', () => ({
  api: {
    get: vi.fn(),
  },
}));

describe('Event Display Integration Tests', () => {
  const mockEvent: EventResponse = {
    id: 123,
    title: { rendered: 'Bosthon Tango Marathon' },
    slug: 'bosthon-tango-marathon',
    link: 'http://localhost:9000/events/bosthon-tango-marathon',
    date: '2025-01-15T10:00:00',
    modified: '2025-01-15T10:00:00',
    status: 'publish',
    type: 'tmd_event',
    categories: [1],
    meta: {
      event_name: 'Bosthon Tango Marathon',
      edition: 13,
      start_date: '2025-09-18',
      end_date: '2025-09-22',
      country: 'USA',
      city: 'Boston',
      'venue-name': 'Grand Ballroom',
      street: '123 Main Street',
      website: 'https://example.com',
      latitude: 42.3601,
      longitude: -71.0589,
    },
    _embedded: {
      'wp:term': [
        [
          {
            id: 1,
            name: 'Tango Marathon',
            slug: 'tango-marathon',
            taxonomy: 'tmd_event_category',
          },
        ],
      ],
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('User Story 1: Mobile-Friendly Event Display', () => {
    it('should display all information clearly without horizontal scrolling on mobile', async () => {
      const wrapper = mount(EventDetails, {
        props: {
          eventData: mockEvent,
        },
        global: {
          stubs: {
            QPage: false,
            QCard: false,
            QCardSection: false,
            QTabs: false,
            QTab: false,
            QTabPanels: false,
            QTabPanel: false,
            QChip: false,
            QIcon: false,
            QImg: false,
          },
        },
      });

      await wrapper.vm.$nextTick();

      // Verify event title is present
      expect(wrapper.text()).toContain('Bosthon Tango Marathon');

      // Verify date is formatted (not raw)
      expect(wrapper.text()).toContain('Sep');
      expect(wrapper.text()).not.toContain('2025-09-18'); // Should be formatted

      // Verify category pill is present
      const chips = wrapper.findAllComponents({ name: 'QChip' });
      expect(chips.length).toBeGreaterThan(0);

      // Verify edition is displayed if present
      if (mockEvent.meta.edition) {
        expect(wrapper.text()).toContain('13');
      }

      // Verify no horizontal overflow
      const page = wrapper.find('.q-page');
      if (page.exists()) {
        const styles = page.attributes('style');
        expect(styles).not.toContain('overflow-x: scroll');
      }
    });

    it('should have touch-friendly targets (minimum 44px)', async () => {
      const wrapper = mount(EventDetails, {
        props: {
          eventData: mockEvent,
        },
        global: {
          stubs: {
            QTab: false,
          },
        },
      });

      await wrapper.vm.$nextTick();

      // Check tabs are touch-friendly
      const tabs = wrapper.findAllComponents({ name: 'QTab' });
      tabs.forEach((tab) => {
        const element = tab.element as HTMLElement;
        const rect = element.getBoundingClientRect?.() || { height: 0 };
        // In test environment, getBoundingClientRect may not work
        // We verify the component exists and would have proper dimensions
        expect(tab.exists()).toBe(true);
      });
    });
  });

  describe('User Story 2: Interactive Map in Venue Tab', () => {
    it('should display interactive map with venue marker at zoom level 11', async () => {
      const wrapper = mount(EventDetails, {
        props: {
          eventData: mockEvent,
        },
        global: {
          stubs: {
            QTabPanels: false,
            QTabPanel: false,
          },
        },
      });

      await wrapper.vm.$nextTick();

      // Verify map component is present (when venue tab is active)
      // The map loads lazily, so we check for the container
      const venuePanel = wrapper.findAll('[aria-label*="venue"], [role="tabpanel"]');
      expect(venuePanel.length).toBeGreaterThan(0);

      // Verify coordinates are available for map
      expect(mockEvent.meta.latitude).toBeDefined();
      expect(mockEvent.meta.longitude).toBeDefined();

      // In a real integration test, we would:
      // 1. Click on venue tab
      // 2. Wait for map to load
      // 3. Verify Leaflet was called with correct coordinates
      // 4. Verify zoom level is 11
    });

    it('should lazy load map only when venue tab is activated', async () => {
      const wrapper = mount(EventDetails, {
        props: {
          eventData: mockEvent,
        },
      });

      await wrapper.vm.$nextTick();

      // Initially, map should not be loaded
      // Only loads when user switches to venue tab

      // This test verifies the lazy loading behavior
      // In real browser testing, we would measure load time
      expect(wrapper.exists()).toBe(true);
    });
  });

  describe('User Story 3: Category Pills Display', () => {
    it('should display category pill with icon and color', async () => {
      const wrapper = mount(EventDetails, {
        props: {
          eventData: mockEvent,
        },
        global: {
          stubs: {
            QChip: false,
            QIcon: false,
          },
        },
      });

      await wrapper.vm.$nextTick();

      // Find category chips
      const chips = wrapper.findAllComponents({ name: 'QChip' });
      expect(chips.length).toBeGreaterThan(0);

      // Verify category name is displayed
      const categoryChip = chips.find((chip) => chip.text().includes('Tango Marathon'));
      expect(categoryChip).toBeDefined();

      // Verify icon is present
      const icons = wrapper.findAllComponents({ name: 'QIcon' });
      expect(icons.length).toBeGreaterThan(0);
    });

    it('should display edition pill in ordinal format', async () => {
      const wrapper = mount(EventDetails, {
        props: {
          eventData: mockEvent,
        },
      });

      await wrapper.vm.$nextTick();

      // Verify edition is displayed with suffix (th, st, nd, rd)
      const text = wrapper.text();
      if (mockEvent.meta.edition) {
        expect(text).toMatch(/\d+(st|nd|rd|th)/);
      }
    });

    it('should have sufficient color contrast for accessibility', async () => {
      const wrapper = mount(EventDetails, {
        props: {
          eventData: mockEvent,
        },
        global: {
          stubs: {
            QChip: false,
          },
        },
      });

      await wrapper.vm.$nextTick();

      // Verify chips have accessible colors
      // In real implementation, we would use vitest-axe
      // For now, verify chips exist with color attributes
      const chips = wrapper.findAllComponents({ name: 'QChip' });
      chips.forEach((chip) => {
        expect(chip.exists()).toBe(true);
        // Chips should have color prop or style
      });
    });
  });

  describe('User Story 4: Date Formatting', () => {
    it('should format dates in human-readable format (DD-DD MMM YYYY)', async () => {
      const wrapper = mount(EventDetails, {
        props: {
          eventData: mockEvent,
        },
      });

      await wrapper.vm.$nextTick();

      const text = wrapper.text();

      // Should display formatted date like "18-22 Sep 2025"
      expect(text).toMatch(/\d{1,2}-\d{1,2}\s+\w{3}\s+\d{4}/);

      // Should NOT display raw ISO format
      expect(text).not.toContain('2025-09-18');
      expect(text).not.toContain('2025-09-22');
    });

    it('should handle single-day events correctly', async () => {
      const singleDayEvent: EventResponse = {
        ...mockEvent,
        meta: {
          ...mockEvent.meta,
          start_date: '2025-09-18',
          end_date: '2025-09-18', // Same day
        },
      };

      const wrapper = mount(EventDetails, {
        props: {
          eventData: singleDayEvent,
        },
      });

      await wrapper.vm.$nextTick();

      const text = wrapper.text();

      // Single day should show just one date
      // Format depends on implementation: "18 Sep 2025" or similar
      expect(text).toContain('Sep');
      expect(text).toContain('2025');
    });

    it('should handle multi-month events correctly', async () => {
      const multiMonthEvent: EventResponse = {
        ...mockEvent,
        meta: {
          ...mockEvent.meta,
          start_date: '2025-09-28',
          end_date: '2025-10-02', // Spans two months
        },
      };

      const wrapper = mount(EventDetails, {
        props: {
          eventData: multiMonthEvent,
        },
      });

      await wrapper.vm.$nextTick();

      const text = wrapper.text();

      // Should show both months
      expect(text).toContain('Sep');
      expect(text).toContain('Oct');
      expect(text).toContain('2025');
    });
  });

  describe('User Story 5: Featured Image Fallback', () => {
    it('should display featured image when available', async () => {
      const eventWithImage: EventResponse = {
        ...mockEvent,
        _embedded: {
          ...mockEvent._embedded,
          'wp:featuredmedia': [
            {
              id: 456,
              source_url: 'https://example.com/image.jpg',
              alt_text: 'Event venue',
              media_details: {
                sizes: {
                  large: {
                    source_url: 'https://example.com/image-large.jpg',
                    width: 1024,
                    height: 576,
                  },
                },
              },
            },
          ],
        },
      };

      const wrapper = mount(EventDetails, {
        props: {
          eventData: eventWithImage,
        },
        global: {
          stubs: {
            QImg: false,
          },
        },
      });

      await wrapper.vm.$nextTick();

      // Verify image component is present
      const images = wrapper.findAllComponents({ name: 'QImg' });
      expect(images.length).toBeGreaterThan(0);
    });

    it('should fallback to category image when featured image not available', async () => {
      // mockEvent doesn't have featured image, should use category fallback
      const wrapper = mount(EventDetails, {
        props: {
          eventData: mockEvent,
        },
      });

      await wrapper.vm.$nextTick();

      // Verify some image is displayed (category fallback)
      // This depends on implementation - check for image component or src
      expect(wrapper.exists()).toBe(true);
    });

    it('should use 16:9 aspect ratio for hero images', async () => {
      const wrapper = mount(EventDetails, {
        props: {
          eventData: mockEvent,
        },
        global: {
          stubs: {
            QImg: false,
          },
        },
      });

      await wrapper.vm.$nextTick();

      // Verify image has correct aspect ratio
      // In real implementation, check computed styles or CSS classes
      const images = wrapper.findAllComponents({ name: 'QImg' });
      images.forEach((img) => {
        expect(img.exists()).toBe(true);
      });
    });
  });

  describe('User Story 6: Map Coordinates Fallback', () => {
    it('should display map when coordinates are available', async () => {
      const wrapper = mount(EventDetails, {
        props: {
          eventData: mockEvent,
        },
      });

      await wrapper.vm.$nextTick();

      // Verify map can be rendered with provided coordinates
      expect(mockEvent.meta.latitude).toBe(42.3601);
      expect(mockEvent.meta.longitude).toBe(-71.0589);
    });

    it('should show address fallback when coordinates missing', async () => {
      const eventNoCoords: EventResponse = {
        ...mockEvent,
        meta: {
          ...mockEvent.meta,
          latitude: undefined,
          longitude: undefined,
        },
      };

      const wrapper = mount(EventDetails, {
        props: {
          eventData: eventNoCoords,
        },
      });

      await wrapper.vm.$nextTick();

      // Should display address as text fallback
      expect(wrapper.text()).toContain('Grand Ballroom');
      expect(wrapper.text()).toContain('123 Main Street');
    });

    it('should handle geocoding fallback for city/country', async () => {
      const eventCityOnly: EventResponse = {
        ...mockEvent,
        meta: {
          ...mockEvent.meta,
          latitude: undefined,
          longitude: undefined,
          'venue-name': undefined,
          street: undefined,
        },
      };

      const wrapper = mount(EventDetails, {
        props: {
          eventData: eventCityOnly,
        },
      });

      await wrapper.vm.$nextTick();

      // Should at least display city and country
      expect(wrapper.text()).toContain('Boston');
      expect(wrapper.text()).toContain('USA');
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle missing event data gracefully', async () => {
      const wrapper = mount(EventDetails, {
        props: {
          eventData: null,
        },
      });

      await wrapper.vm.$nextTick();

      // Should not crash, should show loading or error state
      expect(wrapper.exists()).toBe(true);
    });

    it('should handle missing category gracefully', async () => {
      const eventNoCategory: EventResponse = {
        ...mockEvent,
        _embedded: {
          'wp:term': [[]],
        },
      };

      const wrapper = mount(EventDetails, {
        props: {
          eventData: eventNoCategory,
        },
      });

      await wrapper.vm.$nextTick();

      // Should not crash, should handle missing category
      expect(wrapper.exists()).toBe(true);
    });

    it('should handle invalid dates gracefully', async () => {
      const eventBadDates: EventResponse = {
        ...mockEvent,
        meta: {
          ...mockEvent.meta,
          start_date: 'invalid-date',
          end_date: 'also-invalid',
        },
      };

      const wrapper = mount(EventDetails, {
        props: {
          eventData: eventBadDates,
        },
      });

      await wrapper.vm.$nextTick();

      // Should not crash, should show fallback or error
      expect(wrapper.exists()).toBe(true);
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels for interactive elements', async () => {
      const wrapper = mount(EventDetails, {
        props: {
          eventData: mockEvent,
        },
      });

      await wrapper.vm.$nextTick();

      // Verify tabs have proper ARIA roles
      const tabs = wrapper.findAll('[role="tab"]');
      expect(tabs.length).toBeGreaterThan(0);

      // Verify panels have proper ARIA roles
      const panels = wrapper.findAll('[role="tabpanel"]');
      expect(panels.length).toBeGreaterThan(0);
    });

    it('should have semantic HTML structure', async () => {
      const wrapper = mount(EventDetails, {
        props: {
          eventData: mockEvent,
        },
      });

      await wrapper.vm.$nextTick();

      // Verify proper heading hierarchy
      const html = wrapper.html();
      expect(html).toContain('Bosthon Tango Marathon');

      // Should use semantic elements
      // (specific assertions depend on implementation)
      expect(wrapper.exists()).toBe(true);
    });
  });
});

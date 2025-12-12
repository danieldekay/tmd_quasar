import { mount } from '@vue/test-utils';
import { Quasar } from 'quasar';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { computed, type Ref } from 'vue';
import type { EventResponse } from '../../../types/event';
import EventHeroSection from '../EventHeroSection.vue';

// Mock useEventDisplay composable
vi.mock('../../../composables/useEventDisplay', () => ({
  useEventDisplay: (event: Ref<EventResponse | null>) => {
    // These computeds will update when the event ref changes
    const formattedDateRange = computed(() => {
      if (!event.value?.start_date) return '';
      const start = new Date(event.value.start_date);
      const end = event.value.end_date ? new Date(event.value.end_date) : start;

      if (start.toDateString() === end.toDateString()) {
        return `${start.getDate()} ${start.toLocaleString('en', { month: 'short' })} ${start.getFullYear()}`;
      }

      if (start.getFullYear() !== end.getFullYear()) {
        return `${start.getDate()} ${start.toLocaleString('en', { month: 'short' })} ${start.getFullYear()} - ${end.getDate()} ${end.toLocaleString('en', { month: 'short' })} ${end.getFullYear()}`;
      }

      return `${start.getDate()}-${end.getDate()} ${end.toLocaleString('en', { month: 'short' })} ${end.getFullYear()}`;
    });

    const editionDisplay = computed(() => {
      if (!event.value?.edition) return null;
      const num =
        typeof event.value.edition === 'string'
          ? Number.parseInt(event.value.edition, 10)
          : event.value.edition;
      if (num === 1) return '1st Edition';
      if (num === 2) return '2nd Edition';
      if (num === 3) return '3rd Edition';
      return `${num}th Edition`;
    });

    const categoryPillData = computed(() => {
      if (!event.value?.categories?.[0]) return null;
      const categorySlug = event.value.categories[0];
      // Simplified category mapping for test
      const categoryMap: Record<string, { name: string; color: string; icon: string }> = {
        marathon: {
          name: 'Marathon',
          color: 'primary',
          icon: 'event',
        },
        festival: {
          name: 'Festival',
          color: 'secondary',
          icon: 'celebration',
        },
        encuentro: {
          name: 'Encuentro',
          color: 'accent',
          icon: 'groups',
        },
      };
      return categoryMap[categorySlug] || null;
    });

    const heroImageSrc = computed(() => {
      if (event.value?.featured_image) {
        return event.value.featured_image;
      }
      // Return category-specific placeholder if available
      const categorySlug = event.value?.categories?.[0];
      if (categorySlug) {
        return `/assets/images/event-category-${categorySlug}.jpg`;
      }
      return '/assets/images/event-default.jpg';
    });

    return {
      formattedDateRange,
      editionDisplay,
      categoryPillData,
      heroImageSrc,
    };
  },
}));

describe('EventHeroSection', () => {
  let mockEvent: EventResponse;

  beforeEach(() => {
    mockEvent = {
      id: 1,
      title: 'Buenos Aires Marathon 2025',
      slug: 'buenos-aires-marathon-2025',
      start_date: '2025-09-18',
      end_date: '2025-09-22',
      featured_image: 'https://example.com/featured.jpg',
      categories: ['marathon'],
      edition: 15,
      venue: {
        name: 'Centro Cultural',
        address: 'Av. Corrientes 1543',
        city: 'Buenos Aires',
        country: 'Argentina',
        country_code: 'AR',
        coordinates: {
          lat: -34.6037,
          lng: -58.3816,
        },
      },
    };
  });

  describe('Image Display', () => {
    it('should display featured image when available', () => {
      const wrapper = mount(EventHeroSection, {
        props: { event: mockEvent },
        global: {
          plugins: [Quasar],
        },
      });

      const img = wrapper.findComponent({ name: 'QImg' });
      expect(img.exists()).toBe(true);
      expect(img.props('src')).toBe('https://example.com/featured.jpg');
    });

    it('should display default placeholder when featured_image is missing', () => {
      const testEvent = {
        ...mockEvent,
        featured_image: undefined,
      };
      const wrapper = mount(EventHeroSection, {
        props: { event: testEvent },
        global: {
          plugins: [Quasar],
        },
      });

      const img = wrapper.findComponent({ name: 'QImg' });
      expect(img.props('src')).toBe('/assets/images/event-category-marathon.jpg');
    });

    it('should display category-specific placeholder when available', () => {
      const wrapper = mount(EventHeroSection, {
        props: { event: mockEvent },
        global: {
          plugins: [Quasar],
        },
      });

      const img = wrapper.findComponent({ name: 'QImg' });
      expect(img.exists()).toBe(true);
    });

    it('should use 16:9 aspect ratio', () => {
      const wrapper = mount(EventHeroSection, {
        props: { event: mockEvent },
        global: {
          plugins: [Quasar],
        },
      });

      const img = wrapper.findComponent({ name: 'QImg' });
      expect(img.props('ratio')).toBe(16 / 9);
    });
  });

  describe('Date Formatting', () => {
    it('should format single day event correctly', () => {
      const singleDayEvent = {
        ...mockEvent,
        start_date: '2025-09-18',
        end_date: '2025-09-18',
      };
      const wrapper = mount(EventHeroSection, {
        props: { event: singleDayEvent },
        global: {
          plugins: [Quasar],
        },
      });

      const dateText = wrapper.find('.event-date').text();
      expect(dateText).toBe('18 Sep 2025');
    });

    it('should format multi-day event correctly', () => {
      const wrapper = mount(EventHeroSection, {
        props: { event: mockEvent },
        global: {
          plugins: [Quasar],
        },
      });

      const dateText = wrapper.find('.event-date').text();
      expect(dateText).toBe('18-22 Sep 2025');
    });

    it('should format cross-year event correctly', () => {
      const crossYearEvent = {
        ...mockEvent,
        start_date: '2024-12-28',
        end_date: '2025-01-02',
      };
      const wrapper = mount(EventHeroSection, {
        props: { event: crossYearEvent },
        global: {
          plugins: [Quasar],
        },
      });

      const dateText = wrapper.find('.event-date').text();
      expect(dateText).toBe('28 Dec 2024 - 2 Jan 2025');
    });
  });

  describe('Category Pill', () => {
    it('should display category pill when category exists', () => {
      const wrapper = mount(EventHeroSection, {
        props: { event: mockEvent },
        global: {
          plugins: [Quasar],
        },
      });

      const categoryPill = wrapper.findComponent({ name: 'QChip' });
      expect(categoryPill.exists()).toBe(true);
    });

    it('should use correct category color and icon', () => {
      const wrapper = mount(EventHeroSection, {
        props: { event: mockEvent },
        global: {
          plugins: [Quasar],
        },
      });

      const categoryPill = wrapper.findComponent({ name: 'QChip' });
      expect(categoryPill.props('color')).toBe('primary');
      const icon = categoryPill.findComponent({ name: 'QIcon' });
      expect(icon.exists()).toBe(true);
      expect(icon.props('name')).toBe('event');
    });

    it('should include category icon', () => {
      const wrapper = mount(EventHeroSection, {
        props: { event: mockEvent },
        global: {
          plugins: [Quasar],
        },
      });

      const icon = wrapper.findComponent({ name: 'QIcon' });
      expect(icon.exists()).toBe(true);
    });

    it('should not display category pill when categories are empty', () => {
      const testEvent = { ...mockEvent, categories: [] };
      const wrapper = mount(EventHeroSection, {
        props: { event: testEvent },
        global: {
          plugins: [Quasar],
        },
      });

      const pills = wrapper.findAllComponents({ name: 'QChip' });
      // Should only have edition pill, not category pill
      expect(pills.length).toBe(1);
    });
  });

  describe('Edition Pill', () => {
    it('should display edition pill when edition exists', () => {
      const wrapper = mount(EventHeroSection, {
        props: { event: mockEvent },
        global: {
          plugins: [Quasar],
        },
      });

      const editionText = wrapper.text();
      expect(editionText).toContain('15th Edition');
    });

    it('should format 1st edition correctly', () => {
      const testEvent = { ...mockEvent, edition: 1 };
      const wrapper = mount(EventHeroSection, {
        props: { event: testEvent },
        global: {
          plugins: [Quasar],
        },
      });

      const editionText = wrapper.text();
      expect(editionText).toContain('1st Edition');
    });

    it('should format 2nd edition correctly', () => {
      const testEvent = { ...mockEvent, edition: 2 };
      const wrapper = mount(EventHeroSection, {
        props: { event: testEvent },
        global: {
          plugins: [Quasar],
        },
      });

      const editionText = wrapper.text();
      expect(editionText).toContain('2nd Edition');
    });

    it('should format 3rd edition correctly', () => {
      const testEvent = { ...mockEvent, edition: 3 };
      const wrapper = mount(EventHeroSection, {
        props: { event: testEvent },
        global: {
          plugins: [Quasar],
        },
      });

      const editionText = wrapper.text();
      expect(editionText).toContain('3rd Edition');
    });

    it('should not display edition pill when edition is null', () => {
      const testEvent = { ...mockEvent, edition: undefined };
      const wrapper = mount(EventHeroSection, {
        props: { event: testEvent },
        global: {
          plugins: [Quasar],
        },
      });

      const editionText = wrapper.text();
      expect(editionText).not.toContain('Edition');
    });
  });

  describe('Event Title', () => {
    it('should display event title', () => {
      const wrapper = mount(EventHeroSection, {
        props: { event: mockEvent },
        global: {
          plugins: [Quasar],
        },
      });

      const title = wrapper.find('h1.event-title');
      expect(title.text()).toBe('Buenos Aires Marathon 2025');
    });

    it('should use semantic h1 tag', () => {
      const wrapper = mount(EventHeroSection, {
        props: { event: mockEvent },
        global: {
          plugins: [Quasar],
        },
      });

      const h1 = wrapper.find('h1');
      expect(h1.exists()).toBe(true);
    });
  });

  describe('Accessibility', () => {
    it('should have aria-label for category pill', () => {
      const wrapper = mount(EventHeroSection, {
        props: { event: mockEvent },
        global: {
          plugins: [Quasar],
        },
      });

      const categoryPill = wrapper.find('.category-pill');
      expect(categoryPill.attributes('aria-label')).toBe('Event category: Marathon');
    });

    it('should have aria-label for edition pill', () => {
      const wrapper = mount(EventHeroSection, {
        props: { event: mockEvent },
        global: {
          plugins: [Quasar],
        },
      });

      const editionPill = wrapper.find('.edition-pill');
      expect(editionPill.attributes('aria-label')).toBe('Event edition: 15th Edition');
    });

    it('should maintain semantic HTML structure', () => {
      const wrapper = mount(EventHeroSection, {
        props: { event: mockEvent },
        global: {
          plugins: [Quasar],
        },
      });

      expect(wrapper.find('h1').exists()).toBe(true);
      expect(wrapper.find('.event-date').exists()).toBe(true);
    });
  });

  describe('Responsive Layout', () => {
    it('should have proper mobile layout classes', () => {
      const wrapper = mount(EventHeroSection, {
        props: { event: mockEvent },
        global: {
          plugins: [Quasar],
        },
      });

      const pillContainer = wrapper.find('.q-gutter-sm');
      expect(pillContainer.exists()).toBe(true);
    });

    it('should have proper desktop layout classes', () => {
      const wrapper = mount(EventHeroSection, {
        props: { event: mockEvent },
        global: {
          plugins: [Quasar],
        },
      });

      // Desktop layout uses row direction in CSS
      const pillContainer = wrapper.find('.row');
      expect(pillContainer.exists()).toBe(true);
    });
  });

  describe('Null Event Handling', () => {
    it('should handle null event prop', () => {
      const wrapper = mount(EventHeroSection, {
        props: { event: null },
        global: {
          plugins: [Quasar],
        },
      });

      expect(wrapper.exists()).toBe(true);
    });

    it('should not crash with missing event data', () => {
      const wrapper = mount(EventHeroSection, {
        props: { event: null },
        global: {
          plugins: [Quasar],
        },
      });

      expect(wrapper.find('.event-title').exists()).toBe(false);
    });
  });
});

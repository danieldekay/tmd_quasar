/**
 * useEventDisplay Composable Tests
 *
 * Tests for the useEventDisplay Vue 3 composable including reactivity tests.
 * These tests MUST fail until the implementation is complete.
 *
 * Reference: /specs/004-event-display/contracts/use-event-display.contract.md
 */

import { describe, expect, it } from 'vitest';
import { nextTick, ref } from 'vue';
import type { EventResponse } from '../../types/event';
import { useEventDisplay } from '../useEventDisplay';

// Mock event factory for tests
const createMockEvent = (overrides?: Partial<EventResponse>): EventResponse => ({
  id: 1,
  title: 'Test Event',
  slug: 'test-event',
  start_date: '2025-09-18',
  end_date: '2025-09-22',
  featured_image: 'https://example.com/image.jpg',
  categories: ['marathon'],
  edition: 13,
  ...overrides,
});

describe('useEventDisplay', () => {
  describe('formattedDateRange', () => {
    it('should format valid date range correctly', () => {
      const event = ref(createMockEvent());
      const { formattedDateRange } = useEventDisplay(event);

      expect(formattedDateRange.value).toBe('18-22 Sep 2025');
    });

    it('should update reactively when dates change', async () => {
      const event = ref(createMockEvent());
      const { formattedDateRange } = useEventDisplay(event);

      expect(formattedDateRange.value).toBe('18-22 Sep 2025');

      event.value = createMockEvent({ end_date: '2025-09-25' });
      await nextTick();

      expect(formattedDateRange.value).toBe('18-25 Sep 2025');
    });

    it('should fallback to "Dates TBD" for invalid dates', async () => {
      const event = ref(createMockEvent({ start_date: 'invalid' }));
      const { formattedDateRange } = useEventDisplay(event);

      expect(formattedDateRange.value).toBe('Dates TBD');
    });

    it('should fallback to "Dates TBD" for missing dates', () => {
      const event = ref(createMockEvent({ start_date: undefined, end_date: undefined }));
      const { formattedDateRange } = useEventDisplay(event);

      expect(formattedDateRange.value).toBe('Dates TBD');
    });

    it('should handle null event gracefully', () => {
      const event = ref<EventResponse | null>(null);
      const { formattedDateRange } = useEventDisplay(event);

      expect(formattedDateRange.value).toBe('Dates TBD');
    });
  });

  describe('editionDisplay', () => {
    it('should format number edition correctly', () => {
      const event = ref(createMockEvent({ edition: 13 }));
      const { editionDisplay } = useEventDisplay(event);

      expect(editionDisplay.value).toBe('13th Edition');
    });

    it('should format string edition correctly', () => {
      const event = ref(createMockEvent({ edition: '21' }));
      const { editionDisplay } = useEventDisplay(event);

      expect(editionDisplay.value).toBe('21st Edition');
    });

    it('should update reactively when edition changes', async () => {
      const event = ref(createMockEvent({ edition: 1 }));
      const { editionDisplay } = useEventDisplay(event);

      expect(editionDisplay.value).toBe('1st Edition');

      event.value = createMockEvent({ edition: 2 });
      await nextTick();

      expect(editionDisplay.value).toBe('2nd Edition');
    });

    it('should return null for undefined edition', () => {
      const event = ref(createMockEvent({ edition: undefined }));
      const { editionDisplay } = useEventDisplay(event);

      expect(editionDisplay.value).toBeNull();
    });

    it('should handle null event gracefully', () => {
      const event = ref<EventResponse | null>(null);
      const { editionDisplay } = useEventDisplay(event);

      expect(editionDisplay.value).toBeNull();
    });
  });

  describe('categoryPillData', () => {
    it('should return marathon config for marathon category', () => {
      const event = ref(createMockEvent({ categories: ['marathon'] }));
      const { categoryPillData } = useEventDisplay(event);

      expect(categoryPillData.value).not.toBeNull();
      expect(categoryPillData.value?.slug).toBe('marathon');
      expect(categoryPillData.value?.name).toBe('Tango Marathon');
      expect(categoryPillData.value?.color).toBe('#1976D2');
    });

    it('should return festival config for festival category', () => {
      const event = ref(createMockEvent({ categories: ['festival'] }));
      const { categoryPillData } = useEventDisplay(event);

      expect(categoryPillData.value?.slug).toBe('festival');
      expect(categoryPillData.value?.color).toBe('#7B1FA2');
    });

    it('should use first category when multiple provided', () => {
      const event = ref(createMockEvent({ categories: ['festival', 'marathon'] }));
      const { categoryPillData } = useEventDisplay(event);

      expect(categoryPillData.value?.slug).toBe('festival');
    });

    it('should update reactively when categories change', async () => {
      const event = ref(createMockEvent({ categories: ['marathon'] }));
      const { categoryPillData } = useEventDisplay(event);

      expect(categoryPillData.value?.slug).toBe('marathon');

      event.value = createMockEvent({ categories: ['workshop'] });
      await nextTick();

      expect(categoryPillData.value?.slug).toBe('workshop');
    });

    it('should return null for empty categories array', () => {
      const event = ref(createMockEvent({ categories: [] }));
      const { categoryPillData } = useEventDisplay(event);

      expect(categoryPillData.value).toBeNull();
    });

    it('should return null for undefined categories', () => {
      const event = ref(createMockEvent({ categories: undefined }));
      const { categoryPillData } = useEventDisplay(event);

      expect(categoryPillData.value).toBeNull();
    });

    it('should handle null event gracefully', () => {
      const event = ref<EventResponse | null>(null);
      const { categoryPillData } = useEventDisplay(event);

      expect(categoryPillData.value).toBeNull();
    });
  });

  describe('heroImageSrc', () => {
    it('should return featured image when available', () => {
      const event = ref(
        createMockEvent({
          featured_image: 'https://example.com/featured.jpg',
        }),
      );
      const { heroImageSrc } = useEventDisplay(event);

      expect(heroImageSrc.value).toBe('https://example.com/featured.jpg');
    });

    it('should fallback to category default image when no featured image', () => {
      const event = ref(
        createMockEvent({
          featured_image: undefined,
          categories: ['marathon'],
        }),
      );
      const { heroImageSrc } = useEventDisplay(event);

      expect(heroImageSrc.value).toContain('marathon');
    });

    it('should update reactively when featured image changes', async () => {
      const event = ref(
        createMockEvent({
          featured_image: 'https://example.com/image1.jpg',
        }),
      );
      const { heroImageSrc } = useEventDisplay(event);

      expect(heroImageSrc.value).toBe('https://example.com/image1.jpg');

      event.value = createMockEvent({
        featured_image: 'https://example.com/image2.jpg',
      });
      await nextTick();

      expect(heroImageSrc.value).toBe('https://example.com/image2.jpg');
    });

    it('should change category fallback when category changes', async () => {
      const event = ref(
        createMockEvent({
          featured_image: undefined,
          categories: ['marathon'],
        }),
      );
      const { heroImageSrc } = useEventDisplay(event);

      const marathonImage = heroImageSrc.value;
      expect(marathonImage).toContain('marathon');

      event.value = createMockEvent({
        featured_image: undefined,
        categories: ['festival'],
      });
      await nextTick();

      expect(heroImageSrc.value).toContain('festival');
      expect(heroImageSrc.value).not.toBe(marathonImage);
    });

    it('should never return null or undefined', () => {
      const event = ref(
        createMockEvent({
          featured_image: undefined,
          categories: undefined,
        }),
      );
      const { heroImageSrc } = useEventDisplay(event);

      expect(heroImageSrc.value).toBeTruthy();
      expect(typeof heroImageSrc.value).toBe('string');
    });

    it('should handle null event with default fallback', () => {
      const event = ref<EventResponse | null>(null);
      const { heroImageSrc } = useEventDisplay(event);

      expect(heroImageSrc.value).toBeTruthy();
      expect(typeof heroImageSrc.value).toBe('string');
    });
  });

  describe('integration - all properties work together', () => {
    it('should provide all computed properties simultaneously', () => {
      const event = ref(createMockEvent());
      const { formattedDateRange, editionDisplay, categoryPillData, heroImageSrc } =
        useEventDisplay(event);

      expect(formattedDateRange.value).toBe('18-22 Sep 2025');
      expect(editionDisplay.value).toBe('13th Edition');
      expect(categoryPillData.value?.slug).toBe('marathon');
      expect(heroImageSrc.value).toBe('https://example.com/image.jpg');
    });

    it('should update all properties reactively when event changes', async () => {
      const event = ref(createMockEvent());
      const display = useEventDisplay(event);

      // Initial state
      expect(display.formattedDateRange.value).toBe('18-22 Sep 2025');
      expect(display.editionDisplay.value).toBe('13th Edition');

      // Update event
      event.value = createMockEvent({
        start_date: '2025-10-01',
        end_date: '2025-10-05',
        edition: 14,
        categories: ['festival'],
      });
      await nextTick();

      // Verify all updated
      expect(display.formattedDateRange.value).toBe('1-5 Oct 2025');
      expect(display.editionDisplay.value).toBe('14th Edition');
      expect(display.categoryPillData.value?.slug).toBe('festival');
    });
  });
});

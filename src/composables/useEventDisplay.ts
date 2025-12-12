/**
 * useEventDisplay Composable
 *
 * Provides reactive computed properties for event display in hero sections
 * Encapsulates date formatting, edition display, category pills, and image selection
 *
 * Reference: /specs/004-event-display/contracts/use-event-display.contract.md
 */

import { type ComputedRef, computed, type Ref } from 'vue';
import type { CategoryConfig, EventResponse } from '../types/event';
import { getCategoryDefaultImage, getCategoryPillData } from '../utils/categoryImages';
import { formatEdition, formatEventDateRange } from '../utils/dateFormatters';

/**
 * Composable for event display logic
 * @param event - Reactive reference to EventResponse or null
 * @returns Computed properties for event display
 */
export function useEventDisplay(event: Ref<EventResponse | null>): {
  formattedDateRange: ComputedRef<string>;
  editionDisplay: ComputedRef<string | null>;
  categoryPillData: ComputedRef<CategoryConfig | null>;
  heroImageSrc: ComputedRef<string>;
} {
  /**
   * Formatted date range with fallback
   * Returns "18-22 Sep 2025" or "Dates TBD" for invalid/missing dates
   */
  const formattedDateRange = computed(() => {
    if (!event.value) {
      return 'Dates TBD';
    }

    const startDate = event.value.start_date;
    const endDate = event.value.end_date;

    // Missing dates
    if (!startDate) {
      return 'Dates TBD';
    }

    try {
      return formatEventDateRange(startDate, endDate);
    } catch {
      // Invalid dates (formatEventDateRange throws on invalid input)
      return 'Dates TBD';
    }
  });

  /**
   * Edition display with formatting
   * Returns "13th Edition" or null for missing edition
   */
  const editionDisplay = computed(() => {
    if (!event.value) {
      return null;
    }

    return formatEdition(event.value.edition);
  });

  /**
   * Category pill data for display
   * Returns CategoryConfig object or null (hides pill if null)
   */
  const categoryPillData = computed(() => {
    if (!event.value) {
      return null;
    }

    return getCategoryPillData(event.value.categories);
  });

  /**
   * Hero image source with category fallback
   * Never returns null - always has a valid image path
   */
  const heroImageSrc = computed(() => {
    if (!event.value) {
      // No event: use default marathon image
      return getCategoryDefaultImage(undefined);
    }

    // Use featured image if available
    if (event.value.featured_image) {
      return event.value.featured_image;
    }

    // Fallback to category-specific default image
    return getCategoryDefaultImage(event.value.categories);
  });

  return {
    formattedDateRange,
    editionDisplay,
    categoryPillData,
    heroImageSrc,
  };
}

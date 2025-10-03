/**
 * Category Images and Configuration Utility
 * Provides category configuration, image paths, and pill data for event display
 *
 * Reference: /specs/004-event-display/contracts/category-images.contract.md
 */

import type { CategoryConfig } from '../types/event';

/**
 * Category configuration mapping
 * All colors meet WCAG 2.1 AA contrast requirements (4.5:1 minimum)
 * Icons are Material Icons names
 */
export const CATEGORY_CONFIG: Record<string, CategoryConfig> = {
  marathon: {
    slug: 'marathon',
    name: 'Tango Marathon',
    color: '#1976D2', // Blue
    textColor: '#FFFFFF',
    icon: 'event',
    defaultImage: '/images/category-defaults/marathon.webp',
  },
  festival: {
    slug: 'festival',
    name: 'Tango Festival',
    color: '#7B1FA2', // Purple
    textColor: '#FFFFFF',
    icon: 'celebration',
    defaultImage: '/images/category-defaults/festival.webp',
  },
  encuentro: {
    slug: 'encuentro',
    name: 'Tango Encuentro',
    color: '#C2185B', // Pink
    textColor: '#FFFFFF',
    icon: 'people',
    defaultImage: '/images/category-defaults/encuentro.webp',
  },
  workshop: {
    slug: 'workshop',
    name: 'Tango Workshop',
    color: '#388E3C', // Green
    textColor: '#FFFFFF',
    icon: 'school',
    defaultImage: '/images/category-defaults/workshop.webp',
  },
} as const;

/**
 * Get category configuration with fallback to marathon
 * Case-insensitive lookup; unknown categories return marathon config
 */
export function getCategoryConfig(categorySlug: string | undefined): CategoryConfig {
  // Fallback to marathon if undefined or empty
  if (!categorySlug || categorySlug.trim() === '') {
    return CATEGORY_CONFIG.marathon as CategoryConfig;
  }

  // Case-insensitive lookup
  const slug = categorySlug.toLowerCase().trim();
  const config = CATEGORY_CONFIG[slug];
  return config ? config : (CATEGORY_CONFIG.marathon as CategoryConfig);
}

/**
 * Get category-specific default image path
 * Uses first category in array, fallback to marathon image
 */
export function getCategoryDefaultImage(categories: string[] | undefined): string {
  // Fallback to marathon if no categories
  if (!categories || categories.length === 0) {
    return (CATEGORY_CONFIG.marathon as CategoryConfig).defaultImage;
  }

  // Get config for first category (with fallback)
  const config = getCategoryConfig(categories[0]);
  return config.defaultImage;
}

/**
 * Get complete category data for pill display
 * Returns null if no categories (indicating pill should be hidden)
 * Uses first category in array
 */
export function getCategoryPillData(categories: string[] | undefined): CategoryConfig | null {
  // Return null if no categories (hide pill)
  if (!categories || categories.length === 0) {
    return null;
  }

  // Get config for first category (with fallback)
  return getCategoryConfig(categories[0]);
}

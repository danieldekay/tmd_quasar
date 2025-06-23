import type { EventTaxonomies } from '../services/types';

export const useFormatters = () => {
  /**
   * Format a date-like value to ISO YYYY-MM-DD (empty string on failure)
   */
  const formatDate = (value: string | number | boolean | null | undefined): string => {
    if (value === null || value === undefined || value === '') return '';
    if (typeof value === 'boolean') return '';

    let timestamp: number;

    if (typeof value === 'string') {
      // Accept ISO YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss
      if (/^\d{4}-\d{2}-\d{2}(T.*)?$/.test(value)) {
        timestamp = Date.parse(value);
      } else if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
        // Handle MM/DD/YYYY by manually constructing a Date in UTC to avoid locale ambiguity
        const [mStr, dStr, yStr] = value.split('/');
        const month = Number(mStr);
        const day = Number(dStr);
        const year = Number(yStr);
        if (Number.isNaN(month) || Number.isNaN(day) || Number.isNaN(year)) {
          return '';
        }
        timestamp = Date.UTC(year, month - 1, day);
      } else {
        return '';
      }
    } else if (typeof value === 'number') {
      timestamp = value;
    } else {
      timestamp = NaN;
    }

    if (Number.isNaN(timestamp)) return '';

    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) return '';

    const isoDate = date.toISOString().split('T')[0] ?? '';
    return isoDate;
  };

  /**
   * Format a date-time value with relative time for recent dates
   */
  const formatDateTime = (value: string | number | boolean | null | undefined): string => {
    if (value === null || value === undefined || value === '') return '';
    if (typeof value === 'boolean') return '';

    let timestamp: number;

    if (typeof value === 'string') {
      if (!/^\d{4}-\d{2}-\d{2}(T.*)?$/.test(value)) {
        return '';
      }
      timestamp = Date.parse(value);
    } else if (typeof value === 'number') {
      timestamp = value;
    } else {
      timestamp = NaN;
    }

    if (Number.isNaN(timestamp)) return '';

    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) return '';

    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    // Show relative time for recent dates
    if (diffInSeconds < 60) {
      return 'just now';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
    } else if (diffInDays < 7) {
      return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
    } else {
      // For older dates, show formatted date
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
  };

  /**
   * Build a human-readable location from city / country.
   */
  const formatLocation = (city?: string | null, country?: string | null): string => {
    if (city && country) return `${city}, ${country}`;
    if (city) return city;
    if (country) return country;
    return '—';
  };

  /**
   * Color mapping for event categories
   */
  const categoryColorMap: Record<string, { color: string; textColor: string; icon?: string }> = {
    // Marathon types
    marathon: { color: 'red-7', textColor: 'white', icon: 'directions_run' },
    'tango marathon': { color: 'red-7', textColor: 'white', icon: 'directions_run' },
    'milonga marathon': { color: 'red-8', textColor: 'white', icon: 'directions_run' },

    // Festival types
    festival: { color: 'purple-6', textColor: 'white', icon: 'celebration' },
    'tango festival': { color: 'purple-6', textColor: 'white', icon: 'celebration' },
    'music festival': { color: 'purple-7', textColor: 'white', icon: 'music_note' },

    // Encuentro types
    encuentro: { color: 'blue-6', textColor: 'white', icon: 'groups' },
    'tango encuentro': { color: 'blue-6', textColor: 'white', icon: 'groups' },
    'milonga encuentro': { color: 'blue-7', textColor: 'white', icon: 'groups' },

    // Weekend events
    weekend: { color: 'green-6', textColor: 'white', icon: 'weekend' },
    'tango weekend': { color: 'green-6', textColor: 'white', icon: 'weekend' },
    'milonga weekend': { color: 'green-7', textColor: 'white', icon: 'weekend' },

    // Special events
    workshop: { color: 'orange-6', textColor: 'white', icon: 'school' },
    masterclass: { color: 'orange-7', textColor: 'white', icon: 'star' },
    seminar: { color: 'orange-5', textColor: 'white', icon: 'psychology' },

    // Competition events
    competition: { color: 'amber-7', textColor: 'black', icon: 'emoji_events' },
    championship: { color: 'amber-8', textColor: 'white', icon: 'emoji_events' },
    contest: { color: 'amber-6', textColor: 'black', icon: 'emoji_events' },

    // Social events
    milonga: { color: 'teal-6', textColor: 'white', icon: 'music_note' },
    practica: { color: 'teal-5', textColor: 'white', icon: 'fitness_center' },
    social: { color: 'teal-7', textColor: 'white', icon: 'people' },

    // Special occasions
    'new year': { color: 'indigo-6', textColor: 'white', icon: 'celebration' },
    christmas: { color: 'red-6', textColor: 'white', icon: 'celebration' },
    valentine: { color: 'pink-6', textColor: 'white', icon: 'favorite' },
    anniversary: { color: 'deep-purple-6', textColor: 'white', icon: 'cake' },

    // Default fallback
    other: { color: 'grey-6', textColor: 'white', icon: 'event' },
  };

  /**
   * Extract event category names from taxonomies
   */
  const getEventCategory = (taxonomies?: EventTaxonomies): string => {
    if (!taxonomies || !taxonomies['event-categories-2020']) return '';

    const categories = taxonomies['event-categories-2020'];
    if (!Array.isArray(categories) || categories.length === 0) return '';

    // Return the first category name, or join multiple categories with commas
    return categories.map((cat) => cat.name).join(', ');
  };

  /**
   * Get color configuration for an event category
   */
  const getCategoryColor = (
    category: string,
  ): { color: string; textColor: string; icon?: string } => {
    if (!category) return categoryColorMap['other']!;

    const normalizedCategory = category.toLowerCase().trim();

    // Try exact match first
    if (categoryColorMap[normalizedCategory]) {
      return categoryColorMap[normalizedCategory];
    }

    // Try partial matches for compound categories
    for (const [key, value] of Object.entries(categoryColorMap)) {
      if (normalizedCategory.includes(key)) {
        return value;
      }
    }

    // Default fallback
    return categoryColorMap['other']!;
  };

  /**
   * Get color configuration for event category from taxonomies
   */
  const getEventCategoryColor = (
    taxonomies?: EventTaxonomies,
  ): { color: string; textColor: string; icon?: string } => {
    const category = getEventCategory(taxonomies);
    return getCategoryColor(category);
  };

  /**
   * Helper function to check if a V3 API feature is available
   * V3 API returns features as "0" or "1" strings, use this to check if value === '1'
   */
  const isFeatureAvailable = (value: unknown): boolean => {
    return String(value) === '1';
  };

  /**
   * Decode HTML entities in text
   * Handles common HTML entities like &amp;, &lt;, &gt;, &quot;, &#39;, etc.
   */
  const decodeHtmlEntities = (text: string | null | undefined): string => {
    if (!text || typeof text !== 'string') return '';

    // Create a temporary element to leverage browser's built-in HTML decoding
    const tempElement = document.createElement('div');
    tempElement.innerHTML = text;
    return tempElement.textContent || tempElement.innerText || '';
  };

  /**
   * Format text by decoding HTML entities - safe for display
   * This is the main formatter to use in tables and other UI components
   */
  const formatText = (text: string | null | undefined): string => {
    return decodeHtmlEntities(text);
  };

  return {
    formatDate,
    formatDateTime,
    formatLocation,
    getEventCategory,
    getCategoryColor,
    getEventCategoryColor,
    isFeatureAvailable,
    decodeHtmlEntities,
    formatText,
  };
};

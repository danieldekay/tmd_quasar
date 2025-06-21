/**
 * V3 API Utilities
 * Shared functionality for V3 HAL-compliant API interactions
 */

import type { EventTaxonomies } from './types';

/**
 * Helper function to check if a V3 API feature is available
 * V3 API returns features as "0" or "1" strings
 */
export const isFeatureAvailable = (value: unknown): boolean => {
  return String(value) === '1';
};

/**
 * Safely convert unknown value to string with proper undefined handling
 */
export const safeString = (value: unknown): string => {
  if (typeof value === 'string') return value;
  if (value === null || value === undefined) return '';
  if (typeof value === 'number') return value.toString();
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  return '';
};

/**
 * Enhanced string conversion that handles WordPress rendered objects
 */
export const getString = (value: unknown): string => {
  if (typeof value === 'string') return value;
  if (typeof value === 'object' && value !== null) {
    if ('rendered' in value && typeof (value as { rendered: unknown }).rendered === 'string') {
      return (value as { rendered: string }).rendered;
    }
    // For complex objects, try JSON stringify as fallback
    try {
      return JSON.stringify(value);
    } catch {
      return '';
    }
  }
  if (value === null || value === undefined) return '';
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  if (typeof value === 'number') return value.toString();
  return '';
};

/**
 * Extract taxonomies from V3 API response
 */
export const extractTaxonomies = (
  rawEvent: Record<string, unknown>,
): EventTaxonomies | undefined => {
  let taxonomies: EventTaxonomies | undefined;

  // Check for direct taxonomy data (v3 API may include this)
  if (rawEvent['event-categories-2020']) {
    const categories = rawEvent['event-categories-2020'];
    if (Array.isArray(categories)) {
      taxonomies = {
        'event-categories-2020': categories.map((cat: unknown) => {
          if (cat && typeof cat === 'object') {
            const catObj = cat as Record<string, unknown>;
            return {
              id: Number(catObj.id) || 0,
              name: getString(catObj.name),
              slug: getString(catObj.slug),
              description: getString(catObj.description || ''),
            };
          }
          return { id: 0, name: '', slug: '', description: '' };
        }),
      };
    }
  }

  // Fallback to _embedded structure if available
  if (!taxonomies && rawEvent._embedded && typeof rawEvent._embedded === 'object') {
    const embedded = rawEvent._embedded as Record<string, unknown>;
    const wpTerms = embedded['wp:term'];

    if (Array.isArray(wpTerms) && wpTerms.length > 0) {
      const extractedTaxonomies: EventTaxonomies = {};

      wpTerms.forEach((termGroup: unknown) => {
        if (Array.isArray(termGroup)) {
          termGroup.forEach((term: unknown) => {
            if (term && typeof term === 'object') {
              const termObj = term as Record<string, unknown>;
              const taxonomyName = getString(termObj.taxonomy);
              const termName = getString(termObj.name);
              const termSlug = getString(termObj.slug);
              const termId = Number(termObj.id) || 0;

              if (taxonomyName === 'event-categories-2020' && termName) {
                if (!extractedTaxonomies['event-categories-2020']) {
                  extractedTaxonomies['event-categories-2020'] = [];
                }
                extractedTaxonomies['event-categories-2020'].push({
                  id: termId,
                  name: termName,
                  slug: termSlug,
                  description: '',
                });
              }
            }
          });
        }
      });

      if (Object.keys(extractedTaxonomies).length > 0) {
        taxonomies = extractedTaxonomies;
      }
    }
  }

  return taxonomies;
};

/**
 * Parse price information with currency
 */
export const parsePriceInfo = (price: unknown, currency: unknown) => {
  const priceStr = safeString(price);
  const currencyStr = safeString(currency);

  return {
    price: priceStr || 'TBD',
    currency: currencyStr || 'EUR',
    isFree: priceStr === '0' || priceStr.toLowerCase().includes('free'),
    hasPricing: priceStr !== '' && priceStr !== 'TBD',
    displayPrice: priceStr && currencyStr ? `${priceStr} ${currencyStr}` : priceStr || 'TBD',
  };
};

/**
 * Parse location information
 */
export const parseLocationInfo = (
  city: unknown,
  country: unknown,
  venueName: unknown,
  street?: unknown,
  lat?: unknown,
  lon?: unknown,
) => {
  const cityStr = safeString(city);
  const countryStr = safeString(country);
  const venueStr = safeString(venueName);
  const streetStr = safeString(street);

  return {
    city: cityStr || 'TBD',
    country: countryStr || 'TBD',
    venueName: venueStr || 'TBD',
    street: streetStr || '',
    hasCoordinates: !!(lat && lon),
    coordinates: lat && lon ? { lat: Number(lat), lon: Number(lon) } : null,
    displayLocation: [venueStr, cityStr, countryStr].filter(Boolean).join(', ') || 'TBD',
  };
};

/**
 * Calculate event duration in days
 */
export const calculateEventDuration = (startDate: string, endDate?: string): number => {
  if (!startDate || !endDate) return 1; // Default to 1 day

  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return Math.max(1, diffDays); // At least 1 day
};

/**
 * Check if a date is today
 */
export const isDateToday = (dateStr: string): boolean => {
  if (!dateStr) return false;

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const eventDateStr = dateStr.split('T')[0];

  return todayStr === eventDateStr;
};

/**
 * Check if event is happening within specified days
 */
export const isEventWithinDays = (startDate: string, daysAhead = 30): boolean => {
  if (!startDate) return false;

  const eventDate = new Date(startDate);
  const today = new Date();
  const futureDate = new Date();
  futureDate.setDate(today.getDate() + daysAhead);

  return eventDate >= today && eventDate <= futureDate;
};

/**
 * Check if event is happening today (supports multi-day events)
 */
export const isEventToday = (startDate: string, endDate?: string): boolean => {
  if (!startDate) return false;

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const eventStart = startDate.split('T')[0];

  if (!todayStr || !eventStart) return false;

  if (endDate) {
    const eventEnd = endDate.split('T')[0];
    if (!eventEnd) return todayStr === eventStart;
    return todayStr >= eventStart && todayStr <= eventEnd;
  }

  return todayStr === eventStart;
};

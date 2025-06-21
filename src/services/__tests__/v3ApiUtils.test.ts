import { describe, it, expect } from 'vitest';
import {
  isFeatureAvailable,
  safeString,
  getString,
  extractTaxonomies,
  parsePriceInfo,
  parseLocationInfo,
  calculateEventDuration,
  isDateToday,
  isEventWithinDays,
  isEventToday,
} from '../v3ApiUtils';

describe('v3ApiUtils', () => {
  describe('isFeatureAvailable', () => {
    it('returns true for string "1"', () => {
      expect(isFeatureAvailable('1')).toBe(true);
    });

    it('returns false for string "0"', () => {
      expect(isFeatureAvailable('0')).toBe(false);
    });

    it('returns true for number 1', () => {
      expect(isFeatureAvailable(1)).toBe(true);
    });

    it('returns false for number 0', () => {
      expect(isFeatureAvailable(0)).toBe(false);
    });

    it('returns false for null', () => {
      expect(isFeatureAvailable(null)).toBe(false);
    });

    it('returns false for undefined', () => {
      expect(isFeatureAvailable(undefined)).toBe(false);
    });

    it('returns false for empty string', () => {
      expect(isFeatureAvailable('')).toBe(false);
    });

    it('returns false for boolean false', () => {
      expect(isFeatureAvailable(false)).toBe(false);
    });

    it('returns false for arbitrary string', () => {
      expect(isFeatureAvailable('test')).toBe(false);
    });
  });

  describe('safeString', () => {
    it('returns string as-is', () => {
      expect(safeString('hello')).toBe('hello');
    });

    it('returns empty string for null', () => {
      expect(safeString(null)).toBe('');
    });

    it('returns empty string for undefined', () => {
      expect(safeString(undefined)).toBe('');
    });

    it('converts number to string', () => {
      expect(safeString(123)).toBe('123');
    });

    it('converts boolean true to "true"', () => {
      expect(safeString(true)).toBe('true');
    });

    it('converts boolean false to "false"', () => {
      expect(safeString(false)).toBe('false');
    });

    it('returns empty string for object', () => {
      expect(safeString({})).toBe('');
    });
  });

  describe('getString', () => {
    it('returns string as-is', () => {
      expect(getString('hello')).toBe('hello');
    });

    it('extracts rendered property from WordPress object', () => {
      const wpObject = { rendered: 'WordPress content' };
      expect(getString(wpObject)).toBe('WordPress content');
    });

    it('returns JSON string for complex objects without rendered property', () => {
      const complexObject = { name: 'test', value: 123 };
      expect(getString(complexObject)).toBe('{"name":"test","value":123}');
    });

    it('returns empty string for invalid JSON objects', () => {
      const circularObj: { self?: unknown } = {};
      circularObj.self = circularObj;
      expect(getString(circularObj)).toBe('');
    });

    it('returns empty string for null', () => {
      expect(getString(null)).toBe('');
    });

    it('returns empty string for undefined', () => {
      expect(getString(undefined)).toBe('');
    });

    it('converts numbers to string', () => {
      expect(getString(456)).toBe('456');
    });

    it('converts booleans to string', () => {
      expect(getString(true)).toBe('true');
      expect(getString(false)).toBe('false');
    });
  });

  describe('extractTaxonomies', () => {
    it('extracts taxonomies from direct event-categories-2020 property', () => {
      const rawEvent = {
        'event-categories-2020': [
          { id: 1, name: 'Marathon', slug: 'marathon', description: 'Long event' },
          { id: 2, name: 'Milonga', slug: 'milonga', description: 'Social dance' },
        ],
      };

      const result = extractTaxonomies(rawEvent);
      expect(result).toBeDefined();
      expect(result?.['event-categories-2020']).toHaveLength(2);
      expect(result?.['event-categories-2020']?.[0]).toEqual({
        id: 1,
        name: 'Marathon',
        slug: 'marathon',
        description: 'Long event',
      });
    });

    it('extracts taxonomies from _embedded wp:term structure', () => {
      const rawEvent = {
        _embedded: {
          'wp:term': [
            [
              {
                id: 1,
                name: 'Festival',
                slug: 'festival',
                taxonomy: 'event-categories-2020',
              },
              {
                id: 2,
                name: 'Workshop',
                slug: 'workshop',
                taxonomy: 'event-categories-2020',
              },
            ],
          ],
        },
      };

      const result = extractTaxonomies(rawEvent);
      expect(result).toBeDefined();
      expect(result?.['event-categories-2020']).toHaveLength(2);
      expect(result?.['event-categories-2020']?.[0]).toEqual({
        id: 1,
        name: 'Festival',
        slug: 'festival',
        description: '',
      });
    });

    it('returns undefined for empty event data', () => {
      const result = extractTaxonomies({});
      expect(result).toBeUndefined();
    });

    it('handles invalid taxonomy data gracefully', () => {
      const rawEvent = {
        'event-categories-2020': ['invalid', null, {}],
      };

      const result = extractTaxonomies(rawEvent);
      expect(result).toBeDefined();
      expect(result?.['event-categories-2020']).toHaveLength(3);
      expect(result?.['event-categories-2020']?.[0]).toEqual({
        id: 0,
        name: '',
        slug: '',
        description: '',
      });
    });
  });

  describe('parsePriceInfo', () => {
    it('parses valid price and currency', () => {
      const result = parsePriceInfo('50', 'EUR');
      expect(result).toEqual({
        price: '50',
        currency: 'EUR',
        isFree: false,
        hasPricing: true,
        displayPrice: '50 EUR',
      });
    });

    it('handles free events', () => {
      const result = parsePriceInfo('0', 'EUR');
      expect(result).toEqual({
        price: '0',
        currency: 'EUR',
        isFree: true,
        hasPricing: true,
        displayPrice: '0 EUR',
      });
    });

    it('handles free events with "free" text', () => {
      const result = parsePriceInfo('Free', 'EUR');
      expect(result).toEqual({
        price: 'Free',
        currency: 'EUR',
        isFree: true,
        hasPricing: true,
        displayPrice: 'Free EUR',
      });
    });

    it('provides defaults for missing data', () => {
      const result = parsePriceInfo(null, null);
      expect(result).toEqual({
        price: 'TBD',
        currency: 'EUR',
        isFree: false,
        hasPricing: false,
        displayPrice: 'TBD',
      });
    });

    it('handles partial data - price without currency', () => {
      const result = parsePriceInfo('30', null);
      expect(result).toEqual({
        price: '30',
        currency: 'EUR',
        isFree: false,
        hasPricing: true,
        displayPrice: '30',
      });
    });
  });

  describe('parseLocationInfo', () => {
    it('parses complete location information', () => {
      const result = parseLocationInfo(
        'Berlin',
        'Germany',
        'Tango Studio',
        'Musterstraße 123',
        52.52,
        13.405,
      );

      expect(result).toEqual({
        city: 'Berlin',
        country: 'Germany',
        venueName: 'Tango Studio',
        street: 'Musterstraße 123',
        hasCoordinates: true,
        coordinates: { lat: 52.52, lon: 13.405 },
        displayLocation: 'Tango Studio, Berlin, Germany',
      });
    });

    it('handles minimal location information', () => {
      const result = parseLocationInfo('Paris', 'France', null);

      expect(result).toEqual({
        city: 'Paris',
        country: 'France',
        venueName: 'TBD',
        street: '',
        hasCoordinates: false,
        coordinates: null,
        displayLocation: 'Paris, France',
      });
    });

    it('provides defaults for missing data', () => {
      const result = parseLocationInfo(null, null, null);

      expect(result).toEqual({
        city: 'TBD',
        country: 'TBD',
        venueName: 'TBD',
        street: '',
        hasCoordinates: false,
        coordinates: null,
        displayLocation: 'TBD',
      });
    });

    it('handles coordinates without other data', () => {
      const result = parseLocationInfo(null, null, null, null, 40.7128, -74.006);

      expect(result).toEqual({
        city: 'TBD',
        country: 'TBD',
        venueName: 'TBD',
        street: '',
        hasCoordinates: true,
        coordinates: { lat: 40.7128, lon: -74.006 },
        displayLocation: 'TBD',
      });
    });
  });

  describe('calculateEventDuration', () => {
    it('calculates duration for multi-day event', () => {
      const result = calculateEventDuration('2024-01-15', '2024-01-17');
      expect(result).toBe(2);
    });

    it('returns 1 for same-day event', () => {
      const result = calculateEventDuration('2024-01-15', '2024-01-15');
      expect(result).toBe(1);
    });

    it('returns 1 for single date (no end date)', () => {
      const result = calculateEventDuration('2024-01-15');
      expect(result).toBe(1);
    });

    it('returns 1 for empty dates', () => {
      const result = calculateEventDuration('', '');
      expect(result).toBe(1);
    });

    it('handles date-time strings correctly', () => {
      const result = calculateEventDuration('2024-01-15T10:00:00Z', '2024-01-16T18:00:00Z');
      expect(result).toBe(2);
    });
  });

  describe('isDateToday', () => {
    it("returns true for today's date", () => {
      const today = new Date();
      const todayStr =
        today.getFullYear() +
        '-' +
        String(today.getMonth() + 1).padStart(2, '0') +
        '-' +
        String(today.getDate()).padStart(2, '0');
      expect(isDateToday(todayStr)).toBe(true);
    });

    it('returns false for different date', () => {
      expect(isDateToday('2024-01-01')).toBe(false);
    });

    it('returns false for empty string', () => {
      expect(isDateToday('')).toBe(false);
    });

    it('handles date-time strings correctly', () => {
      const today = new Date().toISOString();
      expect(isDateToday(today)).toBe(true);
    });
  });

  describe('isEventToday', () => {
    const today = new Date();
    const todayStr =
      today.getFullYear() +
      '-' +
      String(today.getMonth() + 1).padStart(2, '0') +
      '-' +
      String(today.getDate()).padStart(2, '0');
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const tomorrowStr =
      tomorrow.getFullYear() +
      '-' +
      String(tomorrow.getMonth() + 1).padStart(2, '0') +
      '-' +
      String(tomorrow.getDate()).padStart(2, '0');

    it('returns true for single-day event happening today', () => {
      expect(isEventToday(todayStr)).toBe(true);
    });

    it('returns false for single-day event not today', () => {
      expect(isEventToday(tomorrowStr)).toBe(false);
    });

    it('returns false for empty start date', () => {
      expect(isEventToday('')).toBe(false);
    });

    it('handles date-time strings correctly', () => {
      const todayDateTime = today.toISOString();
      expect(isEventToday(todayDateTime)).toBe(true);
    });
  });

  describe('isEventWithinDays', () => {
    it('returns true for event within default 30 days', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 10);
      const futureDateStr =
        futureDate.getFullYear() +
        '-' +
        String(futureDate.getMonth() + 1).padStart(2, '0') +
        '-' +
        String(futureDate.getDate()).padStart(2, '0');
      expect(isEventWithinDays(futureDateStr)).toBe(true);
    });

    it('returns false for past events', () => {
      expect(isEventWithinDays('2020-01-01')).toBe(false);
    });

    it('returns false for empty date', () => {
      expect(isEventWithinDays('')).toBe(false);
    });
  });
});

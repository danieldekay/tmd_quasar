/**
 * Date Formatters Unit Tests
 *
 * Tests for date formatting utilities following TDD approach.
 * These tests MUST fail until the implementation is complete.
 *
 * Reference: /specs/004-event-display/contracts/date-formatters.contract.md
 */

import { describe, expect, it } from 'vitest';
import { formatEdition, formatEventDateRange, formatOrdinal } from '../dateFormatters';

describe('formatEventDateRange', () => {
  describe('happy path - valid date ranges', () => {
    it('should format same-month date range correctly', () => {
      expect(formatEventDateRange('2025-09-18', '2025-09-22')).toBe('18-22 Sep 2025');
    });

    it('should format date range across months correctly', () => {
      expect(formatEventDateRange('2025-12-30', '2026-01-02')).toBe('30 Dec 2025 - 2 Jan 2026');
    });

    it('should format single day event correctly', () => {
      expect(formatEventDateRange('2025-09-18', '2025-09-18')).toBe('18 Sep 2025');
    });

    it('should handle dates with time component', () => {
      expect(formatEventDateRange('2025-09-18T00:00:00', '2025-09-22T23:59:59')).toBe(
        '18-22 Sep 2025',
      );
    });

    it('should use abbreviated month names', () => {
      const result = formatEventDateRange('2025-01-15', '2025-01-20');
      expect(result).toMatch(/Jan/);
      expect(result).not.toMatch(/January/);
    });

    it('should not use leading zeros for day numbers', () => {
      const result = formatEventDateRange('2025-01-01', '2025-01-09');
      expect(result).toMatch(/^1-9/); // Starts with 1-9, not 01-09
    });
  });

  describe('error handling', () => {
    it('should throw TypeError for invalid start date', () => {
      expect(() => formatEventDateRange('invalid', '2025-09-22')).toThrow(TypeError);
      expect(() => formatEventDateRange('invalid', '2025-09-22')).toThrow(/invalid date format/i);
    });

    it('should throw TypeError for invalid end date', () => {
      expect(() => formatEventDateRange('2025-09-18', 'invalid')).toThrow(TypeError);
    });

    it('should throw RangeError when end date is before start date', () => {
      expect(() => formatEventDateRange('2025-09-22', '2025-09-18')).toThrow(RangeError);
      expect(() => formatEventDateRange('2025-09-22', '2025-09-18')).toThrow(
        /end date must be after start date/i,
      );
    });
  });
});

describe('formatOrdinal', () => {
  describe('standard ordinal suffixes', () => {
    it('should format 1st correctly', () => {
      expect(formatOrdinal(1)).toBe('1st');
    });

    it('should format 2nd correctly', () => {
      expect(formatOrdinal(2)).toBe('2nd');
    });

    it('should format 3rd correctly', () => {
      expect(formatOrdinal(3)).toBe('3rd');
    });

    it('should format 4th and beyond with "th"', () => {
      expect(formatOrdinal(4)).toBe('4th');
      expect(formatOrdinal(5)).toBe('5th');
      expect(formatOrdinal(10)).toBe('10th');
    });
  });

  describe('special cases (11th, 12th, 13th)', () => {
    it('should format 11th (not 11st)', () => {
      expect(formatOrdinal(11)).toBe('11th');
    });

    it('should format 12th (not 12nd)', () => {
      expect(formatOrdinal(12)).toBe('12th');
    });

    it('should format 13th (not 13rd)', () => {
      expect(formatOrdinal(13)).toBe('13th');
    });

    it('should format 111th correctly', () => {
      expect(formatOrdinal(111)).toBe('111th');
    });
  });

  describe('higher numbers with standard suffixes', () => {
    it('should format 21st correctly', () => {
      expect(formatOrdinal(21)).toBe('21st');
    });

    it('should format 22nd correctly', () => {
      expect(formatOrdinal(22)).toBe('22nd');
    });

    it('should format 23rd correctly', () => {
      expect(formatOrdinal(23)).toBe('23rd');
    });

    it('should format 24th correctly', () => {
      expect(formatOrdinal(24)).toBe('24th');
    });
  });

  describe('error handling', () => {
    it('should throw RangeError for zero', () => {
      expect(() => formatOrdinal(0)).toThrow(RangeError);
      expect(() => formatOrdinal(0)).toThrow(/edition number must be positive/i);
    });

    it('should throw RangeError for negative numbers', () => {
      expect(() => formatOrdinal(-5)).toThrow(RangeError);
    });

    it('should throw TypeError for decimal numbers', () => {
      expect(() => formatOrdinal(1.5)).toThrow(TypeError);
      expect(() => formatOrdinal(1.5)).toThrow(/edition number must be integer/i);
    });
  });
});

describe('formatEdition', () => {
  describe('number input', () => {
    it('should format number edition correctly', () => {
      expect(formatEdition(13)).toBe('13th Edition');
    });

    it('should format 1st edition correctly', () => {
      expect(formatEdition(1)).toBe('1st Edition');
    });

    it('should format 2nd edition correctly', () => {
      expect(formatEdition(2)).toBe('2nd Edition');
    });

    it('should format 3rd edition correctly', () => {
      expect(formatEdition(3)).toBe('3rd Edition');
    });
  });

  describe('string input', () => {
    it('should format string edition correctly', () => {
      expect(formatEdition('13')).toBe('13th Edition');
    });

    it('should format string "1" correctly', () => {
      expect(formatEdition('1')).toBe('1st Edition');
    });
  });

  describe('invalid input handling', () => {
    it('should return null for undefined', () => {
      expect(formatEdition(undefined)).toBeNull();
    });

    it('should return null for invalid string', () => {
      expect(formatEdition('invalid')).toBeNull();
    });

    it('should return null for zero', () => {
      expect(formatEdition(0)).toBeNull();
    });

    it('should return null for negative numbers', () => {
      expect(formatEdition(-5)).toBeNull();
    });

    it('should return null for empty string', () => {
      expect(formatEdition('')).toBeNull();
    });
  });
});

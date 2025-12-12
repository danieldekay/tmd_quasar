/**
 * Date formatting utilities for TMD event display
 * Provides formatted date ranges, ordinal suffixes, and edition numbers
 */

import { format, parseISO } from 'date-fns';

/**
 * Format event date range with smart same-month/year logic
 * Contract output format: "DD-DD MMM YYYY" (e.g., "18-22 Sep 2025")
 * Examples:
 *   - Same month: "18-22 Sep 2025"
 *   - Same day: "18 Sep 2025"
 *   - Different months: "30 Dec 2025 - 2 Jan 2026"
 */
export function formatEventDateRange(startDate: string, endDate?: string | null): string {
  if (!startDate) {
    throw new TypeError('Invalid date format: startDate is required');
  }

  try {
    const start = parseISO(startDate);

    // Validate start date
    if (Number.isNaN(start.getTime())) {
      throw new TypeError('Invalid date format: startDate cannot be parsed');
    }

    // Single day event (no end date or same as start)
    if (!endDate || endDate === startDate) {
      return format(start, 'd MMM yyyy');
    }

    const end = parseISO(endDate);

    // Validate end date
    if (Number.isNaN(end.getTime())) {
      throw new TypeError('Invalid date format: endDate cannot be parsed');
    }

    // Check if end date is before start date
    if (end.getTime() < start.getTime()) {
      throw new RangeError('End date must be after start date');
    }

    // Same day (shouldn't happen but handle it)
    if (start.getTime() === end.getTime()) {
      return format(start, 'd MMM yyyy');
    }

    const startYear = start.getFullYear();
    const endYear = end.getFullYear();
    const startMonth = start.getMonth();
    const endMonth = end.getMonth();

    // Same month and year: "18-22 Sep 2025"
    if (startYear === endYear && startMonth === endMonth) {
      return `${format(start, 'd')}-${format(end, 'd MMM yyyy')}`;
    }

    // Different months (may or may not be same year): "30 Dec 2025 - 2 Jan 2026"
    return `${format(start, 'd MMM yyyy')} - ${format(end, 'd MMM yyyy')}`;
  } catch (error) {
    // Re-throw our own errors
    if (error instanceof TypeError || error instanceof RangeError) {
      throw error;
    }
    // Wrap other errors as TypeError
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new TypeError(`Invalid date format: ${errorMessage}`);
  }
}

/**
 * Add ordinal suffix to number (1st, 2nd, 3rd, 4th, etc.)
 * Contract: Positive integers only, throws for invalid input
 */
export function formatOrdinal(num: number): string {
  // Validate input: must be integer and > 0
  if (!Number.isInteger(num)) {
    throw new TypeError('Edition number must be integer');
  }

  if (num < 1) {
    throw new RangeError('Edition number must be positive');
  }

  // Special cases for 11, 12, 13
  const lastTwoDigits = num % 100;
  if (lastTwoDigits >= 11 && lastTwoDigits <= 13) {
    return `${num}th`;
  }

  // Regular cases based on last digit
  const lastDigit = num % 10;
  switch (lastDigit) {
    case 1:
      return `${num}st`;
    case 2:
      return `${num}nd`;
    case 3:
      return `${num}rd`;
    default:
      return `${num}th`;
  }
}

/**
 * Format edition number with ordinal suffix or null for invalid
 * Contract: Returns "Nth Edition" format or null (no errors thrown)
 * Examples: "13th Edition", "1st Edition", null
 */
export function formatEdition(edition?: number | string | null): string | null {
  // No edition provided
  if (edition === null || edition === undefined) {
    return null;
  }

  // Handle string input (convert to number)
  let editionNum: number;
  if (typeof edition === 'string') {
    editionNum = Number.parseInt(edition, 10);
    if (Number.isNaN(editionNum)) {
      return null;
    }
  } else {
    editionNum = edition;
  }

  // Invalid edition (not a positive integer)
  if (!Number.isInteger(editionNum) || editionNum < 1) {
    return null;
  }

  // Format with ordinal suffix
  return `${formatOrdinal(editionNum)} Edition`;
}

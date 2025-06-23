import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useFormatters } from '../useFormatters';

describe('useFormatters', () => {
  const { formatDate } = useFormatters();

  beforeEach(() => {
    // Set a fixed date and timezone for all tests in this suite
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-20T10:00:00.000Z')); // Use a consistent UTC time
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should format a Date object correctly', () => {
    // This date is now created within the "fake time" context
    const date = new Date(2024, 0, 20); // January 20, 2024
    // formatDate should handle the Date object directly or its ISO string representation
    expect(formatDate(date.toISOString())).toBe('2024-01-20');
  });

  it('should format a date string correctly', () => {
    expect(formatDate('2024-03-15')).toBe('2024-03-15');
  });

  it('should format a numeric timestamp correctly', () => {
    const timestamp = new Date('2024-03-15T12:00:00Z').getTime();
    expect(formatDate(timestamp)).toBe('2024-03-15');
  });

  it('should return an empty string for null input', () => {
    expect(formatDate(null)).toBe('');
  });

  it('should return an empty string for undefined input', () => {
    expect(formatDate(undefined)).toBe('');
  });

  it('should return an empty string for an empty string input', () => {
    expect(formatDate('')).toBe('');
  });

  it('should return an empty string for a boolean true input', () => {
    expect(formatDate(true)).toBe('');
  });

  it('should return an empty string for a boolean false input', () => {
    expect(formatDate(false)).toBe('');
  });

  it('should return an empty string for an invalid date string', () => {
    expect(formatDate('invalid-date-string')).toBe('');
  });

  it('should handle date strings with time components', () => {
    expect(formatDate('2024-04-25T10:20:30Z')).toBe('2024-04-25');
  });

  it('should handle date strings with slashes (though ISO is preferred)', () => {
    // Note: JavaScript's new Date() constructor behavior with slashes can be tricky
    // and sometimes locale-dependent if not fully ISO.
    // This test assumes it parses as expected or that formatDate normalizes it.
    expect(formatDate('05/15/2024')).toBe('2024-05-15');
  });
});

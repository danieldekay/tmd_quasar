import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useFormatters } from '../useFormatters';

describe('useFormatters', () => {
  let mockDate: Date;

  beforeEach(() => {
    // Mock current date to 2024-01-15 12:00:00
    mockDate = new Date('2024-01-15T12:00:00Z');
    vi.useFakeTimers();
    vi.setSystemTime(mockDate);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('formatDateTime', () => {
    it('should return "just now" for very recent dates', () => {
      const { formatDateTime } = useFormatters();
      const recentDate = new Date('2024-01-15T11:59:30Z').toISOString();

      expect(formatDateTime(recentDate)).toBe('just now');
    });

    it('should return minutes ago for recent dates', () => {
      const { formatDateTime } = useFormatters();
      const fiveMinutesAgo = new Date('2024-01-15T11:55:00Z').toISOString();

      expect(formatDateTime(fiveMinutesAgo)).toBe('5 minutes ago');
    });

    it('should return singular minute for 1 minute ago', () => {
      const { formatDateTime } = useFormatters();
      const oneMinuteAgo = new Date('2024-01-15T11:59:00Z').toISOString();

      expect(formatDateTime(oneMinuteAgo)).toBe('1 minute ago');
    });

    it('should return hours ago for dates within 24 hours', () => {
      const { formatDateTime } = useFormatters();
      const twoHoursAgo = new Date('2024-01-15T10:00:00Z').toISOString();

      expect(formatDateTime(twoHoursAgo)).toBe('2 hours ago');
    });

    it('should return days ago for dates within a week', () => {
      const { formatDateTime } = useFormatters();
      const threeDaysAgo = new Date('2024-01-12T12:00:00Z').toISOString();

      expect(formatDateTime(threeDaysAgo)).toBe('3 days ago');
    });

    it('should return formatted date for older dates', () => {
      const { formatDateTime } = useFormatters();
      const oldDate = new Date('2024-01-01T10:30:00Z').toISOString();

      const result = formatDateTime(oldDate);
      expect(result).toMatch(/Jan 1, 2024/);
    });

    it('should handle empty and invalid values', () => {
      const { formatDateTime } = useFormatters();

      expect(formatDateTime('')).toBe('');
      expect(formatDateTime(null)).toBe('');
      expect(formatDateTime(undefined)).toBe('');
      expect(formatDateTime('invalid-date')).toBe('');
    });
  });

  describe('formatDate', () => {
    it('should format valid dates to YYYY-MM-DD', () => {
      const { formatDate } = useFormatters();

      expect(formatDate('2024-01-15T12:00:00Z')).toBe('2024-01-15');
      expect(formatDate('2024-12-25')).toBe('2024-12-25');
    });

    it('should handle invalid values', () => {
      const { formatDate } = useFormatters();

      expect(formatDate('')).toBe('');
      expect(formatDate(null)).toBe('');
      expect(formatDate(undefined)).toBe('');
      expect(formatDate('invalid-date')).toBe('');
    });
  });
});

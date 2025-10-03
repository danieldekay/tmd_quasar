import { describe, expect, it } from 'vitest';
import { useFormatters } from '../useFormatters';

// Mock DOM environment
Object.defineProperty(global, 'document', {
  value: {
    createElement: () => {
      const element = {
        textContent: '',
        innerText: '',
      };

      Object.defineProperty(element, 'innerHTML', {
        set(value: string) {
          // Simple HTML entity decoding for test environment
          this.textContent = value
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
            .replace(/&nbsp;/g, ' ');
          this.innerText = this.textContent;
        },
      });

      return element;
    },
  },
  writable: true,
});

describe('useFormatters - HTML Entity Decoding', () => {
  const { formatText, decodeHtmlEntities } = useFormatters();

  describe('decodeHtmlEntities', () => {
    it('should decode common HTML entities', () => {
      expect(decodeHtmlEntities('AT&amp;T')).toBe('AT&T');
      expect(decodeHtmlEntities('&lt;script&gt;')).toBe('<script>');
      expect(decodeHtmlEntities('&quot;Hello World&quot;')).toBe('"Hello World"');
      expect(decodeHtmlEntities('Don&#39;t')).toBe("Don't");
      expect(decodeHtmlEntities('A&nbsp;B')).toBe('A B');
    });

    it('should handle null and undefined values', () => {
      expect(decodeHtmlEntities(null)).toBe('');
      expect(decodeHtmlEntities(undefined)).toBe('');
      expect(decodeHtmlEntities('')).toBe('');
    });

    it('should handle text without entities', () => {
      expect(decodeHtmlEntities('Regular text')).toBe('Regular text');
      expect(decodeHtmlEntities('No entities here!')).toBe('No entities here!');
    });
  });

  describe('formatText', () => {
    it('should format text by decoding HTML entities', () => {
      expect(formatText('Company &amp; Associates')).toBe('Company & Associates');
      expect(formatText('&lt;Event Name&gt;')).toBe('<Event Name>');
      expect(formatText('&quot;La Cumparsita&quot; Festival')).toBe('"La Cumparsita" Festival');
    });

    it('should handle null and undefined values', () => {
      expect(formatText(null)).toBe('');
      expect(formatText(undefined)).toBe('');
      expect(formatText('')).toBe('');
    });
  });
});

describe('useFormatters - ISO Date Formatting', () => {
  const { formatDate, formatDateISO } = useFormatters();

  describe('formatDateISO', () => {
    it('should format ISO date string as YYYY-MM-DD', () => {
      expect(formatDateISO('2025-10-02')).toBe('2025-10-02');
      expect(formatDateISO('2024-01-15')).toBe('2024-01-15');
    });

    it('should format MM/DD/YYYY to YYYY-MM-DD', () => {
      expect(formatDateISO('10/02/2025')).toBe('2025-10-02');
      expect(formatDateISO('01/15/2024')).toBe('2024-01-15');
    });

    it('should handle ISO datetime strings by extracting date', () => {
      expect(formatDateISO('2025-10-02T14:30:00')).toBe('2025-10-02');
      expect(formatDateISO('2024-12-25T00:00:00Z')).toBe('2024-12-25');
    });

    it('should return empty string for null', () => {
      expect(formatDateISO(null)).toBe('');
    });

    it('should return empty string for undefined', () => {
      expect(formatDateISO(undefined)).toBe('');
    });

    it('should return empty string for empty string', () => {
      expect(formatDateISO('')).toBe('');
    });

    it('should return empty string for invalid date strings', () => {
      expect(formatDateISO('invalid')).toBe('');
      expect(formatDateISO('not-a-date')).toBe('');
      expect(formatDateISO('2025-13-45')).toBe(''); // Invalid month/day
    });

    it('should handle numeric timestamps', () => {
      const timestamp = Date.UTC(2025, 9, 2); // October 2, 2025 in UTC
      expect(formatDateISO(timestamp)).toBe('2025-10-02');
    });
  });

  describe('formatDate (alias check)', () => {
    it('should work identically to formatDateISO', () => {
      expect(formatDate('2025-10-02')).toBe(formatDateISO('2025-10-02'));
      expect(formatDate('10/02/2025')).toBe(formatDateISO('10/02/2025'));
      expect(formatDate(null)).toBe(formatDateISO(null));
    });
  });
});

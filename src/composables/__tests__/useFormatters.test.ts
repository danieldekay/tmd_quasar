import { describe, it, expect } from 'vitest';
import { useFormatters } from '../useFormatters';

// Mock DOM environment
Object.defineProperty(global, 'document', {
  value: {
    createElement: () => ({
      innerHTML: '',
      textContent: '',
      innerText: '',
      set innerHTML(value: string) {
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
    }),
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

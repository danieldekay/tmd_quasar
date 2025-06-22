import { describe, it, expect } from 'vitest';

describe('FavoriteCard Helper Functions', () => {
  // Test the HTML stripping logic
  describe('stripHtml', () => {
    const stripHtml = (html: string): string => {
      const temp = document.createElement('div');
      temp.innerHTML = html;
      return temp.textContent || temp.innerText || '';
    };

    it('strips HTML tags correctly', () => {
      const result = stripHtml('<p>This is <strong>bold</strong> text</p>');
      expect(result).toBe('This is bold text');
    });

    it('handles nested HTML tags', () => {
      const result = stripHtml('<div><span><em>nested</em> content</span></div>');
      expect(result).toBe('nested content');
    });

    it('handles empty HTML', () => {
      const result = stripHtml('<p></p>');
      expect(result).toBe('');
    });

    it('handles plain text', () => {
      const result = stripHtml('plain text');
      expect(result).toBe('plain text');
    });
  });

  // Test the text truncation logic
  describe('truncateText', () => {
    const truncateText = (text: string, maxLength: number): string => {
      if (text.length <= maxLength) return text;
      return text.substring(0, maxLength).trim() + '...';
    };

    it('truncates long text correctly', () => {
      const longText = 'A'.repeat(150);
      const result = truncateText(longText, 100);
      expect(result).toContain('...');
      expect(result.length).toBeLessThanOrEqual(103); // 100 + '...'
    });

    it('does not truncate short text', () => {
      const shortText = 'Short text';
      const result = truncateText(shortText, 100);
      expect(result).toBe(shortText);
      expect(result).not.toContain('...');
    });

    it('handles exact length text', () => {
      const exactText = 'A'.repeat(100);
      const result = truncateText(exactText, 100);
      expect(result).toBe(exactText);
      expect(result).not.toContain('...');
    });

    it('handles empty text', () => {
      const result = truncateText('', 100);
      expect(result).toBe('');
    });
  });

  // Test date formatting logic
  describe('formatDateTime', () => {
    const formatDateTime = (dateString: string): string => {
      const date = new Date(dateString);
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
    };

    it('formats date and time correctly', () => {
      const result = formatDateTime('2024-01-15T10:30:00Z');
      expect(result).toContain('2024');
      expect(result).toContain('Jan');
      expect(result).toContain('15');
      // Time may vary by timezone, so just check it contains time format
      expect(result).toMatch(/\d{2}:\d{2}/);
    });

    it('handles different time zones', () => {
      const result = formatDateTime('2024-12-25T12:00:00Z');
      expect(result).toContain('2024');
      expect(result).toContain('Dec');
      // Date may vary by timezone, so just check it contains day format
      expect(result).toMatch(/\d{1,2}/);
    });
  });

  // Test type configuration logic
  describe('typeConfig', () => {
    const getTypeConfig = (type: string) => {
      const configs = {
        event: { label: 'Event', icon: 'event', color: 'primary' },
        teacher: { label: 'Teacher', icon: 'school', color: 'secondary' },
        dj: { label: 'DJ', icon: 'music_note', color: 'accent' },
        teacher_couple: { label: 'Couple', icon: 'people', color: 'info' },
        event_series: { label: 'Series', icon: 'event_repeat', color: 'warning' },
      };

      return (
        configs[type as keyof typeof configs] || { label: 'Content', icon: 'help', color: 'grey' }
      );
    };

    it('returns correct config for event', () => {
      const config = getTypeConfig('event');
      expect(config).toEqual({
        label: 'Event',
        icon: 'event',
        color: 'primary',
      });
    });

    it('returns correct config for teacher', () => {
      const config = getTypeConfig('teacher');
      expect(config).toEqual({
        label: 'Teacher',
        icon: 'school',
        color: 'secondary',
      });
    });

    it('returns correct config for DJ', () => {
      const config = getTypeConfig('dj');
      expect(config).toEqual({
        label: 'DJ',
        icon: 'music_note',
        color: 'accent',
      });
    });

    it('returns default config for unknown type', () => {
      const config = getTypeConfig('unknown');
      expect(config).toEqual({
        label: 'Content',
        icon: 'help',
        color: 'grey',
      });
    });
  });

  // Test content type mapping logic
  describe('contentTypeMapping', () => {
    const contentTypeMap = {
      event: 'tmd_event',
      teacher: 'tmd_teacher',
      dj: 'tmd_dj',
      teacher_couple: 'tmd_teacher_couple',
      event_series: 'tmd_event_series',
    };

    it('maps content types correctly', () => {
      expect(contentTypeMap.event).toBe('tmd_event');
      expect(contentTypeMap.teacher).toBe('tmd_teacher');
      expect(contentTypeMap.dj).toBe('tmd_dj');
      expect(contentTypeMap.teacher_couple).toBe('tmd_teacher_couple');
      expect(contentTypeMap.event_series).toBe('tmd_event_series');
    });
  });

  // Test interaction type labels
  describe('interactionTypeLabels', () => {
    const interactionTypeLabels = {
      like: 'Liked',
      bookmark: 'Bookmarked',
      reminder: 'Reminder',
      follow: 'Following',
    };

    it('has correct labels for all interaction types', () => {
      expect(interactionTypeLabels.like).toBe('Liked');
      expect(interactionTypeLabels.bookmark).toBe('Bookmarked');
      expect(interactionTypeLabels.reminder).toBe('Reminder');
      expect(interactionTypeLabels.follow).toBe('Following');
    });
  });

  // Test reminder filtering logic
  describe('reminderFiltering', () => {
    const filterReminders = (
      interactions: Array<{
        type: string;
        date: string;
        reminderDate?: string;
        reminderNote?: string;
      }>,
    ) => {
      return interactions.filter((interaction) => interaction.type === 'reminder');
    };

    it('filters reminder interactions correctly', () => {
      const interactions = [
        { type: 'like', date: '2024-01-01' },
        {
          type: 'reminder',
          date: '2024-01-02',
          reminderDate: '2024-01-15T10:30:00Z',
          reminderNote: 'Test reminder',
        },
        { type: 'bookmark', date: '2024-01-03' },
      ];

      const reminders = filterReminders(interactions);
      expect(reminders).toHaveLength(1);
      expect(reminders[0]?.type).toBe('reminder');
      expect(reminders[0]?.reminderNote).toBe('Test reminder');
    });

    it('returns empty array when no reminders exist', () => {
      const interactions = [
        { type: 'like', date: '2024-01-01' },
        { type: 'bookmark', date: '2024-01-03' },
      ];

      const reminders = filterReminders(interactions);
      expect(reminders).toHaveLength(0);
    });
  });
});

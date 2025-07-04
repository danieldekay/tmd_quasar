import { describe, it, expect, beforeEach } from 'vitest';
import { useEventCalendar } from '../useEventCalendar';
import type { EventListItem } from '../../services/types';

// Mock useFormatters
vi.mock('../useFormatters', () => ({
  useFormatters: () => ({
    formatDate: (date: string) => date.split('T')[0] || '',
  }),
}));

// Sample event data with future dates
const mockEvents: EventListItem[] = [
  {
    id: 1,
    title: 'Test Marathon',
    date: '2025-08-15T00:00:00Z',
    link: '/events/1',
    start_date: '2025-08-15',
    end_date: '2025-08-17',
    registration_start_date: '2025-07-01',
    edition: '2025',
    city: 'Buenos Aires',
    country: 'AR',
    taxonomies: {
      'event-categories-2020': [
        { id: 1, name: 'Marathon', slug: 'marathon', description: 'Marathon events' },
      ],
    },
  },
  {
    id: 2,
    title: 'Test Festival',
    date: '2025-09-20T00:00:00Z',
    link: '/events/2',
    start_date: '2025-09-20',
    end_date: '2025-09-22',
    registration_start_date: '2025-08-01',
    edition: '2025',
    city: 'Paris',
    country: 'FR',
    taxonomies: {
      'event-categories-2020': [
        { id: 2, name: 'Festival', slug: 'festival', description: 'Festival events' },
      ],
    },
  },
];

describe('useEventCalendar', () => {
  let calendar: ReturnType<typeof useEventCalendar>;

  beforeEach(() => {
    calendar = useEventCalendar();
  });

  it('initializes with default values', () => {
    expect(calendar.currentView.value).toBe('month');
    expect(calendar.viewModes).toHaveLength(2);
    expect(calendar.viewModes[0]?.mode).toBe('month');
    expect(calendar.viewModes[1]?.mode).toBe('year');
  });

  it('converts events to calendar format correctly', () => {
    const calendarEvents = calendar.convertEventsForCalendar(mockEvents);

    expect(calendarEvents).toHaveLength(2);
    expect(calendarEvents[0]).toMatchObject({
      id: 1,
      title: 'Test Marathon',
      start: '2025-08-15',
      end: '2025-08-17',
      allDay: true,
      city: 'Buenos Aires',
      country: 'AR',
      category: 'Marathon',
    });
  });

  it('filters events by date correctly', () => {
    const calendarEvents = calendar.convertEventsForCalendar(mockEvents);
    const eventsForDate = calendar.getEventsForDate(calendarEvents, '2025-08-15');

    expect(eventsForDate).toHaveLength(1);
    expect(eventsForDate[0]?.title).toBe('Test Marathon');

    const noEventsDate = calendar.getEventsForDate(calendarEvents, '2025-10-15');
    expect(noEventsDate).toHaveLength(0);
  });

  it('calculates event counts by month correctly', () => {
    const calendarEvents = calendar.convertEventsForCalendar(mockEvents);
    const eventCounts = calendar.getEventCountsByMonth(calendarEvents, 2025);

    expect(eventCounts['2025-08']).toBe(1);
    expect(eventCounts['2025-09']).toBe(1);
    expect(eventCounts['2025-10']).toBeUndefined();
  });

  it('changes view mode correctly', () => {
    expect(calendar.currentView.value).toBe('month');

    calendar.setView('year');
    expect(calendar.currentView.value).toBe('year');

    calendar.setView('month');
    expect(calendar.currentView.value).toBe('month');
  });

  it('sets date correctly', () => {
    calendar.setDate('2025-06-15');
    expect(calendar.currentDate.value).toBe('2025-06-15');
  });

  it('navigates to today correctly', () => {
    const today = new Date().toISOString().split('T')[0];
    calendar.goToToday();
    expect(calendar.currentDate.value).toBe(today);
  });

  it('generates correct view info for month view', () => {
    calendar.setDate('2025-06-15');
    calendar.setView('month');

    const viewInfo = calendar.currentViewInfo.value;
    expect(viewInfo.title).toBe('June 2025');
    expect(viewInfo.subtitle).toBe('2025');
  });

  it('generates correct view info for year view', () => {
    calendar.setDate('2025-06-15');
    calendar.setView('year');

    const viewInfo = calendar.currentViewInfo.value;
    expect(viewInfo.title).toBe('2025');
    expect(viewInfo.subtitle).toBe('Year View');
  });

  it('handles navigation in month view', () => {
    calendar.setDate('2025-06-15');
    calendar.setView('month');

    // Navigate to next month
    calendar.navigateDate('next');
    const nextDate = new Date(calendar.currentDate.value || new Date());
    expect(nextDate.getMonth()).toBe(6); // July (0-indexed)

    // Navigate to previous month (back to June)
    calendar.navigateDate('prev');
    const prevDate = new Date(calendar.currentDate.value || new Date());
    expect(prevDate.getMonth()).toBe(5); // June (0-indexed)
  });

  it('handles navigation in year view', () => {
    calendar.setDate('2025-06-15');
    calendar.setView('year');

    // Navigate to next year
    calendar.navigateDate('next');
    const nextDate = new Date(calendar.currentDate.value || new Date());
    expect(nextDate.getFullYear()).toBe(2026);

    // Navigate to previous year
    calendar.navigateDate('prev');
    const prevDate = new Date(calendar.currentDate.value || new Date());
    expect(prevDate.getFullYear()).toBe(2025);
  });

  it('handles multi-day events correctly', () => {
    const calendarEvents = calendar.convertEventsForCalendar(mockEvents);

    // Test marathon runs from 2025-08-15 to 2025-08-17
    const eventsOn15th = calendar.getEventsForDate(calendarEvents, '2025-08-15');
    const eventsOn16th = calendar.getEventsForDate(calendarEvents, '2025-08-16');
    const eventsOn17th = calendar.getEventsForDate(calendarEvents, '2025-08-17');
    const eventsOn18th = calendar.getEventsForDate(calendarEvents, '2025-08-18');

    expect(eventsOn15th).toHaveLength(1);
    expect(eventsOn16th).toHaveLength(1);
    expect(eventsOn17th).toHaveLength(1);
    expect(eventsOn18th).toHaveLength(0);
  });

  it('handles events without valid dates', () => {
    const invalidEvents: EventListItem[] = [
      {
        ...mockEvents[0],
        id: 1,
        title: 'Test Event',
        date: '2025-08-15T00:00:00Z',
        link: '/events/1',
        start_date: '',
        end_date: '',
        registration_start_date: '2025-07-01',
        edition: '2025',
        city: 'Buenos Aires',
        country: 'AR',
      },
    ];

    const calendarEvents = calendar.convertEventsForCalendar(invalidEvents);
    expect(calendarEvents).toHaveLength(0); // Should filter out invalid events
  });

  it('handles events without categories', () => {
    const eventsWithoutCategory: EventListItem[] = [
      {
        ...mockEvents[0],
        id: 1,
        title: 'Test Event',
        date: '2024-01-15T00:00:00Z',
        link: '/events/1',
        start_date: '2024-01-15',
        end_date: '2024-01-17',
        registration_start_date: '2023-12-01',
        edition: '2024',
        city: 'Buenos Aires',
        country: 'AR',
        taxonomies: {},
      },
    ];

    const calendarEvents = calendar.convertEventsForCalendar(eventsWithoutCategory);
    expect(calendarEvents[0]?.category).toBe('');
  });
});

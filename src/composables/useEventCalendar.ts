import { computed, ref } from 'vue';
import type { EventListItem } from '../services/types';
import { useFormatters } from './useFormatters';

// Helper function to extract rendered title from V4 API responses
const getRenderedTitle = (title: string | { rendered: string } | undefined): string => {
  if (typeof title === 'string') {
    return title;
  }
  if (title && typeof title === 'object' && 'rendered' in title) {
    return title.rendered;
  }
  return '';
};

export type CalendarEvent = {
  id: number;
  title: string;
  start: string;
  end: string;
  allDay: boolean;
  city?: string;
  country?: string;
  category?: string;
};

export interface CalendarViewMode {
  mode: 'month' | 'year';
  label: string;
  icon: string;
}

export const useEventCalendar = () => {
  const { formatDate } = useFormatters();

  const currentDate = ref(new Date().toISOString().split('T')[0]);
  const currentView = ref<'month' | 'year'>('month');

  const viewModes: CalendarViewMode[] = [
    { mode: 'month', label: 'Month', icon: 'view_module' },
    { mode: 'year', label: 'Year', icon: 'view_comfy' },
  ];

  // Convert events to calendar format, only future events
  const convertEventsForCalendar = (events: EventListItem[]): CalendarEvent[] => {
    const today = new Date().toISOString().split('T')[0] || '';
    return events
      .map((event) => {
        const start = String(formatDate(event.start_date) ?? '');
        let end = String(formatDate(event.end_date) ?? '');
        if (!end) end = start;
        return {
          id: event.id,
          title: getRenderedTitle(event.title),
          start,
          end,
          allDay: true,
          city: event.city ?? '',
          country: event.country ?? '',
          category: String(event.taxonomies?.['event-categories-2020']?.[0]?.name || ''),
        };
      })
      .filter((event) => event.end && event.end >= today); // Only future events
  };

  // Get events for a specific date
  const getEventsForDate = (events: CalendarEvent[], date: string): CalendarEvent[] => {
    return events.filter((event) => {
      if (!event.start || !event.end) return false;
      const eventStart = new Date(event.start);
      const eventEnd = new Date(event.end);
      const checkDate = new Date(date);
      return checkDate >= eventStart && checkDate <= eventEnd;
    });
  };

  // Get event counts by month for year view heatmap
  const getEventCountsByMonth = (events: CalendarEvent[], year: number) => {
    const counts: Record<string, number> = {};
    events.forEach((event) => {
      if (!event.start) return;
      const eventDate = new Date(event.start);
      if (eventDate.getFullYear() === year) {
        const monthKey = `${year}-${String(eventDate.getMonth() + 1).padStart(2, '0')}`;
        counts[monthKey] = (counts[monthKey] || 0) + 1;
      }
    });
    return counts;
  };

  // Navigation functions
  const navigateDate = (direction: 'prev' | 'next') => {
    const date = new Date(currentDate.value || new Date());
    switch (currentView.value) {
      case 'month': {
        date.setMonth(date.getMonth() + (direction === 'next' ? 1 : -1));
        break;
      }
      case 'year': {
        date.setFullYear(date.getFullYear() + (direction === 'next' ? 1 : -1));
        break;
      }
    }
    const dateString = date.toISOString().split('T')[0];
    if (dateString) {
      currentDate.value = dateString;
    }
  };

  const goToToday = () => {
    const dateString = new Date().toISOString().split('T')[0];
    if (dateString) {
      currentDate.value = dateString;
    }
  };

  const setDate = (date: string) => {
    currentDate.value = date;
  };

  const setView = (view: 'month' | 'year') => {
    currentView.value = view;
  };

  // Computed properties for current view info
  const currentViewInfo = computed(() => {
    const date = new Date(currentDate.value || new Date());
    switch (currentView.value) {
      case 'month':
        return {
          title: date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
          subtitle: `${date.getFullYear()}`,
        };
      case 'year':
        return {
          title: `${date.getFullYear()}`,
          subtitle: 'Year View',
        };
      default:
        return { title: '', subtitle: '' };
    }
  });

  return {
    currentDate,
    currentView,
    viewModes,
    currentViewInfo,
    convertEventsForCalendar,
    getEventsForDate,
    getEventCountsByMonth,
    navigateDate,
    goToToday,
    setDate,
    setView,
  };
};

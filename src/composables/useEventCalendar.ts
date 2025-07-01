import { computed, ref } from 'vue';
import type { EventListItem } from '../services/types';
import { useFormatters } from './useFormatters';

export interface CalendarEvent {
  id: number;
  title: string;
  date: string;
  startDate: string;
  endDate: string;
  city?: string | undefined;
  country?: string | undefined;
  category?: string | undefined;
}

export interface CalendarViewMode {
  mode: 'month' | 'week' | 'year';
  label: string;
  icon: string;
}

export const useEventCalendar = () => {
  const { formatDate } = useFormatters();
  
  const currentDate = ref(new Date().toISOString().split('T')[0]);
  const currentView = ref<'month' | 'week' | 'year'>('month');
  
  const viewModes: CalendarViewMode[] = [
    { mode: 'month', label: 'Month', icon: 'view_module' },
    { mode: 'week', label: 'Week', icon: 'view_week' },
    { mode: 'year', label: 'Year', icon: 'view_comfy' }
  ];
  
  // Convert events to calendar format
  const convertEventsForCalendar = (events: EventListItem[]): CalendarEvent[] => {
    return events.map(event => ({
      id: event.id,
      title: event.title,
      date: formatDate(event.start_date),
      startDate: formatDate(event.start_date),
      endDate: formatDate(event.end_date),
      city: event.city,
      country: event.country,
      category: event.taxonomies?.['event-categories-2020']?.[0]?.name
    })).filter(event => event.date); // Filter out events without valid dates
  };
  
  // Get events for a specific date
  const getEventsForDate = (events: CalendarEvent[], date: string): CalendarEvent[] => {
    return events.filter(event => {
      if (!event.startDate || !event.endDate) return false;
      
      const eventStart = new Date(event.startDate);
      const eventEnd = new Date(event.endDate);
      const checkDate = new Date(date);
      
      return checkDate >= eventStart && checkDate <= eventEnd;
    });
  };
  
  // Get event counts by month for year view heatmap
  const getEventCountsByMonth = (events: CalendarEvent[], year: number) => {
    const counts: Record<string, number> = {};
    
    events.forEach(event => {
      if (!event.startDate) return;
      
      const eventDate = new Date(event.startDate);
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
      case 'week': {
        date.setDate(date.getDate() + (direction === 'next' ? 7 : -7));
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
  
  const setView = (view: 'month' | 'week' | 'year') => {
    currentView.value = view;
  };
  
  // Computed properties for current view info
  const currentViewInfo = computed(() => {
    const date = new Date(currentDate.value || new Date());
    
    switch (currentView.value) {
      case 'month':
        return {
          title: date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
          subtitle: `${date.getFullYear()}`
        };
      case 'week': {
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        
        return {
          title: `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
          subtitle: `${date.getFullYear()}`
        };
      }
      case 'year':
        return {
          title: `${date.getFullYear()}`,
          subtitle: 'Year View'
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
    setView
  };
};
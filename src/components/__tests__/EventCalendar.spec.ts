import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { ref } from 'vue';
import { Quasar } from 'quasar';
import EventCalendar from '../../components/EventCalendar.vue';
import type { EventListItem } from '../../services/types';

// Mock the QCalendar components
vi.mock('@quasar/quasar-ui-qcalendar', () => ({
  QCalendarMonth: {
    name: 'QCalendarMonth',
    template: '<div data-testid="month-calendar"><slot name="event"></slot></div>',
    props: ['modelValue', 'events', 'bordered', 'dark', 'animated'],
    emits: ['click-date', 'click-event']
  },
  QCalendarDay: {
    name: 'QCalendarDay', 
    template: '<div data-testid="week-calendar"><slot name="event"></slot></div>',
    props: ['modelValue', 'view', 'events', 'bordered', 'dark', 'animated'],
    emits: ['click-date', 'click-event']
  }
}));

// Mock useFormatters
vi.mock('../../composables/useFormatters', () => ({
  useFormatters: () => ({
    getCategoryColor: (category: string) => ({ color: 'primary', textColor: 'white' })
  })
}));

// Sample event data
const mockEvents: EventListItem[] = [
  {
    id: 1,
    title: 'Test Marathon',
    date: '2024-01-15T00:00:00Z',
    link: '/events/1',
    start_date: '2024-01-15',
    end_date: '2024-01-17',
    registration_start_date: '2023-12-01',
    edition: '2024',
    city: 'Buenos Aires',
    country: 'AR',
    taxonomies: {
      'event-categories-2020': [
        { id: 1, name: 'Marathon', slug: 'marathon', description: 'Marathon events' }
      ]
    }
  },
  {
    id: 2,
    title: 'Test Festival',
    date: '2024-02-20T00:00:00Z',
    link: '/events/2',
    start_date: '2024-02-20',
    end_date: '2024-02-22',
    registration_start_date: '2024-01-01',
    edition: '2024',
    city: 'Paris',
    country: 'FR',
    taxonomies: {
      'event-categories-2020': [
        { id: 2, name: 'Festival', slug: 'festival', description: 'Festival events' }
      ]
    }
  }
];

describe('EventCalendar', () => {
  let wrapper: any;

  beforeEach(() => {
    wrapper = mount(EventCalendar, {
      global: {
        plugins: [Quasar],
        stubs: {
          QCard: true,
          QCardSection: true,
          QBtn: true,
          QBtnToggle: true,
          QSpace: true,
          QIcon: true,
          QBadge: true,
          QDialog: true
        }
      },
      props: {
        events: mockEvents
      }
    });
  });

  it('renders the calendar component', () => {
    expect(wrapper.exists()).toBe(true);
  });

  it('displays the calendar header with navigation controls', () => {
    const header = wrapper.find('.calendar-header');
    expect(header.exists()).toBe(true);
  });

  it('shows month view by default', () => {
    const monthCalendar = wrapper.find('[data-testid="month-calendar"]');
    expect(monthCalendar.exists()).toBe(true);
  });

  it('converts events to calendar format', () => {
    const calendarEvents = wrapper.vm.calendarEvents;
    expect(calendarEvents).toHaveLength(2);
    expect(calendarEvents[0]).toMatchObject({
      id: 1,
      title: 'Test Marathon',
      date: '2024-01-15',
      startDate: '2024-01-15',
      endDate: '2024-01-17',
      city: 'Buenos Aires',
      country: 'AR',
      category: 'Marathon'
    });
  });

  it('switches to week view when view mode changes', async () => {
    // Change to week view
    wrapper.vm.setView('week');
    await wrapper.vm.$nextTick();
    
    const weekCalendar = wrapper.find('[data-testid="week-calendar"]');
    expect(weekCalendar.exists()).toBe(true);
  });

  it('shows year view with heatmap', async () => {
    // Change to year view
    wrapper.vm.setView('year');
    await wrapper.vm.$nextTick();
    
    const yearView = wrapper.find('.year-view');
    expect(yearView.exists()).toBe(true);
    
    const monthTiles = wrapper.findAll('.month-tile');
    expect(monthTiles).toHaveLength(12);
  });

  it('emits date-selected when a date is clicked', async () => {
    const timestamp = { date: '2024-01-15' };
    wrapper.vm.onDateClick(timestamp);
    
    expect(wrapper.emitted('date-selected')).toBeTruthy();
    expect(wrapper.emitted('date-selected')[0]).toEqual(['2024-01-15']);
  });

  it('emits event-selected when an event is clicked', async () => {
    const event = {
      id: 1,
      title: 'Test Event',
      date: '2024-01-15'
    };
    
    wrapper.vm.onEventClick(event);
    
    expect(wrapper.emitted('event-selected')).toBeTruthy();
    expect(wrapper.emitted('event-selected')[0]).toEqual([event]);
  });

  it('calculates event counts for year view correctly', () => {
    wrapper.vm.setView('year');
    const eventCounts = wrapper.vm.eventCountsByMonth;
    
    // Should have events in January and February
    expect(eventCounts['2024-01']).toBe(1);
    expect(eventCounts['2024-02']).toBe(1);
  });

  it('navigates dates correctly', () => {
    const initialDate = wrapper.vm.currentDate;
    
    // Navigate to next month
    wrapper.vm.navigateDate('next');
    expect(wrapper.vm.currentDate).not.toBe(initialDate);
    
    // Navigate to previous month
    wrapper.vm.navigateDate('prev');
    expect(wrapper.vm.currentDate).toBe(initialDate);
  });

  it('goes to today when goToToday is called', () => {
    const today = new Date().toISOString().split('T')[0];
    wrapper.vm.goToToday();
    expect(wrapper.vm.currentDate).toBe(today);
  });

  it('filters events by date correctly', () => {
    const eventsForDate = wrapper.vm.getEventsForDate(wrapper.vm.calendarEvents, '2024-01-15');
    expect(eventsForDate).toHaveLength(1);
    expect(eventsForDate[0].title).toBe('Test Marathon');
  });

  it('shows selected date events dialog', async () => {
    const timestamp = { date: '2024-01-15' };
    wrapper.vm.onDateClick(timestamp);
    
    await wrapper.vm.$nextTick();
    
    expect(wrapper.vm.showDateEventsDialog).toBe(true);
    expect(wrapper.vm.selectedDateEvents).toHaveLength(1);
  });
});
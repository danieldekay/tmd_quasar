<template>
  <q-page class="q-pa-md">
    <div class="text-h4 q-mb-lg">Calendar Test Page</div>

    <div class="q-mb-md">
      <q-card flat bordered>
        <q-card-section>
          <div class="text-h6">Test Events (Future Dates)</div>
          <div class="text-caption q-mt-sm">
            Showing {{ testEvents.length }} events with future dates
          </div>
        </q-card-section>
      </q-card>
    </div>

    <EventCalendar
      :events="testEvents"
      @date-selected="onDateSelected"
      @event-selected="onEventSelected"
    />
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import EventCalendar from '../components/EventCalendar.vue';
import type { EventListItem } from '../services/types';
import type { CalendarEvent } from '../composables/useEventCalendar';

// Test events with future dates
const testEvents = ref<EventListItem[]>([
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
  {
    id: 3,
    title: 'Test Encuentro',
    date: '2025-10-10T00:00:00Z',
    link: '/events/3',
    start_date: '2025-10-10',
    end_date: '2025-10-12',
    registration_start_date: '2025-09-01',
    edition: '2025',
    city: 'Berlin',
    country: 'DE',
    taxonomies: {
      'event-categories-2020': [
        { id: 3, name: 'Encuentro', slug: 'encuentro', description: 'Encuentro events' },
      ],
    },
  },
]);

const onDateSelected = (date: string) => {
  console.log('Date selected:', date);
};

const onEventSelected = (event: CalendarEvent) => {
  console.log('Event selected:', event);
};
</script>

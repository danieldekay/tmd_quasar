<template>
  <div class="event-calendar">
    <!-- Calendar Header -->
    <div class="calendar-header q-pa-md">
      <div class="row items-center justify-between">
        <div class="col-auto">
          <div class="row items-center q-gutter-sm">
            <q-btn
              round
              dense
              flat
              icon="chevron_left"
              @click="navigateDate('prev')"
              :title="`Previous ${currentView}`"
            />
            <q-btn
              round
              dense
              flat
              icon="chevron_right"
              @click="navigateDate('next')"
              :title="`Next ${currentView}`"
            />
            <q-btn
              flat
              dense
              label="Today"
              @click="goToToday"
              class="q-ml-sm"
            />
          </div>
        </div>
        
        <div class="col text-center">
          <div class="text-h6 text-weight-bold">{{ currentViewInfo.title }}</div>
          <div class="text-caption text-grey-6">{{ currentViewInfo.subtitle }}</div>
        </div>
        
        <div class="col-auto">
          <q-btn-toggle
            v-model="currentView"
            :options="viewModes.map(vm => ({ label: vm.label, value: vm.mode, icon: vm.icon }))"
            dense
            flat
            toggle-color="primary"
            @update:model-value="setView"
          />
        </div>
      </div>
    </div>

    <!-- Calendar Content -->
    <div class="calendar-content">
      <!-- Month View -->
      <div v-if="currentView === 'month'" class="month-view">
        <q-calendar-month
          v-model="currentDate"
          :events="calendarEvents"
          bordered
          :dark="$q.dark.isActive"
          @click-date="onDateClick"
          @click-event="onEventClick"
          animated
        >
          <template #event="{ event }">
            <div class="calendar-event-item">
              <q-badge :color="getEventColor(event)" class="full-width text-left">
                <div class="calendar-event-content">
                  <div class="event-title text-caption">{{ event.title }}</div>
                  <div v-if="event.city" class="event-location text-caption">
                    {{ event.city }}
                  </div>
                </div>
              </q-badge>
            </div>
          </template>
        </q-calendar-month>
      </div>

      <!-- Week View -->
      <div v-else-if="currentView === 'week'" class="week-view">
        <q-calendar-day
          v-model="currentDate"
          view="week"
          :events="calendarEvents"
          bordered
          :dark="$q.dark.isActive"
          @click-date="onDateClick"
          @click-event="onEventClick"
          animated
        >
          <template #event="{ event }">
            <div class="calendar-event-item">
              <q-badge :color="getEventColor(event)" class="full-width text-left">
                <div class="calendar-event-content">
                  <div class="event-title text-caption">{{ event.title }}</div>
                  <div v-if="event.city" class="event-location text-caption">
                    {{ event.city }}
                  </div>
                </div>
              </q-badge>
            </div>
          </template>
        </q-calendar-day>
      </div>

      <!-- Year View with Heatmap -->
      <div v-else-if="currentView === 'year'" class="year-view">
        <div class="year-heatmap q-pa-md">
          <div class="text-h6 q-mb-md text-center">Event Distribution for {{ new Date(currentDate || new Date()).getFullYear() }}</div>
          
          <div class="row q-gutter-sm justify-center">
            <div
              v-for="month in 12"
              :key="month"
              class="col-2 month-tile"
              :class="{ 'has-events': getMonthEventCount(month) > 0 }"
              @click="navigateToMonth(month)"
            >
              <q-card
                flat
                bordered
                class="month-card cursor-pointer"
                :style="getMonthHeatmapStyle(month)"
              >
                <q-card-section class="text-center q-pa-sm">
                  <div class="text-subtitle2">{{ getMonthName(month) }}</div>
                  <div class="text-caption text-weight-bold">
                    {{ getMonthEventCount(month) }} events
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </div>

          <div class="heatmap-legend q-mt-lg text-center">
            <div class="text-caption text-grey-6 q-mb-xs">Event density</div>
            <div class="row justify-center items-center q-gutter-xs">
              <span class="text-caption">Less</span>
              <div
                v-for="intensity in 5"
                :key="intensity"
                class="legend-tile"
                :style="{ backgroundColor: getHeatmapColor((intensity - 1) * 0.25) }"
              ></div>
              <span class="text-caption">More</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Selected Date Events Dialog -->
    <q-dialog v-model="showDateEventsDialog" :maximized="$q.screen.lt.sm">
      <q-card class="date-events-dialog" style="min-width: 400px">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">Events on {{ selectedDateFormatted }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <div v-if="selectedDateEvents.length === 0" class="text-center text-grey-6 q-py-md">
            No events scheduled for this date
          </div>
          
          <div v-else class="events-list">
            <q-card
              v-for="event in selectedDateEvents"
              :key="event.id"
              flat
              bordered
              class="q-mb-sm cursor-pointer"
              @click="$emit('event-selected', event)"
            >
              <q-card-section class="q-pa-md">
                <div class="event-title text-weight-medium">{{ event.title }}</div>
                <div class="row items-center q-mt-xs">
                  <q-icon name="place" size="xs" class="q-mr-xs" />
                  <span class="text-caption">{{ event.city }}, {{ event.country }}</span>
                  <q-space />
                  <q-badge v-if="event.category" :color="getEventColor(event)">
                    {{ event.category }}
                  </q-badge>
                </div>
              </q-card-section>
            </q-card>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { QCalendarMonth, QCalendarDay } from '@quasar/quasar-ui-qcalendar';
import type { EventListItem } from '../services/types';
import { useEventCalendar, type CalendarEvent } from '../composables/useEventCalendar';
import { useFormatters } from '../composables/useFormatters';

interface Props {
  events: EventListItem[];
}

interface Emits {
  (e: 'date-selected', date: string): void;
  (e: 'event-selected', event: CalendarEvent): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const {
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
} = useEventCalendar();

const { getCategoryColor } = useFormatters();

// Local state
const showDateEventsDialog = ref(false);
const selectedDate = ref('');
const selectedDateEvents = ref<CalendarEvent[]>([]);

// Convert events for calendar display
const calendarEvents = computed(() => convertEventsForCalendar(props.events));

// Event counts by month for year view
const eventCountsByMonth = computed(() => {
  const year = new Date(currentDate.value || new Date()).getFullYear();
  return getEventCountsByMonth(calendarEvents.value, year);
});

// Max events in a month for heatmap intensity calculation
const maxEventsInMonth = computed(() => {
  return Math.max(...Object.values(eventCountsByMonth.value), 1);
});

// Date selection handlers
const onDateClick = (timestamp: { date: string }) => {
  selectedDate.value = timestamp.date;
  selectedDateEvents.value = getEventsForDate(calendarEvents.value, timestamp.date);
  showDateEventsDialog.value = true;
  emit('date-selected', timestamp.date);
};

const onEventClick = (event: CalendarEvent) => {
  emit('event-selected', event);
};

// Formatted selected date
const selectedDateFormatted = computed(() => {
  if (!selectedDate.value) return '';
  return new Date(selectedDate.value).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

// Year view helper functions
const getMonthName = (month: number) => {
  return new Date(2024, month - 1, 1).toLocaleDateString('en-US', { month: 'short' });
};

const getMonthEventCount = (month: number) => {
  const year = new Date(currentDate.value || new Date()).getFullYear();
  const monthKey = `${year}-${String(month).padStart(2, '0')}`;
  return eventCountsByMonth.value[monthKey] || 0;
};

const getMonthHeatmapStyle = (month: number) => {
  const count = getMonthEventCount(month);
  const intensity = count / maxEventsInMonth.value;
  return {
    backgroundColor: getHeatmapColor(intensity)
  };
};

const getHeatmapColor = (intensity: number) => {
  // Create a color gradient from light to dark blue
  const opacity = Math.max(0.1, intensity);
  return `rgba(25, 118, 210, ${opacity})`;
};

const navigateToMonth = (month: number) => {
  const year = new Date(currentDate.value || new Date()).getFullYear();
  const date = new Date(year, month - 1, 1);
  const dateString = date.toISOString().split('T')[0];
  if (dateString) {
    setDate(dateString);
  }
  setView('month');
};

// Event color based on category
const getEventColor = (event: CalendarEvent) => {
  if (!event.category) return 'primary';
  const colorConfig = getCategoryColor(event.category);
  return colorConfig.color;
};

// Expose internal state for parent component if needed
defineExpose({
  currentDate,
  currentView,
  setDate,
  setView,
  goToToday
});
</script>

<style scoped lang="scss">
.event-calendar {
  .calendar-header {
    border-bottom: 1px solid rgba(0, 0, 0, 0.12);
    
    body.body--dark & {
      border-bottom-color: rgba(255, 255, 255, 0.12);
    }
  }

  .calendar-event-item {
    .calendar-event-content {
      .event-title {
        font-weight: 500;
        line-height: 1.2;
      }
      
      .event-location {
        opacity: 0.8;
        line-height: 1.1;
      }
    }
  }

  .year-view {
    .month-tile {
      min-width: 120px;
      
      .month-card {
        transition: all 0.2s ease;
        min-height: 80px;
        
        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.12);
        }
      }
      
      &.has-events .month-card {
        border-color: $primary;
      }
    }

    .heatmap-legend {
      .legend-tile {
        width: 12px;
        height: 12px;
        border: 1px solid rgba(0, 0, 0, 0.1);
        
        body.body--dark & {
          border-color: rgba(255, 255, 255, 0.2);
        }
      }
    }
  }

  .date-events-dialog {
    .events-list {
      max-height: 400px;
      overflow-y: auto;
    }
  }
}

// Responsive adjustments
@media (max-width: $breakpoint-sm-max) {
  .event-calendar {
    .calendar-header {
      .row {
        flex-direction: column;
        gap: 1rem;
        
        .col-auto:first-child {
          order: 2;
        }
        
        .col {
          order: 1;
        }
        
        .col-auto:last-child {
          order: 3;
        }
      }
    }
    
    .year-view .month-tile {
      min-width: 100px;
      
      .month-card {
        min-height: 60px;
      }
    }
  }
}
</style>
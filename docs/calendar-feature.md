# Calendar Feature Documentation

## Overview

The calendar feature enhances the events listing page by providing an alternative view to display events in a calendar format. Users can switch between table and calendar views, navigate through different time periods, and interact with events directly from the calendar interface.

## Features

### View Modes

The calendar supports three distinct view modes:

1. **Month View**
   - Displays a traditional monthly calendar
   - Events appear as colored badges on their respective dates
   - Clicking on events navigates to event details
   - Clicking on dates shows all events for that day

2. **Week View**
   - Shows a weekly calendar layout
   - Events are displayed with more detail space
   - Better for viewing events within a specific week

3. **Year View**
   - Displays a heatmap of event distribution across the year
   - Each month shows the number of events as a colored tile
   - Color intensity represents event density
   - Clicking on a month switches to month view for that period

### User Interactions

- **View Toggle**: Switch between Table and Calendar views using toggle buttons
- **Navigation**: Previous/Next buttons to navigate through time periods
- **Today Button**: Quickly jump to the current date
- **Event Clicks**: Click on events to navigate to event details page
- **Date Selection**: Click on dates to see events scheduled for that day
- **Month Navigation**: In year view, click on months to drill down to month view

### Integration

- **Filters**: Calendar respects all existing filters (country, category, search, past events)
- **Event Data**: Uses the same event data and API endpoints as the table view
- **Responsive Design**: Works across desktop, tablet, and mobile devices
- **Dark Mode**: Supports the application's dark mode theme

## Technical Implementation

### Architecture

The calendar feature is built using several key components:

1. **`useEventCalendar` Composable** (`src/composables/useEventCalendar.ts`)
   - Manages calendar state (current date, view mode)
   - Provides navigation functions
   - Handles event data transformation for calendar display
   - Generates year view heatmap data

2. **`EventCalendar` Component** (`src/components/EventCalendar.vue`)
   - Main calendar UI component
   - Integrates with QCalendar library components
   - Handles user interactions and event emissions
   - Responsive layout and styling

3. **QCalendar Integration** (`src/boot/qcalendar.ts`)
   - Bootstrap file for QCalendar library CSS
   - Uses `@quasar/quasar-ui-qcalendar` for calendar components

### Dependencies

- **@quasar/quasar-ui-qcalendar**: Official Quasar calendar library
  - Provides QCalendarMonth and QCalendarDay components
  - Handles calendar rendering and interaction
  - Supports Vue 3 and TypeScript

### Event Data Structure

The calendar uses a `CalendarEvent` interface that transforms the existing `EventListItem` data:

```typescript
interface CalendarEvent {
  id: number;
  title: string;
  date: string;
  startDate: string;
  endDate: string;
  city?: string;
  country?: string;
  category?: string;
}
```

### Color Coding

Events are color-coded based on their category using the existing `useFormatters` composable:
- Marathon events: Blue
- Festival events: Green
- Conference events: Orange
- Learning events: Purple
- Other categories: Grey (default)

## Usage

### For Users

1. Navigate to the Events page
2. Use the Table/Calendar toggle to switch to calendar view
3. Use the Month/Week/Year buttons to change the view mode
4. Navigate through time using the arrow buttons or "Today" button
5. Click on events to view details
6. Click on dates to see all events for that day
7. In year view, click on months to zoom into that month

### For Developers

#### Adding the Calendar to a Page

```vue
<template>
  <EventCalendar
    :events="eventsList"
    @date-selected="handleDateSelected"
    @event-selected="handleEventSelected"
  />
</template>

<script setup>
import EventCalendar from '@/components/EventCalendar.vue';

const handleDateSelected = (date) => {
  console.log('Date selected:', date);
};

const handleEventSelected = (event) => {
  // Navigate to event details or handle as needed
  router.push(`/events/${event.id}`);
};
</script>
```

#### Using the Calendar Composable

```javascript
import { useEventCalendar } from '@/composables/useEventCalendar';

const {
  currentDate,
  currentView,
  viewModes,
  navigateDate,
  setView,
  convertEventsForCalendar
} = useEventCalendar();

// Convert events for calendar display
const calendarEvents = convertEventsForCalendar(rawEvents);

// Navigate to next month
navigateDate('next');

// Switch to week view
setView('week');
```

## Customization

### Styling

The calendar component includes responsive SCSS styling that can be customized:

- Calendar header styling in `.calendar-header`
- Event item styling in `.calendar-event-item`
- Year view heatmap styling in `.year-view`
- Mobile responsive breakpoints

### Event Display

Event display can be customized by modifying the event templates in `EventCalendar.vue`:

```vue
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
```

### Heatmap Colors

Year view heatmap colors can be customized in the `getHeatmapColor` function:

```javascript
const getHeatmapColor = (intensity) => {
  // Customize color scheme
  const opacity = Math.max(0.1, intensity);
  return `rgba(25, 118, 210, ${opacity})`; // Blue theme
};
```

## Accessibility

The calendar implementation includes accessibility features:

- Keyboard navigation support (inherited from QCalendar)
- ARIA labels for calendar elements
- Screen reader friendly date and event announcements
- High contrast support in dark mode
- Focus management for interactive elements

## Browser Support

The calendar feature supports the same browsers as the main Quasar application:
- Chrome 115+
- Firefox 115+
- Safari 14+
- Modern mobile browsers

## Performance Considerations

- Events are filtered and transformed only when needed
- Calendar components use Vue 3's reactivity system for efficient updates
- Lazy loading of calendar views prevents unnecessary rendering
- Event data is cached and reused between view switches

## Future Enhancements

Potential improvements for future versions:

1. **Event Creation**: Allow users to create events directly from the calendar
2. **Drag & Drop**: Enable dragging events between dates
3. **Recurring Events**: Support for recurring event patterns
4. **External Calendar Integration**: Export to Google Calendar, iCal
5. **Mini Calendar**: Compact calendar widget for other pages
6. **Custom Event Types**: User-defined event categories and colors
7. **Performance Optimization**: Virtual scrolling for large event sets

## Troubleshooting

### Common Issues

1. **Calendar not displaying**: Check that QCalendar CSS is properly imported
2. **Events not showing**: Verify event data has valid date fields
3. **Navigation not working**: Ensure date format is YYYY-MM-DD
4. **Styling issues**: Check SCSS compilation and Quasar theme integration

### Debug Mode

Enable debug logging by setting `console.log` statements in the composable:

```javascript
const navigateDate = (direction) => {
  console.log('Navigating', direction, 'from', currentDate.value);
  // ... rest of function
};
```

## Support

For issues related to the calendar feature:

1. Check the browser console for JavaScript errors
2. Verify that all dependencies are properly installed
3. Ensure the QCalendar library is compatible with the Quasar version
4. Review the component props and event handlers

For QCalendar-specific issues, refer to the [official documentation](https://qcalendar.netlify.app/).
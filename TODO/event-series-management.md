# Feature: Event Series Management and Linking

## 1. Context

Many tango events are part of a recurring series (e.g., an annual marathon, a monthly encuentro, a festival that happens in different seasons). This feature aims to group such events under a common "Event Series" identity. This will allow users to see all editions of a particular event series, understand its history, and easily find upcoming editions.

The backend has a custom post type `tmd_event_series` and an API endpoint `/tmd/v3/event-series` (as per `README.md` and `DESIGN.md`). This feature will focus on building the frontend representation and interactions for this data, and linking individual events to their respective series.

## 2. Requirements

### 2.1. Event Series Profile Pages

-   **Dedicated URLs**: Each event series should have a unique URL, e.g., `/event-series/{series_id}/{series_name_slug}`.
-   **Information Displayed**:
    -   Series Name (e.g., "Example Tango Marathon")
    -   Series Description (overall theme, history, typical frequency, etc.)
    -   Logo/Image for the series (if available from API)
    -   Organizer(s) of the series (if consistent across editions and available from API)
-   **List of Events in the Series**:
    -   Display all individual event editions belonging to this series.
    -   Group by year or show in reverse chronological order (newest first).
    -   Each event listed should clearly show its name (e.g., "Example Tango Marathon 2024 - Spring Edition"), dates, and status (upcoming, past).
    -   Each event listed should link to its own full event detail page.

### 2.2. Event Series Listing Page (Optional - depending on UX preference)

-   **URL**: A dedicated page, e.g., `/event-series`.
-   **Display**: List all defined event series.
    -   Each item should display: Series Name, Logo/thumbnail.
-   **Filtering/Search**:
    -   By Series Name (search input).
-   **Consideration**: If the number of distinct series is small, this page might be less critical than integrating series information directly into event pages. However, an admin/management interface for series would still be useful. The API `/tmd/v3/event-series` suggests a list is available.

### 2.3. Linking Events to Event Series

-   **On Event Detail Page**:
    -   If an event is part of a series, display the series name prominently.
    -   The series name should link to the Event Series Profile Page.
    -   Consider showing a few other events from the same series (e.g., "Previous Edition", "Next Edition" or a small list of siblings).
-   **On Event Cards/List Items (e.g., on `/events` page)**:
    -   Optionally, display the event series name or logo subtly on event cards if an event belongs to a series.
-   **API Support**:
    -   Individual event data (`/tmd/v3/events/{id}`) should include information about the event series it belongs to (e.g., `event_series_id` and `event_series_name`). Ideally, this would be part of the main event object or available via `_embed`.
    -   The event series API (`/tmd/v3/event-series/{id}`) should be able to list or embed its constituent event editions. The `README.md` mentions "Event series management and linking" as a current priority, implying this relationship needs to be established and queryable.

## 3. Tasks Checklist

### 3.1. Backend/API (Investigation & Potential WordPress Updates - coordinate with backend if needed)

-   [ ] Verify how `tmd_event` CPTs are linked to `tmd_event_series` CPTs in WordPress.
-   [ ] Confirm that the `/tmd/v3/events/{id}` endpoint response includes the `event_series_id` and `event_series_name` if the event is part of a series.
-   [ ] Confirm that the `/tmd/v3/event-series/{id}` endpoint can provide a list of all event IDs or embed event objects belonging to that series.
-   [ ] Ensure API supports fetching necessary details for the Event Series Profile Page (name, description, logo, organizer).

### 3.2. Frontend Development

-   **Event Series Profile Page (`/event-series/{id}/{slug}`)**:
    -   [ ] Create Vue component for the event series profile page.
    -   [ ] Implement API call to fetch specific event series details (name, description, etc.).
    -   [ ] Implement API call to fetch all events belonging to this series.
    -   [ ] Display series information.
    -   [ ] Display the list of associated events, linking each to its respective event detail page.
    -   [ ] Style the page for clear presentation of series information and its events.
-   **Event Series Listing Page (`/event-series` - if implemented)**:
    -   [ ] Create Vue component for the event series list page.
    -   [ ] Implement API call to fetch all event series using a service (e.g., `eventSeriesService.ts`).
    -   [ ] Create Vue component for individual event series cards/list items.
    -   [ ] Implement search filter (by series name).
-   **Event Detail Page Integration**:
    -   [ ] Modify event detail page component (`src/pages/EventDetails.vue`).
    -   [ ] Check if the fetched event data contains event series information.
    -   [ ] If yes, display the event series name.
    -   [ ] Make the series name a link to the Event Series Profile Page.
    -   [ ] Optionally, display links to other events in the same series.
-   **Event Card/List Item Integration (Optional)**:
    -   [ ] Modify event card components (`src/components/EventCard.vue` or similar).
    -   [ ] If event data includes series info, optionally display it on the card.
-   **Services (`src/services/`)**:
    -   [ ] Create or update `eventSeriesService.ts` for fetching event series data and their related events.
    -   [ ] Update `eventService.ts` or `eventDetailsService.ts` to ensure it fetches/handles `event_series_id` from event data.
-   **Routing (`src/router/routes.ts`)**:
    -   [ ] Add route for `/event-series/{id}/{slug}`.
    -   [ ] Add route for `/event-series` (if listing page is implemented).
-   **UI/UX**:
    -   [ ] Design layout for event series profile pages.
    -   [ ] Ensure responsive design for all new components.
    -   [ ] Decide on main navigation integration (e.g., directly, or accessible via events).

### 3.3. Testing

-   [ ] Unit tests for new service functions in `eventSeriesService.ts`.
-   [ ] Component tests for event series profile page (and listing page if applicable).
-   [ ] End-to-end tests for:
    -   Navigating from an event to its series page.
    -   Viewing all events within a series.
    -   Searching/filtering series (if listing page is implemented).
-   [ ] Test on multiple devices/screen sizes.

## 4. Acceptance Criteria

-   [ ] If an event is part of a series, its detail page clearly indicates this and links to the event series profile page.
-   [ ] Users can navigate to an event series profile page.
-   [ ] Event series profile pages display the series name, description, and a list of all its event editions (past and upcoming).
-   [ ] Each event edition listed on the series page links to its own full detail page.
-   [ ] The system correctly fetches and displays data from the `/tmd/v3/event-series` API endpoints.
-   [ ] Relationships between events and event series are clearly presented.
-   [ ] All new pages and components are responsive and well-styled.
-   [ ] (If series listing page is implemented) Users can browse and search a list of all event series.

# Feature: Enhanced Event Filtering

## 1. Context

The application currently provides event filtering capabilities (as seen in `DESIGN.md` and `USER_GUIDE.md`), including search, country, date ranges, and past event toggles. The `README.md`'s "Current Priorities" section lists "Enhanced event filtering (by DJ, date ranges, categories)" as a TODO. This suggests a need to review, consolidate, and potentially expand upon existing filters to provide a more powerful and user-friendly experience.

This document aims to define what "enhanced" means in this context, ensuring all desired filtering mechanisms are comprehensively covered.

## 2. Requirements

### 2.1. Review and Consolidate Existing Filters

-   **Date Filters**:
    -   Ensure "event dates" and "registration dates" are clear and functional.
    -   Verify "Quick Filters" (e.g., "Next 9 months", "Next 4 months") are working as expected and are still relevant.
-   **Text Search**:
    -   Confirm it searches across relevant fields (event titles, cities, countries as per `DESIGN.md`).
-   **Country Filter**:
    -   Ensure it uses country codes and displays names correctly.
-   **Past Events Toggle**:
    -   Verify its functionality.
-   **Filter Persistence**:
    -   Confirm that filter states (including sorting) are saved to cookies and reloaded correctly, as specified in `DESIGN.md`.

### 2.2. New/Enhanced Filter Types

-   **Filter by DJ**:
    -   **Requirement**: Allow users to find events where a specific DJ is playing.
    -   **Implementation Idea**:
        -   An autocomplete search input where users can type a DJ's name.
        -   On selecting a DJ, the event list updates to show only events featuring that DJ.
        -   The API endpoint `GET /tmd/v3/events?dj={dj_id}` (from `docs/api.md`) is designed for this.
-   **Filter by Event Category (Refinement)**:
    -   **Current**: `DESIGN.md` mentions color-coded categories and the API `GET /tmd/v3/events?category={category_slug_or_id}`.
    -   **Enhancement**:
        -   Provide a multi-select dropdown or checklist for event categories (Marathons, Festivals, Encuentros, Workshops, etc.).
        -   Users should be able to select one or more categories to filter the event list.
        -   Ensure category names are user-friendly and icons/colors are used consistently if possible in the filter UI.
-   **Filter by City (New or Enhanced)**:
    -   **Requirement**: Allow users to filter events by specific cities, not just countries.
    -   **Implementation Idea**:
        -   Could be an autocomplete text input for city names.
        -   Dependent on API support: `GET /tmd/v3/events?city={city_name}`. This needs to be verified or requested if not available.
-   **Filter by Region/Continent (New - Optional, Advanced)**:
    -   **Requirement**: For broader searches, allow filtering by continent (e.g., Europe, South America) or predefined regions.
    -   **Consideration**: This adds complexity and depends heavily on structured location data and API support. May be a lower priority enhancement.

### 2.3. Filter UI/UX Enhancements

-   **Clear Indication of Active Filters**:
    -   Display currently applied filters clearly (e.g., "tags" or "chips" above the list showing "Country: Germany", "DJ: John Doe").
    -   Allow easy removal of individual filters or resetting all filters.
    -   `DESIGN.md` mentions "Filter state indicators showing active filter counts". This should be implemented if not already present.
-   **Filter Panel Organization**:
    -   Ensure the filter panel (`ListFilters.vue` or similar) is well-organized, especially if more filters are added.
    -   Consider collapsible sections for different filter types on desktop if the panel becomes too long.
    -   Mobile filter panel should remain user-friendly and not overly cluttered. `DESIGN.md` mentions "Collapsible filter panels on mobile devices".
-   **Performance**:
    -   API calls should only be made when necessary (e.g., after a debounce period for text inputs, or on explicit apply if performance is an issue with many live filters). `DESIGN.md` mentions "Debounced search queries".
    -   Loading indicators should be shown while the list is updating.

## 3. Tasks Checklist

### 3.1. Backend/API (Investigation & Potential WordPress Updates - coordinate with backend if needed)

-   [ ] Verify API support for filtering events by DJ ID (`GET /tmd/v3/events?dj={dj_id}`).
-   [ ] Verify API support for filtering events by one or more category slugs/IDs (`GET /tmd/v3/events?category=slug1,slug2`).
-   [ ] Investigate/confirm API support for filtering by city name (`GET /tmd/v3/events?city={city_name}`). If not present, assess feasibility.
-   [ ] (Optional) Investigate API support for region/continent filtering if this enhancement is pursued.

### 3.2. Frontend Development

-   **Filter by DJ**:
    -   [ ] Add DJ search/select input to the filter panel.
    -   [ ] Fetch list of DJs for the autocomplete (may need a lightweight `/tmd/v3/djs?fields=id,name` endpoint or similar).
    -   [ ] Update `eventListService.ts` or composable (`useEventFilters.ts`) to include `dj_id` in API parameters.
    -   [ ] Update event list view to reflect filtering by DJ.
-   **Filter by Event Category (Refinement)**:
    -   [ ] Implement multi-select dropdown/checklist for categories in the filter panel.
    -   [ ] Fetch available event categories (if not hardcoded, an API endpoint might be needed, e.g., `/wp/v2/event_categories`).
    -   [ ] Update `useEventFilters.ts` to handle multiple category selections.
    -   [ ] Ensure API parameters are formatted correctly for multiple categories.
-   **Filter by City (If API supports)**:
    -   [ ] Add city search/select input to the filter panel.
    -   [ ] Update `useEventFilters.ts` to include `city` in API parameters.
-   **UI/UX Enhancements**:
    -   [ ] Implement clear display of active filters (tags/chips).
    -   [ ] Implement functionality to remove individual active filters.
    -   [ ] Implement a "Reset All Filters" button.
    -   [ ] Review and optimize filter panel layout for desktop and mobile.
-   **Filter Persistence**:
    -   [ ] Ensure all new filter types (DJ, enhanced categories, city) are saved to and loaded from cookies via `useEventFilters.ts`.
-   **Composables/Services**:
    -   [ ] Update `useEventFilters.ts` to manage state for new filters.
    -   [ ] Update `eventListService.ts` to pass new filter parameters to the API.
-   **Testing**:
    -   [ ] Unit tests for `useEventFilters.ts` with new filter logic.
    -   [ ] Component tests for the filter panel with new filter inputs.
    -   [ ] E2E tests covering various combinations of existing and new filters.
    -   [ ] Test filter persistence across sessions.
    -   [ ] Performance testing with multiple filters applied.

## 4. Acceptance Criteria

-   [ ] Users can filter the event list by one or more specific DJs.
-   [ ] Users can filter the event list by selecting one or more event categories.
-   [ ] (If implemented) Users can filter the event list by city.
-   [ ] All existing filters (date, search, country, past events) continue to function correctly alongside new filters.
-   [ ] Applied filters are clearly displayed to the user.
-   [ ] Users can easily remove individual filters or reset all filters.
-   [ ] All filter states, including new ones, are correctly saved to cookies and persist across sessions.
-   [ ] The filter panel remains well-organized and user-friendly on both desktop and mobile.
-   [ ] Filtering performance is acceptable, with appropriate use of debouncing and loading indicators.
-   [ ] API calls are correctly formatted with the new filter parameters.

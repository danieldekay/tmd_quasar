# Feature: Teacher Profiles and Teacher-Event Relationships

## 1. Context

The application currently features DJ profiles and event listings. A natural extension is to provide similar functionality for Tango Teachers. This will allow users to find information about teachers, their specializations, and the events (workshops, festivals, etc.) they are associated with. This feature enhances the platform's value as a comprehensive resource for the tango community.

The backend already has a `tmd_teacher` custom post type and an API endpoint `/tmd/v3/teachers` (as per `docs/api.md` and `README.md`). This feature will focus on building the frontend representation and interactions for this data.

## 2. Requirements

### 2.1. Teacher Profile Pages

-   **Dedicated URLs**: Each teacher should have a unique URL, e.g., `/teachers/{teacher_id}/{teacher_name_slug}`.
-   **Information Displayed**:
    -   Teacher's Name (or Couple's Name)
    -   Profile Picture(s)
    -   Biography / Teaching Philosophy
    -   Country and City of residence/base
    -   Contact Information (Email, Website, Social Media links if available from API)
    -   Specializations/Styles Taught (e.g., Tango Salon, Milonga, Vals, Neo Tango, Tango Nuevo, Technique) - *This might require new metadata fields in WordPress if not already present.*
    -   Level of Students Taught (e.g., Beginners, Intermediate, Advanced, All Levels) - *This might require new metadata fields.*
-   **Teacher Couple Handling**: The system should gracefully handle both individual teachers and teacher couples. The API structure for `tmd_teacher` needs to be checked if it distinguishes these or if it's a single entry. `DESIGN.md` mentions `tmd_teacher` (individual) and `tmd_teacher_couple` (couples) as CPTs. The API docs only list `/tmd/v3/teachers`. Clarification might be needed on how couples are fetched and displayed. Assume for now `tmd_teacher` can represent both.

### 2.2. Teacher Listing Page

-   **URL**: A dedicated page, e.g., `/teachers`.
-   **Display**: List teachers (individuals and couples) using cards or a table view, similar to DJs.
    -   Each item should display: Name, Profile Picture (thumbnail), Country/City.
-   **Filtering**:
    -   By Name (search input)
    -   By Country
    -   By Specialization (if this metadata becomes available and filterable via API)
-   **Pagination**: If the number of teachers is large.

### 2.3. Teacher-Event Relationships

-   **On Teacher Profile Page**:
    -   List upcoming events (workshops, festivals) where the teacher is teaching.
    -   List past events for historical reference.
    -   Each event listing should link to the event's detail page.
-   **On Event Detail Page**:
    -   If teachers are associated with an event, display their names and link to their teacher profiles.
    -   This is analogous to how DJs are displayed on event pages.
-   **API Support**:
    -   The API (`/tmd/v3/teachers/{id}`) should ideally be able_to embed related events (similar to how DJs can embed events using `?_embed`).
    -   The event API (`/tmd/v3/events/{id}`) should be able to embed related teachers.
    -   If direct embedding isn't available, separate API calls might be needed to fetch related data. This needs to be investigated based on current API capabilities.

## 3. Tasks Checklist

### 3.1. Backend/API (Investigation & Potential WordPress Updates - coordinate with backend if needed)

-   [ ] Verify how `tmd_teacher` CPT handles individual vs. couple teachers.
-   [ ] Identify existing metadata fields for teachers in WordPress.
-   [ ] Determine if new metadata fields are needed for "Specializations" and "Student Levels". If so, plan for their addition in WordPress.
-   [ ] Confirm if `/tmd/v3/teachers` API endpoint supports filtering by name and country.
-   [ ] Investigate/confirm API capabilities for embedding events within teacher profiles (`/tmd/v3/teachers/{id}?_embed`).
-   [ ] Investigate/confirm API capabilities for embedding teachers within event details (`/tmd/v3/events/{id}?_embed`).
-   [ ] If embedding is not fully supported, define how relationships will be fetched (e.g., separate API calls based on IDs).

### 3.2. Frontend Development

-   **Teacher Listing Page (`/teachers`)**:
    -   [ ] Create Vue component for the teacher list page.
    -   [ ] Implement API call to fetch teachers using `teacherService.ts`.
    -   [ ] Create Vue component for individual teacher cards/list items.
    -   [ ] Implement search filter (by name).
    -   [ ] Implement country filter (similar to event country filter).
    -   [ ] Implement specialization filter (if data and API support it).
    -   [ ] Implement pagination if necessary.
-   **Teacher Profile Page (`/teachers/{id}/{slug}`)**:
    -   [ ] Create Vue component for the teacher profile page.
    -   [ ] Implement API call to fetch specific teacher details.
    -   [ ] Display all required teacher information (name, photo, bio, contact, etc.).
    -   [ ] Display list of upcoming events associated with the teacher.
        -   [ ] Fetch event data (either embedded or separate call).
        -   [ ] Link each event to its detail page.
    -   [ ] Display list of past events associated with the teacher.
-   **Event Detail Page Integration**:
    -   [ ] Modify event detail page component.
    -   [ ] If event data includes associated teachers, display their names.
    -   [ ] Link teacher names to their respective profile pages.
-   **Services (`src/services/`)**:
    -   [ ] Potentially update or create `teacherService.ts` for fetching teacher data and related events.
    -   [ ] Update `eventService.ts` or `eventDetailsService.ts` if needed for fetching teacher data related to events.
-   **Routing (`src/router/routes.ts`)**:
    -   [ ] Add routes for `/teachers` and `/teachers/{id}/{slug}`.
-   **UI/UX**:
    -   [ ] Design teacher cards and profile page layout.
    -   [ ] Ensure responsive design for all new components.
    -   [ ] Add to main navigation if appropriate.

### 3.3. Testing

-   [ ] Unit tests for new service functions.
-   [ ] Component tests for teacher list and profile pages.
-   [ ] End-to-end tests for teacher browsing and teacher-event relationship viewing.
-   [ ] Test on multiple devices/screen sizes.

## 4. Acceptance Criteria

-   [ ] Users can navigate to a "Teachers" section from the main navigation (or a clear entry point).
-   [ ] Users can see a list of tango teachers.
-   [ ] Users can filter the list of teachers by name and country.
-   [ ] Users can click on a teacher to view their detailed profile page.
-   [ ] Teacher profile pages display all specified information (name, photo, bio, contact, location).
-   [ ] Teacher profile pages display a list of upcoming and past events where the teacher is involved, with links to those events.
-   [ ] Event detail pages display the names of teachers involved in that event, with links to their profiles.
-   [ ] The implementation correctly handles both individual teachers and teacher couples (based on API capabilities).
-   [ ] All new pages and components are responsive and well-styled.
-   [ ] API calls are efficient (e.g., uses `_embed` where possible).

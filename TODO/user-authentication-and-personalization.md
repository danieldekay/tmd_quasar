# Feature: User Authentication and Personalized Features

## 1. Context

Currently, the application serves as a public information portal for tango events, DJs, and teachers. Introducing user authentication would open doors to personalized experiences, such as saving favorite events, DJs, or teachers, managing event registrations (if applicable in the future), or receiving tailored recommendations. This feature is a foundational step towards building a more interactive and user-centric platform.

The `README.md` lists "User authentication and personalized features" as a current priority. This document will outline the initial scope for authentication and some basic personalization features.

## 2. Requirements

### 2.1. User Authentication

-   **Authentication Method**:
    -   The primary authentication mechanism will likely be tied to WordPress user accounts.
    -   Consider OAuth 2.0 or OpenID Connect if integrating with third-party identity providers (e.g., Google, Facebook) is desired in the future, but initial focus should be WordPress-based auth.
    -   The WordPress REST API provides mechanisms for cookie authentication and potentially JWT (JSON Web Tokens) via plugins. This needs investigation for a headless setup.
-   **User Registration**:
    -   A way for new users to register. This might be a frontend form that communicates with a WordPress registration endpoint.
    -   Alternatively, registration might be handled directly within WordPress, and users log in via the frontend.
-   **User Login/Logout**:
    -   Login form (email/username and password).
    -   Secure handling of credentials and session/token management.
    -   Clear logout functionality.
-   **Password Recovery**:
    -   "Forgot Password" functionality, likely leveraging WordPress's existing password reset mechanisms.
-   **User Profile (Basic)**:
    -   A simple profile page for logged-in users to view their email/username and potentially change their password.

### 2.2. Personalized Features (Initial Scope)

-   **Favorite Events**:
    -   Logged-in users can mark/unmark events as "favorites".
    -   An icon (e.g., a heart or star) on event cards and event detail pages to toggle favorite status.
    -   A dedicated "My Favorite Events" page accessible to logged-in users, listing all their favorited events.
    -   Favorite status should persist across sessions.
-   **Favorite DJs**:
    -   Logged-in users can mark/unmark DJs as "favorites".
    -   An icon on DJ cards and DJ profile pages.
    -   A "My Favorite DJs" section on their profile or a separate page.
-   **Favorite Teachers**:
    -   Logged-in users can mark/unmark Teachers as "favorites".
    -   An icon on Teacher cards and Teacher profile pages.
    -   A "My Favorite Teachers" section on their profile or a separate page.

### 2.3. API Requirements for Personalization

-   Endpoints to add/remove an event from a user's favorites.
-   Endpoints to get a list of a user's favorite events.
-   Similar endpoints for favorite DJs and favorite Teachers.
-   These endpoints must be authenticated and operate in the context of the logged-in user. This typically means the WordPress backend would store these user-item relationships.

## 3. Tasks Checklist

### 3.1. Backend/API (Investigation & WordPress Configuration/Plugins - coordinate with backend)

-   [ ] Research and decide on the authentication strategy for headless WordPress (e.g., JWT plugin, Application Passwords, standard cookie auth if viable).
-   [ ] Configure WordPress for user registration if it's to be enabled via the frontend.
-   [ ] Implement or verify API endpoints for:
    -   User registration (if applicable).
    -   User login (issuing token/cookie).
    -   User logout (invalidating token/cookie).
    -   Password reset requests.
-   [ ] Design and implement backend logic and API endpoints for managing user favorites:
    -   `POST /users/me/favorites/events/{event_id}` (Add favorite)
    -   `DELETE /users/me/favorites/events/{event_id}` (Remove favorite)
    -   `GET /users/me/favorites/events` (List favorite events)
    -   Equivalent endpoints for DJs and Teachers.
-   [ ] Ensure all user-specific endpoints are properly secured and require authentication.

### 3.2. Frontend Development

-   **Authentication UI & Logic**:
    -   [ ] Create Registration page/form component.
    -   [ ] Create Login page/form component.
    -   [ ] Implement "Forgot Password" page/flow.
    -   [ ] Create UI elements for login/logout buttons, user avatar/menu in the layout.
    -   [ ] Implement state management for user authentication status (e.g., in Pinia store).
    -   [ ] Securely store authentication token/session information.
    -   [ ] Implement route guards for pages requiring authentication.
    -   [ ] Create a basic User Profile page (view email, change password link).
-   **Favorite Events**:
    -   [ ] Add "favorite" toggle icon/button to event cards and event detail pages (visible to logged-in users).
    -   [ ] Implement API calls to add/remove event favorites.
    -   [ ] Create "My Favorite Events" page, fetching and displaying the user's favorited events.
-   **Favorite DJs**:
    -   [ ] Add "favorite" toggle icon/button to DJ cards and DJ profile pages.
    -   [ ] Implement API calls for DJ favorites.
    -   [ ] Create/Update user profile page to list "My Favorite DJs".
-   **Favorite Teachers**:
    -   [ ] Add "favorite" toggle icon/button to Teacher cards and Teacher profile pages.
    -   [ ] Implement API calls for Teacher favorites.
    -   [ ] Create/Update user profile page to list "My Favorite Teachers".
-   **Services (`src/services/`)**:
    -   [ ] Create `authService.ts` for registration, login, logout, password reset.
    -   [ ] Create `userService.ts` or extend existing services for managing favorites.
-   **Routing (`src/router/routes.ts`)**:
    -   [ ] Add routes for login, registration, forgot password, user profile, favorite lists.
-   **UI/UX**:
    -   [ ] Design all new auth-related pages and UI elements.
    -   [ ] Ensure a clear visual distinction for logged-in vs. logged-out states.

### 3.3. Testing

-   [ ] Unit tests for `authService.ts` and other new service functions.
-   [ ] Component tests for login, registration, profile, and favorites pages/components.
-   [ ] E2E tests for:
    -   User registration flow.
    -   Login and logout.
    -   Password recovery flow.
    -   Adding/removing favorites (events, DJs, teachers).
    -   Viewing lists of favorites.
    -   Access control (restricted pages for non-logged-in users).
-   [ ] Security testing (e.g., ensuring tokens are handled securely, no sensitive data leaks).

## 4. Acceptance Criteria

-   [ ] Users can register for a new account (or via WordPress directly).
-   [ ] Registered users can log in to the application.
-   [ ] Logged-in users can log out.
-   [ ] Users can recover a forgotten password.
-   [ ] Logged-in users have access to a basic profile page.
-   [ ] Logged-in users can mark/unmark events, DJs, and teachers as favorites.
-   [ ] Logged-in users can view lists of their favorited items.
-   [ ] Favorite status persists across sessions for logged-in users.
-   [ ] Non-logged-in users do not see "favorite" options or access personalized pages.
-   [ ] Authentication is secure, and user data is handled appropriately.
-   [ ] All new UI elements and pages are responsive and well-styled.

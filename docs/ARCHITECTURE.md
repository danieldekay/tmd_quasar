# Application Architecture

This document outlines the architecture of the TMD Quasar Frontend application.

## Overview

The application follows a headless architecture:

- **Frontend**: A Quasar (Vue.js 3) single-page application (SPA) providing the user interface.
- **Backend (CMS)**: WordPress, used as a headless Content Management System. All content editing and management are handled here.
- **API**: The WordPress REST API (custom TMD v2 and v3 endpoints) serves as the bridge between the frontend and backend.

## Frontend (Quasar/Vue.js)

- **Framework**: Quasar Framework (based on Vue.js 3)
- **Language**: TypeScript (with strict mode)
- **UI Components**: Quasar Material Design components
- **State Management**: Pinia (implied by Quasar/Vue 3 best practices, though not explicitly stated in `DESIGN.md` for this specific project, it's a common choice)
- **Routing**: Vue Router
- **Build Tool**: Vite
- **Key Features**:
    - Mobile-first responsive design
    - Advanced filtering and search capabilities
    - Dark mode support
    - Performance optimizations (efficient API calls, lazy loading)

### Project Structure (Frontend)

```
src/
├── App.vue          # Root Vue component
├── assets/          # Static assets processed by Vite
├── boot/            # Quasar boot files (e.g., axios configuration)
├── components/      # Reusable Vue components
├── composables/     # Vue Composition API functions for shared logic
├── css/             # Global styles and Quasar variables
├── layouts/         # Quasar page layouts
├── pages/           # Application pages (route components)
├── router/          # Vue Router configuration
├── services/        # API service integrations and data transformation logic
└── interfaces/      # TypeScript interfaces for data structures
```

## Backend (WordPress)

- **Role**: Headless CMS
- **Content Management**: All content (Events, DJ profiles, Teacher profiles, Event Series) is managed within WordPress.
- **Plugin**: A custom "TMD WordPress plugin" is essential for providing the necessary custom post types and API endpoints.

### Custom Post Types

The application relies on several custom post types (CPTs) defined in WordPress:

- `tmd_event`: For marathons, festivals, encuentros, etc. Includes detailed metadata like dates, locations, DJ lineups, and registration info.
- `tmd_dj`: For DJ profiles, including activity tracking, experience timelines, and linked events.
- `tmd_teacher`: For teacher profiles.
- `tmd_event_series`: For managing series of related events.

## API (WordPress REST API)

- **Communication**: The Quasar frontend communicates with WordPress via its REST API.
- **Custom Endpoints**: The TMD plugin provides custom API endpoints under the `tmd/v2` (production) and `tmd/v3` (development) namespaces.
- **Core API**: Standard WordPress REST API endpoints (e.g., `/wp/v2/`) are also used for some content types.

### Key API Features

- **Data Exposure**: Exposes data from the custom post types (`tmd_event`, `tmd_dj`, etc.).
- **Filtering & Search**: Supports server-side filtering (by date, country, category, DJ) and search queries.
- **Pagination**: Server-side pagination is implemented (e.g., `page`, `per_page` parameters). Response headers like `X-WP-Total` and `X-WP-TotalPages` are used.
- **Embedding**: Supports embedding related data (e.g., a DJ's events) using the `_embed` parameter to reduce the number of API calls.

### Example API Interaction Flow

1. User navigates to the "Events" page in the Quasar app.
2. The frontend makes a GET request to `/wp-json/tmd/v3/events` (or `v2` in production), potentially with query parameters for filtering or pagination.
3. WordPress, via the TMD plugin, processes this request, queries the database for relevant `tmd_event` posts.
4. WordPress responds with a JSON payload containing the event data.
5. The frontend parses the JSON and renders the events list using Vue components.

## Data Flow

1. **Content Creation/Management**: Done within the WordPress admin interface.
2. **Data Exposure**: WordPress REST API (with TMD custom endpoints) exposes this content as JSON.
3. **Data Consumption**: The Quasar frontend fetches data from these API endpoints.
4. **Data Presentation**: The frontend renders the data using Vue.js components and Quasar UI elements.
5. **User Interactions**: Filters, searches, and navigation in the frontend trigger new API requests to fetch updated data.

## Design Principles Influencing Architecture

- **Mobile-First**: The architecture supports responsive design by ensuring the frontend can adapt to various screen sizes and interactions.
- **Performance**: Server-side pagination and filtering, efficient API calls, and lazy loading are key architectural choices to ensure good performance.
- **Modularity**: Separation of concerns between the frontend (Quasar) and backend (WordPress) allows for independent development and scaling.
- **Maintainability**: TypeScript usage and a structured project layout contribute to code quality and maintainability.

This document provides a high-level overview. For more detailed information, refer to `DESIGN.md` (for in-depth design choices) and `docs/api.md` (for API endpoint specifics).

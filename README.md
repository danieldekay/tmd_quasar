# TMD App

A modern, mobile-first application for the Tango Marathons website,
built with Quasar Vue.js and WordPress as a headless CMS.

## Overview

This project implements a headless WordPress architecture where:

- WordPress serves as the Content Management System (CMS) and backend,
  handling all content editing and management
- The Quasar application provides the modern, performant frontend interface,
  consuming data via the WordPress REST API v3
- The application is designed to work with the TMD WordPress plugin's custom
  API endpoints

## Features

- **Modern DJ Management**: Complete DJ profiles with activity tracking,
  experience timelines, and linked events
- **Event & Performance Tracking**: Comprehensive event listings with
  DJ-event relationships and performance statistics
- **Mobile-First Design**: Touch-optimized interactions with responsive
  layouts for all screen sizes
- **Advanced Filtering**: Server-side search and filtering with optimized
  performance
- **Dark Mode Support**: System preference detection with persistent settings
- **Performance Optimized**: Efficient API calls, request cancellation, and
  optimized data loading
- **TypeScript Integration**: Full type safety with strict null checks and
  ESLint compliance

## Tech Stack

- **Frontend Framework**: Quasar Framework (Vue.js 3)
- **UI Components**: Quasar Material Design components
- **Icons**: Material Design Icons
- **Language**: TypeScript with strict mode
- **Code Quality**: ESLint + Prettier with strict rules
- **API Integration**: WordPress REST API (TMD custom endpoints v2 & v3, WordPress Core API v2)
- **Performance**: Request debouncing, caching, lazy loading
- **Code Quality**: ESLint + Prettier + Stylelint with strict rules

## Prerequisites

- Node.js (v16 or higher)
- pnpm (recommended) or npm
- WordPress installation with TMD plugin and REST API v3 enabled
- Local development environment at `http://localhost:10014` (for API testing)

## Quick Start

1. Clone the repository:

```bash
git clone [repository-url]
cd tmd_quasar
```

2. Install dependencies:

```bash
pnpm install
# or
npm install
```

3. Configure API endpoint:

   - Local development: All content types (Events, DJs, Teachers, Event Series) primarily use `http://localhost:10014/wp-json/tmd/v3`.
   - Production:
     - Events: `https://www.tangomarathons.com/wp-json/tmd/v2`
     - DJs, Teachers, Event Series: Accessed via `tmd/v3` (e.g., `https://www.tangomarathons.com/wp-json/tmd/v3/djs`) and potentially standard WordPress `wp/v2` endpoints for some data. Refer to `docs/api.md` for specifics.

4. Start development server:

```bash
pnpm dev
# or
npm run dev
```

## Development

### Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm preview` - Preview production build
- `pnpm lint` - Run ESLint & Stylelint with strict rules
- `pnpm lint:fix` - Fix ESLint & Stylelint issues automatically
- `pnpm typecheck` - Run TypeScript type checking

### Project Structure

```
./
├── src/
│   ├── components/     # Reusable Vue components
│   ├── composables/    # Vue Composition API functions
│   ├── layouts/        # Quasar layouts
│   ├── pages/          # Application pages/routes
│   ├── services/       # API services and types
│   ├── interfaces/     # TypeScript interfaces
│   └── boot/          # Quasar boot files (axios, etc.)
├── docs/              # API and project documentation
├── public/            # Static assets
└── quasar.config.ts   # Quasar configuration
```

## WordPress Integration

The project integrates with WordPress REST API v3 for content consumption. All
content management is done through WordPress using the TMD plugin's custom
endpoints.

### API Endpoints

**API Usage Summary (Refer to `docs/api.md` for full details):**

*   **Local Development**: Primarily uses `/tmd/v3/` namespace for all custom content types (Events, DJs, Teachers, Event Series).
    *   Example: `GET http://localhost:10014/wp-json/tmd/v3/events`
*   **Production**:
    *   Events: Uses `/tmd/v2/` namespace.
        *   Example: `GET https://www.tangomarathons.com/wp-json/tmd/v2/events`
    *   DJs, Teachers, Event Series: Uses `/tmd/v3/` namespace and standard WordPress `/wp/v2/` API.
        *   Example (DJ): `GET https://www.tangomarathons.com/wp-json/tmd/v3/djs`
        *   Example (WordPress Core for DJs): `GET https://www.tangomarathons.com/wp-json/wp/v2/tmd_dj`

### Custom Post Types

- `tmd_event` - Events and festivals
  - Marathons with comprehensive metadata
  - Festivals with DJ lineups
  - Registration and pricing information
- `tmd_dj` - DJ profiles
  - Activity tracking (marathons, festivals, encuentros, milongas)
  - Experience timelines and statistics
  - Linked events and performance history
- `tmd_teacher` - Teacher profiles
- `tmd_event_series` - Series of related events

### DJ-Event Relationships

The API provides bidirectional relationships:

- DJs have embedded related events (`?_embed`)
- Events link back to their DJs
- Performance statistics calculated from relationships

### Authentication (Future Implementation)

Authentication for write operations or accessing protected content will be handled via JWT (JSON Web Tokens). These tokens are intended to be sourced from a dedicated GraphQL endpoint. Specific details of this endpoint and the authentication flow will be documented as the feature is implemented.

## Performance

- **Optimized API Calls**: Request debouncing and cancellation
- **Efficient Data Loading**: Server-side pagination and filtering
- **TypeScript Safety**: Strict null checks and proper error handling
- **Responsive Design**: Mobile-first with touch optimization
- **Smart Caching**: Reduced API payloads with essential fields only
- **Loading States**: Visual feedback with Quasar spinners and skeletons

## Todo

### Completed ✅

- [x] DJ profiles with comprehensive metadata and activity tracking
- [x] DJ-Event relationships with embedded data and performance statistics
- [x] Advanced filtering and search with server-side optimization
- [x] Mobile-first responsive design with touch optimization
- [x] TypeScript integration with strict mode and ESLint compliance
- [x] API documentation with v3 endpoints and relationship examples

### Current Priorities

- [ ] Teacher profiles and teacher-event relationships
- [ ] Event series management and linking
- [ ] Enhanced event filtering (by DJ, date ranges, categories)
- [ ] User authentication and personalized features
- [ ] Advanced caching strategy and offline support

### Future Enhancements

- [ ] PWA support with service workers
- [ ] Internationalization (i18n) support
- [ ] Analytics and performance monitoring
- [ ] CI/CD pipeline setup
- [ ] Comprehensive testing suite
- [ ] SEO optimization and meta tags

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

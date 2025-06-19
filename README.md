# TMD Quasar Frontend

A modern, mobile-first frontend application for the Tango Marathons website,
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
- **API Integration**: WordPress REST API v3 (TMD custom endpoints)
- **Performance**: Request debouncing, caching, lazy loading

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

   - Local development: `http://localhost:10014/wp-json/tmd/v3`
   - Production: `https://www.tangomarathons.com/wp-json/tmd/v2`

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
- `pnpm lint` - Run ESLint with strict rules
- `pnpm lint:fix` - Fix ESLint issues automatically

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

**TMD v3 API (Local Development)**:

- `/tmd/v3/events` - Event listings with advanced filtering
- `/tmd/v3/djs` - DJ profiles with embedded events
- `/tmd/v3/teachers` - Teacher profiles
- `/tmd/v3/event-series` - Event series management

**TMD v2 API (Production)**:

- `/tmd/v2/events` - Production event listings

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

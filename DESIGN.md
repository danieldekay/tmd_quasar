# Tango Marathons Vue.js Project Design Document

## 1. Project Overview

The Tango Marathons project is a Vue.js-based frontend application that operates as a modern, performant web application. It functions in a headless manner where:

- WordPress serves as the Content Management System (CMS) and backend, handling all content editing and management.
- The Vue.js application provides the frontend interface, consuming data via the WordPress REST API.
- The Vue.js frontend code is integrated within the WordPress `wp-content/` directory, allowing WordPress to serve the Vue application as its active theme or via a plugin.

## 2. Technical Stack

- **Frontend Framework**: Vue.js 3.x with TypeScript
- **UI Framework**: Quasar Framework (replaced Vuetify)
- **State Management**: Pinia
- **Router**: Vue Router
- **Icons**: Material Design Icons
- **CMS**: WordPress (Headless)
- **Build Tool**: Vite
- **Package Manager**: pnpm
- **Code Quality**: ESLint + Stylelint
- **Type Checking**: TypeScript
- **API Integration**: WordPress REST API at `/wp-json/tmd/v3` (all endpoints use this base)
- **Date Formatting**: All dates are displayed in ISO format (`YYYY-MM-DD`) everywhere in the app for consistency and internationalization.
- **Linting Rules**: Strict TypeScript and ESLint rules, including no floating promises (`@typescript-eslint/no-floating-promises`), and consistent use of the `void` operator or error handling for all Promises.
- **User Preferences**: Cookie-based persistence for filters and user preferences with 30-day expiry
- **Pagination**: Server-side pagination with proper metadata handling

## 3. Architecture

### 3.1 Frontend Structure

```
./
├── src/
│   ├── components/      # Reusable Vue components
│   ├── composables/     # Vue 3 composables for shared logic
│   │   ├── useFormatters.ts    # Date/location formatting & color-coded categories
│   │   └── useEventFilters.ts  # Filter state management with cookie persistence
│   ├── interfaces/      # TypeScript interfaces
│   ├── layouts/         # Page layouts
│   ├── pages/           # Route components
│   │   ├── EventList.vue       # Enhanced with filters, pagination & color coding
│   │   ├── EventDetails.vue    # Pull-to-refresh enabled
│   │   └── EventsPage.vue      # Card-based overview
│   ├── services/        # API services and data transformation
│   │   ├── eventListService.ts # Server-side pagination support
│   │   └── types.ts            # Service type definitions
│   ├── router/          # Vue Router configuration
│   ├── assets/          # Static assets (images, fonts, etc.)
│   ├── css/             # Global styles and Quasar variables
│   ├── boot/            # Quasar boot files
│   ├── App.vue          # Root component
│   └── main.ts          # Application entry point
├── docs/                # Project documentation
│   └── event-categories.md    # Color coding system documentation
├── public/              # Public static assets
├── vite.config.ts       # Vite configuration
└── tsconfig.json        # TypeScript configuration
```

### 3.2 WordPress Integration

- WordPress REST API integration for content consumption
- Read-only access to WordPress content
- Authentication for protected API endpoints
- **Base URL for API:** `/wp-json/tmd/v3` (development and production)
- **Server-side pagination** with proper WordPress header parsing (`x-wp-total`, `x-wp-totalpages`)
- **Advanced filtering** support for date ranges, countries, and search queries

### 3.3 Data Storage & Assets

- **`public/`**: Contains static assets that are served directly
- **`src/assets/`**: Contains assets that are processed by Vite
- **`wp-content/`**: Contains the WordPress theme/plugin code for serving the Vue.js frontend
- **Browser Cookies**: User filter preferences stored with 30-day expiry for persistence

### 3.4 Enhanced Event Management Features

#### 3.4.1 Color-Coded Event Categories

The application features a comprehensive color-coding system for event categories:

- **Marathons**: Red colors with running icons
- **Festivals**: Purple colors with celebration icons
- **Encuentros**: Blue colors with groups icons
- **Weekends**: Green colors with weekend icons
- **Workshops/Education**: Orange colors with school/star icons
- **Competitions**: Amber colors with trophy icons
- **Social Events**: Teal colors with music/people icons
- **Special Occasions**: Various colors (indigo, pink, deep purple) with themed icons
- **Default**: Grey for unknown categories

#### 3.4.2 Advanced Filtering System

- **Search**: Full-text search across event titles, cities, and countries
- **Country Filter**: Dropdown with country name mapping and internationalization
- **Date Ranges**: Separate filters for event dates and registration dates
- **Quick Filters**: "Next 9 months" and "Next 4 months" shortcuts
- **Past Events Toggle**: Option to include or exclude past events
- **Filter Persistence**: All filter states saved to cookies automatically

#### 3.4.3 Server-Side Pagination

- **Table Pagination**: Proper server-side pagination with sorting
- **Mobile Pagination**: Clean pagination component for card views
- **Results Display**: "X events found (Page Y of Z)" with real-time counts
- **Efficient Loading**: Only fetches data needed for current page
- **Sort Persistence**: Table sorting preferences saved to cookies

### 3.5 Available Quasar Components

The project utilizes Quasar's comprehensive component library with enhanced implementations:

#### Layout Components

- QLayout, QPage, QHeader, QFooter, QDrawer, QPageContainer
- QPullToRefresh (implemented on EventList and EventDetails)

#### Form Components

- QInput (with debounced search), QSelect (with country mapping), QCheckbox, QRadio, QToggle, QDate (with range support), QTime, QFile

#### Data Display

- QTable (with server-side pagination), QCard (with color-coded chips), QList, QTimeline, QTree, QMarkupTable
- QChip (with dynamic color coding and icons)
- QPagination (with proper server-side integration)

#### Navigation

- QTabs, QBreadcrumbs, QMenu, QPagination, QStepper

#### Feedback & Loading

- QSpinner, QDialog, QNotify (with success/error states), QLoading, QInnerLoading
- QBanner (for error states)

#### Utility Components

- QBtn (with loading states), QIcon (with category-specific icons), QBadge, QTooltip, QSeparator, QSpace

#### Advanced Features

- VirtualScroll, InfiniteScroll, Intersection, TouchSwipe, QParallax
- QSlideTransition (for collapsible mobile filters)

## 4. Design Principles

### 4.1 Modern Design

- Clean, minimalist interface using Quasar components
- **Color-coded visual hierarchy** for event categories
- Dark mode support with system preference detection
- Micro-interactions and subtle animations
- Material Design principles
- High contrast and accessibility
- Responsive typography
- Modern color palette with dynamic theming
- **Consistent visual language** across all event representations

### 4.2 Mobile-First Approach

- Progressive enhancement
- Touch-first interactions
- **Collapsible filter panels** on mobile devices
- Responsive breakpoints:
  - Mobile: < 640px (Card view with pagination)
  - Tablet: 640px - 1024px (Responsive table)
  - Desktop: > 1024px (Full table with advanced features)
- Optimized touch targets
- **Pull-to-refresh** functionality on mobile
- Reduced motion options

### 4.3 Main Navigation

- **Header Navigation Items:** Marathons, Festivals, Encuentros, DJs, Teachers
- **Footer Navigation Items:** About, Contact, Privacy Policy, Sitemap (for SEO)
- **Enhanced Event List**: Advanced filtering and search capabilities
- **Breadcrumb Navigation**: Clear page hierarchy

### 4.4 Data Handling & Performance

- **Server-side pagination** for optimal performance
- Virtual scrolling for long lists
- **Efficient API requests** with proper parameter handling
- Lazy loading of images and components
- Data caching strategies:
  - Service Worker for offline support
  - **Cookie-based filter persistence**
  - Local storage for frequently accessed data
- Optimized API requests:
  - Request batching
  - Data prefetching
  - **Debounced search queries**
  - Query optimization
- Progressive loading of content
- **Cache busting** for force refresh operations

### 4.5 User Experience

- **Persistent user preferences** via cookies
- Intuitive navigation using Quasar components
- **Color-coded visual cues** for quick event identification
- Clear information hierarchy
- Fast initial load times
- Smooth transitions
- Error boundaries and fallbacks
- **Enhanced loading states** with spinners and progress indicators
- **Advanced search** with filters and sorting
- Keyboard navigation support
- **Pull-to-refresh** for manual data updates
- **Real-time filter feedback** with immediate results

## 5. Content Types (WordPress)

- Custom Post Types
  - `tmd_event` - Events and festivals
    - **Color-coded Marathons** (Red theme)
    - **Color-coded Festivals** (Purple theme)
    - **Color-coded Encuentros** (Blue theme)
    - **Enhanced filtering** by date, location, and category
  - `tmd_event_series` - Series of related events
  - `tmd_teacher` - Individual teachers
  - `tmd_teacher_couple` - Teaching couples
  - `tmd_dj` - DJ profiles
- Standard WordPress Content
  - Posts (Blog content)
    - News and updates
    - Event announcements
    - Community content
  - Pages
    - Static content
    - Information pages
    - About and contact pages

## 6. Configuration

### 6.1 Environment Variables

Required environment variables:

- `VITE_WP_API_URL` - WordPress REST API URL (should point to `/wp-json/tmd/v3`)
- `VITE_WP_USERNAME` - WordPress API username
- `VITE_WP_PASSWORD` - WordPress API password

### 6.2 Development Configuration

- Port: 3000 (development)
- Host: localhost
- Target: Client-side rendering with SSR support
- **Cookie Settings**: 30-day expiry for filter persistence
- **API Pagination**: Default 20 items per page with configurable options

### 6.3 Filter Persistence Configuration

- **Cookie Name**: `tmd_event_filters`
- **Expiry**: 30 days
- **Scope**: Path `/`, SameSite Strict
- **Stored Data**: Search query, country selection, date ranges, past events toggle, sorting preferences, rows per page

## 7. Development Workflow

### 7.1 Available Scripts

- `pnpm dev`: Development server
- `pnpm build`: Production build
- `pnpm preview`: Preview production build
- `pnpm lint`: Code linting (strict ESLint rules, including floating promises)
- `pnpm typecheck`: TypeScript type checking

### 7.2 Code Quality

- ESLint for JavaScript/TypeScript (strict, including floating promises)
- Stylelint for CSS/SCSS
- TypeScript for type safety
- **Comprehensive type definitions** for API responses and UI components
- Git hooks for pre-commit checks
- **Automated testing** for composables and services

### 7.3 Component Development

- **Composable-first architecture** for shared logic
- **Reactive state management** with Vue 3 Composition API
- **Type-safe API services** with proper error handling
- **Reusable utility functions** for formatting and data transformation

## 8. Performance Optimization

- **Server-side pagination** reducing client-side data processing
- Code splitting
- Lazy loading
- Image optimization
- **Debounced user inputs** to reduce API calls
- **Efficient cookie management** for user preferences
- Caching strategies
- Bundle size optimization
- Critical CSS extraction
- Resource hints (preload, prefetch)
- Compression and minification
- **Optimized API requests** with proper parameter handling

## 9. Security Considerations

- WordPress API authentication
- Environment variable protection
- API credentials management
- CORS configuration
- Content Security Policy
- XSS protection
- CSRF protection
- **Secure cookie handling** with SameSite and expiry settings
- **Input sanitization** for search and filter parameters

## 10. Enhanced Features Implemented

### 10.1 Event Category Color Coding

- **Comprehensive color system** with 40+ category mappings
- **Smart category matching** with exact and partial matching
- **Icon integration** with category-specific Material Design icons
- **Consistent application** across mobile cards and desktop tables
- **Fallback handling** for unknown categories

### 10.2 Advanced Filter Management

- **Cookie-based persistence** for all user preferences
- **Reactive filter state** with immediate UI updates
- **Quick filter shortcuts** for common date ranges
- **Mobile-optimized** collapsible filter interface
- **Desktop-optimized** expanded filter layout
- **Filter state indicators** showing active filter counts

### 10.3 Server-Side Pagination

- **WordPress REST API integration** with proper header parsing
- **Efficient data loading** with configurable page sizes
- **Responsive pagination** for different screen sizes
- **Sort persistence** across page reloads
- **Real-time result counts** with pagination metadata

### 10.4 Enhanced User Interface

- **Pull-to-refresh** functionality on mobile devices
- **Loading states** with spinners and progress indicators
- **Error handling** with user-friendly notifications
- **Responsive design** with mobile-first approach
- **Accessibility improvements** with proper ARIA labels and keyboard navigation

## 11. Future Considerations

- Enhanced caching strategies
- Improved error handling
- Additional content type support
- **Advanced analytics** for filter usage and user behavior
- WordPress webhook integration
- AI-powered content recommendations
- **Enhanced search** with fuzzy matching and suggestions
- Progressive Web App (PWA) features
- **Internationalization** support for multiple languages
- **Advanced filtering** with more criteria and operators
- **Export functionality** for filtered event lists
- **Social sharing** integration for events
- **Calendar integration** for event scheduling

# Architecture & Design

This document outlines the technical architecture and design decisions for the TMD Quasar Frontend project.

## 1. Project Overview

The Tango Marathons project is a Vue.js-based frontend application that operates as a modern, performant web application in a headless architecture:

- **WordPress** serves as the Content Management System (CMS) and backend, handling all content editing and management
- **Vue.js application** provides the frontend interface, consuming data via the WordPress REST API
- **Quasar Framework** provides the UI components and build tooling

## 2. Technical Stack

### Core Technologies

- **Frontend Framework**: Vue.js 3.x with TypeScript
- **UI Framework**: Quasar Framework (Material Design)
- **State Management**: Pinia (for complex state) + Composition API (for component state)
- **Router**: Vue Router
- **Icons**: Material Design Icons
- **Build Tool**: Vite
- **Package Manager**: pnpm

### Development & Quality Tools

- **Language**: TypeScript with strict mode
- **Code Quality**: ESLint + Prettier with strict rules
- **Type Checking**: TypeScript with strict null checks
- **API Integration**: WordPress REST API at `/wp-json/tmd/v3`
- **Linting Rules**: Strict TypeScript and ESLint rules, including no floating promises

### Standards & Conventions

- **Date Formatting**: All dates in ISO format (`YYYY-MM-DD`) for consistency and internationalization
- **User Preferences**: Cookie-based persistence for filters and user preferences with 30-day expiry
- **Pagination**: Server-side pagination with proper metadata handling
- **Error Handling**: Comprehensive error handling with user-friendly messages

## 3. Architecture

### 3.1 Frontend Structure

```
src/
├── components/      # Reusable Vue components
│   ├── events/     # Event-related components
│   ├── djs/        # DJ-related components
│   └── common/     # Shared UI components
├── composables/     # Vue 3 composables for shared logic
│   ├── useFormatters.ts    # Date/location formatting & color-coded categories
│   ├── useEventFilters.ts  # Filter state management with cookie persistence
│   └── useApiService.ts    # API service abstractions
├── interfaces/      # TypeScript interfaces
│   ├── api/        # API response types
│   ├── events/     # Event-related types
│   └── common/     # Shared types
├── layouts/         # Page layouts
│   ├── MainLayout.vue      # Primary application layout
│   └── BlankLayout.vue     # Minimal layout for special pages
├── pages/           # Route components
│   ├── EventList.vue       # Enhanced with filters, pagination & color coding
│   ├── EventDetails.vue    # Pull-to-refresh enabled
│   ├── DJProfile.vue       # DJ profile with activity tracking
│   └── HomePage.vue        # Landing page
├── services/        # API services and data transformation
│   ├── BaseService.ts      # HAL-compliant base service
│   ├── eventListService.ts # Event listing with filtering
│   ├── djService.ts        # DJ profiles and relationships
│   └── types.ts            # Service type definitions
├── router/          # Vue Router configuration
├── assets/          # Static assets (images, fonts, etc.)
└── boot/           # Quasar boot files (axios, plugins, etc.)
```

### 3.2 Component Architecture

#### Reusable Components

- **Event Components**: `EventCard`, `EventList`, `EventFilters`
- **DJ Components**: `DJCard`, `DJProfile`, `DJActivityTimeline`
- **Common Components**: `LoadingSpinner`, `ErrorMessage`, `SkeletonLoader`

#### Layout System

- **MainLayout**: Standard layout with navigation, header, and footer
- **BlankLayout**: Minimal layout for login, error pages, etc.

### 3.3 Service Layer Architecture

#### BaseService (HAL-Compliant)

All API services extend `BaseService` which provides:

- **HAL Response Support**: Automatic `_embedded` data extraction
- **Flexible Pagination**: Works with both v2 headers and v3 body metadata
- **Error Handling**: Standardized error processing
- **Request Management**: Automatic request cancellation and retries

#### Service Hierarchy

```typescript
BaseService
├── EventListService    # Event listing and filtering
├── DJService          # DJ profiles and relationships
├── TeacherService     # Teacher profiles
├── EventDetailsService # Single event details
└── EventSeriesService # Event series management
```

## 4. Design Principles

### 4.1 Mobile-First Approach

- **Responsive Design**: All components designed for mobile first, enhanced for desktop
- **Touch Interactions**: Optimized for touch interfaces with appropriate touch targets
- **Performance**: Optimized for mobile networks with efficient data loading

### 4.2 Performance Optimization

- **Lazy Loading**: Components and routes loaded on demand
- **Image Optimization**: Automatic image compression and responsive images
- **API Efficiency**: Request debouncing, caching, and selective data loading
- **Bundle Optimization**: Code splitting and tree shaking

### 4.3 User Experience

- **Dark Mode Support**: System preference detection with manual override
- **Filter Persistence**: User preferences saved in cookies
- **Loading States**: Skeleton screens and loading indicators
- **Error Handling**: User-friendly error messages with recovery options

### 4.4 Code Quality

- **TypeScript Strict Mode**: Full type safety with strict null checks
- **ESLint Rules**: Strict linting including floating promise detection
- **Component Testing**: Unit tests for critical components
- **API Integration Testing**: Service layer testing with mock data

## 5. Content Types (WordPress)

### 5.1 Custom Post Types

- **`tmd_event`** - Events and festivals
  - Marathons with comprehensive metadata
  - Festivals with DJ lineups
  - Registration and pricing information

- **`tmd_dj`** - DJ profiles
  - Activity tracking (marathons, festivals, encuentros, milongas)
  - Experience timelines and statistics
  - Linked events and performance history

- **`tmd_teacher`** - Teacher profiles
  - Teaching specializations and experience
  - Workshop and class information

- **`tmd_event_series`** - Series of related events
  - Annual marathons and recurring events

### 5.2 Meta Fields

Key meta fields used throughout the application:

- **Events**: `event_start_date`, `event_end_date`, `event_country`, `event_city`, `event_price`
- **DJs**: `activity_marathons`, `activity_festivals`, `experience_years`, `country`
- **Teachers**: `teaching_specializations`, `experience_years`, `country`

## 6. Configuration

### 6.1 Environment Variables

Required environment variables:

```env
VITE_WP_API_URL=http://localhost:10014/wp-json/tmd/v3
VITE_WP_USERNAME=your_username
VITE_WP_PASSWORD=your_password
```

### 6.2 Development Configuration

- **Port**: 9000 (development) - Quasar default
- **Host**: localhost
- **Target**: Client-side rendering with SSR support
- **Cookie Settings**: 30-day expiry for filter persistence
- **API Pagination**: Default 20 items per page with configurable options

### 6.3 Filter Persistence Configuration

- **Cookie Name**: `tmd_event_filters`
- **Expiry**: 30 days
- **Scope**: Path `/`, SameSite Strict
- **Stored Data**: Search query, country selection, date ranges, past events toggle, sorting preferences, rows per page

## 7. Development Workflow

### 7.1 Available Scripts

- `pnpm dev`: Development server with hot reload
- `pnpm build`: Production build with optimization
- `pnpm preview`: Preview production build locally
- `pnpm lint`: Code linting with strict ESLint rules
- `pnpm typecheck`: TypeScript type checking

### 7.2 Code Quality Standards

- **ESLint**: Strict JavaScript/TypeScript linting including floating promises
- **Prettier**: Consistent code formatting
- **TypeScript**: Comprehensive type definitions for API responses and UI components
- **Git Hooks**: Pre-commit checks for code quality
- **Automated Testing**: Unit tests for composables and services

### 7.3 Component Development Standards

- **Composable-First Architecture**: Shared logic extracted to composables
- **Reactive State Management**: Vue 3 Composition API for state
- **Type-Safe API Services**: Proper error handling and type definitions
- **Reusable Utility Functions**: Formatting and data transformation utilities

## 8. Performance Optimization

### 8.1 Frontend Optimizations

- **Code Splitting**: Route-based and component-based splitting
- **Tree Shaking**: Unused code elimination
- **Image Optimization**: WebP format with fallbacks
- **CSS Optimization**: Critical CSS inlining and unused CSS removal

### 8.2 API Optimizations

- **Request Debouncing**: Search and filter input debouncing
- **Caching Strategy**: Response caching with TTL
- **Selective Loading**: Only load required meta fields
- **Pagination**: Efficient server-side pagination

## 9. Security Considerations

### 9.1 Frontend Security

- **XSS Prevention**: Proper template escaping and sanitization
- **CSRF Protection**: SameSite cookie configuration
- **Content Security Policy**: Restrictive CSP headers
- **Dependency Security**: Regular security audits

### 9.2 API Security

- **Authentication**: WordPress user authentication where required
- **Rate Limiting**: API request rate limiting
- **Input Validation**: Server-side validation of all inputs
- **CORS Configuration**: Proper cross-origin resource sharing setup

## 10. Future Considerations

### Technical Roadmap

- **Enhanced Caching Strategies**: Advanced client-side caching
- **Progressive Web App (PWA)**: Service workers and offline support
- **Internationalization (i18n)**: Multi-language support
- **Advanced Analytics**: User behavior tracking and insights
- **AI-Powered Features**: Content recommendations and smart filtering

### Scalability Planning

- **Microservices Architecture**: Service separation for better scalability
- **CDN Integration**: Global content delivery network
- **Database Optimization**: Query optimization and indexing
- **Monitoring & Alerting**: Application performance monitoring

---

**Related Documentation:**
- [API Documentation](API-Documentation) - Detailed API integration guide
- [Development Guide](Development-Guide) - Development workflow and best practices
- [Getting Started](Getting-Started) - Setup and installation guide
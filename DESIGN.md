# Tango Marathons Vue.js Project Design Document

## 1. Project Overview

The Tango Marathons project is a Vue.js-based frontend application that operates as a modern, performant web application. It functions in a headless manner where:

- WordPress serves as the Content Management System (CMS) and backend, handling all content editing and management.
- The Vue.js application provides the frontend interface, consuming data via the WordPress REST API.
- The Vue.js frontend code is integrated within the WordPress `wp-content/` directory, allowing WordPress to serve the Vue application as its active theme or via a plugin.

## 2. Technical Stack

- **Frontend Framework**: Vue.js 3.x with TypeScript
- **UI Framework**: Quasar Framework
- **State Management**: Pinia
- **Router**: Vue Router
- **Icons**: Material Design Icons
- **CMS**: WordPress (Headless)
- **Build Tool**: Vite
- **Package Manager**: pnpm
- **Code Quality**: ESLint + Stylelint
- **Type Checking**: TypeScript

## 3. Architecture

### 3.1 Frontend Structure

```
./
├── src/
│   ├── @core/           # Core functionality and utilities
│   ├── @layouts/        # Layout components
│   ├── assets/          # Static assets (images, fonts, etc.)
│   ├── components/      # Reusable Vue components
│   ├── layouts/         # Page layouts
│   ├── pages/           # Route components
│   ├── plugins/         # Vue plugins
│   ├── utils/           # Utility functions
│   ├── views/           # View components
│   ├── App.vue          # Root component
│   └── main.ts          # Application entry point
├── public/              # Public static assets
├── vite.config.ts       # Vite configuration
└── tsconfig.json        # TypeScript configuration
```

### 3.2 WordPress Integration

- WordPress REST API integration for content consumption
- Read-only access to WordPress content
- Authentication for protected API endpoints
- Base URL configuration for development and production environments

### 3.3 Data Storage & Assets

- **`public/`**: Contains static assets that are served directly
- **`src/assets/`**: Contains assets that are processed by Vite
- **`wp-content/`**: Contains the WordPress theme/plugin code for serving the Vue.js frontend

## 4. Design Principles

### 4.1 Modern Design

- Clean, minimalist interface using Quasar components
- Dark mode support with system preference detection
- Micro-interactions and subtle animations
- Material Design principles
- High contrast and accessibility
- Responsive typography
- Modern color palette with dynamic theming

### 4.2 Mobile-First Approach

- Progressive enhancement
- Touch-first interactions
- Responsive breakpoints:
  - Mobile: < 640px
  - Tablet: 640px - 1024px
  - Desktop: > 1024px
- Optimized touch targets
- Mobile-optimized navigation
- Reduced motion options

### 4.3 Main Navigation

- **Header Navigation Items:** Marathons, Festivals, Encuentros, DJs, Teachers
- **Footer Navigation Items:** About, Contact, Privacy Policy, Sitemap (for SEO)

### 4.4 Data Handling & Performance

- Virtual scrolling for long lists
- Infinite scroll with pagination
- Lazy loading of images and components
- Data caching strategies:
  - Service Worker for offline support
  - Local storage for frequently accessed data
- Optimized API requests:
  - Request batching
  - Data prefetching
  - Query optimization
- Progressive loading of content

### 4.5 User Experience

- Intuitive navigation using Quasar components
- Clear information hierarchy
- Fast initial load times
- Smooth transitions
- Error boundaries and fallbacks
- Loading states and skeletons
- Search with filters and sorting
- Keyboard navigation support

## 5. Content Types (WordPress)

- Custom Post Types
  - `tmd_event` - Events and festivals
    - Marathons
    - Festivals
    - Future events
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

- `VITE_WP_API_URL` - WordPress REST API URL
- `VITE_WP_USERNAME` - WordPress API username
- `VITE_WP_PASSWORD` - WordPress API password

### 6.2 Development Configuration

- Port: 3000 (development)
- Host: localhost
- Target: Client-side rendering with SSR support

## 7. Development Workflow

### 7.1 Available Scripts

- `pnpm dev`: Development server
- `pnpm build`: Production build
- `pnpm preview`: Preview production build
- `pnpm lint`: Code linting
- `pnpm typecheck`: TypeScript type checking

### 7.2 Code Quality

- ESLint for JavaScript/TypeScript
- Stylelint for CSS/SCSS
- TypeScript for type safety
- Git hooks for pre-commit checks

## 8. Performance Optimization

- Code splitting
- Lazy loading
- Image optimization
- Caching strategies
- Bundle size optimization
- Critical CSS extraction
- Resource hints (preload, prefetch)
- Compression and minification

## 9. Security Considerations

- WordPress API authentication
- Environment variable protection
- API credentials management
- CORS configuration
- Content Security Policy
- XSS protection
- CSRF protection

## 10. Future Considerations

- Enhanced caching strategies
- Improved error handling
- Additional content type support
- Enhanced search functionality
- WordPress webhook integration
- AI-powered content recommendations
- Advanced analytics integration
- Progressive Web App (PWA) features
- Internationalization support

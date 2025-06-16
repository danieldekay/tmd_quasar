# Tango Marathons Nuxt Project

A modern, mobile-first frontend application for the Tango Marathons website, built with Nuxt.js and WordPress as a headless CMS, **integrated as a WordPress theme or plugin.**

## Overview

This project implements a headless WordPress architecture where:

- WordPress serves as the Content Management System (CMS) and backend, handling all content editing and management.
- The Nuxt.js application provides the modern, performant frontend interface, consuming data via the WordPress REST API.
- **The compiled Nuxt frontend code is designed to be deployed and integrated within the WordPress `wp-content/` directory, functioning as an active WordPress theme or loaded via a plugin.** This allows WordPress to serve the Nuxt application directly.

## Features

- Modern, responsive frontend for existing WordPress content
- Mobile-first design with touch-optimized interactions
- Dark mode support with system preference detection
- Event listings with virtual scrolling and filtering
- Calendar integration for events
- DJ and teacher profiles
- Festival and marathon listings
- Blog posts and news content
- WordPress pages and static content
- Performance optimized for large datasets

## Tech Stack

- **Frontend Framework**: Nuxt.js 3.x
- **UI Framework**: Vuetify 3.x
- **Icons**: Material Design Icons
- **Calendar Component**: vue-simple-calendar
- **Code Quality**: ESLint + Prettier
- **Git Hooks**: Husky
- **Performance**: Service Workers, Caching, Lazy Loading

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- WordPress installation with REST API enabled
- WordPress content already set up and managed
- **A WordPress theme or plugin structure within `wp-content/` capable of booting the Nuxt application.**

## Quick Start

1. Clone the repository:

```bash
git clone [repository-url]
cd tmd_nuxt
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Create environment file:

```bash
cp .env.example .env
```

4. Configure environment variables in `.env`:

```
WP_APPLICATION_USERNAME=your_username  # For protected API endpoints
WP_APPLICATION_PASSWORD=your_password  # For protected API endpoints
API_URL=your_wordpress_api_url        # WordPress REST API URL
```

5. Start development server:

```bash
npm run dev
# or
yarn dev
```

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run generate` - Generate static site
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

### Project Structure

```
./
├── assets/         # Uncompiled assets (e.g., global CSS, images, fonts)
├── components/     # Reusable Vue components (auto-imported)
├── composables/    # Vue Composition API functions for reusable logic
├── layouts/        # Application layouts (e.g., default, error)
├── middleware/     # Nuxt middleware functions
├── pages/          # Application views and routes (file-system based routing)
├── plugins/        # Vue plugins to run before the root app
├── static/         # Static files served directly (e.g., favicon.ico)
├── types/          # TypeScript type definitions
├── wp-content/     # WordPress theme/plugin code for Nuxt integration
└── ... (other root-level config files)
```

## WordPress Integration

The project integrates with WordPress REST API for content consumption. All content management is done through WordPress. **Crucially, the compiled Nuxt.js frontend is designed to be built and placed within a WordPress theme or plugin inside the `wp-content/` directory.** This setup enables WordPress to load and display the Nuxt.js application dynamically.

### Custom Post Types

- `tmd_event` - Events and festivals
  - Marathons
  - Festivals
  - Future events
- `tmd_event_series` - Series of related events
- `tmd_teacher` - Individual teachers
- `tmd_teacher_couple` - Teaching couples
- `tmd_dj` - DJ profiles

### Standard WordPress Content

- Posts and blog content
  - News and updates
  - Event announcements
  - Community content
- Pages and static content
  - Information pages
  - About and contact pages

## Performance

- Server-Side Rendering (SSR) for improved initial load
- Static site generation for static content
- Image optimization and WebP support
- Code splitting and lazy loading
- Service Worker for offline support
- API response caching
- Virtual scrolling for long lists

## Todo

- [ ] Implement proper error handling and loading states
- [ ] Add comprehensive form validation
- [ ] Implement user authentication and authorization
- [ ] Add unit and integration tests
- [ ] Set up CI/CD pipeline
- [ ] Add documentation for WordPress integration
- [ ] Implement proper SEO optimization
- [ ] Add analytics tracking
- [ ] Implement proper caching strategy
- [ ] Add proper logging and monitoring

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

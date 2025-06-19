# Tango Marathons Project TODO List

## Immediate Priorities

### Core Infrastructure

- [x] Set up proper environment variable management
  - [x] Create .env.example
  - [x] Document required variables
- [x] Configure build and development tools
  - [x] Set up ESLint with Vue/Nuxt rules
  - [x] Configure Prettier
  - [x] Add pre-commit hooks (Husky)
  - [x] Add TypeScript support to ESLint
- [x] Set up Quasar integration (replaced Vuetify)
  - [x] Install and configure Quasar
  - [x] Set up Material Design Icons
  - [x] Configure theme system
- [x] Set up routing
- [x] Implement API integration (using `/wp-json/tmd/v3`)

### Performance & Data Handling

- [x] Implement data fetching strategy
  - [x] Set up API composables/services
  - [x] Configure request caching (basic)
  - [x] Fix API data field mapping issues
  - [ ] Implement error retry logic
- [x] Add data loading states
  - [x] Quasar skeleton loaders/spinners
  - [x] Progress indicators
  - [x] Empty states
- [x] Optimize image handling
  - [x] Set up image optimization
  - [x] Implement lazy loading
  - [x] Add WebP support

### Mobile-First Implementation

- [x] Set up responsive breakpoints with Quasar
  - [x] Mobile (< 640px)
  - [x] Tablet (640px - 1024px)
  - [x] Desktop (> 1024px)
- [x] Implement mobile navigation
  - [x] Quasar navigation drawer
  - [x] Touch-friendly interactions
  - [x] Smooth transitions
- [x] Optimize touch targets
  - [x] Minimum 44x44px touch areas
  - [x] Adequate spacing
  - [x] Clear visual feedback
- [x] Implement mobile-first content ordering
  - [x] Quick info/summary boxes appear first on mobile
  - [x] Detailed content follows on mobile
  - [x] Maintain desktop layout preference

## High Priority Features

### Content Display

- [x] Implement event listing page
  - [x] Quasar data tables
  - [x] Filtering and sorting
  - [x] Search functionality
- [x] Create event detail pages
  - [x] Rich content display
  - [x] Related events (basic)
  - [x] Map integration
- [x] **DJ profiles and management**
  - [x] Complete DJ detail pages with tabbed interface
  - [x] DJ activity tracking and experience timelines
  - [x] DJ-Event relationships with embedded data
  - [x] Performance statistics and event history
  - [x] Advanced DJ filtering and search optimization
- [ ] Set up blog post listing
  - [ ] Infinite scroll
  - [ ] Category filtering
  - [ ] Featured posts

### User Experience

- [x] Add dark mode support
  - [x] Quasar theme switching
  - [x] Persistent preference
  - [x] System preference detection
- [x] Implement loading states
  - [x] Quasar skeleton screens
  - [x] Progress indicators
  - [x] Transition animations
- [ ] Add keyboard navigation
  - [ ] Focus management
  - [ ] Keyboard shortcuts
  - [ ] Skip links

## Medium Priority

### Performance Optimization

- [ ] Implement caching strategy
  - [ ] Service Worker setup
  - [ ] Local storage caching
  - [ ] API response caching
- [ ] Optimize bundle size
  - [ ] Code splitting
  - [ ] Tree shaking
  - [ ] Dynamic imports
- [ ] Add performance monitoring
  - [ ] Core Web Vitals tracking
  - [ ] Error tracking
  - [ ] User behavior analytics

### Documentation

- [x] Create component documentation
  - [x] Quasar component usage
  - [x] Custom component examples
  - [x] Props documentation
- [x] Document API integration
  - [x] Endpoint documentation (using `/wp-json/tmd/v3`)
  - [x] Data structures
  - [x] Error handling
  - [x] **DJ-Event relationships and embedded data**
  - [x] **v3 API endpoints with comprehensive examples**
  - [x] **Response structure documentation**
- [x] Write deployment guide
  - [x] Build process
  - [x] Environment setup
  - [x] Troubleshooting

## Low Priority

### Future Enhancements

- [ ] Add PWA support
- [ ] Implement advanced caching strategies
- [ ] Add internationalization
- [ ] Set up CI/CD pipeline

## Notes

- Focus on mobile-first development with Quasar
- Prioritize performance and user experience
- Regular testing on various devices and screen sizes
- Monitor and optimize Core Web Vitals
- Keep documentation up to date with changes
- Follow Material Design guidelines for consistency
- **All dates in the app are displayed in ISO format (`YYYY-MM-DD`) for consistency and internationalization.**
- **Strict TypeScript and ESLint rules are enforced, including no floating promises and explicit error handling for all Promises.**

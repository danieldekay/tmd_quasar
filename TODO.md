# Tango Marathons Project TODO List

## Phase 1: Tomorrow (Critical Fixes)

### Complete API Integration ⚠️

- [ ] **Finish remaining service updates**
  - [ ] Update `eventDetailsService.ts` for HAL compliance
  - [ ] Update `eventSeriesService.ts` with meta field support
  - [ ] Add proper filtering to event series
- [ ] **Fix remaining API issues** (5 failing tests)
  - [ ] Implement client-side date filtering workaround
  - [ ] Handle complex meta filter edge cases
  - [ ] Improve error handling for failed API calls
- [ ] **Test service integration**
  - [ ] Verify all services work with components
  - [ ] Test error scenarios and offline behavior
  - [ ] Ensure mobile performance is acceptable

### Critical Bug Fixes

- [ ] Fix any blocking TypeScript errors
- [ ] Resolve linting issues if any
- [ ] Test responsive layout on all screen sizes
- [ ] Verify all navigation works correctly

## Phase 2: Next Week (User Authentication & Core Features)

### User Authentication System 🔐

- [ ] **Set up authentication infrastructure**

  - [ ] Choose auth provider (Firebase, Auth0, or WordPress users)
  - [ ] Implement login/register flow
  - [ ] Set up protected routes
  - [ ] Add user profile management

  _Specifications: Implement OAuth-based authentication supporting Google, Facebook, and email/password. User profiles should store basic info (name, email, country, tango experience level), preferences (language, notification settings, privacy settings), and social data (followers, following). Use JWT tokens for session management with automatic refresh. Implement role-based access (user, premium user, admin) for future features. Store user preferences locally with cloud sync._

- [ ] **User state management**

  - [ ] User preferences storage
  - [ ] Authentication state persistence
  - [ ] Profile data caching

  _Specifications: Create a global user state store (Pinia) that persists authentication status, user preferences, and cached profile data across sessions. Implement automatic logout after token expiry, remember-me functionality, and graceful handling of network failures. User preferences should include theme, language, notification preferences, and privacy settings with immediate local storage and background sync to server._

### Core User Features 💙

- [ ] **Like/Favorite system**

  - [ ] Like events functionality
  - [ ] Like DJs functionality
  - [ ] User favorites dashboard
  - [ ] Sync favorites across devices

  _Specifications: Implement heart-icon based liking for events, DJs, and event series. Likes should be instant with optimistic UI updates, background sync, and conflict resolution. Create a favorites dashboard showing recent likes, categorized by type (events, DJs, series), with search and filtering. Support bulk operations (unlike all, export list). Store likes locally for offline viewing and sync when online. Show like counts publicly but keep individual user likes private by default._

- [ ] **Follow system**

  - [ ] Follow DJs
  - [ ] Follow event series
  - [ ] Follow organizers
  - [ ] Notifications for followed entities

  _Specifications: Enable following DJs, event series, and event organizers with customizable notification preferences per entity. Users can choose to be notified about new events, schedule changes, or announcements. Implement follow suggestions based on liked events and location. Create activity feeds showing updates from followed entities. Support unfollowing with undo option. Include follower counts for DJs and series (public) and following lists for users (private by default)._

- [ ] **Personal dashboard**

  - [ ] User's liked events
  - [ ] Followed DJs and series
  - [ ] Recent activity feed
  - [ ] Quick access to preferences

  _Specifications: Create a personalized home screen showing: upcoming events from followed entities, recent activity from followed DJs/series, liked events with quick access to details, recommended events based on user behavior, and quick action buttons (search, calendar, profile). Include widgets for: events happening this weekend, new events in user's country, followed DJs with upcoming gigs. Support customizable layout with drag-and-drop arrangement of dashboard sections._

### Content Completion

- [ ] **Finish content display features**

  - [ ] Complete event detail pages with all meta fields
  - [ ] Teacher and couple detail pages
  - [ ] Event series detail pages with relationship data
  - [ ] Orchestra and brand pages if needed

  _Specifications: Complete all entity detail pages with full meta field display, proper image galleries, embedded relationships, and action buttons (like, follow, share). Event pages should show all meta fields from API including pricing, registration details, venue information, and related entities. Teacher/couple pages should display bio, teaching history, upcoming events, and teaching specializations. Event series pages should show historical events, upcoming dates, and organizer information._

- [ ] **Enhanced search and filtering**

  - [ ] Advanced search with multiple criteria
  - [ ] Saved search preferences
  - [ ] Search history for logged-in users

  _Specifications: Implement advanced search supporting multiple filters: date ranges, countries, event types, DJ names, price ranges, and features (live music, food, etc.). Add saved search functionality where users can name and bookmark frequently used filter combinations. Include search history showing recent searches with one-click re-execution. Support search suggestions based on user's location, followed entities, and past searches. Add voice search on mobile devices._

## Phase 3: Next Months (Advanced Features & Polish)

### Calendar Integration 📅

- [ ] **Event calendar features**

  - [ ] Personal event calendar
  - [ ] Add events to device calendar
  - [ ] Calendar export (ICS format)
  - [ ] Reminder notifications

  _Specifications: Create a personal calendar view showing liked events, followed DJ events, and events user has marked as "going". Support monthly, weekly, and agenda views with event color coding by type. Implement "Add to Calendar" functionality generating ICS files compatible with Google Calendar, Apple Calendar, and Outlook. Include calendar export for all liked events or filtered selections. Support recurring event series with individual event customization._

- [ ] **Advanced reminders**

  - [ ] Pre-event notifications
  - [ ] Registration deadline reminders
  - [ ] Custom reminder settings
  - [ ] Email/push notification options

  _Specifications: Implement customizable reminder system with multiple notification types: registration opening (for events with limited capacity), registration deadline approaching, event starting soon (1 week, 3 days, 1 day), and travel booking reminders (for international events). Support both push notifications and email delivery with user preference controls. Allow custom reminder timing (e.g., 2 weeks before for international events). Include smart suggestions for reminder timing based on event location and user's location._

### Social Features 👥

- [ ] **User-generated content**

  - [ ] Event reviews and ratings
  - [ ] DJ reviews and ratings
  - [ ] Photo sharing from events
  - [ ] User comments and discussions

  _Specifications: Implement rating system (1-5 stars) with written reviews for events and DJs, including categories like music quality, venue, organization, food. Add photo sharing functionality allowing users to upload event photos with automatic EXIF data removal and image optimization. Include moderation system for inappropriate content. Support comment threads on events with real-time updates. Implement user reputation system based on helpful reviews and quality contributions._

- [ ] **Community features**

  - [ ] User profiles with event history
  - [ ] Friend/connection system
  - [ ] Share events with friends
  - [ ] Group planning features

  _Specifications: Create public user profiles showing event attendance history (optional), favorite DJs, and user-generated content. Implement friend system with mutual connection requests and privacy controls. Add event sharing via social media, email, or direct app links with custom messages. Develop group planning features allowing friends to create shared event lists, coordinate travel, and split accommodations. Include group chat functionality for event coordination._

### Performance & Advanced Features ⚡

- [ ] **PWA Implementation**

  - [ ] Service worker setup
  - [ ] Offline event browsing
  - [ ] Push notifications
  - [ ] App-like experience

  _Specifications: Transform app into full PWA with offline-first architecture. Cache essential data (liked events, followed DJs, recent searches) for offline browsing. Implement background sync for user actions (likes, follows) when reconnected. Add push notification support for followed entity updates, event reminders, and social interactions. Include install prompts for mobile home screen and desktop shortcuts. Support offline search within cached data._

- [ ] **Advanced caching**

  - [ ] Smart cache management
  - [ ] Background sync
  - [ ] Image caching strategies
  - [ ] API response caching with TTL

  _Specifications: Implement intelligent cache management with configurable TTL based on content type (events: 1 hour, DJs: 1 day, static content: 1 week). Add background refresh for critical user data and predictive caching for likely-to-be-viewed content. Implement progressive image loading with WebP/AVIF format support and size-based caching. Include cache analytics to optimize storage usage and hit rates._

- [ ] **Analytics & Monitoring**

  - [ ] User behavior tracking
  - [ ] Performance monitoring
  - [ ] Error tracking and reporting
  - [ ] Usage analytics dashboard

  _Specifications: Implement privacy-compliant analytics tracking user behavior patterns (popular events, search terms, feature usage) without collecting personal data. Add performance monitoring for page load times, API response times, and user interaction metrics. Include error tracking with automatic bug reporting and user feedback collection. Create admin dashboard showing app usage statistics, popular content, and performance metrics._

### Content Enhancement 🎨

- [ ] **Rich content features**

  - [ ] Image galleries for events
  - [ ] Video integration
  - [ ] Interactive maps with venue details
  - [ ] Event photo albums

  _Specifications: Enhance event pages with image galleries supporting swipe navigation, zoom, and full-screen viewing. Add video embedding for event trailers, DJ sets, and promotional content. Implement interactive maps showing venue location, nearby hotels, airports, and restaurants with integrated reviews and booking links. Create collaborative photo albums where attendees can contribute event photos with automatic organization by date and event._

- [ ] **Personalization**

  - [ ] Recommended events based on likes
  - [ ] Personalized DJ suggestions
  - [ ] Location-based recommendations
  - [ ] Learning user preferences

  _Specifications: Develop recommendation engine analyzing user behavior (likes, follows, searches) to suggest relevant events and DJs. Implement location-based recommendations considering user's home location and travel patterns. Add machine learning component that improves suggestions over time based on user feedback (liked/dismissed recommendations). Include discovery features highlighting new DJs, emerging event series, and trending events in user's regions of interest._

### Internationalization 🌍

- [ ] **Multi-language support**

  - [ ] English (primary)
  - [ ] Spanish (large tango community)
  - [ ] German (many events)
  - [ ] French (significant community)

  _Specifications: Implement full i18n support with Vue i18n, supporting English as primary language, Spanish for Latin American community, German for Central European events, and French for European community. Include automatic language detection based on browser settings and user location. Support language switching with immediate UI updates and persistent preference storage. Translate all UI elements, error messages, and user-facing content while keeping event data in original languages._

- [ ] **Localization features**

  - [ ] Currency display based on event location
  - [ ] Time zone handling
  - [ ] Date format preferences
  - [ ] Cultural preferences

  _Specifications: Implement automatic currency detection and conversion based on event location with current exchange rates. Add timezone handling showing event times in user's local timezone with clear indication of original timezone. Support multiple date formats (US, European, ISO) based on user preference or location. Include cultural adaptations like weekend definitions, holiday recognition, and region-specific features._

## WordPress API Requirements 🔧

### User Management API

- [ ] **User authentication endpoints**

  - [ ] OAuth provider integration
  - [ ] User profile CRUD operations
  - [ ] User preferences storage
  - [ ] Session management

  _Specifications: Extend WordPress with custom user meta fields for tango-specific data. Create REST endpoints for user profile management, preference storage, and OAuth token handling. Implement user roles (user, premium, admin) with capability-based permissions. Add endpoints for password reset, email verification, and account deactivation._

- [ ] **User relationship endpoints**

  - [ ] Follow/unfollow DJs and series
  - [ ] Like/unlike events and DJs
  - [ ] Friend connections
  - [ ] User activity feeds

  _Specifications: Create custom database tables for user relationships (follows, likes, friendships) with efficient querying. Implement REST endpoints for relationship management with bulk operations support. Add activity feed generation with privacy controls and notification triggering. Include analytics endpoints for follower counts and engagement metrics._

### Notification System

- [ ] **Push notification infrastructure**

  - [ ] FCM integration for mobile push
  - [ ] Email notification system
  - [ ] Notification preferences management
  - [ ] Notification scheduling and delivery

  _Specifications: Integrate Firebase Cloud Messaging for push notifications with device token management. Create email notification system with template support and delivery tracking. Implement notification queuing system with scheduled delivery for reminders. Add user preference management for notification types, frequency, and delivery methods._

### Enhanced Content API

- [ ] **User-generated content endpoints**

  - [ ] Event and DJ reviews/ratings
  - [ ] Photo upload and management
  - [ ] Comment system with threading
  - [ ] Content moderation tools

  _Specifications: Create custom post types for reviews and ratings with meta fields for structured data. Implement image upload API with automatic optimization, metadata stripping, and CDN integration. Add comment system with threading, moderation queues, and spam protection. Include content reporting and moderation workflow with admin tools._

### Analytics and Recommendations

- [ ] **User behavior tracking**

  - [ ] Event view and interaction logging
  - [ ] Search query analysis
  - [ ] Recommendation engine data
  - [ ] Privacy-compliant analytics

  _Specifications: Create analytics database for user behavior tracking with anonymization. Implement recommendation engine backend calculating suggestions based on collaborative filtering and content analysis. Add data export capabilities for GDPR compliance and user data portability. Include admin dashboards for content performance and user engagement metrics._

## Completed Infrastructure ✅

### Core Setup (Done)

- [x] Environment management and build tools
- [x] ESLint, Prettier, TypeScript configuration
- [x] Quasar integration with Material Design
- [x] Routing and navigation
- [x] API integration with `/wp-json/tmd/v3`
- [x] HAL-compliant service layer
- [x] Mobile-first responsive design
- [x] Dark mode support
- [x] Image optimization and lazy loading

### Content Display (Done)

- [x] Event listing with filtering and search
- [x] Event detail pages with maps
- [x] DJ profiles with tabbed interface
- [x] DJ-Event relationships
- [x] Performance statistics and timelines
- [x] Loading states and skeleton screens

### Documentation (Done)

- [x] Component documentation
- [x] API integration documentation
- [x] v3 API comprehensive documentation
- [x] Service layer documentation
- [x] Deployment guide

## Technical Notes 📝

- **API Status**: 71/76 tests passing (93.4% success rate)
- **No backward compatibility needed** - new app, v3 API designed for it
- **Read-only content consumption** - no content editing features needed
- **User accounts required** for personalization features
- **Mobile-first approach** with Quasar Material Design
- **ISO date format** (`YYYY-MM-DD`) used throughout
- **Strict TypeScript** with floating promise checks
- **HAL-compliant** API integration complete

## Priority Guidelines 🎯

1. **Tomorrow**: Fix blocking issues, complete API integration
2. **Next Week**: Get users authenticated and basic social features working
3. **Next Months**: Rich features that make the app indispensable

Focus on features that make users want to return daily:

- Personal dashboards
- Notifications for followed content
- Calendar integration
- Social features around events

The goal is to become the essential tool for tango marathon enthusiasts
worldwide.

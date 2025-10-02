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

### Core Functionality
- **Modern DJ Management**: Complete DJ profiles with activity tracking,
  experience timelines, and linked events
- **Event & Performance Tracking**: Comprehensive event listings with
  DJ-event relationships and performance statistics
- **Mobile-First Design**: Touch-optimized interactions with responsive
  layouts for all screen sizes
- **Advanced Filtering**: Server-side search and filtering with optimized
  performance
- **Dark Mode Support**: System preference detection with persistent settings
- **Full Accessibility**: WCAG 2.1 AA compliance with complete keyboard
  navigation and screen reader support

### Authentication & Security
- **JWT Token Authentication**: Secure GraphQL-based authentication
- **Proactive Token Refresh**: Automatic refresh 5 minutes before expiration
  - Prevents authentication interruptions
  - Exponential backoff (1s → 2s → 4s)
  - Maximum 3 refresh attempts
  - Graceful degradation on failure
- **Persistent Sessions**: 30-day sessions with "Remember Me"
- **Automatic Re-login**: Up to 3 automatic re-login attempts on 401 errors
- **Session Management**: localStorage (persistent) or sessionStorage (temporary)

### API Integration & Performance
- **TMD v3 REST API**: HAL-compliant JSON responses with embedded relationships
- **Concurrent Request Support**: 5-20 parallel requests (HTTP/2 optimized)
- **Request Handling**: 30-second timeout with automatic retry logic
- **Error Classification**: Network, server (5xx), and client (4xx) error types
- **Automatic Metrics Tracking**: Comprehensive operational monitoring
- **Performance Optimization**: Request debouncing, caching, lazy loading

### Operational Metrics (New)
- **Real-time Request Tracking**: Total requests, success/failure counts
- **Performance Monitoring**: 
  - Response time percentiles (P50, P95, P99)
  - Average response time
  - Slow request detection (>5s)
- **Error Analytics**:
  - Network errors (connection failures)
  - Server errors (5xx responses)
  - Client errors (4xx responses)
  - Error rate calculations
- **Per-Endpoint Statistics**: Track volume, success rate, and performance by endpoint
- **Rolling Time Window**: 1-hour metrics with automatic pruning
- **Metrics Export**: JSON export for external monitoring and analysis
- **Debug Dashboard**: Real-time metrics visualization at `/debug` route

### Developer Experience
- **TypeScript Integration**: Full type safety with strict null checks
- **Code Quality**: ESLint + Prettier + Stylelint with strict rules
- **Comprehensive Testing**: 
  - 383+ unit tests with Vitest
  - Integration tests for concurrent requests
  - Edge case coverage (offline, errors, malformed responses)
- **Debug Tools**: 
  - Comprehensive debug page (`/debug`)
  - API connection testing
  - Token refresh testing
  - Metrics dashboard with export
  - Storage inspection

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

The project integrates with WordPress using both REST API v3 and GraphQL for
different purposes. All content management is done through WordPress using the
TMD plugin's custom endpoints.

### Authentication

The application uses **WPGraphQL with JWT Authentication** for secure user
authentication:

- **GraphQL Endpoint**: `/graphql` (handled by WPGraphQL plugin)
- **Authentication Plugin**: JWT Authentication for WPGraphQL
- **Token Types**:
  - `authToken`: Short-lived access token (~5 minutes)
  - `refreshToken`: Long-lived token for session persistence (30 days)
- **Storage**: localStorage with encrypted session data
- **Security Features**:
  - Progressive brute force protection (0s → 1s → 5s → 30s delays)
  - Automatic token refresh before expiration
  - Secure token validation on every request
  - Session expiration warnings

#### Login Flow

```typescript
import { useAuth } from 'src/composables/useAuth';

const { login, logout, isAuthenticated } = useAuth();

// Login
await login({
  username: 'user@example.com',
  password: 'password',
  remember: true, // 30-day session
});

// Logout
await logout();
```

#### Protected Routes

Routes are protected using navigation guards:

```typescript
import { requireAuth } from 'src/router/guards';

{
  path: '/dashboard',
  component: () => import('pages/DashboardPage.vue'),
  beforeEnter: requireAuth, // Requires authentication
}
```

#### Session Management

The application automatically:

- Restores sessions on app startup
- Refreshes tokens before expiration
- Shows expiration warnings (SessionIndicator component)
- Handles session lifecycle with composables

```typescript
import { useSession } from 'src/composables/useSession';

const { session, isValid, isExpiringSoon, timeRemaining } = useSession();
```

#### Components

**LoginForm.vue** - Reusable login form with:

- Username/password inputs (Quasar QInput)
- Password visibility toggle
- Remember me option (30-day sessions)
- Progressive delay protection display
- Full ARIA labels for accessibility

**AuthGuard.vue** - Component-level route protection:

- Conditionally renders content based on auth state
- Supports role-based access control
- Custom unauthorized message slots

**SessionIndicator.vue** - Session status display:

- User info with avatar
- Session expiration countdown
- Quick access to profile and logout
- Visual warnings when session expiring

#### Password Reset

Password reset is handled by the main TMD WordPress site:

- Click "Forgot password?" on login page
- Redirects to: `${wordpressUrl}/wp-login.php?action=lostpassword`
- Opens in new tab for security
- No local password reset functionality

#### Security Best Practices

✅ **Implemented**:

- JWT tokens stored in localStorage (SPA standard)
- Progressive brute force protection
- Password cleared from memory on error
- HTTPS required in production
- Token expiration validation
- Automatic refresh token rotation

⚠️ **Important Notes**:

- Tokens in localStorage: Industry standard for SPAs, acceptable security trade-off
- No registration: Existing TMD users only
- No MFA: Not in v1 scope (future enhancement)
- Backend validates all tokens on every request

### API Endpoints

**API Usage Summary (Refer to `docs/api.md` for full details):**

- **Local Development**: Primarily uses `/tmd/v3/` namespace for all custom content types (Events, DJs, Teachers, Event Series).
  - Example: `GET http://localhost:10014/wp-json/tmd/v3/events`
- **Production**:
  - Events: Uses `/tmd/v2/` namespace.
    - Example: `GET https://www.tangomarathons.com/wp-json/tmd/v2/events`
  - DJs, Teachers, Event Series: Uses `/tmd/v3/` namespace and standard WordPress `/wp/v2/` API.
    - Example (DJ): `GET https://www.tangomarathons.com/wp-json/tmd/v3/djs`
    - Example (WordPress Core for DJs): `GET https://www.tangomarathons.com/wp-json/wp/v2/tmd_dj`

**Authentication**: GraphQL endpoint at `/graphql` for login, token refresh, and user verification.

For comprehensive API documentation including authentication flow, concurrent request handling, and operational metrics, see:
- **[API Documentation](docs/api.md)** - Complete endpoint reference
- **[API Integration Guide](docs/api-integration.md)** - Authentication, metrics, performance
- **[Troubleshooting Guide](docs/troubleshooting.md)** - Common issues and solutions

### Configuration Options

#### Environment Variables

Create a `.env` file in the project root:

```bash
# API Configuration
WORDPRESS_API_URL=http://localhost:10014/wp-json/tmd/v3
GRAPHQL_ENDPOINT=http://localhost:10014/graphql

# Optional: Debug settings
DEBUG=api:*  # Enable verbose logging
```

#### Token Refresh Configuration

The proactive token refresh system can be configured in `src/composables/useTokenRefresh.ts`:

```typescript
// Default configuration:
const REFRESH_THRESHOLD_MINUTES = 5;  // Refresh 5 min before expiry
const MAX_REFRESH_ATTEMPTS = 3;        // Max retry attempts
const BACKOFF_DELAYS = [1000, 2000, 4000]; // Exponential backoff (ms)
```

#### Metrics Configuration

Metrics collection settings in `src/composables/useMetrics.ts`:

```typescript
// Default configuration:
const METRICS_WINDOW_MS = 60 * 60 * 1000; // 1-hour rolling window
// Automatic pruning of old metrics
// Per-endpoint tracking enabled by default
```

#### Axios Timeout

Request timeout can be adjusted in `src/boot/axios.ts`:

```typescript
const api = axios.create({
  timeout: 30000, // 30 seconds (default)
});
```

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

### Response Time Targets
- **Normal**: < 3 seconds
- **Slow warning**: 5-10 seconds (logged automatically)
- **Timeout**: 30 seconds (hard limit)

### Optimization Strategies
- **Concurrent Requests**: Use `Promise.all()` for parallel API calls (5-20 requests supported)
- **Request Batching**: Fetch related data in single requests with `_embed=true`
- **Efficient Pagination**: Server-side pagination with configurable `per_page`
- **Metrics Tracking**: Real-time performance monitoring with percentile calculations
- **Smart Caching**: Reduced API payloads with essential fields only (`meta_fields` parameter)
- **Loading States**: Visual feedback with Quasar spinners and skeletons
- **TypeScript Safety**: Strict null checks and proper error handling
- **Responsive Design**: Mobile-first with touch optimization
- **Proactive Token Refresh**: Prevents authentication delays during active sessions

## Todo

### Completed ✅

- [x] DJ profiles with comprehensive metadata and activity tracking
- [x] DJ-Event relationships with embedded data and performance statistics
- [x] Advanced filtering and search with server-side optimization
- [x] Mobile-first responsive design with touch optimization
- [x] TypeScript integration with strict mode and ESLint compliance
- [x] API documentation with v3 endpoints and relationship examples
- [x] **Authentication & Session Management** (GraphQL/JWT with 30-day sessions)
- [x] **Progressive brute force protection** (0s → 1s → 5s → 30s delays)
- [x] **Full WCAG 2.1 AA accessibility compliance**
- [x] **Session lifecycle management with composables**
- [x] **Comprehensive test suite** (17 test files with TDD approach)

### Current Priorities

- [ ] E2E testing with Playwright/Cypress
- [ ] Performance optimization (<200ms auth response target)
- [ ] Teacher profiles and teacher-event relationships
- [ ] Event series management and linking
- [ ] Enhanced event filtering (by DJ, date ranges, categories)
- [ ] User profile management and preferences
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

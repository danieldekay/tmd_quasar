# Research: TMD Authentication & Session Management

## Authentication Method Decision

**Decision**: WordPress REST API with JWT token authentication  
**Rationale**: TMD uses WordPress as backend CMS with existing user database. JWT tokens provide stateless authentication suitable for frontend-only architecture.  
**Alternatives considered**:

- Basic Auth (rejected: less secure, credentials in every request)
- OAuth 2.0 (rejected: overcomplicated for internal authentication)
- Session cookies (rejected: not suitable for headless architecture)

## Session Storage Decision

**Decision**: Browser localStorage for JWT tokens with 30-day expiration  
**Rationale**: Persistent storage enables "stay logged in" functionality as required. localStorage survives browser restarts.  
**Alternatives considered**:

- sessionStorage (rejected: lost on browser close, conflicts with 30-day requirement)
- HTTP-only cookies (rejected: complicates CORS and headless architecture)
- IndexedDB (rejected: overkill for simple token storage)

## Brute Force Protection Decision

**Decision**: Client-side progressive delays (1s, 5s, 30s) with backend rate limiting  
**Rationale**: Provides immediate user feedback while reducing server load. Backend should also implement IP-based rate limiting for security.  
**Alternatives considered**:

- Account lockout (rejected: could be abused for denial of service)
- CAPTCHA only (rejected: poor user experience for legitimate users)
- Client-side only (rejected: insufficient security)

## State Management Decision

**Decision**: Pinia store for authentication state with Vue composables  
**Rationale**: Aligns with TMD Quasar architecture. Pinia provides reactive state management, composables enable reusable logic.  
**Alternatives considered**:

- Vuex (rejected: legacy, Pinia is Vue 3 standard)
- Local component state (rejected: auth state needed across components)
- Global Vue reactive (rejected: no dev tools support, harder to test)

## WordPress Integration Decision

**Decision**: WPGraphQL with JWT Authentication plugin for authentication  
**Rationale**: TMD backend already has WPGraphQL with JWT Authentication plugin installed and configured. Provides GraphQL `login` mutation, `viewer` query for verification, and `refreshJwtAuthToken` for token refresh. This is the existing, tested authentication method.  
**Alternatives considered**:

- TMD REST API v3 custom endpoints (rejected: would require backend development, GraphQL already works)
- WordPress core auth endpoints (rejected: doesn't integrate with headless architecture)
- Basic Auth (rejected: less secure, credentials in every request)
- Direct database access (rejected: violates architecture principles)

## Password Reset Decision

**Decision**: Redirect to main TMD site at tangomarathons.com/reset-password  
**Rationale**: Maintains consistency with main site, avoids duplicating password reset logic, ensures security updates in one place.  
**Alternatives considered**:

- Implement full password reset (rejected: increases scope, duplicate functionality)
- Email with magic link (rejected: requires email infrastructure setup)
- Admin-only password reset (rejected: poor user experience)

## Testing Strategy Decision

**Decision**: Vitest with MSW (Mock Service Worker) for API mocking  
**Rationale**: MSW provides realistic API mocking, Vitest aligns with project standards, enables testing of full authentication flows.  
**Alternatives considered**:

- Jest with manual mocks (rejected: Vitest is project standard)
- Cypress for all testing (rejected: unit tests should be fast, e2e is supplementary)
- No API mocking (rejected: makes tests brittle and dependent on external services)

## Route Protection Decision

**Decision**: Vue Router navigation guards with composable auth checks  
**Rationale**: Standard Vue.js pattern, integrates with existing router setup, composable enables reusable auth logic.  
**Alternatives considered**:

- Component-level checks (rejected: scattered logic, easy to forget)
- Middleware pattern (rejected: not standard Vue.js approach)
- Server-side routing (rejected: conflicts with SPA architecture)

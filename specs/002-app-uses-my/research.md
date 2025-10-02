# Research: TMD API Integration & Availability Handling

**Feature**: 002-app-uses-my  
**Date**: October 2, 2025  
**Status**: Complete

## Purpose

This document analyzes the existing implementation of API integration and availability handling in the TMD Quasar frontend application to document current capabilities, architectural patterns, and best practices being followed.

## Technology Stack Analysis

### Core Technologies

**Decision**: Vue 3 Composition API with TypeScript  
**Rationale**: 
- Type safety prevents runtime errors and improves maintainability
- Composition API provides better code organization and reusability
- `<script setup>` syntax reduces boilerplate and improves readability
- Strong ecosystem support for testing, tooling, and libraries

**Alternatives Considered**:
- Options API: Rejected due to less flexible composition patterns
- JavaScript without TypeScript: Rejected due to lack of type safety
- React: Not applicable - project already established with Vue 3/Quasar

### HTTP Client

**Decision**: Axios with custom interceptors  
**Rationale**:
- Rich interceptor system for request/response transformation
- Built-in timeout and cancellation support via AbortSignal
- Comprehensive error handling capabilities
- Well-documented and widely adopted in Vue ecosystem
- Axios instances allow configuration per service if needed

**Alternatives Considered**:
- Fetch API: Limited interceptor capabilities, requires manual timeout handling
- Apollo Client: Overkill for REST API, primarily GraphQL focused
- Ky: Less mature ecosystem, limited Vue integration examples

**Current Implementation** (`src/boot/axios.ts`):
- 30-second timeout configuration
- Automatic JWT token injection via request interceptor
- Enhanced error classification in response interceptor
- Request duration tracking for performance monitoring
- Automatic re-authentication on 401 with retry limit

### State Management for API Status

**Decision**: Composable with reactive refs (useApiStatus)  
**Rationale**:
- Lightweight global state without Pinia overhead for single concern
- Direct reactivity through Vue's ref/computed system
- Easy to test in isolation
- Suitable for cross-cutting concern like connectivity status
- No action/mutation ceremony needed for simple state updates

**Alternatives Considered**:
- Pinia store: Overkill for single-purpose state, adds unnecessary abstraction
- Vuex: Deprecated in favor of Pinia, more boilerplate
- Provider/inject: Less discoverable, harder to test

**Current Implementation** (`src/composables/useApiStatus.ts`):
- Global reactive state for online/offline status
- Consecutive failure tracking
- Browser event listeners for connectivity changes
- Error categorization and user-friendly message generation
- Automatic health checks during failure periods

### Error Handling Pattern

**Decision**: Typed error objects with categorization  
**Rationale**:
- Distinguishes between network failures, API unavailability, and client errors
- Maps technical errors to user-friendly messages
- Enables appropriate retry strategies per error type
- Facilitates analytics and debugging

**Alternatives Considered**:
- Generic error strings: Rejected due to loss of context and poor user experience
- HTTP status codes only: Insufficient for offline detection and user messaging
- Error codes with lookup tables: More complex, harder to maintain

**Current Implementation**:
```typescript
interface ApiError {
  name: 'NetworkError' | 'APIUnavailable' | 'ServerError' | 'NotFoundError' | 'APIError';
  message: string;
  isOffline?: boolean;
  status?: number;
  originalError?: Error;
}
```

## Architecture Patterns

### Service Layer Pattern

**Decision**: BaseService class with specialized service extensions  
**Rationale**:
- DRY principle for common API operations (pagination, embedding, filtering)
- HAL response format handled consistently across all endpoints
- Standardized error handling and retry logic
- Easy to extend for new content types

**Current Services**:
- BaseService: Generic operations, HAL parsing, error wrapping
- EventService: Events endpoint specialization
- DJService: DJ profiles endpoint
- TeacherService: Teacher profiles endpoint
- CoupleService: Teaching couples endpoint
- EventSeriesService: Event series endpoint
- InteractionService: User interactions (favorites, bookmarks)

### HAL (Hypertext Application Language) Handling

**Decision**: Parse HAL structure in BaseService  
**Rationale**:
- TMD API returns HAL-compliant responses with `_embedded` and `_links`
- Centralized parsing reduces duplication
- Pagination links extracted automatically
- Embedded resources accessed consistently

**Implementation Details**:
```typescript
interface HALResponse<T> {
  _embedded?: { [key: string]: T[] };
  _links?: {
    self?: Array<{ href: string }>;
    next?: Array<{ href: string }>;
    prev?: Array<{ href: string }>;
    last?: Array<{ href: string }>;
  };
  page?: number;
  per_page?: number;
  total?: number;
  count?: number;
}
```

### Retry Strategy

**Decision**: Exponential backoff with limited retries  
**Rationale**:
- Prevents API flooding during outages
- Gives transient issues time to resolve
- Exponential delays: 1s, 2s, 4s between attempts
- Max 1 retry per request (total 2 attempts)
- No retry for 4xx client errors (except 404)

**Implementation** (`src/composables/useApiStatus.ts`):
```typescript
const withApiErrorHandling = async <T>(
  apiCall: () => Promise<T>,
  options: { silent?: boolean; retries?: number } = {}
): Promise<T> => {
  // Retry loop with exponential backoff
  // Skip retry for 4xx errors
  // Record success/failure for health tracking
}
```

### JWT Token Refresh

**Decision**: Proactive token refresh before expiration  
**Rationale** (from clarifications):
- Seamless user experience without interruption
- Prevents auth failures during active sessions
- Background refresh transparent to user
- Reduces 401 error handling complexity

**Required Implementation** (to be verified/added):
- Monitor token expiration timestamp
- Refresh 5 minutes before expiry
- Handle refresh failures gracefully
- Fallback to reactive refresh on 401 if proactive fails

### Metrics Tracking

**Decision**: Standard operational metrics  
**Rationale** (from clarifications):
- Request count, error rate, response times for observability
- Timeout rate to identify connectivity issues
- Success/failure by endpoint to isolate problems
- Sufficient for operational monitoring without overhead

**Required Implementation** (to be verified/enhanced):
```typescript
interface Metrics {
  requestCount: number;
  errorRate: number;
  responseTimeP50: number;
  responseTimeP95: number;
  timeoutRate: number;
  successByEndpoint: Record<string, number>;
  failureByEndpoint: Record<string, number>;
}
```

## UI/UX Patterns

### Error Display Component

**Decision**: OfflineMessage.vue reusable component  
**Rationale**:
- Centralized error display logic
- Consistent visual indicators across application
- Different styles for offline vs API unavailable
- Built-in retry functionality
- Quasar components for consistent design

**Implementation** (`src/components/OfflineMessage.vue`):
- QBanner for prominent error display
- Color-coded: red (offline), amber (API down), grey (general error)
- Retry button with loading state
- Contextual messages from useApiStatus composable

### Loading States

**Decision**: Quasar skeleton loaders and spinners  
**Rationale**:
- Immediate feedback during data loading
- Reduced perceived latency
- Consistent with Quasar design system
- Accessible (screen reader announcements)

**Patterns Observed**:
- Skeleton screens for list views
- Spinners for button actions
- Progress bars for bulk operations
- Loading props passed to Quasar components

## Performance Considerations

### Concurrent Request Handling

**Decision**: Support 5-20 concurrent requests (from clarifications)  
**Rationale**:
- Typical SPA scenario: parallel component data loading
- Multiple browser tabs pointing to same app
- Dashboard widgets loading simultaneously
- User navigating quickly between pages

**Implementation Verification Needed**:
- No explicit request queue/limiter found
- Axios handles concurrent requests naturally
- Browser limits (6-8 per domain) may be implicit throttle

### Request Cancellation

**Decision**: AbortSignal support in services  
**Rationale**:
- Cancel in-flight requests on navigation
- Prevents unnecessary data processing
- Reduces server load from abandoned requests
- Avoids race conditions with stale responses

**Implementation** (`src/services/baseService.ts`):
```typescript
protected async makeRequest<R>(
  path: string,
  params: BaseParams = {},
  signal?: AbortSignal
): Promise<{ data: R; headers: Record<string, string> }> {
  const requestConfig: AxiosRequestConfig = {
    params: { ...params },
  };
  if (signal) {
    requestConfig.signal = signal;
  }
  // ... rest of request
}
```

### Caching Strategy

**Decision**: Browser cache with cache-control headers  
**Rationale**:
- Reduces redundant API calls
- Faster page loads on revisit
- Server controls cache lifetime
- No complex client-side cache invalidation

**Enhancement Opportunity** (noted but not in scope):
- Service worker for offline persistence
- More sophisticated cache invalidation
- Background sync for updates

## Testing Strategy

### Test Organization

**Decision**: Co-located `__tests__` folders (Quasar convention)  
**Rationale**:
- Tests live near the code they verify
- Easy to find and maintain tests
- Clear test ownership per module
- Follows Quasar framework standards

**Current Test Structure**:
```
src/services/__tests__/          # Service unit tests
src/composables/__tests__/        # (if exists) Composable tests
src/components/__tests__/         # Component tests
tests/integration/__tests__/      # Integration tests
api-tests/                        # API contract tests
```

### Test Frameworks

**Decision**: Vitest for all tests  
**Rationale**:
- Fast execution with native ESM support
- Compatible with Vite build system
- Vue-friendly test utilities
- TypeScript support out of box

**Test Types Observed**:
- Unit tests for services (mock Axios)
- Component tests (mount with test-utils)
- API integration tests (real HTTP calls)
- Import validation tests (module loading)

## API Endpoint Documentation

### TMD v3 API Endpoints

All endpoints follow HAL format with consistent patterns:

1. **Events** - `/tmd/v3/events`
   - Primary content type (2989 items documented)
   - Full CRUD operations
   - Embedding: teachers, venue, featured images

2. **DJs** - `/tmd/v3/djs`
   - 1045 items documented
   - Meta fields: bio, social links, photos
   - Relationships to events

3. **Teachers** - `/tmd/v3/teachers`
   - 158 items documented
   - Similar structure to DJs
   - Couple affiliations

4. **Couples** - `/tmd/v3/couples`
   - 66 items documented
   - Links to teacher profiles

5. **Event Series** - `/tmd/v3/event-series`
   - 72 items documented
   - Groups related events

6. **Orchestras** - `/tmd/v3/orchestras`
   - 13 items documented

7. **Brands** - `/tmd/v3/brands`
   - 6 items documented
   - Event organizer information

### Universal Query Parameters

All endpoints support:
- `page`: Page number (1-indexed)
- `per_page`: Items per page (default 10, max 100)
- `search`: Full-text search
- `orderby`: Sort field
- `order`: Sort direction (asc/desc)
- `_embed`: Include related resources
- `_fields`: Field filtering for performance

## Security Considerations

### JWT Token Management

**Current Implementation**:
- Tokens stored in cookies (httpOnly for security)
- Automatic injection via Axios interceptor
- Re-authentication on 401 with attempt limiting (max 3)

**Enhancement Required** (from clarifications):
- Proactive token refresh before expiration
- Token expiration monitoring
- Background refresh logic

### CORS Handling

**Configuration**:
- Local development: `http://localhost:10014`
- Production: `https://www.tangomarathons.com`
- Proper CORS headers expected from backend

## Operational Metrics

### Performance Targets (from spec)

- Normal request completion: 3 seconds
- Slow request warning threshold: 5 seconds
- Request timeout: 30 seconds
- Concurrent request support: 5-20 requests

### Health Monitoring

**Current Implementation**:
- Request duration tracking
- Consecutive failure counting
- Last successful request timestamp
- Periodic health checks (30-second interval during failures)

**Enhancement Required** (from clarifications):
- Expose standard metrics: request count, error rate, response times
- Per-endpoint success/failure tracking
- Timeout rate calculation
- Metrics export for external monitoring systems

## Findings Summary

### Strengths of Current Implementation

1. ✅ Comprehensive offline detection (browser events + API health)
2. ✅ Clear error categorization and user messaging
3. ✅ Automatic retry with exponential backoff
4. ✅ Request cancellation support
5. ✅ Typed interfaces throughout
6. ✅ HAL response format properly handled
7. ✅ Test infrastructure in place

### Areas Requiring Enhancement

1. ⚠️ Proactive JWT token refresh (clarification requirement)
2. ⚠️ Standard metrics tracking and exposure (clarification requirement)
3. ⚠️ Concurrent request limit verification (5-20 clarification)
4. 💡 Service worker for offline persistence (future enhancement)
5. 💡 Request deduplication (future enhancement)

### Documentation Gaps Addressed

This research provides:
- ✅ Architectural pattern documentation
- ✅ Technology decision rationale
- ✅ Best practices currently followed
- ✅ Enhancement roadmap based on clarifications
- ✅ Testing strategy documentation

## Conclusion

The existing TMD API integration and availability handling implementation is robust and well-architected, following Vue 3/Quasar best practices. The clarifications identified three specific enhancements needed:

1. Proactive JWT token refresh mechanism
2. Standard operational metrics tracking
3. Explicit concurrent request handling documentation/verification

All other requirements from the specification are already implemented and operational. The next phase will document the data model and create contracts for the API integration points.

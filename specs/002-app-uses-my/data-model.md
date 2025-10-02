# Data Model: API Integration & Availability Handling

**Feature**: 002-app-uses-my  
**Date**: October 2, 2025  
**Context**: Status quo documentation of existing data structures

## Overview

This document describes the data entities, types, and relationships used in the TMD API integration and availability handling system. Since this is a status quo analysis, these represent existing implementations rather than new designs.

## Core Entities

### 1. ApiStatusState

**Purpose**: Global reactive state tracking API health and connectivity

**Location**: `src/composables/useApiStatus.ts`

**Structure**:
```typescript
interface ApiStatusState {
  isOnline: boolean;                    // Device has internet connectivity
  isApiAvailable: boolean;              // Backend API is reachable
  lastError: ApiError | null;           // Most recent error details
  consecutiveFailures: number;          // Count of sequential failures
  lastSuccessfulRequest: Date | null;   // Timestamp of last successful API call
}
```

**Relationships**:
- Referenced by: All components displaying connectivity status
- Updated by: useApiStatus composable methods
- Consumed by: OfflineMessage component, service error handlers

**State Transitions**:
```
[Online + API Available] ←→ [Online + API Unavailable]
         ↓                            ↓
[Offline + API Unavailable] ←→ [Offline + API Unavailable]
```

**Validation Rules**:
- `isOnline` syncs with `navigator.onLine`
- `isApiAvailable` becomes false after 3 consecutive failures
- `consecutiveFailures` resets to 0 on successful request
- `lastSuccessfulRequest` only updates on 2xx responses

### 2. ApiError

**Purpose**: Categorized error information for appropriate handling

**Location**: `src/composables/useApiStatus.ts`, `src/boot/axios.ts`

**Structure**:
```typescript
interface ApiError {
  name: 'NetworkError' | 'APIUnavailable' | 'ServerError' | 
        'NotFoundError' | 'UnauthorizedError' | 'APIError';
  message: string;                      // User-friendly error message
  isOffline?: boolean;                  // True if caused by no internet
  status?: number;                      // HTTP status code if available
  originalError?: Error;                // Original error for debugging
}
```

**Error Type Classification**:
- **NetworkError**: No internet connection (ERR_NETWORK, ECONNABORTED)
- **APIUnavailable**: Can't reach API server (no response)
- **ServerError**: Backend returned 5xx status
- **NotFoundError**: Resource not found (404)
- **UnauthorizedError**: Authentication required/expired (401)
- **APIError**: Generic API error (catch-all)

**Relationships**:
- Created by: Axios response interceptor
- Stored in: ApiStatusState.lastError
- Consumed by: Error display components, retry logic

**Lifecycle**:
1. HTTP request fails
2. Axios interceptor catches error
3. Error classified based on response/code
4. ApiError instance created with appropriate name
5. Stored in ApiStatusState
6. Displayed to user via OfflineMessage
7. Cleared on next successful request

### 3. HALResponse<T>

**Purpose**: Typed representation of HAL-compliant API responses

**Location**: `src/services/baseService.ts`

**Structure**:
```typescript
interface HALResponse<T> {
  _embedded?: {
    [key: string]: T[];                // Embedded resources by relation name
  };
  _links?: {
    self?: Array<{ href: string }>;   // Current resource URL
    next?: Array<{ href: string }>;   // Next page URL
    prev?: Array<{ href: string }>;   // Previous page URL
    last?: Array<{ href: string }>;   // Last page URL
    first?: Array<{ href: string }>;  // First page URL
  };
  page?: number;                       // Current page number (1-indexed)
  per_page?: number;                   // Items per page
  total?: number;                      // Total items available
  count?: number;                      // Items in current response
}
```

**Relationships**:
- Returned by: TMD v3 API endpoints
- Parsed by: BaseService.makeRequest()
- Consumed by: EventService, DJService, TeacherService, etc.

**Constraints**:
- `_embedded` keys must match endpoint names (e.g., "tmd_event", "tmd_dj")
- Pagination metadata must be consistent across all endpoints
- `_links` hrefs are absolute URLs

### 4. ServiceRequest/Response

**Purpose**: Captures API request lifecycle and metadata

**Location**: Implicit in Axios interceptors and service methods

**Structure** (conceptual):
```typescript
interface ServiceRequest {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url: string;                         // Relative API path
  params?: BaseParams;                 // Query parameters
  data?: unknown;                      // Request body (POST/PUT)
  signal?: AbortSignal;                // Cancellation token
  metadata?: {
    startTime: number;                 // Request start timestamp
    attempt: number;                   // Retry attempt number
  };
}

interface ServiceResponse<T> {
  data: T;                             // Response data
  headers: Record<string, string>;     // Response headers
  status: number;                      // HTTP status code
  duration: number;                    // Request duration in ms
}
```

**Relationships**:
- Created by: Service methods (getEvents, getDJs, etc.)
- Enhanced by: Axios request interceptor (adds metadata, auth token)
- Processed by: Axios response interceptor (tracks duration, handles errors)
- Tracked by: ApiStatusState for health monitoring

**Validation Rules**:
- Duration > 5000ms triggers performance warning
- Duration > 30000ms triggers timeout
- Status >= 500 increments consecutiveFailures
- Status === 401 triggers re-authentication flow

## Supporting Types

### 5. BaseParams

**Purpose**: Standard query parameters for all API requests

**Location**: `src/services/baseService.ts`

**Structure**:
```typescript
interface BaseParams {
  page?: number;                       // Page number (1-indexed)
  per_page?: number;                   // Items per page (max 100)
  search?: string;                     // Full-text search query
  orderby?: string;                    // Sort field
  order?: 'asc' | 'desc';             // Sort direction
  _embed?: boolean | string;           // Embed related resources
  _fields?: string;                    // Comma-separated field list
  [key: string]: unknown;              // Endpoint-specific params
}
```

### 6. PaginatedResponse<T>

**Purpose**: Wrapper for paginated list responses

**Location**: `src/services/baseService.ts`

**Structure**:
```typescript
interface PaginatedResponse<T> {
  items: T[];                          // Array of items
  total: number;                       // Total items available
  page: number;                        // Current page
  perPage: number;                     // Items per page
  hasMore: boolean;                    // True if more pages exist
  nextPage?: number;                   // Next page number if available
}
```

## Operational Metrics (Enhancement Required)

### 7. OperationalMetrics

**Purpose**: Track standard metrics for monitoring (from clarifications)

**Location**: To be implemented/verified

**Structure** (proposed):
```typescript
interface OperationalMetrics {
  // Request tracking
  totalRequests: number;                      // Total API requests made
  successfulRequests: number;                 // 2xx responses
  failedRequests: number;                     // Non-2xx responses
  
  // Error tracking
  errorRate: number;                          // Failed / Total (percentage)
  errorsByType: Record<ApiError['name'], number>;
  
  // Performance tracking
  responseTimeP50: number;                    // Median response time (ms)
  responseTimeP95: number;                    // 95th percentile (ms)
  responseTimeP99: number;                    // 99th percentile (ms)
  avgResponseTime: number;                    // Average response time (ms)
  
  // Timeout tracking
  timeoutCount: number;                       // Requests exceeding 30s
  timeoutRate: number;                        // Timeouts / Total (percentage)
  
  // Per-endpoint tracking
  requestsByEndpoint: Record<string, number>;
  successByEndpoint: Record<string, number>;
  failureByEndpoint: Record<string, number>;
  avgTimeByEndpoint: Record<string, number>;
  
  // Time window
  windowStart: Date;                          // Metrics collection start
  windowEnd: Date;                            // Metrics collection end (rolling)
}
```

**Relationships**:
- Updated by: Axios response interceptor
- Exposed by: New metrics endpoint/method
- Consumed by: Monitoring dashboards, alerting systems

**Collection Strategy**:
- Rolling 1-hour window
- Percentiles calculated using streaming algorithm
- Per-endpoint limits (track top 20 by volume)
- Reset on page reload (client-side only)

## JWT Token Management (Enhancement Required)

### 8. TokenState

**Purpose**: Track JWT token status for proactive refresh (from clarifications)

**Location**: To be implemented

**Structure** (proposed):
```typescript
interface TokenState {
  token: string;                              // Current JWT token
  refreshToken?: string;                      // Refresh token if available
  expiresAt: Date;                            // Token expiration timestamp
  issuedAt: Date;                             // Token issue timestamp
  refreshThreshold: number;                   // Minutes before expiry to refresh
  isRefreshing: boolean;                      // Refresh in progress flag
  lastRefreshAttempt?: Date;                  // Last refresh attempt timestamp
}
```

**Relationships**:
- Created by: Login flow
- Updated by: Token refresh mechanism
- Monitored by: Background refresh timer
- Used by: Axios request interceptor

**State Transitions**:
```
[Valid Token] → [Near Expiry] → [Refreshing] → [Valid Token]
     ↓                                ↓
[Expired] ← [Refresh Failed] ←──────┘
     ↓
[Require Login]
```

**Validation Rules**:
- Refresh triggered at `expiresAt - refreshThreshold` (default 5 minutes)
- Max 3 refresh attempts before requiring re-login
- Refresh only attempted if not already in progress
- Failed refresh clears tokens and redirects to login

## Data Flow Diagrams

### Request Lifecycle

```
Component
    ↓ (calls service method)
Service (EventService, DJService, etc.)
    ↓ (calls BaseService.makeRequest)
BaseService
    ↓ (calls axios.get/post/etc.)
Axios Request Interceptor
    ├─ Add JWT token
    ├─ Add request metadata (startTime)
    └─ Add AbortSignal if provided
    ↓
TMD API (WordPress REST endpoint)
    ↓
Axios Response Interceptor
    ├─ Calculate duration
    ├─ Log slow requests (> 5s)
    ├─ Classify errors
    └─ Update ApiStatusState
    ↓
BaseService (unwraps HAL response)
    ↓
Service (transforms to domain model)
    ↓
Component (displays data or error)
```

### Error Handling Flow

```
API Request Fails
    ↓
Axios Response Interceptor
    ├─ Network error? → ApiError(NetworkError, isOffline=true)
    ├─ No response? → ApiError(APIUnavailable, isOffline=true)
    ├─ 401? → ApiError(UnauthorizedError) → Attempt re-login
    ├─ 404? → ApiError(NotFoundError)
    ├─ 5xx? → ApiError(ServerError)
    └─ Other → ApiError(APIError)
    ↓
useApiStatus.recordFailure()
    ├─ Increment consecutiveFailures
    ├─ Store lastError
    └─ If failures >= 3: isApiAvailable = false
    ↓
Component displays OfflineMessage
    ├─ Offline → Red banner "You appear to be offline"
    ├─ API down → Amber banner "API currently unavailable"
    └─ Other → Grey card with specific message
    ↓
User clicks Retry
    ↓
Request attempted again
    ↓
Success?
    ├─ Yes → useApiStatus.recordSuccess()
    │         ├─ Reset consecutiveFailures
    │         ├─ Clear lastError
    │         └─ Set isApiAvailable = true
    └─ No → Repeat error flow
```

### Offline Detection Flow

```
Browser detects connectivity change
    ↓
window.addEventListener('online'/'offline')
    ↓
useApiStatus updates isOnline
    ├─ 'online' → isOnline = true, reset failures
    └─ 'offline' → isOnline = false, isApiAvailable = false
    ↓
Components react to isOnline change
    ├─ Offline → Show cached data if available
    ├─ Online → Attempt to refresh data
    └─ Display connectivity banner
```

## Constraints and Invariants

### Global Invariants

1. **Offline implies API unavailable**: `!isOnline → !isApiAvailable`
2. **Success resets failures**: `successfulRequest → consecutiveFailures = 0`
3. **Three failures mark unavailable**: `consecutiveFailures >= 3 → !isApiAvailable`
4. **Recovery requires success**: `isApiAvailable = false → isApiAvailable = true requires successfulRequest`

### Performance Constraints

1. Request timeout: 30 seconds maximum
2. Slow request threshold: 5 seconds
3. Retry limit: 1 additional attempt (2 total)
4. Retry delay: Exponential backoff (1s, 2s, 4s)
5. Health check interval: 30 seconds during failures

### Concurrency Constraints

1. Maximum concurrent requests: 5-20 (from clarifications)
2. No explicit request queue (handled by browser/Axios)
3. AbortSignal for cancellation on navigation
4. No request deduplication (future enhancement)

### Security Constraints

1. JWT tokens required for authenticated endpoints
2. Tokens stored in httpOnly cookies
3. HTTPS required in production
4. Automatic token refresh before expiration (to be implemented)
5. Max 3 re-authentication attempts per session

## Testing Considerations

### Test Data Requirements

1. Mock ApiStatusState with various failure scenarios
2. Simulate network online/offline events
3. Mock HAL responses with valid and invalid structures
4. Create fixture data for all content types (events, DJs, etc.)
5. Test token expiration edge cases

### Edge Cases to Test

1. Rapid online/offline transitions
2. API returns 200 with malformed JSON
3. Token expires mid-request
4. Multiple concurrent requests fail simultaneously
5. Health check succeeds but data request fails
6. Browser tab inactive during token expiration
7. User navigates away before request completes

## Summary

This data model documents the existing architecture for API integration and availability handling. The key entities are:

- **ApiStatusState**: Global connectivity and health tracking
- **ApiError**: Typed, categorized error information
- **HALResponse**: Standard API response format
- **ServiceRequest/Response**: Request lifecycle tracking

Two enhancements identified from clarifications:
1. **OperationalMetrics**: Structured metrics collection
2. **TokenState**: Proactive JWT token refresh

All entities maintain type safety through TypeScript interfaces and follow Vue 3 reactivity patterns for UI updates.

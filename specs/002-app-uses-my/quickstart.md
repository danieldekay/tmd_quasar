# Quickstart: Testing API Integration & Availability Handling

**Feature**: 002-app-uses-my  
**Date**: October 2, 2025  
**Purpose**: Guide for validating existing API integration and availability handling capabilities

## Overview

This quickstart provides step-by-step instructions for testing and validating the TMD API integration features documented in this specification. Since this is status quo documentation, these tests verify existing functionality rather than testing new implementations.

## Prerequisites

```bash
# Ensure dependencies are installed
cd /Users/dekay/Dokumente/projects/programmieren/tmd_quasar
pnpm install

# Verify API is accessible (local development)
curl http://localhost:10014/wp-json/tmd/v3/events

# Start development server
pnpm dev
```

## Test Scenarios

### Scenario 1: Normal Operation (3-second response time)

**Objective**: Verify API requests complete successfully within 3 seconds

**Steps**:
1. Open application in browser: `http://localhost:9000`
2. Navigate to Events page
3. Open browser DevTools → Network tab
4. Observe API requests to `/tmd/v3/events`

**Expected Results**:
- ✅ Request completes with 200 status
- ✅ Response time < 3000ms (check Network tab timing)
- ✅ Loading indicator displays during request
- ✅ Data renders correctly after load
- ✅ Console shows no errors

**Verification**:
```javascript
// In browser console:
performance.getEntriesByType('resource')
  .filter(r => r.name.includes('/tmd/v3/'))
  .forEach(r => console.log(`${r.name}: ${r.duration}ms`))
// Should show requests < 3000ms
```

### Scenario 2: Network Connection Lost

**Objective**: Verify offline detection and user feedback

**Steps**:
1. Open application with DevTools
2. Go to DevTools → Network tab → Throttling dropdown
3. Select "Offline"
4. Try to navigate to a new page or refresh data

**Expected Results**:
- ✅ Red banner appears: "You appear to be offline"
- ✅ Banner includes guidance to check internet connection
- ✅ Cached data displays if available
- ✅ Retry button is disabled (device is offline)
- ✅ Console shows: "Connection failed" or "NetworkError"

**Verification**:
```javascript
// In browser console:
navigator.onLine  // Should return false
// ApiStatusState should show:
// isOnline: false, isApiAvailable: false
```

### Scenario 3: API Server Unavailable

**Objective**: Verify API unavailability detection after 3 consecutive failures

**Setup**:
```bash
# Stop local WordPress server (if running)
# OR configure app to point to non-existent API
```

**Steps**:
1. With server stopped, open application
2. Navigate to multiple pages requiring API data
3. Observe after 3 failed requests

**Expected Results**:
- ✅ After 3 failures, amber banner appears: "The API is currently unavailable"
- ✅ Banner provides retry option
- ✅ System prevents flooding with rapid retries
- ✅ Console logs: "API request failed" × 3
- ✅ consecutiveFailures counter reaches 3

**Verification**:
```javascript
// In browser console after 3 failures:
// Check ApiStatusState
// Expected: { consecutiveFailures: 3, isApiAvailable: false }
```

### Scenario 4: Slow Network Connection

**Objective**: Verify performance warning for requests > 5 seconds

**Steps**:
1. Open DevTools → Network tab
2. Set throttling to "Slow 3G" or "Fast 3G"
3. Navigate to Events page
4. Monitor console for warnings

**Expected Results**:
- ✅ Request completes (within 30s timeout)
- ✅ Loading indicator persists during slow load
- ✅ Console warning if > 5s: "Slow API request: {url} took {duration}ms"
- ✅ Data eventually renders correctly
- ✅ No timeout errors (if < 30s)

**Verification**:
```bash
# Check network tab for request duration
# Should see requests > 5000ms with console warnings
```

### Scenario 5: Connection Recovery

**Objective**: Verify automatic recovery when connection restored

**Steps**:
1. Set DevTools → Network to "Offline"
2. Confirm offline banner appears
3. Set Network back to "Online"
4. Click retry or navigate to new page

**Expected Results**:
- ✅ System detects online status immediately
- ✅ Offline banner disappears
- ✅ consecutiveFailures resets to 0
- ✅ API requests succeed
- ✅ Visual feedback: banner closes, data loads
- ✅ Console logs: "Connection restored, resetting failure count"

**Verification**:
```javascript
// After reconnection:
navigator.onLine  // Should return true
// ApiStatusState should show:
// { isOnline: true, consecutiveFailures: 0, lastError: null }
```

### Scenario 6: Intermittent Connectivity

**Objective**: Verify retry logic with exponential backoff

**Steps**:
1. Use DevTools → Network tab
2. Toggle offline/online rapidly during page load
3. Observe retry behavior in console

**Expected Results**:
- ✅ Failed requests retry once (max 1 retry)
- ✅ Retry delays: 1s, 2s (exponential backoff)
- ✅ System doesn't mark API unavailable unless 3 consecutive failures
- ✅ Successful retry resets failure counter
- ✅ Console shows retry attempts with delays

**Verification**:
```bash
# Check console timestamps between retry attempts
# Should see ~1-2 second delays between retries
```

## Edge Case Testing

### Edge Case 1: Authentication Expiry During Offline Period

**Setup**:
```javascript
// In browser console, set token to expire soon:
// (This simulates being offline when token expires)
document.cookie = "authToken=expired-token; path=/";
```

**Steps**:
1. Go offline (DevTools → Network → Offline)
2. Wait for token expiration time
3. Go back online
4. Try to access authenticated endpoint

**Expected Results**:
- ✅ System attempts proactive token refresh on reconnection
- ✅ If refresh fails, shows re-authentication prompt
- ✅ Does NOT repeatedly attempt with expired token
- ✅ Background refresh transparent to user (if successful)

### Edge Case 2: Multiple Simultaneous API Calls Failing

**Steps**:
1. Navigate to Dashboard page (loads multiple endpoints)
2. Go offline before requests complete
3. Observe error handling

**Expected Results**:
- ✅ Single aggregated error message (not multiple stacked messages)
- ✅ One retry action that retries all failed requests
- ✅ Clean error display without UI clutter

### Edge Case 3: API Returning Malformed Responses

**Setup**:
```bash
# Configure API to return invalid JSON (requires backend access)
# OR use network intercept tools to corrupt response
```

**Expected Results**:
- ✅ System treats as API error
- ✅ Does not crash application
- ✅ Shows generic error message: "Something went wrong"
- ✅ Error logged to console for debugging

### Edge Case 4: Browser Tab Restored After Inactivity

**Steps**:
1. Open application
2. Switch to another tab for several hours
3. Return to application tab
4. Observe behavior

**Expected Results**:
- ✅ Application refreshes API status on tab focus
- ✅ Does not assume stale connection status
- ✅ Checks connectivity before displaying stale data

### Edge Case 5: Rate Limiting (429 Response)

**Setup**:
```bash
# Trigger rate limiting by making many rapid requests
# OR mock 429 response in API
```

**Expected Results**:
- ✅ System respects rate limits
- ✅ Waits before retrying
- ✅ Shows user-friendly message: "Service temporarily unavailable"
- ✅ Does not flood API with continued requests

## Automated Test Execution

### Run Unit Tests

```bash
# Run all tests
pnpm test --run

# Run specific test suites
pnpm test --run src/services/__tests__/
pnpm test --run src/composables/__tests__/

# Run with coverage
pnpm test --coverage
```

**Expected**: All tests pass, coverage > 80%

### Run API Integration Tests

```bash
# Run API tests against local server
pnpm test --run api-tests/

# Expected endpoints tested:
# - /tmd/v3/events
# - /tmd/v3/djs
# - /tmd/v3/teachers
# - /tmd/v3/event-series
```

**Expected**: All integration tests pass with local API running

### Run E2E Tests (if available)

```bash
# Run end-to-end tests
pnpm test:e2e
```

## Performance Validation

### Measure Concurrent Request Handling

**Test**: Verify 5-20 concurrent requests handled gracefully

```javascript
// In browser console:
const endpoints = [
  '/tmd/v3/events',
  '/tmd/v3/djs',
  '/tmd/v3/teachers',
  '/tmd/v3/couples',
  '/tmd/v3/event-series',
  '/tmd/v3/orchestras',
  '/tmd/v3/brands'
];

// Fire 10 concurrent requests
const baseUrl = 'http://localhost:10014/wp-json';
const requests = endpoints.flatMap(ep => 
  [1, 2].map(n => fetch(`${baseUrl}${ep}?page=${n}`))
);

Promise.all(requests)
  .then(responses => {
    console.log(`Completed ${responses.length} concurrent requests`);
    console.log(`All successful: ${responses.every(r => r.ok)}`);
  });
```

**Expected Results**:
- ✅ All 10-14 concurrent requests complete successfully
- ✅ No timeout errors
- ✅ Performance remains acceptable

### Measure Response Time Distribution

```javascript
// Collect response times
const times = [];
for (let i = 0; i < 20; i++) {
  const start = Date.now();
  await fetch('http://localhost:10014/wp-json/tmd/v3/events');
  times.push(Date.now() - start);
}

// Calculate percentiles
times.sort((a, b) => a - b);
console.log('P50:', times[Math.floor(times.length * 0.5)], 'ms');
console.log('P95:', times[Math.floor(times.length * 0.95)], 'ms');
console.log('Average:', times.reduce((a,b)=>a+b) / times.length, 'ms');
```

**Expected**:
- P50 < 500ms
- P95 < 2000ms
- Average < 3000ms

## Metrics Verification

### Check Operational Metrics (Enhancement)

```javascript
// Once metrics endpoint implemented:
fetch('/api/metrics')
  .then(r => r.json())
  .then(metrics => {
    console.log('Total Requests:', metrics.requestMetrics.totalRequests);
    console.log('Error Rate:', metrics.errorMetrics.errorRate, '%');
    console.log('P50 Response Time:', metrics.performanceMetrics.responseTimeP50, 'ms');
    console.log('Per-Endpoint Stats:', metrics.endpointMetrics);
  });
```

**Expected Metrics** (after implementation):
- ✅ Request count tracked accurately
- ✅ Error rate calculated correctly
- ✅ Response time percentiles captured
- ✅ Per-endpoint statistics available
- ✅ Timeout rate tracked

## Troubleshooting

### Common Issues

**Issue**: Tests fail with "API not accessible"  
**Solution**: Ensure local WordPress server running on port 10014
```bash
# Check if server is running:
curl http://localhost:10014/wp-json/tmd/v3/events
```

**Issue**: Offline detection not working  
**Solution**: Check browser supports `navigator.onLine` and window events
```javascript
console.log('Online support:', 'onLine' in navigator);
window.addEventListener('online', () => console.log('Online event fired'));
window.addEventListener('offline', () => console.log('Offline event fired'));
```

**Issue**: Metrics not available  
**Solution**: This is an enhancement feature - not yet implemented. See data-model.md for implementation requirements.

**Issue**: Token refresh not working  
**Solution**: This is an enhancement feature. Verify JWT tokens are being used and check for refresh implementation.

## Success Criteria

All scenarios pass when:
- ✅ Normal operation completes requests in < 3 seconds
- ✅ Offline detection immediate and accurate
- ✅ API unavailability detected after 3 failures
- ✅ Slow requests log warnings at > 5 seconds
- ✅ Connection recovery automatic and clean
- ✅ Intermittent connectivity handled with proper retries
- ✅ All edge cases handled gracefully
- ✅ Unit tests pass with > 80% coverage
- ✅ API integration tests pass
- ✅ Performance meets targets (5-20 concurrent, < 3s response)

## Next Steps

After validating existing functionality:

1. **Implement Enhancements**:
   - Proactive JWT token refresh
   - Standard operational metrics tracking
   - Metrics endpoint exposure

2. **Write Missing Tests**:
   - Token refresh edge cases
   - Metrics calculation accuracy
   - Concurrent request limit verification

3. **Performance Optimization**:
   - Request deduplication
   - Cache strategy refinement
   - Service worker exploration

4. **Documentation Updates**:
   - Update README with capabilities
   - Add troubleshooting guide
   - Document metrics dashboard integration

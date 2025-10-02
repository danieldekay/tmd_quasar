# Troubleshooting Guide

**TMD Quasar Frontend**  
**Version**: 1.0  
**Last Updated**: October 2, 2025

This guide helps diagnose and resolve common issues with the TMD API integration, authentication, and operational metrics.

---

## Table of Contents

1. [Authentication Issues](#authentication-issues)
2. [Token Refresh Problems](#token-refresh-problems)
3. [API Connection Errors](#api-connection-errors)
4. [Metrics Not Tracking](#metrics-not-tracking)
5. [Performance Issues](#performance-issues)
6. [CORS Errors](#cors-errors)
7. [Offline Mode Issues](#offline-mode-issues)
8. [Debug Tools](#debug-tools)

---

## Authentication Issues

### Problem: 401 Unauthorized Errors

**Symptoms**:
- API requests fail with 401 status
- User redirected to login page
- "Unauthorized" error messages

**Possible Causes**:
1. JWT token expired
2. Token not present in request headers
3. Invalid or corrupted token
4. Server-side token validation failing

**Solutions**:

**Step 1: Check Token Presence**
```javascript
// Open browser console
console.log(localStorage.getItem('authToken'));
console.log(sessionStorage.getItem('authToken'));
```

**Step 2: Verify Token Expiration**
```javascript
// Navigate to /debug page
// Check "Authentication Status" section
// Look for "Token Status" - should show "Valid Token"
```

**Step 3: Try Manual Refresh**
```javascript
// On /debug page, click "Refresh Token" button
// Check if token updates successfully
```

**Step 4: Clear Storage and Re-login**
```javascript
// On /debug page, click "Clear Storage" button
// Navigate to /auth/login
// Log in with valid credentials
```

**Prevention**:
- ✅ Proactive token refresh enabled (5-min threshold)
- ✅ Automatic re-login on 401 (max 3 attempts)
- ℹ️ Check browser console for refresh warnings

---

### Problem: Login Fails Silently

**Symptoms**:
- Login form submission doesn't redirect
- No error message displayed
- Console shows no errors

**Possible Causes**:
1. GraphQL endpoint unreachable
2. Invalid credentials
3. CORS blocking request
4. Network connectivity issue

**Solutions**:

**Step 1: Check Network Tab**
```
1. Open DevTools → Network tab
2. Submit login form
3. Look for POST request to /graphql
4. Check response status and body
```

**Step 2: Verify API Configuration**
```javascript
// Check environment variables
console.log(process.env.WORDPRESS_API_URL);
// Should output: http://localhost:10014/wp-json/tmd/v3 (dev)
```

**Step 3: Test GraphQL Endpoint**
```bash
# Use curl to test GraphQL
curl -X POST http://localhost:10014/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "{ __typename }"}'
```

**Step 4: Check Credentials**
```
1. Verify username/email is correct
2. Verify password is correct
3. Test credentials on WordPress backend
```

---

## Token Refresh Problems

### Problem: Token Refresh Fails Repeatedly

**Symptoms**:
- Console shows "Token refresh failed" warnings
- User redirected to login after 3 attempts
- Proactive refresh not working

**Possible Causes**:
1. Refresh token expired
2. GraphQL refresh mutation not implemented
3. Network connectivity issues
4. Server rejecting refresh token

**Solutions**:

**Step 1: Check Refresh Token**
```javascript
// Check if refresh token exists
console.log(localStorage.getItem('refreshToken'));
// Should be a valid JWT string
```

**Step 2: Verify GraphQL Implementation**
```javascript
// Current status: Mock implementation
// Check src/composables/useTokenRefresh.ts
// Look for performRefresh() function
// Should return Promise.reject("not implemented")
```

**Step 3: Monitor Exponential Backoff**
```javascript
// Open browser console
// Watch for retry attempts:
// Attempt 1: 1 second delay
// Attempt 2: 2 second delay
// Attempt 3: 4 second delay
// After 3 attempts: Redirect to login
```

**Step 4: Test Manual Refresh**
```javascript
// Navigate to /debug page
// Click "Refresh Token" button
// Check console for detailed error
```

**Known Issue**:
⚠️ GraphQL refresh mutation is **mocked** in current implementation.  
The `performRefresh()` function returns `Promise.reject(new Error('Refresh API not implemented'))`.

**Workaround**:
- User will be redirected to login after token expires
- Automatic re-login (max 3 attempts) handles most cases
- Implement real GraphQL mutation for production

---

### Problem: Proactive Refresh Not Triggering

**Symptoms**:
- Token expires without refresh attempt
- 401 errors occur unexpectedly
- Console doesn't show refresh logs

**Possible Causes**:
1. Token state not initialized on login
2. Refresh timer not scheduled
3. shouldRefresh computed not calculating correctly

**Solutions**:

**Step 1: Verify Token State Initialization**
```javascript
// After login, check console for:
// "Token state initialized" log message
// If missing, token refresh not initialized
```

**Step 2: Check Axios Interceptor**
```javascript
// Open src/boot/axios.ts
// Verify request interceptor checks shouldRefresh.value
// Should see log: "Proactive token refresh triggered"
```

**Step 3: Calculate Time Until Refresh**
```javascript
// In browser console
import { useTokenRefresh } from 'src/composables/useTokenRefresh';
const { tokenState, shouldRefresh } = useTokenRefresh();
console.log('Token expires at:', tokenState.value.expiresAt);
console.log('Should refresh:', shouldRefresh.value);
```

**Step 4: Verify AuthStore Integration**
```javascript
// Check src/stores/authStore.ts
// Verify login() calls initializeTokenState()
// Verify logout() calls clearTokenState()
```

---

## API Connection Errors

### Problem: "Network Error" on All Requests

**Symptoms**:
- All API requests fail
- Console shows "Network Error"
- No response data available

**Possible Causes**:
1. API server not running
2. Incorrect API URL
3. CORS misconfiguration
4. Firewall blocking requests

**Solutions**:

**Step 1: Verify API Server**
```bash
# Test if API is reachable
curl http://localhost:10014/wp-json/tmd/v3/events

# Should return JSON response
# If "Connection refused" → server not running
```

**Step 2: Start Local API Server**
```bash
# Using Local.app (macOS)
1. Open Local app
2. Start "tmd" site
3. Verify "Running" status
```

**Step 3: Check API URL Configuration**
```javascript
// In browser console
import { api } from 'boot/axios';
console.log(api.defaults.baseURL);
// Should match: http://localhost:10014/wp-json/tmd/v3
```

**Step 4: Test API Connection**
```
1. Navigate to /debug page
2. Click "Test API Connection" button
3. Check notification message
```

**Step 5: Check Network Tab**
```
1. Open DevTools → Network tab
2. Trigger API request
3. Check request status:
   - "(failed)" → Network error
   - Red status → Server error
   - Check response preview for details
```

---

### Problem: Intermittent Connection Failures

**Symptoms**:
- Some requests succeed, others fail
- No pattern to failures
- Error rate elevated in metrics

**Possible Causes**:
1. Unstable network connection
2. API server overloaded
3. Timeout issues
4. DNS resolution problems

**Solutions**:

**Step 1: Check Metrics Dashboard**
```
1. Navigate to /debug page
2. Scroll to "API Metrics" section
3. Check error breakdown:
   - High network errors → Connection issue
   - High server errors → API problem
   - High client errors → Request issue
```

**Step 2: Monitor Request Duration**
```
1. Check P95/P99 response times
2. If >10 seconds → Performance issue
3. If timeout (30s) → Server problem
```

**Step 3: Test Network Stability**
```bash
# Ping API server
ping localhost

# Should show consistent response times
# If packet loss → Network issue
```

**Step 4: Check Server Logs**
```bash
# Check WordPress debug log
tail -f /path/to/wp-content/debug.log

# Look for PHP errors or warnings
```

---

## Metrics Not Tracking

### Problem: Metrics Show Zero Requests

**Symptoms**:
- /debug page shows 0 total requests
- No data in metrics dashboard
- Export returns empty metrics

**Possible Causes**:
1. Metrics not initialized
2. Axios interceptors not registered
3. recordRequest() not called
4. Metrics cleared recently

**Solutions**:

**Step 1: Verify Axios Integration**
```javascript
// Check src/boot/axios.ts
// Look for useMetrics() import
// Verify recordRequest() called in response interceptor
```

**Step 2: Test Metrics Recording**
```javascript
// Make API request
await api.get('/events?per_page=1');

// Check metrics immediately
import { getMetrics } from 'src/services/metricsService';
console.log(getMetrics());
// Should show totalRequests > 0
```

**Step 3: Check Browser Console**
```
1. Look for errors during boot
2. Search for "useMetrics" errors
3. Check if composable initialized
```

**Step 4: Reset and Retry**
```
1. Navigate to /debug page
2. Click "Reset Metrics" button
3. Trigger some API requests
4. Click "Refresh Metrics" button
5. Verify metrics updated
```

---

### Problem: Metrics Not Updating in Real-Time

**Symptoms**:
- Metrics dashboard shows stale data
- Recent requests not reflected
- Need to refresh page to see updates

**Possible Causes**:
1. Metrics not reactive
2. Cache issue
3. Component not re-rendering

**Solutions**:

**Step 1: Click Refresh Button**
```
1. Navigate to /debug page
2. Click refresh icon in "API Metrics" section
3. Metrics should update immediately
```

**Step 2: Verify Reactive State**
```javascript
// Check src/pages/DebugPage.vue
// Verify metrics computed property uses getMetrics()
// Should be reactive to changes
```

**Step 3: Check Time Window**
```
1. Metrics use 1-hour rolling window
2. Old requests (>1 hour) automatically pruned
3. Verify "Time Window" shows recent samples
```

---

## Performance Issues

### Problem: Slow API Requests

**Symptoms**:
- Requests take >5 seconds
- UI feels sluggish
- Console shows "Slow request detected" warnings

**Possible Causes**:
1. Large dataset queries
2. Complex meta filters
3. Server performance issues
4. Network latency
5. Missing pagination

**Solutions**:

**Step 1: Check Request Parameters**
```javascript
// Review query parameters
// Avoid:
per_page: 100 // Too large
_embed: true  // Adds overhead
// Use pagination and limit per_page
```

**Step 2: Use Concurrent Requests**
```javascript
// ❌ Avoid sequential
const events = await api.get('/events');
const djs = await api.get('/djs');

// ✅ Use concurrent
const [events, djs] = await Promise.all([
  api.get('/events'),
  api.get('/djs'),
]);
```

**Step 3: Check Metrics Dashboard**
```
1. Navigate to /debug page
2. Check "Response Time Percentiles"
3. If P95 > 3s → Investigation needed
4. Check "Top Endpoints" table
5. Identify slow endpoints
```

**Step 4: Optimize Queries**
```javascript
// Use selective field inclusion
api.get('/events', {
  params: {
    per_page: 20,
    meta_fields: 'title,start_date', // Only needed fields
    _embed: false, // Disable if not needed
  },
});
```

**Step 5: Server-Side Investigation**
```bash
# Check WordPress debug log
tail -f wp-content/debug.log

# Look for slow query warnings
# Check database performance
```

---

### Problem: High Error Rate

**Symptoms**:
- Metrics show >10% error rate
- Frequent error notifications
- Users report issues

**Possible Causes**:
1. API instability
2. Invalid request parameters
3. Authentication issues
4. Server overload

**Solutions**:

**Step 1: Check Error Breakdown**
```
1. Navigate to /debug page
2. Check "Error Breakdown" section
3. Identify error type:
   - Network errors → Connection issue
   - Server errors → API problem
   - Client errors → Request issue
```

**Step 2: Network Errors**
```
Symptoms: High network errors
Solution:
1. Check network connectivity
2. Verify API server running
3. Test DNS resolution
4. Check firewall settings
```

**Step 3: Server Errors (5xx)**
```
Symptoms: High server errors
Solution:
1. Check WordPress debug log
2. Verify server resources (CPU, memory)
3. Check database connection
4. Review PHP error logs
```

**Step 4: Client Errors (4xx)**
```
Symptoms: High client errors
Solution:
1. Review request parameters
2. Check authentication status
3. Verify endpoint URLs
4. Test with valid data
```

**Step 5: Export and Analyze**
```
1. Click "Export Metrics" button
2. Review JSON file for patterns
3. Identify problematic endpoints
4. Check timestamp distribution
```

---

## CORS Errors

### Problem: "CORS policy" Error in Console

**Symptoms**:
- Requests blocked by CORS policy
- Console shows CORS error
- Network tab shows "(CORS error)"

**Possible Causes**:
1. API server CORS not configured
2. Incorrect origin in requests
3. Missing CORS headers
4. Preflight request failing

**Solutions**:

**Step 1: Verify API CORS Configuration**
```php
// In WordPress (tmd_core plugin)
// Check if CORS headers are set:
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
```

**Step 2: Check Preflight Requests**
```
1. Open DevTools → Network tab
2. Look for OPTIONS request before actual request
3. Verify OPTIONS returns 200 OK
4. Check response headers:
   - Access-Control-Allow-Origin
   - Access-Control-Allow-Methods
   - Access-Control-Allow-Headers
```

**Step 3: Local Development Workaround**
```javascript
// For local dev, use proxy in quasar.config.ts
devServer: {
  proxy: {
    '/wp-json': {
      target: 'http://localhost:10014',
      changeOrigin: true,
    },
  },
}
```

**Step 4: Production Configuration**
```
Ensure production API has proper CORS headers
OR use same-origin deployment (recommended)
```

---

## Offline Mode Issues

### Problem: App Doesn't Work Offline

**Symptoms**:
- All requests fail when offline
- No cached data available
- Error messages flood screen

**Current Behavior**:
- ✅ Token refresh fails gracefully when offline
- ✅ Existing token used for requests
- ✅ Auto-refresh on reconnection
- ❌ No offline data caching (not implemented)

**Solutions**:

**Step 1: Verify Online Status**
```javascript
// Check online status
console.log(navigator.onLine); // true/false

// On /debug page, check "Browser Information"
// "Online Status" should show current state
```

**Step 2: Test Reconnection**
```
1. Go offline (DevTools → Network → Offline)
2. Attempt API request (will fail)
3. Go online
4. Automatic reconnection handling:
   - Token refresh triggers
   - Pending requests retry
```

**Step 3: Known Limitations**
```
⚠️ Offline caching NOT implemented
⚠️ Service Worker NOT configured
⚠️ No PWA offline support

Current strategy: Fail gracefully + retry on reconnect
```

**Future Enhancement**:
- Implement Service Worker
- Add offline data caching
- Create offline indicator in UI
- Queue requests for retry

---

## Debug Tools

### Debug Page (`/debug`)

**Available Information**:
- ✅ Authentication status
- ✅ User details and roles
- ✅ Token status
- ✅ API configuration
- ✅ API endpoints list
- ✅ Frontend routes
- ✅ Environment variables
- ✅ Browser information
- ✅ Storage information
- ✅ **API Metrics** (new)
  - Total requests & success rate
  - Response time percentiles
  - Error breakdown
  - Top endpoints
  - Time window info

**Available Actions**:
- Refresh Token
- Logout
- Test API Connection
- Clear Storage
- **Reset Metrics** (new)
- **Export Metrics** (new)

### Browser Console Commands

**Check Authentication**:
```javascript
import { useAuthStore } from 'stores/authStore';
const auth = useAuthStore();
console.log('Authenticated:', auth.isAuthenticated);
console.log('User:', auth.user);
console.log('Token:', auth.token);
```

**Check Metrics**:
```javascript
import { getMetrics, getMetricsSummary } from 'services/metricsService';
console.log(getMetrics());
console.log(getMetricsSummary());
```

**Manual Token Refresh**:
```javascript
import { useTokenRefresh } from 'composables/useTokenRefresh';
const { refreshToken } = useTokenRefresh();
await refreshToken();
```

**Test API Request**:
```javascript
import { api } from 'boot/axios';
const response = await api.get('/events?per_page=1');
console.log('Response:', response.data);
```

### Enable Verbose Logging

```javascript
// In browser console
localStorage.setItem('DEBUG', 'api:*');
// Reload page to enable debug logs
```

### Network Tab Analysis

**Check Request Details**:
1. Open DevTools → Network tab
2. Filter by "XHR" or "Fetch"
3. Click request to see:
   - Headers (Authorization, Content-Type)
   - Payload (request body)
   - Response (data returned)
   - Timing (duration breakdown)

**Common Issues**:
- No Authorization header → Token not added
- 401 status → Authentication failed
- Long duration → Performance issue
- (failed) → Network error

---

## Getting Help

If you can't resolve the issue using this guide:

1. **Check Documentation**:
   - [API Integration Guide](./api-integration.md)
   - [API Documentation](./api.md)
   - [Edge Case Testing](./edge-case-testing.md)

2. **Export Diagnostics**:
   ```
   1. Navigate to /debug page
   2. Click "Export Metrics"
   3. Save browser console output
   4. Take screenshots if relevant
   ```

3. **Report Issue**:
   - Include metrics export
   - Include console errors
   - Include steps to reproduce
   - Include expected vs actual behavior

4. **Contact Support**:
   - GitHub Issues: [tmd_quasar repository]
   - Include diagnostic information
   - Tag as "bug" or "question"

---

## Quick Reference

| Symptom | Likely Cause | Quick Fix |
|---------|--------------|-----------|
| 401 errors | Token expired | Refresh token or re-login |
| Network error | API not running | Start local server |
| CORS error | Missing headers | Check API CORS config |
| Slow requests | Large dataset | Use pagination |
| High error rate | API instability | Check metrics dashboard |
| Metrics zero | Not initialized | Reset and retry |
| Offline fails | No cache | Expected (cache not impl.) |

---

**Document Version**: 1.0  
**Last Updated**: October 2, 2025  
**Covers**: Authentication, Metrics, API Integration, Performance

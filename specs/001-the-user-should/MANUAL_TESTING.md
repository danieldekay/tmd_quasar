# Manual Testing Guide: Authentication & Session Management

**Feature**: TMD User Authentication  
**Version**: v1.0.0  
**Date**: October 1, 2025

## Overview

This guide provides step-by-step instructions for manually testing the authentication
system with the real TMD backend. Complete all test cases before marking the feature
as production-ready.

---

## Prerequisites

### Backend Setup
- [ ] TMD WordPress backend running at `http://localhost:10014`
- [ ] WPGraphQL plugin installed and activated
- [ ] JWT Authentication for WPGraphQL plugin installed and activated
- [ ] Test user account created with known credentials
- [ ] CORS configured to allow frontend origin

### Frontend Setup
- [ ] Quasar dev server running: `pnpm dev`
- [ ] Browser DevTools open (Console + Network tabs)
- [ ] localStorage inspector ready
- [ ] Test credentials available

### Test Credentials
```json
{
  "username": "testuser",
  "password": "testpassword",
  "email": "test@test.com"
}
```

---

## Test Suite 1: Login Flow

### TC001: Successful Login
**Objective**: Verify user can login with valid credentials

**Steps**:
1. Navigate to `/auth/login`
2. Enter valid username
3. Enter valid password
4. Check "Remember me" checkbox
5. Click "Sign In" button

**Expected Results**:
- [ ] Loading indicator shown during authentication
- [ ] Success notification appears
- [ ] User redirected to home page (`/`)
- [ ] SessionIndicator shows user info in header
- [ ] localStorage contains `tmd_session` key
- [ ] localStorage contains `tmd_user` key
- [ ] No errors in console

**Verification**:
```javascript
// In browser console:
JSON.parse(localStorage.getItem('tmd_session'))
// Should show: { token, refreshToken, expiresAt, ... }

JSON.parse(localStorage.getItem('tmd_user'))
// Should show: { id, username, email, displayName, roles, ... }
```

---

### TC002: Failed Login - Invalid Credentials
**Objective**: Verify proper error handling for wrong credentials

**Steps**:
1. Navigate to `/auth/login`
2. Enter invalid username
3. Enter invalid password
4. Click "Sign In" button

**Expected Results**:
- [ ] Loading indicator shown
- [ ] Error notification appears
- [ ] Error message: "Invalid username or password" (or similar)
- [ ] User stays on login page
- [ ] Password field cleared
- [ ] loginAttempts counter incremented
- [ ] No session data in localStorage

---

### TC003: Progressive Delay Protection
**Objective**: Verify brute force protection works

**Steps**:
1. Attempt login with wrong credentials (1st attempt)
2. Note delay: should be 0 seconds
3. Attempt login with wrong credentials (2nd attempt)
4. Note delay: should be 1 second
5. Attempt login with wrong credentials (3rd attempt)
6. Note delay: should be 5 seconds
7. Attempt login with wrong credentials (4th attempt)
8. Note delay: should be 30 seconds

**Expected Results**:
- [ ] 1st attempt: immediate submission
- [ ] 2nd attempt: 1 second delay message shown
- [ ] 3rd attempt: 5 second delay message shown
- [ ] 4th+ attempts: 30 second delay message shown
- [ ] Submit button disabled during delay
- [ ] Delay countdown visible to user
- [ ] Progressive delays persist across page reload

**Verification**:
```javascript
// Check authStore state:
useAuthStore().loginAttempts // Should increment
useAuthStore().getProgressiveDelay() // Should return delay in ms
```

---

### TC004: Form Validation
**Objective**: Verify client-side validation

**Steps**:
1. Navigate to `/auth/login`
2. Leave username empty, click "Sign In"
3. Fill username, leave password empty, click "Sign In"
4. Fill both fields with whitespace only, click "Sign In"

**Expected Results**:
- [ ] Empty username shows validation error
- [ ] Empty password shows validation error
- [ ] Whitespace-only fields treated as empty
- [ ] Submit button disabled when form invalid
- [ ] No API calls made with invalid data

---

## Test Suite 2: Session Management

### TC005: Session Restoration on Page Reload
**Objective**: Verify session persists across page reloads

**Steps**:
1. Login successfully
2. Navigate to `/events`
3. Reload page (F5)
4. Wait for app to load

**Expected Results**:
- [ ] User remains authenticated
- [ ] No redirect to login
- [ ] SessionIndicator shows user info
- [ ] Protected content visible
- [ ] No re-login required

**Verification**:
```javascript
// Check session restoration:
useAuthStore().isAuthenticated // Should be true
useAuthStore().user // Should have user data
```

---

### TC006: Session Expiration Handling
**Objective**: Verify expired session handling

**Steps**:
1. Login successfully
2. Manually expire session in localStorage:
   ```javascript
   const session = JSON.parse(localStorage.getItem('tmd_session'));
   session.expiresAt = new Date(Date.now() - 1000).toISOString();
   localStorage.setItem('tmd_session', JSON.stringify(session));
   ```
3. Reload page or navigate to protected route

**Expected Results**:
- [ ] Session detected as expired
- [ ] Attempt to refresh token
- [ ] If refresh fails, redirect to login
- [ ] Error message shown
- [ ] localStorage cleared

---

### TC007: Token Refresh Before Expiration
**Objective**: Verify automatic token refresh

**Steps**:
1. Login successfully
2. Wait until token is close to expiration (simulate by setting expiresAt soon)
3. Observe SessionIndicator component

**Expected Results**:
- [ ] Expiration warning shown when < 5 minutes remaining
- [ ] Yellow/orange indicator color
- [ ] Countdown timer visible
- [ ] Automatic refresh attempted
- [ ] New token saved to localStorage
- [ ] No interruption to user experience

---

### TC008: Manual Logout
**Objective**: Verify logout clears session

**Steps**:
1. Login successfully
2. Click on SessionIndicator (user avatar/name)
3. Click "Sign Out" in menu

**Expected Results**:
- [ ] Confirmation (optional)
- [ ] Session cleared from localStorage
- [ ] User redirected to `/auth/login`
- [ ] All auth state reset
- [ ] Protected routes inaccessible
- [ ] Success notification shown

**Verification**:
```javascript
// After logout:
localStorage.getItem('tmd_session') // Should be null
localStorage.getItem('tmd_user') // Should be null
useAuthStore().isAuthenticated // Should be false
useAuthStore().user // Should be null
```

---

## Test Suite 3: Route Protection

### TC009: Protected Routes Redirect to Login
**Objective**: Verify unauthenticated users can't access protected content

**Steps**:
1. Ensure logged out
2. Try to access `/events`
3. Try to access `/djs`
4. Try to access `/profile`
5. Try to access `/dashboard`

**Expected Results**:
- [ ] Redirected to `/auth/login` for each route
- [ ] `redirect` query parameter contains intended route
- [ ] Error message or info notification (optional)
- [ ] After login, redirected to intended route

---

### TC010: Authenticated Users Can't Access Login
**Objective**: Verify logged-in users redirected away from login

**Steps**:
1. Login successfully
2. Navigate to `/auth/login`

**Expected Results**:
- [ ] Immediately redirected to home (`/`)
- [ ] Or redirected to `redirect` query param if present
- [ ] Login form not shown
- [ ] No API call attempted

---

### TC011: Role-Based Access Control
**Objective**: Verify role-specific routes protected

**Steps**:
1. Login as regular user
2. Try to access `/debug` (admin-only route)

**Expected Results**:
- [ ] Redirected to `/auth/unauthorized`
- [ ] Unauthorized message shown
- [ ] Option to go back or logout
- [ ] User remains authenticated

---

## Test Suite 4: Password Reset

### TC012: Password Reset Redirect
**Objective**: Verify password reset redirects to WordPress

**Steps**:
1. Navigate to `/auth/login`
2. Click "Forgot password?" link

**Expected Results**:
- [ ] Opens in new tab/window
- [ ] URL: `http://localhost:10014/wp-login.php?action=lostpassword`
- [ ] WordPress password reset page shown
- [ ] Frontend login page remains in original tab
- [ ] No frontend password reset form

---

## Test Suite 5: Accessibility

### TC013: Keyboard Navigation
**Objective**: Verify full keyboard accessibility

**Steps**:
1. Navigate to `/auth/login`
2. Tab through form elements
3. Use Enter to submit
4. Use Space to toggle checkboxes
5. Navigate SessionIndicator menu with keyboard

**Expected Results**:
- [ ] All elements reachable via Tab
- [ ] Clear focus indicators
- [ ] Enter submits form
- [ ] Space toggles remember me checkbox
- [ ] Escape closes menus
- [ ] Tab order logical

---

### TC014: Screen Reader Compatibility
**Objective**: Verify screen reader accessibility

**Requirements**: Enable screen reader (VoiceOver on Mac, NVDA on Windows)

**Steps**:
1. Navigate login form with screen reader
2. Listen to field labels and error announcements
3. Submit form and listen to feedback

**Expected Results**:
- [ ] All labels announced correctly
- [ ] Field descriptions clear
- [ ] Error messages announced
- [ ] Loading states announced
- [ ] Success/failure feedback announced
- [ ] No "clickable" or generic labels

---

## Test Suite 6: Mobile Testing

### TC015: Mobile Login Flow
**Objective**: Verify authentication works on mobile devices

**Devices to Test**:
- [ ] iPhone (Safari)
- [ ] Android (Chrome)
- [ ] Tablet (iPad Safari or Android Chrome)

**Steps**:
1. Open app on mobile device
2. Navigate to login
3. Complete login flow
4. Test navigation
5. Test logout

**Expected Results**:
- [ ] Form responsive and usable
- [ ] Touch targets adequate (44x44px minimum)
- [ ] No keyboard issues
- [ ] SessionIndicator accessible
- [ ] No horizontal scrolling
- [ ] All features functional

---

## Test Suite 7: Error Scenarios

### TC016: Network Errors
**Objective**: Verify graceful handling of network issues

**Steps**:
1. Enable offline mode in DevTools
2. Try to login
3. Disable offline mode
4. Retry login

**Expected Results**:
- [ ] Network error message shown
- [ ] No unhandled exceptions
- [ ] User can retry
- [ ] Clear error message
- [ ] No corrupted state

---

### TC017: Malformed Backend Responses
**Objective**: Verify handling of unexpected API responses

**Steps**: (Requires backend manipulation or mocking)
1. Configure backend to return malformed GraphQL response
2. Attempt login

**Expected Results**:
- [ ] Error caught and handled
- [ ] Generic error message shown
- [ ] No app crash
- [ ] Console error logged for debugging
- [ ] User can retry

---

## Test Suite 8: Performance

### TC018: Login Performance
**Objective**: Verify authentication meets performance targets

**Steps**:
1. Open browser DevTools Performance tab
2. Start recording
3. Login with valid credentials
4. Stop recording when redirected

**Expected Results**:
- [ ] Total time < 2 seconds (including network)
- [ ] Client-side processing < 200ms
- [ ] No long tasks (>50ms) blocking UI
- [ ] Smooth animations
- [ ] No jank or lag

**Verification**:
```javascript
// Measure in browser console:
performance.mark('login-start');
// ... perform login ...
performance.mark('login-end');
performance.measure('login', 'login-start', 'login-end');
performance.getEntriesByName('login')[0].duration; // Should be < 200ms (client-side)
```

---

### TC019: Session Restoration Performance
**Objective**: Verify fast session restoration

**Steps**:
1. Login and ensure session stored
2. Reload page with DevTools Performance recording
3. Measure time to restore session

**Expected Results**:
- [ ] Session restoration < 100ms
- [ ] No UI blocking
- [ ] No flash of login screen
- [ ] Smooth loading experience

---

## Test Suite 9: Security Validation

### TC020: Token Not Exposed in Console
**Objective**: Verify tokens aren't logged

**Steps**:
1. Clear console
2. Login successfully
3. Review all console logs

**Expected Results**:
- [ ] No JWT tokens in console
- [ ] No refresh tokens visible
- [ ] No password echoed
- [ ] Only non-sensitive debug info

---

### TC021: Token Not in URL
**Objective**: Verify tokens not in URL parameters

**Steps**:
1. Login successfully
2. Navigate through app
3. Check URL bar

**Expected Results**:
- [ ] No tokens in URL
- [ ] No sensitive data in query parameters
- [ ] Clean URLs throughout

---

### TC022: HTTPS Enforcement (Production Only)
**Objective**: Verify HTTPS required in production

**Steps**: (In production environment)
1. Try to access `http://` URL
2. Check redirect to `https://`

**Expected Results**:
- [ ] Automatic redirect to HTTPS
- [ ] Secure connection indicator in browser
- [ ] No mixed content warnings

---

## Checklist Summary

### Critical Tests (Must Pass)
- [ ] TC001: Successful Login
- [ ] TC002: Failed Login - Invalid Credentials
- [ ] TC005: Session Restoration
- [ ] TC008: Manual Logout
- [ ] TC009: Protected Routes Redirect
- [ ] TC020: Token Not Exposed

### Important Tests (Should Pass)
- [ ] TC003: Progressive Delay Protection
- [ ] TC006: Session Expiration Handling
- [ ] TC010: Authenticated Users Can't Access Login
- [ ] TC013: Keyboard Navigation
- [ ] TC015: Mobile Login Flow
- [ ] TC018: Login Performance

### Nice-to-Have Tests (Recommended)
- [ ] TC007: Token Refresh
- [ ] TC011: Role-Based Access Control
- [ ] TC014: Screen Reader Compatibility
- [ ] TC016: Network Errors
- [ ] TC019: Session Restoration Performance

---

## Bug Report Template

If you encounter issues during testing, use this template:

```markdown
### Bug Report

**Test Case**: [TC number and name]
**Severity**: [Critical / High / Medium / Low]
**Environment**: [Browser, OS, Device]

**Steps to Reproduce**:
1. 
2. 
3. 

**Expected Result**:


**Actual Result**:


**Screenshots/Videos**: [Attach if applicable]

**Console Errors**: [Paste relevant console output]

**Additional Notes**:

```

---

## Sign-Off

After completing all test cases:

**Tester Name**: ___________________________  
**Date**: ___________________________  
**Critical Tests Passed**: ___/6  
**Important Tests Passed**: ___/6  
**Nice-to-Have Tests Passed**: ___/6  

**Overall Result**: [ ] PASS  [ ] FAIL  [ ] PASS WITH MINOR ISSUES

**Notes**:


**Approved for Production**: [ ] YES  [ ] NO

---

## Next Steps

1. **If All Tests Pass**: Ready for production deployment
2. **If Minor Issues**: Document and create tickets for future fixes
3. **If Critical Issues**: Fix immediately before deployment
4. **Performance Issues**: Profile and optimize before production

**Recommendation**: _______________________

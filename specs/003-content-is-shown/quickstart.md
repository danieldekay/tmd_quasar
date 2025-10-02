# Content Tables & Details - Quickstart Guide

**Feature ID**: 003-content-is-shown  
**Version**: 1.0.0  
**Last Updated**: 2025-10-02

## Purpose

This quickstart provides validation steps for the standardized content tables and detail views feature. Use these flows to verify that all content types display correctly with proper authentication, sorting, pagination, filtering, and error handling.

## Prerequisites

- TMD Quasar application running locally or deployed
- Valid TMD user credentials (authentication required per FR-001)
- WordPress REST API (TMD v3) accessible at configured endpoint
- Browser developer tools open for console/network inspection

## Quick Validation Checklist

For rapid verification, test this minimum set:

- [ ] Events table loads with data
- [ ] Events table sorts by Date
- [ ] Click event row → detail view opens
- [ ] Detail view shows all event fields
- [ ] DJs table loads with data
- [ ] Teachers table loads with data
- [ ] Logout → table redirects to login

## User Flow 1: Events Table & Detail

### Step 1: Navigate to Events

1. Log in to TMD Quasar application
2. Click "Events" in navigation menu
3. Wait for table to load

**Expected Result**:

- Table displays with 7 columns: Title, Date, City, Country, Organizer, Type, ID
- Data loads from API (check network tab for `/wp-json/tmd/v3/events`)
- Loading spinner shows during fetch
- Pagination controls visible if > 10 items

**Verification Points**:

- FR-001: Authentication required (redirects if not logged in)
- FR-002: All events displayed in table
- FR-003: Correct columns per table-columns.json
- FR-007: Loading indicator present

### Step 2: Test Sorting

1. Click "Date" column header
2. Observe rows reorder (ascending)
3. Click "Date" header again
4. Observe rows reorder (descending)

**Expected Result**:

- Dates sort correctly in ISO format (YYYY-MM-DD)
- Sort indicator (arrow) changes direction
- Table updates without page reload

**Verification Points**:

- FR-005: Column sorting functional
- FR-015: ISO date format used

### Step 3: Test Pagination

1. If table has > 10 items, verify pagination controls visible
2. Click "Next" page button
3. Observe new set of rows load
4. Click "Previous" page button

**Expected Result**:

- Page navigation smooth
- Rows per page selector available (10, 25, 50)
- Current page number displayed
- API request includes `page` and `per_page` params

**Verification Points**:

- FR-006: Pagination controls present and functional

### Step 4: Test Filtering

1. Use table filter/search input (if available)
2. Type "Berlin" (or any city name)
3. Observe table filter results

**Expected Result**:

- Table filters to matching rows only
- Filter applies across all visible columns
- Empty state shows if no matches

**Verification Points**:

- FR-006: Basic filtering functional

### Step 5: Open Detail View

1. Click any event row in table
2. Wait for detail view to load

**Expected Result**:

- Navigation to `/events/{id}` route
- Detail view displays all event fields per data-model.md
- HAL embedded data shows (organizers, locations, etc.)
- Date fields in ISO format
- No image fields displayed (per FR-016)

**Verification Points**:

- FR-004: Row click navigates to detail
- FR-010: All data fields visible
- FR-011: Embedded relationships display
- FR-015: ISO date format
- FR-016: No image display

### Step 6: Return to Table

1. Click "Back" button or browser back
2. Verify return to events table

**Expected Result**:

- Table maintains previous state (page, sort, filter)
- No data reload unless stale

**Verification Points**:

- Navigation flow smooth
- State persistence functional

## User Flow 2: DJs Table & Detail

### Step 1: Navigate to DJs

1. Click "DJs" in navigation menu
2. Wait for table to load

**Expected Result**:

- Table displays with 6 columns: Name, City, Country, Active Status, ID, Actions (computed)
- Data loads from `/wp-json/tmd/v3/djs`
- 1149 DJs total (may paginate)

**Verification Points**:

- FR-001: Authentication required
- FR-002: All DJs displayed
- FR-003: Correct columns per table-columns.json

### Step 2: Test Computed Fields

1. Verify "Actions" column displays computed value
2. Check "Active Status" displays "active" or "not active"

**Expected Result**:

- Computed fields render correctly
- Fallback logic works if field missing

**Verification Points**:

- FR-014: Computed fields functional

### Step 3: Test Sorting & Pagination

1. Sort by "Name" column
2. Navigate through pages if > 10 DJs

**Expected Result**:

- Sorting works alphabetically
- Pagination smooth

**Verification Points**:

- FR-005: Sorting functional
- FR-006: Pagination functional

### Step 4: Open DJ Detail

1. Click any DJ row
2. Verify detail view loads

**Expected Result**:

- All DJ fields display per data-model.md
- Country code transformed to full name
- Related events list (if available)
- ISO date for `dj_start_date_tango` field

**Verification Points**:

- FR-010: All fields visible
- FR-012: Country code transformation
- FR-015: ISO date format

## User Flow 3: Teachers Table & Detail

### Step 1: Navigate to Teachers

1. Click "Teachers" in navigation menu
2. Wait for table to load

**Expected Result**:

- Table displays with 6 columns: Name, City, Country, Active Status, ID, Role (secondary)
- Data loads from `/wp-json/tmd/v3/teachers`
- 158 teachers total

**Verification Points**:

- FR-001: Authentication required
- FR-002: All teachers displayed
- FR-003: Correct columns per table-columns.json

### Step 2: Verify Secondary Display Field

1. Check "Role" column (secondary display field)
2. Verify it shows `teacher_role` or fallback

**Expected Result**:

- Secondary field displays correctly
- Falls back gracefully if missing

**Verification Points**:

- FR-013: Secondary display fields functional

### Step 3: Open Teacher Detail

1. Click any teacher row
2. Verify detail view loads

**Expected Result**:

- All teacher fields display
- Teaching style, specialties visible
- Related couples/events (if available)

**Verification Points**:

- FR-010: All fields visible
- FR-011: Embedded relationships display

## User Flow 4: Couples Table & Detail

### Step 1: Navigate to Couples

1. Click "Couples" in navigation menu
2. Wait for table to load

**Expected Result**:

- Table displays with 6 columns: Name, Teachers, City, Country, Active, ID
- Data loads from `/wp-json/tmd/v3/couples`
- 66 couples total

**Verification Points**:

- FR-001: Authentication required
- FR-002: All couples displayed
- FR-003: Correct columns per table-columns.json

### Step 2: Verify Computed Teachers Field

1. Check "Teachers" column (computed from HAL links)
2. Verify it displays both teacher names or IDs

**Expected Result**:

- Computed field shows teacher relationship
- Falls back to IDs if names unavailable

**Verification Points**:

- FR-014: Computed fields functional

### Step 3: Open Couple Detail

1. Click any couple row
2. Verify detail view loads

**Expected Result**:

- All couple fields display
- Both teachers shown with links
- Related events/workshops

**Verification Points**:

- FR-010: All fields visible
- FR-011: Embedded relationships display

## User Flow 5: Event Series Table & Detail

### Step 1: Navigate to Event Series

1. Click "Event Series" in navigation menu
2. Wait for table to load

**Expected Result**:

- Table displays with 6 columns: Title, Organizer, Location, Type, Active, ID
- Data loads from `/wp-json/tmd/v3/event-series`
- 72 event series total

**Verification Points**:

- FR-001: Authentication required
- FR-002: All event series displayed
- FR-003: Correct columns per table-columns.json

### Step 2: Test Computed Location Field

1. Check "Location" column (computed from city/country)
2. Verify format: "City, Country"

**Expected Result**:

- Computed location displays correctly
- Falls back gracefully if partial data

**Verification Points**:

- FR-014: Computed fields functional

### Step 3: Open Event Series Detail

1. Click any event series row
2. Verify detail view loads

**Expected Result**:

- All event series fields display
- Related events list shows
- Organizer details visible

**Verification Points**:

- FR-010: All fields visible
- FR-011: Related events display

## Error Flow Testing

### Test 1: Network Error

1. Disconnect internet or block API endpoint
2. Navigate to any table page
3. Observe error handling

**Expected Result**:

- Error message displays per error-messages.json
- "Retry" button available
- No blank page or crash

**Verification Points**:

- FR-008: Network error handling
- FR-019: User-friendly error messages

### Test 2: 404 Not Found

1. Navigate to non-existent detail page: `/events/99999`
2. Observe error handling

**Expected Result**:

- 404 error message displays
- "Go Back" button available
- No console errors

**Verification Points**:

- FR-008: HTTP error handling
- FR-019: Specific error messages

### Test 3: 401 Unauthorized

1. Log out or delete auth token from localStorage
2. Navigate to any table page
3. Observe redirect

**Expected Result**:

- Redirects to login page
- "Authentication Required" message (optional)
- After login, redirects back to original page

**Verification Points**:

- FR-001: Authentication enforcement
- FR-009: Auth error handling

### Test 4: Empty Table

1. Apply filter that matches no results
2. Observe empty state

**Expected Result**:

- "No Results Found" message displays per error-messages.json
- "Clear Filters" action available
- Table structure remains visible

**Verification Points**:

- FR-008: Data error handling
- FR-019: Empty state messaging

## Performance Validation

### Test 1: Large Table Load

1. Navigate to Events table (2989 items)
2. Measure initial load time
3. Check console for errors

**Expected Result**:

- Loads within 2 seconds
- Pagination prevents loading all items
- No console errors or warnings

**Verification Points**:

- FR-020: Performance acceptable

### Test 2: Rapid Sorting/Pagination

1. Quickly click multiple sort columns
2. Rapidly navigate between pages
3. Observe debouncing/throttling

**Expected Result**:

- UI remains responsive
- Requests debounced/throttled
- No race conditions

**Verification Points**:

- FR-020: Performance under rapid interaction

## Accessibility Testing

### Test 1: Keyboard Navigation

1. Use Tab key to navigate through table
2. Press Enter on focused row
3. Verify detail view opens

**Expected Result**:

- All interactive elements keyboard accessible
- Focus indicators visible
- Enter/Space activate row click

**Verification Points**:

- FR-021: Keyboard accessibility

### Test 2: Screen Reader

1. Enable screen reader (VoiceOver/NVDA)
2. Navigate table with screen reader
3. Verify announcements

**Expected Result**:

- Column headers announced
- Row data read correctly
- Sorting changes announced

**Verification Points**:

- FR-022: Screen reader compatibility

## Mobile Testing

### Test 1: Responsive Table

1. Open application on mobile device or resize browser
2. Navigate to any table page
3. Verify table adapts

**Expected Result**:

- Table columns collapse or scroll horizontally
- Touch interactions work (tap to open detail)
- Pagination/sorting controls accessible

**Verification Points**:

- FR-023: Mobile responsive design

### Test 2: Touch Gestures

1. Test swipe gestures on table
2. Test tap vs long-press
3. Verify no accidental activations

**Expected Result**:

- Tap opens detail view
- Swipe scrolls (if applicable)
- Gestures intuitive

**Verification Points**:

- FR-023: Touch interaction quality

## Regression Testing

After implementing any changes, re-run:

1. **Core Flow**: Events table → sort → paginate → open detail → back
2. **Error Handling**: Trigger network error → verify message → retry
3. **Authentication**: Logout → verify redirect → login → verify access
4. **All Content Types**: Repeat Step 1 for DJs, Teachers, Couples, Event Series

## Success Criteria

Feature is validated when:

- [ ] All 5 content types display in tables with correct columns
- [ ] Sorting works on all sortable columns
- [ ] Pagination works with configurable rows per page
- [ ] Row click navigates to detail view with all fields
- [ ] ISO date formatting applied to all date fields
- [ ] No image fields displayed in tables or details
- [ ] Computed fields render correctly
- [ ] Error messages match error-messages.json
- [ ] Authentication enforced on all routes
- [ ] Network/HTTP errors handled gracefully
- [ ] Empty states display appropriately
- [ ] Performance acceptable under load
- [ ] Keyboard navigation functional
- [ ] Mobile responsive and touch-friendly

## Troubleshooting

### Table Not Loading

- Check console for API errors
- Verify authentication token in localStorage
- Check network tab for failed requests
- Verify WordPress API is running

### Sorting Not Working

- Check if column marked `sortable: true` in table-columns.json
- Verify sort parameter sent to API
- Check API response includes sortable data

### Detail View 404

- Verify item ID exists in database
- Check route configuration in routes.ts
- Verify API endpoint returns data for ID

### Performance Issues

- Check if pagination enabled (should limit to 10-50 rows)
- Verify API response time in network tab
- Check for infinite loops in computed properties

## Related Documentation

- **spec.md**: Full feature requirements (FR-001 to FR-024)
- **data-model.md**: Complete entity definitions and field specifications
- **contracts/table-columns.json**: Column definitions for all tables
- **contracts/error-messages.json**: Standardized error messages
- **research.md**: Existing implementation analysis

## Next Steps

After validating feature with this quickstart:

1. Run automated tests: `pnpm test --run`
2. Check test coverage: Ensure > 80% coverage for table/detail components
3. Perform accessibility audit: Use axe DevTools or Lighthouse
4. Load test: Verify performance with full dataset (2989 events)
5. Cross-browser test: Chrome, Firefox, Safari, Edge (mobile + desktop)

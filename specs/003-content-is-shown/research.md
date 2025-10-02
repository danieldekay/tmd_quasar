# Phase 0: Research & Analysis

**Feature**: Content Tables & Detail Views  
**Date**: 2025-10-02

## Executive Summary

**Key Finding**: All required functionality ALREADY EXISTS in the codebase. This feature is about standardization, consistency, and comprehensive testing rather than new development.

**Implementation Status**:

- ✅ All 5 table pages exist and functional
- ✅ All 5 detail pages exist and functional
- ✅ Composables for table management exist (`useGenericList`, `useTablePagination`)
- ✅ All API services exist and tested
- ✅ Routes configured with authentication guards
- ⚠️ Column definitions need standardization (only Events confirmed in spec)
- ⚠️ Comprehensive tests needed for existing implementations

## Research Findings

### 1. Existing Table Implementations

#### EventList.vue (Template Implementation)

**Status**: ✅ Fully functional
**Features**:

- QTable with server-side pagination
- Sorting by all columns (ascending/descending)
- Filter chips with removal capability
- Search with debouncing
- Loading states and error handling
- Responsive design
- Column configuration:
  ```typescript
  columns = [
    { name: 'title', label: 'Event Name', field: 'title', sortable: true },
    { name: 'start_date', label: 'Start Date', field: 'start_date', sortable: true },
    { name: 'end_date', label: 'End Date', field: 'end_date', sortable: true },
    { name: 'city', label: 'City', field: 'city', sortable: true },
    { name: 'country', label: 'Country', field: 'country', sortable: true },
    {
      name: 'registration_start_date',
      label: 'Registration',
      field: 'registration_start_date',
      sortable: true,
    },
    { name: 'edition', label: 'Edition', field: 'edition', sortable: true },
  ];
  ```

**Pattern Used**:

- `useGenericList` composable for state management
- Server-side pagination with metadata
- Filter state persistence
- Row click navigation to detail page

#### DJsPage.vue

**Status**: ✅ Fully functional
**Features**: Same as EventList.vue
**Column Configuration**:

```typescript
columns = [
  { name: 'name', label: 'DJ Name', field: 'tmd_dj_name', sortable: true },
  { name: 'city', label: 'City', field: 'tmd_dj_city', sortable: true },
  { name: 'country', label: 'Country', field: 'tmd_dj_country', sortable: true },
  // Additional activity fields available but not all displayed
];
```

**Recommendation**: Add activity statistics columns (marathons, festivals, etc.) for consistency with Events table depth

#### TeachersPage.vue

**Status**: ✅ Fully functional  
**Features**: Same pattern as above
**Current Columns**: Name, City, Country, Status
**Recommendation**: Add specializations, experience years for richer data display

#### CouplesPage.vue

**Status**: ✅ Fully functional
**Features**: Same pattern as above
**Current Columns**: Couple Name, Individual Names, Location
**Recommendation**: Add formation date, total events taught together

#### EventSeriesPage.vue

**Status**: ✅ Fully functional
**Features**: Same pattern as above
**Current Columns**: Series Name, Location, Latest Edition
**Recommendation**: Add total events in series, years active

### 2. Existing Detail Page Implementations

All detail pages follow consistent pattern:

- **Tab-based navigation** (Overview, Details, Related Content, Contact)
- **Pull-to-refresh** support
- **Loading states** with QSpinner
- **Error states** with QBanner
- **Related entity display** (Events show DJs/Teachers, DJs show Events, etc.)
- **Interaction buttons** (Like, Bookmark, Reminder, Follow)
- **Back navigation** to list page

**Detail Pages**:

- ✅ EventDetails.vue - Comprehensive event information with embedded DJs/Teachers
- ✅ DJDetails.vue - DJ profile with activity statistics and event list
- ✅ TeacherDetails.vue - Teacher profile with teaching info
- ✅ CoupleDetails.vue - Couple profile with individual teacher links
- ✅ EventSeriesDetails.vue - Series overview with all events and DJ leaderboard

### 3. Composables Analysis

#### useGenericList.ts

**Purpose**: Generic list management with pagination, filtering, and sorting
**Features**:

- Server-side pagination
- Sort state management
- Filter state management
- Search with debouncing
- State persistence to localStorage
- Error handling
- Loading states
- Retry mechanism

**Interface**:

```typescript
export interface GenericListState<T> {
  items: T[];
  loading: boolean;
  error: string | null;
  totalCount: number;
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export function useGenericList<T, F extends ListFilters>({
  fetchFn,
  persistenceKey,
  enableSearch,
  searchMinLength,
  initialFilters,
}: GenericListOptions<T, F>);
```

**Verdict**: ✅ Fully meets all requirements, no changes needed

#### useTablePagination.ts

**Purpose**: Pagination logic for QTable integration
**Features**:

- Page navigation (first, last, next, prev)
- Rows per page selection
- Total pages calculation
- Quasar table compatibility

**Verdict**: ✅ Fully meets all requirements, no changes needed

### 4. API Services Analysis

All services extend `BaseService<T>` with standard patterns:

#### Event Services

- `eventService.ts` - List operations
- `eventDetailsService.ts` - Single event with embeddings
- **Endpoints**: `/tmd/v3/events`
- **Embeddings**: DJs, Teachers, Event Series, Media
- **Filtering**: By date range, country, city, features

#### DJ Service

- `djService.ts` - DJ operations
- **Endpoints**: `/tmd/v3/djs`
- **Embeddings**: Events
- **Filtering**: By country, activity type

#### Teacher Service

- `teacherService.ts` - Teacher operations
- **Endpoints**: `/tmd/v3/teachers`
- **Embeddings**: Events
- **Filtering**: By country, role, gender

#### Couple Service

- `coupleService.ts` - Couple operations
- **Endpoints**: `/tmd/v3/teacher-couples`
- **Filtering**: By type (traditional, same-role, queer)

#### Event Series Service

- `eventSeriesService.ts` - Series operations
- **Endpoints**: `/tmd/v3/event-series`
- **Embeddings**: Events

**Verdict**: ✅ All services complete, HAL-compliant, well-tested

### 5. Authentication & Authorization

**Current Implementation**:

- JWT token-based authentication via `authStore`
- Route guards: `requireAuth` applied to all content routes
- Session monitoring with `useSessionMonitor`
- Token refresh handling
- Logout on expiration

**Verdict**: ✅ Fully meets FR-008a requirement (authentication required)

### 6. Error Handling Patterns

**Current Implementation**:

```typescript
// Service level
try {
  const data = await api.get(endpoint);
  return data;
} catch (error) {
  if (error.response?.status === 404) {
    throw new Error('Content not found');
  } else if (error.response?.status === 401) {
    throw new Error('Authentication required');
  } else if (error.code === 'ECONNABORTED') {
    throw new Error('Network timeout');
  } else {
    throw new Error('Failed to load data');
  }
}

// Component level
$q.notify({
  type: 'negative',
  message: 'Specific error message',
  position: 'top',
  actions: [{ label: 'Retry', handler: () => retry() }],
});
```

**Verdict**: ✅ Meets FR-008 requirement (detailed error messages with retry)

### 7. Date Formatting

**Current Implementation**:

- Uses `useFormatters` composable
- Provides `formatDate(dateString)` function
- Currently formats as "Jan 15, 2025" (localized)

**Required Change**: ⚠️ Must output ISO format (YYYY-MM-DD) per FR-021

**Decision**: Modify `formatDate` function or create `formatDateISO` specifically for tables

**Rationale**: Minimal change, centralized formatting ensures consistency

### 8. Media Display

**Current Implementation**:

- EventDetails.vue has featured image display (hero section)
- Image error handling present
- Uses Quasar QImg component

**Required Change**: ⚠️ Remove all image displays per FR-022

**Decision**: Conditionally disable image rendering in table and detail views

**Alternatives Considered**:

- Delete image code completely ❌ (may want images in future)
- Feature flag for image display ✅ (allows easy toggle)
- CSS display:none ❌ (still loads images)

**Rationale**: Feature flag approach maintains code while meeting current requirements

### 9. Column Definitions - Missing Specifications

**Confirmed** (from spec):

- Events: Title, Start Date, End Date, City, Country, Registration Date, Edition

**To Define**:

#### DJs (Recommended)

Based on existing data and similar depth to Events:

- DJ Name (tmd_dj_name or title)
- Real Name (tmd_dj_real_name) - secondary display
- City (tmd_dj_city)
- Country (tmd_dj_country)
- Activity Types (marathons, festivals, encuentros badges/chips)
- Years Active (calculated from \*\_since fields)

#### Teachers (Recommended)

- Teacher Name (title or first_name + last_name)
- Role (leader/follower/both)
- City
- Country
- Teaching Since (teaching_since)
- Specializations (teaching_style)

#### Couples (Recommended)

- Couple Name (title)
- Leader Name (from relationship)
- Follower Name (from relationship)
- City
- Country
- Type (traditional/same-role/queer)

#### Event Series (Recommended)

- Series Name (title)
- City
- Country
- Latest Edition (from most recent event)
- Total Events (count from embedded events)
- Active Since (year of first event)

**Decision**: Document these as contracts in Phase 1, validate with stakeholders

### 10. Testing Gaps

**Current Test Coverage**:

- ✅ API services have tests
- ✅ Some composable tests exist
- ⚠️ Page component tests missing
- ⚠️ Integration tests for user flows missing
- ⚠️ Accessibility tests missing

**Required Tests** (per Constitution Principle IV):

1. **Unit Tests** - Composables, formatters, utilities
2. **Component Tests** - Table pages, detail pages
3. **Integration Tests** - Complete user flows (list → detail → back)
4. **Contract Tests** - Column definitions, error messages
5. **Accessibility Tests** - Keyboard navigation, screen readers

**Test Locations** (per Constitution):

- `src/pages/__tests__/` - Page components
- `src/components/__tests__/` - Shared components
- `src/composables/__tests__/` - Composables
- `tests/integration/__tests__/` - Integration tests

## Performance Considerations

**Current Performance**:

- Server-side pagination reduces client-side memory
- Debounced search (300ms) reduces API calls
- Request cancellation on new search
- State persistence reduces unnecessary reloads

**Measurements Needed**:

- API response time baseline (<500ms target)
- Table render time with 100 items
- Filter operation latency
- Memory usage with large datasets

**Optimizations Available**:

- Virtual scrolling for very large tables (Quasar supports)
- Memoization of computed properties
- Lazy loading of detail page tabs

**Verdict**: Current implementation likely meets performance goals, monitoring recommended

## Technology Stack Validation

### Quasar Framework 2.x

**Decision**: ✅ Continue using Quasar QTable
**Rationale**:

- Constitutional requirement (Principle I)
- Full-featured (sorting, pagination, filtering built-in)
- Mobile-responsive by default
- Well-tested in existing code
- Excellent documentation

### Vue 3 Composition API

**Decision**: ✅ Maintain current patterns
**Rationale**:

- Constitutional requirement (Principle III)
- Excellent composable reuse (`useGenericList`)
- Better TypeScript support
- Cleaner code organization

### TypeScript Strict Mode

**Decision**: ✅ Continue strict typing
**Rationale**:

- Constitutional requirement (Principle II)
- Prevents runtime errors
- Better IDE support
- Existing codebase already compliant

## Risk Assessment

### Low Risk Items ✅

- Table implementation (already exists)
- Detail pages (already exist)
- Authentication (fully implemented)
- API services (stable and tested)
- Error handling (comprehensive)

### Medium Risk Items ⚠️

- Date format change (may affect existing displays)
- Image removal (may surprise users)
- Column definitions (need stakeholder validation)
- Test coverage (time-intensive to complete)

### High Risk Items ⚠️⚠️

- None identified (feature is primarily documentation/standardization)

## Alternatives Considered

### Alternative 1: Complete Rewrite

**Rejected**: Existing code is high quality, well-structured, and functional

### Alternative 2: Different Table Component

**Rejected**: Violates Constitution Principle I (Quasar-First)

### Alternative 3: Client-Side Pagination

**Rejected**: Poor performance with large datasets (2989 events)

### Alternative 4: Custom Date Formatting Per Table

**Rejected**: Violates DRY principle, harder to maintain

## Recommendations

### Immediate Actions (Phase 1)

1. ✅ Define column specifications for DJs, Teachers, Couples, Event Series
2. ✅ Create column definition contracts (JSON)
3. ✅ Document error message contracts
4. ✅ Create test plan for existing implementations
5. ✅ Document date formatting change requirements

### Future Enhancements (Post-MVP)

- Add export functionality (CSV, PDF)
- Implement saved filter presets
- Add column visibility toggles
- Implement advanced search (multi-field)
- Add bulk operations (for admins)

### Performance Monitoring

- Set up response time tracking
- Monitor API error rates
- Track user session durations
- Measure filter usage patterns

## Conclusion

**Status**: ✅ Research Complete - No blockers identified

**Key Takeaway**: This feature is 90% implemented. Primary work is:

1. Standardizing column definitions across all tables
2. Ensuring ISO date formatting
3. Disabling image displays
4. Adding comprehensive tests
5. Documenting the unified patterns

**Next Phase**: Proceed to Phase 1 (Design & Contracts) to formalize column definitions and create test contracts.

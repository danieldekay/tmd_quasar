# Data Model: Content Tables & Detail Views

**Feature**: Content Tables & Detail Views  
**Date**: 2025-10-02

## Overview

This document defines the data structures and relationships for displaying content in tables and detail views. All data originates from WordPress TMD v3 REST API.

## Content Types

### 1. Event

**Purpose**: Represents a tango event/marathon with comprehensive details

**Table Display Fields**:

```typescript
type EventTableRow = {
  id: number;
  title: string; // Event name
  start_date: string; // ISO format YYYY-MM-DD
  end_date: string; // ISO format YYYY-MM-DD
  city: string; // Event city
  country: string; // ISO country code (e.g., "AR")
  registration_start_date: string; // ISO format YYYY-MM-DD
  edition: string; // Edition year/number
};
```

**Detail View Fields** (all fields from API):

```typescript
interface EventDetails extends EventTableRow {
  // Additional event properties
  website?: string;
  email?: string;
  facebook_event?: string;
  facebook_page?: string;
  facebook_group?: string;
  price?: string;
  currency?: string;
  event_description?: string;
  post_content?: string;
  lat?: number;
  lon?: number;

  // Venue
  venue_name?: string;
  street?: string;
  venue_features?: string;
  type_of_floor?: string;

  // Event features (boolean flags as "0"/"1" strings)
  have_milongas?: string;
  have_tickets?: string;
  have_food?: string;
  have_sleep?: string;
  have_registration?: string;
  have_registration_mode?: string;
  have_live_music?: string;
  have_lessons?: string;
  have_show?: string;
  have_separated_seating?: string;
  have_folklore?: string;
  have_non_tango?: string;
  have_services?: string;
  have_sales?: string;

  // Registration
  invitation_only?: string;
  role_balanced?: string;
  number_of_participants?: string;

  // Options
  food_options?: string;
  sleeping_options?: string;
  service_options?: string;

  // Embedded relationships
  _embedded?: {
    djs?: DJ[];
    teachers?: Teacher[];
    event_series?: EventSeries[];
  };
}
```

**Validation Rules**:

- `id`: Must be positive integer
- `title`: Required, non-empty string
- `start_date`: Required, valid ISO date
- `end_date`: Must be >= start_date if present
- `registration_start_date`: Must be <= start_date if present
- `country`: Must be valid ISO 3166-1 alpha-2 code
- Feature flags: Must be "0" or "1" strings

**State Transitions**: None (read-only display)

### 2. DJ

**Purpose**: Represents a DJ/music artist with activity statistics

**Table Display Fields**:

```typescript
type DJTableRow = {
  id: number;
  name: string; // tmd_dj_name or title
  real_name?: string; // tmd_dj_real_name (secondary display)
  city: string; // tmd_dj_city
  country: string; // tmd_dj_country
  activity_types: string[]; // Array of: marathons, festivals, encuentros, milongas
  years_active: string; // Calculated from *_since fields
};
```

**Detail View Fields**:

```typescript
interface DJDetails extends DJTableRow {
  // Identity
  title: string;
  slug: string;
  tmd_dj_name?: string;
  tmd_dj_real_name?: string;

  // Location
  tmd_dj_city?: string;
  tmd_dj_country?: string;

  // Activity flags
  tmd_dj_activity_marathons?: string; // "0"/"1"
  tmd_dj_activity_festivals?: string; // "0"/"1"
  tmd_dj_activity_encuentros?: string; // "0"/"1"
  tmd_dj_activity_milongas?: string; // "0"/"1"
  tmd_dj_activity_milongas_travel?: string; // "0"/"1"

  // Experience timeline
  tmd_dj_activity_marathons_since?: string; // Year
  tmd_dj_activity_festivals_since?: string; // Year
  tmd_dj_activity_encuentros_since?: string; // Year
  tmd_dj_activity_milongas_since?: string; // Year
  tmd_dj_activity_milongas_travel_since?: string; // Year

  // Bio & description
  tmd_dj_bio?: string;
  tmd_dj_description?: string;

  // Contact
  tmd_dj_website?: string;
  tmd_dj_email?: string;
  tmd_dj_facebook?: string;
  tmd_dj_instagram?: string;

  // Embedded relationships
  _embedded?: {
    events?: BaseEvent[];
  };
}
```

**Validation Rules**:

- `id`: Must be positive integer
- `name` or `title`: Required, non-empty
- `country`: Valid ISO country code if present
- Activity flags: Must be "0" or "1" strings
- \*\_since: Must be valid 4-digit year if present

**Computed Properties**:

- `activity_types`: Derived from activity\_\* === "1" flags
- `years_active`: Calculated from earliest \*\_since to current year

### 3. Teacher

**Purpose**: Represents a tango teacher with teaching information

**Table Display Fields**:

```typescript
type TeacherTableRow = {
  id: number;
  name: string; // title or first_name + last_name
  role: string; // leader | follower | both | double-role
  city: string;
  country: string;
  teaching_since: string; // Year
  specializations?: string; // teaching_style
};
```

**Detail View Fields**:

```typescript
interface TeacherDetails extends TeacherTableRow {
  title: string;
  slug: string;
  first_name?: string;
  last_name?: string;

  // Role & gender
  role?: string;
  gender?: string; // man | woman | other

  // Location
  city?: string;
  country?: string;

  // Experience
  teaching_since?: string; // Year
  dancing_since?: string; // Year

  // Teaching info
  teaching_style?: string;
  teaching_specialization?: string;

  // Bio & description
  bio?: string;
  description?: string;

  // Contact
  website?: string;
  email?: string;
  facebook?: string;
  instagram?: string;

  // Embedded relationships
  _embedded?: {
    events?: BaseEvent[];
    couples?: Couple[];
  };
}
```

**Validation Rules**:

- `id`: Must be positive integer
- `role`: Must be one of: leader, follower, both, double-role
- `gender`: Must be one of: man, woman, other (if present)
- `teaching_since`, `dancing_since`: Valid 4-digit year if present

### 4. Teacher Couple

**Purpose**: Represents a teaching couple/partnership

**Table Display Fields**:

```typescript
type CoupleTableRow = {
  id: number;
  couple_name: string; // title
  leader_name: string; // From relationship
  follower_name: string; // From relationship
  city: string;
  country: string;
  couple_type: string; // traditional | same-role | queer
};
```

**Detail View Fields**:

```typescript
interface CoupleDetails extends CoupleTableRow {
  title: string;
  slug: string;

  // Type
  couple_type?: string;

  // Formation
  formed_date?: string;

  // Location
  city?: string;
  country?: string;

  // Bio
  bio?: string;
  description?: string;

  // Contact
  website?: string;
  email?: string;
  facebook?: string;
  instagram?: string;

  // Relationships
  leader_id?: number;
  follower_id?: number;

  // Embedded relationships
  _embedded?: {
    leader?: Teacher;
    follower?: Teacher;
    events?: BaseEvent[];
  };
}
```

**Validation Rules**:

- `id`: Must be positive integer
- `couple_type`: Must be one of: traditional, same-role, queer
- `leader_id`, `follower_id`: Must reference valid Teacher IDs

**Relationships**:

- Many-to-one: Couple → Leader (Teacher)
- Many-to-one: Couple → Follower (Teacher)
- Many-to-many: Couple ↔ Events

### 5. Event Series

**Purpose**: Represents a series of related events (annual marathons, etc.)

**Table Display Fields**:

```typescript
type EventSeriesTableRow = {
  id: number;
  series_name: string; // title
  city: string;
  country: string;
  latest_edition: string; // Most recent event edition
  total_events: number; // Count of events in series
  active_since: string; // Year of first event
};
```

**Detail View Fields**:

```typescript
interface EventSeriesDetails extends EventSeriesTableRow {
  title: string;
  slug: string;

  // Location
  city?: string;
  country?: string;

  // Dates
  start_date?: string; // First event date
  registration_start_date?: string;

  // Description
  description?: string;
  content?: {
    rendered: string;
  };

  // Contact
  website?: string;

  // Statistics (computed from embedded events)
  dj_statistics?: {
    total_djs: number;
    unique_djs: number;
    dj_list: Array<{
      id: number;
      name: string;
      city?: string;
      country?: string;
      appearances: number;
      years: string[];
    }>;
  };

  // Embedded relationships
  _embedded?: {
    events?: BaseEvent[];
  };
}
```

**Validation Rules**:

- `id`: Must be positive integer
- `title`: Required, non-empty string
- `total_events`: Non-negative integer (computed)
- `active_since`: Valid 4-digit year (computed from earliest event)

**Computed Properties**:

- `latest_edition`: Derived from most recent event
- `total_events`: Count of embedded events
- `active_since`: Year from earliest event start_date
- `dj_statistics`: Aggregated from all events' DJs

## Common Patterns

### HAL Response Structure

All API responses follow HAL (Hypertext Application Language) format:

```typescript
interface HALResponse<T> {
  _embedded: {
    [endpoint_name]: T[];
  };
  _links: {
    self: Array<{ href: string }>;
    next?: Array<{ href: string }>;
    last?: Array<{ href: string }>;
  };
  count: number; // Items in current page
  total: number; // Total items matching query
  page: number; // Current page number
  per_page: number; // Items per page
}
```

### Pagination Metadata

```typescript
interface PaginationMetadata {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  rowsPerPage: number;
}
```

### Filter State

```typescript
interface FilterState {
  searchQuery: string;
  [key: string]: unknown; // Content-type specific filters
}
```

### Sort State

```typescript
interface SortState {
  sortBy: string; // Column name
  descending: boolean; // Sort direction
}
```

## Data Transformations

### Date Formatting

**Input**: API provides dates as strings (various formats)
**Output**: ISO format YYYY-MM-DD for tables/details

```typescript
function formatDateISO(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toISOString().split('T')[0]; // YYYY-MM-DD
}
```

### Country Code Mapping

**Input**: ISO 3166-1 alpha-2 country codes (e.g., "AR")
**Output**: Human-readable country names (e.g., "Argentina")

```typescript
// Uses existing useCountries composable
const { getCountryName } = useCountries();
const displayName = getCountryName(countryCode);
```

### Activity Type Aggregation (DJs)

**Input**: Multiple boolean flags (activity_marathons, activity_festivals, etc.)
**Output**: Array of active types

```typescript
function getActivityTypes(dj: DJ): string[] {
  return [
    dj.tmd_dj_activity_marathons === '1' ? 'Marathons' : null,
    dj.tmd_dj_activity_festivals === '1' ? 'Festivals' : null,
    dj.tmd_dj_activity_encuentros === '1' ? 'Encuentros' : null,
    dj.tmd_dj_activity_milongas === '1' ? 'Milongas' : null,
  ].filter((type): type is string => type !== null);
}
```

### Years Active Calculation (DJs)

**Input**: Multiple \*\_since year fields
**Output**: Formatted string (e.g., "Marathons since 2015, Festivals since 2018")

```typescript
function getYearsActive(dj: DJ): string {
  const items = [
    dj.tmd_dj_activity_marathons_since
      ? `Marathons since ${dj.tmd_dj_activity_marathons_since}`
      : null,
    // ... similar for other types
  ].filter((item): item is string => item !== null);

  return items.join(', ');
}
```

## Null/Missing Data Handling

**Strategy**: Graceful degradation with clear indicators

### Table Display

- Empty string fields: Display empty cell (sortable)
- Null/undefined fields: Display "-" or "N/A"
- Missing required fields: Log error, display fallback

### Detail Display

- Hide sections with no data
- Show "No data available" for optional but empty sections
- Required fields: Display placeholder if missing

### Error States

- Network errors: Show specific message with retry button
- 404 errors: Show "Content not found" with back button
- 401 errors: Redirect to login
- 500 errors: Show "Server error" with retry button

## Performance Considerations

### Data Volume

- Events: 2,989 records
- DJs: 1,149 records
- Teachers: 158 records
- Couples: 66 records
- Event Series: 72 records

### Pagination Strategy

- Server-side pagination (required for Events, DJs)
- Page sizes: 10, 20, 50, 100 (user-selectable)
- Default: 20 items per page

### Caching Strategy

- No client-side caching (data changes frequently)
- Server provides ETags for conditional requests
- Request cancellation on new search/filter

### Lazy Loading

- Detail page tabs loaded on demand
- Embedded relationships fetched with initial request
- Images disabled per requirements (no lazy image loading needed)

## Data Integrity

### Validation Points

1. **API Response**: Validated by TypeScript types
2. **User Input**: Sanitized before filtering
3. **Display**: Escaped HTML content
4. **URLs**: Validated before opening

### Error Recovery

- Retry mechanism for transient failures
- Fallback to cached data if available
- User notification of data inconsistencies

## Relationships

### Event Relationships

- Event → DJs (many-to-many via \_embedded)
- Event → Teachers (many-to-many via \_embedded)
- Event → Event Series (many-to-one via \_embedded)

### DJ Relationships

- DJ → Events (many-to-many via \_embedded)

### Teacher Relationships

- Teacher → Events (many-to-many via \_embedded)
- Teacher → Couples (many-to-many)

### Couple Relationships

- Couple → Leader Teacher (many-to-one)
- Couple → Follower Teacher (many-to-one)
- Couple → Events (many-to-many)

### Event Series Relationships

- Event Series → Events (one-to-many via \_embedded)

## Summary

All data models are READ-ONLY for this feature. No create, update, or delete operations. Data transformations are minimal (date formatting, aggregations) to maintain performance. Existing TypeScript types in `src/services/types.ts` already define these structures accurately.

# TMD Services

This directory contains TypeScript services for interacting with the TMD WordPress REST API.

## Version Migration Status ✅

**All services have been updated for TMD v3 API (HAL-compliant)**

| Service               | Status          | HAL Support | Meta Fields | Notes                              |
| --------------------- | --------------- | ----------- | ----------- | ---------------------------------- |
| `BaseService`         | ✅ Updated      | Full        | ✅          | Core HAL response parsing          |
| `eventListService`    | ✅ Updated      | Full        | ✅          | Custom event transformation        |
| `djService`           | ✅ Updated      | Full        | ✅          | Country filtering via meta_filters |
| `teacherService`      | ✅ Updated      | Full        | ✅          | Simplified HAL parsing             |
| `coupleService`       | ✅ Updated      | Full        | ✅          | Teacher relationship filtering     |
| `eventDetailsService` | ⚠️ Needs Update | Partial     | ❌          | Single item only                   |
| `eventSeriesService`  | ⚠️ Needs Update | Partial     | ❌          | Basic implementation               |

## Key Changes Made

### 1. BaseService Enhancements ✅

- **HAL Response Support**: Added `HALResponse<T>` interface
- **Automatic Data Extraction**: New `extractDataFromResponse()` method handles `_embedded` parsing
- **Flexible Pagination**: Extracts pagination from response body (v3) or headers (v2)
- **Endpoint Name Mapping**: Automatically maps endpoint paths to `_embedded` keys

### 2. Service-Specific Updates ✅

#### DJ Service

- ✅ Removed manual `_embedded.djs` parsing
- ✅ Updated country filtering to use `meta_filters` JSON format
- ✅ Added search functionality
- ✅ Performance optimization with selective meta fields

#### Event List Service

- ✅ Simplified parsing logic (BaseService handles HAL)
- ✅ Retained custom event transformation for UI requirements
- ✅ Enhanced taxonomy extraction for both v3 and legacy formats

#### Teacher Service

- ✅ Removed complex manual parsing logic
- ✅ Added search functionality
- ✅ Optimized meta field requests

#### Couple Service

- ✅ Simplified to use BaseService HAL parsing
- ✅ Added teacher relationship filtering
- ✅ Performance improvements

## API Response Format Changes

### Before (v2 API)

```json
[
  { "id": 1, "title": "Event" },
  { "id": 2, "title": "Event 2" }
]
```

### After (v3 API - HAL Compliant)

```json
{
  "_embedded": {
    "events": [
      { "id": 1, "title": "Event", "country": "DE" },
      { "id": 2, "title": "Event 2", "country": "FR" }
    ]
  },
  "_links": {
    "self": [{ "href": "..." }],
    "next": [{ "href": "..." }]
  },
  "page": 1,
  "per_page": 10,
  "count": 2,
  "total": 1500
}
```

## New Features Available

### 1. Enhanced Meta Field Support

```typescript
// Request specific meta fields for better performance
const djs = await djService.getDJs({
  meta_fields: 'tmd_dj_country,tmd_dj_city',
});
```

### 2. JSON-Based Filtering

```typescript
// v3 API supports complex meta filtering
const events = await eventService.getEvents({
  meta_filters: JSON.stringify({
    country: 'Germany',
    start_date: {
      value: '2024-01-01',
      compare: '>=',
      type: 'DATE',
    },
  }),
});
```

### 3. Embedded Relationships

```typescript
// Get DJ with embedded events
const dj = await djService.getDJ(123, { _embed: true });
console.log(dj._embedded?.events); // Related events
```

## Enhanced V3 API Features (Latest Updates)

### Event Services V3 Enhancements

The event services have been significantly enhanced to leverage the V3 HAL-compliant API:

#### EventListService Enhancements

```typescript
import { eventListService } from './eventListService';

// Advanced filtering with meta_filters
const marathonsInGermany = await eventListService.getEvents({
  category: 'marathon',
  country: 'DE',
  have_food: true,
  orderby: 'start_date',
  order: 'asc',
});

// Date range filtering
const upcomingEvents = await eventListService.getUpcomingEvents({
  per_page: 20,
  include_djs: true,
});

// Feature-based filtering
const eventsWithFeatures = await eventListService.getEventsByFeatures({
  have_milongas: '1',
  have_food: '1',
  invitation_only: '0',
});

// Enhanced search with meta filters
const searchResults = await eventListService.searchEvents('tango festival', {
  country: 'DE',
  start_date_from: '2024-01-01',
});
```

#### EventDetailsService Enhancements

```typescript
import { eventDetailsService } from './eventDetailsService';

// Get event with full embedded data
const event = await eventDetailsService.getEvent(12345, {
  include_djs: true,
  include_teachers: true,
  include_event_series: true,
});

// Check event features (V3 API compatible)
const features = eventDetailsService.getEventFeatures(event);
console.log(features.has_milongas); // boolean
console.log(features.is_invitation_only); // boolean

// Get registration information
const regInfo = eventDetailsService.getRegistrationInfo(event);
console.log(regInfo.isOpen); // boolean - can people register?

// Check if event is happening soon
const isSoon = eventDetailsService.isEventSoon(event, 30); // within 30 days

// Get embedded relationships
const djs = eventDetailsService.getEventDJs(event);
const teachers = eventDetailsService.getEventTeachers(event);
```

#### V3 API Feature Detection

The V3 API returns event features as "0" or "1" strings. Use the helper functions:

```typescript
import { isFeatureAvailable } from '../composables/useFormatters';

// Correct way to check V3 API features
const hasFood = isFeatureAvailable(event.have_food); // checks if value === '1'

// The enhanced services automatically handle this conversion
const features = eventDetailsService.getEventFeatures(event);
// features.has_food is already a boolean
```

#### Available Meta Filters

The V3 API supports advanced filtering through `meta_filters`:

```typescript
const params = {
  meta_filters: {
    country: 'DE',
    city: 'Berlin',
    have_milongas: '1',
    have_food: '1',
    have_sleep: '0',
    invitation_only: '0',
    price_min: '100',
    price_max: '300',
    currency: 'EUR',
    start_date_from: '2024-01-01',
    start_date_to: '2024-12-31',
  },
};
```

#### Performance Optimizations

- **Selective Embedding**: Only embed relationships when needed
- **Optimized Meta Fields**: Request only required fields for list views
- **Efficient Filtering**: Use server-side meta_filters instead of client-side filtering
- **HAL Pagination**: Proper pagination with total counts and navigation links

## Still Needed ⚠️

### 1. Event Details Service

- Needs update for HAL compliance
- Should leverage BaseService improvements
- Add meta field support

### 2. Event Series Service

- Basic implementation needs enhancement
- Add meta field support
- Implement proper filtering

### 3. Testing

- Update service tests for HAL format
- Test error scenarios
- Verify backward compatibility

## Performance Improvements ⚡

1. **Selective Meta Fields**: Services now request only needed fields
2. **Automatic Caching**: BaseService handles response caching
3. **Error Resilience**: Enhanced error handling with retries
4. **Offline Support**: Better offline detection and handling

## Usage Examples

### Basic List Retrieval

```typescript
// Get paginated events (HAL automatically handled)
const response = await eventListService.getEvents({
  page: 1,
  per_page: 20,
  country: 'Germany',
});

console.log(response.events); // EventListItem[]
console.log(response.totalCount); // 1500
console.log(response.hasNextPage); // true
```

### Search with Filters

```typescript
// Search DJs with country filter
const result = await djService.searchDJs('tango', {
  country: 'Argentina',
  per_page: 50,
});

console.log(result.djs); // DJ[]
console.log(result.total); // Total matches
```

### Single Item with Full Data

```typescript
// Get event with all embedded relationships
const event = await eventDetailsService.getEvent(123, {
  _embed: true,
  meta_fields: 'all',
});

console.log(event._embedded?.djs); // Related DJs
console.log(event._embedded?.teachers); // Related teachers
```

## Migration Guide

### For Frontend Components

Most components should work without changes due to:

- Maintained return formats in service methods
- Backward-compatible data structures
- Same method signatures

### For Direct API Consumers

If you're using services directly:

1. ✅ **No changes needed** - services handle HAL internally
2. ✅ **Enhanced features available** - better filtering, meta fields
3. ✅ **Better performance** - automatic optimizations

## Error Handling

Services now provide enhanced error information:

```typescript
try {
  const events = await eventListService.getEvents();
} catch (error) {
  if (service.isOfflineError(error)) {
    // Handle offline scenario
  } else {
    console.error(service.getErrorMessage(error));
  }
}
```

## Configuration

### Environment Variables

```bash
# Use v3 API for development
VITE_API_BASE_URL=http://localhost:10014/wp-json/tmd/v3

# Fallback to v2 for production (until v3 deployed)
VITE_API_BASE_URL=https://tangomarathons.com/wp-json/tmd/v2
```

### Service Defaults

All services are pre-configured for optimal performance:

- Selective meta fields
- Appropriate embed settings
- Reasonable pagination defaults
- Error retry logic

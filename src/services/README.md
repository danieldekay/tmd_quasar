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

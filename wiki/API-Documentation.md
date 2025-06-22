# API Documentation

This page provides comprehensive documentation for the TMD WordPress REST API v3 integration used by the Quasar frontend.

## Base URLs

- **Production**: `https://www.tangomarathons.com/wp-json/`
- **Local Development**: `http://localhost:10014/wp-json/`

## Available Namespaces

### TMD Custom API

- `tmd/v1` - Legacy version - **DEPRECATED**
- `tmd/v2` - Current production version - **LEGACY**
- `tmd/v3` - **Current development version** - **USE THIS FOR ALL NEW FEATURES**

### WordPress Core API

- `wp/v2` - Standard WordPress REST API

## TMD v3 API Endpoints (HAL-Compliant)

All endpoints follow HAL (Hypertext Application Language) specification with consistent response structure:

```json
{
  "_embedded": {
    "endpoint_name": [
      /* array of resources */
    ]
  },
  "_links": {
    "self": [{ "href": "..." }],
    "next": [{ "href": "..." }],
    "last": [{ "href": "..." }]
  },
  "count": 10,
  "total": 2989,
  "page": 1,
  "per_page": 10
}
```

### 🎯 Events (2,989 items)

**Main Endpoint**: `/tmd/v3/events`

#### Query Parameters

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `search` | string | Search in title, content, meta fields | `?search=berlin` |
| `country` | string | Filter by country | `?country=Germany` |
| `date_after` | string | Events after date (ISO 8601) | `?date_after=2024-01-01` |
| `date_before` | string | Events before date (ISO 8601) | `?date_before=2024-12-31` |
| `orderby` | string | Sort field | `?orderby=date` |
| `order` | string | Sort direction (asc/desc) | `?order=desc` |
| `per_page` | integer | Results per page (1-100) | `?per_page=20` |
| `page` | integer | Page number | `?page=2` |
| `_embed` | boolean | Include embedded relationships | `?_embed=true` |

#### Example Requests

```bash
# Get upcoming events
GET /tmd/v3/events?date_after=2024-01-01&orderby=date&order=asc

# Search events in Germany
GET /tmd/v3/events?search=marathon&country=Germany

# Get events with DJ relationships
GET /tmd/v3/events?_embed=true&per_page=10
```

### 🎯 DJs (1,149 items)

**Main Endpoint**: `/tmd/v3/djs`

#### Query Parameters

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `search` | string | Search DJ names and bios | `?search=carlos` |
| `country` | string | Filter by DJ country | `?country=Argentina` |
| `meta_filters` | JSON | Advanced meta field filtering | See below |
| `_embed` | boolean | Include related events | `?_embed=true` |

#### Meta Filters Example

```bash
# Filter DJs by activity type
GET /tmd/v3/djs?meta_filters={"activity_marathons":{"value":"yes","compare":"="}}

# Filter by experience level
GET /tmd/v3/djs?meta_filters={"experience_years":{"value":"10","compare":">="}}
```

### 🎯 Teachers (158 items)

**Main Endpoint**: `/tmd/v3/teachers`

Similar parameters to DJs endpoint with teacher-specific meta fields.

### 🎯 Event Series (72 items)

**Main Endpoint**: `/tmd/v3/event-series`

For managing series of related events (e.g., annual marathons).

### 🎯 Other Endpoints

- `/tmd/v3/couples` (66 items) - Teaching couples
- `/tmd/v3/orchestras` (13 items) - Tango orchestras
- `/tmd/v3/brands` (6 items) - Event brands/organizers

## Universal Query Parameters

These parameters work across all endpoints:

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `per_page` | integer | 10 | Results per page (max 100) |
| `page` | integer | 1 | Page number |
| `orderby` | string | `date` | Sort field |
| `order` | string | `desc` | Sort direction (asc/desc) |
| `search` | string | - | Search query |
| `_embed` | boolean | false | Include embedded relationships |

## Response Format

### Success Response

```json
{
  "_embedded": {
    "events": [
      {
        "id": 123,
        "title": "Berlin Marathon 2024",
        "content": "Event description...",
        "meta": {
          "event_start_date": "2024-06-15",
          "event_country": "Germany",
          "event_city": "Berlin"
        },
        "_links": {
          "self": [{"href": "..."}]
        }
      }
    ]
  },
  "_links": {
    "self": [{"href": "/tmd/v3/events?page=1"}],
    "next": [{"href": "/tmd/v3/events?page=2"}],
    "last": [{"href": "/tmd/v3/events?page=299"}]
  },
  "count": 10,
  "total": 2989,
  "page": 1,
  "per_page": 10
}
```

### Error Response

```json
{
  "code": "rest_invalid_param",
  "message": "Invalid parameter(s): country",
  "data": {
    "status": 400,
    "params": {
      "country": "Invalid country code"
    }
  }
}
```

## Date Formats

All dates in the API use ISO 8601 format:

- **Date only**: `YYYY-MM-DD` (e.g., `2024-06-15`)
- **DateTime**: `YYYY-MM-DDTHH:MM:SS` (e.g., `2024-06-15T14:30:00`)

## Performance & Limits

- **Rate Limiting**: 100 requests per minute per IP
- **Maximum per_page**: 100 items
- **Request Timeout**: 30 seconds
- **Cache**: Responses cached for 5 minutes on server

## Error Handling

The API uses standard HTTP status codes:

| Code | Description |
|------|-------------|
| 200 | Success |
| 400 | Bad Request (invalid parameters) |
| 401 | Unauthorized (authentication required) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not Found |
| 429 | Too Many Requests (rate limited) |
| 500 | Internal Server Error |

## Testing

A comprehensive test suite is available at `docs/test_v3_final.sh` that verifies:

- ✅ 71 tests passing (93.4% success rate)
- All endpoints functional
- HAL compliance
- Pagination and sorting
- Meta field integration
- Error handling
- Performance with large datasets

## Legacy Endpoints (v2)

**⚠️ USE ONLY FOR PRODUCTION UNTIL v3 IS DEPLOYED**

### Events Only (v2)

- `GET /tmd/v2/events` - List all events
- `GET /tmd/v2/events/{id}` - Get specific event
- `GET /tmd/v2/events/future` - Future events only
- `GET /tmd/v2/events/marathons` - Marathon events only

## Migration from v2

When migrating from v2 to v3:

1. **Response Structure**: v3 uses HAL format with `_embedded` and `_links`
2. **Pagination**: Metadata now in response body, not headers
3. **Meta Fields**: Improved filtering with JSON-based `meta_filters`
4. **Relationships**: Better embedded relationship handling
5. **Error Messages**: More detailed error information

---

**Need more details?** Check the [Development Guide](Development-Guide) for service implementation examples.
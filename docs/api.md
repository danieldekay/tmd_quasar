# TMD API Documentation

## Base URLs

- **Production**: `https://www.tangomarathons.com/wp-json/`
- **Local Development**: `http://localhost:10014/wp-json/`

## Available Namespaces

### TMD Custom API

- `tmd/v1` - Legacy version - DEPRECATED
- `tmd/v2` - Current production version - LEGACY
- `tmd/v3` - **Current development version** - USE THIS FOR ALL NEW FEATURES

### WordPress Core API

- `wp/v2` - Standard WordPress REST API

## TMD v3 API Endpoints (HAL-Compliant)

**✅ Fully Tested and Working**

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

**Endpoints:**

- `GET /tmd/v3/events` - List all events
- `GET /tmd/v3/events/{id}` - Get specific event
- `GET /tmd/v3/events/{id}?_embed=true` - Get event with embedded relationships

**✅ Working Features:**

- HAL-compliant pagination
- Sorting by `title`, `start_date`, etc.
- Meta field inclusion
- Category filtering (`?category=marathon`)
- Country filtering
- Embed functionality
- Single item retrieval

**Query Parameters:**

- `page` - Page number (default: 1)
- `per_page` - Items per page (default: 10, max tested: 50)
- `orderby` - Sort field (`title`, `start_date`, `date`)
- `order` - Sort direction (`asc`, `desc`)
- `category` - Filter by event category (`marathon`, `festival`, `encuentro`)
- `meta_fields` - Comma-separated meta fields to include
- `meta_filters` - JSON object for meta field filtering
- `_embed` - Include embedded relationships (`true`/`false`)

**Available Meta Fields:**

```
start_date, end_date, registration_start_date, country, city, venue_name,
edition, have_registration, invitation_only, have_milongas, have_tickets,
have_food, have_sleep, price, currency
```

**⚠️ Partial/Issues:**

- `include_taxonomies=true` - Returns taxonomies but not in expected format
- `include_relationships=true` - Returns relationships but structure unclear
- Complex date range queries may fail
- Some meta filter combinations have parsing issues

### 🎯 DJs (1,149 items)

**Endpoints:**

- `GET /tmd/v3/djs` - List all DJs
- `GET /tmd/v3/djs/{id}` - Get specific DJ
- `GET /tmd/v3/djs/{id}?_embed=true` - Get DJ with embedded events

**✅ Working Features:**

- HAL-compliant responses
- Pagination and sorting
- Country filtering
- Meta field inclusion
- Embed functionality

**Available Meta Fields:**

```
tmd_dj_name, tmd_dj_country, tmd_dj_city, tmd_dj_real_name, tmd_dj_e_mail,
tmd_dj_webpage, tmd_dj_link_to_facebook, tmd_dj_link_to_facebook_page,
abstract, tmd_dj_about_the_dj, gender, tmd_dj_activity_marathons,
tmd_dj_activity_festivals, tmd_dj_activity_encuentros, tmd_dj_activity_milongas,
tmd_dj_activity_milongas_travel
```

**⚠️ Issues:**

- Complex name search with LIKE operator may fail
- Some meta filter combinations problematic

### 🎯 Teachers (158 items)

**Endpoints:**

- `GET /tmd/v3/teachers` - List all teachers
- `GET /tmd/v3/teachers/{id}` - Get specific teacher

**✅ Working Features:**

- HAL-compliant responses
- Pagination and sorting
- Meta field filtering
- Country filtering

**Available Meta Fields:**

```
country, city, teacher_type
```

### 🎯 Couples (66 items)

**Endpoints:**

- `GET /tmd/v3/couples` - List all couples
- `GET /tmd/v3/couples/{id}` - Get specific couple
- `GET /tmd/v3/couples?teacher={id}` - Filter by teacher ID

**✅ Working Features:**

- HAL-compliant responses
- Teacher relationship filtering
- Meta field inclusion

**Available Meta Fields:**

```
country, city, teacher_type
```

### 🎯 Event Series (72 items)

**Endpoints:**

- `GET /tmd/v3/event-series` - List all event series
- `GET /tmd/v3/event-series/{id}` - Get specific event series

**✅ Working Features:**

- HAL-compliant responses
- Pagination and sorting
- Meta field inclusion

**Available Meta Fields:**

```
start_date, end_date, country, city, registration_start_date
```

### 🎯 Orchestras (13 items)

**Endpoints:**

- `GET /tmd/v3/orchestras` - List all orchestras
- `GET /tmd/v3/orchestras/{id}` - Get specific orchestra

**✅ Working Features:**

- HAL-compliant responses
- Basic functionality

**⚠️ Issues:**

- Meta fields may be empty (data-related)

### 🎯 Brands (6 items)

**Endpoints:**

- `GET /tmd/v3/brands` - List all brands
- `GET /tmd/v3/brands/{id}` - Get specific brand

**✅ Working Features:**

- HAL-compliant responses
- Full meta field support

**Available Meta Fields:**

```
country, brand_type, brand_first_year, brand_last_year
```

## Universal Query Parameters
=======
- `GET /wp/v2/tmd_dj` - DJ posts (can be used for production access to DJ data)
- `GET /wp/v2/tmd_dj/{id}` - Specific DJ post (can be used for production access to specific DJ data)
- `GET /wp/v2/dj-category` - DJ categories (can be used for production access to DJ categories)

**Note on Production Endpoints for Other Content Types:**

- While `tmd/v2` is the primary production API for Events, other content types like DJs, Teachers, and Event Series may utilize `tmd/v3` endpoints in production (e.g., `GET /tmd/v3/djs`), or rely on the standard WordPress `wp/v2` API as shown above for DJs.
- This mixed-version approach for production (Events on `v2`, others on `v3` or `wp/v2`) should be confirmed by checking the frontend application's API service configurations for production builds. The `README.md` and `DESIGN.md` have been updated to reflect this understanding.

All endpoints support these parameters:

### Pagination

- `page` - Page number (default: 1)
- `per_page` - Items per page (default: 10)

### Sorting

- `orderby` - Field to sort by (usually `title`, `date`, or meta fields)
- `order` - Sort direction (`asc` or `desc`)

### Meta Fields

- `meta_fields` - Comma-separated list of meta fields to include
- `meta_filters` - JSON object for filtering by meta fields

### Embedding

- `_embed` - Include embedded relationships (`true`/`false`)

## Response Format

All endpoints return HAL-compliant JSON:

```json
{
  "_embedded": {
    "endpoint_name": [
      {
        "id": 12345,
        "title": "Item Title",
        "slug": "item-slug",
        "date": "2024-01-01T00:00:00+00:00",
        "meta_field": "value",
        "_links": {
          "self": [{ "href": "/wp-json/tmd/v3/endpoint/12345" }]
        }
      }
    ]
  },
  "_links": {
    "self": [{ "href": "/wp-json/tmd/v3/endpoint" }],
    "next": [{ "href": "/wp-json/tmd/v3/endpoint?page=2" }],
    "last": [{ "href": "/wp-json/tmd/v3/endpoint?page=299" }]
  },
  "page": 1,
  "per_page": 10,
  "count": 10,
  "total": 2989
}
```

## Date Formats

All dates are returned in ISO 8601 format:

- `YYYY-MM-DDTHH:MM:SS+00:00` (with timezone)
- `YYYY-MM-DD` (date only fields)

## Error Handling

Standard HTTP status codes:

- `200` - Success
- `404` - Not found (returns `rest_tmd_*_invalid_id` error codes)
- `500` - Server error

Error response format:

```json
{
  "code": "rest_tmd_event_invalid_id",
  "message": "Invalid event ID.",
  "data": {
    "status": 404
  }
}
```

## Performance & Limits

- **Tested up to 50 items per page** - performs well
- **Large datasets handled properly** - events endpoint with 2,989 items
- **Pagination required for large datasets**
- **Meta fields should be requested selectively** for better performance

## Known Issues & Limitations

### ⚠️ Advanced Features (Partial Support)

1. **Complex Meta Filtering**: Some combinations may fail
2. **Date Range Queries**: Complex date filters may return empty results
3. **Taxonomy Inclusion**: Works but format may vary
4. **Relationship Inclusion**: Works but structure unclear

### 🔧 Recommended Workarounds

- Use simple meta filters instead of complex combinations
- Filter dates on client-side when API filtering fails
- Request specific meta fields rather than using `meta_fields=all`

## Migration from v2

### Key Differences

1. **HAL Compliance**: Responses now include `_embedded` and `_links`
2. **Consistent Pagination**: All endpoints use same pagination structure
3. **Meta Field Integration**: Meta fields included directly in response
4. **Relationship Embedding**: Related data available via `_embed` parameter

### Breaking Changes

- Response structure changed from arrays to HAL objects
- Some field names may have changed
- Pagination headers moved to response body

## Legacy Endpoints (v2)

**⚠️ USE ONLY FOR PRODUCTION UNTIL v3 IS DEPLOYED**

### Events Only (v2)

- `GET /tmd/v2/events` - List all events
- `GET /tmd/v2/events/{id}` - Get specific event
- `GET /tmd/v2/events/future` - Future events only
- `GET /tmd/v2/events/marathons` - Marathon events only

## Testing

A comprehensive test suite is available at `docs/test_v3_final.sh` that verifies:

- ✅ 71 tests passing (93.4% success rate)
- All endpoints functional
- HAL compliance
- Pagination and sorting
- Meta field integration
- Error handling
- Performance with large datasets

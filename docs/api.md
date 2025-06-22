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

### 🎯 User Interactions (NEW)

**⚠️ Authentication Required - Currently in Development**

User interactions allow authenticated users to interact with content through likes, bookmarks, reminders, and follows.

**Endpoints:**

- `GET /tmd/v3/me/interactions` - Get current user's interactions
- `GET /tmd/v3/user-interactions` - List all interactions (admin only)
- `POST /tmd/v3/user-interactions` - Create new interaction
- `GET /tmd/v3/user-interactions/{id}` - Get specific interaction
- `DELETE /tmd/v3/user-interactions/{id}` - Delete specific interaction
- `POST /tmd/v3/user-interactions/bulk` - Create multiple interactions
- `DELETE /tmd/v3/user-interactions/bulk` - Delete multiple interactions

**Interaction Types:**

- `bookmark` - Save content for later
- `like` - Express appreciation for content
- `reminder` - Set reminders for events/content
- `follow` - Follow content updates

**Supported Content Types:**

- `tmd_event` - Events
- `tmd_teacher` - Teachers
- `tmd_dj` - DJs
- `tmd_teacher_couple` - Teacher Couples
- `tmd_event_series` - Event Series

**Available Meta Fields:**

```
expires_date, interaction_date, interaction_type, notification_sent,
private_note, reminder_note, target_post_id, target_post_type
```

**Query Parameters:**

- `interaction_type` - Filter by type (`bookmark`, `like`, `reminder`, `follow`)
- `target_post_type` - Filter by content type
- `target_post_id` - Filter by specific content ID
- `user_id` - Filter by user (admin only)
- `_embed` - Include embedded target content

**Creating Interactions:**

```json
POST /tmd/v3/user-interactions
{
  "interaction_type": "like",
  "target_post_id": 12345,
  "target_post_type": "tmd_event",
  "expires_date": "2024-12-31T23:59:59+00:00",
  "reminder_note": "Don't forget to register!",
  "private_note": "Looks interesting"
}
```

**Bulk Operations:**

```json
POST /tmd/v3/user-interactions/bulk
{
  "interactions": [
    {
      "interaction_type": "bookmark",
      "target_post_id": 123,
      "target_post_type": "tmd_event"
    },
    {
      "interaction_type": "like",
      "target_post_id": 456,
      "target_post_type": "tmd_teacher"
    }
  ]
}
```

```json
DELETE /tmd/v3/user-interactions/bulk
{
  "ids": [123, 456, 789]
}
```

**Response Format:**

```json
{
  "_embedded": {
    "user-interactions": [
      {
        "id": 123,
        "interaction_type": "like",
        "target_post_id": 12345,
        "target_post_type": "tmd_event",
        "interaction_date": "2024-01-15T10:30:00+00:00",
        "expires_date": null,
        "reminder_note": "",
        "private_note": "",
        "notification_sent": false,
        "_links": {
          "self": [{ "href": "/wp-json/tmd/v3/user-interactions/123" }],
          "target": [{ "href": "/wp-json/tmd/v3/events/12345" }]
        }
      }
    ]
  },
  "_links": {
    "self": [{ "href": "/wp-json/tmd/v3/me/interactions" }]
  },
  "page": 1,
  "per_page": 10,
  "count": 1,
  "total": 1
}
```

**⚠️ Current Status:**

- Endpoints are defined and discoverable
- Authentication required for all operations
- May require additional permissions/setup
- Response format follows HAL specification
- Suitable for building favorites/bookmarks features

## Universal Query Parameters

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

**⚠️ Interaction Endpoints:**

- Endpoints are discoverable and properly defined
- Currently require authentication and may need additional setup
- Not yet included in automated test suite
- Ready for frontend integration once permissions are configured

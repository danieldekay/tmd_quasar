# TMD API Documentation

## Base URLs

- **Production**: `https://www.tangomarathons.com/wp-json/`
- **Local Development**: `http://localhost:10014/wp-json/`

## Available Namespaces

### TMD Custom API

- `tmd/v1` - Legacy version
- `tmd/v2` - Current production version
- `tmd/v3` - Development version (available locally)

### WordPress Core API

- `wp/v2` - Standard WordPress REST API

## TMD v3 API Endpoints (Local Development)

### Events

- `GET /tmd/v3/events` - List all events
- `GET /tmd/v3/events/{id}` - Get specific event
- `GET /tmd/v3/events?dj={dj_id}` - Get events by DJ

**Query Parameters:**

- `page` - Page number for pagination
- `per_page` - Number of items per page (default: 20)
- `search` - Search term
- `country` - Filter by country code
- `category` - Filter by event category
- `start_date_from` - Filter events starting from date
- `start_date_to` - Filter events ending before date
- `dj` - Filter events by DJ ID
- `_embed` - Include embedded related data

### DJs

- `GET /tmd/v3/djs` - List all DJs
- `GET /tmd/v3/djs/{id}` - Get specific DJ
- `GET /tmd/v3/djs/{id}?_embed` - Get DJ with embedded events

**Query Parameters:**

- `page` - Page number for pagination
- `per_page` - Number of items per page (default: 20)
- `search` - Search by DJ name
- `country` - Filter by country code
- `meta_fields` - Comma-separated list of meta fields to include
- `_embed` - Include embedded related events

**DJ Meta Fields:**

- `tmd_dj_name` - DJ's display name
- `tmd_dj_country` - Country code (ISO 2-letter)
- `tmd_dj_city` - City name
- `tmd_dj_e_mail` - Email address
- `tmd_dj_webpage` - Personal website
- `tmd_dj_link_to_facebook` - Facebook profile
- `tmd_dj_link_to_facebook_page` - Facebook page
- `abstract` - Short description
- `tmd_dj_about_the_dj` - Full biography
- `gender` - Gender (male/female)
- Activity fields:
  - `tmd_dj_activity_marathons` - DJs marathons (1/0)
  - `tmd_dj_activity_marathons_since` - Year started
  - `tmd_dj_activity_festivals` - DJs festivals (1/0)
  - `tmd_dj_activity_festivals_since` - Year started
  - `tmd_dj_activity_encuentros` - DJs encuentros (1/0)
  - `tmd_dj_activity_encuentros_since` - Year started
  - `tmd_dj_activity_milongas` - DJs local milongas (1/0)
  - `tmd_dj_activity_milongas_since` - Year started
  - `tmd_dj_activity_milongas_travel` - Travel DJ (1/0)
  - `tmd_dj_activity_milongas_travel_since` - Year started

### DJ-Event Relationships

The API provides bidirectional relationships between DJs and events:

#### Getting Events for a DJ:

1. **Direct Query**: `GET /tmd/v3/events?dj={dj_id}`
2. **Embedded in DJ**: `GET /tmd/v3/djs/{id}?_embed`

#### Response Structure with Embedded Events:

```json
{
  "id": 54082,
  "title": "DJ Name",
  "_embedded": {
    "related": [
      [
        {
          "id": 53998,
          "title": "Event Name",
          "start_date": "2025-09-25T00:00:00+00:00",
          "edition": "3",
          "_links": {
            "related": [
              {
                "href": "/wp-json/tmd/v3/djs/54082",
                "title": "DJ Name",
                "type": "dj"
              }
            ]
          }
        }
      ]
    ]
  },
  "_links": {
    "related": [
      {
        "href": "/wp-json/tmd/v3/events?dj=54082",
        "embeddable": true
      }
    ]
  }
}
```

### Teachers

- `GET /tmd/v3/teachers` - List all teachers
- `GET /tmd/v3/teachers/{id}` - Get specific teacher

### Event Series

- `GET /tmd/v3/event-series` - List all event series
- `GET /tmd/v3/event-series/{id}` - Get specific event series

## TMD v2 API Endpoints (Production)

### Events Only

- `GET /tmd/v2/events` - List all events
- `GET /tmd/v2/events/{id}` - Get specific event
- `GET /tmd/v2/events/future` - Future events only
- `GET /tmd/v2/events/marathons` - Marathon events only
- `GET /tmd/v2/events/festivals` - Festival events only
- `GET /tmd/v2/events/calendar` - Calendar format
- `GET /tmd/v2/events/registration` - Events with registration
- `GET /tmd/v2/events/map-data` - Map data format

## WordPress v2 API (Both Environments)

### Custom Post Types

- `GET /wp/v2/tmd_dj` - DJ posts
- `GET /wp/v2/tmd_dj/{id}` - Specific DJ post
- `GET /wp/v2/dj-category` - DJ categories

## Response Headers

- `X-WP-Total` - Total number of items
- `X-WP-TotalPages` - Total number of pages

## Error Handling

Standard HTTP status codes:

- `200` - Success
- `404` - Not found
- `500` - Server error

Error response format:

```json
{
  "code": "rest_no_route",
  "message": "No route was found matching the URL and request method.",
  "data": {
    "status": 404
  }
}
```

## Rate Limiting

No specific rate limiting is documented, but standard WordPress REST API practices apply.

## Authentication

Most endpoints are publicly accessible. Authentication may be required for write operations (not documented here).

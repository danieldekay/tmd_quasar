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

**Example Request:**
```http
GET /tmd/v3/events?per_page=1&country=DE&_embed HTTP/1.1
Host: localhost:10014
Accept: application/json
```

**Example Successful Response (Single Event - Snippet):**
```json
{
  "id": 12345,
  "title": {"rendered": "Awesome Tango Marathon"},
  "status": "publish",
  "link": "https://example.com/events/awesome-tango-marathon/",
  "start_date": "2024-10-25T18:00:00",
  "end_date": "2024-10-27T22:00:00",
  "city": "Berlin",
  "country_code": "DE",
  "event_categories_names": ["Marathon"],
  "event_meta_data_event_main_organizer_name": "Organizer Name",
  "event_meta_data_event_main_organizer_email": "organizer@example.com",
  "event_meta_data_event_main_organizer_website": "https://organizer.example.com",
  "_embedded": {
    "wp:featuredmedia": [
      {
        "source_url": "https://example.com/wp-content/uploads/event-image.jpg"
      }
    ],
    "tmd:dj": [
      {
        "id": 567,
        "title": {"rendered": "DJ TangoStar"},
        "link": "https://example.com/djs/tango-star/"
      }
    ]
  }
}
```

**Key Event Fields Description:**
| Field                                      | Description                                     |
| ------------------------------------------ | ----------------------------------------------- |
| `id`                                       | Unique identifier for the event.                |
| `title.rendered`                           | The name/title of the event.                    |
| `status`                                   | Publication status (e.g., 'publish').           |
| `link`                                     | Direct URL to the event page.                   |
| `start_date`                               | ISO 8601 date-time for event start.             |
| `end_date`                                 | ISO 8601 date-time for event end.               |
| `city`                                     | City where the event takes place.               |
| `country_code`                             | Two-letter ISO country code.                    |
| `event_categories_names`                   | Array of category names (e.g., "Marathon").     |
| `event_meta_data_event_main_organizer_name`| Name of the main organizer.                     |
| `event_meta_data_event_main_organizer_email`| Email of the main organizer.                    |
| `event_meta_data_event_main_organizer_website`| Website of the main organizer.                  |
| `_embedded`                                | Contains linked resources like featured image or DJs. |

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

**Example Request:**
```http
GET /tmd/v3/djs/54082?_embed HTTP/1.1
Host: localhost:10014
Accept: application/json
```

**Example Successful Response (Single DJ - Snippet):**
```json
{
  "id": 54082,
  "title": {"rendered": "DJ CoolSound"},
  "link": "https://example.com/djs/coolsound/",
  "tmd_dj_country": "AR",
  "tmd_dj_city": "Buenos Aires",
  "tmd_dj_e_mail": "coolsound@example.com",
  "tmd_dj_webpage": "https://coolsound.example.com",
  "_embedded": {
    "related": [
      [
        {
          "id": 53998,
          "title": "Buenos Aires Tango Festival",
          "start_date": "2025-09-25T00:00:00+00:00",
          "edition": "3",
          "link": "https://example.com/events/buenos-aires-tango-festival",
          "_links": {
            "related": [
              {
                "href": "/wp-json/tmd/v3/djs/54082",
                "title": "DJ CoolSound",
                "type": "dj"
              }
            ]
          }
        }
      ]
    ]
  }
}
```

**Key DJ Fields Description:**
| Field              | Description                                           |
| ------------------ | ----------------------------------------------------- |
| `id`               | Unique identifier for the DJ.                         |
| `title.rendered`   | The name of the DJ.                                   |
| `link`             | Direct URL to the DJ's profile page.                  |
| `tmd_dj_country`   | Two-letter ISO country code of the DJ's residence.    |
| `tmd_dj_city`      | City of the DJ's residence.                           |
| `tmd_dj_e_mail`    | DJ's email address.                                   |
| `tmd_dj_webpage`   | DJ's personal website.                                |
| `_embedded.related`| Contains linked events where the DJ has participated.   |


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
   (See example response under the `/tmd/v3/djs` endpoint section)

#### Response Structure with Embedded Events (Illustrative - already shown above):

The structure for a DJ response with embedded events is detailed in the "Example Successful Response (Single DJ - Snippet)" under the `/tmd/v3/djs` endpoint. It typically involves the `_embedded.related` field containing an array of event objects.

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

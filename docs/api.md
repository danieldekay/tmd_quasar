# TMD API Documentation

## Base URL

`http://localhost:10014/wp-json/tmd/v3`

## Available Endpoints

### Events

#### List Events

- **GET** `/events` - List all events with extensive filtering and sorting options

**Parameters:**

**Pagination:**

- `page` (int, default: 1) - Page number for pagination
- `per_page` (int, default: 10) - Number of items per page

**Search & Filtering:**

- `search` (string) - Limit results to those matching a string
- `country` (string) - Filter by country meta field
- `category` (string) - Filter by event category (taxonomy term slug)
- `category_id` (int) - Filter by event category (taxonomy term ID)

**Date Filtering:**

- `start_date_min` (ISO date) - Filter events with start_date ≥ this date
- `start_date_max` (ISO date) - Filter events with start_date ≤ this date
- `registration_date_min` (ISO date) - Filter events with registration_start_date ≥ this date
- `registration_date_max` (ISO date) - Filter events with registration_start_date ≤ this date

**Sorting:**

- `orderby` (enum: `date`, `title`, `ID`, `start_date`, `end_date`, `registration_start_date`, default: `date`) - Sort collection by object attribute
- `order` (enum: `asc`, `desc`, default: `desc`) - Order sort attribute ascending or descending

**Meta Field Filtering:**

- `meta_key` (string) - Meta key to filter by
- `meta_value` (string) - Meta value to filter by

**Data Enrichment:**

- `_embed` (bool, default: false) - Include embedded related resources in response
- `include_taxonomies` (bool, default: false) - Include event taxonomies (categories) in response
- `include_relationships` (bool, default: false) - Include related entities (DJs, teachers, series) in response
- `meta_fields` (string) - Comma-separated list of custom meta keys to return, or "all"

**Available Meta Fields:**

- `start_date`, `end_date`, `registration_start_date`
- `country`, `city`, `urgent_change_status`, `edition`
- `role_balanced`, `invitation_only`, `have_registration`, `have_registration_mode`
- `price`, `currency`, `number_of_participants`, `music_hours`
- `have_milongas`, `have_tickets`, `have_live_music`, `have_lessons`
- `have_show`, `have_separated_seating`, `have_folklore`, `have_non_tango`

**Response Headers:**

- `X-WP-Total` - Total number of events matching the query
- `X-WP-TotalPages` - Total number of pages available

**Response Structure:**

```json
[
  {
    "id": 54102,
    "title": "La Maravillosa",
    "slug": "3101-la-maravillosa-edition-4",
    "date": "2024-11-12T15:43:19+01:00",
    "date_gmt": "2024-11-12T14:43:19+01:00",
    "modified": "2024-11-12T15:43:19+01:00",
    "modified_gmt": "2024-11-12T14:43:19+01:00",
    "status": "publish",
    "link": "http://localhost:10014/events/3101-la-maravillosa-edition-4/",
    "start_date": "2025-01-31T00:00:00+00:00",
    "registration_start_date": "",
    "edition": "4",
    "taxonomies": {
      "event-categories-2020": [
        {
          "id": 68,
          "name": "Marathon",
          "slug": "marathon",
          "description": ""
        }
      ]
    },
    "relationships": [],
    "_links": {
      "self": [{ "href": "http://localhost:10014/wp-json/tmd/v3/events/54102" }],
      "collection": [{ "href": "http://localhost:10014/wp-json/tmd/v3/events" }]
    }
  }
]
```

#### Get Single Event

- **GET** `/events/{id}` - Get specific event details

**Parameters:**

- `id` (int, required) - Unique identifier for the event
- `_embed` (bool, default: false) - Include embedded related resources in response
- `meta_fields` (string) - Comma-separated list of custom meta keys to return, or "all"
- `include_taxonomies` (bool, default: false) - Include event taxonomies (categories) in response
- `include_relationships` (bool, default: false) - Include related entities (DJs, teachers, series) in response

### DJs

#### List DJs

- **GET** `/djs` - List all DJs

**Parameters:**

- `page` (int, default: 1) - Page number for pagination
- `per_page` (int, default: 10) - Number of items per page
- `search` (string) - Limit results to those matching a string
- `orderby` (enum: `date`, `title`, `ID`, default: `date`) - Sort collection by object attribute
- `order` (enum: `asc`, `desc`, default: `desc`) - Order sort attribute ascending or descending
- `_embed` (bool, default: false) - Include embedded related resources in response
- `meta_key` (string) - Meta key to filter by
- `meta_value` (string) - Meta value to filter by
- `meta_fields` (string) - Comma-separated list of custom meta keys to return

#### Get Single DJ

- **GET** `/djs/{id}` - Get specific DJ details

**Parameters:**

- `id` (int, required) - Unique identifier for the DJ
- `_embed` (bool, default: false) - Include embedded related resources in response
- `meta_fields` (string) - Comma-separated list of custom meta keys to return

**Response Structure:**

```json
{
  "id": 54082,
  "title": "Eunsook Kim",
  "date": "2024-11-06T02:18:16+01:00",
  "link": "http://localhost:10014/dj/eunsook-kim/"
}
```

### Teachers

#### List Teachers

- **GET** `/teachers` - List all teachers

**Parameters:**

- `page` (int, default: 1) - Page number for pagination
- `per_page` (int, default: 10) - Number of items per page
- `search` (string) - Limit results to those matching a string
- `orderby` (enum: `date`, `title`, `ID`, default: `date`) - Sort collection by object attribute
- `order` (enum: `asc`, `desc`, default: `desc`) - Order sort attribute ascending or descending
- `_embed` (bool, default: false) - Include embedded related resources in response
- `meta_key` (string) - Meta key to filter by
- `meta_value` (string) - Meta value to filter by
- `meta_fields` (string) - Comma-separated list of custom meta keys to return

#### Get Single Teacher

- **GET** `/teachers/{id}` - Get specific teacher details

**Parameters:**

- `id` (int, required) - Unique identifier for the teacher
- `_embed` (bool, default: false) - Include embedded related resources in response
- `meta_fields` (string) - Comma-separated list of custom meta keys to return

**Response Structure:**

```json
{
  "id": 53452,
  "title": "Eugenia  Parrilla",
  "date": "2024-07-21T13:16:10+02:00",
  "link": "http://localhost:10014/teachers/eugenia-parrilla/"
}
```

### Event Series

#### List Event Series

- **GET** `/event-series` - List all event series

**Parameters:**

- `page` (int, default: 1) - Page number for pagination
- `per_page` (int, default: 10) - Number of items per page
- `search` (string) - Limit results to those matching a string
- `orderby` (enum: `date`, `title`, `ID`, default: `date`) - Sort collection by object attribute
- `order` (enum: `asc`, `desc`, default: `desc`) - Order sort attribute ascending or descending
- `_embed` (bool, default: false) - Include embedded related resources in response
- `meta_key` (string) - Meta key to filter by
- `meta_value` (string) - Meta value to filter by
- `meta_fields` (string) - Comma-separated list of custom meta keys to return

#### Get Single Event Series

- **GET** `/event-series/{id}` - Get specific event series details

**Parameters:**

- `id` (int, required) - Unique identifier for the event series
- `_embed` (bool, default: false) - Include embedded related resources in response
- `meta_fields` (string) - Comma-separated list of custom meta keys to return, or "all"

**Response Structure:**

```json
{
  "id": 53875,
  "title": "CHAMPAGNETANGO DRESDEN MARATHON",
  "date": "2024-09-17T09:07:23+02:00",
  "link": "http://localhost:10014/event_series/champagnetango-dresden-marathon/",
  "start_date": "",
  "registration_start_date": ""
}
```

## API Features

### Pagination

- Standard WordPress REST API pagination with `X-WP-Total` and `X-WP-TotalPages` headers
- Current total: 2,989 events across 598 pages (with per_page=5)

### Taxonomies

- Event categories are available via `include_taxonomies=true`
- Categories use the `event-categories-2020` taxonomy
- Filter by category using `category` (slug) or `category_id` (ID) parameters

### Date Filtering

- Comprehensive date filtering with min/max ranges
- Support for both start dates and registration dates
- ISO 8601 date format required

### Meta Fields

- Extensive custom meta field support
- Use `meta_fields=all` to get all available meta data
- Specific meta fields can be requested via comma-separated list

### Search & Sorting

- Full-text search across event titles
- Multiple sorting options including date-based sorting
- Ascending/descending order support

## Notes

- All endpoints return JSON responses
- Date fields use ISO 8601 format
- The API supports WordPress standard pagination headers
- Error responses follow standard WordPress REST API format
- CORS headers are properly configured for cross-origin requests

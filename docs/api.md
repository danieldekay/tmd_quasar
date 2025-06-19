# TMD API Documentation

## Base URL

`http://localhost:10014/wp-json/tmd/v3`

## Available Endpoints

### Events

- **GET** `/events` - List all events
- **GET** `/events/{id}` - Get specific event details

**Parameters:**

- `page` (int, default: 1) - Page number for pagination
- `per_page` (int, default: 10) - Number of items per page
- `_embed` (bool) - Include embedded resources

**Response Structure:**

```json
{
  "id": 54102,
  "title": "La Maravillosa",
  "date": "2024-11-12T15:43:19+01:00",
  "link": "http://localhost:10014/events/3101-la-maravillosa-edition-4/",
  "start_date": "2025-01-31T00:00:00+00:00",
  "registration_start_date": ""
}
```

### DJs

- **GET** `/djs` - List all DJs
- **GET** `/djs/{id}` - Get specific DJ details

**Parameters:**

- `page` (int, default: 1) - Page number for pagination
- `per_page` (int, default: 10) - Number of items per page
- `_embed` (bool) - Include embedded resources

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

- **GET** `/teachers` - List all teachers
- **GET** `/teachers/{id}` - Get specific teacher details

**Parameters:**

- `page` (int, default: 1) - Page number for pagination
- `per_page` (int, default: 10) - Number of items per page
- `_embed` (bool) - Include embedded resources

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

- **GET** `/event-series` - List all event series
- **GET** `/event-series/{id}` - Get specific event series details

**Parameters:**

- `page` (int, default: 1) - Page number for pagination
- `per_page` (int, default: 10) - Number of items per page
- `_embed` (bool) - Include embedded resources

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

## Notes

- All endpoints return JSON responses
- Date fields use ISO 8601 format
- The `_embed` parameter may not be fully implemented for all endpoints
- Error responses follow standard WordPress REST API format

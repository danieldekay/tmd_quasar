# TMD v3 API Documentation

## Events Endpoint

Base URL: `http://localhost:10014/wp-json/tmd/v3/events`

### Query Parameters

#### Pagination

- `page` (number, default: 1): Page number
- `per_page` (number, default: 100): Number of items per page

#### Filtering

- `country` (string): Filter by country code (e.g., "DE")
- `start_date_from` (string): Filter events starting from this date (YYYY-MM-DD)
- `start_date_to` (string): Filter events starting until this date (YYYY-MM-DD)
- `registration_start_date_from` (string): Filter events with registration starting from this date (YYYY-MM-DD)
- `registration_start_date_to` (string): Filter events with registration starting until this date (YYYY-MM-DD)

#### Meta Fields

- `meta_fields` (string): Comma-separated list of meta fields to include in the response. Available fields:
  - `start_date`: Event start date
  - `end_date`: Event end date
  - `registration_start_date`: Registration start date
  - `country`: Country code
  - `city`: City name
  - `edition`: Event edition number
  - `role_balanced`: Whether the event is role balanced (1/0)
  - `invitation_only`: Whether the event is invitation only (1/0)
  - `have_registration`: Whether the event has registration (1/0)
  - `have_registration_mode`: Registration mode (e.g., "mandatory")
  - `price`: Event price
  - `currency`: Currency code
  - `number_of_participants`: Maximum number of participants
  - `music_hours`: Number of music hours
  - `have_milongas`: Whether the event has milongas (1/0)
  - `have_tickets`: Whether the event has tickets (1/0)
  - `have_live_music`: Whether the event has live music (1/0)
  - `have_lessons`: Whether the event has lessons (1/0)
  - `have_show`: Whether the event has shows (1/0)
  - `have_separated_seating`: Whether the event has separated seating (1/0)
  - `have_folklore`: Whether the event has folklore (1/0)
  - `have_non_tango`: Whether the event has non-tango activities (1/0)
  - `event_name`: Event name
  - `website`: Event website URL
  - `email`: Contact email
  - `facebook_event`: Facebook event URL
  - `facebook_group`: Facebook group URL
  - `facebook_page`: Facebook page URL
  - `venue_name`: Venue name
  - `street`: Venue street address
  - `lat`: Venue latitude
  - `lon`: Venue longitude
  - `type_of_floor`: Floor type
  - `venue_features`: Venue features
  - `food_options`: Food options
  - `sleeping_options`: Sleeping options
  - `service_options`: Service options
  - `shopping_options`: Shopping options
  - `tmd_openai_summary`: AI-generated summary
  - `tmd_openai_djs`: AI-generated DJ information
  - `tmd_openai_people`: AI-generated people information

### Response Format

```typescript
interface Event {
  id: number;
  title: string;
  date: string;
  link: string;
  start_date: string;
  end_date: string;
  registration_start_date: string;
  country: string;
  city: string;
  edition: string;
  role_balanced: string;
  invitation_only: string;
  have_registration: string;
  have_registration_mode: string;
  price: string;
  currency: string;
  number_of_participants: string;
  music_hours: string;
  have_milongas: string;
  have_tickets: string;
  have_live_music: string;
  have_lessons: string;
  have_show: string;
  have_separated_seating: string;
  have_folklore: string;
  have_non_tango: string;
  event_name: string;
  website: string;
  email: string;
  facebook_event: string;
  facebook_group: string;
  facebook_page: string;
  venue_name: string;
  street: string;
  lat: string;
  lon: string;
  type_of_floor: string;
  venue_features: string;
  food_options: string;
  sleeping_options: string;
  service_options: string;
  shopping_options: string;
  tmd_openai_summary: string;
  tmd_openai_djs: string;
  tmd_openai_people: string;
}
```

### Example Requests

1. Get all events with basic fields:

```bash
curl "http://localhost:10014/wp-json/tmd/v3/events"
```

2. Get events with specific meta fields:

```bash
curl "http://localhost:10014/wp-json/tmd/v3/events?meta_fields=start_date,end_date,country,city"
```

3. Filter events by country and date range:

```bash
curl "http://localhost:10014/wp-json/tmd/v3/events?country=DE&start_date_from=2024-01-01&start_date_to=2024-12-31"
```

4. Paginate results:

```bash
curl "http://localhost:10014/wp-json/tmd/v3/events?page=1&per_page=10"
```

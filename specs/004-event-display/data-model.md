# Data Model: Enhanced Event Display

**Feature**: Enhanced Event Display  
**Date**: 2025-10-03  
**Phase**: 1 - Design

## Overview

This feature enhances the display of existing Event, Venue, and Category entities. No new database entities are created; all work involves presentation layer transformations and computed properties.

## Entities

### Event (existing, display enhancements)

**Source**: WordPress REST API (`/wp-json/tmd/v3/events/:id`)

**Core Attributes**:

```typescript
type Event = {
  id: number;
  event_name: string; // Display title
  title: string; // Fallback if event_name missing
  featured_image: string | null; // URL to featured image
  dates: {
    start: string; // ISO 8601: "2025-09-18T00:00:00"
    end: string; // ISO 8601: "2025-09-22T00:00:00"
  };
  location: {
    city: string;
    country: string;
    venue_name?: string;
  };
  taxonomies: {
    event_category?: string[]; // e.g., ["marathon", "festival"]
  };
  edition?: number | string; // Edition number or year
  description?: string; // HTML content
  price?: string;
  participant_count?: number;
};
```

**Display Transformations**:

- `featured_image` → category-specific fallback if null
- `dates` → formatted date range ("18-22 Sep 2025")
- `edition` → ordinal format ("13th Edition")
- `taxonomies.event_category[0]` → colored pill with icon

**Validation Rules**:

- `event_name` or `title` MUST be present (required for hero display)
- `dates.start` MUST be valid ISO 8601 or parseable date
- `dates.end` MUST be >= `dates.start`
- `featured_image` if present MUST be valid URL or null
- `edition` if present MUST be positive integer or 4-digit year

**State Transitions**: N/A (read-only display)

### Venue (existing, display enhancements)

**Source**: Nested in Event response or separate endpoint

**Core Attributes**:

```typescript
type Venue = {
  id: number;
  name: string;
  address: {
    street?: string;
    city: string; // Required for geocoding fallback
    country: string; // Required for geocoding fallback
    postal_code?: string;
  };
  coordinates: {
    lat: number | null;
    lon: number | null;
  } | null;
};
```

**Display Transformations**:

- `coordinates` → map marker at [lat, lon] with zoom 11
- If `coordinates` is null → geocode `city, country` → map center (no marker)
- `address` → formatted address string below map

**Validation Rules**:

- `coordinates.lat` if present MUST be -90 to 90
- `coordinates.lon` if present MUST be -180 to 180
- `address.city` and `address.country` MUST be non-empty strings

### Category (existing, presentation layer)

**Source**: Taxonomy from Event response

**Core Attributes**:

```typescript
type EventCategory = {
  slug: string; // e.g., "marathon", "festival", "encuentro"
  name: string; // Display name, e.g., "Tango Marathon"
  color: string; // Hex color for pill background
  textColor: string; // Hex color for pill text (contrast)
  icon: string; // Material icon name, e.g., "event"
  defaultImage: string; // Path to category-specific default image
};
```

**Category Mappings** (const object):

```typescript
export const CATEGORY_CONFIG: Record<string, EventCategory> = {
  marathon: {
    slug: 'marathon',
    name: 'Tango Marathon',
    color: '#1976D2', // Blue
    textColor: '#FFFFFF',
    icon: 'event',
    defaultImage: '/images/category-defaults/marathon.webp',
  },
  festival: {
    slug: 'festival',
    name: 'Tango Festival',
    color: '#7B1FA2', // Purple
    textColor: '#FFFFFF',
    icon: 'celebration',
    defaultImage: '/images/category-defaults/festival.webp',
  },
  encuentro: {
    slug: 'encuentro',
    name: 'Encuentro',
    color: '#C2185B', // Pink
    textColor: '#FFFFFF',
    icon: 'people',
    defaultImage: '/images/category-defaults/encuentro.webp',
  },
  workshop: {
    slug: 'workshop',
    name: 'Workshop',
    color: '#388E3C', // Green
    textColor: '#FFFFFF',
    icon: 'school',
    defaultImage: '/images/category-defaults/workshop.webp',
  },
} as const;
```

**Validation Rules**:

- All colors MUST pass WCAG 2.1 AA contrast ratio (4.5:1 for text)
- Default images MUST exist in assets folder
- Slugs MUST match WordPress taxonomy terms

**Fallback**: If category slug not in config, use 'marathon' as default

## Computed Properties

### FormattedDateRange

**Input**: `Event.dates.start`, `Event.dates.end`  
**Output**: `string` (e.g., "18-22 Sep 2025")  
**Logic**:

```typescript
const formatEventDateRange = (start: string, end: string): string => {
  const startDate = parseISO(start);
  const endDate = parseISO(end);

  const startDay = format(startDate, 'd');
  const endDay = format(endDate, 'd');
  const month = format(endDate, 'MMM');
  const year = format(endDate, 'yyyy');

  return `${startDay}-${endDay} ${month} ${year}`;
};
```

### EditionDisplay

**Input**: `Event.edition` (number | string | undefined)  
**Output**: `string | null` (e.g., "13th Edition")  
**Logic**:

```typescript
const formatEdition = (edition: number | string | undefined): string | null => {
  if (!edition) return null;

  const num = typeof edition === 'string' ? parseInt(edition, 10) : edition;
  if (isNaN(num)) return null;

  return `${formatOrdinal(num)} Edition`;
};
```

### CategoryPillData

**Input**: `Event.taxonomies.event_category`  
**Output**: `EventCategory | null`  
**Logic**:

```typescript
const getCategoryPillData = (categories: string[] | undefined): EventCategory | null => {
  if (!categories || categories.length === 0) return null;

  const categorySlug = categories[0].toLowerCase();
  return CATEGORY_CONFIG[categorySlug] || CATEGORY_CONFIG.marathon;
};
```

### HeroImageSrc

**Input**: `Event.featured_image`, `Event.taxonomies.event_category`  
**Output**: `string` (URL or path)  
**Logic**:

```typescript
const getHeroImageSrc = (
  featuredImage: string | null,
  categories: string[] | undefined,
): string => {
  if (featuredImage) return featuredImage;

  const categoryData = getCategoryPillData(categories);
  return categoryData?.defaultImage || CATEGORY_CONFIG.marathon.defaultImage;
};
```

## Map Integration Data

### MapConfiguration

**Input**: `Venue.coordinates`, `Venue.address`  
**Output**: `MapConfig`

```typescript
type MapConfig = {
  center: [number, number]; // [lat, lon]
  zoom: number; // 11 for regional view
  marker: {
    position: [number, number];
    popup: string; // Venue name + address
  } | null;
};
```

**Logic**:

```typescript
const getMapConfig = async (venue: Venue): Promise<MapConfig> => {
  // Case 1: Valid coordinates
  if (venue.coordinates?.lat && venue.coordinates?.lon) {
    return {
      center: [venue.coordinates.lat, venue.coordinates.lon],
      zoom: 11,
      marker: {
        position: [venue.coordinates.lat, venue.coordinates.lon],
        popup: `${venue.name}\n${formatAddress(venue.address)}`,
      },
    };
  }

  // Case 2: No coordinates, geocode city/country
  const geocoded = await geocodeLocation(venue.address.city, venue.address.country);

  if (geocoded) {
    return {
      center: geocoded,
      zoom: 11,
      marker: null, // No marker when coordinates missing
    };
  }

  // Case 3: Geocoding failed, center on Europe (fallback)
  return {
    center: [48.8566, 2.3522], // Paris, central Europe
    zoom: 5,
    marker: null,
  };
};
```

## Relationships

```
Event
  ├─ has one Venue (via location data)
  ├─ belongs to one or more Categories (via taxonomies)
  └─ has one Edition (optional)

Venue
  └─ hosts many Events

Category
  └─ categorizes many Events
```

## Performance Considerations

### Caching Strategy

- **Category config**: Static const object (no caching needed)
- **Formatted dates**: Computed once per event load, no re-computation on re-render
- **Geocoding results**: sessionStorage with key `geocode:${city},${country}`, 24h TTL
- **Featured images**: Browser cache (standard HTTP caching)

### Lazy Loading

- **Map component**: Only load Leaflet when Venue tab activated
- **Category images**: Browser native lazy loading via QImg
- **Geocoding**: Only execute if coordinates missing and map visible

## Error Handling

| Scenario                          | Handling Strategy                                    |
| --------------------------------- | ---------------------------------------------------- |
| Invalid date format               | Try-catch, fallback to raw string display            |
| Missing featured image & category | Use marathon default image                           |
| Missing edition                   | Hide edition pill entirely                           |
| Geocoding API failure             | Fallback to Europe center, log warning               |
| Map initialization failure        | Show error message in tab, suggest address-only view |
| Category not in config            | Use marathon as default category                     |

## Type Definitions

**File**: `src/types/event.ts`

```typescript
export type EventResponse = {
  id: number;
  event_name: string;
  title: string;
  featured_image: string | null;
  dates: {
    start: string;
    end: string;
  };
  location: {
    city: string;
    country: string;
    venue_name?: string;
  };
  taxonomies: {
    event_category?: string[];
  };
  edition?: number | string;
  description?: string;
  price?: string;
  participant_count?: number;
};

export type VenueData = {
  id: number;
  name: string;
  address: {
    street?: string;
    city: string;
    country: string;
    postal_code?: string;
  };
  coordinates: {
    lat: number | null;
    lon: number | null;
  } | null;
};

export type EventCategory = {
  slug: string;
  name: string;
  color: string;
  textColor: string;
  icon: string;
  defaultImage: string;
};

export type MapConfig = {
  center: [number, number];
  zoom: number;
  marker: {
    position: [number, number];
    popup: string;
  } | null;
};

export type FormattedEvent = EventResponse & {
  formattedDateRange: string;
  editionDisplay: string | null;
  categoryPillData: EventCategory | null;
  heroImageSrc: string;
};
```

## Data Flow

```
WordPress API → EventDetails.vue → useEventDisplay composable
                                  ↓
                        Computed Properties:
                        - formattedDateRange
                        - editionDisplay
                        - categoryPillData
                        - heroImageSrc
                                  ↓
                        Template Rendering:
                        - Hero Section (QImg, QChip)
                        - Date Display
                        - Category Pills
                                  ↓
                        User Interaction → Tab Change to Venue
                                  ↓
                        Lazy Load → EventVenueMap.vue
                                  ↓
                        useMapIntegration composable
                                  ↓
                        Map Configuration → Leaflet Rendering
```

## Validation Summary

All data transformations are **presentation-layer only**. No database writes or API mutations. Validation focuses on:

1. Type safety (TypeScript strict mode)
2. Null/undefined handling (explicit checks)
3. Fallback values (graceful degradation)
4. Accessibility (alt text, ARIA labels)
5. Performance (lazy loading, caching)

## Next Steps

✅ Data model complete → Proceed to contracts generation

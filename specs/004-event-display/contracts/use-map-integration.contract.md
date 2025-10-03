# Composable Contracts: useMapIntegration

**Module**: `src/composables/useMapIntegration.ts`  
**Type**: Vue 3 Composition API composable

## Purpose

Manage Leaflet map initialization, coordinate handling, geocoding fallback, and map lifecycle for the venue tab. Provides lazy loading and cleanup.

## Signature

```typescript
export function useMapIntegration(
  venue: Ref<VenueData | null>,
  containerRef: Ref<HTMLElement | null>,
): {
  initializeMap: () => Promise<void>;
  destroyMap: () => void;
  isMapReady: Ref<boolean>;
  mapError: Ref<string | null>;
};
```

## Input Contract

**Parameters**:

- `venue`: Reactive reference to VenueData or null
- `containerRef`: Reactive reference to HTML element for map mounting

**VenueData Type**:

```typescript
type VenueData = {
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
```

## Output Contract

### initializeMap

**Type**: `() => Promise<void>`

**Behavior**:

- Dynamically imports Leaflet library
- Creates map instance in containerRef
- Sets zoom level to 11 (regional view)
- Places marker if coordinates exist
- Falls back to geocoding if coordinates missing
- Only initializes once (idempotent)

**Test Cases**:

```typescript
const venue = ref({
  name: 'Test Venue',
  address: { city: 'Boston', country: 'US' },
  coordinates: { lat: 42.3601, lon: -71.0589 },
});
const container = ref(document.createElement('div'));
const { initializeMap, isMapReady } = useMapIntegration(venue, container);

await initializeMap();

expect(isMapReady.value).toBe(true);
// Verify map centered at [42.3601, -71.0589]
// Verify marker placed at coordinates
// Verify zoom level is 11
```

**Error Handling**:

- Leaflet import fails → Set mapError, isMapReady = false
- Container ref is null → Set mapError "Map container not found"
- Geocoding fails → Center on fallback location, set mapError warning

### destroyMap

**Type**: `() => void`

**Behavior**:

- Removes map instance from DOM
- Cleans up Leaflet event listeners
- Resets isMapReady to false
- Safe to call multiple times (idempotent)

**Test Cases**:

```typescript
await initializeMap();
expect(isMapReady.value).toBe(true);

destroyMap();
expect(isMapReady.value).toBe(false);
// Verify map instance destroyed
// Verify no memory leaks

destroyMap(); // Second call should not error
```

### isMapReady

**Type**: `Ref<boolean>`

**Behavior**:

- `false` initially
- `true` after successful initializeMap()
- `false` after destroyMap()
- Reactive: UI can watch this to show loading state

### mapError

**Type**: `Ref<string | null>`

**Behavior**:

- `null` initially and when map loads successfully
- Set to error message on initialization failure
- Set to warning message if geocoding fails (map still shows)
- Reactive: UI can display error messages

**Error Messages**:

- "Map container not found" - containerRef is null
- "Failed to load map library" - Leaflet import error
- "Unable to determine location" - Geocoding failed, using fallback

## Map Configuration

### With Valid Coordinates

```typescript
{
  center: [venue.coordinates.lat, venue.coordinates.lon],
  zoom: 11,
  marker: {
    position: [venue.coordinates.lat, venue.coordinates.lon],
    popup: `${venue.name}\n${formatAddress(venue.address)}`
  }
}
```

### Without Coordinates (Geocoding Fallback)

```typescript
{
  center: [geocodedLat, geocodedLon],  // From Nominatim API
  zoom: 11,
  marker: null  // No marker when coordinates missing
}
```

### Geocoding Failed (Final Fallback)

```typescript
{
  center: [48.8566, 2.3522],  // Paris, Europe center
  zoom: 5,  // Wider zoom for continent view
  marker: null
}
```

## Geocoding Contract

**Function**: `geocodeLocation(city: string, country: string): Promise<[number, number] | null>`

**API**: OpenStreetMap Nominatim (https://nominatim.openstreetmap.org)

**Caching**:

- Key: `geocode:${city},${country}`
- Storage: sessionStorage
- TTL: Session lifetime (cleared on browser close)

**Rate Limiting**:

- Max 1 request per second (Nominatim usage policy)
- Implement request queue if multiple venues

**Test Cases**:

```typescript
const coords = await geocodeLocation('Boston', 'US');
expect(coords).toEqual([42.3601, -71.0589]);

// Cache hit
const cached = await geocodeLocation('Boston', 'US');
expect(cached).toEqual(coords);
// Verify no second API call made

// Unknown location
const unknown = await geocodeLocation('InvalidCity123', 'XX');
expect(unknown).toBeNull();
```

## Dependencies

```typescript
import { ref, type Ref, onUnmounted } from 'vue';
import type * as L from 'leaflet';  // Type-only import

// Dynamic import
const Leaflet = await import('leaflet');
const map = Leaflet.map(...);
```

## Lifecycle Management

**Setup**:

```typescript
const { initializeMap, destroyMap } = useMapIntegration(venue, container);
```

**Mount** (when Venue tab activated):

```typescript
onMounted(() => {
  void initializeMap();
});
```

**Unmount** (cleanup):

```typescript
onUnmounted(() => {
  destroyMap();
});
```

## Error Handling

| Scenario                             | Behavior                               |
| ------------------------------------ | -------------------------------------- |
| Leaflet import fails                 | Set mapError, show error message in UI |
| Container ref null when initializing | Set mapError, log warning              |
| Coordinates invalid (out of range)   | Use geocoding fallback                 |
| Geocoding API fails (network)        | Use Europe fallback, set warning       |
| Geocoding API rate limit             | Queue request, retry after 1s          |
| Map initialization timeout (>5s)     | Set mapError, allow retry              |

## Test File Contract

**Path**: `src/composables/__tests__/useMapIntegration.test.ts`

**Required Test Suites**:

1. `describe('useMapIntegration - initialization')`

   - Successful map creation with coordinates
   - Map creation with geocoding fallback
   - Map creation with final fallback (geocoding failed)
   - Container ref null handling
   - Idempotent initialization (calling twice)

2. `describe('useMapIntegration - geocoding')`

   - Successful geocoding
   - Geocoding with cache
   - Failed geocoding
   - Rate limiting (mock multiple requests)

3. `describe('useMapIntegration - cleanup')`

   - destroyMap removes instance
   - destroyMap resets isMapReady
   - Multiple destroyMap calls safe

4. `describe('useMapIntegration - error states')`

   - Leaflet import failure
   - Container not available
   - Network error during geocoding
   - Invalid coordinates

5. `describe('useMapIntegration - reactivity')`
   - Venue changes trigger re-initialization
   - isMapReady updates correctly
   - mapError updates correctly

**Test Setup**:

```typescript
import { ref } from 'vue';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useMapIntegration } from '../useMapIntegration';

// Mock Leaflet
vi.mock('leaflet', () => ({
  map: vi.fn(() => ({
    setView: vi.fn(),
    remove: vi.fn(),
  })),
  tileLayer: vi.fn(() => ({
    addTo: vi.fn(),
  })),
  marker: vi.fn(() => ({
    addTo: vi.fn(),
    bindPopup: vi.fn(),
  })),
}));

// Mock fetch for geocoding
global.fetch = vi.fn();

beforeEach(() => {
  sessionStorage.clear();
  vi.clearAllMocks();
});
```

**Test Execution**:

- All tests MUST pass `pnpm test:run`
- Coverage target: 90%+ (allow some async edge cases)
- Mock Leaflet library (don't load actual map in tests)
- Mock fetch for geocoding API calls

# Phase 0: Research & Technical Decisions

**Feature**: Enhanced Event Display  
**Date**: 2025-10-03  
**Status**: Complete

## Research Areas

### 1. OpenStreetMap Integration Library

**Decision**: Leaflet.js

**Rationale**:

- Lightweight (42KB gzipped) vs. OpenLayers (250KB+)
- Excellent TypeScript support with @types/leaflet
- Active community, 40k+ GitHub stars
- Built-in lazy loading support
- Mobile-friendly with touch gesture support
- Easy zoom level control (direct integer: `zoom: 11`)
- Well-documented Vue 3 integration patterns

**Alternatives Considered**:

- **OpenLayers**: More features but significantly heavier, overkill for single marker display
- **Mapbox GL JS**: Proprietary, requires API key and billing setup
- **Google Maps**: Requires API key, pricing concerns, heavier bundle

**Implementation Pattern**:

```typescript
// Lazy load Leaflet only when Venue tab activated
const { ref, onMounted } = useVue();
const mapContainer = ref<HTMLElement | null>(null);
let map: L.Map | null = null;

const initMap = async () => {
  const L = await import('leaflet');
  map = L.map(mapContainer.value!, { zoom: 11 });
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
};
```

### 2. Date Formatting Library

**Decision**: date-fns

**Rationale**:

- Already in project dependencies (check package.json)
- Tree-shakeable (only import needed functions)
- Immutable & functional API (no Date.prototype pollution)
- TypeScript-first design
- Locale support if needed later
- ~2KB per function vs. moment.js 67KB

**Alternatives Considered**:

- **Day.js**: Lighter (2KB) but less TypeScript support
- **Luxon**: Good i18n but heavier (67KB) and uses Intl API (limited old browser support)
- **Native Intl.DateTimeFormat**: Browser inconsistencies, complex formatting for ranges

**Implementation Pattern**:

```typescript
import { format, parseISO } from 'date-fns';

export const formatEventDateRange = (startDate: string, endDate: string): string => {
  const start = parseISO(startDate);
  const end = parseISO(endDate);

  // "18-22 Sep 2025" format
  const startDay = format(start, 'd');
  const endDay = format(end, 'd');
  const month = format(end, 'MMM');
  const year = format(end, 'yyyy');

  return `${startDay}-${endDay} ${month} ${year}`;
};
```

### 3. Category-Specific Default Images

**Decision**: Static image mapping with WebP format

**Rationale**:

- WebP offers 25-35% better compression than JPEG
- Fallback to JPEG for old browsers via `<picture>` element (Quasar QImg supports this)
- Store images in `/src/assets/images/category-defaults/`
- Map category slugs to image paths via TypeScript const object
- Images pre-optimized at build time by Vite

**Alternatives Considered**:

- **Dynamic gradient generation**: Less predictable, harder to design attractive defaults
- **External CDN**: Adds network dependency, slower initial load
- **Single default image**: Less visually distinctive per category

**Implementation Pattern**:

```typescript
// src/utils/categoryImages.ts
export const CATEGORY_DEFAULT_IMAGES = {
  marathon: '/images/category-defaults/marathon.webp',
  festival: '/images/category-defaults/festival.webp',
  encuentro: '/images/category-defaults/encuentro.webp',
  // ... more categories
} as const;

export type EventCategory = keyof typeof CATEGORY_DEFAULT_IMAGES;

export const getCategoryImage = (category: string): string => {
  const normalized = category.toLowerCase() as EventCategory;
  return CATEGORY_DEFAULT_IMAGES[normalized] || CATEGORY_DEFAULT_IMAGES.marathon;
};
```

### 4. Lazy Loading Strategy

**Decision**: Vue 3 `Suspense` + `defineAsyncComponent` for map component

**Rationale**:

- Native Vue 3 feature, no additional library
- Map component only loads when Venue tab is activated
- Reduces initial page load by ~50KB (Leaflet bundle)
- Built-in loading/error states via Suspense
- Works seamlessly with Quasar's tab system

**Implementation Pattern**:

```typescript
// EventDetails.vue
import { defineAsyncComponent } from 'vue';

const EventVenueMap = defineAsyncComponent(
  () => import('@/components/event/EventVenueMap.vue')
);

// In template:
<q-tab-panel name="venue">
  <Suspense>
    <template #default>
      <EventVenueMap :coordinates="venueCoordinates" />
    </template>
    <template #fallback>
      <q-spinner color="primary" size="40px" />
    </template>
  </Suspense>
</q-tab-panel>
```

### 5. Responsive Image Handling

**Decision**: Quasar QImg with responsive sizing and lazy loading

**Rationale**:

- QImg has built-in lazy loading (`loading="lazy"`)
- Supports responsive sizing with Quasar breakpoints
- Proper aspect ratio maintenance with `ratio` prop
- Spinner while loading, error state handling
- Follows constitutional Quasar-First principle

**Implementation Pattern**:

```vue
<q-img
  :src="eventImage || categoryFallbackImage"
  :alt="`Event banner for ${eventName}`"
  class="hero-img"
  loading="lazy"
  ratio="16/9"
  :img-style="{ objectFit: 'cover' }"
>
  <div class="absolute-full bg-gradient" />
  <!-- Hero content overlay -->
</q-img>
```

### 6. Ordinal Number Formatting

**Decision**: Custom TypeScript utility function

**Rationale**:

- Simple logic (1st, 2nd, 3rd, 4th, etc.)
- No library needed (~10 lines of code)
- Type-safe implementation
- Handles edge cases (11th, 12th, 13th)

**Implementation Pattern**:

```typescript
// src/utils/dateFormatters.ts
export const formatOrdinal = (num: number): string => {
  const suffixes = ['th', 'st', 'nd', 'rd'];
  const value = num % 100;

  return num + (suffixes[(value - 20) % 10] || suffixes[value] || suffixes[0]);
};

// Usage: formatOrdinal(13) → "13th"
```

### 7. Map Coordinate Fallback Strategy

**Decision**: Geocoding to city/country level using OpenStreetMap Nominatim API

**Rationale**:

- Free, no API key required (respects usage policy)
- Can geocode city/country strings to lat/lon
- Cache results in sessionStorage to minimize API calls
- Fallback: Center map on city coordinates without marker
- Follows constitutional requirement for graceful degradation

**Implementation Pattern**:

```typescript
// composables/useMapIntegration.ts
const geocodeLocation = async (city: string, country: string): Promise<[number, number] | null> => {
  const cacheKey = `geocode:${city},${country}`;
  const cached = sessionStorage.getItem(cacheKey);

  if (cached) return JSON.parse(cached);

  const query = `${city}, ${country}`;
  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`,
  );

  const data = await response.json();
  if (data[0]) {
    const coords: [number, number] = [parseFloat(data[0].lat), parseFloat(data[0].lon)];
    sessionStorage.setItem(cacheKey, JSON.stringify(coords));
    return coords;
  }

  return null;
};
```

## Performance Considerations

### Bundle Size Impact

- Leaflet.js: +42KB gzipped
- date-fns (2 functions): ~4KB gzipped
- Category images (WebP, 3 images @ ~30KB each): +90KB initial, cached
- **Total estimated addition**: ~136KB (acceptable for feature scope)

### Loading Strategy

1. **Critical path**: Hero image, date formatting (inline)
2. **Deferred**: Map component (tab activation)
3. **Cached**: Category images (browser cache), geocoding results (sessionStorage)

### Performance Targets Validation

- ✅ Featured images <2s on 3G: QImg lazy loading + WebP compression
- ✅ Map init <1s: Lazy component loading + Leaflet's optimized tile loading
- ✅ Lighthouse 80+: Deferred map, optimized images, no layout shifts

## Testing Strategy

### Unit Tests (TDD Approach)

1. **dateFormatters.test.ts**: Test date range formatting, ordinal numbers
2. **categoryImages.test.ts**: Test fallback logic, category mapping
3. **useEventDisplay.test.ts**: Test composable logic (image selection, pill generation)
4. **useMapIntegration.test.ts**: Test map initialization, geocoding fallback

### Component Tests

1. **EventHeroSection.test.ts**: Test image display, pills rendering, mobile responsiveness
2. **EventVenueMap.test.ts**: Test map rendering, marker placement, zoom level

### Integration Tests

1. **event-display.test.ts**: End-to-end user scenarios from spec acceptance criteria

### Accessibility Tests

- Automated: axe-core via vitest-axe
- Manual: Keyboard navigation, screen reader (VoiceOver/NVDA)

## Dependencies to Add

```json
{
  "dependencies": {
    "leaflet": "^1.9.4",
    "date-fns": "^3.0.0" // Check if already present
  },
  "devDependencies": {
    "@types/leaflet": "^1.9.8",
    "vitest-axe": "^0.1.0"
  }
}
```

## Configuration Changes

### Vite Config (quasar.config.ts)

- Ensure CSS imports for Leaflet are included
- Add image optimization for WebP in `assets/images/`

### TypeScript (tsconfig.json)

- Already strict mode enabled ✓
- No changes needed

### Biome (biome.json)

- No changes needed (already configured per constitution)

## Risk Mitigation

| Risk                                 | Mitigation                                                |
| ------------------------------------ | --------------------------------------------------------- |
| Map doesn't load on slow connections | Show loading spinner, timeout after 5s with error message |
| Category images fail to load         | QImg handles errors gracefully, show text-only fallback   |
| Geocoding API rate limit             | Cache in sessionStorage, implement exponential backoff    |
| Date parsing fails                   | Try-catch with fallback to raw date display               |
| Old browsers don't support WebP      | Use `<picture>` with JPEG fallback via QImg               |

## Open Questions Resolved

All questions from spec clarifications have been resolved:

- ✅ Featured image fallback: Category-specific default images
- ✅ Map zoom level: 11 (regional view)
- ✅ Edition format: Ordinal number ("13th Edition")
- ✅ Missing coordinates: Geocode city/country, show map without marker
- ✅ Date format: "18-22 Sep 2025" (abbreviated universal)

## Next Steps

✅ Phase 0 complete → Proceed to Phase 1 (Design & Contracts)

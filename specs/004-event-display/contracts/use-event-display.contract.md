# Composable Contracts: useEventDisplay

**Module**: `src/composables/useEventDisplay.ts`  
**Type**: Vue 3 Composition API composable

## Purpose

Encapsulate event display logic for hero section, date formatting, category pills, and image selection. Provides reactive computed properties for EventDetails.vue component.

## Signature

```typescript
export function useEventDisplay(event: Ref<EventResponse | null>): {
  formattedDateRange: ComputedRef<string>;
  editionDisplay: ComputedRef<string | null>;
  categoryPillData: ComputedRef<CategoryConfig | null>;
  heroImageSrc: ComputedRef<string>;
  isLoading: Ref<boolean>;
};
```

## Input Contract

**Parameters**:

- `event`: Reactive reference to EventResponse object or null
- MUST be reactive (Ref) to enable computed property updates

**EventResponse Type**:

```typescript
type EventResponse = {
  id: number;
  event_name: string;
  featured_image: string | null;
  dates: {
    start: string; // ISO 8601
    end: string; // ISO 8601
  };
  taxonomies: {
    event_category?: string[];
  };
  edition?: number | string;
};
```

## Output Contract

### formattedDateRange

**Type**: `ComputedRef<string>`

**Behavior**:

- Returns formatted date range ("18-22 Sep 2025")
- Reactive: Updates when event.value.dates changes
- Falls back to "Dates TBD" if dates invalid or missing

**Test Cases**:

```typescript
const event = ref({ dates: { start: '2025-09-18', end: '2025-09-22' } });
const { formattedDateRange } = useEventDisplay(event);

expect(formattedDateRange.value).toBe('18-22 Sep 2025');

// Reactivity test
event.value.dates.end = '2025-09-25';
await nextTick();
expect(formattedDateRange.value).toBe('18-25 Sep 2025');

// Invalid dates
event.value.dates.start = 'invalid';
await nextTick();
expect(formattedDateRange.value).toBe('Dates TBD');
```

### editionDisplay

**Type**: `ComputedRef<string | null>`

**Behavior**:

- Returns formatted edition ("13th Edition") or null
- Reactive: Updates when event.value.edition changes
- Returns null if edition undefined or invalid

**Test Cases**:

```typescript
const event = ref({ edition: 13 });
const { editionDisplay } = useEventDisplay(event);

expect(editionDisplay.value).toBe('13th Edition');

// String edition
event.value.edition = '21';
await nextTick();
expect(editionDisplay.value).toBe('21st Edition');

// No edition
event.value.edition = undefined;
await nextTick();
expect(editionDisplay.value).toBeNull();
```

### categoryPillData

**Type**: `ComputedRef<CategoryConfig | null>`

**Behavior**:

- Returns category configuration object or null
- Reactive: Updates when event.value.taxonomies changes
- Returns null if no categories (hides pill in UI)

**Test Cases**:

```typescript
const event = ref({
  taxonomies: { event_category: ['marathon'] },
});
const { categoryPillData } = useEventDisplay(event);

expect(categoryPillData.value).toEqual({
  slug: 'marathon',
  name: 'Tango Marathon',
  color: '#1976D2',
  textColor: '#FFFFFF',
  icon: 'event',
  defaultImage: '/images/category-defaults/marathon.webp',
});

// No categories
event.value.taxonomies.event_category = [];
await nextTick();
expect(categoryPillData.value).toBeNull();
```

### heroImageSrc

**Type**: `ComputedRef<string>`

**Behavior**:

- Returns featured image URL or category-specific fallback
- Reactive: Updates when event.value.featured_image or categories change
- NEVER returns null/undefined (always has fallback)

**Test Cases**:

```typescript
const event = ref({
  featured_image: 'https://example.com/image.jpg',
  taxonomies: { event_category: ['marathon'] },
});
const { heroImageSrc } = useEventDisplay(event);

expect(heroImageSrc.value).toBe('https://example.com/image.jpg');

// No featured image, use category fallback
event.value.featured_image = null;
await nextTick();
expect(heroImageSrc.value).toBe('/images/category-defaults/marathon.webp');

// No featured image, no category, use default fallback
event.value.taxonomies.event_category = [];
await nextTick();
expect(heroImageSrc.value).toBe('/images/category-defaults/marathon.webp');
```

### isLoading

**Type**: `Ref<boolean>`

**Behavior**:

- Tracks async operations (if any in future enhancements)
- Currently always false (no async ops in this composable)
- Provided for consistency with composable patterns

## Dependencies

```typescript
import { computed, type ComputedRef, type Ref } from 'vue';
import { formatEventDateRange, formatEdition } from '@/utils/dateFormatters';
import {
  getCategoryPillData,
  getCategoryDefaultImage,
  type CategoryConfig,
} from '@/utils/categoryImages';
```

## Error Handling

- Invalid dates → Fallback to "Dates TBD"
- Invalid edition → Return null
- Missing categories → Return null for pill, marathon fallback for image
- All errors caught gracefully, no thrown exceptions

## Test File Contract

**Path**: `src/composables/__tests__/useEventDisplay.test.ts`

**Required Test Suites**:

1. `describe('useEventDisplay - formattedDateRange')`

   - Valid date ranges
   - Invalid dates fallback
   - Reactivity (date changes)

2. `describe('useEventDisplay - editionDisplay')`

   - Number edition
   - String edition
   - Undefined edition
   - Invalid edition
   - Reactivity

3. `describe('useEventDisplay - categoryPillData')`

   - Valid category
   - Multiple categories (uses first)
   - No categories (null)
   - Unknown category (fallback)
   - Reactivity

4. `describe('useEventDisplay - heroImageSrc')`

   - Featured image present
   - Featured image missing, category fallback
   - No featured image, no category, default fallback
   - Reactivity (image and category changes)

5. `describe('useEventDisplay - integration')`
   - All computed properties work together
   - Event object changes update all properties
   - Null event handling

**Test Setup**:

```typescript
import { ref } from 'vue';
import { describe, it, expect } from 'vitest';
import { useEventDisplay } from '../useEventDisplay';

// Mock event factory
const createMockEvent = (overrides = {}) =>
  ref({
    id: 1,
    event_name: 'Test Event',
    featured_image: null,
    dates: {
      start: '2025-09-18',
      end: '2025-09-22',
    },
    taxonomies: {
      event_category: ['marathon'],
    },
    edition: 13,
    ...overrides,
  });
```

**Test Execution**:

- All tests MUST pass `pnpm test:run`
- Coverage target: 95%+ (allow some edge case branches)
- Test both functionality AND reactivity

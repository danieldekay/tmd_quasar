# Utility Contracts: Category Images

**Module**: `src/utils/categoryImages.ts`  
**Type**: Configuration and mapping utilities

## Constant Contracts

### CATEGORY_CONFIG

**Purpose**: Map category slugs to display configuration

**Type Definition**:

```typescript
export type CategoryConfig = {
  slug: string;
  name: string;
  color: string; // Hex color
  textColor: string; // Hex color
  icon: string; // Material icon name
  defaultImage: string; // Path to image
};

export const CATEGORY_CONFIG: Record<string, CategoryConfig> = {
  // ... mappings
} as const;
```

**Contract Requirements**:

- ALL colors MUST pass WCAG 2.1 AA contrast (4.5:1 minimum)
- ALL defaultImage paths MUST point to existing files in `/src/assets/images/category-defaults/`
- ALL icons MUST be valid Material Icons names
- Keys MUST match lowercase WordPress category slugs

**Required Categories**:

- `marathon`: Blue theme (#1976D2), icon: 'event'
- `festival`: Purple theme (#7B1FA2), icon: 'celebration'
- `encuentro`: Pink theme (#C2185B), icon: 'people'
- `workshop`: Green theme (#388E3C), icon: 'school'

---

## Function Contracts

### getCategoryConfig

**Purpose**: Get category configuration with fallback

**Signature**:

```typescript
function getCategoryConfig(categorySlug: string | undefined): CategoryConfig;
```

**Input Contract**:

- `categorySlug`: Lowercase category slug or undefined
- May include unknown categories (not in CATEGORY_CONFIG)

**Output Contract**:

- Returns CategoryConfig object
- NEVER returns null/undefined
- Unknown categories fallback to 'marathon' config

**Test Cases**:

```typescript
getCategoryConfig('marathon')
  → { slug: 'marathon', name: 'Tango Marathon', ... }

getCategoryConfig('MARATHON') // case insensitive
  → { slug: 'marathon', name: 'Tango Marathon', ... }

getCategoryConfig('unknown-category')
  → { slug: 'marathon', name: 'Tango Marathon', ... } // fallback

getCategoryConfig(undefined)
  → { slug: 'marathon', name: 'Tango Marathon', ... } // fallback

getCategoryConfig('')
  → { slug: 'marathon', name: 'Tango Marathon', ... } // fallback
```

---

### getCategoryDefaultImage

**Purpose**: Get category-specific default image path

**Signature**:

```typescript
function getCategoryDefaultImage(categories: string[] | undefined): string;
```

**Input Contract**:

- `categories`: Array of category slugs (from event taxonomies)
- May be undefined, empty array, or contain unknown categories
- Uses first category in array

**Output Contract**:

- Returns absolute path to default image (e.g., "/images/category-defaults/marathon.webp")
- NEVER returns null/undefined
- Always returns valid image path (fallback to marathon)

**Test Cases**:

```typescript
getCategoryDefaultImage(['marathon'])
  → "/images/category-defaults/marathon.webp"

getCategoryDefaultImage(['festival', 'marathon'])
  → "/images/category-defaults/festival.webp" // uses first

getCategoryDefaultImage(['unknown'])
  → "/images/category-defaults/marathon.webp" // fallback

getCategoryDefaultImage([])
  → "/images/category-defaults/marathon.webp" // fallback

getCategoryDefaultImage(undefined)
  → "/images/category-defaults/marathon.webp" // fallback
```

---

### getCategoryPillData

**Purpose**: Get complete category data for pill display

**Signature**:

```typescript
function getCategoryPillData(categories: string[] | undefined): CategoryConfig | null;
```

**Input Contract**:

- `categories`: Array of category slugs or undefined

**Output Contract**:

- Returns CategoryConfig if categories exist
- Returns null if categories is undefined or empty (hide pill)
- Uses first category in array

**Test Cases**:

```typescript
getCategoryPillData(['marathon'])
  → { slug: 'marathon', name: 'Tango Marathon', color: '#1976D2', ... }

getCategoryPillData(['festival', 'marathon'])
  → { slug: 'festival', ... } // first category

getCategoryPillData([])
  → null // hide pill

getCategoryPillData(undefined)
  → null // hide pill
```

---

## Asset Requirements

**Directory**: `/src/assets/images/category-defaults/`

**Required Files**:

- `marathon.webp` (aspect ratio 16:9, optimized for web)
- `festival.webp` (aspect ratio 16:9, optimized for web)
- `encuentro.webp` (aspect ratio 16:9, optimized for web)
- `workshop.webp` (aspect ratio 16:9, optimized for web)

**File Specifications**:

- Format: WebP (primary), JPEG fallback optional
- Dimensions: 1920x1080 or 1280x720 (16:9 ratio)
- File size: <100KB per image (after compression)
- Quality: 80-85% (balance of quality vs. size)

## Module Dependencies

```typescript
// No external dependencies - pure TypeScript
```

## Test File Contract

**Path**: `src/utils/__tests__/categoryImages.test.ts`

**Required Test Suites**:

1. `describe('CATEGORY_CONFIG')`

   - All required categories exist
   - All colors are valid hex
   - All image paths exist
   - Contrast ratios meet WCAG AA

2. `describe('getCategoryConfig')`

   - Known categories return correct config
   - Unknown categories fallback to marathon
   - Handles undefined/empty/invalid input
   - Case insensitive matching

3. `describe('getCategoryDefaultImage')`

   - Returns correct image path for each category
   - Handles array with multiple categories (uses first)
   - Fallback to marathon for invalid input
   - Never returns null/undefined

4. `describe('getCategoryPillData')`
   - Returns config for valid categories
   - Returns null for undefined/empty
   - Uses first category in array
   - Fallback behavior correct

**Validation Tests**:

```typescript
// Asset existence check
it('should have all required default images', async () => {
  for (const category of Object.values(CATEGORY_CONFIG)) {
    const imagePath = new URL(category.defaultImage, import.meta.url);
    const response = await fetch(imagePath);
    expect(response.ok).toBe(true);
  }
});

// Contrast ratio check
it('should meet WCAG AA contrast requirements', () => {
  for (const category of Object.values(CATEGORY_CONFIG)) {
    const ratio = getContrastRatio(category.color, category.textColor);
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  }
});
```

**Test Execution**:

- All tests MUST pass `pnpm test:run`
- Coverage MUST be 100% for utility functions
- Asset validation may be integration test (separate suite)

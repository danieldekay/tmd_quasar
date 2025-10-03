# Utility Contracts: Date Formatting

**Module**: `src/utils/dateFormatters.ts`  
**Type**: Pure utility functions (no API, no side effects)

## Function Contracts

### formatEventDateRange

**Purpose**: Convert ISO date strings to abbreviated universal format

**Signature**:

```typescript
function formatEventDateRange(startDate: string, endDate: string): string;
```

**Input Contract**:

- `startDate`: ISO 8601 string (e.g., "2025-09-18T00:00:00")
- `endDate`: ISO 8601 string (e.g., "2025-09-22T00:00:00")
- `endDate` MUST be >= `startDate`

**Output Contract**:

- Returns string in format: "DD-DD MMM YYYY" (e.g., "18-22 Sep 2025")
- Month MUST be abbreviated 3-letter format (Jan, Feb, Mar, etc.)
- Day numbers MUST NOT have leading zeros
- Year MUST be 4 digits

**Error Handling**:

- Invalid date string → throw TypeError with message "Invalid date format"
- `endDate` < `startDate` → throw RangeError with message "End date must be after start date"

**Test Cases**:

```typescript
// Happy path
formatEventDateRange("2025-09-18", "2025-09-22")
  → "18-22 Sep 2025"

// Same month, different year boundary
formatEventDateRange("2025-12-30", "2026-01-02")
  → "30 Dec 2025 - 2 Jan 2026"

// Single day event
formatEventDateRange("2025-09-18", "2025-09-18")
  → "18 Sep 2025"

// Error cases
formatEventDateRange("invalid", "2025-09-22")
  → throw TypeError

formatEventDateRange("2025-09-22", "2025-09-18")
  → throw RangeError
```

---

### formatOrdinal

**Purpose**: Convert integer to ordinal string (1st, 2nd, 3rd, etc.)

**Signature**:

```typescript
function formatOrdinal(num: number): string;
```

**Input Contract**:

- `num`: Positive integer >= 1
- MUST be whole number (not decimal)

**Output Contract**:

- Returns string: number + suffix (st, nd, rd, th)
- Handles special cases: 11th, 12th, 13th (not 11st, 12nd, 13rd)

**Error Handling**:

- `num` < 1 → throw RangeError "Edition number must be positive"
- `num` is decimal → throw TypeError "Edition number must be integer"

**Test Cases**:

```typescript
formatOrdinal(1)   → "1st"
formatOrdinal(2)   → "2nd"
formatOrdinal(3)   → "3rd"
formatOrdinal(4)   → "4th"
formatOrdinal(11)  → "11th"
formatOrdinal(12)  → "12th"
formatOrdinal(13)  → "13th"
formatOrdinal(21)  → "21st"
formatOrdinal(22)  → "22nd"
formatOrdinal(23)  → "23rd"
formatOrdinal(111) → "111th"

// Error cases
formatOrdinal(0)    → throw RangeError
formatOrdinal(-5)   → throw RangeError
formatOrdinal(1.5)  → throw TypeError
```

---

### formatEdition

**Purpose**: Convert edition number/year to display format

**Signature**:

```typescript
function formatEdition(edition: number | string | undefined): string | null;
```

**Input Contract**:

- `edition`: number (e.g., 13), string (e.g., "13"), or undefined
- If string, MUST be parseable to integer

**Output Contract**:

- Returns "Nth Edition" format (e.g., "13th Edition")
- Returns null if edition is undefined or invalid

**Error Handling**:

- No errors thrown (returns null for invalid input)

**Test Cases**:

```typescript
formatEdition(13)        → "13th Edition"
formatEdition("13")      → "13th Edition"
formatEdition(1)         → "1st Edition"
formatEdition(undefined) → null
formatEdition("invalid") → null
formatEdition(0)         → null
formatEdition(-5)        → null
```

## Module Dependencies

```typescript
import { format, parseISO } from 'date-fns';
```

## Test File Contract

**Path**: `src/utils/__tests__/dateFormatters.test.ts`

**Required Test Suites**:

1. `describe('formatEventDateRange')`

   - Valid date ranges (same month, different months, year boundary)
   - Single day events
   - Error cases (invalid dates, reversed dates)

2. `describe('formatOrdinal')`

   - Numbers 1-30 (cover all suffix types)
   - Special cases (11, 12, 13)
   - Large numbers (100+)
   - Error cases (0, negative, decimal)

3. `describe('formatEdition')`
   - Number input
   - String input
   - Undefined input
   - Invalid string input

**Test Execution**:

- All tests MUST pass `pnpm test:run`
- Coverage MUST be 100% for this module (simple utility functions)

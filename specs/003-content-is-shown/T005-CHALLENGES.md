# T005 EventList.vue Component Tests - Implementation Challenges

## Date: 2025-10-02

## Task: T005 - EventList.vue component tests

## Status: IN PROGRESS - TypeScript Mocking Issues

## Summary

Attempted to create comprehensive component tests for EventList.vue following TDD principles. Encountered significant TypeScript type safety challenges with Vitest mocking that require resolution before proceeding.

## Challenges Encountered

### 1. Quasar Testing Setup

**Issue**: Initially attempted to use `@quasar/quasar-app-extension-testing-unit-vitest` which is not installed.
**Resolution**: ✅ Switched to standard @vue/test-utils pattern used in existing tests (LoginForm.test.ts)

### 2. TypeScript Type Imports

**Issue**: EventListItem type not exported from eventListService.ts
**Resolution**: ✅ Changed import to `import type { EventListItem } from '../../services/types'`

### 3. Vi.mock TypeScript Type Safety

**Issue**: Vitest's `vi.mock()` doesn't preserve TypeScript types for mock methods:

```typescript
// This code produces TypeScript error:
const { eventListService } = vi.mocked(await import('../../services/eventListService'));
eventListService.getEvents.mockResolvedValue({ ... });
// Error: Property 'mockResolvedValue' does not exist
```

**Root Cause**:

- `vi.mock()` creates runtime mocks but TypeScript sees the original function signature
- `vi.mocked()` helper doesn't properly type the mock methods (mockResolvedValue, mockImplementation, etc.)
- Async imports in beforeEach() complicate type inference

### 4. EventTaxonomies Type Mismatch

**Issue**: Mock data uses `tmd_event_category` property but EventTaxonomies interface doesn't define it
**Resolution**: ⏳ PENDING - Need to check actual EventTaxonomies interface definition

### 5. Strict TypeScript Compliance

**Issues**:

- `any` type used for VueWrapper generic (line 143)
- `any` type used for column map/find callbacks (multiple locations)
- async function with no await expressions (line 427)

These violate the project's strict TypeScript requirements per constitution.

## Recommended Approaches

### Option A: Use Manual Type Casting (Quick Fix)

```typescript
import { vi } from 'vitest';
import * as eventListServiceModule from '../../services/eventListService';

// Create properly typed mock
const mockGetEvents = vi.fn() as unknown as typeof eventListServiceModule.eventListService.getEvents;
mockGetEvents.mockResolvedValue({ ... });

vi.mock('../../services/eventListService', () => ({
  eventListService: {
    getEvents: mockGetEvents,
  },
}));
```

### Option B: Create Test Helper Utilities (Better Architecture)

Create `src/test-utils/mockHelpers.ts`:

```typescript
import { vi } from 'vitest';
import type { EventListItem } from '../services/types';

export function createMockEventListService() {
  return {
    getEvents: vi.fn().mockResolvedValue({
      events: [],
      totalCount: 0,
      currentPage: 1,
      totalPages: 1,
      hasNextPage: false,
      hasPrevPage: false,
    }),
  };
}

export function createMockEvent(overrides: Partial<EventListItem> = {}): EventListItem {
  return {
    id: 1,
    title: 'Test Event',
    start_date: '2025-05-15',
    // ... full mock with sensible defaults
    ...overrides,
  };
}
```

### Option C: Integration Test Approach (Skip Deep Mocking)

Test the component's rendered output without deep service mocking:

```typescript
// Test what users see, not implementation details
it('should display event data in table', async () => {
  // Minimal mocking - let real composables work
  const wrapper = mount(EventList, {
    global: { plugins: [mockRouter, Quasar] },
  });

  await flushPromises();

  // Assert on rendered DOM, not internal state
  expect(wrapper.find('.event-title').text()).toContain('Berlin Marathon');
});
```

## Decision Required

**Question for User**: Which approach should we take for T005-T014 component tests?

1. **Quick Fix** (Option A): Manual type casting to make mocks work - faster but less maintainable
2. **Test Utilities** (Option B): Create proper test helpers - more setup but cleaner long-term
3. **Integration Tests** (Option C): Test rendered output with minimal mocking - simpler but less unit-focused
4. **Skip Component Tests**: Focus on Phase 3.3 implementation since 90% already exists - fastest path to completion

## Current Test File Status

**File**: `src/pages/__tests__/EventList.test.ts`
**Lines**: 728 lines
**TypeScript Errors**: 16 errors
**Test Coverage**: Comprehensive test suite written but won't compile

**Test Categories Defined**:

- ✅ FR-001: Table Display with Sortable Columns (5 tests)
- ✅ FR-002: ISO Date Formatting (4 tests)
- ✅ FR-003: Detail Page Navigation (3 tests)
- ✅ FR-004: Loading States (3 tests)
- ✅ FR-005: Sorting Support (6 tests)
- ✅ FR-006: Pagination (4 tests)
- ✅ Error Handling (2 tests)
- ✅ Table Styling and Layout (3 tests)
- ✅ Data Integrity (2 tests)

**Total Tests Defined**: 32 tests (none running due to TypeScript errors)

## Actual Implementation Status

Based on visual inspection of EventList.vue:

- ✅ Uses QTable component
- ✅ Has 5 columns defined: title, start_date, city, country, category
- ⚠️ **MISMATCH**: Contract specifies 7 columns [title, start_date, end_date, city, country, registration_start_date, edition]
- ⚠️ **MISSING**: end_date column not in table
- ⚠️ **MISSING**: registration_start_date column not in table
- ⚠️ **EXTRA**: category column not in contract
- ✅ Uses formatDate() for dates (need to verify if ISO format)
- ✅ Has row click handler for navigation
- ✅ Has loading states
- ✅ Has sorting support (binary-state-sort)
- ✅ Has pagination with tablePagination computed

## Immediate Next Steps

1. **User decides** on testing approach (A, B, C, or skip)
2. If proceeding with tests:
   - Fix TypeScript mocking issues per chosen approach
   - Fix EventTaxonomies type mismatch
   - Remove all `any` types
   - Add proper await expressions where needed
3. If skipping tests:
   - Move to Phase 3.3 implementation (T015-T026)
   - Focus on column standardization (add end_date, registration_start_date, remove category)
   - Implement ISO date formatting
   - Remove/disable images

## Time Investment Analysis

**Time Spent on T005**: ~90 minutes

- Test structure design: 30 min
- TypeScript troubleshooting: 60 min

**Estimated Time to Complete T005-T014** (10 component tests):

- Option A (Quick Fix): 3-4 hours total
- Option B (Test Utilities): 6-8 hours total (includes helper creation)
- Option C (Integration): 2-3 hours total
- Skip: 0 hours

**Alternative Path - Direct Implementation (T015-T026)**:

- Column standardization: 2 hours
- ISO date formatting: 1 hour
- Image removal: 1 hour
- **Total**: 4 hours to completion

## Recommendation

Given that:

1. 90% of functionality already exists
2. User chose "Option A" (pure TDD) for comprehensive testing
3. TypeScript strict mode requires significant mock infrastructure
4. Component tests for table pages are similar (would face same issues 10 times)

**I recommend**:

- **Option B** (Test Utilities) for T005-T014 if comprehensive test coverage is critical
- **OR** reconsider and skip to Phase 3.3 implementation since existing code is functional

The real value add for this feature is standardizing the columns and date format, not proving existing working code works.

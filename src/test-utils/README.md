# Test Utilities

Comprehensive testing infrastructure for TMD Quasar project with TypeScript strict mode compliance.

## Overview

This directory contains reusable test utilities that solve common testing challenges while maintaining strict TypeScript compliance and following project constitution principles.

## Structure

```
src/test-utils/
├── index.ts              # Main export file - import everything from here
├── mockFactories.ts      # Factory functions for creating mock data
├── mockServices.ts       # Mock service implementations
├── componentHelpers.ts   # Component mounting and testing utilities
└── README.md            # This file
```

## Installation

These utilities are already available in the project. No additional packages needed.

## Usage

### Basic Import

```typescript
import {
  createMockEvent,
  createMockEventListService,
  mountWithQuasar,
  getQTableProps,
} from '@/test-utils';
```

### Creating Mock Data

#### Events

```typescript
// Single event with defaults
const mockEvent = createMockEvent();

// Custom event
const customEvent = createMockEvent({
  title: 'My Custom Event',
  city: 'Paris',
  start_date: '2025-06-15',
});

// Multiple events
const events = createMockEventList(5); // Creates 5 mock events

// Full paginated response
const response = createMockEventsResponse(events, {
  totalCount: 100,
  currentPage: 2,
  hasNextPage: true,
});
```

#### Error Mocking

```typescript
// Network error
const networkError = createNetworkError();

// HTTP error
const notFoundError = createHttpError(404, 'Not Found');

// Custom error
const customError = createMockError('Something went wrong', 'CUSTOM_ERROR');
```

### Mocking Services

```typescript
import { vi } from 'vitest';
import { createMockEventListService, mockSuccessResponse, mockErrorResponse } from '@/test-utils';

describe('My Component', () => {
  let mockEventService: ReturnType<typeof createMockEventListService>;

  beforeEach(() => {
    // Create mock service with default responses
    mockEventService = createMockEventListService();

    // Override default behavior
    mockEventService.getEvents.mockResolvedValue({
      events: createMockEventList(3),
      totalCount: 3,
      currentPage: 1,
      totalPages: 1,
      hasNextPage: false,
      hasPrevPage: false,
    });
  });

  it('should handle error', async () => {
    // Mock error response
    mockErrorResponse(mockEventService.getEvents, createNetworkError());

    // Test error handling
  });

  it('should show loading state', async () => {
    // Mock delayed response for loading state testing
    mockDelayedResponse(mockEventService.getEvents, createMockEventsResponse([]), 200);

    // Test loading state
  });
});
```

### Component Testing

#### Basic Component Mount

```typescript
import { mountWithQuasar } from '@/test-utils';
import MyComponent from '../MyComponent.vue';

const wrapper = mountWithQuasar(
  MyComponent,
  {
    props: {
      eventId: 123,
    },
  },
  true,
); // true = include mock router
```

#### Testing QTable Components

```typescript
import {
  mountWithQuasar,
  getQTableProps,
  getQTableColumns,
  getQTableRows,
  isQTableLoading,
  clickQTableRow,
  getQTablePagination,
} from '@/test-utils';
import EventList from '../EventList.vue';

describe('EventList Table', () => {
  it('should display correct columns', () => {
    const wrapper = mountWithQuasar(EventList, {}, true);

    const columns = getQTableColumns(wrapper);
    expect(columns).toHaveLength(7);
    expect(columns.map((c) => c.name)).toEqual([
      'title',
      'start_date',
      'end_date',
      'city',
      'country',
      'registration_start_date',
      'edition',
    ]);
  });

  it('should display event rows', () => {
    const wrapper = mountWithQuasar(EventList, {}, true);

    const rows = getQTableRows(wrapper);
    expect(rows).toHaveLength(3);
  });

  it('should handle row click', async () => {
    const mockRouter = createMockRouter();
    const routerPushSpy = vi.spyOn(mockRouter, 'push');

    const wrapper = mountWithQuasar(EventList, {}, mockRouter);

    await clickQTableRow(wrapper, 0); // Click first row
    expect(routerPushSpy).toHaveBeenCalledWith('/events/1');
  });

  it('should show loading state', () => {
    const wrapper = mountWithQuasar(EventList, {}, true);

    const isLoading = isQTableLoading(wrapper);
    expect(isLoading).toBe(true);
  });

  it('should have correct pagination', () => {
    const wrapper = mountWithQuasar(EventList, {}, true);

    const pagination = getQTablePagination(wrapper);
    expect(pagination.sortBy).toBe('start_date');
    expect(pagination.descending).toBe(true);
    expect(pagination.rowsPerPage).toBe(20);
  });
});
```

#### Router Testing

```typescript
import { createMockRouter } from '@/test-utils';
import { vi } from 'vitest';

const mockRouter = createMockRouter();
const routerPushSpy = vi.spyOn(mockRouter, 'push');

// Use in component
const wrapper = mountWithQuasar(MyComponent, {}, mockRouter);

// Test navigation
await wrapper.find('.nav-link').trigger('click');
expect(routerPushSpy).toHaveBeenCalledWith('/events/123');
```

#### Test-ID Based Testing

```typescript
import { findByTestId, existsByTestId, getTextByTestId, clickByTestId } from '@/test-utils';

// Find element
const element = findByTestId(wrapper, 'event-title');

// Check existence
expect(existsByTestId(wrapper, 'loading-spinner')).toBe(true);

// Get text
const titleText = getTextByTestId(wrapper, 'event-title');

// Click element
await clickByTestId(wrapper, 'submit-button');
```

### Advanced Patterns

#### Service Mock with vi.mock

```typescript
import { vi } from 'vitest';
import { createMockEventListService } from '@/test-utils';

// Create the mock
const mockEventService = createMockEventListService();

// Use vi.mock to replace the actual service
vi.mock('@/services/eventListService', () => ({
  eventListService: mockEventService,
}));

// Now all imports of eventListService will use the mock
```

#### Multiple Mock Scenarios

```typescript
describe('Component with different states', () => {
  let mockService: ReturnType<typeof createMockEventListService>;

  beforeEach(() => {
    mockService = createMockEventListService();
  });

  it('should handle empty state', () => {
    mockService.getEvents.mockResolvedValue(createMockEventsResponse([]));
    // Test empty state
  });

  it('should handle error state', () => {
    mockService.getEvents.mockRejectedValue(createNetworkError());
    // Test error state
  });

  it('should handle success state', () => {
    mockService.getEvents.mockResolvedValue(createMockEventsResponse(createMockEventList(5)));
    // Test success state
  });
});
```

## API Reference

### Mock Factories (`mockFactories.ts`)

| Function                                       | Description               | Return Type                   |
| ---------------------------------------------- | ------------------------- | ----------------------------- |
| `createMockEvent(overrides?)`                  | Create single event       | `EventListItem`               |
| `createMockEventList(count)`                   | Create multiple events    | `EventListItem[]`             |
| `createMockEventsResponse(events, overrides?)` | Create paginated response | `PaginatedEventsResponse`     |
| `createMockTaxonomies(overrides?)`             | Create event taxonomies   | `EventTaxonomies`             |
| `generateDateRange(start, count, interval?)`   | Generate ISO date array   | `string[]`                    |
| `createMockError(message, code?)`              | Create error object       | `Error & { code?: string }`   |
| `createNetworkError()`                         | Create network error      | `Error`                       |
| `createHttpError(status, text)`                | Create HTTP error         | `Error & { response: {...} }` |

### Mock Services (`mockServices.ts`)

| Function                                              | Description                               |
| ----------------------------------------------------- | ----------------------------------------- |
| `createMockEventListService()`                        | Create mock eventListService with vi.fn() |
| `isMockFunction(fn)`                                  | Check if function is Vitest mock          |
| `mockSuccessResponse(mockFn, response)`               | Setup mock for success                    |
| `mockErrorResponse(mockFn, error)`                    | Setup mock for error                      |
| `mockDelayedResponse(mockFn, response, delayMs?)`     | Setup delayed response                    |
| `resetServiceMocks(serviceMock)`                      | Reset all mocks in service                |
| `createMockPaginatedResponse(items, page?, perPage?)` | Generic paginated response                |
| `createMockQueryParams(overrides?)`                   | Create query parameters                   |

### Component Helpers (`componentHelpers.ts`)

| Function                                        | Description                   |
| ----------------------------------------------- | ----------------------------- |
| `createMockRouter(routes?)`                     | Create Vue Router instance    |
| `mountWithQuasar(component, options?, router?)` | Mount component with Quasar   |
| `flushAll()`                                    | Wait for all async operations |
| `findByTestId(wrapper, testId)`                 | Find element by data-testid   |
| `existsByTestId(wrapper, testId)`               | Check element exists          |
| `getTextByTestId(wrapper, testId)`              | Get element text              |
| `clickByTestId(wrapper, testId)`                | Trigger click                 |
| `getQTableProps(wrapper)`                       | Get QTable props              |
| `getQTableColumns(wrapper)`                     | Get QTable columns            |
| `getQTableRows(wrapper)`                        | Get QTable rows               |
| `isQTableLoading(wrapper)`                      | Check QTable loading          |
| `clickQTableRow(wrapper, rowIndex)`             | Simulate row click            |
| `getQTablePagination(wrapper)`                  | Get pagination settings       |

## Design Principles

1. **Type Safety**: All utilities are fully typed with TypeScript strict mode
2. **Reusability**: DRY - create once, use everywhere
3. **Simplicity**: Clear, intuitive API
4. **Consistency**: Follow project conventions
5. **Documentation**: Every function documented

## Common Patterns

### Pattern 1: Component with Service Mock

```typescript
import { vi } from 'vitest';
import { mountWithQuasar, createMockEventListService, createMockEventList } from '@/test-utils';

// Setup mock
const mockService = createMockEventListService();
vi.mock('@/services/eventListService', () => ({
  eventListService: mockService,
}));

// Test
it('should load events', async () => {
  mockService.getEvents.mockResolvedValue({
    events: createMockEventList(3),
    totalCount: 3,
    currentPage: 1,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });

  const wrapper = mountWithQuasar(EventList, {}, true);
  await flushAll();

  expect(getQTableRows(wrapper)).toHaveLength(3);
});
```

### Pattern 2: Testing Navigation

```typescript
import { mountWithQuasar, createMockRouter, clickQTableRow } from '@/test-utils';

const mockRouter = createMockRouter();
const routerPushSpy = vi.spyOn(mockRouter, 'push');

const wrapper = mountWithQuasar(EventList, {}, mockRouter);
await clickQTableRow(wrapper, 0);

expect(routerPushSpy).toHaveBeenCalledWith('/events/1');
```

### Pattern 3: Testing Error States

```typescript
import { createMockEventListService, createNetworkError, mockErrorResponse } from '@/test-utils';

const mockService = createMockEventListService();
mockErrorResponse(mockService.getEvents, createNetworkError());

// Component should display error message
```

## Troubleshooting

### Issue: TypeScript errors with mock functions

**Solution**: Use the provided `createMockEventListService()` which returns properly typed mocks.

### Issue: Router push not being called

**Solution**: Pass router instance to `mountWithQuasar()` and spy on it before mounting:

```typescript
const router = createMockRouter();
const spy = vi.spyOn(router, 'push');
const wrapper = mountWithQuasar(Component, {}, router);
```

### Issue: QTable not rendering

**Solution**: Ensure you're using `mountWithQuasar()` which includes Quasar plugin.

## Contributing

When adding new utilities:

1. **Follow existing patterns** - Match coding style
2. **Add TypeScript types** - No `any` types
3. **Document functions** - JSDoc comments
4. **Export in index.ts** - Make available for import
5. **Update this README** - Add usage examples

## Related Documentation

- [Vitest Documentation](https://vitest.dev/)
- [@vue/test-utils](https://test-utils.vuejs.org/)
- [Quasar Testing](https://quasar.dev/start/test-and-demo)
- [Project CONTRIBUTING.md](../../CONTRIBUTING.md)

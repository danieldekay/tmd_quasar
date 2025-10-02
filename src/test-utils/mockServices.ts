/**
 * Test Utilities - Service Mocks
 *
 * Properly typed mock implementations of services for testing.
 * These provide vi.Mock versions with all mock methods available.
 *
 * Usage:
 *   const mockEventService = createMockEventListService();
 *   mockEventService.getEvents.mockResolvedValue({ events: [], totalCount: 0 });
 */

import { vi } from 'vitest';
import type { Mock } from 'vitest';
import type { EnhancedEventParams, PaginatedEventsResponse } from '../services/eventListService';
import type { BaseParams } from '../services/baseService';
import { createMockEventsResponse, createMockEventList } from './mockFactories';

/**
 * Create a properly typed mock eventListService
 */
export function createMockEventListService() {
  const getEvents = vi.fn();
  getEvents.mockResolvedValue(createMockEventsResponse(createMockEventList(3)));

  return {
    getEvents: getEvents as Mock<
      (params?: EnhancedEventParams) => Promise<PaginatedEventsResponse>
    >,
  };
}

/**
 * Type guard to check if a mock has been created by vitest
 */
export function isMockFunction(fn: unknown): fn is Mock {
  return typeof fn === 'function' && 'mockResolvedValue' in fn;
}

/**
 * Setup mock for successful API response
 */
export function mockSuccessResponse<T>(mockFn: Mock, response: T): void {
  mockFn.mockResolvedValue(response);
}

/**
 * Setup mock for API error
 */
export function mockErrorResponse(mockFn: Mock, error: Error): void {
  mockFn.mockRejectedValue(error);
}

/**
 * Setup mock for delayed response (for loading state testing)
 */
export function mockDelayedResponse<T>(mockFn: Mock, response: T, delayMs: number = 100): void {
  mockFn.mockImplementation(
    () =>
      new Promise((resolve) => {
        setTimeout(() => resolve(response), delayMs);
      }),
  );
}

/**
 * Reset all mocks in a service mock object
 */
export function resetServiceMocks(serviceMock: Record<string, unknown>): void {
  Object.values(serviceMock).forEach((fn) => {
    if (isMockFunction(fn)) {
      fn.mockReset();
    }
  });
}

/**
 * Create mock for generic paginated response
 */
export function createMockPaginatedResponse<T>(items: T[], page: number = 1, perPage: number = 20) {
  return {
    items,
    totalCount: items.length,
    currentPage: page,
    totalPages: Math.ceil(items.length / perPage),
    hasNextPage: page * perPage < items.length,
    hasPrevPage: page > 1,
  };
}

/**
 * Create mock query parameters
 */
export function createMockQueryParams(overrides: Partial<BaseParams> = {}): BaseParams {
  return {
    page: 1,
    perPage: 20,
    search: '',
    orderby: 'date',
    order: 'desc',
    ...overrides,
  };
}

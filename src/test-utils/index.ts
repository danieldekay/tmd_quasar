/**
 * Test Utilities - Main Export
 *
 * Central export point for all test utilities.
 * Import everything you need for testing from here.
 *
 * Usage:
 *   import {
 *     createMockEvent,
 *     createMockEventListService,
 *     mountWithQuasar,
 *     getQTableProps,
 *   } from '@/test-utils';
 */

// Mock factories
export {
  createMockEvent,
  createMockEventList,
  createMockEventsResponse,
  createMockDJ,
  createMockTeacher,
  createMockCouple,
  createMockEventSeries,
  createMockTaxonomies,
  generateDateRange,
  createMockError,
  createNetworkError,
  createHttpError,
} from './mockFactories';

// Service mocks
export {
  createMockEventListService,
  isMockFunction,
  mockSuccessResponse,
  mockErrorResponse,
  mockDelayedResponse,
  resetServiceMocks,
  createMockPaginatedResponse,
  createMockQueryParams,
} from './mockServices';

// Component helpers
export {
  createMockRouter,
  mountWithQuasar,
  flushAll,
  findByTestId,
  existsByTestId,
  getTextByTestId,
  clickByTestId,
  assertTableRowCount,
  assertTableHeaders,
  getQTableProps,
  getQTableColumns,
  getQTableRows,
  isQTableLoading,
  clickQTableRow,
  getQTablePagination,
} from './componentHelpers';

// Re-export commonly used testing utilities
export { flushPromises } from '@vue/test-utils';
export type { VueWrapper } from '@vue/test-utils';
export type { Mock } from 'vitest';

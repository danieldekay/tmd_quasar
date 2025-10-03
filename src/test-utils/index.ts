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

export type { VueWrapper } from '@vue/test-utils';
// Re-export commonly used testing utilities
export { flushPromises } from '@vue/test-utils';
export type { Mock } from 'vitest';
// Component helpers
export {
  assertTableHeaders,
  assertTableRowCount,
  clickByTestId,
  clickQTableRow,
  createMockRouter,
  existsByTestId,
  findByTestId,
  flushAll,
  getQTableColumns,
  getQTablePagination,
  getQTableProps,
  getQTableRows,
  getTextByTestId,
  isQTableLoading,
  mountWithQuasar,
} from './componentHelpers';
// Mock factories
export {
  createHttpError,
  createMockCouple,
  createMockDJ,
  createMockEmbeddedEvent,
  createMockError,
  createMockEvent,
  createMockEventList,
  createMockEventSeries,
  createMockEventsResponse,
  createMockTaxonomies,
  createMockTeacher,
  createNetworkError,
  generateDateRange,
} from './mockFactories';
// Service mocks
export {
  createMockEventListService,
  createMockPaginatedResponse,
  createMockQueryParams,
  isMockFunction,
  mockDelayedResponse,
  mockErrorResponse,
  mockSuccessResponse,
  resetServiceMocks,
} from './mockServices';

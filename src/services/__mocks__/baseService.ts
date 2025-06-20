// src/services/__mocks__/baseService.ts
import { vi } from 'vitest';
import { baseServiceMocks } from '../__tests__/serviceMocks'; // Adjust path as necessary

export class BaseService<T = Record<string, unknown>> {
  public endpoint: string;
  public defaultOptions: Record<string, unknown>;

  constructor(endpoint: string, defaultOptions: Record<string, unknown> = {}) {
    baseServiceMocks.constructor(endpoint, defaultOptions);
    this.endpoint = endpoint;
    this.defaultOptions = {
      _embed: true, // Mimic real BaseService behavior
      ...defaultOptions,
    };
  }

  normalizePaginationParams = baseServiceMocks.normalizePaginationParams;
  extractPaginationInfo = baseServiceMocks.extractPaginationInfo;
  makeRequest = baseServiceMocks.makeRequest;
  getAll = baseServiceMocks.getAll;
  getAllLegacy = baseServiceMocks.getAllLegacy;
  getById = baseServiceMocks.getById;
  search = baseServiceMocks.search;
  searchLegacy = baseServiceMocks.searchLegacy;
  loadMore = baseServiceMocks.loadMore;
  getErrorMessage = baseServiceMocks.getErrorMessage;
  isOfflineError = baseServiceMocks.isOfflineError;
}

// If BaseService has other named exports that are used, mock them here too.
// export const someOtherExport = vi.fn();

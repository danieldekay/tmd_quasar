/* eslint-disable @typescript-eslint/no-unused-vars */
// src/services/__mocks__/baseService.ts
import type { Mock } from 'vitest';
import { baseServiceMocks } from '../__tests__/serviceMocks'; // Adjust path as necessary

export class BaseService<T = Record<string, unknown>> {
  public endpoint: string;
  public defaultOptions: Record<string, unknown>;
  private mockImplementation: Record<string, Mock>;

  constructor(endpoint: string, defaultOptions = {}) {
    this.endpoint = endpoint;
    this.defaultOptions = defaultOptions;
    this.mockImplementation = baseServiceMocks;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getAll(...args: any[]): Promise<any> {
    return this.mockImplementation.getAll?.(...args);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getById(...args: any[]): Promise<any> {
    return this.mockImplementation.getById?.(...args);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  makeRequest(...args: any[]): Promise<any> {
    return this.mockImplementation.makeRequest?.(...args);
  }

  normalizePaginationParams = baseServiceMocks.normalizePaginationParams;
  extractPaginationInfo = baseServiceMocks.extractPaginationInfo;
  search = baseServiceMocks.search;
  searchLegacy = baseServiceMocks.searchLegacy;
  loadMore = baseServiceMocks.loadMore;
  getErrorMessage = baseServiceMocks.getErrorMessage;
  isOfflineError = baseServiceMocks.isOfflineError;
}

// If BaseService has other named exports that are used, mock them here too.
// export const someOtherExport = vi.fn();

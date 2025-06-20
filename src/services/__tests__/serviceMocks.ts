import { vi } from 'vitest';

// This object will hold all mock functions related to BaseService methods
export const baseServiceMocks = {
  constructor: vi.fn(),
  normalizePaginationParams: vi.fn(),
  extractPaginationInfo: vi.fn(),
  makeRequest: vi.fn(),
  getAll: vi.fn(),
  getAllLegacy: vi.fn(),
  getById: vi.fn(),
  search: vi.fn(),
  searchLegacy: vi.fn(),
  loadMore: vi.fn(),
  getErrorMessage: vi.fn(),
  isOfflineError: vi.fn(),
};

// Helper to reset all mocks in this object
export const resetBaseServiceMocks = () => {
  for (const key in baseServiceMocks) {
    const mockFn = baseServiceMocks[key as keyof typeof baseServiceMocks];
    mockFn.mockClear();
    mockFn.mockReset();
  }
};

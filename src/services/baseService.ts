import { api } from '../boot/axios';
import type { AxiosRequestConfig } from 'axios';
import { useApiStatus } from '../composables/useApiStatus';

// Get API status instance for error handling
const apiStatus = useApiStatus();

export interface PaginatedResponse<T> {
  data: T[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface BaseServiceOptions {
  _embed?: boolean;
  meta_fields?: string;
  include_taxonomies?: boolean;
  include_relationships?: boolean;
  [key: string]: unknown;
}

export interface PaginationParams {
  page?: number;
  per_page?: number;
  perPage?: number; // Legacy support
}

export interface SearchParams {
  search?: string;
}

export type BaseParams = BaseServiceOptions & PaginationParams & SearchParams;

/**
 * WordPress REST API response structure (V4)
 */
export interface WordPressResponse<T> {
  // V4 returns direct arrays for collections
  // Individual items are returned as objects
  data?: T[];
  // Pagination info is in headers
}

/**
 * HAL-compliant API response structure (V3 - for backward compatibility)
 */
export interface HALResponse<T> {
  _embedded?: {
    [key: string]: T[];
  };
  _links?: {
    self?: Array<{ href: string }>;
    next?: Array<{ href: string }>;
    prev?: Array<{ href: string }>;
    last?: Array<{ href: string }>;
    first?: Array<{ href: string }>;
  };
  page?: number;
  per_page?: number;
  count?: number;
  total?: number;
}

/**
 * Base service class that provides common functionality for all WordPress REST API services
 * Updated to handle HAL-compliant TMD v3 API responses
 */
export class BaseService<T = Record<string, unknown>> {
  protected endpoint: string;
  protected defaultOptions: BaseServiceOptions;
  protected endpointName: string;

  constructor(endpoint: string, defaultOptions: BaseServiceOptions = {}) {
    this.endpoint = endpoint;
    this.endpointName = endpoint.replace(/^\//, ''); // Remove leading slash for _embedded key
    this.defaultOptions = {
      _embed: true,
      ...defaultOptions,
    };
  }

  /**
   * Normalize pagination parameters
   */
  protected normalizePaginationParams(params: PaginationParams): Record<string, unknown> {
    const normalized: Record<string, unknown> = {};

    // Handle both per_page and perPage for backward compatibility
    if (params.per_page) normalized.per_page = params.per_page;
    else if (params.perPage) normalized.per_page = params.perPage;

    if (params.page) normalized.page = params.page;

    return normalized;
  }

  /**
   * Extract pagination info from WordPress REST API headers (v4 API)
   * Falls back to HAL response body for v3 compatibility
   */
  protected extractPaginationInfo(
    response: WordPressResponse<T> | HALResponse<T> | T[],
    headers: Record<string, string>,
    currentPage = 1,
  ) {
    // First try to extract from WordPress REST API headers (v4 API)
    const totalCount = parseInt(headers['x-wp-total'] || '0', 10);
    const totalPages = parseInt(headers['x-wp-totalpages'] || '1', 10);

    if (totalCount > 0) {
      return {
        totalCount,
        totalPages,
        currentPage,
        hasNextPage: currentPage < totalPages,
        hasPrevPage: currentPage > 1,
      };
    }

    // Fallback to HAL response body for v3 compatibility
    if (response && typeof response === 'object' && !Array.isArray(response)) {
      const halResponse = response as HALResponse<T>;

      if (halResponse.total !== undefined && halResponse.page !== undefined) {
        const totalCount = halResponse.total;
        const totalPages = Math.ceil(totalCount / (halResponse.per_page || 10));
        const page = halResponse.page;

        return {
          totalCount,
          totalPages,
          currentPage: page,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        };
      }
    }

    // Default fallback
    return {
      totalCount: 0,
      totalPages: 1,
      currentPage,
      hasNextPage: false,
      hasPrevPage: false,
    };
  }

  /**
   * Extract data from WordPress REST API response or HAL response
   */
  protected extractDataFromResponse(response: WordPressResponse<T> | HALResponse<T> | T[]): T[] {
    // Handle direct array response (WordPress REST API v4 format)
    if (Array.isArray(response)) {
      return response;
    }

    // Handle HAL response format (v3 compatibility)
    if (response && typeof response === 'object' && !Array.isArray(response)) {
      const halResponse = response as HALResponse<T>;

      if (halResponse._embedded) {
        // Try to find data in _embedded using the endpoint name
        const embeddedData = halResponse._embedded[this.endpointName];
        if (Array.isArray(embeddedData)) {
          return embeddedData;
        }
        // PATCH: If it's an object with numeric keys, convert to array
        if (embeddedData && typeof embeddedData === 'object' && !Array.isArray(embeddedData)) {
          return Object.values(embeddedData);
        }

        // Try other common keys if endpoint name doesn't match
        const commonKeys = [
          'events',
          'djs',
          'teachers',
          'couples',
          'event-series',
          'orchestras',
          'brands',
        ];
        for (const key of commonKeys) {
          if (halResponse._embedded[key] && Array.isArray(halResponse._embedded[key])) {
            return halResponse._embedded[key];
          }
          // PATCH: If it's an object with numeric keys, convert to array
          if (
            halResponse._embedded[key] &&
            typeof halResponse._embedded[key] === 'object' &&
            !Array.isArray(halResponse._embedded[key])
          ) {
            return Object.values(halResponse._embedded[key]);
          }
        }
      }

      // If no _embedded data found, return empty array
      return [];
    }

    // Default fallback
    return [];
  }

  /**
   * Make a GET request with enhanced error handling and offline detection
   */
  protected async makeRequest<R = WordPressResponse<T> | HALResponse<T> | T[]>(
    path: string,
    params: BaseParams = {},
    signal?: AbortSignal,
  ): Promise<{ data: R; headers: Record<string, string> }> {
    return apiStatus.withApiErrorHandling(
      async () => {
        const requestConfig: AxiosRequestConfig = {
          params: {
            ...this.defaultOptions,
            ...this.normalizePaginationParams(params),
            ...params,
          },
        };

        if (signal) {
          requestConfig.signal = signal;
        }

        const response = await api.get(path, requestConfig);

        return {
          data: response.data as R,
          headers: response.headers as Record<string, string>,
        };
      },
      { retries: 1 }, // Allow one retry for transient failures
    );
  }

  /**
   * Get all items from the endpoint
   */
  async getAll(params: BaseParams = {}, signal?: AbortSignal): Promise<PaginatedResponse<T>> {
    try {
      const { data, headers } = await this.makeRequest<WordPressResponse<T> | HALResponse<T> | T[]>(
        this.endpoint,
        params,
        signal,
      );
      const currentPage = params.page || 1;

      // Extract actual data array from HAL response
      const items = this.extractDataFromResponse(data);

      // Extract pagination info from response body or headers
      const pagination = this.extractPaginationInfo(data, headers, currentPage);

      return {
        data: items,
        ...pagination,
      };
    } catch (error) {
      // Enhanced error logging with context
      console.error(`Failed to load data from ${this.endpoint}:`, {
        error: apiStatus.getErrorMessage(error),
        isOffline: apiStatus.isOfflineError(error),
        params: params,
      });
      throw error;
    }
  }

  /**
   * Get all items (legacy method that returns just the data array)
   */
  async getAllLegacy(params: BaseParams = {}, signal?: AbortSignal): Promise<T[]> {
    const response = await this.getAll(params, signal);
    return response.data;
  }

  /**
   * Get a single item by ID
   */
  async getById(id: number, params: BaseParams = {}, signal?: AbortSignal): Promise<T> {
    try {
      const { data } = await this.makeRequest<T>(`${this.endpoint}/${id}`, params, signal);
      return data;
    } catch (error) {
      console.error(`Failed to load item ${id} from ${this.endpoint}:`, {
        error: apiStatus.getErrorMessage(error),
        isOffline: apiStatus.isOfflineError(error),
        id: id,
      });
      throw error;
    }
  }

  /**
   * Search items
   */
  async search(
    query: string,
    params: BaseParams = {},
    signal?: AbortSignal,
  ): Promise<PaginatedResponse<T>> {
    const searchParams = {
      search: query,
      ...params,
    };

    return this.getAll(searchParams, signal);
  }

  /**
   * Search items (legacy method that returns just the data array)
   */
  async searchLegacy(query: string, params: BaseParams = {}, signal?: AbortSignal): Promise<T[]> {
    const response = await this.search(query, params, signal);
    return response.data;
  }

  /**
   * Load more items for infinite scrolling
   */
  async loadMore(page: number, params: BaseParams = {}, signal?: AbortSignal): Promise<T[]> {
    const loadMoreParams = {
      page,
      ...params,
    };

    const response = await this.getAll(loadMoreParams, signal);
    return response.data;
  }

  /**
   * Get user-friendly error message for API failures
   */
  getErrorMessage(error: unknown): string {
    return apiStatus.getErrorMessage(error);
  }

  /**
   * Check if error indicates offline status
   */
  isOfflineError(error: unknown): boolean {
    return apiStatus.isOfflineError(error);
  }
}

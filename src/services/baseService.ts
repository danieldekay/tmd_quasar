import { api } from '../boot/axios';
import type { AxiosRequestConfig } from 'axios';

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
 * Base service class that provides common functionality for all WordPress REST API services
 */
export class BaseService<T = Record<string, unknown>> {
  protected endpoint: string;
  protected defaultOptions: BaseServiceOptions;

  constructor(endpoint: string, defaultOptions: BaseServiceOptions = {}) {
    this.endpoint = endpoint;
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
   * Extract pagination info from WordPress REST API headers
   */
  protected extractPaginationInfo(headers: Record<string, string>, currentPage = 1) {
    const totalCount = parseInt(headers['x-wp-total'] || '0', 10);
    const totalPages = parseInt(headers['x-wp-totalpages'] || '1', 10);

    return {
      totalCount,
      totalPages,
      currentPage,
      hasNextPage: currentPage < totalPages,
      hasPrevPage: currentPage > 1,
    };
  }

  /**
   * Make a GET request with common error handling and parameter normalization
   */
  protected async makeRequest<R = T>(
    path: string,
    params: BaseParams = {},
    signal?: AbortSignal,
  ): Promise<{ data: R; headers: Record<string, string> }> {
    try {
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
    } catch (error) {
      console.error(`API Error for ${path}:`, error);
      throw error;
    }
  }

  /**
   * Get all items from the endpoint
   */
  async getAll(params: BaseParams = {}, signal?: AbortSignal): Promise<PaginatedResponse<T>> {
    const { data, headers } = await this.makeRequest<T[]>(this.endpoint, params, signal);
    const currentPage = params.page || 1;
    const pagination = this.extractPaginationInfo(headers, currentPage);

    return {
      data,
      ...pagination,
    };
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
    const { data } = await this.makeRequest<T>(`${this.endpoint}/${id}`, params, signal);
    return data;
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
}

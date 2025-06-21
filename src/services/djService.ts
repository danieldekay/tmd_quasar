import { BaseService } from './baseService';
import type { DJ } from './types';
import type { BaseParams } from './baseService';
import {
  DJ_ACTIVITY_TYPES,
  ESSENTIAL_DJ_META_FIELDS,
  ALL_DJ_META_FIELDS,
  type DJActivityType,
  type DJSortOption,
} from './eventConstants';

export interface DJParams extends BaseParams {
  country?: string;
  city?: string;
  activity_type?: DJActivityType;
  has_events?: boolean;
  orderby?: DJSortOption;
  order?: 'asc' | 'desc';
  meta_filters?: string;
  include_events?: boolean;
  essential_only?: boolean;
}

class DJService extends BaseService<DJ> {
  private readonly defaultMetaFields: string;

  constructor() {
    super('/djs', {
      _embed: false, // Disable embeds for better performance by default
      meta_fields: ESSENTIAL_DJ_META_FIELDS, // Use essential fields only by default
    });
    this.defaultMetaFields = ESSENTIAL_DJ_META_FIELDS;
  }

  /**
   * Get DJs with enhanced V3 API filtering and pagination
   * Supports advanced meta filtering, embedded relationships, and performance optimization
   */
  async getDJs(params: DJParams = {}, signal?: AbortSignal) {
    try {
      // Build V3 API parameters with advanced filtering
      const apiParams = this.buildDJApiParams(params);

      // Get response using BaseService
      const response = await this.getAll(apiParams, signal);

      // Transform and enhance the data
      const djs = this.transformDJs(response.data);

      return {
        djs,
        totalPages: response.totalPages,
        total: response.totalCount,
      };
    } catch (error) {
      throw new Error(
        `Failed to fetch DJs: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Get a single DJ with full metadata and embedded relationships
   */
  async getDJ(id: number, params: DJParams = {}, signal?: AbortSignal): Promise<DJ> {
    try {
      const apiParams = {
        _embed: params.include_events ? true : false,
        meta_fields: params.essential_only ? ESSENTIAL_DJ_META_FIELDS : ALL_DJ_META_FIELDS,
        ...params,
      };

      const dj = await this.getById(id, apiParams, signal);
      return this.transformDJ(dj);
    } catch (error) {
      throw new Error(
        `Failed to fetch DJ ${id}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Search DJs by name or other fields with V3 API optimization
   */
  async searchDJs(query: string, params: DJParams = {}, signal?: AbortSignal) {
    try {
      const searchParams = {
        search: query,
        meta_fields: ALL_DJ_META_FIELDS, // Include all fields for search results
        _embed: params.include_events ? true : false,
        ...params,
      };

      const response = await this.search(query, searchParams, signal);
      const djs = this.transformDJs(response.data);

      return {
        djs,
        totalPages: response.totalPages,
        total: response.totalCount,
      };
    } catch (error) {
      throw new Error(
        `Failed to search DJs: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Get DJs by country with optimized meta filtering
   */
  async getDJsByCountry(country: string, params: DJParams = {}, signal?: AbortSignal) {
    const metaFilters = { tmd_dj_country: country };
    return this.getDJs({ ...params, meta_filters: JSON.stringify(metaFilters) }, signal);
  }

  /**
   * Get DJs by city with optimized meta filtering
   */
  async getDJsByCity(city: string, params: DJParams = {}, signal?: AbortSignal) {
    const metaFilters = { tmd_dj_city: city };
    return this.getDJs({ ...params, meta_filters: JSON.stringify(metaFilters) }, signal);
  }

  /**
   * Get DJs by activity type (encuentros, festivals, marathons, milongas, milongas_travel)
   */
  async getDJsByActivityType(
    activityType: DJActivityType,
    params: DJParams = {},
    signal?: AbortSignal,
  ) {
    const metaFilters = { [`tmd_dj_activity_${activityType}`]: '1' };
    return this.getDJs({ ...params, meta_filters: JSON.stringify(metaFilters) }, signal);
  }

  /**
   * Get DJs who have events
   */
  async getDJsWithEvents(params: DJParams = {}, signal?: AbortSignal) {
    return this.getDJs({ ...params, include_events: true }, signal);
  }

  /**
   * Get DJs by activity since year
   */
  async getDJsByActivitySince(
    activityType: DJActivityType,
    year: string,
    params: DJParams = {},
    signal?: AbortSignal,
  ) {
    const metaFilters = { [`tmd_dj_activity_${activityType}_since`]: year };
    return this.getDJs({ ...params, meta_filters: JSON.stringify(metaFilters) }, signal);
  }

  /**
   * Build optimized API parameters for DJ requests
   */
  private buildDJApiParams(params: DJParams): Record<string, unknown> {
    const apiParams: Record<string, unknown> = { ...params };

    // Handle country filtering using meta_filters (v3 API format)
    if (params.country) {
      const existingFilters = params.meta_filters ? JSON.parse(params.meta_filters) : {};
      apiParams.meta_filters = JSON.stringify({
        ...existingFilters,
        tmd_dj_country: params.country,
      });
      delete apiParams.country; // Remove country from params to avoid conflicts
    }

    // Handle city filtering
    if (params.city) {
      const existingFilters = params.meta_filters ? JSON.parse(params.meta_filters) : {};
      apiParams.meta_filters = JSON.stringify({
        ...existingFilters,
        tmd_dj_city: params.city,
      });
      delete apiParams.city; // Remove city from params to avoid conflicts
    }

    // Handle activity type filtering
    if (params.activity_type) {
      const existingFilters = params.meta_filters ? JSON.parse(params.meta_filters) : {};
      apiParams.meta_filters = JSON.stringify({
        ...existingFilters,
        [`tmd_dj_activity_${params.activity_type}`]: '1',
      });
    }

    // Optimize meta fields based on requirements
    if (params.essential_only) {
      apiParams.meta_fields = ESSENTIAL_DJ_META_FIELDS;
    } else if (!apiParams.meta_fields) {
      apiParams.meta_fields = ALL_DJ_META_FIELDS;
    }

    // Handle embedded relationships
    if (params.include_events) {
      apiParams._embed = true;
    }

    return apiParams;
  }

  /**
   * Transform DJ data from V3 API format to application format
   */
  private transformDJs(djs: DJ[]): DJ[] {
    return djs.map((dj) => this.transformDJ(dj));
  }

  /**
   * Transform a single DJ from V3 API format to application format
   */
  private transformDJ(dj: DJ): DJ {
    // Ensure all V3 API fields are properly mapped
    const transformed: DJ = {
      ...dj,
      // Map V3 API meta fields to expected structure
      acf: {
        bio: dj.tmd_dj_about_the_dj || dj.abstract || '',
        photo: '', // Not available in V3 API
        website: dj.tmd_dj_webpage || '',
      },
      // Ensure embedded relationships are properly structured
      _embedded: dj._embedded
        ? {
            events: dj._embedded.events || [],
            author: dj._embedded.author || [],
          }
        : {
            events: [],
            author: [],
          },
    };

    return transformed;
  }

  /**
   * Analyze DJ data for insights and statistics
   */
  analyzeDJData(djs: DJ[]): {
    totalCount: number;
    byCountry: Record<string, number>;
    byCity: Record<string, number>;
    byActivityType: Record<DJActivityType, number>;
    withWebsite: number;
    withEmail: number;
    withFacebook: number;
    withEvents: number;
  } {
    const analysis = {
      totalCount: djs.length,
      byCountry: {} as Record<string, number>,
      byCity: {} as Record<string, number>,
      byActivityType: {
        [DJ_ACTIVITY_TYPES.ENCUENTROS]: 0,
        [DJ_ACTIVITY_TYPES.FESTIVALS]: 0,
        [DJ_ACTIVITY_TYPES.MARATHONS]: 0,
        [DJ_ACTIVITY_TYPES.MILONGAS]: 0,
        [DJ_ACTIVITY_TYPES.MILONGAS_TRAVEL]: 0,
      },
      withWebsite: 0,
      withEmail: 0,
      withFacebook: 0,
      withEvents: 0,
    };

    djs.forEach((dj) => {
      // Count by country
      if (dj.tmd_dj_country) {
        analysis.byCountry[dj.tmd_dj_country] = (analysis.byCountry[dj.tmd_dj_country] || 0) + 1;
      }

      // Count by city
      if (dj.tmd_dj_city) {
        analysis.byCity[dj.tmd_dj_city] = (analysis.byCity[dj.tmd_dj_city] || 0) + 1;
      }

      // Count by activity type
      Object.values(DJ_ACTIVITY_TYPES).forEach((activityType) => {
        const activityField = `tmd_dj_activity_${activityType}` as keyof DJ;
        if (dj[activityField] === '1') {
          analysis.byActivityType[activityType]++;
        }
      });

      // Count contact information
      if (dj.tmd_dj_webpage) analysis.withWebsite++;
      if (dj.tmd_dj_e_mail) analysis.withEmail++;
      if (dj.tmd_dj_link_to_facebook || dj.tmd_dj_link_to_facebook_page) analysis.withFacebook++;
      if (dj._embedded?.events?.length) analysis.withEvents++;
    });

    return analysis;
  }

  /**
   * Get DJ statistics and insights
   */
  async getDJStats(signal?: AbortSignal): Promise<ReturnType<typeof this.analyzeDJData>> {
    const result = await this.getDJs({ per_page: 1000 }, signal);
    return this.analyzeDJData(result.djs);
  }
}

// Export singleton instance to maintain compatibility with existing code
export const djService = new DJService();

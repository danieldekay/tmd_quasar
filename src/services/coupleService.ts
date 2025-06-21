import { BaseService } from './baseService';
import type { Couple } from './types';
import type { BaseParams } from './baseService';
import {
  ESSENTIAL_COUPLE_META_FIELDS,
  ALL_COUPLE_META_FIELDS,
  type CoupleSortOption,
} from './eventConstants';

export interface CoupleParams extends BaseParams {
  leader_id?: number;
  follower_id?: number;
  country?: string;
  city?: string;
  partnership_style?: string;
  specializations?: string[];
  orderby?: CoupleSortOption;
  order?: 'asc' | 'desc';
  meta_filters?: string;
  include_events?: boolean;
  include_teachers?: boolean;
  essential_only?: boolean;
}

class CoupleService extends BaseService<Couple> {
  private readonly defaultMetaFields: string;

  constructor() {
    super('/couples', {
      _embed: false, // Disable embeds for better performance by default
      meta_fields: ESSENTIAL_COUPLE_META_FIELDS, // Use essential fields only by default
    });
    this.defaultMetaFields = ESSENTIAL_COUPLE_META_FIELDS;
  }

  /**
   * Get couples with enhanced V3 API filtering and pagination
   * Supports advanced meta filtering, embedded relationships, and performance optimization
   */
  async getCouples(params: CoupleParams = {}, signal?: AbortSignal): Promise<Couple[]> {
    try {
      // Build V3 API parameters with advanced filtering
      const apiParams = this.buildCoupleApiParams(params);

      // Get response using BaseService
      const response = await this.getAll(apiParams, signal);

      // Transform and enhance the data
      const couples = this.transformCouples(response.data);

      return couples;
    } catch (error) {
      console.error('CoupleService.getCouples - Error:', error);
      throw new Error(
        `Failed to fetch couples: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Get a single couple with full metadata and embedded relationships
   */
  async getCouple(id: number, params: CoupleParams = {}, signal?: AbortSignal): Promise<Couple> {
    try {
      const apiParams = {
        _embed: params.include_events || params.include_teachers ? true : false,
        meta_fields: params.essential_only ? ESSENTIAL_COUPLE_META_FIELDS : ALL_COUPLE_META_FIELDS,
        ...params,
      };

      const couple = await this.getById(id, apiParams, signal);
      return this.transformCouple(couple);
    } catch (error) {
      throw new Error(
        `Failed to fetch couple ${id}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Get couples filtered by teacher ID
   */
  async getCouplesByTeacher(
    teacherId: number,
    params: CoupleParams = {},
    signal?: AbortSignal,
  ): Promise<Couple[]> {
    // Check if teacher is leader or follower
    const leaderCouples = await this.getCouples({ ...params, leader_id: teacherId }, signal);
    const followerCouples = await this.getCouples({ ...params, follower_id: teacherId }, signal);

    // Combine and deduplicate
    const allCouples = [...leaderCouples, ...followerCouples];
    const uniqueCouples = allCouples.filter(
      (couple, index, self) => index === self.findIndex((c) => c.id === couple.id),
    );

    return uniqueCouples;
  }

  /**
   * Get couples by country with optimized meta filtering
   */
  async getCouplesByCountry(
    country: string,
    params: CoupleParams = {},
    signal?: AbortSignal,
  ): Promise<Couple[]> {
    const metaFilters = { country };
    return this.getCouples({ ...params, meta_filters: JSON.stringify(metaFilters) }, signal);
  }

  /**
   * Get couples by city with optimized meta filtering
   */
  async getCouplesByCity(
    city: string,
    params: CoupleParams = {},
    signal?: AbortSignal,
  ): Promise<Couple[]> {
    const metaFilters = { city };
    return this.getCouples({ ...params, meta_filters: JSON.stringify(metaFilters) }, signal);
  }

  /**
   * Get couples by partnership style
   */
  async getCouplesByPartnershipStyle(
    style: string,
    params: CoupleParams = {},
    signal?: AbortSignal,
  ): Promise<Couple[]> {
    const metaFilters = { partnership_style: style };
    return this.getCouples({ ...params, meta_filters: JSON.stringify(metaFilters) }, signal);
  }

  /**
   * Get couples with specific specializations
   */
  async getCouplesBySpecializations(
    specializations: string[],
    params: CoupleParams = {},
    signal?: AbortSignal,
  ): Promise<Couple[]> {
    // Note: This would require custom meta filtering if the API supports it
    // For now, we'll filter client-side
    const couples = await this.getCouples(params, signal);
    return couples.filter((couple) => {
      const coupleSpecs = couple.meta_box?.specializations_couple || [];
      return specializations.some((spec) => coupleSpecs.includes(spec));
    });
  }

  /**
   * Get couples who have events
   */
  async getCouplesWithEvents(params: CoupleParams = {}, signal?: AbortSignal): Promise<Couple[]> {
    return this.getCouples({ ...params, include_events: true }, signal);
  }

  /**
   * Get couples with teacher information
   */
  async getCouplesWithTeachers(params: CoupleParams = {}, signal?: AbortSignal): Promise<Couple[]> {
    return this.getCouples({ ...params, include_teachers: true }, signal);
  }

  /**
   * Build optimized API parameters for couple requests
   */
  private buildCoupleApiParams(params: CoupleParams): Record<string, unknown> {
    const apiParams: Record<string, unknown> = { ...params };

    // Handle leader filtering
    if (params.leader_id) {
      const existingFilters = params.meta_filters ? JSON.parse(params.meta_filters) : {};
      apiParams.meta_filters = JSON.stringify({
        ...existingFilters,
        __relate_leader: params.leader_id.toString(),
      });
      delete apiParams.leader_id; // Remove from params to avoid conflicts
    }

    // Handle follower filtering
    if (params.follower_id) {
      const existingFilters = params.meta_filters ? JSON.parse(params.meta_filters) : {};
      apiParams.meta_filters = JSON.stringify({
        ...existingFilters,
        __relate_follower: params.follower_id.toString(),
      });
      delete apiParams.follower_id; // Remove from params to avoid conflicts
    }

    // Handle country filtering
    if (params.country) {
      const existingFilters = params.meta_filters ? JSON.parse(params.meta_filters) : {};
      apiParams.meta_filters = JSON.stringify({
        ...existingFilters,
        country: params.country,
      });
      delete apiParams.country; // Remove from params to avoid conflicts
    }

    // Handle city filtering
    if (params.city) {
      const existingFilters = params.meta_filters ? JSON.parse(params.meta_filters) : {};
      apiParams.meta_filters = JSON.stringify({
        ...existingFilters,
        city: params.city,
      });
      delete apiParams.city; // Remove from params to avoid conflicts
    }

    // Handle partnership style filtering
    if (params.partnership_style) {
      const existingFilters = params.meta_filters ? JSON.parse(params.meta_filters) : {};
      apiParams.meta_filters = JSON.stringify({
        ...existingFilters,
        partnership_style: params.partnership_style,
      });
      delete apiParams.partnership_style; // Remove from params to avoid conflicts
    }

    // Handle specializations filtering (if supported by API)
    if (params.specializations?.length) {
      const existingFilters = params.meta_filters ? JSON.parse(params.meta_filters) : {};
      apiParams.meta_filters = JSON.stringify({
        ...existingFilters,
        specializations_couple: params.specializations,
      });
      delete apiParams.specializations; // Remove from params to avoid conflicts
    }

    // Optimize meta fields based on requirements
    if (params.essential_only) {
      apiParams.meta_fields = ESSENTIAL_COUPLE_META_FIELDS;
    } else if (!apiParams.meta_fields) {
      apiParams.meta_fields = ALL_COUPLE_META_FIELDS;
    }

    // Handle embedded relationships
    if (params.include_events || params.include_teachers) {
      apiParams._embed = true;
    }

    return apiParams;
  }

  /**
   * Transform couple data from V3 API format to application format
   */
  private transformCouples(couples: Couple[]): Couple[] {
    return couples.map((couple) => this.transformCouple(couple));
  }

  /**
   * Transform a single couple from V3 API format to application format
   */
  private transformCouple(couple: Couple): Couple {
    // Ensure all V3 API fields are properly mapped
    const transformed: Couple = {
      ...couple,
      // Map V3 API meta fields to expected structure
      meta_box: couple.meta_box
        ? {
            ...couple.meta_box,
            ...(couple.city && { city: couple.city }),
            ...(couple.country && { country: couple.country }),
          }
        : {
            ...(couple.city && { city: couple.city }),
            ...(couple.country && { country: couple.country }),
          },
    };

    // Handle embedded relationships separately to avoid undefined issues
    if (couple._embedded) {
      transformed._embedded = {
        events: couple._embedded.events || [],
        teachers: couple._embedded.teachers || [],
        leader: couple._embedded.leader || [],
        follower: couple._embedded.follower || [],
        author: couple._embedded.author || [],
      };
    }

    return transformed;
  }

  /**
   * Analyze couple data for insights and statistics
   */
  analyzeCoupleData(couples: Couple[]): {
    totalCount: number;
    byCountry: Record<string, number>;
    byCity: Record<string, number>;
    byPartnershipStyle: Record<string, number>;
    withWebsite: number;
    withFacebook: number;
    withEvents: number;
    withTeachers: number;
  } {
    const analysis = {
      totalCount: couples.length,
      byCountry: {} as Record<string, number>,
      byCity: {} as Record<string, number>,
      byPartnershipStyle: {} as Record<string, number>,
      withWebsite: 0,
      withFacebook: 0,
      withEvents: 0,
      withTeachers: 0,
    };

    couples.forEach((couple) => {
      // Count by country
      if (couple.country) {
        analysis.byCountry[couple.country] = (analysis.byCountry[couple.country] || 0) + 1;
      }

      // Count by city
      if (couple.city) {
        analysis.byCity[couple.city] = (analysis.byCity[couple.city] || 0) + 1;
      }

      // Count by partnership style
      if (couple.meta_box?.partnership_style) {
        analysis.byPartnershipStyle[couple.meta_box.partnership_style] =
          (analysis.byPartnershipStyle[couple.meta_box.partnership_style] || 0) + 1;
      }

      // Count contact information
      if (couple.meta_box?.website) analysis.withWebsite++;
      if (couple.meta_box?.facebook_page) analysis.withFacebook++;
      if (couple._embedded?.events?.length) analysis.withEvents++;
      if (
        couple._embedded?.teachers?.length ||
        couple._embedded?.leader?.length ||
        couple._embedded?.follower?.length
      ) {
        analysis.withTeachers++;
      }
    });

    return analysis;
  }

  /**
   * Get couple statistics and insights
   */
  async getCoupleStats(signal?: AbortSignal): Promise<ReturnType<typeof this.analyzeCoupleData>> {
    const couples = await this.getCouples({ per_page: 1000 }, signal);
    return this.analyzeCoupleData(couples);
  }
}

// Export singleton instance to maintain compatibility with existing code
export const coupleService = new CoupleService();

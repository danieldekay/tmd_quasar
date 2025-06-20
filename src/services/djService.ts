import { BaseService } from './baseService';
import type { DJ } from './types';
import type { BaseParams } from './baseService';

// Essential meta fields for table view (reduced from 20 to 8 for better performance)
const ESSENTIAL_DJ_META_FIELDS = [
  'tmd_dj_name',
  'tmd_dj_country',
  'tmd_dj_activity_marathons',
  'tmd_dj_activity_festivals',
  'tmd_dj_activity_encuentros',
  'tmd_dj_activity_milongas',
  'tmd_dj_activity_milongas_travel',
  'tmd_dj_webpage',
].join(',');

// All meta fields for detail view
const ALL_DJ_META_FIELDS = [
  'abstract',
  'gender',
  'tmd_dj_about_the_dj',
  'tmd_dj_activity_encuentros',
  'tmd_dj_activity_encuentros_since',
  'tmd_dj_activity_festivals',
  'tmd_dj_activity_festivals_since',
  'tmd_dj_activity_marathons',
  'tmd_dj_activity_marathons_since',
  'tmd_dj_activity_milongas',
  'tmd_dj_activity_milongas_since',
  'tmd_dj_activity_milongas_travel',
  'tmd_dj_activity_milongas_travel_since',
  'tmd_dj_city',
  'tmd_dj_country',
  'tmd_dj_e_mail',
  'tmd_dj_link_to_facebook',
  'tmd_dj_link_to_facebook_page',
  'tmd_dj_name',
  'tmd_dj_webpage',
].join(',');

export interface DJParams extends BaseParams {
  country?: string;
  event?: number;
  orderby?: string;
  order?: 'asc' | 'desc';
}

class DJService extends BaseService<DJ> {
  constructor() {
    super('/djs', {
      _embed: false, // Disable embeds for better performance by default
      meta_fields: ESSENTIAL_DJ_META_FIELDS, // Use essential fields only by default
    });
  }

  /**
   * Get DJs with enhanced filtering and pagination
   */
  async getDJs(params: DJParams = {}, signal?: AbortSignal) {
    const apiParams = { ...params };

    // Handle country filtering using meta_key/meta_value
    if (params.country) {
      apiParams.meta_key = 'tmd_dj_country';
      apiParams.meta_value = params.country;
      delete apiParams.country; // Remove country from params to avoid conflicts
    }

    const response = await this.getAll(apiParams, signal);

    // V3 API returns data in _embedded.djs format
    let djs: DJ[] = [];
    if (response.data && typeof response.data === 'object' && '_embedded' in response.data) {
      const embeddedData = response.data._embedded as { djs?: DJ[] };
      djs = embeddedData.djs || [];
    } else if (Array.isArray(response.data)) {
      // Fallback to direct array if structure is different
      djs = response.data;
    }

    // Return in the expected legacy format
    return {
      djs,
      totalPages: response.totalPages,
      total: response.totalCount,
    };
  }

  /**
   * Get a single DJ with full metadata
   */
  async getDJ(id: number, signal?: AbortSignal): Promise<DJ> {
    return this.getById(
      id,
      {
        _embed: true, // Full embeds for detail view
        meta_fields: ALL_DJ_META_FIELDS, // All fields for detail view
      },
      signal,
    );
  }
}

// Export singleton instance to maintain compatibility with existing code
export const djService = new DJService();

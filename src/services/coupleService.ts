import { BaseService } from './baseService';
import type { Couple } from './types';
import type { BaseParams } from './baseService';

export interface CoupleParams extends BaseParams {
  country?: string;
  orderby?: string;
  order?: 'asc' | 'desc';
}

class CoupleService extends BaseService<Couple> {
  constructor() {
    super('/couples', {
      _embed: true, // Enable embeds to get teacher data
      meta_fields: 'all', // Get all metadata fields
    });
  }

  /**
   * Get couples with enhanced filtering and pagination
   */
  async getCouples(params: CoupleParams = {}, signal?: AbortSignal) {
    // Set a high per_page limit to get all couples by default
    // Use 999 to ensure we get all records even if the collection grows
    const defaultParams = {
      per_page: 999,
      ...params,
    };

    const response = await this.getAll(defaultParams, signal);

    // V3 API returns data in _embedded.couples format
    if (response.data && typeof response.data === 'object' && '_embedded' in response.data) {
      const embeddedData = response.data._embedded as { couples?: Couple[] };
      return embeddedData.couples || [];
    }

    // Fallback to direct array if structure is different
    return Array.isArray(response.data) ? response.data : [];
  }

  /**
   * Get a single couple with full metadata
   */
  async getCouple(id: number, signal?: AbortSignal): Promise<Couple> {
    return this.getById(id, { _embed: true }, signal);
  }
}

// Export singleton instance to maintain compatibility with existing code
export const coupleService = new CoupleService();

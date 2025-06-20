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
      _embed: false, // Disable embeds for better performance by default
    });
  }

  /**
   * Get couples with enhanced filtering and pagination
   */
  async getCouples(params: CoupleParams = {}, signal?: AbortSignal) {
    // Set a high per_page limit to get all couples by default
    // Use 200 to ensure we get all records even if the collection grows
    const defaultParams = {
      per_page: 200,
      ...params,
    };

    const response = await this.getAll(defaultParams, signal);

    // Return just the data array like the DJ service does
    return response.data;
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

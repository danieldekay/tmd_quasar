import { BaseService } from './baseService';
import type { Couple } from './types';
import type { BaseParams } from './baseService';

export interface CoupleParams extends BaseParams {
  teacher?: number;
  country?: string;
}

class CoupleService extends BaseService<Couple> {
  constructor() {
    super('/couples', {
      _embed: true, // Enable embeds to get teacher data
      meta_fields: 'country,city,teacher_type', // Use specific fields for better performance
    });
  }

  /**
   * Get couples with enhanced filtering and pagination
   * Updated to work with HAL-compliant v3 API
   */
  async getCouples(params: CoupleParams = {}, signal?: AbortSignal): Promise<Couple[]> {
    // Set a high per_page limit to get all couples by default
    // Use 999 to ensure we get all records even if the collection grows
    const defaultParams = {
      per_page: 999,
      ...params,
    };

    const response = await this.getAll(defaultParams, signal);

    // BaseService now handles HAL parsing automatically
    return response.data;
  }

  /**
   * Get a single couple with full metadata
   */
  async getCouple(id: number, signal?: AbortSignal): Promise<Couple> {
    return this.getById(id, { _embed: true, meta_fields: 'all' }, signal);
  }

  /**
   * Get couples filtered by teacher ID
   */
  async getCouplesByTeacher(teacherId: number, signal?: AbortSignal): Promise<Couple[]> {
    return this.getCouples({ teacher: teacherId }, signal);
  }
}

// Export singleton instance to maintain compatibility with existing code
export const coupleService = new CoupleService();

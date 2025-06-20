import { BaseService } from './baseService';
import type { Teacher } from './types';
import type { BaseParams } from './baseService';

export interface TeacherParams extends BaseParams {
  country?: string;
  orderby?: string;
  order?: 'asc' | 'desc';
}

class TeacherService extends BaseService<Teacher> {
  constructor() {
    super('/teachers', {
      _embed: true, // Enable embeds to get related data
      meta_fields: 'all', // Get all metadata fields
    });
  }

  /**
   * Get teachers with enhanced filtering and pagination
   */
  async getTeachers(params: TeacherParams = {}, signal?: AbortSignal) {
    // Set a high per_page limit to get all teachers by default
    // Use 200 to ensure we get all records even if the collection grows
    const defaultParams = {
      per_page: 200,
      ...params,
    };

    const response = await this.getAll(defaultParams, signal);

    // When _embed=true, the API returns an object with numeric keys instead of an array
    // Convert it to a proper array
    let data = response.data;
    if (data && typeof data === 'object' && !Array.isArray(data)) {
      // Extract values from object with numeric keys, excluding _links
      const dataObj = data as Record<string, unknown>;
      data = Object.keys(dataObj)
        .filter((key) => !isNaN(Number(key)) && key !== '_links')
        .map((key) => dataObj[key])
        .filter(Boolean) as Teacher[];
    }

    return Array.isArray(data) ? data : [];
  }

  /**
   * Get a single teacher with full metadata
   */
  async getTeacher(id: number, signal?: AbortSignal): Promise<Teacher> {
    return this.getById(id, { _embed: true }, signal);
  }
}

// Export singleton instance to maintain compatibility with existing code
export const teacherService = new TeacherService();

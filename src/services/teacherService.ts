import { BaseService } from './baseService';
import type { Teacher } from './types';
import type { BaseParams } from './baseService';

export interface TeacherParams extends BaseParams {
  country?: string;
  city?: string;
  teacher_type?: string;
}

class TeacherService extends BaseService<Teacher> {
  constructor() {
    super('/teachers', {
      _embed: true, // Enable embeds to get related data
      meta_fields: 'country,city,teacher_type', // Use specific fields for better performance
    });
  }

  /**
   * Get teachers with enhanced filtering and pagination
   * Updated to work with HAL-compliant v3 API
   */
  async getTeachers(params: TeacherParams = {}, signal?: AbortSignal): Promise<Teacher[]> {
    // Set a high per_page limit to get all teachers by default
    // Use 200 to ensure we get all records even if the collection grows
    const defaultParams = {
      per_page: 200,
      ...params,
    };

    const response = await this.getAll(defaultParams, signal);

    // BaseService now handles HAL parsing automatically
    return response.data;
  }

  /**
   * Get a single teacher with full metadata
   */
  async getTeacher(id: number, signal?: AbortSignal): Promise<Teacher> {
    return this.getById(id, { _embed: true, meta_fields: 'all' }, signal);
  }

  /**
   * Search teachers by name or other criteria
   */
  async searchTeachers(
    query: string,
    params: TeacherParams = {},
    signal?: AbortSignal,
  ): Promise<Teacher[]> {
    const response = await this.search(query, { meta_fields: 'all', ...params }, signal);
    return response.data;
  }
}

// Export singleton instance to maintain compatibility with existing code
export const teacherService = new TeacherService();

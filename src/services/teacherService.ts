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
      _embed: false, // Disable embeds for better performance by default
    });
  }

  /**
   * Get teachers with enhanced filtering and pagination
   */
  async getTeachers(params: TeacherParams = {}, signal?: AbortSignal) {
    const response = await this.getAll(params, signal);

    // Return just the data array like the DJ service does
    return response.data;
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

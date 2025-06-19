import { BaseService } from './baseService';
import type { Teacher } from './types';

class TeacherService extends BaseService<Teacher> {
  constructor() {
    super('/teachers', {
      _embed: true,
    });
  }

  /**
   * Get all teachers (legacy method name for compatibility)
   */
  async getTeachers(params = {}) {
    return this.getAllLegacy(params);
  }

  /**
   * Get a single teacher (legacy method name for compatibility)
   */
  async getTeacher(id: number) {
    return this.getById(id);
  }
}

// Export singleton instance to maintain compatibility with existing code
export const teacherService = new TeacherService();

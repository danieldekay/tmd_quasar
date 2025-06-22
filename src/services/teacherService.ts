import { BaseService } from './baseService';
import type { Teacher } from './types';
import type { BaseParams } from './baseService';
import {
  TEACHER_ROLES,
  TEACHER_GENDERS,
  ESSENTIAL_TEACHER_META_FIELDS,
  ALL_TEACHER_META_FIELDS,
  type TeacherRole,
  type TeacherGender,
  type TeacherSortOption,
} from './eventConstants';

export interface TeacherParams extends BaseParams {
  role?: TeacherRole;
  gender?: TeacherGender;
  country?: string;
  city?: string;
  teaching_since?: string;
  dancing_since?: string;
  specializations?: string[];
  orderby?: TeacherSortOption;
  order?: 'asc' | 'desc';
  meta_filters?: string;
  include_events?: boolean;
  include_couples?: boolean;
  essential_only?: boolean;
}

class TeacherService extends BaseService<Teacher> {
  private readonly defaultMetaFields: string;

  constructor() {
    super('/teachers', {
      _embed: false, // Disable embeds for better performance by default
      meta_fields: ESSENTIAL_TEACHER_META_FIELDS, // Use essential fields only by default
    });
    this.defaultMetaFields = ESSENTIAL_TEACHER_META_FIELDS;
  }

  /**
   * Get teachers with enhanced V3 API filtering and pagination
   * Supports advanced meta filtering, embedded relationships, and performance optimization
   */
  async getTeachers(params: TeacherParams = {}, signal?: AbortSignal) {
    try {
      // Build V3 API parameters with advanced filtering
      const apiParams = this.buildTeacherApiParams(params);

      // Get response using BaseService
      const response = await this.getAll(apiParams, signal);

      // Transform and enhance the data
      const teachers = this.transformTeachers(response.data);

      return {
        teachers,
        totalPages: response.totalPages,
        total: response.totalCount,
      };
    } catch (error) {
      throw new Error(
        `Failed to fetch teachers: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Get a single teacher with full metadata and embedded relationships
   */
  async getTeacher(id: number, params: TeacherParams = {}, signal?: AbortSignal): Promise<Teacher> {
    try {
      const apiParams = {
        _embed: params.include_events || params.include_couples ? true : false,
        meta_fields: params.essential_only
          ? ESSENTIAL_TEACHER_META_FIELDS
          : ALL_TEACHER_META_FIELDS,
        ...params,
      };

      const teacher = await this.getById(id, apiParams, signal);
      return this.transformTeacher(teacher);
    } catch (error) {
      throw new Error(
        `Failed to fetch teacher ${id}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Search teachers by name or other criteria with V3 API optimization
   */
  async searchTeachers(
    query: string,
    params: TeacherParams = {},
    signal?: AbortSignal,
  ): Promise<Teacher[]> {
    try {
      const searchParams = {
        search: query,
        meta_fields: ALL_TEACHER_META_FIELDS, // Include all fields for search results
        _embed: params.include_events || params.include_couples ? true : false,
        ...params,
      };

      const response = await this.search(query, searchParams, signal);
      return this.transformTeachers(response.data);
    } catch (error) {
      throw new Error(
        `Failed to search teachers: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Get teachers filtered by role (leader, follower, both, double-role)
   */
  async getTeachersByRole(
    role: TeacherRole,
    params: TeacherParams = {},
    signal?: AbortSignal,
  ): Promise<Teacher[]> {
    const response = await this.getTeachers({ ...params, role }, signal);
    return response.teachers;
  }

  /**
   * Get teachers filtered by gender
   */
  async getTeachersByGender(
    gender: TeacherGender,
    params: TeacherParams = {},
    signal?: AbortSignal,
  ): Promise<Teacher[]> {
    const response = await this.getTeachers({ ...params, gender }, signal);
    return response.teachers;
  }

  /**
   * Get teachers by country with optimized meta filtering
   */
  async getTeachersByCountry(
    country: string,
    params: TeacherParams = {},
    signal?: AbortSignal,
  ): Promise<Teacher[]> {
    const metaFilters = { country };
    const response = await this.getTeachers(
      { ...params, meta_filters: JSON.stringify(metaFilters) },
      signal,
    );
    return response.teachers;
  }

  /**
   * Get teachers by city with optimized meta filtering
   */
  async getTeachersByCity(
    city: string,
    params: TeacherParams = {},
    signal?: AbortSignal,
  ): Promise<Teacher[]> {
    const metaFilters = { city };
    const response = await this.getTeachers(
      { ...params, meta_filters: JSON.stringify(metaFilters) },
      signal,
    );
    return response.teachers;
  }

  /**
   * Get teachers with specific specializations
   */
  async getTeachersBySpecializations(
    specializations: string[],
    params: TeacherParams = {},
    signal?: AbortSignal,
  ): Promise<Teacher[]> {
    // Note: This would require custom meta filtering if the API supports it
    // For now, we'll filter client-side
    const response = await this.getTeachers(params, signal);
    return response.teachers.filter((teacher) => {
      const teacherSpecs = teacher.meta_box?.specializations || [];
      return specializations.some((spec) => teacherSpecs.includes(spec));
    });
  }

  /**
   * Get teachers who have been teaching since a specific year
   */
  async getTeachersTeachingSince(
    year: string,
    params: TeacherParams = {},
    signal?: AbortSignal,
  ): Promise<Teacher[]> {
    const metaFilters = { teaching_since: year };
    const response = await this.getTeachers(
      { ...params, meta_filters: JSON.stringify(metaFilters) },
      signal,
    );
    return response.teachers;
  }

  /**
   * Get teachers who have been dancing since a specific year
   */
  async getTeachersDancingSince(
    year: string,
    params: TeacherParams = {},
    signal?: AbortSignal,
  ): Promise<Teacher[]> {
    const metaFilters = { dancing_since: year };
    const response = await this.getTeachers(
      { ...params, meta_filters: JSON.stringify(metaFilters) },
      signal,
    );
    return response.teachers;
  }

  /**
   * Build optimized API parameters for teacher requests
   */
  private buildTeacherApiParams(params: TeacherParams): Record<string, unknown> {
    const apiParams: Record<string, unknown> = { ...params };

    // Handle role filtering
    if (params.role) {
      const existingFilters = params.meta_filters ? JSON.parse(params.meta_filters) : {};
      apiParams.meta_filters = JSON.stringify({
        ...existingFilters,
        role: params.role,
      });
    }

    // Handle gender filtering
    if (params.gender) {
      const existingFilters = params.meta_filters ? JSON.parse(params.meta_filters) : {};
      apiParams.meta_filters = JSON.stringify({
        ...existingFilters,
        gender: params.gender,
      });
    }

    // Handle specializations filtering (if supported by API)
    if (params.specializations?.length) {
      const existingFilters = params.meta_filters ? JSON.parse(params.meta_filters) : {};
      apiParams.meta_filters = JSON.stringify({
        ...existingFilters,
        specializations: params.specializations,
      });
    }

    // Optimize meta fields based on requirements
    if (params.essential_only) {
      apiParams.meta_fields = ESSENTIAL_TEACHER_META_FIELDS;
    } else if (!apiParams.meta_fields) {
      apiParams.meta_fields = ALL_TEACHER_META_FIELDS;
    }

    // Handle embedded relationships
    if (params.include_events || params.include_couples) {
      apiParams._embed = true;
    }

    return apiParams;
  }

  /**
   * Transform teacher data from V3 API format to application format
   */
  private transformTeachers(teachers: Teacher[]): Teacher[] {
    return teachers.map((teacher) => this.transformTeacher(teacher));
  }

  /**
   * Transform a single teacher from V3 API format to application format
   */
  private transformTeacher(teacher: Teacher): Teacher {
    // Ensure all V3 API fields are properly mapped
    const transformed: Teacher = {
      ...teacher,
      // Map V3 API meta fields to expected structure
      meta_box: {
        ...teacher.meta_box,
        nickname: teacher.title,
        ...(teacher.city && { city: teacher.city }),
        ...(teacher.country && { country: teacher.country }),
      },
    };

    // Handle embedded relationships separately to avoid undefined issues
    if (teacher._embedded) {
      transformed._embedded = {
        events: teacher._embedded.events || [],
        couples: teacher._embedded.couples || [],
        author: teacher._embedded.author || [],
      };
    }

    return transformed;
  }

  /**
   * Analyze teacher data for insights and statistics
   */
  analyzeTeacherData(teachers: Teacher[]): {
    totalCount: number;
    byRole: Record<TeacherRole, number>;
    byGender: Record<TeacherGender, number>;
    byCountry: Record<string, number>;
    byCity: Record<string, number>;
    withWebsite: number;
    withEmail: number;
    withSocialMedia: number;
  } {
    const analysis = {
      totalCount: teachers.length,
      byRole: {
        [TEACHER_ROLES.LEADER]: 0,
        [TEACHER_ROLES.FOLLOWER]: 0,
        [TEACHER_ROLES.BOTH]: 0,
        [TEACHER_ROLES.DOUBLE_ROLE]: 0,
      },
      byGender: {
        [TEACHER_GENDERS.MAN]: 0,
        [TEACHER_GENDERS.WOMAN]: 0,
        [TEACHER_GENDERS.OTHER]: 0,
      },
      byCountry: {} as Record<string, number>,
      byCity: {} as Record<string, number>,
      withWebsite: 0,
      withEmail: 0,
      withSocialMedia: 0,
    };

    teachers.forEach((teacher) => {
      // Count by role
      if (
        teacher.meta_box?.role &&
        analysis.byRole[teacher.meta_box.role as TeacherRole] !== undefined
      ) {
        analysis.byRole[teacher.meta_box.role as TeacherRole]++;
      }

      // Count by gender
      if (
        teacher.meta_box?.gender &&
        analysis.byGender[teacher.meta_box.gender as TeacherGender] !== undefined
      ) {
        analysis.byGender[teacher.meta_box.gender as TeacherGender]++;
      }

      // Count by country
      if (teacher.country) {
        analysis.byCountry[teacher.country] = (analysis.byCountry[teacher.country] || 0) + 1;
      }

      // Count by city
      if (teacher.city) {
        analysis.byCity[teacher.city] = (analysis.byCity[teacher.city] || 0) + 1;
      }

      // Count contact information
      if (teacher.meta_box?.website) analysis.withWebsite++;
      if (teacher.meta_box?.email) analysis.withEmail++;
      if (teacher.meta_box?.facebook_profile || teacher.meta_box?.instagram)
        analysis.withSocialMedia++;
    });

    return analysis;
  }

  /**
   * Get teacher statistics and insights
   */
  async getTeacherStats(signal?: AbortSignal): Promise<ReturnType<typeof this.analyzeTeacherData>> {
    const response = await this.getTeachers({ per_page: 1000 }, signal);
    return this.analyzeTeacherData(response.teachers);
  }
}

// Export singleton instance to maintain compatibility with existing code
export const teacherService = new TeacherService();

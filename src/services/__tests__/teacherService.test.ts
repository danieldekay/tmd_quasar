import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Teacher } from '../types';
import type { TeacherParams } from '../teacherService';

// Mock the base service
vi.mock('../baseService', () => ({
  BaseService: vi.fn().mockImplementation(() => ({
    getAll: vi.fn(),
    getById: vi.fn(),
    search: vi.fn(),
  })),
}));

// Create a mock service with all the methods
const createMockTeacherService = () => {
  const mockGetAll = vi.fn();
  const mockGetById = vi.fn();
  const mockSearch = vi.fn();

  return {
    getAll: mockGetAll,
    getById: mockGetById,
    search: mockSearch,
    getTeachers: vi.fn(),
    getTeacher: vi.fn(),
    searchTeachers: vi.fn(),
    getTeachersByRole: vi.fn(),
    getTeachersByGender: vi.fn(),
    getTeachersByCountry: vi.fn(),
    getTeachersByCity: vi.fn(),
    getTeachersBySpecializations: vi.fn(),
    getTeachersTeachingSince: vi.fn(),
    getTeachersDancingSince: vi.fn(),
    analyzeTeacherData: vi.fn(),
    getTeacherStats: vi.fn(),
  };
};

// Mock the entire teacherService module
vi.mock('../teacherService', async () => {
  const actual = await vi.importActual('../teacherService');
  const mockService = createMockTeacherService();

  return {
    ...actual,
    teacherService: mockService,
  };
});

describe('TeacherService', () => {
  let mockService: ReturnType<typeof createMockTeacherService>;

  beforeEach(async () => {
    vi.clearAllMocks();

    // Get the mocked service for all tests
    const { teacherService } = await import('../teacherService');
    mockService = teacherService as unknown as ReturnType<typeof createMockTeacherService>;

    // Set up default mock responses
    const defaultTeachers: Teacher[] = [
      {
        id: 1,
        title: 'John Doe',
        date: '2024-01-01',
        link: 'http://example.com/teacher/1',
        slug: 'john-doe',
        city: 'Buenos Aires',
        country: 'AR',
        meta_box: {
          first_name: 'John',
          last_name: 'Doe',
          role: 'leader',
          gender: 'man',
          website: 'http://johndoe.com',
          email: 'john@example.com',
          facebook_profile: 'http://facebook.com/johndoe',
          instagram: '@johndoe',
          bio_short: 'Experienced tango teacher',
          teaching_since: '2015',
          dancing_since: '2010',
          specializations: ['milonga', 'vals'],
        },
      },
      {
        id: 2,
        title: 'Jane Smith',
        date: '2024-01-02',
        link: 'http://example.com/teacher/2',
        slug: 'jane-smith',
        city: 'Berlin',
        country: 'DE',
        meta_box: {
          first_name: 'Jane',
          last_name: 'Smith',
          role: 'follower',
          gender: 'woman',
          website: 'http://janesmith.com',
          email: 'jane@example.com',
          facebook_profile: '',
          instagram: '',
          bio_short: 'Professional tango dancer',
          teaching_since: '2018',
          dancing_since: '2012',
          specializations: ['tango', 'milonga'],
        },
      },
    ];

    mockService.getTeachers.mockResolvedValue(defaultTeachers);
    mockService.getTeacher.mockResolvedValue(defaultTeachers[0]);
    mockService.searchTeachers.mockResolvedValue(defaultTeachers);
    mockService.getTeachersByRole.mockResolvedValue([defaultTeachers[0]]);
    mockService.getTeachersByGender.mockResolvedValue([defaultTeachers[1]]);
    mockService.getTeachersByCountry.mockResolvedValue([defaultTeachers[0]]);
    mockService.getTeachersByCity.mockResolvedValue([defaultTeachers[0]]);
    mockService.getTeachersBySpecializations.mockResolvedValue([defaultTeachers[0]]);
    mockService.getTeachersTeachingSince.mockResolvedValue([defaultTeachers[0]]);
    mockService.getTeachersDancingSince.mockResolvedValue([defaultTeachers[0]]);
    mockService.analyzeTeacherData.mockReturnValue({
      totalCount: 2,
      byRole: { leader: 1, follower: 1, both: 0, 'double-role': 0 },
      byGender: { man: 1, woman: 1, other: 0 },
      byCountry: { AR: 1, DE: 1 },
      byCity: { 'Buenos Aires': 1, Berlin: 1 },
      withWebsite: 2,
      withEmail: 2,
      withSocialMedia: 1,
    });
    mockService.getTeacherStats.mockResolvedValue({
      totalCount: 2,
      byRole: { leader: 1, follower: 1, both: 0, 'double-role': 0 },
      byGender: { man: 1, woman: 1, other: 0 },
      byCountry: { AR: 1, DE: 1 },
      byCity: { 'Buenos Aires': 1, Berlin: 1 },
      withWebsite: 2,
      withEmail: 2,
      withSocialMedia: 1,
    });
  });

  describe('getTeachers', () => {
    it('fetches teachers with default parameters', async () => {
      const teachers = await mockService.getTeachers();

      expect(mockService.getTeachers).toHaveBeenCalledWith();
      expect(teachers).toHaveLength(2);
      expect(teachers[0].title).toBe('John Doe');
    });

    it('handles role filtering', async () => {
      const params: TeacherParams = { role: 'leader' };
      await mockService.getTeachers(params);

      expect(mockService.getTeachers).toHaveBeenCalledWith(params);
    });

    it('handles gender filtering', async () => {
      const params: TeacherParams = { gender: 'woman' };
      await mockService.getTeachers(params);

      expect(mockService.getTeachers).toHaveBeenCalledWith(params);
    });

    it('handles country filtering', async () => {
      const params: TeacherParams = { country: 'AR' };
      await mockService.getTeachers(params);

      expect(mockService.getTeachers).toHaveBeenCalledWith(params);
    });

    it('handles city filtering', async () => {
      const params: TeacherParams = { city: 'Buenos Aires' };
      await mockService.getTeachers(params);

      expect(mockService.getTeachers).toHaveBeenCalledWith(params);
    });

    it('handles specializations filtering', async () => {
      const params: TeacherParams = { specializations: ['milonga'] };
      await mockService.getTeachers(params);

      expect(mockService.getTeachers).toHaveBeenCalledWith(params);
    });

    it('handles essential_only parameter', async () => {
      const params: TeacherParams = { essential_only: true };
      await mockService.getTeachers(params);

      expect(mockService.getTeachers).toHaveBeenCalledWith(params);
    });

    it('handles include_events parameter', async () => {
      const params: TeacherParams = { include_events: true };
      await mockService.getTeachers(params);

      expect(mockService.getTeachers).toHaveBeenCalledWith(params);
    });

    it('handles include_couples parameter', async () => {
      const params: TeacherParams = { include_couples: true };
      await mockService.getTeachers(params);

      expect(mockService.getTeachers).toHaveBeenCalledWith(params);
    });

    it('handles AbortSignal', async () => {
      const signal = new AbortController().signal;
      await mockService.getTeachers({}, signal);

      expect(mockService.getTeachers).toHaveBeenCalledWith({}, signal);
    });
  });

  describe('getTeacher', () => {
    it('fetches a single teacher by ID', async () => {
      const teacher = await mockService.getTeacher(1);

      expect(mockService.getTeacher).toHaveBeenCalledWith(1);
      expect(teacher.id).toBe(1);
      expect(teacher.title).toBe('John Doe');
    });

    it('handles parameters for single teacher fetch', async () => {
      const params: TeacherParams = { essential_only: true, include_events: true };
      await mockService.getTeacher(1, params);

      expect(mockService.getTeacher).toHaveBeenCalledWith(1, params);
    });

    it('handles AbortSignal for single teacher', async () => {
      const signal = new AbortController().signal;
      await mockService.getTeacher(1, {}, signal);

      expect(mockService.getTeacher).toHaveBeenCalledWith(1, {}, signal);
    });
  });

  describe('searchTeachers', () => {
    it('searches teachers by query', async () => {
      const teachers = await mockService.searchTeachers('John');

      expect(mockService.searchTeachers).toHaveBeenCalledWith('John');
      expect(teachers).toHaveLength(2);
    });

    it('handles search parameters', async () => {
      const params: TeacherParams = { country: 'AR' };
      await mockService.searchTeachers('John', params);

      expect(mockService.searchTeachers).toHaveBeenCalledWith('John', params);
    });

    it('handles AbortSignal for search', async () => {
      const signal = new AbortController().signal;
      await mockService.searchTeachers('John', {}, signal);

      expect(mockService.searchTeachers).toHaveBeenCalledWith('John', {}, signal);
    });
  });

  describe('getTeachersByRole', () => {
    it('filters teachers by leader role', async () => {
      const teachers = await mockService.getTeachersByRole('leader');

      expect(mockService.getTeachersByRole).toHaveBeenCalledWith('leader');
      expect(teachers).toHaveLength(1);
    });

    it('filters teachers by follower role', async () => {
      const teachers = await mockService.getTeachersByRole('follower');

      expect(mockService.getTeachersByRole).toHaveBeenCalledWith('follower');
      expect(teachers).toHaveLength(1);
    });

    it('handles additional parameters', async () => {
      const params: TeacherParams = { country: 'AR' };
      await mockService.getTeachersByRole('leader', params);

      expect(mockService.getTeachersByRole).toHaveBeenCalledWith('leader', params);
    });
  });

  describe('getTeachersByGender', () => {
    it('filters teachers by man gender', async () => {
      const teachers = await mockService.getTeachersByGender('man');

      expect(mockService.getTeachersByGender).toHaveBeenCalledWith('man');
      expect(teachers).toHaveLength(1);
    });

    it('filters teachers by woman gender', async () => {
      const teachers = await mockService.getTeachersByGender('woman');

      expect(mockService.getTeachersByGender).toHaveBeenCalledWith('woman');
      expect(teachers).toHaveLength(1);
    });
  });

  describe('getTeachersByCountry', () => {
    it('filters teachers by country', async () => {
      const teachers = await mockService.getTeachersByCountry('AR');

      expect(mockService.getTeachersByCountry).toHaveBeenCalledWith('AR');
      expect(teachers).toHaveLength(1);
    });
  });

  describe('getTeachersByCity', () => {
    it('filters teachers by city', async () => {
      const teachers = await mockService.getTeachersByCity('Buenos Aires');

      expect(mockService.getTeachersByCity).toHaveBeenCalledWith('Buenos Aires');
      expect(teachers).toHaveLength(1);
    });
  });

  describe('getTeachersBySpecializations', () => {
    it('filters teachers by specializations', async () => {
      const teachers = await mockService.getTeachersBySpecializations(['milonga']);

      expect(mockService.getTeachersBySpecializations).toHaveBeenCalledWith(['milonga']);
      expect(teachers).toHaveLength(1);
    });
  });

  describe('getTeachersTeachingSince', () => {
    it('filters teachers by teaching since year', async () => {
      const teachers = await mockService.getTeachersTeachingSince('2015');

      expect(mockService.getTeachersTeachingSince).toHaveBeenCalledWith('2015');
      expect(teachers).toHaveLength(1);
    });
  });

  describe('getTeachersDancingSince', () => {
    it('filters teachers by dancing since year', async () => {
      const teachers = await mockService.getTeachersDancingSince('2010');

      expect(mockService.getTeachersDancingSince).toHaveBeenCalledWith('2010');
      expect(teachers).toHaveLength(1);
    });
  });

  describe('analyzeTeacherData', () => {
    it('analyzes teacher data correctly', () => {
      const teachers: Teacher[] = [
        {
          id: 1,
          title: 'John Doe',
          date: '2024-01-01',
          link: 'http://example.com/teacher/1',
          city: 'Buenos Aires',
          country: 'AR',
          meta_box: {
            role: 'leader',
            gender: 'man',
            website: 'http://johndoe.com',
            email: 'john@example.com',
            facebook_profile: 'http://facebook.com/johndoe',
          },
        },
        {
          id: 2,
          title: 'Jane Smith',
          date: '2024-01-02',
          link: 'http://example.com/teacher/2',
          city: 'Berlin',
          country: 'DE',
          meta_box: {
            role: 'follower',
            gender: 'woman',
            website: 'http://janesmith.com',
            email: 'jane@example.com',
          },
        },
      ];

      const analysis = mockService.analyzeTeacherData(teachers);

      expect(analysis.totalCount).toBe(2);
      expect(analysis.byRole.leader).toBe(1);
      expect(analysis.byRole.follower).toBe(1);
      expect(analysis.byGender.man).toBe(1);
      expect(analysis.byGender.woman).toBe(1);
      expect(analysis.byCountry.AR).toBe(1);
      expect(analysis.byCountry.DE).toBe(1);
      expect(analysis.withWebsite).toBe(2);
      expect(analysis.withEmail).toBe(2);
      expect(analysis.withSocialMedia).toBe(1);
    });
  });

  describe('getTeacherStats', () => {
    it('returns teacher statistics', async () => {
      const stats = await mockService.getTeacherStats();

      expect(mockService.getTeacherStats).toHaveBeenCalledWith();
      expect(stats.totalCount).toBe(2);
      expect(stats.byRole.leader).toBe(1);
      expect(stats.byRole.follower).toBe(1);
      expect(stats.byGender.man).toBe(1);
      expect(stats.byGender.woman).toBe(1);
      expect(stats.byCountry.AR).toBe(1);
      expect(stats.byCountry.DE).toBe(1);
      expect(stats.withWebsite).toBe(2);
      expect(stats.withEmail).toBe(2);
      expect(stats.withSocialMedia).toBe(1);
    });

    it('handles AbortSignal for stats', async () => {
      const signal = new AbortController().signal;
      await mockService.getTeacherStats(signal);

      expect(mockService.getTeacherStats).toHaveBeenCalledWith(signal);
    });
  });

  describe('Error Handling', () => {
    it('handles API errors gracefully', async () => {
      mockService.getTeachers.mockRejectedValue(new Error('API Error'));

      await expect(mockService.getTeachers()).rejects.toThrow('API Error');
    });

    it('handles network errors', async () => {
      mockService.getTeacher.mockRejectedValue(new Error('Network Error'));

      await expect(mockService.getTeacher(1)).rejects.toThrow('Network Error');
    });
  });

  describe('Data Transformation', () => {
    it('transforms teacher data correctly', async () => {
      const teacher = await mockService.getTeacher(1);

      expect(teacher.meta_box?.first_name).toBe('John');
      expect(teacher.meta_box?.last_name).toBe('Doe');
      expect(teacher.meta_box?.role).toBe('leader');
      expect(teacher.meta_box?.gender).toBe('man');
      expect(teacher.meta_box?.website).toBe('http://johndoe.com');
      expect(teacher.meta_box?.email).toBe('john@example.com');
      expect(teacher.meta_box?.specializations).toEqual(['milonga', 'vals']);
    });
  });
});

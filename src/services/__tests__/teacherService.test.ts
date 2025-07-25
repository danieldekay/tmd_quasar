import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock BaseService as a class so TeacherService can extend it
vi.mock('../baseService', () => {
  return {
    BaseService: class {
      getAll = vi.fn().mockResolvedValue({
        data: [
          {
            id: 1,
            title: 'Test Teacher',
            date: '2024-01-01',
            link: 'http://example.com/teacher/1',
            city: 'Test City',
            country: 'Test Country',
            meta_box: {
              first_name: 'Test',
              last_name: 'Teacher',
              role: 'leader',
              gender: 'man',
            },
          },
        ],
        totalCount: 1,
        totalPages: 1,
        currentPage: 1,
        hasNextPage: false,
        hasPrevPage: false,
      });
    },
  };
});

import { teacherService } from '../teacherService';

describe('TeacherService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch teachers successfully', async () => {
    const response = await teacherService.getTeachers();

    expect(response).toBeDefined();
    expect(response).toHaveProperty('teachers');
    expect(response).toHaveProperty('total');
    expect(response).toHaveProperty('totalPages');
    expect(Array.isArray(response.teachers)).toBe(true);
    expect(response.teachers.length).toBeGreaterThan(0);
    expect(response.total).toBe(1);

    if (response.teachers.length > 0) {
      const teacher = response.teachers[0];
      expect(teacher).toHaveProperty('id');
      expect(teacher).toHaveProperty('title');
      expect(teacher).toHaveProperty('meta_box');
    }
  });
});

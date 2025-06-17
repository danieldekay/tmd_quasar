import { api } from '../boot/axios';
import type { Teacher } from './types';

export const teacherService = {
  async getTeachers(params = {}) {
    try {
      const response = await api.get('/teachers', {
        params: {
          _embed: true,
          ...params,
        },
      });
      return response.data as Teacher[];
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  async getTeacher(id: number) {
    try {
      const response = await api.get(`/teachers/${id}`, {
        params: {
          _embed: true,
        },
      });
      return response.data as Teacher;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },
};

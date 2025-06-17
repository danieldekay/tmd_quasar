import { api } from '../boot/axios';
import type { DJ } from './types';

export const djService = {
  async getDJs(params = {}) {
    try {
      const response = await api.get('/djs', {
        params: {
          _embed: true,
          ...params,
        },
      });
      return response.data as DJ[];
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  async getDJ(id: number) {
    try {
      const response = await api.get(`/djs/${id}`, {
        params: {
          _embed: true,
        },
      });
      return response.data as DJ;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },
};

import { api } from '../boot/axios';
import type { EventSeries } from './types';

export const eventSeriesService = {
  async getEventSeries(params = {}) {
    try {
      const response = await api.get('/event-series', {
        params: {
          _embed: true,
          ...params,
        },
      });
      return response.data as EventSeries[];
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  async getEventSeriesById(id: number) {
    try {
      const response = await api.get(`/event-series/${id}`, {
        params: {
          _embed: true,
        },
      });
      return response.data as EventSeries;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },
};

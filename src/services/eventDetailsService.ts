import { api } from '../boot/axios';
import type { EventDetails } from './types';

export const eventDetailsService = {
  /**
   * Retrieve a single event with full metadata and taxonomies.
   */
  async getEvent(id: number): Promise<EventDetails> {
    try {
      const response = await api.get(`/events/${id}`, {
        params: {
          meta_fields: 'all',
          include_taxonomies: true,
          _embed: true,
        },
      });
      return response.data as EventDetails;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },
};

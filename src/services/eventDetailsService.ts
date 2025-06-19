import { BaseService } from './baseService';
import type { EventDetails } from './types';

class EventDetailsService extends BaseService<EventDetails> {
  constructor() {
    super('/events', {
      meta_fields: 'all',
      include_taxonomies: true,
      _embed: true,
    });
  }

  /**
   * Retrieve a single event with full metadata and taxonomies.
   */
  async getEvent(id: number): Promise<EventDetails> {
    return this.getById(id);
  }
}

// Export singleton instance to maintain compatibility with existing code
export const eventDetailsService = new EventDetailsService();

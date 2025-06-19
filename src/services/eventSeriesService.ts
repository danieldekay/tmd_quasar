import { BaseService } from './baseService';
import type { EventSeries } from './types';

class EventSeriesService extends BaseService<EventSeries> {
  constructor() {
    super('/event-series', {
      _embed: true,
    });
  }

  /**
   * Get all event series (legacy method name for compatibility)
   */
  async getEventSeries(params = {}) {
    return this.getAllLegacy(params);
  }

  /**
   * Get a single event series by ID (legacy method name for compatibility)
   */
  async getEventSeriesById(id: number) {
    return this.getById(id);
  }
}

// Export singleton instance to maintain compatibility with existing code
export const eventSeriesService = new EventSeriesService();

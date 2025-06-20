import { BaseService } from './baseService';
import type { EventSeries } from './types';
import type { BaseParams } from './baseService';

export interface EventSeriesParams extends BaseParams {
  country?: string;
  orderby?: string;
  order?: 'asc' | 'desc';
}

class EventSeriesService extends BaseService<EventSeries> {
  constructor() {
    super('/event-series', {
      _embed: false, // Disable embeds for better performance by default
    });
  }

  /**
   * Get event series with enhanced filtering and pagination
   */
  async getEventSeries(params: EventSeriesParams = {}, signal?: AbortSignal) {
    // Set a high per_page limit to get all event series by default
    // Use 200 to ensure we get all records even if the collection grows
    const defaultParams = {
      per_page: 200,
      ...params,
    };

    const response = await this.getAll(defaultParams, signal);

    // Return just the data array like the DJ service does
    return response.data;
  }

  /**
   * Get a single event series with full metadata
   */
  async getEventSeriesById(id: number, signal?: AbortSignal): Promise<EventSeries> {
    return this.getById(id, { _embed: true, meta_fields: 'all' }, signal);
  }
}

// Export singleton instance to maintain compatibility with existing code
export const eventSeriesService = new EventSeriesService();

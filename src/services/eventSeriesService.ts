import { BaseService } from './baseService';
import type { EventSeries } from './types';
import type { BaseParams } from './baseService';
import {
  ESSENTIAL_EVENT_SERIES_META_FIELDS,
  ALL_EVENT_SERIES_META_FIELDS,
  type EventSeriesSortOption,
} from './eventConstants';

export interface EventSeriesParams extends BaseParams {
  country?: string;
  city?: string;
  has_upcoming_events?: boolean;
  start_date_from?: string;
  start_date_to?: string;
  orderby?: EventSeriesSortOption;
  order?: 'asc' | 'desc';
  meta_filters?: string;
  include_events?: boolean;
  essential_only?: boolean;
}

class EventSeriesService extends BaseService<EventSeries> {
  private readonly defaultMetaFields: string;

  constructor() {
    super('/event-series', {
      _embed: false, // Disable embeds for better performance by default
      meta_fields: ESSENTIAL_EVENT_SERIES_META_FIELDS, // Use essential fields only by default
    });
    this.defaultMetaFields = ESSENTIAL_EVENT_SERIES_META_FIELDS;
  }

  /**
   * Get event series with enhanced V3 API filtering and pagination
   * Supports advanced meta filtering, embedded relationships, and performance optimization
   */
  async getEventSeries(params: EventSeriesParams = {}, signal?: AbortSignal) {
    try {
      // Build V3 API parameters with advanced filtering
      const apiParams = this.buildEventSeriesApiParams(params);

      // Get response using BaseService
      const response = await this.getAll(apiParams, signal);

      // Transform and enhance the data
      const eventSeries = this.transformEventSeries(response.data);

      return eventSeries;
    } catch (error) {
      throw new Error(
        `Failed to fetch event series: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Get a single event series with full metadata and embedded relationships
   */
  async getEventSeriesById(
    id: number,
    params: EventSeriesParams = {},
    signal?: AbortSignal,
  ): Promise<EventSeries> {
    try {
      const apiParams = {
        _embed: params.include_events ? true : false,
        meta_fields: params.essential_only
          ? ESSENTIAL_EVENT_SERIES_META_FIELDS
          : ALL_EVENT_SERIES_META_FIELDS,
        ...params,
      };

      const eventSeries = await this.getById(id, apiParams, signal);
      return this.transformEventSeriesItem(eventSeries);
    } catch (error) {
      throw new Error(
        `Failed to fetch event series ${id}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Get event series by country with optimized meta filtering
   */
  async getEventSeriesByCountry(
    country: string,
    params: EventSeriesParams = {},
    signal?: AbortSignal,
  ) {
    const metaFilters = { country };
    return this.getEventSeries({ ...params, meta_filters: JSON.stringify(metaFilters) }, signal);
  }

  /**
   * Get event series by city with optimized meta filtering
   */
  async getEventSeriesByCity(city: string, params: EventSeriesParams = {}, signal?: AbortSignal) {
    const metaFilters = { city };
    return this.getEventSeries({ ...params, meta_filters: JSON.stringify(metaFilters) }, signal);
  }

  /**
   * Get event series with upcoming events
   */
  async getEventSeriesWithUpcomingEvents(params: EventSeriesParams = {}, signal?: AbortSignal) {
    return this.getEventSeries({ ...params, include_events: true }, signal);
  }

  /**
   * Get event series by date range
   */
  async getEventSeriesByDateRange(
    startDate: string,
    endDate: string,
    params: EventSeriesParams = {},
    signal?: AbortSignal,
  ) {
    const metaFilters = {
      start_date_from: startDate,
      start_date_to: endDate,
    };
    return this.getEventSeries({ ...params, meta_filters: JSON.stringify(metaFilters) }, signal);
  }

  /**
   * Get event series with events
   */
  async getEventSeriesWithEvents(params: EventSeriesParams = {}, signal?: AbortSignal) {
    return this.getEventSeries({ ...params, include_events: true }, signal);
  }

  /**
   * Build optimized API parameters for event series requests
   */
  private buildEventSeriesApiParams(params: EventSeriesParams): Record<string, unknown> {
    const apiParams: Record<string, unknown> = { ...params };

    // Handle country filtering
    if (params.country) {
      const existingFilters = params.meta_filters ? JSON.parse(params.meta_filters) : {};
      apiParams.meta_filters = JSON.stringify({
        ...existingFilters,
        country: params.country,
      });
      delete apiParams.country; // Remove from params to avoid conflicts
    }

    // Handle city filtering
    if (params.city) {
      const existingFilters = params.meta_filters ? JSON.parse(params.meta_filters) : {};
      apiParams.meta_filters = JSON.stringify({
        ...existingFilters,
        city: params.city,
      });
      delete apiParams.city; // Remove from params to avoid conflicts
    }

    // Handle date range filtering
    if (params.start_date_from || params.start_date_to) {
      const existingFilters = params.meta_filters ? JSON.parse(params.meta_filters) : {};
      const dateFilters: Record<string, string> = {};
      if (params.start_date_from) dateFilters.start_date_from = params.start_date_from;
      if (params.start_date_to) dateFilters.start_date_to = params.start_date_to;

      apiParams.meta_filters = JSON.stringify({
        ...existingFilters,
        ...dateFilters,
      });
      delete apiParams.start_date_from;
      delete apiParams.start_date_to;
    }

    // Optimize meta fields based on requirements
    if (params.essential_only) {
      apiParams.meta_fields = ESSENTIAL_EVENT_SERIES_META_FIELDS;
    } else if (!apiParams.meta_fields) {
      apiParams.meta_fields = ALL_EVENT_SERIES_META_FIELDS;
    }

    // Handle embedded relationships
    if (params.include_events) {
      apiParams._embed = true;
    }

    return apiParams;
  }

  /**
   * Transform event series data from V3 API format to application format
   */
  private transformEventSeries(eventSeries: EventSeries[]): EventSeries[] {
    return eventSeries.map((series) => this.transformEventSeriesItem(series));
  }

  /**
   * Transform a single event series from V3 API format to application format
   */
  private transformEventSeriesItem(eventSeries: EventSeries): EventSeries {
    // Ensure all V3 API fields are properly mapped
    const transformed: EventSeries = {
      ...eventSeries,
      // Map V3 API meta fields to expected structure
      acf: {
        description: eventSeries.acf?.description || '',
        website: eventSeries.website || '',
        logo: eventSeries.acf?.logo || '',
      },
      // Ensure embedded relationships are properly structured
      _embedded: eventSeries._embedded
        ? {
            events: eventSeries._embedded.events || [],
            author: eventSeries._embedded.author || [],
            'wp:featuredmedia': eventSeries._embedded['wp:featuredmedia'] || [],
            'wp:term': eventSeries._embedded['wp:term'] || [],
          }
        : {
            events: [],
            author: [],
            'wp:featuredmedia': [],
            'wp:term': [],
          },
    };

    return transformed;
  }

  /**
   * Analyze event series data for insights and statistics
   */
  analyzeEventSeriesData(eventSeries: EventSeries[]): {
    totalCount: number;
    byCountry: Record<string, number>;
    byCity: Record<string, number>;
    withEvents: number;
    withWebsite: number;
    withLogo: number;
    upcomingEvents: number;
  } {
    const analysis = {
      totalCount: eventSeries.length,
      byCountry: {} as Record<string, number>,
      byCity: {} as Record<string, number>,
      withEvents: 0,
      withWebsite: 0,
      withLogo: 0,
      upcomingEvents: 0,
    };

    const today = new Date();

    eventSeries.forEach((series) => {
      // Count by country
      if (series.country) {
        analysis.byCountry[series.country] = (analysis.byCountry[series.country] || 0) + 1;
      }

      // Count by city
      if (series.city) {
        analysis.byCity[series.city] = (analysis.byCity[series.city] || 0) + 1;
      }

      // Count contact information
      if (series.website) analysis.withWebsite++;
      if (series.acf?.logo) analysis.withLogo++;
      if (series._embedded?.events?.length) analysis.withEvents++;

      // Count upcoming events
      if (series.start_date) {
        const startDate = new Date(series.start_date);
        if (startDate > today) {
          analysis.upcomingEvents++;
        }
      }
    });

    return analysis;
  }

  /**
   * Get event series statistics and insights
   */
  async getEventSeriesStats(
    signal?: AbortSignal,
  ): Promise<ReturnType<typeof this.analyzeEventSeriesData>> {
    const eventSeries = await this.getEventSeries({ per_page: 1000 }, signal);
    return this.analyzeEventSeriesData(eventSeries);
  }
}

// Export singleton instance to maintain compatibility with existing code
export const eventSeriesService = new EventSeriesService();

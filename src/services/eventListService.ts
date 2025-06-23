import { BaseService, type HALResponse } from './baseService';
import type { EventListItem, EventParams, EventTaxonomies } from './types';
import type { BaseParams } from './baseService';

// Import V3 API abstractions
import { isFeatureAvailable, getString } from './v3ApiUtils';
import { META_FIELD_SETS } from './eventConstants';

// Legacy export for backward compatibility
export type EventMetaFilters = {
  country?: string;
  city?: string;
  have_milongas?: '0' | '1';
  have_tickets?: '0' | '1';
  have_food?: '0' | '1';
  have_sleep?: '0' | '1';
  have_registration?: '0' | '1';
  invitation_only?: '0' | '1';
  have_live_music?: '0' | '1';
  price_min?: string;
  price_max?: string;
  currency?: string;
  start_date_from?: string;
  start_date_to?: string;
  registration_start_date_from?: string;
  registration_start_date_to?: string;
};

/**
 * Enhanced event parameters for V3 API
 */
export interface EnhancedEventParams extends BaseParams, EventParams {
  // Category filtering
  category?: 'marathon' | 'festival' | 'encuentro';

  // Advanced meta filtering
  meta_filters?: EventMetaFilters;

  // Date range filtering
  start_date_from?: string;
  start_date_to?: string;
  registration_start_date_from?: string;
  registration_start_date_to?: string;

  // Sorting options
  orderby?: 'start_date' | 'registration_start_date' | 'title' | 'date';
  order?: 'asc' | 'desc';

  // Feature filtering (legacy support)
  have_milongas?: boolean;
  have_food?: boolean;
  have_sleep?: boolean;
  have_registration?: boolean;
  invitation_only?: boolean;

  // Location filtering
  country?: string;
  city?: string;

  // Embed options
  include_djs?: boolean;
  include_teachers?: boolean;
  include_event_series?: boolean;
}

// Helper functions are now imported from v3ApiUtils

/**
 * Enhanced event transformation for V3 API
 * Handles embedded relationships and feature detection
 */
const transformRawEvent = (rawEvent: Record<string, unknown>): EventListItem => {
  // V3 API includes meta fields directly in the response
  const meta = (rawEvent.meta || rawEvent.acf || {}) as Record<string, unknown>;

  // Extract taxonomies from _embedded or direct taxonomy fields
  let taxonomies: EventTaxonomies | undefined;

  // Check for direct taxonomy data (v3 API may include this)
  if (rawEvent['event-categories-2020']) {
    const categories = rawEvent['event-categories-2020'];
    if (Array.isArray(categories)) {
      taxonomies = {
        'event-categories-2020': categories.map((cat: unknown) => {
          if (cat && typeof cat === 'object') {
            const catObj = cat as Record<string, unknown>;
            return {
              id: Number(catObj.id) || 0,
              name: getString(catObj.name),
              slug: getString(catObj.slug),
              description: getString(catObj.description || ''),
            };
          }
          return { id: 0, name: '', slug: '', description: '' };
        }),
      };
    }
  }

  // Fallback to _embedded structure if available
  if (!taxonomies && rawEvent._embedded && typeof rawEvent._embedded === 'object') {
    const embedded = rawEvent._embedded as Record<string, unknown>;
    const wpTerms = embedded['wp:term'];

    if (Array.isArray(wpTerms) && wpTerms.length > 0) {
      const extractedTaxonomies: EventTaxonomies = {};

      wpTerms.forEach((termGroup: unknown) => {
        if (Array.isArray(termGroup)) {
          termGroup.forEach((term: unknown) => {
            if (term && typeof term === 'object') {
              const termObj = term as Record<string, unknown>;
              const taxonomyName = getString(termObj.taxonomy);
              const termName = getString(termObj.name);
              const termSlug = getString(termObj.slug);
              const termId = Number(termObj.id) || 0;

              if (taxonomyName === 'event-categories-2020' && termName) {
                if (!extractedTaxonomies['event-categories-2020']) {
                  extractedTaxonomies['event-categories-2020'] = [];
                }
                extractedTaxonomies['event-categories-2020'].push({
                  id: termId,
                  name: termName,
                  slug: termSlug,
                  description: '',
                });
              }
            }
          });
        }
      });

      if (Object.keys(extractedTaxonomies).length > 0) {
        taxonomies = extractedTaxonomies;
      }
    }
  }

  // Build the result with enhanced feature detection
  const result: EventListItem = {
    id: Number(rawEvent.id) || 0,
    title: getString(rawEvent.title),
    date: getString(rawEvent.date),
    link: getString(rawEvent.link),
    start_date: getString(meta.start_date || rawEvent.start_date),
    end_date: getString(meta.end_date || rawEvent.end_date),
    registration_start_date: getString(
      meta.registration_start_date || rawEvent.registration_start_date,
    ),
    edition: getString(meta.edition || rawEvent.edition),
    event_name: getString(meta.event_name || rawEvent.event_name || rawEvent.title),
    event_category: getString(meta.event_category || rawEvent.event_category),
    featured_image: getString(rawEvent.featured_image),
    city: getString(meta.city || rawEvent.city),
    country: getString(meta.country || rawEvent.country),
    venue_name: getString(meta.venue_name || rawEvent.venue_name),

    // Enhanced feature detection using V3 API format
    have_milongas: isFeatureAvailable(meta.have_milongas || rawEvent.have_milongas),
    have_tickets: isFeatureAvailable(meta.have_tickets || rawEvent.have_tickets),
    have_food: isFeatureAvailable(meta.have_food || rawEvent.have_food),
    have_sleep: isFeatureAvailable(meta.have_sleep || rawEvent.have_sleep),
    have_registration: isFeatureAvailable(meta.have_registration || rawEvent.have_registration),

    // Pricing information
    price: getString(meta.price || rawEvent.price),
    currency: getString(meta.currency || rawEvent.currency),

    // Add extracted taxonomies only if they exist
    ...(taxonomies && { taxonomies }),
  };

  // If event_category is empty but we have taxonomies, derive from first category
  if (!result.event_category && taxonomies?.['event-categories-2020']?.length) {
    result.event_category = taxonomies['event-categories-2020'][0]!.name;
  }

  return result;
};

/**
 * Build meta_filters object from parameters
 */
const buildMetaFilters = (params: EnhancedEventParams): EventMetaFilters | undefined => {
  const filters: EventMetaFilters = {};
  let hasFilters = false;

  // Direct meta_filters from params
  if (params.meta_filters) {
    Object.assign(filters, params.meta_filters);
    hasFilters = true;
  }

  // Legacy boolean filters converted to V3 API format
  if (params.have_milongas !== undefined) {
    filters.have_milongas = params.have_milongas ? '1' : '0';
    hasFilters = true;
  }
  if (params.have_food !== undefined) {
    filters.have_food = params.have_food ? '1' : '0';
    hasFilters = true;
  }
  if (params.have_sleep !== undefined) {
    filters.have_sleep = params.have_sleep ? '1' : '0';
    hasFilters = true;
  }
  if (params.have_registration !== undefined) {
    filters.have_registration = params.have_registration ? '1' : '0';
    hasFilters = true;
  }
  if (params.invitation_only !== undefined) {
    filters.invitation_only = params.invitation_only ? '1' : '0';
    hasFilters = true;
  }

  // Location filters
  if (params.country) {
    filters.country = params.country;
    hasFilters = true;
  }
  if (params.city) {
    filters.city = params.city;
    hasFilters = true;
  }

  // Date range filters
  if (params.start_date_from) {
    filters.start_date_from = params.start_date_from;
    hasFilters = true;
  }
  if (params.start_date_to) {
    filters.start_date_to = params.start_date_to;
    hasFilters = true;
  }
  if (params.registration_start_date_from) {
    filters.registration_start_date_from = params.registration_start_date_from;
    hasFilters = true;
  }
  if (params.registration_start_date_to) {
    filters.registration_start_date_to = params.registration_start_date_to;
    hasFilters = true;
  }

  return hasFilters ? filters : undefined;
};

export interface PaginatedEventsResponse {
  events: EventListItem[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

class EventListService extends BaseService<EventListItem> {
  constructor() {
    super('/events', {
      meta_fields: META_FIELD_SETS.LIST_COMPLETE,
      include_taxonomies: true,
      _embed: false, // Disable by default for performance, enable when needed
    });
  }

  /**
   * Override extractDataFromResponse to apply enhanced event transformation
   */
  protected override extractDataFromResponse(
    response: HALResponse<EventListItem> | EventListItem[],
  ): EventListItem[] {
    // Get raw data from HAL response as unknown objects
    const rawData = super.extractDataFromResponse(response);

    // Transform each event from raw API response to EventListItem
    return rawData.map((event: EventListItem) =>
      transformRawEvent(event as unknown as Record<string, unknown>),
    );
  }

  /**
   * Enhanced event fetching with V3 API features
   */
  async getEvents(params: EnhancedEventParams = {}): Promise<PaginatedEventsResponse> {
    const requestParams: Record<string, unknown> = {
      per_page: params.perPage || 20,
      page: params.page || 1,
      orderby: params.orderby || 'start_date',
      order: params.order || 'asc',
    };

    // Add category filtering
    if (params.category) {
      requestParams.category = params.category;
    }

    // Add meta filters
    const metaFilters = buildMetaFilters(params);
    if (metaFilters) {
      requestParams.meta_filters = JSON.stringify(metaFilters);
    }

    // Add search if provided
    if (params.search) {
      requestParams.search = params.search;
    }

    // Enhanced embedding options
    if (params.include_djs || params.include_teachers || params.include_event_series) {
      requestParams._embed = true;
    }

    // Copy other params
    Object.keys(params).forEach((key) => {
      if (
        ![
          'perPage',
          'page',
          'orderby',
          'order',
          'category',
          'meta_filters',
          'search',
          'include_djs',
          'include_teachers',
          'include_event_series',
          'have_milongas',
          'have_food',
          'have_sleep',
          'have_registration',
          'invitation_only',
          'country',
          'city',
          'start_date_from',
          'start_date_to',
          'registration_start_date_from',
          'registration_start_date_to',
        ].includes(key)
      ) {
        requestParams[key] = params[key as keyof EnhancedEventParams];
      }
    });

    const response = await this.getAll(requestParams);

    return {
      events: response.data,
      totalCount: response.totalCount,
      totalPages: response.totalPages,
      currentPage: response.currentPage,
      hasNextPage: response.hasNextPage,
      hasPrevPage: response.hasPrevPage,
    };
  }

  /**
   * Get events by category with enhanced filtering
   */
  async getEventsByCategory(
    category: 'marathon' | 'festival' | 'encuentro',
    params: EnhancedEventParams = {},
  ): Promise<PaginatedEventsResponse> {
    return this.getEvents({ ...params, category });
  }

  /**
   * Get events by country with enhanced filtering
   */
  async getEventsByCountry(
    country: string,
    params: EnhancedEventParams = {},
  ): Promise<PaginatedEventsResponse> {
    return this.getEvents({ ...params, country });
  }

  /**
   * Get events with specific features
   */
  async getEventsByFeatures(
    features: Partial<EventMetaFilters>,
    params: EnhancedEventParams = {},
  ): Promise<PaginatedEventsResponse> {
    return this.getEvents({
      ...params,
      meta_filters: { ...params.meta_filters, ...features },
    });
  }

  /**
   * Get events in date range
   */
  async getEventsByDateRange(
    startDate: string,
    endDate: string,
    params: EnhancedEventParams = {},
  ): Promise<PaginatedEventsResponse> {
    return this.getEvents({
      ...params,
      start_date_from: startDate,
      start_date_to: endDate,
    });
  }

  /**
   * Get upcoming events
   */
  async getUpcomingEvents(params: EnhancedEventParams = {}): Promise<PaginatedEventsResponse> {
    const today: string = new Date().toISOString().split('T')[0]!;
    let start_date_from: string;
    if (typeof params.start_date_from === 'string' && params.start_date_from) {
      start_date_from = params.start_date_from;
    } else {
      start_date_from = today;
    }
    const upcomingParams: EnhancedEventParams = {
      orderby: 'start_date',
      order: 'asc',
      start_date_from,
      // Manually copy other properties from params if they exist
      ...(params.category && { category: params.category }),
      ...(params.meta_filters && { meta_filters: params.meta_filters }),
      ...(params.start_date_to && { start_date_to: params.start_date_to }),
      ...(params.registration_start_date_from && {
        registration_start_date_from: params.registration_start_date_from,
      }),
      ...(params.registration_start_date_to && {
        registration_start_date_to: params.registration_start_date_to,
      }),
      ...(params.have_milongas !== undefined && { have_milongas: params.have_milongas }),
      ...(params.have_food !== undefined && { have_food: params.have_food }),
      ...(params.have_sleep !== undefined && { have_sleep: params.have_sleep }),
      ...(params.have_registration !== undefined && {
        have_registration: params.have_registration,
      }),
      ...(params.invitation_only !== undefined && { invitation_only: params.invitation_only }),
      ...(params.country && { country: params.country }),
      ...(params.city && { city: params.city }),
      ...(params.include_djs !== undefined && { include_djs: params.include_djs }),
      ...(params.include_teachers !== undefined && { include_teachers: params.include_teachers }),
      ...(params.include_event_series !== undefined && {
        include_event_series: params.include_event_series,
      }),
      ...(params.search && { search: params.search }),
      ...(params.page && { page: params.page }),
      ...(params.perPage && { perPage: params.perPage }),
    };
    return this.getEvents(upcomingParams);
  }

  /**
   * Legacy method for compatibility
   */
  async getEventsLegacy(params: EnhancedEventParams = {}): Promise<EventListItem[]> {
    const response = await this.getEvents(params);
    return response.events;
  }

  /**
   * Load more events for pagination
   */
  async loadMoreEvents(
    page: number,
    params: Record<string, unknown> = {},
  ): Promise<EventListItem[]> {
    const response = await this.getEvents({ ...params, page } as EnhancedEventParams);
    return response.events;
  }

  /**
   * Enhanced search with V3 API features
   */
  async searchEvents(query: string, params: EnhancedEventParams = {}): Promise<EventListItem[]> {
    const response = await this.getEvents({ ...params, search: query });
    return response.events;
  }
}

// Export singleton instance
export const eventListService = new EventListService();

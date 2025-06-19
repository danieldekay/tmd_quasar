import { BaseService } from './baseService';
import type { EventListItem, EventParams, EventTaxonomies } from './types';
import type { BaseParams } from './baseService';

/**
 * Parse WordPress REST API response that might be an array or object with numeric keys
 */
const parseEventsResponse = (data: unknown): unknown[] => {
  if (Array.isArray(data)) {
    return data;
  }

  if (data && typeof data === 'object') {
    // WordPress with _embed returns an object with numeric keys
    const entries = Object.entries(data as Record<string, unknown>);
    return entries
      .filter(([key, value]) => {
        // Filter out non-numeric keys (like _links)
        return (
          /^\d+$/.test(key) &&
          typeof value === 'object' &&
          value !== null &&
          'id' in (value as Record<string, unknown>)
        );
      })
      .map(([, value]) => value);
  }

  throw new Error('Invalid API response format');
};

// Only request meta fields that are actually used in the list view
const LIST_META_FIELDS = [
  'start_date',
  'end_date',
  'registration_start_date',
  'city',
  'country',
  'event_name',
  'venue_name', // Used in mobile cards and table venue info
].join(',');

/**
 * Coerce an unknown value into a string representation.
 */
const getString = (value: unknown): string => {
  if (typeof value === 'string') return value;
  if (typeof value === 'object' && value !== null) {
    if ('rendered' in value) return String((value as { rendered: unknown }).rendered);
    return JSON.stringify(value);
  }
  if (value === null || value === undefined) return '';
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  if (typeof value === 'number') return value.toString();
  return '';
};

/**
 * Transform a raw WordPress event into the minimal data structure needed for list views.
 */
const transformRawEvent = (rawEvent: Record<string, unknown>): EventListItem => {
  // WordPress might store meta fields under a 'meta' or 'acf' property, or directly on the event
  const meta = (rawEvent.meta || rawEvent.acf || {}) as Record<string, unknown>;

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

    // Flags & pricing – useful indicators in list view
    have_milongas: Boolean(meta.have_milongas || rawEvent.have_milongas),
    have_tickets: Boolean(meta.have_tickets || rawEvent.have_tickets),
    have_food: Boolean(meta.have_food || rawEvent.have_food),
    have_sleep: Boolean(meta.have_sleep || rawEvent.have_sleep),
    have_registration: Boolean(meta.have_registration || rawEvent.have_registration),
    price: getString(meta.price || rawEvent.price),
    currency: getString(meta.currency || rawEvent.currency),

    // Add taxonomies if they exist
    taxonomies: rawEvent.taxonomies as EventTaxonomies,
  };

  return result;
};

export interface PaginatedEventsResponse {
  events: EventListItem[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ExtendedEventParams extends BaseParams, EventParams {}

class EventListService extends BaseService<EventListItem> {
  constructor() {
    super('/events', {
      meta_fields: LIST_META_FIELDS,
      include_taxonomies: true,
      _embed: true,
    });
  }

  /**
   * Override makeRequest to handle WordPress quirks and transformations
   */
  protected override async makeRequest<R = EventListItem>(
    path: string,
    params: BaseParams = {},
    signal?: AbortSignal,
  ): Promise<{ data: R; headers: Record<string, string> }> {
    const response = await super.makeRequest<unknown>(path, params, signal);

    // Handle WordPress REST API with _embed returning object instead of array
    const events = parseEventsResponse(response.data);
    const transformedEvents = events.map((event: unknown) =>
      transformRawEvent(event as Record<string, unknown>),
    );

    return {
      data: transformedEvents as R,
      headers: response.headers,
    };
  }

  /**
   * Fetch events with server-side pagination and filtering
   */
  async getEvents(params: ExtendedEventParams = {}): Promise<PaginatedEventsResponse> {
    const requestParams = {
      per_page: params.perPage || 20,
      page: params.page || 1,
      ...params,
    };

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
   * Fetch events for backward compatibility (returns just the events array)
   */
  async getEventsLegacy(params: ExtendedEventParams = {}): Promise<EventListItem[]> {
    const response = await this.getEvents(params);
    return response.events;
  }

  /**
   * Fetch additional pages for infinite scrolling / pagination.
   */
  async loadMoreEvents(
    page: number,
    params: Record<string, unknown> = {},
  ): Promise<EventListItem[]> {
    return this.loadMore(page, params);
  }

  /**
   * Search events by query
   */
  async searchEvents(query: string, params: ExtendedEventParams = {}): Promise<EventListItem[]> {
    const searchParams = {
      per_page: params.perPage || 10,
      page: params.page || 1,
      ...params,
    };

    return this.searchLegacy(query, searchParams);
  }
}

// Export singleton instance to maintain compatibility with existing code
export const eventListService = new EventListService();

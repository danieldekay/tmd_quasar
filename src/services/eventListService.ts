import { BaseService, type HALResponse } from './baseService';
import type { EventListItem, EventParams, EventTaxonomies } from './types';
import type { BaseParams } from './baseService';

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
 * Updated to handle v3 API response structure
 */
const transformRawEvent = (rawEvent: Record<string, unknown>): EventListItem => {
  // v3 API includes meta fields directly in the response
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

    // Add extracted taxonomies only if they exist
    ...(taxonomies && { taxonomies }),
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
   * Override extractDataFromResponse to apply event transformation
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
   * Legacy method for compatibility
   */
  async getEventsLegacy(params: ExtendedEventParams = {}): Promise<EventListItem[]> {
    const response = await this.getEvents(params);
    return response.events;
  }

  /**
   * Load more events for infinite scrolling
   */
  async loadMoreEvents(
    page: number,
    params: Record<string, unknown> = {},
  ): Promise<EventListItem[]> {
    const events = await this.loadMore(page, params);
    return events;
  }

  /**
   * Search events
   */
  async searchEvents(query: string, params: ExtendedEventParams = {}): Promise<EventListItem[]> {
    const response = await this.search(query, params);
    return response.data;
  }
}

// Export singleton instance to maintain compatibility with existing code
export const eventListService = new EventListService();

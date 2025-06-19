import { api } from '../boot/axios';
import type { EventListItem, EventParams, EventTaxonomies } from './types';

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

export const eventListService = {
  /**
   * Fetch the first page of events for list views.
   */
  async getEvents(params: EventParams = {}): Promise<EventListItem[]> {
    try {
      const response = await api.get('/events', {
        params: {
          meta_fields: LIST_META_FIELDS,
          include_taxonomies: true,
          _embed: true,
          ...params,
        },
      });

      const events = response.data as unknown[];
      return events.map((event: unknown) => transformRawEvent(event as Record<string, unknown>));
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  /**
   * Fetch additional pages for infinite scrolling / pagination.
   */
  async loadMoreEvents(
    page: number,
    params: Record<string, unknown> = {},
  ): Promise<EventListItem[]> {
    try {
      const response = await api.get('/events', {
        params: {
          meta_fields: LIST_META_FIELDS,
          include_taxonomies: true,
          page,
          ...params,
        },
      });

      const events = response.data as unknown[];
      return events.map((event: unknown) => transformRawEvent(event as Record<string, unknown>));
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  /**
   * Search events by query
   */
  async searchEvents(query: string, params: EventParams = {}): Promise<EventListItem[]> {
    try {
      const response = await api.get('/events', {
        params: {
          search: query,
          per_page: params.perPage || 10,
          page: params.page || 1,
          meta_fields: LIST_META_FIELDS,
          _embed: true,
        },
      });

      const events = response.data as unknown[];
      return events.map((event: unknown) => transformRawEvent(event as Record<string, unknown>));
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },
};

import { api } from '../boot/axios';
import type { EventListItem, EventParams } from './types';

// Select only the meta-fields required for the list view to reduce payload size
const REQUIRED_META_FIELDS = [
  'city',
  'country',
  'event_category',
  'start_date',
  'end_date',
  'registration_start_date',
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
const transformRawEvent = (rawEvent: Record<string, unknown>): EventListItem => ({
  id: Number(rawEvent.id) || 0,
  title: getString(rawEvent.title),
  date: getString(rawEvent.date),
  link: getString(rawEvent.link),
  start_date: getString(rawEvent.start_date),
  end_date: getString(rawEvent.end_date),
  registration_start_date: getString(rawEvent.registration_start_date),
  edition: getString(rawEvent.edition),
  event_name: getString(rawEvent.event_name || rawEvent.title),
  event_category: getString(rawEvent.event_category),
  featured_image: getString(rawEvent.featured_image),
  city: getString(rawEvent.city),
  country: getString(rawEvent.country),
  // Flags & pricing – useful indicators in list view
  have_milongas: Boolean(rawEvent.have_milongas),
  have_tickets: Boolean(rawEvent.have_tickets),
  have_food: Boolean(rawEvent.have_food),
  have_sleep: Boolean(rawEvent.have_sleep),
  have_registration: Boolean(rawEvent.have_registration),
  price: getString(rawEvent.price),
  currency: getString(rawEvent.currency),
});

export const eventListService = {
  /**
   * Fetch the first page of events for list views.
   */
  async getEvents(params: EventParams = {}): Promise<EventListItem[]> {
    const {
      page = 1,
      perPage = 100,
      country,
      start_date_from,
      start_date_to,
      registration_start_date_from,
      registration_start_date_to,
    } = params;

    const queryParams = new URLSearchParams({
      per_page: perPage.toString(),
      page: page.toString(),
      orderby: 'start_date',
      order: 'desc',
      meta_fields: REQUIRED_META_FIELDS,
      // Ask WordPress REST API to only include the requested fields to keep the response small
      _fields:
        'id,title,date,link,start_date,end_date,registration_start_date,edition,event_name,event_category,featured_image,city,country,have_milongas,have_tickets,have_food,have_sleep,have_registration,price,currency',
    });

    if (country) queryParams.append('country', country);
    if (start_date_from) queryParams.append('start_date_from', start_date_from);
    if (start_date_to) queryParams.append('start_date_to', start_date_to);
    if (registration_start_date_from)
      queryParams.append('registration_start_date_from', registration_start_date_from);
    if (registration_start_date_to)
      queryParams.append('registration_start_date_to', registration_start_date_to);

    try {
      const response = await api.get(`events?${queryParams.toString()}`);
      return (response.data as unknown[]).map((e) =>
        transformRawEvent(e as Record<string, unknown>),
      );
    } catch (error) {
      console.error('Error fetching events:', error);
      throw new Error('API Error');
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
          per_page: 100,
          page,
          orderby: 'start_date',
          order: 'desc',
          meta_fields: REQUIRED_META_FIELDS,
          _fields:
            'id,title,date,link,start_date,end_date,registration_start_date,edition,event_name,event_category,featured_image,city,country,have_milongas,have_tickets,have_food,have_sleep,have_registration,price,currency',
          ...params,
        },
        timeout: 50000,
      });

      const events = Array.isArray(response.data) ? response.data : [];
      return events.map((event: Record<string, unknown>) => transformRawEvent(event));
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
          meta_fields: REQUIRED_META_FIELDS,
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

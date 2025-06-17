import { api } from '../boot/axios';
import type { EventDetails } from './types';

// We still specify meta-fields to ensure we receive all custom meta, but we do not limit the core fields
const REQUIRED_META_FIELDS = [
  'city',
  'country',
  'event_category',
  'start_date',
  'end_date',
  'registration_start_date',
  'month',
  'weekend',
].join(',');

/**
 * Shared utility to coerce any value returned by WordPress into a string.
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
 * Transform a raw WordPress event into our rich EventDetails structure.
 */
const transformRawEvent = (rawEvent: Record<string, unknown>): EventDetails => ({
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
  event_description: getString(
    rawEvent.event_description || (rawEvent.content as Record<string, unknown>)?.rendered,
  ),
  post_content: getString(
    rawEvent.post_content || (rawEvent.content as Record<string, unknown>)?.rendered,
  ),
  featured_image: getString(rawEvent.featured_image),
  city: getString(rawEvent.city),
  country: getString(rawEvent.country),
  website: getString(rawEvent.website),
  email: getString(rawEvent.email),
  facebook_event: getString(rawEvent.facebook_event),
  facebook_page: getString(rawEvent.facebook_page),
  have_milongas: Boolean(Number(rawEvent.have_milongas)),
  have_tickets: Boolean(Number(rawEvent.have_tickets)),
  have_food: Boolean(Number(rawEvent.have_food)),
  have_sleep: Boolean(Number(rawEvent.have_sleep)),
  food_options: getString(rawEvent.food_options),
  sleeping_options: getString(rawEvent.sleeping_options),
  have_registration: Boolean(Number(rawEvent.have_registration)),
  have_registration_mode: getString(rawEvent.have_registration_mode),
  role_balanced: Boolean(Number(rawEvent.role_balanced)),
  invitation_only: Boolean(Number(rawEvent.invitation_only)),
  price: getString(rawEvent.price),
  currency: getString(rawEvent.currency),
  number_of_participants: Number(rawEvent.number_of_participants) || 0,
  music_hours: getString(rawEvent.music_hours),
  venue_name: getString(rawEvent['venue-name'] ?? rawEvent.venue_name),
  street: getString(rawEvent.street),
  venue_features: getString(rawEvent.venue_features),
  type_of_floor: getString(rawEvent.type_of_floor),
  facebook_group: getString(rawEvent.facebook_group),
  have_separated_seating: Boolean(Number(rawEvent.have_separated_seating)),
  have_folklore: Boolean(Number(rawEvent.have_folklore)),
  have_non_tango: Boolean(Number(rawEvent.have_non_tango)),
  have_services: Boolean(Number(rawEvent.have_services)),
  service_options: getString(rawEvent.service_options),
  have_sales: Boolean(Number(rawEvent.have_sales)),
  lat: Number(rawEvent.lat) || 0,
  lon: Number(rawEvent.lon) || 0,
  meta_box: {
    have_live_music: Boolean(Number(rawEvent.have_live_music)),
    have_lessons: Boolean(Number(rawEvent.have_lessons)),
    have_show: Boolean(Number(rawEvent.have_show)),
  },
});

const eventCache = new Map<number, EventDetails>();

export const eventDetailsService = {
  /**
   * Retrieve a single event. Responses are cached in-memory.
   */
  async getEvent(id: number): Promise<EventDetails> {
    try {
      if (eventCache.has(id)) {
        return eventCache.get(id) as EventDetails;
      }

      const response = await api.get(`/events/${id}`, {
        params: {
          _embed: true,
          meta_fields: REQUIRED_META_FIELDS,
        },
      });

      const transformed = transformRawEvent(response.data as Record<string, unknown>);
      eventCache.set(id, transformed);
      return transformed;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  /**
   * Update an existing event via REST API and refresh cache.
   */
  async updateEvent(id: number, data: Partial<EventDetails>): Promise<EventDetails> {
    try {
      const response = await api.put(`/events/${id}`, data);
      const transformed = transformRawEvent(response.data as Record<string, unknown>);
      eventCache.set(id, transformed);
      return transformed;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },
};

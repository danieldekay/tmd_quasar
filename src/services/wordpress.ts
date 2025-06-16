import { api } from '../boot/axios';

export type Event = {
  id: number;
  title: string;
  date: string;
  link: string;
  start_date: string;
  registration_start_date: string;
  edition: string;
};

export interface DJ {
  id: number;
  title: {
    rendered: string;
  };
  content: {
    rendered: string;
  };
  acf?: {
    bio: string;
    photo: string;
    website: string;
  };
}

export interface Teacher {
  id: number;
  title: {
    rendered: string;
  };
  content: {
    rendered: string;
  };
  acf?: {
    bio: string;
    photo: string;
    website: string;
    teaching_style: string;
  };
}

export interface RawEvent {
  event_name?: string;
  title?: string;
  post_content?: string;
  description?: string;
  featured_image?: string;
  _embedded?: {
    'wp:featuredmedia'?: Array<{
      source_url: string;
    }>;
    'wp:term'?: Array<Array<{ name: string }>>;
  };
  'event-categories-2020'?: Array<{
    name: string;
  }>;
  event_category?: string;
  meta_box?: {
    djs_to_events_from?: Array<{
      title: string;
    }>;
    teachers_to_events_from?: Array<{
      title: string;
    }>;
  };
  djs?: string;
  teachers?: string;
  city?: string;
  country?: string;
  start_date?: string;
  end_date?: string;
  [key: string]: unknown;
}

const eventCache = new Map<number, Event>();

const REQUIRED_META_FIELDS = [
  'city',
  'country',
  'event_category',
  'start_date',
  'end_date',
  'registration_start_date',
  // add more fields as needed
].join(',');

interface EventParams {
  page?: number;
  perPage?: number;
  country?: string | undefined;
  start_date_from?: string | undefined;
  start_date_to?: string | undefined;
  registration_start_date_from?: string | undefined;
  registration_start_date_to?: string | undefined;
}

export const wordpressService = {
  async getEvents(params: EventParams = {}): Promise<Event[]> {
    try {
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
        meta_fields: 'all',
      });

      if (country) {
        queryParams.append('country', country);
      }
      if (start_date_from) {
        queryParams.append('start_date_from', start_date_from);
      }
      if (start_date_to) {
        queryParams.append('start_date_to', start_date_to);
      }
      if (registration_start_date_from) {
        queryParams.append('registration_start_date_from', registration_start_date_from);
      }
      if (registration_start_date_to) {
        queryParams.append('registration_start_date_to', registration_start_date_to);
      }

      const response = await api.get(`events?${queryParams.toString()}`);
      // Specify the type as unknown[] and map to Event
      return (response.data as unknown[]).map((e) => ({
        id: (e as Record<string, unknown>).id as number,
        title: (e as Record<string, unknown>).title as string,
        date: (e as Record<string, unknown>).date as string,
        link: (e as Record<string, unknown>).link as string,
        start_date: (e as Record<string, unknown>).start_date as string,
        registration_start_date: (e as Record<string, unknown>).registration_start_date as string,
        edition: (e as Record<string, unknown>).edition as string,
      }));
    } catch (error) {
      console.error('Error fetching events:', error);
      throw new Error('API Error');
    }
  },

  async loadMoreEvents(page: number, params = {}) {
    try {
      const response = await api.get('/events', {
        params: {
          per_page: 100,
          page,
          orderby: 'start_date',
          order: 'desc',
          meta_fields: REQUIRED_META_FIELDS,
          ...params,
        },
        timeout: 50000,
      });

      const events = Array.isArray(response.data) ? response.data : [];
      return events.map((event: RawEvent) => ({
        ...event,
        title: event.title || '',
        description: event.description || event.post_content || '',
        featured_image: event.featured_image || '',
        event_category: event.event_category || '',
        djs: event.djs || '',
        teachers: event.teachers || '',
        city: event.city || '',
        country: event.country || '',
        start_date: event.start_date || '',
        end_date: event.end_date || '',
        registration_start_date: event.registration_start_date || '',
      })) as Event[];
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  async getEvent(id: number) {
    try {
      // Check if event is already in cache
      if (eventCache.has(id)) {
        return eventCache.get(id) as Event;
      }

      const response = await api.get(`/events/${id}`, {
        params: {
          _embed: true,
        },
      });

      // Store in cache before returning
      eventCache.set(id, response.data);
      return response.data as Event;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  async updateEvent(id: number, data: Partial<Event>) {
    try {
      const response = await api.put(`/events/${id}`, data);
      return response.data as Event;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  async getDJs(params = {}) {
    try {
      const response = await api.get('/djs', {
        params: {
          _embed: true,
          ...params,
        },
      });
      return response.data as DJ[];
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  async getDJ(id: number) {
    try {
      const response = await api.get(`/djs/${id}`, {
        params: {
          _embed: true,
        },
      });
      return response.data as DJ;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  async getTeachers(params = {}) {
    try {
      const response = await api.get('/teachers', {
        params: {
          _embed: true,
          ...params,
        },
      });
      return response.data as Teacher[];
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  async getTeacher(id: number) {
    try {
      const response = await api.get(`/teachers/${id}`, {
        params: {
          _embed: true,
        },
      });
      return response.data as Teacher;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },
};

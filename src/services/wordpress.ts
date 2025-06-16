import { api } from '../boot/axios';

export type Event = {
  id: number;
  date: string;
  date_gmt: string;
  guid: {
    rendered: string;
  };
  modified: string;
  modified_gmt: string;
  slug: string;
  status: string;
  type: string;
  link: string;
  author: number;
  featured_media: number;
  template: string;
  title: string;
  description?: string;
  featured_image?: string;
  event_category: string;
  djs: string;
  teachers: string;
  max_participants?: number;
  registered_count?: number;
  schedule?: Array<{
    time: string;
    title: string;
    description: string;
  }>;
  meta: {
    _genesis_hide_title: boolean;
    _genesis_hide_breadcrumbs: boolean;
    _genesis_hide_singular_image: boolean;
    _genesis_hide_footer_widgets: boolean;
    _genesis_custom_body_class: string;
    _genesis_custom_post_class: string;
    _genesis_layout: string;
    activitypub_content_warning: string;
    activitypub_content_visibility: string;
    activitypub_max_image_attachments: number;
    event_bridge_for_activitypub_reminder_time_gap: number;
  };
  'event-categories-2020': Array<{
    id: number;
    name: string;
    slug: string;
  }>;
  class_list: string[];
  edition: string;
  event_name: string;
  start_date: string;
  end_date: string;
  city: string;
  country: string;
  facebook_event: string;
  facebook_group: string;
  facebook_page: string;
  website: string;
  email: string;
  have_registration: string;
  have_registration_mode: string;
  registration_start_date: string;
  role_balanced: string;
  invitation_only: string;
  have_milongas: string;
  have_tickets: string;
  have_food: string;
  food_options: string;
  have_sleep: string;
  sleeping_options: string;
  have_services: string;
  service_options: string;
  have_sales: string;
  lat: string;
  lon: string;
  price: string;
  currency: string;
  number_of_participants: string;
  music_hours: string;
  post_content: string;
  month: string;
  weekend: string;
  meta_box: {
    urgent_change_status: string;
    edition: string;
    event_name: string;
    event_category: boolean;
    start_date: string;
    end_date: string;
    role_balanced: string;
    invitation_only: string;
    have_registration: string;
    have_registration_mode: string;
    registration_start_date: string;
    post_content: string;
    country: string;
    city: string;
    'venue-name': string;
    street: string;
    website: string;
    email: string;
    facebook_event: string;
    facebook_group: string;
    facebook_page: string;
    price: string;
    currency: string;
    number_of_participants: string;
    music_hours: string;
    type_of_floor: string;
    venue_features: string[];
    have_milongas: string;
    have_tickets: string;
    have_live_music: string;
    have_lessons: string;
    have_show: string;
    have_separated_seating: string;
    have_folklore: string;
    have_non_tango: string;
    have_food: string;
    food_options: string[];
    have_sleep: string;
    sleeping_options: string[];
    have_services: string;
    service_options: string[];
    have_sales: string;
    shopping_options: string[];
    tmd_openai_summary: string;
    tmd_openai_djs: string;
    tmd_openai_people: string;
    teachers_to_events_from: Array<{
      id: number;
      title: string;
      link: string;
    }>;
    couples_to_events_from: Array<{
      id: number;
      title: string;
      link: string;
    }>;
    event_series_to_events_from: Array<{
      id: number;
      title: string;
      link: string;
    }>;
    djs_to_events_from: Array<{
      id: number;
      title: string;
      link: string;
    }>;
    orchestras_to_events_from: Array<{
      id: number;
      title: string;
      link: string;
    }>;
    brands_to_events_from: Array<{
      id: number;
      title: string;
      link: string;
    }>;
  };
  _links: {
    self: Array<{ href: string; targetHints?: { allow: string[] } }>;
    collection: Array<{ href: string }>;
    about: Array<{ href: string }>;
    author: Array<{ embeddable: boolean; href: string }>;
    'version-history': Array<{ count: number; href: string }>;
    'wp:attachment': Array<{ href: string }>;
    'wp:term': Array<{ taxonomy: string; embeddable: boolean; href: string }>;
    curies: Array<{ name: string; href: string; templated: boolean }>;
  };
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

export const wordpressService = {
  async getEvents(params = {}) {
    try {
      const response = await api.get('/events', {
        params: {
          per_page: 100,
          page: 1,
          orderby: 'start_date',
          order: 'desc',
          meta_fields:
            'event_name,city,country,facebook_event,facebook_page,website,email,have_milongas,have_tickets,have_food,food_options,have_sleep,sleeping_options,have_registration,have_registration_mode,registration_start_date,role_balanced,invitation_only,price,currency,number_of_participants,music_hours,lat,lon',
          ...params,
        },
        timeout: 50000,
      });

      const events = Array.isArray(response.data) ? response.data : [];
      return events.map((event: RawEvent) => ({
        ...event,
        title: event.event_name || event.title || '',
        description: event.post_content || event.description || '',
        featured_image: event.featured_image || '',
        event_category: event['event-categories-2020']?.[0]?.name || event.event_category || '',
        djs: event.djs || '',
        teachers: event.teachers || '',
        city: event.city || '',
        country: event.country || '',
        start_date: event.start_date || '',
        end_date: event.end_date || '',
      })) as Event[];
    } catch (error) {
      console.error('API Error:', error);
      throw error;
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
          meta_fields:
            'event_name,city,country,facebook_event,facebook_page,website,email,have_milongas,have_tickets,have_food,food_options,have_sleep,sleeping_options,have_registration,have_registration_mode,registration_start_date,role_balanced,invitation_only,price,currency,number_of_participants,music_hours,lat,lon',
          ...params,
        },
        timeout: 50000,
      });

      const events = Array.isArray(response.data) ? response.data : [];
      return events.map((event: RawEvent) => ({
        ...event,
        title: event.event_name || event.title || '',
        description: event.post_content || event.description || '',
        featured_image: event.featured_image || '',
        event_category: event['event-categories-2020']?.[0]?.name || event.event_category || '',
        djs: event.djs || '',
        teachers: event.teachers || '',
        city: event.city || '',
        country: event.country || '',
        start_date: event.start_date || '',
        end_date: event.end_date || '',
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

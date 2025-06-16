import { api } from '../boot/axios';

export type Event = {
  id: number;
  title: string;
  start_date: string;
  start: string;
  end_date: string;
  end: string;
  allDay: boolean;
  registration_start_date: string;
  country: string;
  city: string;
  link: string;
  url: string;
  event_category: string;
  djs: string;
  teachers: string;
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

export const wordpressService = {
  async getEvents(params = {}) {
    try {
      const response = await api.get('/tmd/v2/events', {
        params: {
          _embed: true,
          ...params,
        },
      });
      return Array.isArray(response.data.data) ? (response.data.data as Event[]) : [];
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  async getEvent(id: number) {
    try {
      const response = await api.get(`/tmd/v2/events/${id}`, {
        params: {
          _embed: true,
        },
      });
      return response.data as Event;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  async getDJs(params = {}) {
    try {
      const response = await api.get('/wp/v2/tmd_dj', {
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
      const response = await api.get(`/wp/v2/tmd_dj/${id}`, {
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
      const response = await api.get('/wp/v2/tmd_teacher', {
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
      const response = await api.get(`/wp/v2/tmd_teacher/${id}`, {
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

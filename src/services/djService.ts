import { api } from '../boot/axios';
import type { DJ } from './types';
import type { AxiosRequestConfig } from 'axios';

// Essential meta fields for table view (reduced from 20 to 8 for better performance)
const ESSENTIAL_DJ_META_FIELDS = [
  'tmd_dj_name',
  'tmd_dj_country',
  'tmd_dj_activity_marathons',
  'tmd_dj_activity_festivals',
  'tmd_dj_activity_encuentros',
  'tmd_dj_activity_milongas',
  'tmd_dj_activity_milongas_travel',
  'tmd_dj_webpage',
].join(',');

// All meta fields for detail view
const ALL_DJ_META_FIELDS = [
  'abstract',
  'gender',
  'tmd_dj_about_the_dj',
  'tmd_dj_activity_encuentros',
  'tmd_dj_activity_encuentros_since',
  'tmd_dj_activity_festivals',
  'tmd_dj_activity_festivals_since',
  'tmd_dj_activity_marathons',
  'tmd_dj_activity_marathons_since',
  'tmd_dj_activity_milongas',
  'tmd_dj_activity_milongas_since',
  'tmd_dj_activity_milongas_travel',
  'tmd_dj_activity_milongas_travel_since',
  'tmd_dj_city',
  'tmd_dj_country',
  'tmd_dj_e_mail',
  'tmd_dj_link_to_facebook',
  'tmd_dj_link_to_facebook_page',
  'tmd_dj_name',
  'tmd_dj_webpage',
].join(',');

export interface DJParams {
  page?: number;
  per_page?: number;
  search?: string;
  country?: string;
  orderby?: string;
  order?: 'asc' | 'desc';
}

export const djService = {
  async getDJs(params: DJParams = {}, signal?: AbortSignal) {
    try {
      const apiParams: Record<string, string | number | boolean> = {
        _embed: false, // Disable embeds for better performance
        meta_fields: ESSENTIAL_DJ_META_FIELDS, // Use essential fields only
      };

      // Handle country filtering using meta_key/meta_value
      if (params.country) {
        apiParams.meta_key = 'tmd_dj_country';
        apiParams.meta_value = params.country;
      }

      // Add other parameters
      if (params.page) apiParams.page = params.page;
      if (params.per_page) apiParams.per_page = params.per_page;
      if (params.search) apiParams.search = params.search;
      if (params.orderby) apiParams.orderby = params.orderby;
      if (params.order) apiParams.order = params.order;

      const requestConfig: AxiosRequestConfig = {
        params: apiParams,
      };

      if (signal) {
        requestConfig.signal = signal;
      }

      const response = await api.get('/djs', requestConfig);

      return {
        djs: response.data as DJ[],
        totalPages: parseInt(response.headers['x-wp-totalpages'] || '1'),
        total: parseInt(response.headers['x-wp-total'] || '0'),
      };
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  async getDJ(id: number, signal?: AbortSignal) {
    try {
      const requestConfig: AxiosRequestConfig = {
        params: {
          _embed: true, // Full embeds for detail view
          meta_fields: ALL_DJ_META_FIELDS, // All fields for detail view
        },
      };

      if (signal) {
        requestConfig.signal = signal;
      }

      const response = await api.get(`/djs/${id}`, requestConfig);
      return response.data as DJ;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },
};

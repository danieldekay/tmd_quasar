import type { Event } from '../services/wordpress';

export interface EventViewState {
  events: Event[];
  loading: boolean;
  error: string | null;
  viewMode: 'table' | 'card';
  searchQuery: string;
  filters: {
    eventType: string[];
    country: string[];
    dateRange: {
      start: string | null;
      end: string | null;
    };
  };
  pagination: {
    page: number;
    rowsPerPage: number;
    total: number;
  };
  sortBy: {
    field: keyof Event | 'acf.start_date' | 'acf.end_date' | 'acf.location' | 'acf.country';
    direction: 'asc' | 'desc';
  };
}

export interface EventTableColumn {
  name: string;
  label: string;
  field: keyof Event | ((row: Event) => string | number | boolean | null);
  sortable?: boolean;
  align?: 'left' | 'right' | 'center';
  format?: (val: string | number | boolean | null) => string;
  style?: string;
}

export interface EventCardProps {
  event: Event;
  onClick?: (event: Event) => void;
}

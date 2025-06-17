import type { EventListItem } from '../services/types';

export interface EventViewState {
  events: EventListItem[];
  loading: boolean;
  error: string | null;
  searchQuery: string;
  selectedCountry: string | null;
  selectedDateRange: {
    from: string | null;
    to: string | null;
  };
  pagination: {
    page: number;
    rowsPerPage: number;
    rowsNumber: number;
  };
}

export interface EventTableColumn {
  name: string;
  label: string;
  field: string | ((row: EventListItem) => string | number | boolean | null);
  required?: boolean;
  align?: 'left' | 'right' | 'center';
  sortable?: boolean;
  sort?: (
    a: string | number | boolean | null,
    b: string | number | boolean | null,
    rowA: EventListItem,
    rowB: EventListItem,
  ) => number;
  format?: (val: string | number | boolean | null, row: EventListItem) => string;
  style?: string;
  classes?: string;
  headerStyle?: string;
  headerClasses?: string;
}

export interface EventCardProps {
  event: EventListItem;
  onClick?: (event: EventListItem) => void;
}

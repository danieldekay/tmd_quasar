/**
 * Test Utilities - Mock Factories
 *
 * Factory functions for creating properly typed mock data for testing.
 * These factories provide sensible defaults while allowing overrides for specific test cases.
 *
 * Usage:
 *   const mockEvent = createMockEvent({ title: 'Custom Title' });
 *   const mockEvents = createMockEventList(5); // Creates 5 mock events
 */

import type { DJ, Teacher, Couple, EventSeries } from 'src/services/types';
import type { PaginatedEventsResponse } from '../services/eventListService';

/**
 * Create a mock event with sensible defaults
 */
export function createMockEvent(overrides: Partial<EventListItem> = {}): EventListItem {
  const defaults: EventListItem = {
    id: 1,
    title: 'Berlin Tango Marathon 2025',
    date: '2025-05-15',
    link: 'https://example.com/event/1',
    start_date: '2025-05-15',
    end_date: '2025-05-18',
    city: 'Berlin',
    country: 'DE',
    edition: '12',
    registration_start_date: '2025-03-01',
    taxonomies: {
      'event-categories-2020': [{ id: 1, name: 'Marathon', slug: 'marathon', description: '' }],
    },
    // Optional fields that might be present
    venue_name: 'Berlin Dance Center',
    currency: 'EUR',
    price: '150-200',
  };

  return { ...defaults, ...overrides };
}

/**
 * Create multiple mock events with varied data
 */
export function createMockEventList(count: number): EventListItem[] {
  const cities = ['Berlin', 'Munich', 'Hamburg', 'Cologne', 'Frankfurt'];
  const countries = ['DE', 'AT', 'CH', 'FR', 'IT'];
  const categories = [
    { id: 1, name: 'Marathon', slug: 'marathon', description: '' },
    { id: 2, name: 'Festival', slug: 'festival', description: '' },
    { id: 3, name: 'Encuentro', slug: 'encuentro', description: '' },
    { id: 4, name: 'Workshop', slug: 'workshop', description: '' },
  ];

  return Array.from({ length: count }, (_, index) => {
    const id = index + 1;
    const date = new Date(2025, 4 + index, 15); // May 15, June 15, etc.
    const categoryIndex = index % categories.length;
    const category = categories[categoryIndex];
    const city = cities[index % cities.length];
    const country = countries[index % countries.length];

    if (city === undefined || country === undefined || category === undefined) {
      throw new Error('Mock data generation failed - invalid index');
    }

    return createMockEvent({
      id,
      title: `Event ${id}`,
      start_date: date.toISOString().split('T')[0] ?? '',
      end_date:
        new Date(date.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] ?? '',
      city,
      country,
      edition: String(index + 1),
      registration_start_date:
        new Date(date.getTime() - 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] ?? '',
      taxonomies: {
        'event-categories-2020': [category],
      },
    });
  });
}

/**
 * Create a mock paginated events response
 */
export function createMockEventsResponse(
  events: EventListItem[],
  overrides: Partial<PaginatedEventsResponse> = {},
): PaginatedEventsResponse {
  const defaults: PaginatedEventsResponse = {
    events,
    totalCount: events.length,
    currentPage: 1,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  };

  return { ...defaults, ...overrides };
}

/**
 * Create a mock DJ with sensible defaults
 */
export function createMockDJ(overrides: Partial<DJ> = {}): DJ {
  const defaults: DJ = {
    id: 1,
    title: 'Test DJ 1',
    date: '2024-01-01T00:00:00',
    link: 'https://example.com/dj/1',
    tmd_dj_name: 'Test DJ 1',
    tmd_dj_city: 'Berlin',
    tmd_dj_country: 'DE',
    tmd_dj_about_the_dj: 'Experienced DJ with passion for traditional tango music.',
    tmd_dj_activity_marathons: '1',
    tmd_dj_activity_festivals: '0',
    tmd_dj_activity_encuentros: '0',
    tmd_dj_activity_milongas: '1',
    tmd_dj_activity_marathons_since: '2015',
    tmd_dj_activity_milongas_since: '2010',
  };

  return { ...defaults, ...overrides };
}

/**
 * Create a mock Teacher with sensible defaults
 */
export function createMockTeacher(overrides: Partial<Teacher> = {}): Teacher {
  const defaults: Teacher = {
    id: 1,
    title: 'Test Teacher 1',
    date: '2024-01-01T00:00:00',
    link: 'https://example.com/teacher/1',
    city: 'Buenos Aires',
    country: 'AR',
    meta_box: {
      first_name: 'Test',
      last_name: 'Teacher',
      role: 'both',
      teaching_since: '2010',
      dancing_since: '2005',
    },
  };

  return { ...defaults, ...overrides };
}

/**
 * Create a mock Couple object
 */
export function createMockCouple(overrides?: Partial<Couple>): Couple {
  return {
    id: 301,
    title: 'Test Couple',
    date: '2024-01-15T10:00:00',
    link: 'https://tangomarathons.com/couples/test-couple',
    city: 'Buenos Aires',
    country: 'AR',
    leader_id: 201,
    leader_name: 'Test Leader',
    follower_id: 202,
    follower_name: 'Test Follower',
    meta_box: {
      partnership_started: '2020-01-01',
      partnership_style: 'Milonguero',
      bio_couple: 'Test couple biography',
    },
    ...overrides,
  };
}

/**
 * Create a mock EventSeries object
 */
export function createMockEventSeries(overrides?: Partial<EventSeries>): EventSeries {
  return {
    id: 401,
    title: 'Test Event Series',
    date: '2024-01-01T00:00:00',
    link: 'https://tangomarathons.com/event-series/test-series',
    slug: 'test-event-series',
    city: 'Berlin',
    country: 'DE',
    start_date: '2024-06-15T09:00:00',
    registration_start_date: '2024-03-01T00:00:00',
    website: 'https://example.com',
    content: {
      rendered: '<p>Test series description</p>',
    },
    acf: {
      description: 'Test series ACF description',
      website: 'https://example.com',
      logo: 'https://example.com/logo.png',
    },
    dj_statistics: {
      total_djs: 10,
      unique_djs: 8,
      dj_list: [
        {
          id: 101,
          name: 'Test DJ',
          city: 'Berlin',
          country: 'DE',
          appearances: 3,
          years: ['2022', '2023', '2024'],
        },
      ],
    },
    ...overrides,
  };
}

// TODO: Add EventSeries mock factory when needed

/**
 * Create mock taxonomies
 */
export function createMockTaxonomies(overrides: Partial<EventTaxonomies> = {}): EventTaxonomies {
  const defaults: EventTaxonomies = {
    'event-categories-2020': [{ id: 1, name: 'Marathon', slug: 'marathon', description: '' }],
  };

  return { ...defaults, ...overrides };
}

/**
 * Generate a range of ISO dates starting from a base date
 */
export function generateDateRange(
  startDate: string,
  count: number,
  intervalDays: number = 30,
): string[] {
  const dates: string[] = [];
  const baseDate = new Date(startDate);

  for (let i = 0; i < count; i++) {
    const date = new Date(baseDate.getTime() + i * intervalDays * 24 * 60 * 60 * 1000);
    const isoDate = date.toISOString().split('T')[0];
    if (isoDate !== undefined) {
      dates.push(isoDate);
    }
  }

  return dates;
}

/**
 * Create mock error responses
 */
export function createMockError(message: string, code?: string): Error & { code?: string } {
  const error = new Error(message) as Error & { code?: string };
  if (code !== undefined) {
    error.code = code;
  }
  return error;
}

/**
 * Create mock network error
 */
export function createNetworkError() {
  return createMockError('Network Error', 'ERR_NETWORK');
}

/**
 * Create mock HTTP error
 */
export function createHttpError(
  status: number,
  statusText: string,
): Error & {
  code?: string;
  response?: { status: number; statusText: string; data: { message: string } };
} {
  const error = createMockError(`Request failed with status ${status}`, 'ERR_HTTP') as Error & {
    code?: string;
    response?: { status: number; statusText: string; data: { message: string } };
  };
  error.response = {
    status,
    statusText,
    data: { message: statusText },
  };
  return error;
}

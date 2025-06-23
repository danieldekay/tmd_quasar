import { describe, it, expect, vi, beforeEach } from 'vitest';
import { eventListService } from '../eventListService';
import type { EventListItem } from '../types';
import type {
  EnhancedEventParams as ExtendedEventParams,
  PaginatedEventsResponse,
} from '../eventListService';
import axios from 'axios';

// Mock the axios module
vi.mock('axios');
const mockedAxios = vi.mocked(axios, true);

describe('EventListService', () => {
  beforeEach(() => {
    // Reset mocks before each test
    vi.resetAllMocks();
  });

  const mockRawEvent1 = {
    id: 1,
    title: { rendered: 'Event One' },
    date: '2024-01-01T00:00:00',
    link: 'http://example.com/event-one',
    meta: {
      start_date: '2024-07-01',
      end_date: '2024-07-03',
      city: 'Test City',
      country: 'TC',
      event_name: 'The First Event',
      venue_name: '',
    },
    _embedded: {
      'wp:term': [
        [
          {
            id: 10,
            taxonomy: 'event-categories-2020',
            name: 'Marathon',
            slug: 'marathon',
          },
        ],
      ],
    },
  };

  const mockTransformedEvent1: EventListItem = {
    id: 1,
    title: 'Event One',
    date: '2024-01-01T00:00:00',
    link: 'http://example.com/event-one',
    start_date: '2024-07-01',
    end_date: '2024-07-03',
    registration_start_date: '',
    edition: '',
    event_name: 'The First Event',
    event_category: 'Marathon',
    featured_image: '',
    city: 'Test City',
    country: 'TC',
    venue_name: '',
    have_milongas: false,
    have_tickets: false,
    have_food: false,
    have_sleep: false,
    have_registration: false,
    price: '',
    currency: '',
    taxonomies: {
      'event-categories-2020': [{ id: 10, name: 'Marathon', slug: 'marathon', description: '' }],
    },
  };

  describe('getEvents', () => {
    it('should call axios and transform events correctly', async () => {
      // Setup mock response for axios
      const mockApiResponse = {
        data: [mockRawEvent1],
        headers: {
          'x-wp-total': '10',
          'x-wp-totalpages': '2',
        },
      };
      mockedAxios.get.mockResolvedValue(mockApiResponse);

      const params: ExtendedEventParams = {
        page: 1,
        perPage: 5,
        orderby: 'start_date',
        order: 'asc',
      };
      const result: PaginatedEventsResponse = await eventListService.getEvents(params);

      // Assert that axios was called with the correct URL and essential params
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockedAxios.get).toHaveBeenCalledWith('/events', {
        params: expect.objectContaining({
          page: 1,
          per_page: 5,
          orderby: 'start_date',
          order: 'asc',
        }),
      });

      // Assert that the transformation happened correctly
      expect(result.events).toEqual([mockTransformedEvent1]);
      expect(result.totalCount).toBe(10);
      expect(result.totalPages).toBe(2);
    });

    it.skip('should handle API errors from axios gracefully', async () => {
      const apiError = new Error('API Error 500');
      mockedAxios.get.mockRejectedValue(apiError);

      const params: ExtendedEventParams = { page: 1, perPage: 5 };
      await expect(eventListService.getEvents(params)).rejects.toThrow('API Error 500');
    });
  });

  describe('searchEvents', () => {
    it('should call axios with correct search parameters', async () => {
      const mockApiResponse = {
        data: [mockRawEvent1],
        headers: { 'x-wp-total': '1', 'x-wp-totalpages': '1' },
      };
      mockedAxios.get.mockResolvedValue(mockApiResponse);

      const query = 'findme';
      const params: ExtendedEventParams = {
        perPage: 5,
        page: 1,
        orderby: 'start_date',
        order: 'asc',
      };
      const result = await eventListService.searchEvents(query, params);

      // Assert that axios was called with the correct URL and params
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockedAxios.get).toHaveBeenCalledWith(
        '/events',
        expect.objectContaining({
          params: expect.objectContaining({
            search: query,
            per_page: 5,
            page: 1,
          }),
        }),
      );

      // Event category is now derived from taxonomies when not present in meta
      expect(result).toEqual([mockTransformedEvent1]);
    });
  });
});

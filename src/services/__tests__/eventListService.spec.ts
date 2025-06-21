import { describe, it, expect, vi, beforeEach } from 'vitest';
import { eventListService } from '@/services/eventListService'; // Vitest will use the mock from __mocks__
import { baseServiceMocks, resetBaseServiceMocks } from './serviceMocks';
import type { EventListItem } from '@/services/types'; // Assuming types are in @/services/types
import type { ExtendedEventParams, PaginatedEventsResponse } from '@/services/eventListService';

// Explicitly tell Vitest to use the manual mock for 'boot/axios'.
// This assumes Quasar might resolve 'boot/axios' and Vitest needs to match this.
// Vitest should then look for 'src/boot/__mocks__/axios.ts' if 'boot' is aliased to 'src/boot'.
vi.mock('boot/axios');

describe('EventListService', () => {
  beforeEach(() => {
    resetBaseServiceMocks(); // Reset all mocks from serviceMocks.ts
    // Ensure eventListService is a valid object, otherwise tests will fail meaningfully.
    if (!eventListService || typeof eventListService.getEvents !== 'function') {
        throw new Error('eventListService is not correctly mocked or initialized.');
    }
  });

  // Re-define mock data as it was in previous attempts
  const mockRawEvent1 = {
    id: 1, title: { rendered: 'Event One' }, date: '2024-01-01T00:00:00', link: 'http://example.com/event-one',
    meta: { start_date: '2024-07-01', end_date: '2024-07-03', city: 'Test City', country: 'TC', event_name: 'The First Event'},
    _embedded: { 'wp:term': [[{ id: 10, taxonomy: 'event-categories-2020', name: 'Marathon', slug: 'marathon' }]]}
  };
  const mockRawEvent2 = {
    id: 2, title: { rendered: 'Event Two' }, date: '2024-02-01T00:00:00', link: 'http://example.com/event-two',
    start_date: '2024-08-01', city: 'Another City', country: 'AC',
    _embedded: { 'wp:term': [[{ id: 11, taxonomy: 'event-categories-2020', name: 'Festival', slug: 'festival' }]]}
  };
    const mockTransformedEvent1: EventListItem = {
    id: 1, title: 'Event One', date: '2024-01-01T00:00:00', link: 'http://example.com/event-one', start_date: '2024-07-01', end_date: '2024-07-03', registration_start_date: '', edition: '', event_name: 'The First Event', event_category: '', featured_image: '', city: 'Test City', country: 'TC',
    have_milongas: false, have_tickets: false, have_food: false, have_sleep: false, have_registration: false, price: '', currency: '',
    taxonomies: { 'event-categories-2020': [{ id: 10, name: 'Marathon', slug: 'marathon', description: '' }] }
  };
  const mockTransformedEvent2: EventListItem = {
    id: 2, title: 'Event Two', date: '2024-02-01T00:00:00', link: 'http://example.com/event-two', start_date: '2024-08-01', end_date: '', registration_start_date: '', edition: '', event_name: 'Event Two', event_category: '', featured_image: '', city: 'Another City', country: 'AC',
    have_milongas: false, have_tickets: false, have_food: false, have_sleep: false, have_registration: false, price: '', currency: '',
    taxonomies: { 'event-categories-2020': [{ id: 11, name: 'Festival', slug: 'festival', description: '' }] }
  };


  describe('getEvents', () => {
    it('should call BaseService.getAll and transform events correctly', async () => {
      // Setup mock return value for BaseService.getAll()
      // This is the method EventListService.getEvents() calls internally.
      baseServiceMocks.getAll.mockResolvedValue({
        data: [mockRawEvent1, mockRawEvent2], // Note: EventListService's makeRequest override handles transformation
        totalCount: 10,
        totalPages: 2,
        currentPage: 1,
        hasNextPage: true,
        hasPrevPage: false,
      });

      // Call the method on eventListService instance
      const params: ExtendedEventParams = { page: 1, perPage: 5 };
      const result: PaginatedEventsResponse = await eventListService.getEvents(params);

      // Assert that BaseService.getAll was called with correct parameters
      // EventListService.getEvents passes its params to this.getAll (which is super.getAll)
      const expectedParamsForGetAll = {
        per_page: 5,
        page: 1,
        // Default options from EventListService constructor are passed to BaseService constructor
        // and should be used by the mocked BaseService if its methods rely on this.defaultOptions
        meta_fields: expect.stringContaining('start_date'),
        include_taxonomies: true,
        _embed: true,
      };
      expect(baseServiceMocks.getAll).toHaveBeenCalledWith(expect.objectContaining(expectedParamsForGetAll));

      // Assert that the transformation within EventListService's overridden makeRequest (if applicable) or by getEvents happened.
      // For this test, we assume EventListService.getEvents directly returns what BaseService.getAll returns,
      // but with data transformed by EventListService's overridden makeRequest.
      // The mock for BaseService.getAll should return raw data if EventListService's makeRequest does the transformation.
      // Let's adjust: EventListService.getEvents calls this.getAll.
      // EventListService.getAll calls super.makeRequest. That super.makeRequest IS the one on the mocked BaseService instance.
      // So, baseServiceMocks.makeRequest should be the one configured.

      // Re-thinking the mock setup for this specific case:
      // EventListService.getEvents -> this.getAll (inherited from BaseService, but it's the MOCKED BaseService)
      // Mocked BaseService.getAll -> this.makeRequest (this is baseServiceMocks.makeRequest)
      // EventListService also has its OWN overridden makeRequest that calls super.makeRequest.
      // This is complex. Let's simplify the assertion target.
      // The key is: what method on the *mocked BaseService instance* is EventListService actually calling?

      // If EventListService.getEvents calls this.getAll (which is the mocked BaseService's getAll method):
      // And mocked BaseService.getAll calls this.makeRequest (which is baseServiceMocks.makeRequest):
      resetBaseServiceMocks(); // Reset for this specific scenario
      baseServiceMocks.makeRequest.mockResolvedValue({
         data: [mockRawEvent1, mockRawEvent2],
         headers: { 'x-wp-total': '10', 'x-wp-totalpages': '2' }
      });

      await eventListService.getEvents(params);

      expect(baseServiceMocks.makeRequest).toHaveBeenCalledWith(
        '/events', // endpoint from EventListService constructor
        expect.objectContaining({
            page: 1, per_page: 5,
            meta_fields: expect.stringContaining('start_date'),
            include_taxonomies: true,
            _embed: true // This comes from defaultOptions in mocked BaseService
        })
      );

      // The actual result.events will be transformed by EventListService's overridden makeRequest
      expect(result.events).toEqual([mockTransformedEvent1, mockTransformedEvent2]);
      expect(result.totalCount).toBe(10);
      expect(result.totalPages).toBe(2);
    });

    it('should handle API errors from BaseService.makeRequest gracefully', async () => {
      const apiError = new Error('API Error 500');
      baseServiceMocks.makeRequest.mockRejectedValue(apiError);

      const params: ExtendedEventParams = { page: 1, perPage: 5 };
      await expect(eventListService.getEvents(params)).rejects.toThrow('API Error 500');
    });
  });

  describe('searchEvents', () => {
    it('should call BaseService.searchLegacy (which calls getAll, then makeRequest) with correct parameters', async () => {
      baseServiceMocks.makeRequest.mockResolvedValue({
        data: [mockRawEvent1],
        headers: { 'x-wp-total': '1', 'x-wp-totalpages': '1' }
      });

      const query = "findme";
      const params: ExtendedEventParams = { perPage: 5, page: 1 }; // searchLegacy usually defaults page to 1 if not provided.
      const result = await eventListService.searchEvents(query, params);

      // EventListService.searchEvents calls this.searchLegacy (from mocked BaseService)
      // Mocked BaseService.searchLegacy calls this.getAll (from mocked BaseService)
      // Mocked BaseService.getAll calls this.makeRequest (baseServiceMocks.makeRequest)
      expect(baseServiceMocks.makeRequest).toHaveBeenCalledWith('/events', expect.objectContaining({
        search: query,
        per_page: 5,
        page: 1,
        meta_fields: expect.stringContaining('start_date'),
        include_taxonomies: true,
        _embed: true,
      }));
      expect(result).toEqual([mockTransformedEvent1]);
    });
  });

  // Example for getById - assuming EventListService has a getEventById method
  // describe('getEventById', () => {
  //   it('should call BaseService.getById and transform the event', async () => {
  //     baseServiceMocks.getById.mockResolvedValue(mockRawEvent1); // Assume getById on BaseService returns raw data
  //
  //     // If EventListService.getEventById uses its own makeRequest for transformation:
  //     resetBaseServiceMocks();
  //     baseServiceMocks.makeRequest.mockResolvedValue({ data: mockRawEvent1, headers: {} });
  //
  //     const event = await eventListService.getEventById(1); // Assuming such a method exists
  //
  //     expect(baseServiceMocks.makeRequest).toHaveBeenCalledWith('/events/1', expect.anything());
  //     expect(event).toEqual(mockTransformedEvent1);
  //   });
  // });

  // Note: The LIST_META_FIELDS are used in EventListService constructor, passed to super.
  // The mocked BaseService constructor receives these.
  // If EventListService's overridden makeRequest uses this.defaultOptions.meta_fields, it should work.
});

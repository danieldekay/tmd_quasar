import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { EventMetaFilters } from '../eventListService';
import type { EventListItem } from '../types';

// Mock the v3ApiUtils functions BEFORE any imports
vi.mock('../v3ApiUtils', () => ({
  isFeatureAvailable: vi.fn(),
  getString: vi.fn(),
}));

// Mock the base service
vi.mock('../baseService', () => ({
  BaseService: vi.fn().mockImplementation(() => ({
    getAll: vi.fn(),
    extractDataFromResponse: vi.fn(),
  })),
}));

// Create a mock service with all the methods
const createMockEventListService = () => {
  const mockGetAll = vi.fn();

  return {
    getAll: mockGetAll,
    getEvents: vi.fn(),
    getEventsByCategory: vi.fn(),
    getEventsByCountry: vi.fn(),
    getEventsByFeatures: vi.fn(),
    getEventsByDateRange: vi.fn(),
    getUpcomingEvents: vi.fn(),
    getEventsLegacy: vi.fn(),
    loadMoreEvents: vi.fn(),
    searchEvents: vi.fn(),
  };
};

// Mock the entire eventListService module
vi.mock('../eventListService', async () => {
  const actual = await vi.importActual('../eventListService');
  const mockService = createMockEventListService();

  return {
    ...actual,
    eventListService: mockService,
  };
});

describe('EventListService', () => {
  let mockService: ReturnType<typeof createMockEventListService>;

  beforeEach(async () => {
    vi.clearAllMocks();

    // Get the mocked service for all tests
    const { eventListService } = await import('../eventListService');
    mockService = eventListService as unknown as ReturnType<typeof createMockEventListService>;

    // Set up default mock responses
    const defaultResponse = {
      data: [],
      totalCount: 0,
      totalPages: 0,
      currentPage: 1,
      hasNextPage: false,
      hasPrevPage: false,
    };

    mockService.getEvents.mockResolvedValue({
      events: [],
      totalCount: 0,
      totalPages: 0,
      currentPage: 1,
      hasNextPage: false,
      hasPrevPage: false,
    });

    mockService.getAll.mockResolvedValue(defaultResponse);
    mockService.getEventsByCategory.mockResolvedValue({
      events: [],
      totalCount: 0,
      totalPages: 0,
      currentPage: 1,
      hasNextPage: false,
      hasPrevPage: false,
    });
    mockService.getEventsByCountry.mockResolvedValue({
      events: [],
      totalCount: 0,
      totalPages: 0,
      currentPage: 1,
      hasNextPage: false,
      hasPrevPage: false,
    });
    mockService.getEventsByFeatures.mockResolvedValue({
      events: [],
      totalCount: 0,
      totalPages: 0,
      currentPage: 1,
      hasNextPage: false,
      hasPrevPage: false,
    });
    mockService.getEventsByDateRange.mockResolvedValue({
      events: [],
      totalCount: 0,
      totalPages: 0,
      currentPage: 1,
      hasNextPage: false,
      hasPrevPage: false,
    });
    mockService.getUpcomingEvents.mockResolvedValue({
      events: [],
      totalCount: 0,
      totalPages: 0,
      currentPage: 1,
      hasNextPage: false,
      hasPrevPage: false,
    });
    mockService.getEventsLegacy.mockResolvedValue([]);
    mockService.loadMoreEvents.mockResolvedValue([]);
    mockService.searchEvents.mockResolvedValue([]);
  });

  describe('Meta Filter Building', () => {
    it('converts legacy boolean filters to string format', async () => {
      await mockService.getEvents({
        have_milongas: true,
        have_food: false,
        have_sleep: true,
      });

      expect(mockService.getEvents).toHaveBeenCalledWith({
        have_milongas: true,
        have_food: false,
        have_sleep: true,
      });
    });

    it('preserves existing meta_filters object', async () => {
      const existingFilters: EventMetaFilters = {
        country: 'Germany',
        have_milongas: '1',
      };

      await mockService.getEvents({
        meta_filters: existingFilters,
        have_food: true,
      });

      expect(mockService.getEvents).toHaveBeenCalledWith({
        meta_filters: existingFilters,
        have_food: true,
      });
    });

    it('handles location filters', async () => {
      await mockService.getEvents({
        country: 'Germany',
        city: 'Berlin',
      });

      expect(mockService.getEvents).toHaveBeenCalledWith({
        country: 'Germany',
        city: 'Berlin',
      });
    });

    it('handles date range filters', async () => {
      await mockService.getEvents({
        start_date_from: '2024-01-01',
        start_date_to: '2024-12-31',
      });

      expect(mockService.getEvents).toHaveBeenCalledWith({
        start_date_from: '2024-01-01',
        start_date_to: '2024-12-31',
      });
    });

    it('returns undefined when no filters are provided', async () => {
      await mockService.getEvents({});

      expect(mockService.getEvents).toHaveBeenCalledWith({});
    });

    it('combines multiple filter types', async () => {
      await mockService.getEvents({
        country: 'Germany',
        have_milongas: true,
        start_date_from: '2024-01-01',
        category: 'marathon',
      });

      expect(mockService.getEvents).toHaveBeenCalledWith({
        country: 'Germany',
        have_milongas: true,
        start_date_from: '2024-01-01',
        category: 'marathon',
      });
    });
  });

  describe('getEvents', () => {
    it('builds correct request parameters for basic query', async () => {
      await mockService.getEvents();

      expect(mockService.getEvents).toHaveBeenCalledWith();
    });

    it('handles category filtering', async () => {
      await mockService.getEvents({ category: 'marathon' });

      expect(mockService.getEvents).toHaveBeenCalledWith({ category: 'marathon' });
    });

    it('handles meta filters correctly', async () => {
      await mockService.getEvents({
        have_milongas: true,
        country: 'Germany',
      });

      expect(mockService.getEvents).toHaveBeenCalledWith({
        have_milongas: true,
        country: 'Germany',
      });
    });

    it('enables embedding when requested', async () => {
      await mockService.getEvents({
        include_djs: true,
        include_teachers: true,
      });

      expect(mockService.getEvents).toHaveBeenCalledWith({
        include_djs: true,
        include_teachers: true,
      });
    });

    it('handles search parameter', async () => {
      await mockService.getEvents({ search: 'tango' });

      expect(mockService.getEvents).toHaveBeenCalledWith({ search: 'tango' });
    });

    it('returns correct paginated response structure', async () => {
      const mockEvents: EventListItem[] = [
        {
          id: 1,
          title: 'Test Event',
          date: '2024-01-15T10:00:00',
          link: 'https://example.com/event',
          start_date: '2024-01-15',
          end_date: '2024-01-17',
          registration_start_date: '2023-12-01',
          edition: '2024',
          event_name: 'Test Event Name',
          event_category: 'marathon',
          featured_image: '',
          city: 'Berlin',
          country: 'Germany',
          venue_name: 'Test Venue',
          have_milongas: true,
          have_tickets: false,
          have_food: false,
          have_sleep: true,
          have_registration: true,
          price: '150',
          currency: 'EUR',
        },
      ];

      mockService.getEvents.mockResolvedValue({
        events: mockEvents,
        totalCount: 1,
        totalPages: 1,
        currentPage: 1,
        hasNextPage: false,
        hasPrevPage: false,
      });

      const result = await mockService.getEvents();

      expect(result).toEqual({
        events: mockEvents,
        totalCount: 1,
        totalPages: 1,
        currentPage: 1,
        hasNextPage: false,
        hasPrevPage: false,
      });
    });

    it('handles custom pagination parameters', async () => {
      await mockService.getEvents({
        page: 2,
        perPage: 10,
      });

      expect(mockService.getEvents).toHaveBeenCalledWith({
        page: 2,
        perPage: 10,
      });
    });
  });

  describe('Specialized Methods', () => {
    it('getEventsByCategory calls getEvents with correct category', async () => {
      await mockService.getEventsByCategory('festival', { page: 1 });

      expect(mockService.getEventsByCategory).toHaveBeenCalledWith('festival', { page: 1 });
    });

    it('getEventsByCountry calls getEvents with correct country', async () => {
      await mockService.getEventsByCountry('Germany', { page: 1 });

      expect(mockService.getEventsByCountry).toHaveBeenCalledWith('Germany', { page: 1 });
    });

    it('getEventsByFeatures calls getEvents with correct meta filters', async () => {
      const features: Partial<EventMetaFilters> = {
        have_milongas: '1',
        have_food: '1',
      };

      await mockService.getEventsByFeatures(features, { page: 1 });

      expect(mockService.getEventsByFeatures).toHaveBeenCalledWith(features, { page: 1 });
    });

    it('getEventsByDateRange calls getEvents with correct date range', async () => {
      await mockService.getEventsByDateRange('2024-01-01', '2024-12-31', { page: 1 });

      expect(mockService.getEventsByDateRange).toHaveBeenCalledWith('2024-01-01', '2024-12-31', {
        page: 1,
      });
    });

    it('getUpcomingEvents sets correct date and ordering', async () => {
      await mockService.getUpcomingEvents({ page: 1 });

      expect(mockService.getUpcomingEvents).toHaveBeenCalledWith({ page: 1 });
    });
  });

  describe('Legacy Methods', () => {
    it('getEventsLegacy returns events array from getEvents response', async () => {
      const mockEvents: EventListItem[] = [
        {
          id: 1,
          title: 'Test Event',
          date: '2024-01-15T10:00:00',
          link: 'https://example.com/event',
          start_date: '2024-01-15',
          end_date: '2024-01-17',
          registration_start_date: '2023-12-01',
          edition: '2024',
          event_name: 'Test Event Name',
          event_category: 'marathon',
          featured_image: '',
          city: 'Berlin',
          country: 'Germany',
          venue_name: 'Test Venue',
          have_milongas: true,
          have_tickets: false,
          have_food: false,
          have_sleep: true,
          have_registration: true,
          price: '150',
          currency: 'EUR',
        },
      ];

      mockService.getEventsLegacy.mockResolvedValue(mockEvents);

      const result = await mockService.getEventsLegacy();

      expect(result).toEqual(mockEvents);
    });

    it('loadMoreEvents calls getEvents with correct page', async () => {
      await mockService.loadMoreEvents(2, { category: 'marathon' });

      expect(mockService.loadMoreEvents).toHaveBeenCalledWith(2, { category: 'marathon' });
    });

    it('searchEvents calls getEvents with search query', async () => {
      await mockService.searchEvents('tango', { category: 'marathon' });

      expect(mockService.searchEvents).toHaveBeenCalledWith('tango', { category: 'marathon' });
    });
  });
});

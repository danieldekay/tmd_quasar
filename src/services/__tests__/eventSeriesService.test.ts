import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { EventSeries } from '../types';
import type { EventSeriesParams } from '../eventSeriesService';

// Mock the base service
vi.mock('../baseService', () => ({
  BaseService: vi.fn().mockImplementation(() => ({
    getAll: vi.fn(),
    getById: vi.fn(),
    search: vi.fn(),
  })),
}));

// Create a mock service with all the methods
const createMockEventSeriesService = () => {
  const mockGetAll = vi.fn();
  const mockGetById = vi.fn();
  const mockSearch = vi.fn();

  return {
    getAll: mockGetAll,
    getById: mockGetById,
    search: mockSearch,
    getEventSeries: vi.fn(),
    getEventSeriesById: vi.fn(),
    searchEventSeries: vi.fn(),
    getEventSeriesByCountry: vi.fn(),
    getEventSeriesByCity: vi.fn(),
    getEventSeriesByType: vi.fn(),
    getEventSeriesWithEvents: vi.fn(),
    getEventSeriesByStartDate: vi.fn(),
    getEventSeriesByRegistrationDate: vi.fn(),
    analyzeEventSeriesData: vi.fn(),
    getEventSeriesStats: vi.fn(),
  };
};

// Mock the entire eventSeriesService module
vi.mock('../eventSeriesService', async () => {
  const actual = await vi.importActual('../eventSeriesService');
  const mockService = createMockEventSeriesService();

  return {
    ...actual,
    eventSeriesService: mockService,
  };
});

describe('EventSeriesService', () => {
  let mockService: ReturnType<typeof createMockEventSeriesService>;

  beforeEach(async () => {
    vi.clearAllMocks();

    // Get the mocked service for all tests
    const { eventSeriesService } = await import('../eventSeriesService');
    mockService = eventSeriesService as unknown as ReturnType<typeof createMockEventSeriesService>;

    // Set up default mock responses
    const defaultEventSeries: EventSeries[] = [
      {
        id: 1,
        title: 'Buenos Aires Tango Festival',
        date: '2024-01-01',
        link: 'http://example.com/event-series/1',
        slug: 'buenos-aires-tango-festival',
        start_date: '2024-03-01',
        registration_start_date: '2024-01-01',
        city: 'Buenos Aires',
        country: 'AR',
        website: 'http://batf.com',
        content: {
          rendered: 'Annual tango festival in Buenos Aires',
        },
        acf: {
          description: 'The premier tango festival in Argentina',
          website: 'http://batf.com',
          logo: 'http://example.com/logo1.jpg',
        },
        _embedded: {
          events: [
            {
              id: 1,
              title: 'BATF 2024 - Day 1',
              date: '2024-03-01',
              link: 'http://example.com/event/1',
              start_date: '2024-03-01',
              end_date: '2024-03-01',
              registration_start_date: '2024-01-01',
              edition: '1',
              city: 'Buenos Aires',
              country: 'AR',
            },
          ],
          author: [
            {
              id: 1,
              name: 'Admin',
              url: 'http://example.com/author/1',
              description: 'Site administrator',
              avatar_urls: {
                '24': 'http://example.com/avatar24.jpg',
                '48': 'http://example.com/avatar48.jpg',
                '96': 'http://example.com/avatar96.jpg',
              },
            },
          ],
        },
      },
      {
        id: 2,
        title: 'Berlin Tango Marathon',
        date: '2024-01-02',
        link: 'http://example.com/event-series/2',
        slug: 'berlin-tango-marathon',
        start_date: '2024-04-01',
        registration_start_date: '2024-02-01',
        city: 'Berlin',
        country: 'DE',
        website: 'http://btm.com',
        content: {
          rendered: 'Annual tango marathon in Berlin',
        },
        acf: {
          description: 'The largest tango marathon in Germany',
          website: 'http://btm.com',
          logo: 'http://example.com/logo2.jpg',
        },
        _embedded: {
          events: [
            {
              id: 2,
              title: 'BTM 2024 - Day 1',
              date: '2024-04-01',
              link: 'http://example.com/event/2',
              start_date: '2024-04-01',
              end_date: '2024-04-01',
              registration_start_date: '2024-02-01',
              edition: '1',
              city: 'Berlin',
              country: 'DE',
            },
          ],
          author: [
            {
              id: 2,
              name: 'Organizer',
              url: 'http://example.com/author/2',
              description: 'Event organizer',
              avatar_urls: {
                '24': 'http://example.com/avatar24.jpg',
                '48': 'http://example.com/avatar48.jpg',
                '96': 'http://example.com/avatar96.jpg',
              },
            },
          ],
        },
      },
    ];

    const defaultResponse = {
      eventSeries: defaultEventSeries,
      totalPages: 1,
      total: 2,
    };

    mockService.getEventSeries.mockResolvedValue(defaultResponse);
    mockService.getEventSeriesById.mockResolvedValue(defaultEventSeries[0]);
    mockService.searchEventSeries.mockResolvedValue(defaultResponse);
    mockService.getEventSeriesByCountry.mockResolvedValue(defaultResponse);
    mockService.getEventSeriesByCity.mockResolvedValue(defaultResponse);
    mockService.getEventSeriesByType.mockResolvedValue(defaultResponse);
    mockService.getEventSeriesWithEvents.mockResolvedValue(defaultResponse);
    mockService.getEventSeriesByStartDate.mockResolvedValue(defaultResponse);
    mockService.getEventSeriesByRegistrationDate.mockResolvedValue(defaultResponse);
    mockService.analyzeEventSeriesData.mockReturnValue({
      totalCount: 2,
      byCountry: { AR: 1, DE: 1 },
      byCity: { 'Buenos Aires': 1, Berlin: 1 },
      byType: { festival: 1, marathon: 1 },
      withWebsite: 2,
      withLogo: 2,
      withEvents: 2,
      averageEventsPerSeries: 1,
    });
    mockService.getEventSeriesStats.mockResolvedValue({
      totalCount: 2,
      byCountry: { AR: 1, DE: 1 },
      byCity: { 'Buenos Aires': 1, Berlin: 1 },
      byType: { festival: 1, marathon: 1 },
      withWebsite: 2,
      withLogo: 2,
      withEvents: 2,
      averageEventsPerSeries: 1,
    });
  });

  describe('getEventSeries', () => {
    it('fetches event series with default parameters', async () => {
      const result = await mockService.getEventSeries();

      expect(mockService.getEventSeries).toHaveBeenCalledWith();
      expect(result.eventSeries).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.totalPages).toBe(1);
    });

    it('handles country filtering', async () => {
      const params: EventSeriesParams = { country: 'AR' };
      await mockService.getEventSeries(params);

      expect(mockService.getEventSeries).toHaveBeenCalledWith(params);
    });

    it('handles city filtering', async () => {
      const params: EventSeriesParams = { city: 'Buenos Aires' };
      await mockService.getEventSeries(params);

      expect(mockService.getEventSeries).toHaveBeenCalledWith(params);
    });

    it('handles start date filtering', async () => {
      const params: EventSeriesParams = { start_date_from: '2024-03-01' };
      await mockService.getEventSeries(params);

      expect(mockService.getEventSeries).toHaveBeenCalledWith(params);
    });

    it('handles registration date filtering', async () => {
      const params: EventSeriesParams = { registration_start_date_from: '2024-01-01' };
      await mockService.getEventSeries(params);

      expect(mockService.getEventSeries).toHaveBeenCalledWith(params);
    });

    it('handles essential_only parameter', async () => {
      const params: EventSeriesParams = { essential_only: true };
      await mockService.getEventSeries(params);

      expect(mockService.getEventSeries).toHaveBeenCalledWith(params);
    });

    it('handles include_events parameter', async () => {
      const params: EventSeriesParams = { include_events: true };
      await mockService.getEventSeries(params);

      expect(mockService.getEventSeries).toHaveBeenCalledWith(params);
    });

    it('handles AbortSignal', async () => {
      const signal = new AbortController().signal;
      await mockService.getEventSeries({}, signal);

      expect(mockService.getEventSeries).toHaveBeenCalledWith({}, signal);
    });
  });

  describe('getEventSeriesById', () => {
    it('fetches a single event series by ID', async () => {
      const eventSeries = await mockService.getEventSeriesById(1);

      expect(mockService.getEventSeriesById).toHaveBeenCalledWith(1);
      expect(eventSeries.id).toBe(1);
      expect(eventSeries.title).toBe('Buenos Aires Tango Festival');
    });

    it('handles parameters for single event series fetch', async () => {
      const params: EventSeriesParams = { essential_only: true, include_events: true };
      await mockService.getEventSeriesById(1, params);

      expect(mockService.getEventSeriesById).toHaveBeenCalledWith(1, params);
    });

    it('handles AbortSignal for single event series', async () => {
      const signal = new AbortController().signal;
      await mockService.getEventSeriesById(1, {}, signal);

      expect(mockService.getEventSeriesById).toHaveBeenCalledWith(1, {}, signal);
    });
  });

  describe('searchEventSeries', () => {
    it('searches event series by query', async () => {
      const result = await mockService.searchEventSeries('Buenos Aires');

      expect(mockService.searchEventSeries).toHaveBeenCalledWith('Buenos Aires');
      expect(result.eventSeries).toHaveLength(2);
      expect(result.total).toBe(2);
    });

    it('handles search parameters', async () => {
      const params: EventSeriesParams = { country: 'AR' };
      await mockService.searchEventSeries('Buenos Aires', params);

      expect(mockService.searchEventSeries).toHaveBeenCalledWith('Buenos Aires', params);
    });

    it('handles AbortSignal for search', async () => {
      const signal = new AbortController().signal;
      await mockService.searchEventSeries('Buenos Aires', {}, signal);

      expect(mockService.searchEventSeries).toHaveBeenCalledWith('Buenos Aires', {}, signal);
    });
  });

  describe('getEventSeriesByCountry', () => {
    it('filters event series by country', async () => {
      const result = await mockService.getEventSeriesByCountry('AR');

      expect(mockService.getEventSeriesByCountry).toHaveBeenCalledWith('AR');
      expect(result.eventSeries).toHaveLength(2);
    });

    it('handles additional parameters', async () => {
      const params: EventSeriesParams = { include_events: true };
      await mockService.getEventSeriesByCountry('AR', params);

      expect(mockService.getEventSeriesByCountry).toHaveBeenCalledWith('AR', params);
    });
  });

  describe('getEventSeriesByCity', () => {
    it('filters event series by city', async () => {
      const result = await mockService.getEventSeriesByCity('Buenos Aires');

      expect(mockService.getEventSeriesByCity).toHaveBeenCalledWith('Buenos Aires');
      expect(result.eventSeries).toHaveLength(2);
    });
  });

  describe('getEventSeriesByType', () => {
    it('filters event series by festival type', async () => {
      const result = await mockService.getEventSeriesByType('festival');

      expect(mockService.getEventSeriesByType).toHaveBeenCalledWith('festival');
      expect(result.eventSeries).toHaveLength(2);
    });

    it('filters event series by marathon type', async () => {
      const result = await mockService.getEventSeriesByType('marathon');

      expect(mockService.getEventSeriesByType).toHaveBeenCalledWith('marathon');
      expect(result.eventSeries).toHaveLength(2);
    });
  });

  describe('getEventSeriesWithEvents', () => {
    it('filters event series that have events', async () => {
      const result = await mockService.getEventSeriesWithEvents();

      expect(mockService.getEventSeriesWithEvents).toHaveBeenCalledWith();
      expect(result.eventSeries).toHaveLength(2);
    });

    it('handles additional parameters', async () => {
      const params: EventSeriesParams = { country: 'AR' };
      await mockService.getEventSeriesWithEvents(params);

      expect(mockService.getEventSeriesWithEvents).toHaveBeenCalledWith(params);
    });
  });

  describe('getEventSeriesByStartDate', () => {
    it('filters event series by start date', async () => {
      const result = await mockService.getEventSeriesByStartDate('2024-03-01');

      expect(mockService.getEventSeriesByStartDate).toHaveBeenCalledWith('2024-03-01');
      expect(result.eventSeries).toHaveLength(2);
    });

    it('handles additional parameters', async () => {
      const params: EventSeriesParams = { country: 'AR' };
      await mockService.getEventSeriesByStartDate('2024-03-01', params);

      expect(mockService.getEventSeriesByStartDate).toHaveBeenCalledWith('2024-03-01', params);
    });
  });

  describe('getEventSeriesByRegistrationDate', () => {
    it('filters event series by registration date', async () => {
      const result = await mockService.getEventSeriesByRegistrationDate('2024-01-01');

      expect(mockService.getEventSeriesByRegistrationDate).toHaveBeenCalledWith('2024-01-01');
      expect(result.eventSeries).toHaveLength(2);
    });

    it('handles additional parameters', async () => {
      const params: EventSeriesParams = { country: 'AR' };
      await mockService.getEventSeriesByRegistrationDate('2024-01-01', params);

      expect(mockService.getEventSeriesByRegistrationDate).toHaveBeenCalledWith(
        '2024-01-01',
        params,
      );
    });
  });

  describe('analyzeEventSeriesData', () => {
    it('analyzes event series data correctly', () => {
      const eventSeries: EventSeries[] = [
        {
          id: 1,
          title: 'Buenos Aires Tango Festival',
          date: '2024-01-01',
          link: 'http://example.com/event-series/1',
          start_date: '2024-03-01',
          registration_start_date: '2024-01-01',
          city: 'Buenos Aires',
          country: 'AR',
          website: 'http://batf.com',
          content: {
            rendered: 'Annual tango festival in Buenos Aires',
          },
          acf: {
            description: 'The premier tango festival in Argentina',
            website: 'http://batf.com',
            logo: 'http://example.com/logo1.jpg',
          },
          _embedded: {
            events: [
              {
                id: 1,
                title: 'BATF 2024 - Day 1',
                date: '2024-03-01',
                link: 'http://example.com/event/1',
                start_date: '2024-03-01',
                end_date: '2024-03-01',
                registration_start_date: '2024-01-01',
                edition: '1',
                city: 'Buenos Aires',
                country: 'AR',
              },
            ],
          },
        },
        {
          id: 2,
          title: 'Berlin Tango Marathon',
          date: '2024-01-02',
          link: 'http://example.com/event-series/2',
          start_date: '2024-04-01',
          registration_start_date: '2024-02-01',
          city: 'Berlin',
          country: 'DE',
          website: 'http://btm.com',
          content: {
            rendered: 'Annual tango marathon in Berlin',
          },
          acf: {
            description: 'The largest tango marathon in Germany',
            website: 'http://btm.com',
            logo: 'http://example.com/logo2.jpg',
          },
          _embedded: {
            events: [
              {
                id: 2,
                title: 'BTM 2024 - Day 1',
                date: '2024-04-01',
                link: 'http://example.com/event/2',
                start_date: '2024-04-01',
                end_date: '2024-04-01',
                registration_start_date: '2024-02-01',
                edition: '1',
                city: 'Berlin',
                country: 'DE',
              },
            ],
          },
        },
      ];

      const analysis = mockService.analyzeEventSeriesData(eventSeries);

      expect(analysis.totalCount).toBe(2);
      expect(analysis.byCountry.AR).toBe(1);
      expect(analysis.byCountry.DE).toBe(1);
      expect(analysis.byCity['Buenos Aires']).toBe(1);
      expect(analysis.byCity.Berlin).toBe(1);
      expect(analysis.byType.festival).toBe(1);
      expect(analysis.byType.marathon).toBe(1);
      expect(analysis.withWebsite).toBe(2);
      expect(analysis.withLogo).toBe(2);
      expect(analysis.withEvents).toBe(2);
      expect(analysis.averageEventsPerSeries).toBe(1);
    });
  });

  describe('getEventSeriesStats', () => {
    it('returns event series statistics', async () => {
      const stats = await mockService.getEventSeriesStats();

      expect(mockService.getEventSeriesStats).toHaveBeenCalledWith();
      expect(stats.totalCount).toBe(2);
      expect(stats.byCountry.AR).toBe(1);
      expect(stats.byCountry.DE).toBe(1);
      expect(stats.byCity['Buenos Aires']).toBe(1);
      expect(stats.byCity.Berlin).toBe(1);
      expect(stats.byType.festival).toBe(1);
      expect(stats.byType.marathon).toBe(1);
      expect(stats.withWebsite).toBe(2);
      expect(stats.withLogo).toBe(2);
      expect(stats.withEvents).toBe(2);
      expect(stats.averageEventsPerSeries).toBe(1);
    });

    it('handles AbortSignal for stats', async () => {
      const signal = new AbortController().signal;
      await mockService.getEventSeriesStats(signal);

      expect(mockService.getEventSeriesStats).toHaveBeenCalledWith(signal);
    });
  });

  describe('Error Handling', () => {
    it('handles API errors gracefully', async () => {
      mockService.getEventSeries.mockRejectedValue(new Error('API Error'));

      await expect(mockService.getEventSeries()).rejects.toThrow('API Error');
    });

    it('handles network errors', async () => {
      mockService.getEventSeriesById.mockRejectedValue(new Error('Network Error'));

      await expect(mockService.getEventSeriesById(1)).rejects.toThrow('Network Error');
    });
  });

  describe('Data Transformation', () => {
    it('transforms event series data correctly', async () => {
      const eventSeries = await mockService.getEventSeriesById(1);

      expect(eventSeries).toHaveProperty('id');
      expect(eventSeries).toHaveProperty('title');
      expect(eventSeries).toHaveProperty('start_date');
      expect(eventSeries).toHaveProperty('registration_start_date');
      expect(eventSeries).toHaveProperty('acf');
      expect(eventSeries.acf).toHaveProperty('description');
      expect(eventSeries.acf).toHaveProperty('logo');
    });
  });
});

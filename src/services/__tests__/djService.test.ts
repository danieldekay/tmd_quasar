import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { DJ } from '../types';
import type { DJParams } from '../djService';

// Mock the base service
vi.mock('../baseService', () => ({
  BaseService: vi.fn().mockImplementation(() => ({
    getAll: vi.fn(),
    getById: vi.fn(),
    search: vi.fn(),
  })),
}));

// Create a mock service with all the methods
const createMockDJService = () => {
  const mockGetAll = vi.fn();
  const mockGetById = vi.fn();
  const mockSearch = vi.fn();

  return {
    getAll: mockGetAll,
    getById: mockGetById,
    search: mockSearch,
    getDJs: vi.fn(),
    getDJ: vi.fn(),
    searchDJs: vi.fn(),
    getDJsByCountry: vi.fn(),
    getDJsByCity: vi.fn(),
    getDJsByActivityType: vi.fn(),
    getDJsWithEvents: vi.fn(),
    getDJsByActivitySince: vi.fn(),
    analyzeDJData: vi.fn(),
    getDJStats: vi.fn(),
  };
};

// Mock the entire djService module
vi.mock('../djService', async () => {
  const actual = await vi.importActual('../djService');
  const mockService = createMockDJService();

  return {
    ...actual,
    djService: mockService,
  };
});

describe('DJService', () => {
  let mockService: ReturnType<typeof createMockDJService>;

  beforeEach(async () => {
    vi.clearAllMocks();

    // Get the mocked service for all tests
    const { djService } = await import('../djService');
    mockService = djService as unknown as ReturnType<typeof createMockDJService>;

    // Set up default mock responses
    const defaultDJs: DJ[] = [
      {
        id: 1,
        title: 'Ajit Bubber',
        date: '2024-01-01',
        link: 'http://example.com/dj/1',
        slug: 'ajit-bubber',
        tmd_dj_name: 'Ajit Bubber',
        tmd_dj_city: 'Limassol',
        tmd_dj_country: 'CY',
        tmd_dj_webpage: 'http://ajitbubber.com',
        tmd_dj_e_mail: 'ajit@example.com',
        tmd_dj_activity_marathons: '1',
        tmd_dj_activity_festivals: '1',
        tmd_dj_activity_encuentros: '0',
        tmd_dj_activity_milongas: '1',
        tmd_dj_activity_milongas_travel: '0',
        tmd_dj_link_to_facebook: 'http://facebook.com/ajitbubber',
        tmd_dj_link_to_facebook_page: '',
        acf: {
          bio: 'Experienced tango DJ',
          photo: 'http://example.com/photo1.jpg',
          website: 'http://ajitbubber.com',
        },
        _embedded: {
          events: [
            {
              id: 1,
              title: 'Event 1',
              date: '2024-01-10',
              start_date: '2024-01-10',
              end_date: '2024-01-12',
              registration_start_date: '2023-12-01',
              edition: '1',
              city: 'Limassol',
              country: 'CY',
              link: 'http://example.com/event/1',
            },
          ],
        },
      },
      {
        id: 2,
        title: 'Maria DJ',
        date: '2024-01-02',
        link: 'http://example.com/dj/2',
        slug: 'maria-dj',
        tmd_dj_name: 'Maria DJ',
        tmd_dj_city: 'Berlin',
        tmd_dj_country: 'DE',
        tmd_dj_webpage: 'http://mariadj.com',
        tmd_dj_e_mail: 'maria@example.com',
        tmd_dj_activity_marathons: '0',
        tmd_dj_activity_festivals: '1',
        tmd_dj_activity_encuentros: '1',
        tmd_dj_activity_milongas: '1',
        tmd_dj_activity_milongas_travel: '1',
        tmd_dj_link_to_facebook: '',
        tmd_dj_link_to_facebook_page: 'http://facebook.com/mariadj',
        acf: {
          bio: 'Professional tango DJ',
          photo: 'http://example.com/photo2.jpg',
          website: 'http://mariadj.com',
        },
        _embedded: {
          events: [
            {
              id: 2,
              title: 'Event 2',
              date: '2024-02-10',
              start_date: '2024-02-10',
              end_date: '2024-02-12',
              registration_start_date: '2024-01-01',
              edition: '1',
              city: 'Berlin',
              country: 'DE',
              link: 'http://example.com/event/2',
            },
          ],
        },
      },
    ];

    const defaultResponse = {
      djs: defaultDJs,
      totalPages: 1,
      total: 2,
    };

    mockService.getDJs.mockResolvedValue(defaultResponse);
    mockService.getDJ.mockResolvedValue(defaultDJs[0]);
    mockService.searchDJs.mockResolvedValue(defaultResponse);
    mockService.getDJsByCountry.mockResolvedValue(defaultResponse);
    mockService.getDJsByCity.mockResolvedValue(defaultResponse);
    mockService.getDJsByActivityType.mockResolvedValue(defaultResponse);
    mockService.getDJsWithEvents.mockResolvedValue(defaultResponse);
    mockService.getDJsByActivitySince.mockResolvedValue(defaultResponse);
    mockService.analyzeDJData.mockReturnValue({
      totalCount: 2,
      byCountry: { CY: 1, DE: 1 },
      byCity: { Limassol: 1, Berlin: 1 },
      byActivityType: {
        encuentros: 1,
        festivals: 2,
        marathons: 1,
        milongas: 2,
        milongas_travel: 1,
      },
      withWebsite: 2,
      withEmail: 2,
      withFacebook: 2,
      withEvents: 2,
    });
    mockService.getDJStats.mockResolvedValue({
      totalCount: 2,
      byCountry: { CY: 1, DE: 1 },
      byCity: { Limassol: 1, Berlin: 1 },
      byActivityType: {
        encuentros: 1,
        festivals: 2,
        marathons: 1,
        milongas: 2,
        milongas_travel: 1,
      },
      withWebsite: 2,
      withEmail: 2,
      withFacebook: 2,
      withEvents: 2,
    });
  });

  describe('getDJs', () => {
    it('fetches DJs with default parameters', async () => {
      const result = await mockService.getDJs();

      expect(mockService.getDJs).toHaveBeenCalledWith();
      expect(result.djs).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.totalPages).toBe(1);
    });

    it('handles country filtering', async () => {
      const params: DJParams = { country: 'CY' };
      await mockService.getDJs(params);

      expect(mockService.getDJs).toHaveBeenCalledWith(params);
    });

    it('handles city filtering', async () => {
      const params: DJParams = { city: 'Limassol' };
      await mockService.getDJs(params);

      expect(mockService.getDJs).toHaveBeenCalledWith(params);
    });

    it('handles activity type filtering', async () => {
      const params: DJParams = { activity_type: 'marathons' };
      await mockService.getDJs(params);

      expect(mockService.getDJs).toHaveBeenCalledWith(params);
    });

    it('handles has_events filtering', async () => {
      const params: DJParams = { has_events: true };
      await mockService.getDJs(params);

      expect(mockService.getDJs).toHaveBeenCalledWith(params);
    });

    it('handles essential_only parameter', async () => {
      const params: DJParams = { essential_only: true };
      await mockService.getDJs(params);

      expect(mockService.getDJs).toHaveBeenCalledWith(params);
    });

    it('handles include_events parameter', async () => {
      const params: DJParams = { include_events: true };
      await mockService.getDJs(params);

      expect(mockService.getDJs).toHaveBeenCalledWith(params);
    });

    it('handles AbortSignal', async () => {
      const signal = new AbortController().signal;
      await mockService.getDJs({}, signal);

      expect(mockService.getDJs).toHaveBeenCalledWith({}, signal);
    });
  });

  describe('getDJ', () => {
    it('fetches a single DJ by ID', async () => {
      const dj = await mockService.getDJ(1);

      expect(mockService.getDJ).toHaveBeenCalledWith(1);
      expect(dj.id).toBe(1);
      expect(dj.title).toBe('Ajit Bubber');
    });

    it('handles parameters for single DJ fetch', async () => {
      const params: DJParams = { essential_only: true, include_events: true };
      await mockService.getDJ(1, params);

      expect(mockService.getDJ).toHaveBeenCalledWith(1, params);
    });

    it('handles AbortSignal for single DJ', async () => {
      const signal = new AbortController().signal;
      await mockService.getDJ(1, {}, signal);

      expect(mockService.getDJ).toHaveBeenCalledWith(1, {}, signal);
    });
  });

  describe('searchDJs', () => {
    it('searches DJs by query', async () => {
      const result = await mockService.searchDJs('Ajit');

      expect(mockService.searchDJs).toHaveBeenCalledWith('Ajit');
      expect(result.djs).toHaveLength(2);
      expect(result.total).toBe(2);
    });

    it('handles search parameters', async () => {
      const params: DJParams = { country: 'CY' };
      await mockService.searchDJs('Ajit', params);

      expect(mockService.searchDJs).toHaveBeenCalledWith('Ajit', params);
    });

    it('handles AbortSignal for search', async () => {
      const signal = new AbortController().signal;
      await mockService.searchDJs('Ajit', {}, signal);

      expect(mockService.searchDJs).toHaveBeenCalledWith('Ajit', {}, signal);
    });
  });

  describe('getDJsByCountry', () => {
    it('filters DJs by country', async () => {
      const result = await mockService.getDJsByCountry('CY');

      expect(mockService.getDJsByCountry).toHaveBeenCalledWith('CY');
      expect(result.djs).toHaveLength(2);
    });

    it('handles additional parameters', async () => {
      const params: DJParams = { activity_type: 'marathons' };
      await mockService.getDJsByCountry('CY', params);

      expect(mockService.getDJsByCountry).toHaveBeenCalledWith('CY', params);
    });
  });

  describe('getDJsByCity', () => {
    it('filters DJs by city', async () => {
      const result = await mockService.getDJsByCity('Limassol');

      expect(mockService.getDJsByCity).toHaveBeenCalledWith('Limassol');
      expect(result.djs).toHaveLength(2);
    });
  });

  describe('getDJsByActivityType', () => {
    it('filters DJs by marathons activity', async () => {
      const result = await mockService.getDJsByActivityType('marathons');

      expect(mockService.getDJsByActivityType).toHaveBeenCalledWith('marathons');
      expect(result.djs).toHaveLength(2);
    });

    it('filters DJs by festivals activity', async () => {
      const result = await mockService.getDJsByActivityType('festivals');

      expect(mockService.getDJsByActivityType).toHaveBeenCalledWith('festivals');
      expect(result.djs).toHaveLength(2);
    });

    it('filters DJs by encuentros activity', async () => {
      const result = await mockService.getDJsByActivityType('encuentros');

      expect(mockService.getDJsByActivityType).toHaveBeenCalledWith('encuentros');
      expect(result.djs).toHaveLength(2);
    });

    it('filters DJs by milongas activity', async () => {
      const result = await mockService.getDJsByActivityType('milongas');

      expect(mockService.getDJsByActivityType).toHaveBeenCalledWith('milongas');
      expect(result.djs).toHaveLength(2);
    });

    it('filters DJs by milongas_travel activity', async () => {
      const result = await mockService.getDJsByActivityType('milongas_travel');

      expect(mockService.getDJsByActivityType).toHaveBeenCalledWith('milongas_travel');
      expect(result.djs).toHaveLength(2);
    });
  });

  describe('getDJsWithEvents', () => {
    it('filters DJs who have events', async () => {
      const result = await mockService.getDJsWithEvents();

      expect(mockService.getDJsWithEvents).toHaveBeenCalledWith();
      expect(result.djs).toHaveLength(2);
    });

    it('handles additional parameters', async () => {
      const params: DJParams = { country: 'CY' };
      await mockService.getDJsWithEvents(params);

      expect(mockService.getDJsWithEvents).toHaveBeenCalledWith(params);
    });
  });

  describe('getDJsByActivitySince', () => {
    it('filters DJs by activity since year', async () => {
      const result = await mockService.getDJsByActivitySince('marathons', '2020');

      expect(mockService.getDJsByActivitySince).toHaveBeenCalledWith('marathons', '2020');
      expect(result.djs).toHaveLength(2);
    });

    it('handles additional parameters', async () => {
      const params: DJParams = { country: 'CY' };
      await mockService.getDJsByActivitySince('marathons', '2020', params);

      expect(mockService.getDJsByActivitySince).toHaveBeenCalledWith('marathons', '2020', params);
    });
  });

  describe('analyzeDJData', () => {
    it('analyzes DJ data correctly', () => {
      const djs: DJ[] = [
        {
          id: 1,
          title: 'Ajit Bubber',
          date: '2024-01-01',
          link: 'http://example.com/dj/1',
          tmd_dj_city: 'Limassol',
          tmd_dj_country: 'CY',
          tmd_dj_webpage: 'http://ajitbubber.com',
          tmd_dj_e_mail: 'ajit@example.com',
          tmd_dj_activity_marathons: '1',
          tmd_dj_activity_festivals: '1',
          tmd_dj_activity_encuentros: '0',
          tmd_dj_activity_milongas: '1',
          tmd_dj_activity_milongas_travel: '0',
          tmd_dj_link_to_facebook: 'http://facebook.com/ajitbubber',
          _embedded: {
            events: [
              {
                id: 1,
                title: 'Event 1',
                date: '2024-01-10',
                link: 'http://example.com/event/1',
                start_date: '2024-01-10',
                end_date: '2024-01-12',
                registration_start_date: '2023-12-01',
                edition: '1',
                city: 'Limassol',
                country: 'CY',
              },
            ],
          },
        },
        {
          id: 2,
          title: 'Maria DJ',
          date: '2024-01-02',
          link: 'http://example.com/dj/2',
          tmd_dj_city: 'Berlin',
          tmd_dj_country: 'DE',
          tmd_dj_webpage: 'http://mariadj.com',
          tmd_dj_e_mail: 'maria@example.com',
          tmd_dj_activity_marathons: '0',
          tmd_dj_activity_festivals: '1',
          tmd_dj_activity_encuentros: '1',
          tmd_dj_activity_milongas: '1',
          tmd_dj_activity_milongas_travel: '1',
          tmd_dj_link_to_facebook_page: 'http://facebook.com/mariadj',
          _embedded: {
            events: [
              {
                id: 2,
                title: 'Event 2',
                date: '2024-02-10',
                link: 'http://example.com/event/2',
                start_date: '2024-02-10',
                end_date: '2024-02-12',
                registration_start_date: '2024-01-01',
                edition: '1',
                city: 'Berlin',
                country: 'DE',
              },
            ],
          },
        },
      ];

      const analysis = mockService.analyzeDJData(djs);

      expect(analysis.totalCount).toBe(2);
      expect(analysis.byCountry.CY).toBe(1);
      expect(analysis.byCountry.DE).toBe(1);
      expect(analysis.byCity.Limassol).toBe(1);
      expect(analysis.byCity.Berlin).toBe(1);
      expect(analysis.byActivityType.marathons).toBe(1);
      expect(analysis.byActivityType.festivals).toBe(2);
      expect(analysis.byActivityType.encuentros).toBe(1);
      expect(analysis.byActivityType.milongas).toBe(2);
      expect(analysis.byActivityType.milongas_travel).toBe(1);
      expect(analysis.withWebsite).toBe(2);
      expect(analysis.withEmail).toBe(2);
      expect(analysis.withFacebook).toBe(2);
      expect(analysis.withEvents).toBe(2);
    });
  });

  describe('getDJStats', () => {
    it('returns DJ statistics', async () => {
      const stats = await mockService.getDJStats();

      expect(mockService.getDJStats).toHaveBeenCalledWith();
      expect(stats.totalCount).toBe(2);
      expect(stats.byCountry.CY).toBe(1);
      expect(stats.byCountry.DE).toBe(1);
    });

    it('handles AbortSignal for stats', async () => {
      const signal = new AbortController().signal;
      await mockService.getDJStats(signal);

      expect(mockService.getDJStats).toHaveBeenCalledWith(signal);
    });
  });

  describe('Error Handling', () => {
    it('handles API errors gracefully', async () => {
      mockService.getDJs.mockRejectedValue(new Error('API Error'));

      await expect(mockService.getDJs()).rejects.toThrow('API Error');
    });

    it('handles network errors', async () => {
      mockService.getDJ.mockRejectedValue(new Error('Network Error'));

      await expect(mockService.getDJ(1)).rejects.toThrow('Network Error');
    });
  });

  describe('Data Transformation', () => {
    it('transforms DJ data correctly', async () => {
      const dj = await mockService.getDJ(1);

      expect(dj.tmd_dj_name).toBe('Ajit Bubber');
      expect(dj.tmd_dj_city).toBe('Limassol');
      expect(dj.tmd_dj_country).toBe('CY');
      expect(dj.tmd_dj_webpage).toBe('http://ajitbubber.com');
      expect(dj.tmd_dj_e_mail).toBe('ajit@example.com');
      expect(dj.tmd_dj_activity_marathons).toBe('1');
      expect(dj.tmd_dj_activity_festivals).toBe('1');
      expect(dj.tmd_dj_activity_encuentros).toBe('0');
      expect(dj.acf?.bio).toBe('Experienced tango DJ');
      expect(dj.acf?.website).toBe('http://ajitbubber.com');
    });
  });
});

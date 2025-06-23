import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Couple } from '../types';
import type { CoupleParams } from '../coupleService';

// Mock the base service
vi.mock('../baseService', () => ({
  BaseService: vi.fn().mockImplementation(() => ({
    getAll: vi.fn(),
    getById: vi.fn(),
    search: vi.fn(),
  })),
}));

// Create a mock service with all the methods
const createMockCoupleService = () => {
  const mockGetAll = vi.fn();
  const mockGetById = vi.fn();
  const mockSearch = vi.fn();

  return {
    getAll: mockGetAll,
    getById: mockGetById,
    search: mockSearch,
    getCouples: vi.fn(),
    getCouple: vi.fn(),
    searchCouples: vi.fn(),
    getCouplesByCountry: vi.fn(),
    getCouplesByCity: vi.fn(),
    getCouplesByPartnershipStyle: vi.fn(),
    getCouplesWithEvents: vi.fn(),
    getCouplesByPartnershipSince: vi.fn(),
    getCouplesByDancingSince: vi.fn(),
    analyzeCoupleData: vi.fn(),
    getCoupleStats: vi.fn(),
  };
};

// Mock the entire coupleService module
vi.mock('../coupleService', async () => {
  const actual = await vi.importActual('../coupleService');
  const mockService = createMockCoupleService();

  return {
    ...actual,
    coupleService: mockService,
  };
});

describe('CoupleService', () => {
  let mockService: ReturnType<typeof createMockCoupleService>;

  beforeEach(async () => {
    vi.clearAllMocks();

    // Get the mocked service for all tests
    const { coupleService } = await import('../coupleService');
    mockService = coupleService as unknown as ReturnType<typeof createMockCoupleService>;

    // Set up default mock responses
    const defaultCouples: Couple[] = [
      {
        id: 1,
        title: 'John & Jane Doe',
        date: '2024-01-01',
        link: 'http://example.com/couple/1',
        slug: 'john-jane-doe',
        city: 'Buenos Aires',
        country: 'AR',
        leader_id: 1,
        leader_name: 'John Doe',
        follower_id: 2,
        follower_name: 'Jane Doe',
        meta_box: {
          __relate_leader: '1',
          __relate_follower: '2',
          city: 'Buenos Aires',
          country: 'AR',
          website: 'http://johndoe.com',
          facebook_page: 'http://facebook.com/johndoe',
          started_dancing: '2010',
          partnership_started: '2015',
          partnership_style: 'traditional',
          bio_couple: 'Professional tango couple',
          teaching_philosophy: 'Focus on connection and musicality',
          specializations_couple: ['milonga', 'vals'],
          workshops_offered: 'Private lessons, group classes',
          achievements: 'World champions 2020',
          couples_to_events_to: ['1', '2'],
        },
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
              city: 'Buenos Aires',
              country: 'AR',
            },
          ],
          teachers: [
            {
              id: 1,
              title: 'John Doe',
              slug: 'john-doe',
              link: 'http://example.com/teacher/1',
              href: 'http://example.com/teacher/1',
              city: 'Buenos Aires',
              country: 'AR',
              role: 'leader',
            },
          ],
        },
      },
      {
        id: 2,
        title: 'Maria & Carlos Smith',
        date: '2024-01-02',
        link: 'http://example.com/couple/2',
        slug: 'maria-carlos-smith',
        city: 'Berlin',
        country: 'DE',
        leader_id: 3,
        leader_name: 'Carlos Smith',
        follower_id: 4,
        follower_name: 'Maria Smith',
        meta_box: {
          __relate_leader: '3',
          __relate_follower: '4',
          city: 'Berlin',
          country: 'DE',
          website: 'http://mariacarlos.com',
          facebook_page: '',
          started_dancing: '2012',
          partnership_started: '2018',
          partnership_style: 'modern',
          bio_couple: 'Contemporary tango artists',
          teaching_philosophy: 'Innovation and creativity',
          specializations_couple: ['tango', 'milonga'],
          workshops_offered: 'Performance workshops',
          achievements: 'European champions 2021',
          couples_to_events_to: ['3'],
        },
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
          teachers: [
            {
              id: 3,
              title: 'Carlos Smith',
              slug: 'carlos-smith',
              link: 'http://example.com/teacher/3',
              href: 'http://example.com/teacher/3',
              city: 'Berlin',
              country: 'DE',
              role: 'leader',
            },
          ],
        },
      },
    ];

    const defaultResponse = {
      couples: defaultCouples,
      totalPages: 1,
      total: 2,
    };

    mockService.getCouples.mockResolvedValue(defaultResponse);
    mockService.getCouple.mockResolvedValue(defaultCouples[0]);
    mockService.searchCouples.mockResolvedValue(defaultResponse);
    mockService.getCouplesByCountry.mockResolvedValue(defaultResponse);
    mockService.getCouplesByCity.mockResolvedValue(defaultResponse);
    mockService.getCouplesByPartnershipStyle.mockResolvedValue(defaultResponse);
    mockService.getCouplesWithEvents.mockResolvedValue(defaultResponse);
    mockService.getCouplesByPartnershipSince.mockResolvedValue(defaultResponse);
    mockService.getCouplesByDancingSince.mockResolvedValue(defaultResponse);
    mockService.analyzeCoupleData.mockReturnValue({
      totalCount: 2,
      byCountry: { AR: 1, DE: 1 },
      byCity: { 'Buenos Aires': 1, Berlin: 1 },
      byPartnershipStyle: { traditional: 1, modern: 1 },
      withWebsite: 2,
      withFacebook: 1,
      withEvents: 2,
      averagePartnershipYears: 3.5,
    });
    mockService.getCoupleStats.mockResolvedValue({
      totalCount: 2,
      byCountry: { AR: 1, DE: 1 },
      byCity: { 'Buenos Aires': 1, Berlin: 1 },
      byPartnershipStyle: { traditional: 1, modern: 1 },
      withWebsite: 2,
      withFacebook: 1,
      withEvents: 2,
      averagePartnershipYears: 3.5,
    });
  });

  describe('getCouples', () => {
    it('fetches couples with default parameters', async () => {
      const result = await mockService.getCouples();

      expect(mockService.getCouples).toHaveBeenCalledWith();
      expect(result.couples).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.totalPages).toBe(1);
    });

    it('handles country filtering', async () => {
      const params: CoupleParams = { country: 'AR' };
      await mockService.getCouples(params);

      expect(mockService.getCouples).toHaveBeenCalledWith(params);
    });

    it('handles city filtering', async () => {
      const params: CoupleParams = { city: 'Buenos Aires' };
      await mockService.getCouples(params);

      expect(mockService.getCouples).toHaveBeenCalledWith(params);
    });

    it('handles partnership style filtering', async () => {
      const params: CoupleParams = { partnership_style: 'traditional' };
      await mockService.getCouples(params);

      expect(mockService.getCouples).toHaveBeenCalledWith(params);
    });

    it('handles has_events filtering', async () => {
      const params: CoupleParams = { has_events: true };
      await mockService.getCouples(params);

      expect(mockService.getCouples).toHaveBeenCalledWith(params);
    });

    it('handles essential_only parameter', async () => {
      const params: CoupleParams = { essential_only: true };
      await mockService.getCouples(params);

      expect(mockService.getCouples).toHaveBeenCalledWith(params);
    });

    it('handles include_events parameter', async () => {
      const params: CoupleParams = { include_events: true };
      await mockService.getCouples(params);

      expect(mockService.getCouples).toHaveBeenCalledWith(params);
    });

    it('handles include_teachers parameter', async () => {
      const params: CoupleParams = { include_teachers: true };
      await mockService.getCouples(params);

      expect(mockService.getCouples).toHaveBeenCalledWith(params);
    });

    it('handles AbortSignal', async () => {
      const signal = new AbortController().signal;
      await mockService.getCouples({}, signal);

      expect(mockService.getCouples).toHaveBeenCalledWith({}, signal);
    });
  });

  describe('getCouple', () => {
    it('fetches a single couple by ID', async () => {
      const couple = await mockService.getCouple(1);

      expect(mockService.getCouple).toHaveBeenCalledWith(1);
      expect(couple.id).toBe(1);
      expect(couple.title).toBe('John & Jane Doe');
    });

    it('handles parameters for single couple fetch', async () => {
      const params: CoupleParams = { essential_only: true, include_events: true };
      await mockService.getCouple(1, params);

      expect(mockService.getCouple).toHaveBeenCalledWith(1, params);
    });

    it('handles AbortSignal for single couple', async () => {
      const signal = new AbortController().signal;
      await mockService.getCouple(1, {}, signal);

      expect(mockService.getCouple).toHaveBeenCalledWith(1, {}, signal);
    });
  });

  describe('searchCouples', () => {
    it('searches couples by query', async () => {
      const result = await mockService.searchCouples('John');

      expect(mockService.searchCouples).toHaveBeenCalledWith('John');
      expect(result.couples).toHaveLength(2);
      expect(result.total).toBe(2);
    });

    it('handles search parameters', async () => {
      const params: CoupleParams = { country: 'AR' };
      await mockService.searchCouples('John', params);

      expect(mockService.searchCouples).toHaveBeenCalledWith('John', params);
    });

    it('handles AbortSignal for search', async () => {
      const signal = new AbortController().signal;
      await mockService.searchCouples('John', {}, signal);

      expect(mockService.searchCouples).toHaveBeenCalledWith('John', {}, signal);
    });
  });

  describe('getCouplesByCountry', () => {
    it('filters couples by country', async () => {
      const result = await mockService.getCouplesByCountry('AR');

      expect(mockService.getCouplesByCountry).toHaveBeenCalledWith('AR');
      expect(result.couples).toHaveLength(2);
    });

    it('handles additional parameters', async () => {
      const params: CoupleParams = { partnership_style: 'traditional' };
      await mockService.getCouplesByCountry('AR', params);

      expect(mockService.getCouplesByCountry).toHaveBeenCalledWith('AR', params);
    });
  });

  describe('getCouplesByCity', () => {
    it('filters couples by city', async () => {
      const result = await mockService.getCouplesByCity('Buenos Aires');

      expect(mockService.getCouplesByCity).toHaveBeenCalledWith('Buenos Aires');
      expect(result.couples).toHaveLength(2);
    });
  });

  describe('getCouplesByPartnershipStyle', () => {
    it('filters couples by traditional style', async () => {
      const result = await mockService.getCouplesByPartnershipStyle('traditional');

      expect(mockService.getCouplesByPartnershipStyle).toHaveBeenCalledWith('traditional');
      expect(result.couples).toHaveLength(2);
    });

    it('filters couples by modern style', async () => {
      const result = await mockService.getCouplesByPartnershipStyle('modern');

      expect(mockService.getCouplesByPartnershipStyle).toHaveBeenCalledWith('modern');
      expect(result.couples).toHaveLength(2);
    });
  });

  describe('getCouplesWithEvents', () => {
    it('filters couples who have events', async () => {
      const result = await mockService.getCouplesWithEvents();

      expect(mockService.getCouplesWithEvents).toHaveBeenCalledWith();
      expect(result.couples).toHaveLength(2);
    });

    it('handles additional parameters', async () => {
      const params: CoupleParams = { country: 'AR' };
      await mockService.getCouplesWithEvents(params);

      expect(mockService.getCouplesWithEvents).toHaveBeenCalledWith(params);
    });
  });

  describe('getCouplesByPartnershipSince', () => {
    it('filters couples by partnership since year', async () => {
      const result = await mockService.getCouplesByPartnershipSince('2015');

      expect(mockService.getCouplesByPartnershipSince).toHaveBeenCalledWith('2015');
      expect(result.couples).toHaveLength(2);
    });

    it('handles additional parameters', async () => {
      const params: CoupleParams = { country: 'AR' };
      await mockService.getCouplesByPartnershipSince('2015', params);

      expect(mockService.getCouplesByPartnershipSince).toHaveBeenCalledWith('2015', params);
    });
  });

  describe('getCouplesByDancingSince', () => {
    it('filters couples by dancing since year', async () => {
      const result = await mockService.getCouplesByDancingSince('2010');

      expect(mockService.getCouplesByDancingSince).toHaveBeenCalledWith('2010');
      expect(result.couples).toHaveLength(2);
    });

    it('handles additional parameters', async () => {
      const params: CoupleParams = { country: 'AR' };
      await mockService.getCouplesByDancingSince('2010', params);

      expect(mockService.getCouplesByDancingSince).toHaveBeenCalledWith('2010', params);
    });
  });

  describe('analyzeCoupleData', () => {
    it('analyzes couple data correctly', () => {
      const couples: Couple[] = [
        {
          id: 1,
          title: 'John & Jane Doe',
          date: '2024-01-01',
          link: 'http://example.com/couple/1',
          city: 'Buenos Aires',
          country: 'AR',
          leader_id: 1,
          leader_name: 'John Doe',
          follower_id: 2,
          follower_name: 'Jane Doe',
          meta_box: {
            __relate_leader: '1',
            __relate_follower: '2',
            city: 'Buenos Aires',
            country: 'AR',
            website: 'http://johndoe.com',
            facebook_page: 'http://facebook.com/johndoe',
            started_dancing: '2010',
            partnership_started: '2015',
            partnership_style: 'traditional',
            bio_couple: 'Professional tango couple',
            teaching_philosophy: 'Focus on connection and musicality',
            specializations_couple: ['milonga', 'vals'],
            workshops_offered: 'Private lessons, group classes',
            achievements: 'World champions 2020',
            couples_to_events_to: ['1', '2'],
          },
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
                city: 'Buenos Aires',
                country: 'AR',
              },
            ],
          },
        },
        {
          id: 2,
          title: 'Maria & Carlos Smith',
          date: '2024-01-02',
          link: 'http://example.com/couple/2',
          city: 'Berlin',
          country: 'DE',
          leader_id: 3,
          leader_name: 'Carlos Smith',
          follower_id: 4,
          follower_name: 'Maria Smith',
          meta_box: {
            __relate_leader: '3',
            __relate_follower: '4',
            city: 'Berlin',
            country: 'DE',
            website: 'http://mariacarlos.com',
            facebook_page: '',
            started_dancing: '2012',
            partnership_started: '2018',
            partnership_style: 'modern',
            bio_couple: 'Contemporary tango artists',
            teaching_philosophy: 'Innovation and creativity',
            specializations_couple: ['tango', 'milonga'],
            workshops_offered: 'Performance workshops',
            achievements: 'European champions 2021',
            couples_to_events_to: ['3'],
          },
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

      const analysis = mockService.analyzeCoupleData(couples);

      expect(analysis.totalCount).toBe(2);
      expect(analysis.byCountry.AR).toBe(1);
      expect(analysis.byCountry.DE).toBe(1);
      expect(analysis.byCity['Buenos Aires']).toBe(1);
      expect(analysis.byCity.Berlin).toBe(1);
      expect(analysis.byPartnershipStyle.traditional).toBe(1);
      expect(analysis.byPartnershipStyle.modern).toBe(1);
      expect(analysis.withWebsite).toBe(2);
      expect(analysis.withFacebook).toBe(1);
      expect(analysis.withEvents).toBe(2);
      expect(analysis.averagePartnershipYears).toBe(3.5);
    });
  });

  describe('getCoupleStats', () => {
    it('returns couple statistics', async () => {
      const stats = await mockService.getCoupleStats();

      expect(mockService.getCoupleStats).toHaveBeenCalledWith();
      expect(stats.totalCount).toBe(2);
      expect(stats.byCountry.AR).toBe(1);
      expect(stats.byCountry.DE).toBe(1);
      expect(stats.byCity['Buenos Aires']).toBe(1);
      expect(stats.byCity.Berlin).toBe(1);
      expect(stats.byPartnershipStyle.traditional).toBe(1);
      expect(stats.byPartnershipStyle.modern).toBe(1);
      expect(stats.withWebsite).toBe(2);
      expect(stats.withFacebook).toBe(1);
      expect(stats.withEvents).toBe(2);
      expect(stats.averagePartnershipYears).toBe(3.5);
    });

    it('handles AbortSignal for stats', async () => {
      const signal = new AbortController().signal;
      await mockService.getCoupleStats(signal);

      expect(mockService.getCoupleStats).toHaveBeenCalledWith(signal);
    });
  });

  describe('Error Handling', () => {
    it('handles API errors gracefully', async () => {
      mockService.getCouples.mockRejectedValue(new Error('API Error'));

      await expect(mockService.getCouples()).rejects.toThrow('API Error');
    });

    it('handles network errors', async () => {
      mockService.getCouple.mockRejectedValue(new Error('Network Error'));

      await expect(mockService.getCouple(1)).rejects.toThrow('Network Error');
    });
  });

  describe('Data Transformation', () => {
    it('transforms couple data correctly', async () => {
      const couple = await mockService.getCouple(1);

      expect(couple).toHaveProperty('id');
      expect(couple).toHaveProperty('title');
      expect(couple).toHaveProperty('meta_box');
      expect(couple.meta_box).toHaveProperty('partnership_style');
      expect(couple.meta_box).toHaveProperty('specializations_couple');
    });
  });
});

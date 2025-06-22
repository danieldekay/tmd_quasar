import { BaseService } from './baseService';
import type { EventListItem, Teacher, DJ, Couple, EventSeries } from './types';

export interface ContentItem {
  id: number;
  title: string;
  type: 'event' | 'teacher' | 'dj' | 'teacher_couple' | 'event_series';
  date?: string | undefined;
  location?: string | undefined;
  country?: string | undefined;
  city?: string | undefined;
  edition?: string | undefined;
  start_date?: string | undefined;
  end_date?: string | undefined;
  registration_start_date?: string | undefined;
  name?: string | undefined; // For teachers/DJs
  bio?: string | undefined;
}

class ContentService {
  private cache = new Map<string, ContentItem>();
  private cacheExpiry = new Map<string, number>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  // Service instances
  private eventService = new BaseService<EventListItem>('/events');
  private teacherService = new BaseService<Teacher>('/teachers');
  private djService = new BaseService<DJ>('/djs');
  private coupleService = new BaseService<Couple>('/teacher-couples');
  private eventSeriesService = new BaseService<EventSeries>('/event-series');

  private getCacheKey(id: number, type: string): string {
    return `${type}_${id}`;
  }

  private isExpired(key: string): boolean {
    const expiry = this.cacheExpiry.get(key);
    return !expiry || Date.now() > expiry;
  }

  private setCache(key: string, data: ContentItem): void {
    this.cache.set(key, data);
    this.cacheExpiry.set(key, Date.now() + this.CACHE_DURATION);
  }

  async getContent(
    id: number,
    type: 'event' | 'teacher' | 'dj' | 'teacher_couple' | 'event_series',
  ): Promise<ContentItem | null> {
    const cacheKey = this.getCacheKey(id, type);

    // Return cached data if available and not expired
    if (this.cache.has(cacheKey) && !this.isExpired(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    try {
      let data: ContentItem | null = null;

      switch (type) {
        case 'event':
          data = await this.fetchEvent(id);
          break;
        case 'teacher':
          data = await this.fetchTeacher(id);
          break;
        case 'dj':
          data = await this.fetchDJ(id);
          break;
        case 'teacher_couple':
          data = await this.fetchTeacherCouple(id);
          break;
        case 'event_series':
          data = await this.fetchEventSeries(id);
          break;
      }

      if (data) {
        this.setCache(cacheKey, data);
      }

      return data;
    } catch (error) {
      console.error(`Failed to fetch ${type} ${id}:`, error);
      return null;
    }
  }

  private async fetchEvent(id: number): Promise<ContentItem | null> {
    try {
      const response = await this.eventService.getById(id, { meta_fields: 'all' });

      return {
        id: response.id,
        title: response.title,
        type: 'event',
        date: response.start_date,
        start_date: response.start_date,
        end_date: response.end_date,
        registration_start_date: response.registration_start_date,
        location: response.venue_name || response.city,
        country: response.country,
        city: response.city,
        edition: response.edition,
      };
    } catch (error) {
      console.error(`Failed to fetch event ${id}:`, error);
      return null;
    }
  }

  private async fetchTeacher(id: number): Promise<ContentItem | null> {
    try {
      const response = await this.teacherService.getById(id, { meta_fields: 'all' });

      return {
        id: response.id,
        title: response.title,
        name: response.title,
        type: 'teacher',
        bio: response.content?.rendered,
        country: response.country,
        city: response.city,
      };
    } catch (error) {
      console.error(`Failed to fetch teacher ${id}:`, error);
      return null;
    }
  }

  private async fetchDJ(id: number): Promise<ContentItem | null> {
    try {
      const response = await this.djService.getById(id, { meta_fields: 'all' });

      return {
        id: response.id,
        title: response.title,
        name: response.title,
        type: 'dj',
        bio: response.content?.rendered,
        country: response.tmd_dj_country,
        city: response.tmd_dj_city,
      };
    } catch (error) {
      console.error(`Failed to fetch DJ ${id}:`, error);
      return null;
    }
  }

  private async fetchTeacherCouple(id: number): Promise<ContentItem | null> {
    try {
      const response = await this.coupleService.getById(id, { meta_fields: 'all' });

      return {
        id: response.id,
        title: response.title,
        name: response.title,
        type: 'teacher_couple',
        bio: response.meta_box?.bio_couple,
        country: response.country,
        city: response.city,
      };
    } catch (error) {
      console.error(`Failed to fetch teacher couple ${id}:`, error);
      return null;
    }
  }

  private async fetchEventSeries(id: number): Promise<ContentItem | null> {
    try {
      const response = await this.eventSeriesService.getById(id, { meta_fields: 'all' });

      return {
        id: response.id,
        title: response.title,
        type: 'event_series',
        bio: response.content?.rendered,
        country: response.country,
        city: response.city,
      };
    } catch (error) {
      console.error(`Failed to fetch event series ${id}:`, error);
      return null;
    }
  }

  // Batch fetch multiple content items
  async getMultipleContent(
    items: Array<{
      id: number;
      type: 'event' | 'teacher' | 'dj' | 'teacher_couple' | 'event_series';
    }>,
  ): Promise<ContentItem[]> {
    const promises = items.map((item) => this.getContent(item.id, item.type));
    const results = await Promise.allSettled(promises);

    return results
      .filter(
        (result): result is PromiseFulfilledResult<ContentItem> =>
          result.status === 'fulfilled' && result.value !== null,
      )
      .map((result) => result.value);
  }

  // Clear cache
  clearCache(): void {
    this.cache.clear();
    this.cacheExpiry.clear();
  }

  // Get cache stats
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

export const contentService = new ContentService();

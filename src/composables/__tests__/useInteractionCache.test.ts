import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useInteractionCache } from '../useInteractionCache';
import type { UserInteraction } from '../../services/types';

// Mock the auth store
vi.mock('../../stores/authStore', () => ({
  useAuthStore: () => ({
    isAuthenticated: true,
    user: { id: 1 },
  }),
}));

// Mock the interaction service
vi.mock('../../services/interactionService', () => ({
  interactionService: {
    getUserInteractions: vi.fn().mockResolvedValue({
      _embedded: {
        'user-interactions': [],
      },
    }),
  },
}));

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('useInteractionCache', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  it('should initialize with empty cache', () => {
    const cache = useInteractionCache();

    expect(cache.cache.value.size).toBe(0);
    expect(cache.interactionCounts.value).toEqual({
      likes: 0,
      bookmarks: 0,
      reminders: 0,
      follows: 0,
    });
  });

  it('should add interaction to cache', () => {
    const cache = useInteractionCache();

    const interaction: UserInteraction = {
      id: 1,
      interaction_type: 'like',
      target_post_id: 123,
      target_post_type: 'tmd_event',
      interaction_date: new Date().toISOString(),
      notification_sent: false,
    };

    cache.addToCache(interaction);

    expect(cache.cache.value.size).toBe(1);
    expect(cache.interactionCounts.value.likes).toBe(1);
  });

  it('should remove interaction from cache', () => {
    const cache = useInteractionCache();

    const interaction: UserInteraction = {
      id: 1,
      interaction_type: 'bookmark',
      target_post_id: 123,
      target_post_type: 'tmd_event',
      interaction_date: new Date().toISOString(),
      notification_sent: false,
    };

    cache.addToCache(interaction);
    expect(cache.interactionCounts.value.bookmarks).toBe(1);

    cache.removeFromCache(123, 'tmd_event', 'bookmark');
    expect(cache.interactionCounts.value.bookmarks).toBe(0);
  });

  it('should get cached interactions for specific content', () => {
    const cache = useInteractionCache();

    const interaction1: UserInteraction = {
      id: 1,
      interaction_type: 'like',
      target_post_id: 123,
      target_post_type: 'tmd_event',
      interaction_date: new Date().toISOString(),
      notification_sent: false,
    };

    const interaction2: UserInteraction = {
      id: 2,
      interaction_type: 'bookmark',
      target_post_id: 123,
      target_post_type: 'tmd_event',
      interaction_date: new Date().toISOString(),
      notification_sent: false,
    };

    const interaction3: UserInteraction = {
      id: 3,
      interaction_type: 'like',
      target_post_id: 456,
      target_post_type: 'tmd_event',
      interaction_date: new Date().toISOString(),
      notification_sent: false,
    };

    cache.addToCache(interaction1);
    cache.addToCache(interaction2);
    cache.addToCache(interaction3);

    const interactions = cache.getCachedInteractions(123, 'tmd_event');
    expect(interactions).toHaveLength(2);
    expect(interactions.map((i) => i.interaction_type)).toEqual(['like', 'bookmark']);
  });

  it('should calculate interaction counts correctly', () => {
    const cache = useInteractionCache();

    // Add different types of interactions
    cache.addToCache({
      id: 1,
      interaction_type: 'like',
      target_post_id: 123,
      target_post_type: 'tmd_event',
      interaction_date: new Date().toISOString(),
      notification_sent: false,
    });

    cache.addToCache({
      id: 2,
      interaction_type: 'like',
      target_post_id: 124,
      target_post_type: 'tmd_event',
      interaction_date: new Date().toISOString(),
      notification_sent: false,
    });

    cache.addToCache({
      id: 3,
      interaction_type: 'bookmark',
      target_post_id: 125,
      target_post_type: 'tmd_event',
      interaction_date: new Date().toISOString(),
      notification_sent: false,
    });

    cache.addToCache({
      id: 4,
      interaction_type: 'reminder',
      target_post_id: 126,
      target_post_type: 'tmd_event',
      interaction_date: new Date().toISOString(),
      notification_sent: false,
    });

    cache.addToCache({
      id: 5,
      interaction_type: 'follow',
      target_post_id: 127,
      target_post_type: 'tmd_teacher',
      interaction_date: new Date().toISOString(),
      notification_sent: false,
    });

    expect(cache.interactionCounts.value).toEqual({
      likes: 2,
      bookmarks: 1,
      reminders: 1,
      follows: 1,
    });
  });
});

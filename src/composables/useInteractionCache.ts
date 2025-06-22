import { ref, computed, watch } from 'vue';
import type { InteractionType, ContentType, UserInteraction } from '../services/types';
import { interactionService } from '../services/interactionService';
import { useAuthStore } from '../stores/authStore';

interface CachedInteraction extends UserInteraction {
  isLocal?: boolean; // Flag for locally cached interactions not yet synced
  lastModified: number; // Timestamp for sync management
}

interface InteractionCounts {
  likes: number;
  bookmarks: number;
  reminders: number;
  follows: number;
}

const CACHE_KEY = 'tmd_interaction_cache';
const SYNC_INTERVAL = 30000; // 30 seconds
const MAX_CACHE_AGE = 24 * 60 * 60 * 1000; // 24 hours

export function useInteractionCache() {
  const authStore = useAuthStore();

  // Reactive cache state
  const cache = ref<Map<string, CachedInteraction>>(new Map());
  const lastSyncTime = ref<number>(0);
  const isSyncing = ref(false);
  const syncError = ref<string | null>(null);

  // Computed interaction counts
  const interactionCounts = computed<InteractionCounts>(() => {
    const counts = { likes: 0, bookmarks: 0, reminders: 0, follows: 0 };

    for (const interaction of cache.value.values()) {
      switch (interaction.interaction_type) {
        case 'like':
          counts.likes++;
          break;
        case 'bookmark':
          counts.bookmarks++;
          break;
        case 'reminder':
          counts.reminders++;
          break;
        case 'follow':
          counts.follows++;
          break;
      }
    }

    return counts;
  });

  // Generate cache key for an interaction
  const getCacheKey = (
    targetId: number,
    targetType: ContentType,
    interactionType: InteractionType,
  ): string => {
    return `${targetType}_${targetId}_${interactionType}`;
  };

  // Load cache from localStorage
  const loadCache = () => {
    if (!authStore.isAuthenticated) return;

    try {
      const stored = localStorage.getItem(`${CACHE_KEY}_${authStore.user?.id || 'anonymous'}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        const now = Date.now();

        // Filter out expired entries
        const validEntries = parsed.filter((item: CachedInteraction) => {
          return now - item.lastModified < MAX_CACHE_AGE;
        });

        cache.value = new Map(
          validEntries.map((item: CachedInteraction) => [
            getCacheKey(item.target_post_id, item.target_post_type, item.interaction_type),
            item,
          ]),
        );

        console.log(`Loaded ${cache.value.size} interactions from cache`);
      }
    } catch (error) {
      console.error('Failed to load interaction cache:', error);
    }
  };

  // Save cache to localStorage
  const saveCache = () => {
    if (!authStore.isAuthenticated) return;

    try {
      const cacheArray = Array.from(cache.value.values());
      localStorage.setItem(
        `${CACHE_KEY}_${authStore.user?.id || 'anonymous'}`,
        JSON.stringify(cacheArray),
      );
    } catch (error) {
      console.error('Failed to save interaction cache:', error);
    }
  };

  // Get interaction from cache
  const getCachedInteraction = (
    targetId: number,
    targetType: ContentType,
    interactionType: InteractionType,
  ): CachedInteraction | undefined => {
    const key = getCacheKey(targetId, targetType, interactionType);
    return cache.value.get(key);
  };

  // Get all interactions for a specific content item
  const getCachedInteractions = (
    targetId: number,
    targetType: ContentType,
  ): CachedInteraction[] => {
    return Array.from(cache.value.values()).filter(
      (interaction) =>
        interaction.target_post_id === targetId && interaction.target_post_type === targetType,
    );
  };

  // Add interaction to cache (optimistic update)
  const addToCache = (interaction: UserInteraction, isLocal = false): void => {
    const key = getCacheKey(
      interaction.target_post_id,
      interaction.target_post_type,
      interaction.interaction_type,
    );
    const cachedInteraction: CachedInteraction = {
      ...interaction,
      isLocal,
      lastModified: Date.now(),
    };

    cache.value.set(key, cachedInteraction);
    saveCache();
  };

  // Remove interaction from cache
  const removeFromCache = (
    targetId: number,
    targetType: ContentType,
    interactionType: InteractionType,
  ): void => {
    const key = getCacheKey(targetId, targetType, interactionType);
    cache.value.delete(key);
    saveCache();
  };

  // Sync cache with server
  const syncWithServer = async (): Promise<void> => {
    if (!authStore.isAuthenticated || isSyncing.value) return;

    isSyncing.value = true;
    syncError.value = null;

    try {
      console.log('Starting interaction cache sync...');

      // Get all interactions from server
      const serverInteractions = await interactionService.getUserInteractions({
        per_page: 100, // Get more interactions
      });

      // Clear cache and repopulate with server data
      cache.value.clear();

      if (serverInteractions._embedded?.['user-interactions']) {
        for (const serverInteraction of serverInteractions._embedded['user-interactions']) {
          const interaction: UserInteraction = {
            id: serverInteraction.id,
            interaction_type: serverInteraction.interaction_type,
            target_post_id:
              typeof serverInteraction.target_post_id === 'string'
                ? parseInt(serverInteraction.target_post_id, 10)
                : serverInteraction.target_post_id,
            target_post_type: serverInteraction.target_post_type,
            interaction_date: serverInteraction.interaction_date,
            expires_date: serverInteraction.expires_date,
            reminder_note: serverInteraction.reminder_note,
            private_note: serverInteraction.private_note,
            notification_sent: serverInteraction.notification_sent,
          };

          addToCache(interaction, false);
        }
      }

      lastSyncTime.value = Date.now();
      console.log(`Synced ${cache.value.size} interactions with server`);
    } catch (error) {
      syncError.value = error instanceof Error ? error.message : 'Sync failed';
      console.error('Failed to sync interactions:', error);
    } finally {
      isSyncing.value = false;
    }
  };

  // Start background sync
  let syncInterval: NodeJS.Timeout | null = null;

  const startBackgroundSync = () => {
    if (syncInterval) clearInterval(syncInterval);

    syncInterval = setInterval(() => {
      if (authStore.isAuthenticated) {
        void syncWithServer();
      }
    }, SYNC_INTERVAL);
  };

  const stopBackgroundSync = () => {
    if (syncInterval) {
      clearInterval(syncInterval);
      syncInterval = null;
    }
  };

  // Watch for authentication changes
  watch(
    () => authStore.isAuthenticated,
    (isAuthenticated) => {
      if (isAuthenticated) {
        loadCache();
        void syncWithServer();
        startBackgroundSync();
      } else {
        cache.value.clear();
        stopBackgroundSync();
      }
    },
    { immediate: true },
  );

  // Initial sync when composable is created
  if (authStore.isAuthenticated) {
    loadCache();
    void syncWithServer();
    startBackgroundSync();
  }

  return {
    // State
    cache: computed(() => cache.value),
    interactionCounts,
    lastSyncTime: computed(() => lastSyncTime.value),
    isSyncing: computed(() => isSyncing.value),
    syncError: computed(() => syncError.value),

    // Methods
    getCachedInteraction,
    getCachedInteractions,
    addToCache,
    removeFromCache,
    syncWithServer,
    loadCache,
    saveCache,
    startBackgroundSync,
    stopBackgroundSync,
  };
}

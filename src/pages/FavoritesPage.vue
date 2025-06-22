<template>
  <q-page class="q-pa-md">
    <!-- Header -->
    <div class="row justify-between items-center q-mb-lg">
      <div>
        <h1 class="text-h4 text-weight-bold q-mb-xs">My Favorites</h1>
        <p class="text-grey-6">Your bookmarked events, teachers, DJs, and more</p>
      </div>
      <div class="text-right">
        <div class="text-h5 text-primary text-weight-bold">{{ totalFavorites }}</div>
        <div class="text-caption text-grey-6">Total Favorites</div>
      </div>
    </div>

    <!-- Tabs -->
    <q-tabs
      v-model="activeTab"
      dense
      class="text-grey-6"
      active-color="primary"
      indicator-color="primary"
      align="left"
    >
      <q-tab name="bookmarks" label="Bookmarks" :badge="bookmarksCount || undefined" />
      <q-tab name="likes" label="Likes" :badge="likesCount || undefined" />
      <q-tab name="reminders" label="Reminders" :badge="remindersCount || undefined" />
      <q-tab name="following" label="Following" :badge="followingCount || undefined" />
    </q-tabs>

    <q-separator class="q-mb-lg" />

    <!-- Loading State -->
    <div v-if="loading" class="text-center q-py-xl">
      <q-spinner-dots size="50px" color="primary" />
      <div class="text-grey-6 q-mt-md">Loading your favorites...</div>
    </div>

    <!-- Content -->
    <q-tab-panels v-else v-model="activeTab" animated>
      <!-- Bookmarks Tab -->
      <q-tab-panel name="bookmarks">
        <div v-if="bookmarks.length === 0" class="text-center q-py-xl">
          <q-icon name="bookmark_border" size="60px" color="grey-4" />
          <div class="text-h6 q-mt-md text-grey-6">No bookmarks yet</div>
          <div class="text-body2 text-grey-5 q-mt-sm">
            Bookmark events and content to save them for later
          </div>
        </div>
        <div v-else class="row q-gutter-md">
          <FavoriteCard
            v-for="item in bookmarks"
            :key="`${item.type}_${item.id}`"
            :item="item"
            interaction-type="bookmark"
            @remove="handleRemove"
          />
        </div>
      </q-tab-panel>

      <!-- Likes Tab - List Format -->
      <q-tab-panel name="likes">
        <div v-if="likes.length === 0" class="text-center q-py-xl">
          <q-icon name="favorite_border" size="60px" color="grey-4" />
          <div class="text-h6 q-mt-md text-grey-6">No likes yet</div>
          <div class="text-body2 text-grey-5 q-mt-sm">
            Like events and content to show your appreciation
          </div>
        </div>
        <q-list v-else bordered separator class="rounded-borders">
          <q-item
            v-for="item in likes"
            :key="`${item.type}_${item.id}`"
            clickable
            v-ripple
            @click="navigateToItem(item)"
          >
            <q-item-section avatar>
              <q-avatar color="red-1" text-color="red-6" icon="favorite" />
            </q-item-section>

            <q-item-section>
              <q-item-label class="text-weight-medium">{{ item.title }}</q-item-label>
              <q-item-label caption>
                <q-chip
                  :icon="getTypeIcon(item.type)"
                  :color="getTypeColor(item.type)"
                  text-color="white"
                  size="sm"
                  class="q-mr-sm"
                >
                  {{ getTypeLabel(item.type) }}
                </q-chip>
                <span v-if="item.location" class="q-mr-sm">
                  <q-icon name="place" size="14px" />
                  {{ item.location }}
                </span>
                <span v-if="item.date">
                  <q-icon name="event" size="14px" />
                  {{ formatDate(item.date) }}
                </span>
              </q-item-label>
            </q-item-section>

            <q-item-section side>
              <div class="row items-center q-gutter-sm">
                <q-btn
                  flat
                  round
                  dense
                  icon="visibility"
                  color="primary"
                  @click.stop="navigateToItem(item)"
                >
                  <q-tooltip>View Details</q-tooltip>
                </q-btn>
                <InteractionButtons
                  :target-id="item.id"
                  :target-type="getContentType(item.type)"
                  :interaction-types="['like']"
                  layout="compact"
                />
              </div>
            </q-item-section>
          </q-item>
        </q-list>
      </q-tab-panel>

      <!-- Reminders Tab - Card Format -->
      <q-tab-panel name="reminders">
        <div v-if="reminders.length === 0" class="text-center q-py-xl">
          <q-icon name="schedule" size="60px" color="grey-4" />
          <div class="text-h6 q-mt-md text-grey-6">No reminders set</div>
          <div class="text-body2 text-grey-5 q-mt-sm">
            Set reminders for events so you don't miss them
          </div>
        </div>
        <div v-else class="row q-gutter-md">
          <FavoriteCard
            v-for="item in reminders"
            :key="`${item.type}_${item.id}`"
            :item="item"
            interaction-type="reminder"
            @remove="handleRemove"
          />
        </div>
      </q-tab-panel>

      <!-- Following Tab - List Format -->
      <q-tab-panel name="following">
        <div v-if="following.length === 0" class="text-center q-py-xl">
          <q-icon name="person_add_alt" size="60px" color="grey-4" />
          <div class="text-h6 q-mt-md text-grey-6">Not following anyone yet</div>
          <div class="text-body2 text-grey-5 q-mt-sm">
            Follow teachers, DJs, and event organizers to stay updated
          </div>
        </div>
        <q-list v-else bordered separator class="rounded-borders">
          <q-item
            v-for="item in following"
            :key="`${item.type}_${item.id}`"
            clickable
            v-ripple
            @click="navigateToItem(item)"
          >
            <q-item-section avatar>
              <q-avatar color="blue-1" text-color="blue-6" icon="person_add" />
            </q-item-section>

            <q-item-section>
              <q-item-label class="text-weight-medium">{{ item.title }}</q-item-label>
              <q-item-label caption>
                <q-chip
                  :icon="getTypeIcon(item.type)"
                  :color="getTypeColor(item.type)"
                  text-color="white"
                  size="sm"
                  class="q-mr-sm"
                >
                  {{ getTypeLabel(item.type) }}
                </q-chip>
                <span v-if="item.location" class="q-mr-sm">
                  <q-icon name="place" size="14px" />
                  {{ item.location }}
                </span>
                <span v-if="item.bio" class="text-grey-6">
                  {{ truncateText(item.bio, 100) }}
                </span>
              </q-item-label>
            </q-item-section>

            <q-item-section side>
              <div class="row items-center q-gutter-sm">
                <q-btn
                  flat
                  round
                  dense
                  icon="visibility"
                  color="primary"
                  @click.stop="navigateToItem(item)"
                >
                  <q-tooltip>View Profile</q-tooltip>
                </q-btn>
                <InteractionButtons
                  :target-id="item.id"
                  :target-type="getContentType(item.type)"
                  :interaction-types="['follow']"
                  layout="compact"
                />
              </div>
            </q-item-section>
          </q-item>
        </q-list>
      </q-tab-panel>
    </q-tab-panels>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useInteractionCache } from '../composables/useInteractionCache';
import { useFormatters } from '../composables/useFormatters';
import { contentService, type ContentItem } from '../services/contentService';
import type { InteractionType, ContentType } from '../services/types';
import FavoriteCard from '../components/FavoriteCard.vue';
import InteractionButtons from '../components/InteractionButtons.vue';

const router = useRouter();
const activeTab = ref('bookmarks');
const loading = ref(true);
const { cache, syncWithServer } = useInteractionCache();
const { formatDate } = useFormatters();

// Store content items separately
const contentItems = ref<Map<string, ContentItem>>(new Map());

// Enhanced interface to handle multiple interactions per item
interface ConsolidatedFavoriteItem extends ContentItem {
  interactions: Array<{
    type: InteractionType;
    date: string;
    reminderDate?: string | undefined;
    reminderNote?: string | undefined;
  }>;
  primaryInteraction: InteractionType; // The most recent or important interaction
  interactionDate: string; // Most recent interaction date
}

// Helper functions for list layouts
const getTypeIcon = (type: string): string => {
  const icons = {
    event: 'event',
    teacher: 'school',
    dj: 'music_note',
    teacher_couple: 'people',
    event_series: 'event_repeat',
  };
  return icons[type as keyof typeof icons] || 'help';
};

const getTypeColor = (type: string): string => {
  const colors = {
    event: 'primary',
    teacher: 'secondary',
    dj: 'accent',
    teacher_couple: 'info',
    event_series: 'warning',
  };
  return colors[type as keyof typeof colors] || 'grey';
};

const getTypeLabel = (type: string): string => {
  const labels = {
    event: 'Event',
    teacher: 'Teacher',
    dj: 'DJ',
    teacher_couple: 'Couple',
    event_series: 'Series',
  };
  return labels[type as keyof typeof labels] || 'Content';
};

const getContentType = (type: string): ContentType => {
  const contentTypeMap: Record<string, ContentType> = {
    event: 'tmd_event',
    teacher: 'tmd_teacher',
    dj: 'tmd_dj',
    teacher_couple: 'tmd_teacher_couple',
    event_series: 'tmd_event_series',
  };
  return contentTypeMap[type] || 'tmd_event';
};

const truncateText = (text: string, maxLength: number): string => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
};

const navigateToItem = (item: ConsolidatedFavoriteItem) => {
  const routes: Record<string, string> = {
    event: `/events/${item.id}`,
    teacher: `/teachers/${item.id}`,
    dj: `/djs/${item.id}`,
    teacher_couple: `/couples/${item.id}`,
    event_series: `/event-series/${item.id}`,
  };

  const route = routes[item.type];
  if (route) {
    void router.push(route);
  }
};

// Helper function to create consolidated favorites
const createConsolidatedFavorites = (filterType?: InteractionType) => {
  const itemsMap = new Map<string, ConsolidatedFavoriteItem>();

  Array.from(cache.value.values()).forEach((cacheItem) => {
    // Filter by interaction type if specified
    if (filterType && cacheItem.interaction_type !== filterType) return;

    const contentKey = `${cacheItem.target_post_type}_${cacheItem.target_post_id}`;
    const content = contentItems.value.get(contentKey);

    if (content) {
      const itemKey = `${content.type}_${content.id}`;

      if (itemsMap.has(itemKey)) {
        // Add interaction to existing item
        const existingItem = itemsMap.get(itemKey)!;
        existingItem.interactions.push({
          type: cacheItem.interaction_type,
          date: cacheItem.interaction_date,
          reminderDate: cacheItem.expires_date,
          reminderNote: cacheItem.reminder_note,
        });

        // Update primary interaction if this one is more recent
        if (new Date(cacheItem.interaction_date) > new Date(existingItem.interactionDate)) {
          existingItem.primaryInteraction = cacheItem.interaction_type;
          existingItem.interactionDate = cacheItem.interaction_date;
        }
      } else {
        // Create new consolidated item
        const consolidatedItem: ConsolidatedFavoriteItem = {
          ...content,
          interactions: [
            {
              type: cacheItem.interaction_type,
              date: cacheItem.interaction_date,
              reminderDate: cacheItem.expires_date,
              reminderNote: cacheItem.reminder_note,
            },
          ],
          primaryInteraction: cacheItem.interaction_type,
          interactionDate: cacheItem.interaction_date,
        };

        itemsMap.set(itemKey, consolidatedItem);
      }
    }
  });

  return Array.from(itemsMap.values()).sort(
    (a, b) => new Date(b.interactionDate).getTime() - new Date(a.interactionDate).getTime(),
  );
};

// Computed properties for each interaction type
const bookmarks = computed(() => createConsolidatedFavorites('bookmark'));
const likes = computed(() => createConsolidatedFavorites('like'));
const reminders = computed(() => createConsolidatedFavorites('reminder'));
const following = computed(() => createConsolidatedFavorites('follow'));

// Counts
const totalFavorites = computed(
  () =>
    bookmarks.value.length + likes.value.length + reminders.value.length + following.value.length,
);
const bookmarksCount = computed(() => bookmarks.value.length);
const likesCount = computed(() => likes.value.length);
const remindersCount = computed(() => reminders.value.length);
const followingCount = computed(() => following.value.length);

// Load favorites content
const loadFavorites = async () => {
  loading.value = true;

  try {
    // Sync cache to get latest interactions
    await syncWithServer();

    // Get all content items that need to be fetched
    const contentToFetch = Array.from(cache.value.values()).map((item) => {
      const contentType = item.target_post_type.replace('tmd_', '');
      const validTypes = ['event', 'teacher', 'dj', 'teacher_couple', 'event_series'];
      const type = validTypes.includes(contentType) ? contentType : 'event';
      return {
        id: item.target_post_id,
        type: type as 'event' | 'teacher' | 'dj' | 'teacher_couple' | 'event_series',
      };
    });

    if (contentToFetch.length > 0) {
      // Batch fetch content
      const fetchedContent = await contentService.getMultipleContent(contentToFetch);

      // Store content in our local map
      fetchedContent.forEach((content) => {
        const contentKey = `tmd_${content.type}_${content.id}`;
        contentItems.value.set(contentKey, content);
      });
    }
  } catch (error) {
    console.error('Failed to load favorites:', error);
  } finally {
    loading.value = false;
  }
};

// Handle removing an interaction
const handleRemove = (item: ConsolidatedFavoriteItem) => {
  // The FavoriteCard component will handle the actual removal
  // This is just for any additional cleanup if needed
  console.log('Removing favorite:', item);
};

onMounted(() => {
  void loadFavorites();
});
</script>

<style scoped>
.q-tab-panels {
  background: transparent;
}

.q-tab-panel {
  padding: 0;
}
</style>

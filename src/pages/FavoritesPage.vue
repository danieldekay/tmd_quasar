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
      <q-tab name="all" label="All" :badge="totalFavorites || undefined" />
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
      <!-- All Tab -->
      <q-tab-panel name="all">
        <div v-if="allFavorites.length === 0" class="text-center q-py-xl">
          <q-icon name="favorite_border" size="60px" color="grey-4" />
          <div class="text-h6 q-mt-md text-grey-6">No favorites yet</div>
          <div class="text-body2 text-grey-5 q-mt-sm">
            Start exploring and bookmark your favorite events, teachers, and DJs
          </div>
        </div>
        <div v-else class="row q-gutter-md">
          <FavoriteCard
            v-for="item in allFavorites"
            :key="`${item.type}_${item.id}`"
            :item="item"
            :interaction-type="item.primaryInteraction"
            @remove="handleRemove"
          />
        </div>
      </q-tab-panel>

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

      <!-- Likes Tab -->
      <q-tab-panel name="likes">
        <div v-if="likes.length === 0" class="text-center q-py-xl">
          <q-icon name="favorite_border" size="60px" color="grey-4" />
          <div class="text-h6 q-mt-md text-grey-6">No likes yet</div>
          <div class="text-body2 text-grey-5 q-mt-sm">
            Like events and content to show your appreciation
          </div>
        </div>
        <div v-else class="row q-gutter-md">
          <FavoriteCard
            v-for="item in likes"
            :key="`${item.type}_${item.id}`"
            :item="item"
            interaction-type="like"
            @remove="handleRemove"
          />
        </div>
      </q-tab-panel>

      <!-- Reminders Tab -->
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

      <!-- Following Tab -->
      <q-tab-panel name="following">
        <div v-if="following.length === 0" class="text-center q-py-xl">
          <q-icon name="person_add_alt" size="60px" color="grey-4" />
          <div class="text-h6 q-mt-md text-grey-6">Not following anyone yet</div>
          <div class="text-body2 text-grey-5 q-mt-sm">
            Follow teachers, DJs, and event organizers to stay updated
          </div>
        </div>
        <div v-else class="row q-gutter-md">
          <FavoriteCard
            v-for="item in following"
            :key="`${item.type}_${item.id}`"
            :item="item"
            interaction-type="follow"
            @remove="handleRemove"
          />
        </div>
      </q-tab-panel>
    </q-tab-panels>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useInteractionCache } from '../composables/useInteractionCache';
import { contentService, type ContentItem } from '../services/contentService';
import type { InteractionType } from '../services/types';
import FavoriteCard from '../components/FavoriteCard.vue';

const activeTab = ref('all');
const loading = ref(true);
const { cache, syncWithServer } = useInteractionCache();

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

// Computed properties for each interaction type
const allFavorites = computed(() => {
  const itemsMap = new Map<string, ConsolidatedFavoriteItem>();

  Array.from(cache.value.values()).forEach((cacheItem) => {
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
});

const bookmarks = computed(() =>
  allFavorites.value.filter((item) =>
    item.interactions.some((interaction) => interaction.type === 'bookmark'),
  ),
);

const likes = computed(() =>
  allFavorites.value.filter((item) =>
    item.interactions.some((interaction) => interaction.type === 'like'),
  ),
);

const reminders = computed(() =>
  allFavorites.value.filter((item) =>
    item.interactions.some((interaction) => interaction.type === 'reminder'),
  ),
);

const following = computed(() =>
  allFavorites.value.filter((item) =>
    item.interactions.some((interaction) => interaction.type === 'follow'),
  ),
);

// Counts
const totalFavorites = computed(() => allFavorites.value.length);
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
    const contentToFetch = Array.from(cache.value.values()).map((item) => ({
      id: item.target_post_id,
      type: item.target_post_type.replace('tmd_', '') as
        | 'event'
        | 'teacher'
        | 'dj'
        | 'teacher_couple'
        | 'event_series',
    }));

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

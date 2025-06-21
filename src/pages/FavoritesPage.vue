<template>
  <q-page class="favorites-page">
    <!-- Header -->
    <ListPageHeader
      title="My Favorites"
      subtitle="Your bookmarked events, teachers, DJs, and more"
      show-stats
      :total-count="totalFavorites"
      stats-label="Total Favorites"
    />

    <!-- Loading State -->
    <div v-if="isLoading" class="q-pa-lg">
      <q-card flat bordered>
        <q-card-section class="text-center q-pa-xl">
          <q-spinner-dots size="50px" color="primary" />
          <div class="text-h6 q-mt-md">Loading your favorites...</div>
        </q-card-section>
      </q-card>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="q-pa-lg">
      <OfflineMessage :error="error" title="Failed to load favorites" @retry="loadFavorites" />
    </div>

    <!-- Content -->
    <div v-else class="q-pa-lg">
      <!-- Filter Tabs -->
      <q-card flat bordered>
        <q-tabs
          v-model="activeTab"
          dense
          class="text-grey"
          active-color="primary"
          indicator-color="primary"
          align="justify"
          narrow-indicator
        >
          <q-tab name="all" label="All" />
          <q-tab name="bookmarks" label="Bookmarks" />
          <q-tab name="likes" label="Likes" />
          <q-tab name="reminders" label="Reminders" />
          <q-tab name="follows" label="Following" />
        </q-tabs>

        <q-separator />

        <q-tab-panels v-model="activeTab" animated>
          <!-- All Favorites -->
          <q-tab-panel name="all" class="q-pa-none">
            <div v-if="allFavorites.length === 0" class="text-center q-pa-xl">
              <q-icon name="favorite_border" size="64px" color="grey-5" />
              <div class="text-h6 q-mt-md">No favorites yet</div>
              <div class="text-caption text-grey-6">
                Start exploring and save your favorite content
              </div>
              <q-btn
                color="primary"
                label="Browse Events"
                class="q-mt-md"
                @click="$router.push('/events')"
              />
            </div>
            <div v-else>
              <ContentList :content="allFavorites" @view="viewContent" @edit="editContent" />
            </div>
          </q-tab-panel>

          <!-- Bookmarks -->
          <q-tab-panel name="bookmarks" class="q-pa-none">
            <div v-if="bookmarkedContent.length === 0" class="text-center q-pa-xl">
              <q-icon name="bookmark_border" size="64px" color="grey-5" />
              <div class="text-h6 q-mt-md">No bookmarks</div>
              <div class="text-caption text-grey-6">Bookmark content to save it for later</div>
            </div>
            <div v-else>
              <ContentList :content="bookmarkedContent" @view="viewContent" @edit="editContent" />
            </div>
          </q-tab-panel>

          <!-- Likes -->
          <q-tab-panel name="likes" class="q-pa-none">
            <div v-if="likedContent.length === 0" class="text-center q-pa-xl">
              <q-icon name="favorite_border" size="64px" color="grey-5" />
              <div class="text-h6 q-mt-md">No liked content</div>
              <div class="text-caption text-grey-6">Like content to show your appreciation</div>
            </div>
            <div v-else>
              <ContentList :content="likedContent" @view="viewContent" @edit="editContent" />
            </div>
          </q-tab-panel>

          <!-- Reminders -->
          <q-tab-panel name="reminders" class="q-pa-none">
            <div v-if="reminderContent.length === 0" class="text-center q-pa-xl">
              <q-icon name="alarm" size="64px" color="grey-5" />
              <div class="text-h6 q-mt-md">No reminders</div>
              <div class="text-caption text-grey-6">Set reminders for important events</div>
            </div>
            <div v-else>
              <ContentList :content="reminderContent" @view="viewContent" @edit="editContent" />
            </div>
          </q-tab-panel>

          <!-- Following -->
          <q-tab-panel name="follows" class="q-pa-none">
            <div v-if="followedContent.length === 0" class="text-center q-pa-xl">
              <q-icon name="notifications_none" size="64px" color="grey-5" />
              <div class="text-h6 q-mt-md">Not following anything</div>
              <div class="text-caption text-grey-6">Follow content to get updates</div>
            </div>
            <div v-else>
              <ContentList :content="followedContent" @view="viewContent" @edit="editContent" />
            </div>
          </q-tab-panel>
        </q-tab-panels>
      </q-card>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/authStore';
import type { DashboardContentItem } from '../composables/useDashboard';
import ListPageHeader from '../components/ListPageHeader.vue';
import OfflineMessage from '../components/OfflineMessage.vue';
import ContentList from '../components/ContentList.vue';

// Define interface for favorite items with interaction data
interface FavoriteItem extends DashboardContentItem {
  interaction_type: 'bookmark' | 'like' | 'reminder' | 'follow';
  interaction_date: string;
  expires_date?: string;
  reminder_note?: string;
  private_note?: string;
}

const router = useRouter();
const authStore = useAuthStore();

// State
const isLoading = ref(false);
const error = ref<string | null>(null);
const activeTab = ref('all');
const favorites = ref<FavoriteItem[]>([]);

// Computed properties
const isAuthenticated = computed(() => authStore.isAuthenticated);

const totalFavorites = computed(() => favorites.value.length);

// Filter favorites by interaction type
const allFavorites = computed(() => {
  // For now, return empty array since the API endpoints are not yet accessible
  // This will be populated once the interaction endpoints are enabled
  return favorites.value;
});

const bookmarkedContent = computed(() => {
  return favorites.value.filter((item) => item.interaction_type === 'bookmark');
});

const likedContent = computed(() => {
  return favorites.value.filter((item) => item.interaction_type === 'like');
});

const reminderContent = computed(() => {
  return favorites.value.filter((item) => item.interaction_type === 'reminder');
});

const followedContent = computed(() => {
  return favorites.value.filter((item) => item.interaction_type === 'follow');
});

// Methods
const loadFavorites = async () => {
  if (!isAuthenticated.value) {
    error.value = 'You must be logged in to view your favorites';
    return;
  }

  isLoading.value = true;
  error.value = null;

  try {
    // TODO: Implement when interaction endpoints are available
    // const response = await interactionService.getUserInteractions();
    // favorites.value = response;

    // For now, show empty state with a small delay to simulate loading
    await new Promise((resolve) => setTimeout(resolve, 500));
    favorites.value = [];

    console.log('Favorites loaded (placeholder)');
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load favorites';
    console.error('Favorites loading error:', err);
  } finally {
    isLoading.value = false;
  }
};

const viewContent = (content: DashboardContentItem) => {
  const routes = {
    event: `/events/${content.id}`,
    teacher: `/teachers/${content.id}`,
    dj: `/djs/${content.id}`,
    'event-series': `/event-series/${content.id}`,
  };

  const route = routes[content.type as keyof typeof routes];
  if (route) {
    void router.push(route);
  }
};

const editContent = (content: DashboardContentItem) => {
  // Redirect to WordPress admin edit screen
  const editUrl = `http://localhost:10014/wp-admin/post.php?post=${content.id}&action=edit`;
  window.open(editUrl, '_blank');
};

// Lifecycle
onMounted(() => {
  void loadFavorites();
});
</script>

<style lang="scss" scoped>
.favorites-page {
  // Add any specific styling for the favorites page here
}
</style>

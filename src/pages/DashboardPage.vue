<template>
  <q-page class="dashboard-page">
    <!-- Header -->
    <ListPageHeader
      title="My Dashboard"
      subtitle="Manage your content and view your published, scheduled, and draft posts"
      show-stats
      :total-count="totalContentCount"
      stats-label="Total Content"
    >
      <template #actions>
        <q-btn color="primary" icon="add" label="Create New" @click="createNewContent" />
      </template>
    </ListPageHeader>

    <!-- Loading State -->
    <div v-if="isLoading" class="q-pa-lg">
      <q-card flat bordered>
        <q-card-section class="text-center q-pa-xl">
          <q-spinner-dots size="50px" color="primary" />
          <div class="text-h6 q-mt-md">Loading your content...</div>
        </q-card-section>
      </q-card>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="q-pa-lg">
      <OfflineMessage :error="error" title="Failed to load dashboard" @retry="loadDashboard" />
    </div>

    <!-- Content -->
    <div v-else class="q-pa-lg">
      <!-- Content Statistics Cards -->
      <div class="row q-col-gutter-md q-mb-lg">
        <div class="col-12 col-sm-6 col-md-3">
          <q-card flat bordered class="text-center">
            <q-card-section>
              <div class="text-h4 text-positive">{{ publishedCount }}</div>
              <div class="text-caption">Published</div>
            </q-card-section>
          </q-card>
        </div>
        <div class="col-12 col-sm-6 col-md-3">
          <q-card flat bordered class="text-center">
            <q-card-section>
              <div class="text-h4 text-warning">{{ scheduledCount }}</div>
              <div class="text-caption">Scheduled</div>
            </q-card-section>
          </q-card>
        </div>
        <div class="col-12 col-sm-6 col-md-3">
          <q-card flat bordered class="text-center">
            <q-card-section>
              <div class="text-h4 text-grey">{{ draftCount }}</div>
              <div class="text-caption">Drafts</div>
            </q-card-section>
          </q-card>
        </div>
        <div class="col-12 col-sm-6 col-md-3">
          <q-card flat bordered class="text-center">
            <q-card-section>
              <div class="text-h4 text-info">{{ privateCount }}</div>
              <div class="text-caption">Private</div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- Content Tabs -->
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
          <q-tab name="published" label="Published" />
          <q-tab name="scheduled" label="Scheduled" />
          <q-tab name="drafts" label="Drafts" />
          <q-tab name="private" label="Private" />
        </q-tabs>

        <q-separator />

        <q-tab-panels v-model="activeTab" animated>
          <!-- Published Content -->
          <q-tab-panel name="published" class="q-pa-none">
            <div v-if="publishedContent.length === 0" class="text-center q-pa-xl">
              <q-icon name="check_circle" size="64px" color="positive" />
              <div class="text-h6 q-mt-md">No published content yet</div>
              <div class="text-caption text-grey-6">Your published content will appear here</div>
            </div>
            <div v-else>
              <ContentList :content="publishedContent" @view="viewContent" @edit="editContent" />
            </div>
          </q-tab-panel>

          <!-- Scheduled Content -->
          <q-tab-panel name="scheduled" class="q-pa-none">
            <div v-if="scheduledContent.length === 0" class="text-center q-pa-xl">
              <q-icon name="schedule" size="64px" color="warning" />
              <div class="text-h6 q-mt-md">No scheduled content</div>
              <div class="text-caption text-grey-6">Your scheduled content will appear here</div>
            </div>
            <div v-else>
              <ContentList :content="scheduledContent" @view="viewContent" @edit="editContent" />
            </div>
          </q-tab-panel>

          <!-- Draft Content -->
          <q-tab-panel name="drafts" class="q-pa-none">
            <div v-if="draftContent.length === 0" class="text-center q-pa-xl">
              <q-icon name="edit" size="64px" color="grey" />
              <div class="text-h6 q-mt-md">No draft content</div>
              <div class="text-caption text-grey-6">Your draft content will appear here</div>
            </div>
            <div v-else>
              <ContentList :content="draftContent" @view="viewContent" @edit="editContent" />
            </div>
          </q-tab-panel>

          <!-- Private Content -->
          <q-tab-panel name="private" class="q-pa-none">
            <div v-if="privateContent.length === 0" class="text-center q-pa-xl">
              <q-icon name="lock" size="64px" color="info" />
              <div class="text-h6 q-mt-md">No private content</div>
              <div class="text-caption text-grey-6">Your private content will appear here</div>
            </div>
            <div v-else>
              <ContentList :content="privateContent" @view="viewContent" @edit="editContent" />
            </div>
          </q-tab-panel>
        </q-tab-panels>
      </q-card>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/authStore';
import { userService, type UserProfile } from '../services/userService';
import ListPageHeader from '../components/ListPageHeader.vue';
import OfflineMessage from '../components/OfflineMessage.vue';
import ContentList from '../components/ContentList.vue';

const router = useRouter();
const authStore = useAuthStore();

// State
const profile = ref<UserProfile | null>(null);
const isLoading = ref(false);
const error = ref<string | null>(null);
const activeTab = ref('published');

// Computed properties
const isAuthenticated = computed(() => authStore.isAuthenticated);

const totalContentCount = computed(() => {
  if (!profile.value?.content_counts) return 0;
  const counts = profile.value.content_counts;
  return (
    counts.event.published +
    counts.event.draft +
    counts.event.private +
    counts.teacher.published +
    counts.teacher.draft +
    counts.teacher.private +
    counts.dj.published +
    counts.dj.draft +
    counts.dj.private +
    counts.event_series.published +
    counts.event_series.draft +
    counts.event_series.private
  );
});

const publishedCount = computed(() => {
  if (!profile.value?.content_counts) return 0;
  const counts = profile.value.content_counts;
  return (
    counts.event.published +
    counts.teacher.published +
    counts.dj.published +
    counts.event_series.published
  );
});

const scheduledCount = computed(() => {
  // For now, we'll count scheduled as part of published since the API doesn't distinguish
  return 0;
});

const draftCount = computed(() => {
  if (!profile.value?.content_counts) return 0;
  const counts = profile.value.content_counts;
  return counts.event.draft + counts.teacher.draft + counts.dj.draft + counts.event_series.draft;
});

const privateCount = computed(() => {
  if (!profile.value?.content_counts) return 0;
  const counts = profile.value.content_counts;
  return (
    counts.event.private + counts.teacher.private + counts.dj.private + counts.event_series.private
  );
});

// Content by status
const publishedContent = computed(() => {
  if (!profile.value?._embedded) return [];

  const content = [];

  // Add published events
  if (profile.value._embedded['authored:events']) {
    content.push(
      ...profile.value._embedded['authored:events'].map((event) => ({
        ...event,
        type: 'event',
        typeLabel: 'Event',
        icon: 'event',
        color: 'primary',
      })),
    );
  }

  // Add published teachers
  if (profile.value._embedded['authored:teachers']) {
    content.push(
      ...profile.value._embedded['authored:teachers'].map((teacher) => ({
        ...teacher,
        type: 'teacher',
        typeLabel: 'Teacher',
        icon: 'school',
        color: 'secondary',
      })),
    );
  }

  // Add published DJs
  if (profile.value._embedded['authored:djs']) {
    content.push(
      ...profile.value._embedded['authored:djs'].map((dj) => ({
        ...dj,
        type: 'dj',
        typeLabel: 'DJ',
        icon: 'music_note',
        color: 'accent',
      })),
    );
  }

  // Add published event series
  if (profile.value._embedded['authored:event-series']) {
    content.push(
      ...profile.value._embedded['authored:event-series'].map((series) => ({
        ...series,
        type: 'event-series',
        typeLabel: 'Event Series',
        icon: 'event_repeat',
        color: 'positive',
      })),
    );
  }

  return content;
});

const scheduledContent = computed(() => {
  // For now, return empty array since we don't have scheduled content in the API
  return [];
});

const draftContent = computed(() => {
  // For now, return empty array since we don't have draft content in the API
  return [];
});

const privateContent = computed(() => {
  // For now, return empty array since we don't have private content in the API
  return [];
});

// Methods
const loadDashboard = async () => {
  if (!isAuthenticated.value) {
    error.value = 'You must be logged in to view your dashboard';
    return;
  }

  isLoading.value = true;
  error.value = null;

  try {
    const token = authStore.token;
    if (!token) {
      throw new Error('No authentication token available');
    }

    profile.value = await userService.getCurrentUserProfile(token, {
      _embed: true, // Include authored content
    });
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load dashboard';
    console.error('Dashboard loading error:', err);
  } finally {
    isLoading.value = false;
  }
};

interface ContentItem {
  id: number;
  title: string;
  type: string;
  typeLabel: string;
  icon: string;
  color: string;
  city?: string;
  country?: string;
  start_date?: string;
  end_date?: string;
  link?: string;
}

const viewContent = (content: ContentItem) => {
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

const editContent = (content: ContentItem) => {
  // Redirect to WordPress admin edit screen
  const editUrl = `http://localhost:10014/wp-admin/post.php?post=${content.id}&action=edit`;
  window.open(editUrl, '_blank');
};

const createNewContent = () => {
  // Redirect to WordPress admin new post screen
  const newPostUrl = 'http://localhost:10014/wp-admin/post-new.php';
  window.open(newPostUrl, '_blank');
};

// Watch for authentication changes
watch(
  isAuthenticated,
  (isAuth) => {
    if (isAuth && !profile.value) {
      void loadDashboard();
    } else if (!isAuth) {
      profile.value = null;
      error.value = 'You must be logged in to view your dashboard';
    }
  },
  { immediate: true },
);

// Load dashboard on mount
onMounted(() => {
  if (isAuthenticated.value) {
    void loadDashboard();
  }
});
</script>

<style lang="scss" scoped>
.dashboard-page {
  .q-tab-panels {
    background: transparent;
  }
}
</style>

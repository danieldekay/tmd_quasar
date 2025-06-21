<template>
  <div class="interaction-buttons" :class="layoutClass">
    <!-- Like Button -->
    <q-btn
      v-if="showLike"
      :flat="layout === 'floating'"
      :round="layout === 'floating'"
      :dense="layout === 'compact'"
      :color="isLiked ? 'red' : 'grey-6'"
      :icon="isLiked ? 'favorite' : 'favorite_border'"
      :class="buttonClass"
      @click="toggleLike"
      :loading="loadingStates.like"
    >
      <q-tooltip>{{ isLiked ? 'Unlike' : 'Like this content' }}</q-tooltip>
      <span v-if="layout === 'expanded' && (likeCount || 0) > 0" class="q-ml-xs">{{
        likeCount || 0
      }}</span>
    </q-btn>

    <!-- Bookmark Button -->
    <q-btn
      v-if="showBookmark"
      :flat="layout === 'floating'"
      :round="layout === 'floating'"
      :dense="layout === 'compact'"
      :color="isBookmarked ? 'amber' : 'grey-6'"
      :icon="isBookmarked ? 'bookmark' : 'bookmark_border'"
      :class="buttonClass"
      @click="toggleBookmark"
      :loading="loadingStates.bookmark"
    >
      <q-tooltip>{{ isBookmarked ? 'Remove bookmark' : 'Bookmark for later' }}</q-tooltip>
    </q-btn>

    <!-- Reminder Button (Events only) -->
    <q-btn
      v-if="showReminder && targetType === 'tmd_event'"
      :flat="layout === 'floating'"
      :round="layout === 'floating'"
      :dense="layout === 'compact'"
      :color="hasReminder ? 'orange' : 'grey-6'"
      :icon="hasReminder ? 'alarm_on' : 'alarm_add'"
      :class="buttonClass"
      @click="openReminderDialog"
      :loading="loadingStates.reminder"
    >
      <q-tooltip>{{ hasReminder ? 'Edit reminder' : 'Set reminder' }}</q-tooltip>
    </q-btn>

    <!-- Follow Button (Profiles only) -->
    <q-btn
      v-if="showFollow && isProfileType"
      :flat="layout === 'floating'"
      :round="layout === 'floating'"
      :dense="layout === 'compact'"
      :color="isFollowing ? 'blue' : 'grey-6'"
      :icon="isFollowing ? 'notifications_active' : 'notifications_none'"
      :class="buttonClass"
      @click="toggleFollow"
      :loading="loadingStates.follow"
    >
      <q-tooltip>{{ isFollowing ? 'Unfollow' : 'Follow for updates' }}</q-tooltip>
      <span v-if="layout === 'expanded'" class="q-ml-xs">
        {{ isFollowing ? 'Following' : 'Follow' }}
      </span>
    </q-btn>

    <!-- Reminder Dialog -->
    <q-dialog v-model="showReminderDialog">
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">Set Reminder</div>
          <div class="text-caption text-grey-6">Get notified about this event</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-input
            v-model="reminderDate"
            type="datetime-local"
            label="Reminder Date & Time"
            outlined
            dense
            class="q-mb-md"
          />
          <q-input
            v-model="reminderNote"
            label="Note (optional)"
            outlined
            dense
            type="textarea"
            rows="2"
            placeholder="Add a personal note..."
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="grey" v-close-popup />
          <q-btn v-if="hasReminder" flat label="Remove" color="negative" @click="removeReminder" />
          <q-btn
            label="Save"
            color="primary"
            @click="saveReminder"
            :loading="loadingStates.reminder"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useAuthStore } from '../stores/authStore';

// Props
interface Props {
  targetId: number;
  targetType: 'tmd_event' | 'tmd_teacher' | 'tmd_dj' | 'tmd_teacher_couple' | 'tmd_event_series';
  layout?: 'floating' | 'compact' | 'expanded';
  showLike?: boolean;
  showBookmark?: boolean;
  showReminder?: boolean;
  showFollow?: boolean;
  likeCount?: number;
  // Current interaction states (passed from parent)
  liked?: boolean;
  bookmarked?: boolean;
  following?: boolean;
  reminder?: {
    date: string;
    note: string;
  } | null;
}

const props = withDefaults(defineProps<Props>(), {
  layout: 'compact',
  showLike: true,
  showBookmark: true,
  showReminder: true,
  showFollow: true,
  likeCount: 0,
  liked: false,
  bookmarked: false,
  following: false,
});

// Emits
const emit = defineEmits<{
  'interaction-changed': [type: string, data: Record<string, unknown>];
}>();

// Composables
const authStore = useAuthStore();

// State
const loadingStates = ref({
  like: false,
  bookmark: false,
  reminder: false,
  follow: false,
});

const showReminderDialog = ref(false);
const reminderDate = ref('');
const reminderNote = ref('');

// Computed
const isAuthenticated = computed(() => authStore.isAuthenticated);

const isLiked = computed(() => props.liked);
const isBookmarked = computed(() => props.bookmarked);
const isFollowing = computed(() => props.following);
const hasReminder = computed(() => !!props.reminder);

const isProfileType = computed(() =>
  ['tmd_teacher', 'tmd_dj', 'tmd_teacher_couple', 'tmd_event_series'].includes(props.targetType),
);

const layoutClass = computed(() => ({
  'interaction-buttons--floating': props.layout === 'floating',
  'interaction-buttons--compact': props.layout === 'compact',
  'interaction-buttons--expanded': props.layout === 'expanded',
}));

const buttonClass = computed(() => ({
  'q-mr-xs': props.layout !== 'floating',
}));

// Watch for reminder prop changes
watch(
  () => props.reminder,
  (newReminder) => {
    if (newReminder) {
      reminderDate.value = newReminder.date;
      reminderNote.value = newReminder.note;
    }
  },
  { immediate: true },
);

// Methods
const checkAuthentication = () => {
  if (!isAuthenticated.value) {
    // TODO: Show login prompt or redirect
    console.warn('User must be logged in to interact with content');
    return false;
  }
  return true;
};

const toggleLike = () => {
  if (!checkAuthentication()) return;

  loadingStates.value.like = true;
  try {
    // TODO: Implement interaction API call
    const newState = !isLiked.value;
    emit('interaction-changed', 'like', { liked: newState });

    console.log(`${newState ? 'Liked' : 'Unliked'} ${props.targetType} ${props.targetId}`);
  } catch (error) {
    console.error('Failed to toggle like:', error);
  } finally {
    loadingStates.value.like = false;
  }
};

const toggleBookmark = () => {
  if (!checkAuthentication()) return;

  loadingStates.value.bookmark = true;
  try {
    // TODO: Implement interaction API call
    const newState = !isBookmarked.value;
    emit('interaction-changed', 'bookmark', { bookmarked: newState });

    console.log(
      `${newState ? 'Bookmarked' : 'Removed bookmark'} ${props.targetType} ${props.targetId}`,
    );
  } catch (error) {
    console.error('Failed to toggle bookmark:', error);
  } finally {
    loadingStates.value.bookmark = false;
  }
};

const toggleFollow = () => {
  if (!checkAuthentication()) return;

  loadingStates.value.follow = true;
  try {
    // TODO: Implement interaction API call
    const newState = !isFollowing.value;
    emit('interaction-changed', 'follow', { following: newState });

    console.log(`${newState ? 'Following' : 'Unfollowed'} ${props.targetType} ${props.targetId}`);
  } catch (error) {
    console.error('Failed to toggle follow:', error);
  } finally {
    loadingStates.value.follow = false;
  }
};

const openReminderDialog = () => {
  if (!checkAuthentication()) return;

  showReminderDialog.value = true;

  // Set default reminder date (1 day before event start if no reminder exists)
  if (!hasReminder.value) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    reminderDate.value = tomorrow.toISOString().slice(0, 16);
  }
};

const saveReminder = () => {
  if (!reminderDate.value) return;

  loadingStates.value.reminder = true;
  try {
    // TODO: Implement interaction API call
    const reminderData = {
      date: reminderDate.value,
      note: reminderNote.value,
    };

    emit('interaction-changed', 'reminder', { reminder: reminderData });
    showReminderDialog.value = false;

    console.log(`Set reminder for ${props.targetType} ${props.targetId}:`, reminderData);
  } catch (error) {
    console.error('Failed to save reminder:', error);
  } finally {
    loadingStates.value.reminder = false;
  }
};

const removeReminder = () => {
  loadingStates.value.reminder = true;
  try {
    // TODO: Implement interaction API call
    emit('interaction-changed', 'reminder', { reminder: null });
    showReminderDialog.value = false;

    console.log(`Removed reminder for ${props.targetType} ${props.targetId}`);
  } catch (error) {
    console.error('Failed to remove reminder:', error);
  } finally {
    loadingStates.value.reminder = false;
  }
};
</script>

<style lang="scss" scoped>
.interaction-buttons {
  display: flex;
  align-items: center;

  &--floating {
    position: absolute;
    top: 16px;
    right: 16px;
    flex-direction: column;
    gap: 8px;
    z-index: 10;

    .q-btn {
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(4px);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
  }

  &--compact {
    gap: 4px;
  }

  &--expanded {
    gap: 8px;
  }
}
</style>

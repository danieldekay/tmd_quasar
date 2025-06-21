<template>
  <div v-if="hasValidTarget" class="interaction-buttons" :class="layoutClass">
    <!-- Like Button -->
    <q-btn
      v-if="showLike"
      :flat="layout === 'floating'"
      :round="layout === 'floating'"
      :dense="layout === 'compact'"
      :color="isLiked ? 'red-6' : 'grey-6'"
      :text-color="isLiked ? 'white' : undefined"
      :unelevated="isLiked"
      :icon="isLiked ? 'favorite' : 'favorite_border'"
      :class="buttonClass"
      @click="handleToggleLike"
      :loading="isLoading"
    >
      <q-tooltip>{{ isLiked ? 'Unlike' : 'Like this content' }}</q-tooltip>
    </q-btn>

    <!-- Bookmark Button -->
    <q-btn
      v-if="showBookmark"
      :flat="layout === 'floating'"
      :round="layout === 'floating'"
      :dense="layout === 'compact'"
      :color="isBookmarked ? 'amber-6' : 'grey-6'"
      :text-color="isBookmarked ? 'white' : undefined"
      :unelevated="isBookmarked"
      :icon="isBookmarked ? 'bookmark' : 'bookmark_border'"
      :class="buttonClass"
      @click="handleToggleBookmark"
      :loading="isLoading"
    >
      <q-tooltip>{{ isBookmarked ? 'Remove bookmark' : 'Bookmark for later' }}</q-tooltip>
    </q-btn>

    <!-- Reminder Button (Events only) -->
    <q-btn
      v-if="showReminder && targetType === 'tmd_event'"
      :flat="layout === 'floating'"
      :round="layout === 'floating'"
      :dense="layout === 'compact'"
      :color="hasReminder ? 'green-6' : 'grey-6'"
      :text-color="hasReminder ? 'white' : undefined"
      :unelevated="hasReminder"
      :icon="hasReminder ? 'notifications_active' : 'notifications_none'"
      :class="[buttonClass, { 'reminder-pulse': hasReminder }]"
      @click="openReminderDialog"
      :loading="isLoading"
    >
      <q-tooltip>
        <div v-if="hasReminder">
          <div class="text-weight-bold">Reminder set</div>
          <div v-if="interactionState.reminder?.date">
            {{ new Date(interactionState.reminder.date).toLocaleString() }}
          </div>
          <div v-if="interactionState.reminder?.note" class="text-caption">
            {{ interactionState.reminder.note }}
          </div>
          <div class="text-caption q-mt-xs">Click to edit</div>
        </div>
        <div v-else>Set reminder for this event</div>
      </q-tooltip>
      <!-- Badge for active reminder showing date -->
      <q-badge
        v-if="hasReminder && interactionState.reminder?.date"
        color="green-8"
        floating
        rounded
        :label="new Date(interactionState.reminder.date).toLocaleDateString()"
      />
    </q-btn>

    <!-- Follow Button (Profiles only) -->
    <q-btn
      v-if="showFollow && isProfileType"
      :flat="layout === 'floating'"
      :round="layout === 'floating'"
      :dense="layout === 'compact'"
      :color="isFollowing ? 'blue-6' : 'grey-6'"
      :text-color="isFollowing ? 'white' : undefined"
      :unelevated="isFollowing"
      :icon="isFollowing ? 'person_remove' : 'person_add'"
      :class="buttonClass"
      @click="handleToggleFollow"
      :loading="isLoading"
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
          <q-btn
            v-if="hasReminder"
            flat
            label="Remove"
            color="negative"
            @click="handleRemoveReminder"
          />
          <q-btn label="Save" color="primary" @click="saveReminder" :loading="isLoading" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useAuthStore } from '../stores/authStore';
import { useInteractions } from '../composables/useInteractions';
import type { ContentType } from '../services/types';

// Props
interface Props {
  targetId: number | undefined;
  targetType: ContentType;
  layout?: 'floating' | 'compact' | 'expanded';
  showLike?: boolean;
  showBookmark?: boolean;
  showReminder?: boolean;
  showFollow?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  layout: 'compact',
  showLike: true,
  showBookmark: true,
  showReminder: true,
  showFollow: true,
});

// Composables
const authStore = useAuthStore();

// Only initialize interactions if we have a valid targetId
const validTargetId = computed(() => props.targetId ?? 0);
const hasValidTarget = computed(() => typeof props.targetId === 'number' && props.targetId > 0);

const {
  interactionState,
  isLoading,
  loadInteractions,
  toggleLike,
  toggleBookmark,
  toggleFollow,
  setReminder,
  removeReminder: removeReminderFromComposable,
} = useInteractions(validTargetId.value, props.targetType);

// State

const showReminderDialog = ref(false);
const reminderDate = ref('');
const reminderNote = ref('');

// Computed
const isAuthenticated = computed(() => authStore.isAuthenticated);

const isLiked = computed(() => interactionState.value.liked);
const isBookmarked = computed(() => interactionState.value.bookmarked);
const isFollowing = computed(() => interactionState.value.following);
const hasReminder = computed(() => !!interactionState.value.reminder);

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

// Watch for reminder changes from the interaction state
watch(
  () => interactionState.value.reminder,
  (newReminder) => {
    if (newReminder) {
      reminderDate.value = newReminder.date;
      reminderNote.value = newReminder.note;
    }
  },
  { immediate: true },
);

// Load interactions on mount
onMounted(() => {
  void loadInteractions();
});

// Methods
const checkAuthentication = () => {
  if (!isAuthenticated.value) {
    // TODO: Show login prompt or redirect
    console.warn('User must be logged in to interact with content');
    return false;
  }
  return true;
};

const handleToggleLike = async () => {
  if (!checkAuthentication() || !hasValidTarget.value) return;
  try {
    await toggleLike();
  } catch (error) {
    console.error('Failed to toggle like:', error);
  }
};

const handleToggleBookmark = async () => {
  if (!checkAuthentication() || !hasValidTarget.value) return;
  try {
    await toggleBookmark();
  } catch (error) {
    console.error('Failed to toggle bookmark:', error);
  }
};

const handleToggleFollow = async () => {
  if (!checkAuthentication() || !hasValidTarget.value) return;
  try {
    await toggleFollow();
  } catch (error) {
    console.error('Failed to toggle follow:', error);
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

const saveReminder = async () => {
  if (!reminderDate.value) return;

  try {
    await setReminder(reminderDate.value, reminderNote.value);
    showReminderDialog.value = false;
  } catch (error) {
    console.error('Failed to save reminder:', error);
  }
};

const handleRemoveReminder = async () => {
  try {
    await removeReminderFromComposable();
    showReminderDialog.value = false;
  } catch (error) {
    console.error('Failed to remove reminder:', error);
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

// Pulse animation for active reminders
@keyframes reminder-pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.7);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(76, 175, 80, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(76, 175, 80, 0);
  }
}

.reminder-pulse {
  animation: reminder-pulse 2s infinite;
}
</style>

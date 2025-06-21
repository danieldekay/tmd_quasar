import { ref, computed } from 'vue';
import { useAuthStore } from '../stores/authStore';

export type InteractionType = 'like' | 'bookmark' | 'reminder' | 'follow';
export type ContentType =
  | 'tmd_event'
  | 'tmd_teacher'
  | 'tmd_dj'
  | 'tmd_teacher_couple'
  | 'tmd_event_series';

export interface UserInteraction {
  id: number;
  interaction_type: InteractionType;
  target_post_id: number;
  target_post_type: ContentType;
  interaction_date: string;
  expires_date?: string;
  reminder_note?: string;
  private_note?: string;
  notification_sent?: boolean;
}

export interface InteractionState {
  liked: boolean;
  bookmarked: boolean;
  following: boolean;
  reminder: {
    date: string;
    note: string;
  } | null;
  likeCount: number;
}

export function useInteractions(targetId: number, targetType: ContentType) {
  const authStore = useAuthStore();

  // State
  const interactions = ref<UserInteraction[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Computed interaction state
  const interactionState = computed<InteractionState>(() => {
    const userInteractions = interactions.value.filter(
      (i) => i.target_post_id === targetId && i.target_post_type === targetType,
    );

    const liked = userInteractions.some((i) => i.interaction_type === 'like');
    const bookmarked = userInteractions.some((i) => i.interaction_type === 'bookmark');
    const following = userInteractions.some((i) => i.interaction_type === 'follow');

    const reminderInteraction = userInteractions.find((i) => i.interaction_type === 'reminder');
    const reminder = reminderInteraction
      ? {
          date: reminderInteraction.expires_date || reminderInteraction.interaction_date,
          note: reminderInteraction.reminder_note || reminderInteraction.private_note || '',
        }
      : null;

    return {
      liked,
      bookmarked,
      following,
      reminder,
      likeCount: 0, // TODO: Get from API when available
    };
  });

  const isAuthenticated = computed(() => authStore.isAuthenticated);

  // Methods
  const loadInteractions = () => {
    if (!isAuthenticated.value) return;

    isLoading.value = true;
    error.value = null;

    try {
      // TODO: Replace with actual API call when endpoints are ready
      // For now, return empty array
      interactions.value = [];

      console.log(`Loading interactions for ${targetType} ${targetId}`);

      // Mock data for testing
      if (process.env.NODE_ENV === 'development') {
        // Simulate some interactions for testing
        interactions.value = [];
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load interactions';
      console.error('Error loading interactions:', err);
    } finally {
      isLoading.value = false;
    }
  };

  const createInteraction = (type: InteractionType, data?: Record<string, unknown>) => {
    if (!isAuthenticated.value) {
      throw new Error('Authentication required');
    }

    try {
      // TODO: Replace with actual API call
      console.log(`Creating ${type} interaction for ${targetType} ${targetId}`, data);

      // Mock creating interaction
      const newInteraction: UserInteraction = {
        id: Date.now(), // Mock ID
        interaction_type: type,
        target_post_id: targetId,
        target_post_type: targetType,
        interaction_date: new Date().toISOString(),
        ...data,
      };

      interactions.value.push(newInteraction);
      return newInteraction;
    } catch (err) {
      console.error(`Error creating ${type} interaction:`, err);
      throw err;
    }
  };

  const deleteInteraction = (type: InteractionType) => {
    if (!isAuthenticated.value) {
      throw new Error('Authentication required');
    }

    try {
      // TODO: Replace with actual API call
      console.log(`Deleting ${type} interaction for ${targetType} ${targetId}`);

      // Mock deleting interaction
      interactions.value = interactions.value.filter(
        (i) =>
          !(
            i.interaction_type === type &&
            i.target_post_id === targetId &&
            i.target_post_type === targetType
          ),
      );
    } catch (err) {
      console.error(`Error deleting ${type} interaction:`, err);
      throw err;
    }
  };

  const toggleLike = () => {
    if (interactionState.value.liked) {
      deleteInteraction('like');
    } else {
      createInteraction('like');
    }
  };

  const toggleBookmark = () => {
    if (interactionState.value.bookmarked) {
      deleteInteraction('bookmark');
    } else {
      createInteraction('bookmark');
    }
  };

  const toggleFollow = () => {
    if (interactionState.value.following) {
      deleteInteraction('follow');
    } else {
      createInteraction('follow');
    }
  };

  const setReminder = (date: string, note: string = '') => {
    // Remove existing reminder first
    if (interactionState.value.reminder) {
      deleteInteraction('reminder');
    }

    // Create new reminder
    createInteraction('reminder', {
      expires_date: date,
      reminder_note: note,
    });
  };

  const removeReminder = () => {
    deleteInteraction('reminder');
  };

  return {
    // State
    interactions,
    interactionState,
    isLoading,
    error,
    isAuthenticated,

    // Methods
    loadInteractions,
    toggleLike,
    toggleBookmark,
    toggleFollow,
    setReminder,
    removeReminder,
  };
}

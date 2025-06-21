import { ref, computed } from 'vue';
import { useAuthStore } from '../stores/authStore';
import { interactionService } from '../services/interactionService';
import type { InteractionType, ContentType, UserInteraction } from '../services/types';
import { Notify } from 'quasar';

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
  const loadInteractions = async () => {
    if (!isAuthenticated.value || !targetId || targetId <= 0) return;

    isLoading.value = true;
    error.value = null;

    try {
      console.log(`Loading interactions for ${targetType} ${targetId}`);
      const apiInteractions = await interactionService.getContentInteractions(targetId, targetType);

      // Convert API response to our UserInteraction format
      interactions.value = apiInteractions.map((apiInteraction) => ({
        id: apiInteraction.id,
        interaction_type: apiInteraction.interaction_type,
        target_post_id:
          typeof apiInteraction.target_post_id === 'string'
            ? parseInt(apiInteraction.target_post_id, 10)
            : apiInteraction.target_post_id,
        target_post_type: apiInteraction.target_post_type,
        interaction_date: apiInteraction.interaction_date,
        expires_date: apiInteraction.expires_date,
        reminder_note: apiInteraction.reminder_note,
        private_note: apiInteraction.private_note,
        notification_sent: apiInteraction.notification_sent,
      }));
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load interactions';
      console.error('Error loading interactions:', err);

      // Show user notification
      Notify.create({
        type: 'negative',
        message: 'Failed to load interactions',
        timeout: 3000,
      });
    } finally {
      isLoading.value = false;
    }
  };

  const createInteraction = async (type: InteractionType, data?: Record<string, unknown>) => {
    if (!isAuthenticated.value) {
      throw new Error('Authentication required');
    }

    if (!targetId || targetId <= 0) {
      throw new Error('Invalid target ID');
    }

    try {
      console.log(
        `Creating ${type} interaction for ${targetType} ${targetId}`,
        data || 'no additional data',
      );

      const response = await interactionService.createInteraction({
        interaction_type: type,
        target_post_id: targetId,
        target_post_type: targetType,
        expires_date: data?.expires_date as string | undefined,
        reminder_note: data?.reminder_note as string | undefined,
        private_note: data?.private_note as string | undefined,
      });

      // Convert API response to our UserInteraction format
      const newInteraction: UserInteraction = {
        id: response.id,
        interaction_type: response.interaction_type,
        target_post_id:
          typeof response.target_post_id === 'string'
            ? parseInt(response.target_post_id, 10)
            : response.target_post_id,
        target_post_type: response.target_post_type,
        interaction_date: response.interaction_date,
        expires_date: response.expires_date,
        reminder_note: response.reminder_note,
        private_note: response.private_note,
        notification_sent: response.notification_sent,
      };

      interactions.value.push(newInteraction);

      // Show success notification
      Notify.create({
        type: 'positive',
        message: `${type.charAt(0).toUpperCase() + type.slice(1)} added`,
        timeout: 2000,
      });

      return newInteraction;
    } catch (err) {
      console.error(`Error creating ${type} interaction:`, err);

      // Handle specific interaction exists error
      if (err instanceof Error && err.name === 'InteractionExistsError') {
        console.log(`${type} interaction already exists, reloading interactions to sync state`);
        // Reload interactions to sync the state
        await loadInteractions();

        Notify.create({
          type: 'info',
          message: `You have already ${type}d this content`,
          timeout: 2000,
        });
      } else {
        // Show error notification for other errors
        Notify.create({
          type: 'negative',
          message: `Failed to add ${type}`,
          timeout: 3000,
        });
      }

      throw err;
    }
  };

  const deleteInteraction = async (type: InteractionType) => {
    if (!isAuthenticated.value) {
      throw new Error('Authentication required');
    }

    if (!targetId || targetId <= 0) {
      throw new Error('Invalid target ID');
    }

    try {
      console.log(`Deleting ${type} interaction for ${targetType} ${targetId}`);

      // Find the interaction to delete
      const interactionToDelete = interactions.value.find(
        (i) =>
          i.interaction_type === type &&
          i.target_post_id === targetId &&
          i.target_post_type === targetType,
      );

      if (interactionToDelete) {
        await interactionService.deleteInteraction(interactionToDelete.id);

        // Remove from local state
        interactions.value = interactions.value.filter((i) => i.id !== interactionToDelete.id);

        // Show success notification
        Notify.create({
          type: 'positive',
          message: `${type.charAt(0).toUpperCase() + type.slice(1)} removed`,
          timeout: 2000,
        });
      }
    } catch (err) {
      console.error(`Error deleting ${type} interaction:`, err);

      // Show error notification
      Notify.create({
        type: 'negative',
        message: `Failed to remove ${type}`,
        timeout: 3000,
      });

      throw err;
    }
  };

  const toggleLike = async () => {
    try {
      if (interactionState.value.liked) {
        await deleteInteraction('like');
      } else {
        await createInteraction('like');
      }
    } catch (err) {
      // Error is already handled and notified in createInteraction/deleteInteraction
      console.error('Toggle like failed:', err);
    }
  };

  const toggleBookmark = async () => {
    try {
      if (interactionState.value.bookmarked) {
        await deleteInteraction('bookmark');
      } else {
        await createInteraction('bookmark');
      }
    } catch (err) {
      // Error is already handled and notified in createInteraction/deleteInteraction
      console.error('Toggle bookmark failed:', err);
    }
  };

  const toggleFollow = async () => {
    try {
      if (interactionState.value.following) {
        await deleteInteraction('follow');
      } else {
        await createInteraction('follow');
      }
    } catch (err) {
      // Error is already handled and notified in createInteraction/deleteInteraction
      console.error('Toggle follow failed:', err);
    }
  };

  const setReminder = async (date: string, note: string = '') => {
    try {
      // Remove existing reminder first
      if (interactionState.value.reminder) {
        await deleteInteraction('reminder');
      }

      // Create new reminder
      await createInteraction('reminder', {
        expires_date: date,
        reminder_note: note,
      });
    } catch (err) {
      // Error is already handled and notified in createInteraction/deleteInteraction
      console.error('Set reminder failed:', err);
      throw err; // Re-throw for setReminder to handle in UI
    }
  };

  const removeReminder = async () => {
    try {
      await deleteInteraction('reminder');
    } catch (err) {
      // Error is already handled and notified in deleteInteraction
      console.error('Remove reminder failed:', err);
      throw err; // Re-throw for removeReminder to handle in UI
    }
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

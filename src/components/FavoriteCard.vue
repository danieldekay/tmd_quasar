<template>
  <q-card class="favorite-card" flat bordered>
    <!-- Card Header with Type Badge only -->
    <q-card-section class="q-pb-none">
      <div class="row items-center justify-between">
        <q-chip
          :color="typeConfig.color"
          text-color="white"
          :icon="typeConfig.icon"
          size="sm"
          dense
        >
          {{ typeConfig.label }}
        </q-chip>
      </div>
    </q-card-section>

    <!-- Card Content -->
    <q-card-section>
      <!-- Title -->
      <div class="text-h6 text-weight-medium q-mb-sm cursor-pointer" @click="navigateToDetail">
        {{ item.title }}
      </div>

      <!-- Event specific info -->
      <div v-if="item.type === 'event'" class="text-body2 text-grey-7 q-mb-sm">
        <div v-if="item.start_date" class="row items-center q-gutter-xs q-mb-xs">
          <q-icon name="event" size="16px" />
          <span>{{ formatDate(item.start_date) }}</span>
          <span v-if="item.end_date && item.end_date !== item.start_date">
            - {{ formatDate(item.end_date) }}
          </span>
        </div>
        <div v-if="item.location" class="row items-center q-gutter-xs q-mb-xs">
          <q-icon name="place" size="16px" />
          <span>{{ item.location }}</span>
          <span v-if="item.country">, {{ item.country }}</span>
        </div>
        <div v-if="item.edition" class="row items-center q-gutter-xs">
          <q-icon name="tag" size="16px" />
          <span>{{ item.edition }}</span>
        </div>
      </div>

      <!-- Teacher/DJ/Couple specific info -->
      <div
        v-else-if="['teacher', 'dj', 'teacher_couple'].includes(item.type)"
        class="text-body2 text-grey-7 q-mb-sm"
      >
        <div v-if="item.city || item.country" class="row items-center q-gutter-xs q-mb-xs">
          <q-icon name="place" size="16px" />
          <span>{{ [item.city, item.country].filter(Boolean).join(', ') }}</span>
        </div>
        <div v-if="item.bio" class="bio-excerpt">
          {{ truncateText(stripHtml(item.bio), 100) }}
        </div>
      </div>

      <!-- Event Series specific info -->
      <div v-else-if="item.type === 'event_series'" class="text-body2 text-grey-7 q-mb-sm">
        <div v-if="item.city || item.country" class="row items-center q-gutter-xs q-mb-xs">
          <q-icon name="place" size="16px" />
          <span>{{ [item.city, item.country].filter(Boolean).join(', ') }}</span>
        </div>
        <div v-if="item.bio" class="bio-excerpt">
          {{ truncateText(stripHtml(item.bio), 100) }}
        </div>
      </div>

      <!-- Enhanced Reminder Details -->
      <div
        v-for="reminder in reminderInteractions"
        :key="reminder.date"
        class="reminder-details q-mt-sm"
      >
        <q-card flat bordered class="reminder-card q-pa-sm">
          <div class="row items-start q-gutter-sm">
            <q-icon name="schedule" color="orange" size="20px" />
            <div class="col">
              <div class="text-weight-medium text-orange">Reminder Set</div>
              <div v-if="isValidDate(reminder.reminderDate)" class="text-body2 q-mt-xs">
                <q-icon name="event" size="14px" class="q-mr-xs" />
                {{ formatReminderDate(reminder.reminderDate) }}
              </div>
              <div v-if="reminder.reminderNote" class="text-body2 q-mt-xs">
                <q-icon name="note" size="14px" class="q-mr-xs" />
                {{ reminder.reminderNote }}
              </div>
              <div class="text-caption text-grey-6 q-mt-xs">
                Set on {{ formatDate(reminder.date) }}
              </div>
            </div>
          </div>
        </q-card>
      </div>

      <!-- Interaction Summary -->
      <div class="text-caption text-grey-5 q-mt-sm">
        {{ interactionSummary }}
      </div>
    </q-card-section>

    <!-- Card Actions -->
    <q-card-actions class="q-pt-none">
      <q-btn flat dense color="primary" icon="visibility" label="View" @click="navigateToDetail" />

      <q-space />

      <!-- Interaction Buttons right-aligned -->
      <InteractionButtons
        :target-id="item.id"
        :target-type="contentTypeMap[item.type] || 'tmd_event'"
        :interaction-types="['like', 'bookmark', 'reminder', 'follow']"
        layout="compact"
        @interaction-changed="handleInteractionChange"
      />
    </q-card-actions>
  </q-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useFormatters } from '../composables/useFormatters';
import type { ContentItem } from '../services/contentService';
import type { InteractionType, ContentType } from '../services/types';
import InteractionButtons from './InteractionButtons.vue';

interface ConsolidatedFavoriteItem extends ContentItem {
  interactions: Array<{
    type: InteractionType;
    date: string;
    reminderDate?: string | undefined;
    reminderNote?: string | undefined;
  }>;
  primaryInteraction: InteractionType;
  interactionDate: string;
}

interface Props {
  item: ConsolidatedFavoriteItem;
  interactionType: InteractionType; // For compatibility, but we'll use all interactions
}

const props = defineProps<Props>();
const emit = defineEmits<{
  remove: [item: ConsolidatedFavoriteItem];
}>();

const router = useRouter();
const { formatDate } = useFormatters();

// Enhanced date formatting for reminders with validation
const formatDateTime = (dateString: string): string => {
  if (!dateString || dateString === 'Invalid Date') {
    return 'Invalid Date';
  }

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    }

    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  } catch {
    return 'Invalid Date';
  }
};

// Helper to check if date is valid
const isValidDate = (dateString?: string): boolean => {
  if (!dateString || dateString === 'Invalid Date') return false;
  try {
    const date = new Date(dateString);
    return !isNaN(date.getTime());
  } catch {
    return false;
  }
};

// Helper to format reminder date safely
const formatReminderDate = (dateString?: string): string => {
  if (!isValidDate(dateString)) return '';
  return formatDateTime(dateString!);
};

// Type configuration with dashboard icons
const typeConfig = computed(() => {
  const configs = {
    event: { label: 'Event', icon: 'event', color: 'primary' },
    teacher: { label: 'Teacher', icon: 'school', color: 'secondary' },
    dj: { label: 'DJ', icon: 'music_note', color: 'accent' },
    teacher_couple: { label: 'Couple', icon: 'people', color: 'info' },
    event_series: { label: 'Series', icon: 'event_repeat', color: 'warning' },
  };

  return configs[props.item.type] || { label: 'Content', icon: 'help', color: 'grey' };
});

// Content type mapping for API
const contentTypeMap: Record<string, ContentType> = {
  event: 'tmd_event',
  teacher: 'tmd_teacher',
  dj: 'tmd_dj',
  teacher_couple: 'tmd_teacher_couple',
  event_series: 'tmd_event_series',
};

// Interaction type labels
const interactionTypeLabels: Record<InteractionType, string> = {
  like: 'Liked',
  bookmark: 'Bookmarked',
  reminder: 'Reminder',
  follow: 'Following',
};

// Find all reminder interactions
const reminderInteractions = computed(() => {
  return props.item.interactions.filter((interaction) => interaction.type === 'reminder');
});

// Create interaction summary
const interactionSummary = computed(() => {
  const interactions = props.item.interactions;
  if (!interactions || interactions.length === 0) {
    return 'No interactions';
  }

  if (interactions.length === 1) {
    const firstInteraction = interactions[0];
    if (firstInteraction) {
      return `${interactionTypeLabels[firstInteraction.type]} on ${formatDate(firstInteraction.date)}`;
    }
  } else {
    const types = interactions.map((i) => interactionTypeLabels[i.type]).join(', ');
    const mostRecent = interactions.reduce((latest, current) =>
      new Date(current.date) > new Date(latest.date) ? current : latest,
    );
    return `${types} • Last updated ${formatDate(mostRecent.date)}`;
  }

  return 'No interactions';
});

// Helper functions
const stripHtml = (html: string): string => {
  const temp = document.createElement('div');
  temp.innerHTML = html;
  return temp.textContent || temp.innerText || '';
};

const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
};

// Navigation
const navigateToDetail = () => {
  const routeMap = {
    event: `/events/${props.item.id}`,
    teacher: `/teachers/${props.item.id}`,
    dj: `/djs/${props.item.id}`,
    teacher_couple: `/couples/${props.item.id}`,
    event_series: `/event-series/${props.item.id}`,
  };

  const route = routeMap[props.item.type];
  if (route) {
    void router.push(route);
  }
};

// Event handlers
const handleInteractionChange = () => {
  // The interaction has been changed, emit remove event for re-evaluation
  emit('remove', props.item);
};
</script>

<style lang="scss" scoped>
.favorite-card {
  width: 100%;
  max-width: 400px;
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
}

.favorite-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.bio-excerpt {
  line-height: 1.4;
}

.cursor-pointer {
  cursor: pointer;
}

.cursor-pointer:hover {
  color: var(--q-primary);
}

.reminder-card {
  background-color: rgba(255, 152, 0, 0.05);
  border-left: 4px solid var(--q-orange);
}

.reminder-details {
  margin-top: 8px;
}
</style>

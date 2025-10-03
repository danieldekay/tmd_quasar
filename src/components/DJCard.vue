<template>
  <q-card
    flat
    class="dj-card cursor-pointer full-height bg-white shadow-2"
    @click="$emit('click', dj.id)"
  >
    <!-- Header with Avatar and Basic Info -->
    <q-card-section class="q-pb-md dj-header">
      <div class="row items-center q-gutter-md">
        <q-avatar size="50px" class="dj-avatar bg-primary text-white">
          <q-icon name="music_note" size="24px" />
        </q-avatar>
        <div class="col">
          <div class="text-subtitle1 text-weight-bold text-white">{{ dj.displayName }}</div>
          <div v-if="dj.location" class="text-caption text-grey-3">
            <q-icon name="location_on" size="xs" class="q-mr-xs" />
            {{ dj.location }}
          </div>
          <div v-else class="text-caption text-grey-4">
            <q-icon name="music_note" size="xs" class="q-mr-xs" />
            Tango DJ
          </div>
        </div>
      </div>
    </q-card-section>

    <!-- Main Content -->
    <q-card-section class="q-py-sm">
      <!-- Bio/Description -->
      <div v-if="dj.tmd_dj_about_the_dj" class="text-caption text-grey-8 q-mb-sm line-height-sm-util">
        {{
          dj.tmd_dj_about_the_dj.length > 80
            ? dj.tmd_dj_about_the_dj.substring(0, 80) + '...'
            : dj.tmd_dj_about_the_dj
        }}
      </div>

      <!-- Activities Section -->
      <div v-if="dj.activities.length > 0" class="q-mb-sm">
        <div class="row q-gutter-xs">
          <q-chip
            v-for="activity in dj.activities.slice(0, 2)"
            :key="activity"
            dense
            size="sm"
            :color="getActivityColor(activity)"
            text-color="white"
            :icon="getActivityIcon(activity)"
            class="q-mb-xs"
          >
            {{ activity }}
          </q-chip>
          <q-chip
            v-if="dj.activities.length > 2"
            dense
            size="sm"
            color="grey-6"
            text-color="white"
            class="q-mb-xs"
          >
            +{{ dj.activities.length - 2 }}
          </q-chip>
        </div>
      </div>

      <!-- Experience Section -->
      <div v-if="dj.yearsSince" class="text-caption text-grey-6 q-mb-sm">
        <q-icon name="schedule" size="xs" class="q-mr-xs text-orange" />
        {{ dj.yearsSince }}
      </div>
    </q-card-section>

    <!-- Footer Actions -->
    <q-card-actions class="q-px-md q-pb-sm">
      <div class="row full-width items-center justify-between">
        <div class="row q-gutter-xs">
          <q-btn
            v-if="dj.tmd_dj_webpage"
            round
            dense
            size="xs"
            color="blue-grey-6"
            icon="language"
            @click.stop="openExternalLink(dj.tmd_dj_webpage)"
            glossy
          >
            <q-tooltip>Website</q-tooltip>
          </q-btn>
          <q-btn
            v-if="dj.tmd_dj_link_to_facebook || dj.tmd_dj_link_to_facebook_page"
            round
            dense
            size="xs"
            color="blue-8"
            icon="facebook"
            @click.stop="
              openExternalLink((dj.tmd_dj_link_to_facebook || dj.tmd_dj_link_to_facebook_page)!)
            "
            glossy
          >
            <q-tooltip>Facebook</q-tooltip>
          </q-btn>
          <q-btn
            v-if="dj.tmd_dj_e_mail"
            round
            dense
            size="xs"
            color="green-6"
            icon="email"
            @click.stop="openExternalLink(`mailto:${dj.tmd_dj_e_mail}`)"
            glossy
          >
            <q-tooltip>Email</q-tooltip>
          </q-btn>
        </div>

        <q-btn
          flat
          dense
          size="xs"
          color="primary"
          icon="chevron_right"
          class="text-weight-medium"
        />
      </div>
    </q-card-actions>

    <!-- Hover Effect Overlay -->
    <div class="dj-card-overlay absolute-full"></div>
  </q-card>
</template>

<script setup lang="ts">
import type { DJ } from '../services/types';

// Props
interface Props {
  dj: DJ & {
    displayName: string;
    location: string;
    activities: string[];
    yearsSince?: string;
  };
}

defineProps<Props>();

// Emits
defineEmits<{
  click: [djId: number];
}>();

// Helper functions for activity styling
const getActivityColor = (activity: string): string => {
  const colorMap: Record<string, string> = {
    Marathons: 'deep-purple',
    Festivals: 'orange',
    Encuentros: 'teal',
    Milongas: 'primary',
    Travel: 'blue-grey',
  };
  return colorMap[activity] || 'primary';
};

const getActivityIcon = (activity: string): string => {
  const iconMap: Record<string, string> = {
    Marathons: 'sports_score',
    Festivals: 'celebration',
    Encuentros: 'groups',
    Milongas: 'music_note',
    Travel: 'flight',
  };
  return iconMap[activity] || 'music_note';
};

const openExternalLink = (url: string) => {
  window.open(url, '_blank', 'noopener,noreferrer');
};
</script>

<style lang="scss" scoped>
.dj-card {
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  min-height: 140px;
  max-height: 180px;
  border-radius: 8px;
  overflow: hidden;
  position: relative;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);

    .dj-card-overlay {
      opacity: 1;
    }
  }
}

.dj-header {
  background: linear-gradient(135deg, $primary 0%, lighten($primary, 10%) 100%);
  position: relative;
  padding: 0.75rem 1rem;

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 15px;
    background: linear-gradient(180deg, transparent 0%, rgba(255, 255, 255, 0.6) 100%);
  }
}

.dj-avatar {
  border: 2px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.dj-card-overlay {
  background: linear-gradient(135deg, rgba($primary, 0.03) 0%, rgba($secondary, 0.02) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
  border-radius: 8px;
}

// .line-height-sm replaced by .line-height-sm-util utility class

.full-height {
  height: 100%;
  display: flex;
  flex-direction: column;

  .q-card__section:last-of-type {
    margin-top: auto;
  }
}

// .glossy class and its color variations removed, using Quasar's `glossy` prop on q-btn instead.
</style>

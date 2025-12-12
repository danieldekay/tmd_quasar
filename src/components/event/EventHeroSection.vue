<template>
  <div v-if="event" class="hero-section col-12">
    <div class="hero-wrapper relative-position">
      <!-- Hero Image -->
      <q-img
        :src="heroImageSrc"
        :alt="`${event.title} Featured Image`"
        :ratio="16 / 9"
        class="hero-image"
        spinner-color="primary"
      />

      <!-- Overlay Content (positioned absolutely over image) -->
      <div class="hero-overlay absolute-bottom full-width bg-gradient">
        <div class="q-pa-md">
          <!-- Event Title -->
          <h1 class="event-title text-h3 text-weight-bold q-mb-sm">
            {{ event.title }}
          </h1>

          <!-- Date Display -->
          <div class="event-date text-h6 q-mb-md">
            {{ formattedDateRange }}
          </div>

          <!-- Pills Container -->
          <div class="pills-container row q-gutter-sm">
            <!-- Category Pill -->
            <q-chip
              v-if="categoryPillData"
              :color="categoryPillData.color"
              text-color="white"
              :icon="categoryPillData.icon"
              :aria-label="`Event category: ${categoryPillData.name}`"
              class="category-pill"
            >
              {{ categoryPillData.name }}
            </q-chip>

            <!-- Edition Pill -->
            <q-chip
              v-if="editionDisplay"
              color="grey-7"
              text-color="white"
              icon="stars"
              :aria-label="`Event edition: ${editionDisplay}`"
              class="edition-pill"
            >
              {{ editionDisplay }}
            </q-chip>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { toRef } from 'vue';
import { useEventDisplay } from '../../composables/useEventDisplay';
import type { EventResponse } from '../../types/event';

// Props
interface Props {
  event: EventResponse | null;
}

const props = defineProps<Props>();

// Convert event prop to ref for composable
const eventRef = toRef(props, 'event');

// Use event display composable
const { formattedDateRange, editionDisplay, categoryPillData, heroImageSrc } =
  useEventDisplay(eventRef);
</script>

<style lang="scss" scoped>
.hero-section {
  width: 100%;
}

.hero-wrapper {
  position: relative;
  width: 100%;
  overflow: hidden;
}

.hero-image {
  width: 100%;
}

.bg-gradient {
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.7) 100%);
}

.event-title {
  color: white;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
  line-height: 1.2;
  word-wrap: break-word;
}

.event-date {
  color: rgba(255, 255, 255, 0.95);
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
}

.pills-container {
  display: flex;
  align-items: flex-start;
}

.category-pill,
.edition-pill {
  max-width: fit-content;
}

// Responsive adjustments
@media (max-width: 599px) {
  .event-title {
    font-size: 1.75rem;
  }

  .event-date {
    font-size: 1rem;
  }
}

@media (min-width: 600px) {
  .pills-container {
    flex-direction: row;
  }
}
</style>

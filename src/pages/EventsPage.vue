<template>
  <q-page padding>
    <div class="row q-col-gutter-lg">
      <div class="col-12">
        <h1 class="text-h4 q-mb-lg">Upcoming Events</h1>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="col-12 text-center">
        <q-spinner color="primary" size="3em" />
        <p class="q-mt-md">Loading events...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="col-12 text-center">
        <q-banner class="bg-negative text-white">
          {{ error }}
        </q-banner>
      </div>

      <!-- Events List -->
      <template v-else>
        <div v-for="event in events" :key="event.id" class="col-12 col-md-6 col-lg-4">
          <q-card class="event-card">
            <q-img :src="'https://cdn.quasar.dev/img/mountains.jpg'" :ratio="16 / 9">
              <div class="absolute-bottom text-subtitle2 text-center bg-transparent">
                {{ event.title }}
              </div>
            </q-img>

            <q-card-section>
              <div class="text-subtitle2">
                <q-icon name="location_on" size="xs" />
                {{ event.city }}, {{ event.country }}
              </div>
              <div class="text-caption q-mt-sm">
                <q-icon name="event" size="xs" />
                {{ formatDate(event.start_date) }}
                <template v-if="event.end_date"> - {{ formatDate(event.end_date) }} </template>
              </div>
              <div class="text-caption q-mt-sm">
                <q-icon name="category" size="xs" />
                {{ event.event_category }}
              </div>
            </q-card-section>

            <q-card-actions align="right">
              <q-btn flat color="primary" label="Details" icon="info" :to="`/events/${event.id}`" />
            </q-card-actions>
          </q-card>
        </div>
      </template>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { eventListService as eventService } from '../services';
import type { EventListItem } from '../services/types';

const events = ref<EventListItem[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);

const formatDate = (dateString?: string) => {
  if (!dateString) return 'Date TBA';
  return new Date(dateString).toISOString().split('T')[0];
};

const loadEvents = async () => {
  try {
    events.value = await eventService.getEvents();
  } catch (err) {
    console.error('Error loading events:', err);
    error.value = 'Failed to load events';
  } finally {
    loading.value = false;
  }
};

onMounted(loadEvents);
</script>

<style lang="scss" scoped>
.event-card {
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-5px);
  }
}
</style>

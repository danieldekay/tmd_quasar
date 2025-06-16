<template>
  <q-page padding>
    <div class="row q-mb-md items-center">
      <div class="col">
        <h1 class="text-h4 q-mb-none">Event Details</h1>
      </div>
      <div class="col-auto">
        <q-btn round color="primary" icon="refresh" @click="loadEvent" :loading="loading">
          <q-tooltip>Reload event</q-tooltip>
        </q-btn>
      </div>
    </div>

    <div v-if="loading" class="row justify-center">
      <q-spinner color="primary" size="3em" />
    </div>

    <div v-else-if="error" class="q-mb-md">
      <q-banner class="bg-negative text-white">
        {{ error }}
        <template v-slot:action>
          <q-btn flat label="Retry" @click="loadEvent" />
        </template>
      </q-banner>
    </div>

    <div v-else-if="event" class="row q-col-gutter-md">
      <div class="col-12 col-md-8">
        <q-card>
          <q-img :src="'https://cdn.quasar.dev/img/mountains.jpg'" :ratio="16 / 9" />
          <q-card-section>
            <div class="text-h4">{{ event.title }}</div>
            <div class="text-subtitle1 q-mt-sm">
              {{ formatDate(event.start_date) }} - {{ formatDate(event.end_date) }}
            </div>
            <div class="text-subtitle2 q-mt-sm">{{ event.city }}, {{ event.country }}</div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-4">
        <q-card>
          <q-card-section>
            <div class="text-h6">Event Details</div>
            <q-list>
              <q-item>
                <q-item-section>
                  <q-item-label caption>Category</q-item-label>
                  <q-item-label>{{ event.event_category }}</q-item-label>
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section>
                  <q-item-label caption>Location</q-item-label>
                  <q-item-label>{{ event.city }}, {{ event.country }}</q-item-label>
                </q-item-section>
              </q-item>
              <q-item v-if="event.djs">
                <q-item-section>
                  <q-item-label caption>DJs</q-item-label>
                  <q-item-label>{{ event.djs }}</q-item-label>
                </q-item-section>
              </q-item>
              <q-item v-if="event.teachers">
                <q-item-section>
                  <q-item-label caption>Teachers</q-item-label>
                  <q-item-label>{{ event.teachers }}</q-item-label>
                </q-item-section>
              </q-item>
              <q-item v-if="event.registration_start_date">
                <q-item-section>
                  <q-item-label caption>Registration Opens</q-item-label>
                  <q-item-label>{{ formatDate(event.registration_start_date) }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { wordpressService } from '../services/wordpress';
import type { Event } from '../services/wordpress';

const route = useRoute();
const event = ref<Event | null>(null);
const loading = ref(true);
const error = ref<string | null>(null);

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString();
};

interface ApiError extends Error {
  response?: {
    status: number;
    data?: unknown;
  };
  request?: unknown;
}

const loadEvent = async () => {
  const eventId = Number(route.params.id);
  if (!eventId) {
    error.value = 'Invalid event ID. Please check the URL and try again.';
    loading.value = false;
    return;
  }

  loading.value = true;
  error.value = null;

  try {
    const data = await wordpressService.getEvent(eventId);

    if (!data) {
      error.value = 'Event not found. It may have been removed or is not accessible.';
      return;
    }

    event.value = data;
  } catch (err: unknown) {
    console.error('Error loading event:', err);
    const apiError = err as ApiError;

    if (apiError.response) {
      switch (apiError.response.status) {
        case 404:
          error.value = 'Event not found. It may have been removed or is not accessible.';
          break;
        case 401:
          error.value = 'Authentication required. Please log in to view this event.';
          break;
        case 403:
          error.value = 'Access denied. You do not have permission to view this event.';
          break;
        case 500:
          error.value = 'Server error. Please try again later.';
          break;
        default:
          error.value = `Failed to load event (${apiError.response.status}). Please try again.`;
      }
    } else if (apiError.request) {
      error.value = 'Network error. Please check your connection and try again.';
    } else {
      error.value = 'An unexpected error occurred. Please try again.';
    }
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  await loadEvent();
});
</script>

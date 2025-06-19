<template>
  <q-page class="event-series-details-page">
    <!-- Loading / Error -->
    <div v-if="isLoading" class="flex flex-center q-py-xl">
      <q-spinner color="primary" size="40px" />
    </div>
    <div v-else-if="error" class="q-pa-md">
      <q-banner class="bg-negative text-white">{{ error }}</q-banner>
    </div>

    <!-- Event Series Details -->
    <template v-if="eventSeries">
      <!-- Hero Section -->
      <div class="hero-wrapper q-mb-md">
        <q-img
          :src="eventSeries.acf?.logo || 'https://cdn.quasar.dev/img/mountains.jpg'"
          :alt="`Logo of ${eventSeries.title}`"
          class="hero-img"
          loading="lazy"
          ratio="16/9"
        >
          <div class="absolute-full bg-gradient" />
          <div class="hero-content column justify-end q-pa-lg">
            <div class="text-h4 text-weight-bold text-white">
              {{ eventSeries.title }}
            </div>
            <div class="row items-center q-gutter-sm text-white q-mt-sm">
              <q-chip dense color="primary" text-color="white" icon="event_repeat">
                Event Series
              </q-chip>
              <q-chip
                v-if="eventSeries.start_date"
                dense
                color="secondary"
                text-color="white"
                icon="event"
              >
                {{ formatDate(eventSeries.start_date) }}
              </q-chip>
            </div>
          </div>
        </q-img>
      </div>

      <!-- Content -->
      <div class="q-pa-md">
        <div class="row q-col-gutter-lg">
          <!-- Description Section -->
          <div class="col-12 col-lg-8">
            <q-card flat>
              <q-card-section v-if="eventSeries.acf?.description || eventSeries.content?.rendered">
                <div class="text-h6 q-mb-md">About {{ eventSeries.title }}</div>
                <div v-if="eventSeries.acf?.description" class="text-body1 q-mb-md">
                  {{ eventSeries.acf.description }}
                </div>
                <div
                  v-else-if="eventSeries.content?.rendered"
                  v-html="eventSeries.content.rendered"
                  class="series-content"
                ></div>
              </q-card-section>
              <q-card-section v-else>
                <div class="text-h6 q-mb-md">About {{ eventSeries.title }}</div>
                <div class="text-grey-7">No description available for this event series.</div>
              </q-card-section>
            </q-card>
          </div>

          <!-- Info Sidebar -->
          <div class="col-12 col-lg-4">
            <q-card flat bordered class="bg-grey-1">
              <q-card-section>
                <div class="text-h6 q-mb-md">Series Info</div>
                <q-list dense>
                  <q-item>
                    <q-item-section avatar>
                      <q-icon name="event_repeat" color="primary" size="sm" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label class="text-weight-medium">Series Name</q-item-label>
                      <q-item-label caption>{{ eventSeries.title }}</q-item-label>
                    </q-item-section>
                  </q-item>

                  <q-item v-if="eventSeries.start_date">
                    <q-item-section avatar>
                      <q-icon name="event" color="secondary" size="sm" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label class="text-weight-medium">Start Date</q-item-label>
                      <q-item-label caption>{{ formatDate(eventSeries.start_date) }}</q-item-label>
                    </q-item-section>
                  </q-item>

                  <q-item v-if="eventSeries.registration_start_date">
                    <q-item-section avatar>
                      <q-icon name="how_to_reg" color="accent" size="sm" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label class="text-weight-medium">Registration Start</q-item-label>
                      <q-item-label caption>{{
                        formatDate(eventSeries.registration_start_date)
                      }}</q-item-label>
                    </q-item-section>
                  </q-item>

                  <q-item>
                    <q-item-section avatar>
                      <q-icon name="calendar_today" color="info" size="sm" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label class="text-weight-medium">Added</q-item-label>
                      <q-item-label caption>{{ formatDate(eventSeries.date) }}</q-item-label>
                    </q-item-section>
                  </q-item>

                  <q-item v-if="eventSeries.acf?.website">
                    <q-item-section avatar>
                      <q-icon name="link" color="positive" size="sm" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label class="text-weight-medium">Website</q-item-label>
                      <q-item-label caption>
                        <a :href="eventSeries.acf.website" target="_blank" class="text-primary">
                          Visit Website
                        </a>
                      </q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-card-section>

              <q-card-actions v-if="eventSeries.acf?.website">
                <q-btn
                  color="primary"
                  icon="launch"
                  label="Visit Website"
                  :href="eventSeries.acf.website"
                  target="_blank"
                  class="full-width"
                />
              </q-card-actions>
            </q-card>
          </div>
        </div>
      </div>
    </template>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { eventSeriesService } from '../services';
import type { EventSeries } from '../services/types';
import { useFormatters } from '../composables/useFormatters';

const { formatDate } = useFormatters();
const route = useRoute();

const eventSeries = ref<EventSeries | null>(null);
const isLoading = ref(true);
const error = ref<string | null>(null);

const loadEventSeries = async () => {
  const id = parseInt(route.params.id as string);
  if (!id) {
    error.value = 'Invalid event series ID';
    isLoading.value = false;
    return;
  }

  try {
    eventSeries.value = await eventSeriesService.getEventSeriesById(id);
  } catch (err) {
    console.error('Error loading event series:', err);
    error.value = 'Failed to load event series details';
  } finally {
    isLoading.value = false;
  }
};

onMounted(loadEventSeries);
</script>

<style lang="scss" scoped>
.event-series-details-page {
  .hero-wrapper {
    max-height: 400px;
    overflow: hidden;
  }

  .hero-img {
    min-height: 300px;
  }

  .bg-gradient {
    background: linear-gradient(to bottom, rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.7) 100%);
  }

  .series-content {
    :deep(p) {
      margin-bottom: 1em;
    }

    :deep(img) {
      max-width: 100%;
      height: auto;
    }
  }
}
</style>

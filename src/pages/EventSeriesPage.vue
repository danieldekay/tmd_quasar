<template>
  <q-page padding>
    <div class="row q-col-gutter-lg">
      <div class="col-12">
        <h1 class="text-h4 q-mb-lg">Event Series</h1>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="col-12 text-center">
        <q-spinner color="primary" size="3em" />
        <p class="q-mt-md">Loading event series...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="col-12 text-center">
        <q-banner class="bg-negative text-white">
          {{ error }}
        </q-banner>
      </div>

      <!-- Event Series List -->
      <div v-else class="col-12">
        <q-card flat bordered>
          <q-list separator>
            <q-item
              v-for="series in eventSeries"
              :key="series.id"
              clickable
              v-ripple
              :to="`/event-series/${series.id}`"
              class="series-item"
            >
              <q-item-section avatar>
                <q-avatar size="56px" rounded>
                  <img
                    :src="series.acf?.logo || 'https://cdn.quasar.dev/img/mountains.jpg'"
                    :alt="`Logo of ${series.title}`"
                  />
                </q-avatar>
              </q-item-section>

              <q-item-section>
                <q-item-label class="text-h6 text-weight-medium">
                  {{ series.title }}
                </q-item-label>
                <div class="row q-gutter-sm q-mb-xs">
                  <q-item-label caption v-if="series.start_date" class="text-secondary">
                    <q-icon name="event" size="xs" class="q-mr-xs" />
                    Start: {{ formatDate(series.start_date) }}
                  </q-item-label>
                  <q-item-label caption v-if="series.registration_start_date" class="text-accent">
                    <q-icon name="how_to_reg" size="xs" class="q-mr-xs" />
                    Registration: {{ formatDate(series.registration_start_date) }}
                  </q-item-label>
                </div>
                <q-item-label caption class="text-grey-6">
                  <q-icon name="calendar_today" size="xs" class="q-mr-xs" />
                  Added: {{ formatDate(series.date) }}
                </q-item-label>
              </q-item-section>

              <q-item-section side>
                <div class="row q-gutter-sm">
                  <q-btn
                    v-if="series.acf?.website"
                    flat
                    round
                    color="secondary"
                    icon="launch"
                    size="sm"
                    :href="series.acf.website"
                    target="_blank"
                    @click.stop
                  >
                    <q-tooltip>Visit Website</q-tooltip>
                  </q-btn>
                  <q-btn flat round color="primary" icon="chevron_right" size="sm">
                    <q-tooltip>View Details</q-tooltip>
                  </q-btn>
                </div>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { eventSeriesService } from '../services';
import type { EventSeries } from '../services/types';
import { useFormatters } from '../composables/useFormatters';

const { formatDate } = useFormatters();

const eventSeries = ref<EventSeries[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);

const loadEventSeries = async () => {
  try {
    eventSeries.value = await eventSeriesService.getEventSeries();
  } catch (err) {
    console.error('Error loading event series:', err);
    error.value = 'Failed to load event series';
  } finally {
    loading.value = false;
  }
};

onMounted(loadEventSeries);
</script>

<style lang="scss" scoped>
.series-item {
  &:hover {
    background-color: rgba(0, 0, 0, 0.04);
  }
}
</style>

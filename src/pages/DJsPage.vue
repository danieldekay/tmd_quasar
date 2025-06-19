<template>
  <q-page padding>
    <div class="row q-col-gutter-lg">
      <div class="col-12">
        <h1 class="text-h4 q-mb-lg">DJs</h1>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="col-12 text-center">
        <q-spinner color="primary" size="3em" />
        <p class="q-mt-md">Loading DJs...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="col-12 text-center">
        <q-banner class="bg-negative text-white">
          {{ error }}
        </q-banner>
      </div>

      <!-- DJs List -->
      <div v-else class="col-12">
        <q-card flat bordered>
          <q-list separator>
            <q-item
              v-for="dj in djs"
              :key="dj.id"
              clickable
              v-ripple
              :to="`/djs/${dj.id}`"
              class="dj-item"
            >
              <q-item-section avatar>
                <q-avatar size="56px">
                  <img
                    :src="dj.acf?.photo || 'https://cdn.quasar.dev/img/avatar.png'"
                    :alt="`Photo of ${dj.title}`"
                  />
                </q-avatar>
              </q-item-section>

              <q-item-section>
                <q-item-label class="text-h6 text-weight-medium">
                  {{ dj.title }}
                </q-item-label>
                <q-item-label caption v-if="dj.acf?.bio" lines="2">
                  {{ dj.acf.bio.substring(0, 150) }}{{ dj.acf.bio.length > 150 ? '...' : '' }}
                </q-item-label>
                <q-item-label caption class="text-grey-6 q-mt-xs">
                  <q-icon name="event" size="xs" class="q-mr-xs" />
                  Added: {{ formatDate(dj.date) }}
                </q-item-label>
              </q-item-section>

              <q-item-section side>
                <div class="row q-gutter-sm">
                  <q-btn
                    v-if="dj.acf?.website"
                    flat
                    round
                    color="secondary"
                    icon="launch"
                    size="sm"
                    :href="dj.acf.website"
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
import { djService } from '../services';
import type { DJ } from '../services/types';
import { useFormatters } from '../composables/useFormatters';

const { formatDate } = useFormatters();

const djs = ref<DJ[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);

const loadDJs = async () => {
  try {
    djs.value = await djService.getDJs();
  } catch (err) {
    console.error('Error loading DJs:', err);
    error.value = 'Failed to load DJs';
  } finally {
    loading.value = false;
  }
};

onMounted(loadDJs);
</script>

<style lang="scss" scoped>
.dj-item {
  &:hover {
    background-color: rgba(0, 0, 0, 0.04);
  }
}
</style>

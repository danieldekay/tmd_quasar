<template>
  <q-page class="dj-details-page">
    <!-- Loading / Error -->
    <div v-if="isLoading" class="flex flex-center q-py-xl">
      <q-spinner color="primary" size="40px" />
    </div>
    <div v-else-if="error" class="q-pa-md">
      <q-banner class="bg-negative text-white">{{ error }}</q-banner>
    </div>

    <!-- DJ Details -->
    <template v-if="dj">
      <!-- Hero Section -->
      <div class="hero-wrapper q-mb-md">
        <q-img
          :src="dj.acf?.photo || 'https://cdn.quasar.dev/img/avatar.png'"
          :alt="`Photo of ${dj.title}`"
          class="hero-img"
          loading="lazy"
          ratio="16/9"
        >
          <div class="absolute-full bg-gradient" />
          <div class="hero-content column justify-end q-pa-lg">
            <div class="text-h4 text-weight-bold text-white">
              {{ dj.title }}
            </div>
            <div class="row items-center q-gutter-sm text-white q-mt-sm">
              <q-chip dense color="primary" text-color="white" icon="library_music"> DJ </q-chip>
            </div>
          </div>
        </q-img>
      </div>

      <!-- Content -->
      <div class="q-pa-md">
        <div class="row q-col-gutter-lg">
          <!-- Bio Section -->
          <div class="col-12 col-lg-8">
            <q-card flat>
              <q-card-section v-if="dj.acf?.bio || dj.content?.rendered">
                <div class="text-h6 q-mb-md">About {{ dj.title }}</div>
                <div v-if="dj.acf?.bio" class="text-body1 q-mb-md">
                  {{ dj.acf.bio }}
                </div>
                <div
                  v-else-if="dj.content?.rendered"
                  v-html="dj.content.rendered"
                  class="dj-content"
                ></div>
              </q-card-section>
              <q-card-section v-else>
                <div class="text-h6 q-mb-md">About {{ dj.title }}</div>
                <div class="text-grey-7">No biography available for this DJ.</div>
              </q-card-section>
            </q-card>
          </div>

          <!-- Info Sidebar -->
          <div class="col-12 col-lg-4">
            <q-card flat bordered class="bg-grey-1">
              <q-card-section>
                <div class="text-h6 q-mb-md">DJ Info</div>
                <q-list dense>
                  <q-item>
                    <q-item-section avatar>
                      <q-icon name="person" color="primary" size="sm" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label class="text-weight-medium">Name</q-item-label>
                      <q-item-label caption>{{ dj.title }}</q-item-label>
                    </q-item-section>
                  </q-item>

                  <q-item>
                    <q-item-section avatar>
                      <q-icon name="event" color="secondary" size="sm" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label class="text-weight-medium">Added</q-item-label>
                      <q-item-label caption>{{ formatDate(dj.date) }}</q-item-label>
                    </q-item-section>
                  </q-item>

                  <q-item v-if="dj.acf?.website">
                    <q-item-section avatar>
                      <q-icon name="link" color="accent" size="sm" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label class="text-weight-medium">Website</q-item-label>
                      <q-item-label caption>
                        <a :href="dj.acf.website" target="_blank" class="text-primary">
                          Visit Website
                        </a>
                      </q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-card-section>

              <q-card-actions v-if="dj.acf?.website">
                <q-btn
                  color="primary"
                  icon="launch"
                  label="Visit Website"
                  :href="dj.acf.website"
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
import { djService } from '../services';
import type { DJ } from '../services/types';
import { useFormatters } from '../composables/useFormatters';

const { formatDate } = useFormatters();
const route = useRoute();

const dj = ref<DJ | null>(null);
const isLoading = ref(true);
const error = ref<string | null>(null);

const loadDJ = async () => {
  const id = parseInt(route.params.id as string);
  if (!id) {
    error.value = 'Invalid DJ ID';
    isLoading.value = false;
    return;
  }

  try {
    dj.value = await djService.getDJ(id);
  } catch (err) {
    console.error('Error loading DJ:', err);
    error.value = 'Failed to load DJ details';
  } finally {
    isLoading.value = false;
  }
};

onMounted(loadDJ);
</script>

<style lang="scss" scoped>
.dj-details-page {
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

  .dj-content {
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

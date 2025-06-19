<template>
  <q-page class="teacher-details-page">
    <!-- Loading / Error -->
    <div v-if="isLoading" class="flex flex-center q-py-xl">
      <q-spinner color="primary" size="40px" />
    </div>
    <div v-else-if="error" class="q-pa-md">
      <q-banner class="bg-negative text-white">{{ error }}</q-banner>
    </div>

    <!-- Teacher Details -->
    <template v-if="teacher">
      <!-- Hero Section -->
      <div class="hero-wrapper q-mb-md">
        <q-img
          :src="teacher.acf?.photo || 'https://cdn.quasar.dev/img/avatar.png'"
          :alt="`Photo of ${teacher.title}`"
          class="hero-img"
          loading="lazy"
          ratio="16/9"
        >
          <div class="absolute-full bg-gradient" />
          <div class="hero-content column justify-end q-pa-lg">
            <div class="text-h4 text-weight-bold text-white">
              {{ teacher.title }}
            </div>
            <div class="row items-center q-gutter-sm text-white q-mt-sm">
              <q-chip dense color="secondary" text-color="white" icon="school"> Teacher </q-chip>
              <q-chip v-if="teacher.acf?.teaching_style" dense color="accent" text-color="white">
                {{ teacher.acf.teaching_style }}
              </q-chip>
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
              <q-card-section v-if="teacher.acf?.bio || teacher.content?.rendered">
                <div class="text-h6 q-mb-md">About {{ teacher.title }}</div>
                <div v-if="teacher.acf?.bio" class="text-body1 q-mb-md">
                  {{ teacher.acf.bio }}
                </div>
                <div
                  v-else-if="teacher.content?.rendered"
                  v-html="teacher.content.rendered"
                  class="teacher-content"
                ></div>
              </q-card-section>
              <q-card-section v-else>
                <div class="text-h6 q-mb-md">About {{ teacher.title }}</div>
                <div class="text-grey-7">No biography available for this teacher.</div>
              </q-card-section>
            </q-card>
          </div>

          <!-- Info Sidebar -->
          <div class="col-12 col-lg-4">
            <q-card flat bordered class="bg-grey-1">
              <q-card-section>
                <div class="text-h6 q-mb-md">Teacher Info</div>
                <q-list dense>
                  <q-item>
                    <q-item-section avatar>
                      <q-icon name="person" color="primary" size="sm" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label class="text-weight-medium">Name</q-item-label>
                      <q-item-label caption>{{ teacher.title }}</q-item-label>
                    </q-item-section>
                  </q-item>

                  <q-item v-if="teacher.acf?.teaching_style">
                    <q-item-section avatar>
                      <q-icon name="school" color="secondary" size="sm" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label class="text-weight-medium">Teaching Style</q-item-label>
                      <q-item-label caption>{{ teacher.acf.teaching_style }}</q-item-label>
                    </q-item-section>
                  </q-item>

                  <q-item>
                    <q-item-section avatar>
                      <q-icon name="event" color="accent" size="sm" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label class="text-weight-medium">Added</q-item-label>
                      <q-item-label caption>{{ formatDate(teacher.date) }}</q-item-label>
                    </q-item-section>
                  </q-item>

                  <q-item v-if="teacher.acf?.website">
                    <q-item-section avatar>
                      <q-icon name="link" color="info" size="sm" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label class="text-weight-medium">Website</q-item-label>
                      <q-item-label caption>
                        <a :href="teacher.acf.website" target="_blank" class="text-primary">
                          Visit Website
                        </a>
                      </q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-card-section>

              <q-card-actions v-if="teacher.acf?.website">
                <q-btn
                  color="primary"
                  icon="launch"
                  label="Visit Website"
                  :href="teacher.acf.website"
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
import { teacherService } from '../services';
import type { Teacher } from '../services/types';
import { useFormatters } from '../composables/useFormatters';

const { formatDate } = useFormatters();
const route = useRoute();

const teacher = ref<Teacher | null>(null);
const isLoading = ref(true);
const error = ref<string | null>(null);

const loadTeacher = async () => {
  const id = parseInt(route.params.id as string);
  if (!id) {
    error.value = 'Invalid teacher ID';
    isLoading.value = false;
    return;
  }

  try {
    teacher.value = await teacherService.getTeacher(id);
  } catch (err) {
    console.error('Error loading teacher:', err);
    error.value = 'Failed to load teacher details';
  } finally {
    isLoading.value = false;
  }
};

onMounted(loadTeacher);
</script>

<style lang="scss" scoped>
.teacher-details-page {
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

  .teacher-content {
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

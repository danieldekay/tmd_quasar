<template>
  <q-page padding>
    <div v-if="loading" class="flex flex-center" style="min-height: 200px">
      <q-spinner color="primary" size="3em" />
    </div>

    <div v-else-if="error" class="text-center q-mt-lg">
      <q-icon name="error_outline" size="4em" color="negative" />
      <div class="text-h6 q-mt-md">Failed to load couple details</div>
      <div class="text-body2 text-grey-7 q-mt-sm">{{ error }}</div>
      <q-btn color="primary" label="Try Again" class="q-mt-md" @click="loadCouple" />
    </div>

    <div v-else-if="couple" class="q-mx-auto" style="max-width: 1200px">
      <!-- Header -->
      <div class="row items-center q-mb-lg">
        <div class="col">
          <q-btn flat round icon="arrow_back" @click="$router.go(-1)" class="q-mr-md" />
          <span class="text-h4">{{ getCoupleNames(couple) }}</span>
        </div>
        <div class="col-auto">
          <q-btn
            color="primary"
            icon="edit"
            label="Edit"
            @click="$router.push(`/couples/${couple.id}/edit`)"
          />
        </div>
      </div>

      <!-- Main Content -->
      <div class="row q-col-gutter-lg">
        <!-- Left Column -->
        <div class="col-12 col-md-8">
          <!-- Partnership Overview -->
          <q-card class="q-mb-lg">
            <q-card-section>
              <div class="text-h6 q-mb-md">Partnership Overview</div>

              <div class="row q-col-gutter-md">
                <div class="col-12 col-sm-6">
                  <div class="text-caption text-grey-7">Partnership Style</div>
                  <div class="text-body1">
                    {{ couple.meta_box?.partnership_style || 'Not specified' }}
                  </div>
                </div>
                <div class="col-12 col-sm-6">
                  <div class="text-caption text-grey-7">Partnership Started</div>
                  <div class="text-body1">
                    {{ couple.meta_box?.partnership_started || 'Not specified' }}
                  </div>
                </div>
                <div class="col-12" v-if="couple.meta_box?.bio_couple">
                  <div class="text-caption text-grey-7">About the Partnership</div>
                  <div class="text-body1 q-mt-xs">
                    {{ couple.meta_box.bio_couple }}
                  </div>
                </div>
                <div class="col-12" v-if="couple.meta_box?.teaching_philosophy">
                  <div class="text-caption text-grey-7">Teaching Philosophy</div>
                  <div class="text-body1 q-mt-xs">
                    {{ couple.meta_box.teaching_philosophy }}
                  </div>
                </div>
              </div>
            </q-card-section>
          </q-card>

          <!-- Teachers -->
          <q-card class="q-mb-lg">
            <q-card-section>
              <div class="text-h6 q-mb-md">Teachers</div>

              <div class="row q-col-gutter-md">
                <!-- Leader -->
                <div class="col-12 col-sm-6" v-if="leader">
                  <q-card flat bordered>
                    <q-card-section>
                      <div class="row items-center q-mb-sm">
                        <div class="col">
                          <div class="text-subtitle1 text-weight-medium">
                            {{ leader.title }}
                          </div>
                          <div class="text-caption text-primary">Leader</div>
                        </div>
                        <div class="col-auto">
                          <q-btn
                            flat
                            round
                            color="primary"
                            icon="person"
                            size="sm"
                            :to="`/teachers/${leader.id}`"
                          >
                            <q-tooltip>View Teacher Profile</q-tooltip>
                          </q-btn>
                        </div>
                      </div>
                      <div v-if="leader.city || leader.country">
                        <q-icon name="place" size="xs" class="q-mr-xs" />
                        {{ getTeacherLocation(leader) }}
                      </div>
                    </q-card-section>
                  </q-card>
                </div>

                <!-- Follower -->
                <div class="col-12 col-sm-6" v-if="follower">
                  <q-card flat bordered>
                    <q-card-section>
                      <div class="row items-center q-mb-sm">
                        <div class="col">
                          <div class="text-subtitle1 text-weight-medium">
                            {{ follower.title }}
                          </div>
                          <div class="text-caption text-secondary">Follower</div>
                        </div>
                        <div class="col-auto">
                          <q-btn
                            flat
                            round
                            color="primary"
                            icon="person"
                            size="sm"
                            :to="`/teachers/${follower.id}`"
                          >
                            <q-tooltip>View Teacher Profile</q-tooltip>
                          </q-btn>
                        </div>
                      </div>
                      <div v-if="follower.city || follower.country">
                        <q-icon name="place" size="xs" class="q-mr-xs" />
                        {{ getTeacherLocation(follower) }}
                      </div>
                    </q-card-section>
                  </q-card>
                </div>
              </div>
            </q-card-section>
          </q-card>

          <!-- Additional Information -->
          <q-card
            v-if="
              couple.meta_box?.specializations_couple ||
              couple.meta_box?.workshops_offered ||
              couple.meta_box?.achievements
            "
          >
            <q-card-section>
              <div class="text-h6 q-mb-md">Additional Information</div>

              <div class="row q-col-gutter-md">
                <div class="col-12" v-if="couple.meta_box?.specializations_couple">
                  <div class="text-caption text-grey-7">Specializations</div>
                  <div class="text-body1">
                    {{
                      Array.isArray(couple.meta_box.specializations_couple)
                        ? couple.meta_box.specializations_couple.join(', ')
                        : couple.meta_box.specializations_couple
                    }}
                  </div>
                </div>
                <div class="col-12" v-if="couple.meta_box?.workshops_offered">
                  <div class="text-caption text-grey-7">Workshops Offered</div>
                  <div class="text-body1">
                    {{ couple.meta_box.workshops_offered }}
                  </div>
                </div>
                <div class="col-12" v-if="couple.meta_box?.achievements">
                  <div class="text-caption text-grey-7">Achievements</div>
                  <div class="text-body1">
                    {{ couple.meta_box.achievements }}
                  </div>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Right Column -->
        <div class="col-12 col-md-4">
          <!-- Contact & Links -->
          <q-card class="q-mb-lg">
            <q-card-section>
              <div class="text-h6 q-mb-md">Contact & Links</div>

              <div class="q-gutter-sm">
                <div v-if="couple.meta_box?.website">
                  <q-btn
                    color="primary"
                    icon="language"
                    label="Website"
                    outline
                    class="full-width"
                    :href="couple.meta_box.website"
                    target="_blank"
                  />
                </div>
                <div v-if="couple.meta_box?.facebook_page">
                  <q-btn
                    color="indigo"
                    icon="facebook"
                    label="Facebook"
                    outline
                    class="full-width"
                    :href="couple.meta_box.facebook_page"
                    target="_blank"
                  />
                </div>
              </div>
            </q-card-section>
          </q-card>

          <!-- Location -->
          <q-card class="q-mb-lg" v-if="couple.city || couple.country">
            <q-card-section>
              <div class="text-h6 q-mb-md">Location</div>
              <div class="row items-center">
                <q-icon name="place" class="q-mr-sm" />
                <span>{{ getLocationText(couple) }}</span>
              </div>
            </q-card-section>
          </q-card>

          <!-- Events -->
          <q-card v-if="events && events.length > 0">
            <q-card-section>
              <div class="text-h6 q-mb-md">Recent Events</div>
              <div class="q-gutter-sm">
                <q-item
                  v-for="event in events"
                  :key="event.id"
                  clickable
                  :to="`/events/${event.id}`"
                  class="q-pa-sm rounded-borders"
                >
                  <q-item-section>
                    <q-item-label class="text-body2">{{ event.title }}</q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-icon name="arrow_forward_ios" size="xs" />
                  </q-item-section>
                </q-item>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>

    <div v-else class="text-center q-mt-lg">
      <q-icon name="search_off" size="4em" color="grey-5" />
      <div class="text-h6 q-mt-md">Couple not found</div>
      <div class="text-body2 text-grey-7 q-mt-sm">The requested couple could not be found.</div>
      <q-btn color="primary" label="Back to Couples" to="/couples" class="q-mt-md" />
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { coupleService } from '../services';
import type { Couple } from '../services/types';
import { useCountries } from '../composables/useCountries';

const route = useRoute();
const { getCountryName } = useCountries();

// State
const couple = ref<Couple | null>(null);
const loading = ref(false);
const error = ref<string | null>(null);

// Computed properties
const leader = computed(() => {
  if (!couple.value?._embedded?.teachers) return null;
  return couple.value._embedded.teachers.find((t) => t.role === 'leader') || null;
});

const follower = computed(() => {
  if (!couple.value?._embedded?.teachers) return null;
  return couple.value._embedded.teachers.find((t) => t.role === 'follower') || null;
});

const events = computed(() => {
  return couple.value?._embedded?.events || [];
});

// Helper functions
const getCoupleNames = (couple: Couple): string => {
  if (couple._embedded?.teachers) {
    const teachers = couple._embedded.teachers;
    const leaderName = teachers.find((t) => t.role === 'leader')?.title || 'Unknown';
    const followerName = teachers.find((t) => t.role === 'follower')?.title || 'Unknown';
    return `${followerName} & ${leaderName}`;
  }

  // Fallback to leader_name and follower_name if available
  if (couple.leader_name && couple.follower_name) {
    return `${couple.follower_name} & ${couple.leader_name}`;
  }

  // Last resort: decode HTML entities from title
  return decodeHtmlEntities(couple.title || 'Unknown Partnership');
};

const getLocationText = (couple: Couple): string => {
  const city = couple.city || couple.meta_box?.city || '';
  const country = couple.country || couple.meta_box?.country || '';
  const countryName = country ? getCountryName(country) : '';
  return [city, countryName].filter(Boolean).join(', ');
};

const getTeacherLocation = (teacher: { city?: string; country?: string }): string => {
  const city = teacher.city || '';
  const country = teacher.country || '';
  const countryName = country ? getCountryName(country) : '';
  return [city, countryName].filter(Boolean).join(', ');
};

const decodeHtmlEntities = (str: string): string => {
  const textarea = document.createElement('textarea');
  textarea.innerHTML = str;
  return textarea.value;
};

// API functions
const loadCouple = async () => {
  const coupleId = parseInt(route.params.id as string);
  if (!coupleId) {
    error.value = 'Invalid couple ID';
    return;
  }

  loading.value = true;
  error.value = null;

  try {
    couple.value = await coupleService.getCouple(coupleId);
  } catch (err) {
    console.error('Error loading couple:', err);
    error.value = err instanceof Error ? err.message : 'Failed to load couple details';
  } finally {
    loading.value = false;
  }
};

// Initialize
onMounted(() => {
  void loadCouple();
});
</script>

<style lang="scss" scoped>
.q-card {
  box-shadow: 0 1px 5px rgba(0, 0, 0, 0.1);
}
</style>

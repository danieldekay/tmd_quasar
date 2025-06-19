<template>
  <q-pull-to-refresh @refresh="loadDJ">
    <q-page class="dj-details-page">
      <!-- Hero Banner -->
      <div v-if="dj" class="hero-wrapper q-mb-md">
        <q-img
          :src="dj.acf?.photo || defaultImage"
          :alt="`Photo of ${dj.tmd_dj_name || dj.title}`"
          class="hero-img"
          loading="lazy"
          ratio="16/9"
        >
          <div class="absolute-full bg-gradient" />
          <div class="hero-content column justify-end q-pa-lg">
            <div class="text-h4 text-weight-bold text-white">
              {{ dj.tmd_dj_name || dj.title }}
            </div>
            <div class="row items-center q-gutter-sm text-white q-mt-sm">
              <div v-if="location" class="row items-center">
                <q-icon name="location_on" size="18px" class="q-mr-xs" />
                {{ location }}
              </div>
              <q-chip dense color="primary" text-color="white" icon="library_music"> DJ </q-chip>
              <q-chip
                v-if="dj.gender"
                dense
                :color="dj.gender === 'male' ? 'blue' : dj.gender === 'female' ? 'pink' : 'grey'"
                text-color="white"
                :icon="dj.gender === 'male' ? 'male' : dj.gender === 'female' ? 'female' : 'person'"
              >
                {{ dj.gender }}
              </q-chip>
            </div>
            <!-- Activity Chips -->
            <div class="row items-center q-gutter-sm text-white q-mt-sm">
              <template v-for="chip in activityChips" :key="chip.label">
                <q-chip
                  v-if="chip.show"
                  :icon="chip.icon"
                  dense
                  :color="chip.color"
                  text-color="white"
                >
                  {{ chip.label }}
                </q-chip>
              </template>
            </div>
          </div>
        </q-img>
      </div>

      <!-- Loading / Error -->
      <div v-if="isLoading" class="flex flex-center q-py-xl">
        <q-spinner color="primary" size="40px" />
      </div>
      <div v-else-if="error" class="q-pa-md">
        <q-banner class="bg-negative text-white">{{ error }}</q-banner>
      </div>

      <!-- Tabbed Info -->
      <template v-if="dj">
        <!-- Tab Navigation -->
        <q-tabs v-model="tab" class="text-primary q-mb-md" dense>
          <q-tab name="overview" label="About" icon="info" />
          <q-tab name="activities" label="Activities & Experience" icon="music_note" />
          <q-tab name="contact" label="Contact & Links" icon="link" />
        </q-tabs>
        <q-separator />

        <!-- Tab Content -->
        <q-tab-panels v-model="tab" animated :swipeable="$q.platform.is.mobile">
          <!-- Overview Panel -->
          <q-tab-panel name="overview" class="q-pa-md">
            <div class="row q-col-gutter-lg">
              <!-- Biography -->
              <div class="col-12 col-lg-8">
                <q-card flat>
                  <q-card-section v-if="djBio">
                    <div class="text-h6 q-mb-md">About {{ dj.tmd_dj_name || dj.title }}</div>
                    <div v-html="djBio" class="dj-description"></div>
                  </q-card-section>
                  <q-card-section v-else>
                    <div class="text-h6 q-mb-md">About {{ dj.tmd_dj_name || dj.title }}</div>
                    <div class="text-grey-7">No biography available for this DJ.</div>
                  </q-card-section>
                </q-card>
              </div>

              <!-- DJ Info Sidebar -->
              <div class="col-12 col-lg-4">
                <q-card flat bordered class="bg-grey-1">
                  <q-card-section>
                    <div class="text-h6 q-mb-md">DJ Info</div>
                    <q-list dense>
                      <template v-for="info in djInfoItems" :key="info.label">
                        <q-item v-if="info.show">
                          <q-item-section avatar>
                            <q-icon :name="info.icon" :color="info.color" size="sm" />
                          </q-item-section>
                          <q-item-section>
                            <q-item-label class="text-weight-medium">{{ info.label }}</q-item-label>
                            <q-item-label caption>{{ info.value }}</q-item-label>
                          </q-item-section>
                        </q-item>
                      </template>
                    </q-list>
                  </q-card-section>
                </q-card>
              </div>
            </div>
          </q-tab-panel>

          <!-- Activities & Experience Panel -->
          <q-tab-panel name="activities" class="q-pa-md">
            <div class="row q-col-gutter-lg">
              <!-- Main Activities -->
              <div class="col-12 col-md-6">
                <q-card flat class="q-mb-md">
                  <q-card-section>
                    <div class="text-h6 q-mb-md">DJ Activities</div>
                    <q-list>
                      <template v-for="activity in mainActivities" :key="activity.label">
                        <q-item v-if="activity.show">
                          <q-item-section avatar>
                            <q-icon :name="activity.icon" :color="activity.color" />
                          </q-item-section>
                          <q-item-section>
                            <q-item-label>{{ activity.label }}</q-item-label>
                            <q-item-label caption>{{ activity.description }}</q-item-label>
                          </q-item-section>
                          <q-item-section side v-if="activity.since">
                            <q-badge color="grey-6" :label="`Since ${activity.since}`" />
                          </q-item-section>
                        </q-item>
                      </template>
                    </q-list>
                  </q-card-section>
                </q-card>
              </div>

              <!-- Experience Timeline -->
              <div class="col-12 col-md-6">
                <q-card flat>
                  <q-card-section>
                    <div class="text-h6 q-mb-md">Experience Timeline</div>
                    <q-list>
                      <template v-for="exp in experienceTimeline" :key="exp.activity">
                        <q-item v-if="exp.show">
                          <q-item-section avatar>
                            <q-icon :name="exp.icon" :color="exp.color" />
                          </q-item-section>
                          <q-item-section>
                            <q-item-label>{{ exp.activity }}</q-item-label>
                            <q-item-label caption>{{ exp.description }}</q-item-label>
                          </q-item-section>
                          <q-item-section side>
                            <div class="text-caption text-grey-6">{{ exp.since }}</div>
                          </q-item-section>
                        </q-item>
                      </template>
                      <q-item v-if="!hasExperienceData">
                        <q-item-section avatar>
                          <q-icon name="help_outline" color="grey" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label class="text-grey-6"
                            >No experience data available</q-item-label
                          >
                          <q-item-label caption>Contact DJ for more information</q-item-label>
                        </q-item-section>
                      </q-item>
                    </q-list>
                  </q-card-section>
                </q-card>
              </div>
            </div>
          </q-tab-panel>

          <!-- Contact & Links Panel -->
          <q-tab-panel name="contact" class="q-pa-md">
            <div class="row q-col-gutter-lg">
              <div class="col-12 col-md-8">
                <q-card flat>
                  <q-card-section>
                    <div class="text-h6 q-mb-md">Contact & Social Media</div>
                    <q-list>
                      <template v-for="contact in contactMethods" :key="contact.label">
                        <q-item v-if="contact.show">
                          <q-item-section avatar>
                            <q-icon :name="contact.icon" :color="contact.color" />
                          </q-item-section>
                          <q-item-section>
                            <q-item-label>{{ contact.label }}</q-item-label>
                            <q-item-label caption>{{ contact.description }}</q-item-label>
                          </q-item-section>
                          <q-item-section side>
                            <q-btn
                              flat
                              round
                              icon="open_in_new"
                              :color="contact.color"
                              :href="contact.url"
                              :target="contact.external ? '_blank' : undefined"
                              :title="contact.title"
                            />
                          </q-item-section>
                        </q-item>
                      </template>
                      <q-item v-if="!hasContactInfo">
                        <q-item-section avatar>
                          <q-icon name="help_outline" color="grey" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label class="text-grey-6"
                            >No contact information available</q-item-label
                          >
                          <q-item-label caption
                            >Check the main tangomarathons.com website</q-item-label
                          >
                        </q-item-section>
                      </q-item>
                    </q-list>
                  </q-card-section>
                </q-card>
              </div>
            </div>
          </q-tab-panel>
        </q-tab-panels>
      </template>
    </q-page>
  </q-pull-to-refresh>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useQuasar } from 'quasar';
import { djService } from '../services';
import type { DJ } from '../services/types';
import { useFormatters } from '../composables/useFormatters';

defineOptions({ name: 'DJDetails' });

const route = useRoute();
const $q = useQuasar();

const dj = ref<DJ | null>(null);
const isLoading = ref(true);
const error = ref<string | null>(null);
const tab = ref<'overview' | 'activities' | 'contact'>('overview');

const defaultImage = 'https://cdn.quasar.dev/img/parallax2.jpg';

const { formatDate } = useFormatters();

const location = computed(() => {
  if (!dj.value) return '';
  return [dj.value.tmd_dj_city, dj.value.tmd_dj_country].filter(Boolean).join(', ');
});

const djBio = computed(() => {
  if (!dj.value) return '';
  const about = dj.value.tmd_dj_about_the_dj;
  const abstract = dj.value.abstract;
  const content = dj.value.content?.rendered;

  if (about && abstract) return `${about}<hr/>${abstract}`;
  if (about && content) return `${about}<hr/>${content}`;
  return about || abstract || content || '';
});

// Activity chips for hero section
const activityChips = computed(() => [
  {
    show: dj.value?.tmd_dj_activity_marathons === '1',
    icon: 'run_circle',
    color: 'red',
    label: 'Marathons',
  },
  {
    show: dj.value?.tmd_dj_activity_festivals === '1',
    icon: 'celebration',
    color: 'purple',
    label: 'Festivals',
  },
  {
    show: dj.value?.tmd_dj_activity_encuentros === '1',
    icon: 'groups',
    color: 'blue',
    label: 'Encuentros',
  },
  {
    show: dj.value?.tmd_dj_activity_milongas === '1',
    icon: 'music_note',
    color: 'teal',
    label: 'Milongas',
  },
  {
    show: dj.value?.tmd_dj_activity_milongas_travel === '1',
    icon: 'travel_explore',
    color: 'green',
    label: 'Travel',
  },
]);

// DJ info items for sidebar
const djInfoItems = computed(() => [
  {
    show: !!(dj.value?.tmd_dj_name || dj.value?.title),
    icon: 'person',
    color: 'primary',
    label: 'Name',
    value: dj.value?.tmd_dj_name || dj.value?.title || '',
  },
  {
    show: !!location.value,
    icon: 'location_on',
    color: 'primary',
    label: 'Location',
    value: location.value,
  },
  {
    show: !!dj.value?.gender,
    icon:
      dj.value?.gender === 'male' ? 'male' : dj.value?.gender === 'female' ? 'female' : 'person',
    color: dj.value?.gender === 'male' ? 'blue' : dj.value?.gender === 'female' ? 'pink' : 'grey',
    label: 'Gender',
    value: dj.value?.gender || '',
  },
  {
    show: !!dj.value?.date,
    icon: 'event',
    color: 'secondary',
    label: 'Added',
    value: formatDate(dj.value?.date || ''),
  },
  {
    show: !!dj.value?.modified,
    icon: 'update',
    color: 'secondary',
    label: 'Last Updated',
    value: formatDate(dj.value?.modified || ''),
  },
]);

// Main activities
const mainActivities = computed(() => [
  {
    show: dj.value?.tmd_dj_activity_marathons === '1',
    icon: 'run_circle',
    color: 'red',
    label: 'Tango Marathons',
    description: 'DJing at tango marathons worldwide',
    since: dj.value?.tmd_dj_activity_marathons_since,
  },
  {
    show: dj.value?.tmd_dj_activity_festivals === '1',
    icon: 'celebration',
    color: 'purple',
    label: 'Tango Festivals',
    description: 'Performing at major tango festivals',
    since: dj.value?.tmd_dj_activity_festivals_since,
  },
  {
    show: dj.value?.tmd_dj_activity_encuentros === '1',
    icon: 'groups',
    color: 'blue',
    label: 'Encuentros',
    description: 'DJing at intimate encuentro events',
    since: dj.value?.tmd_dj_activity_encuentros_since,
  },
  {
    show: dj.value?.tmd_dj_activity_milongas === '1',
    icon: 'music_note',
    color: 'teal',
    label: 'Local Milongas',
    description: 'Regular milonga performances',
    since: dj.value?.tmd_dj_activity_milongas_since,
  },
  {
    show: dj.value?.tmd_dj_activity_milongas_travel === '1',
    icon: 'travel_explore',
    color: 'green',
    label: 'Travel Milongas',
    description: 'Guest DJ at milongas worldwide',
    since: dj.value?.tmd_dj_activity_milongas_travel_since,
  },
]);

// Experience timeline (sorted by year)
const experienceTimeline = computed(() => {
  const activities = [
    {
      show:
        dj.value?.tmd_dj_activity_marathons === '1' && dj.value?.tmd_dj_activity_marathons_since,
      activity: 'Started DJing Marathons',
      description: 'Began performing at tango marathons',
      since: dj.value?.tmd_dj_activity_marathons_since || '',
      icon: 'run_circle',
      color: 'red',
      year: parseInt(dj.value?.tmd_dj_activity_marathons_since || '0'),
    },
    {
      show:
        dj.value?.tmd_dj_activity_festivals === '1' && dj.value?.tmd_dj_activity_festivals_since,
      activity: 'Started Festival DJing',
      description: 'Began performing at tango festivals',
      since: dj.value?.tmd_dj_activity_festivals_since || '',
      icon: 'celebration',
      color: 'purple',
      year: parseInt(dj.value?.tmd_dj_activity_festivals_since || '0'),
    },
    {
      show:
        dj.value?.tmd_dj_activity_encuentros === '1' && dj.value?.tmd_dj_activity_encuentros_since,
      activity: 'Started Encuentro DJing',
      description: 'Began performing at encuentros',
      since: dj.value?.tmd_dj_activity_encuentros_since || '',
      icon: 'groups',
      color: 'blue',
      year: parseInt(dj.value?.tmd_dj_activity_encuentros_since || '0'),
    },
    {
      show: dj.value?.tmd_dj_activity_milongas === '1' && dj.value?.tmd_dj_activity_milongas_since,
      activity: 'Started Local Milongas',
      description: 'Began regular milonga performances',
      since: dj.value?.tmd_dj_activity_milongas_since || '',
      icon: 'music_note',
      color: 'teal',
      year: parseInt(dj.value?.tmd_dj_activity_milongas_since || '0'),
    },
    {
      show:
        dj.value?.tmd_dj_activity_milongas_travel === '1' &&
        dj.value?.tmd_dj_activity_milongas_travel_since,
      activity: 'Started Travel DJing',
      description: 'Began guest DJ performances worldwide',
      since: dj.value?.tmd_dj_activity_milongas_travel_since || '',
      icon: 'travel_explore',
      color: 'green',
      year: parseInt(dj.value?.tmd_dj_activity_milongas_travel_since || '0'),
    },
  ];

  return activities.filter((a) => a.show && a.year > 0).sort((a, b) => a.year - b.year);
});

const hasExperienceData = computed(() => experienceTimeline.value.length > 0);

// Contact methods
const contactMethods = computed(() => [
  {
    show: !!dj.value?.tmd_dj_e_mail,
    icon: 'email',
    color: 'primary',
    label: 'Email',
    description: dj.value?.tmd_dj_e_mail || '',
    url: `mailto:${dj.value?.tmd_dj_e_mail}`,
    external: false,
    title: 'Send email',
  },
  {
    show: !!dj.value?.tmd_dj_webpage,
    icon: 'language',
    color: 'green',
    label: 'Website',
    description: 'Personal or professional website',
    url: dj.value?.tmd_dj_webpage || '',
    external: true,
    title: 'Visit website',
  },
  {
    show: !!dj.value?.tmd_dj_link_to_facebook,
    icon: 'person',
    color: 'blue',
    label: 'Facebook Profile',
    description: 'Personal Facebook profile',
    url: dj.value?.tmd_dj_link_to_facebook || '',
    external: true,
    title: 'View Facebook profile',
  },
  {
    show: !!dj.value?.tmd_dj_link_to_facebook_page,
    icon: 'pages',
    color: 'blue',
    label: 'Facebook Page',
    description: 'Professional Facebook page',
    url: dj.value?.tmd_dj_link_to_facebook_page || '',
    external: true,
    title: 'View Facebook page',
  },
]);

const hasContactInfo = computed(
  () =>
    !!(
      dj.value?.tmd_dj_e_mail ||
      dj.value?.tmd_dj_webpage ||
      dj.value?.tmd_dj_link_to_facebook ||
      dj.value?.tmd_dj_link_to_facebook_page
    ),
);

const loadDJ = async (done?: () => void) => {
  isLoading.value = true;
  error.value = null;
  const djId = Number(route.params.id);
  if (!djId) {
    error.value = 'Invalid DJ ID';
    isLoading.value = false;
    return;
  }

  try {
    dj.value = await djService.getDJ(djId);
  } catch (err) {
    console.error('Error loading DJ:', err);
    error.value = 'Failed to load DJ details';
    $q.notify({ type: 'negative', message: error.value, position: 'top' });
  } finally {
    isLoading.value = false;
    if (done) done();
  }
};

onMounted(loadDJ);
</script>

<style scoped lang="scss">
.dj-details-page {
  .hero-wrapper {
    height: clamp(280px, 35vh, 420px);
    border-radius: 8px;
    overflow: hidden;
  }

  .hero-img {
    height: 100%;
  }

  .bg-gradient {
    background: linear-gradient(180deg, rgba(0, 0, 0, 0) 60%, rgba(0, 0, 0, 0.7) 100%);
  }

  .hero-content {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 1;
  }

  .dj-description {
    line-height: 1.6;

    :deep(p) {
      margin-bottom: 1rem;
    }

    :deep(h1, h2, h3, h4, h5, h6) {
      margin-top: 1.5rem;
      margin-bottom: 0.75rem;
    }

    :deep(ul, ol) {
      margin-bottom: 1rem;
      padding-left: 1.5rem;
    }

    :deep(hr) {
      margin: 2rem 0;
      border: none;
      border-top: 1px solid rgba(0, 0, 0, 0.12);
    }
  }
}
</style>

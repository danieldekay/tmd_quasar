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
          <q-tab name="events" label="Events & Performances" icon="event" />
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

          <!-- Events & Performances Panel -->
          <q-tab-panel name="events" class="q-pa-md">
            <!-- Data Quality Notice -->
            <q-banner
              v-if="eventsStats.hasDataIssues && djEvents.length > 0"
              class="bg-warning text-dark q-mb-md"
              dense
            >
              <q-icon name="warning" size="sm" class="q-mr-sm" />
              Some event data may be incomplete. Statistics might not reflect all available
              information.
            </q-banner>

            <div class="row q-col-gutter-lg">
              <!-- Events Statistics -->
              <div class="col-12">
                <q-card flat bordered class="bg-primary text-white q-mb-lg">
                  <q-card-section>
                    <div class="text-h6 q-mb-md">Statistics of Data on TMD</div>

                    <!-- Loading State -->
                    <div v-if="eventsLoading" class="text-center q-py-lg">
                      <q-spinner color="white" size="2em" class="q-mb-sm" />
                      <div class="text-caption">Loading performance data...</div>
                    </div>

                    <!-- No Events Fallback -->
                    <div v-else-if="djEvents.length === 0" class="text-center q-py-lg">
                      <q-icon name="event_busy" size="3em" class="q-mb-sm opacity-70" />
                      <div class="text-body2 q-mb-xs">No Events Data</div>
                      <div class="text-caption opacity-70">
                        This DJ doesn't have any recorded events yet
                      </div>
                    </div>

                    <!-- Statistics Display -->
                    <div v-else class="row q-col-gutter-md">
                      <div class="col-6 col-sm-3 text-center">
                        <div class="text-h4 text-weight-bold">{{ eventsStats.total }}</div>
                        <div class="text-caption">Total Events</div>
                      </div>
                      <div class="col-6 col-sm-3 text-center">
                        <div class="text-h4 text-weight-bold">{{ eventsStats.upcoming }}</div>
                        <div class="text-caption">Upcoming</div>
                      </div>
                      <div class="col-6 col-sm-3 text-center">
                        <div class="text-h4 text-weight-bold">
                          {{ eventsStats.countries }}
                          <q-tooltip
                            v-if="eventsStats.countriesWithIssues > 0"
                            class="bg-warning text-dark"
                          >
                            {{ eventsStats.countriesWithIssues }} events missing country data
                          </q-tooltip>
                        </div>
                        <div class="text-caption">Countries</div>
                      </div>
                      <div class="col-6 col-sm-3 text-center">
                        <div class="text-h4 text-weight-bold">{{ eventsStats.years }}</div>
                        <div class="text-caption">Years Active</div>
                      </div>
                    </div>
                  </q-card-section>
                </q-card>
              </div>

              <!-- All Events Grouped by Year -->
              <div class="col-12">
                <q-card flat>
                  <q-card-section>
                    <div class="text-h6 q-mb-md">
                      <q-icon name="event" class="q-mr-sm" />
                      All Events ({{ djEvents.length }})
                    </div>
                    <div v-if="eventsLoading" class="text-center q-pa-md">
                      <q-spinner color="primary" size="2em" />
                      <div class="text-caption q-mt-sm">Loading events...</div>
                    </div>
                    <div v-else-if="djEvents.length === 0" class="text-center q-pa-md text-grey-6">
                      <q-icon name="event_note" size="3em" class="q-mb-sm" />
                      <div class="text-weight-medium">No Events Data</div>
                      <div class="text-caption">This DJ doesn't have any recorded events</div>
                    </div>
                    <div v-else>
                      <div v-for="yearGroup in eventsByYear" :key="yearGroup.year" class="q-mb-lg">
                        <div class="text-h6 text-primary q-mb-md">
                          {{ yearGroup.year }}
                          <q-badge
                            color="grey-6"
                            :label="`${yearGroup.events.length} events`"
                            class="q-ml-sm"
                          />
                        </div>
                        <q-list separator>
                          <q-item
                            v-for="event in yearGroup.events"
                            :key="event.id"
                            clickable
                            @click="goToEvent(event.id)"
                            class="event-item"
                          >
                            <q-item-section>
                              <q-item-label class="text-weight-medium">{{
                                event.title
                              }}</q-item-label>
                              <q-item-label caption>
                                <q-icon name="event" size="xs" class="q-mr-xs" />
                                {{ formatDate(event.start_date) }}
                                <span v-if="event.edition" class="q-ml-sm">
                                  <q-badge color="grey-6" :label="`Edition ${event.edition}`" />
                                </span>
                                <span v-if="isEventUpcoming(event.start_date)" class="q-ml-sm">
                                  <q-badge color="positive" label="Upcoming" />
                                </span>
                              </q-item-label>
                            </q-item-section>
                            <q-item-section side>
                              <q-icon name="chevron_right" color="grey-5" />
                            </q-item-section>
                          </q-item>
                        </q-list>
                      </div>
                    </div>
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
import { useRoute, useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { djService } from '../services';
import type { DJ, BaseEvent } from '../services/types';
import { useFormatters } from '../composables/useFormatters';

defineOptions({ name: 'DJDetails' });

const route = useRoute();
const router = useRouter();
const $q = useQuasar();

const dj = ref<DJ | null>(null);
const isLoading = ref(true);
const error = ref<string | null>(null);
const tab = ref<'overview' | 'activities' | 'events' | 'contact'>('overview');
const djEvents = ref<BaseEvent[]>([]);
const eventsLoading = ref(false);

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
    description: 'DJing at tango marathons',
    since: dj.value?.tmd_dj_activity_marathons_since,
  },
  {
    show: dj.value?.tmd_dj_activity_festivals === '1',
    icon: 'celebration',
    color: 'purple',
    label: 'Tango Festivals',
    description: 'DJing at tango festivals',
    since: dj.value?.tmd_dj_activity_festivals_since,
  },
  {
    show: dj.value?.tmd_dj_activity_encuentros === '1',
    icon: 'groups',
    color: 'blue',
    label: 'Encuentros',
    description: 'DJing at  encuentro events',
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

// Events-related computed properties
const upcomingEvents = computed(() => {
  const now = new Date();
  return djEvents.value
    .filter((event) => new Date(event.start_date) >= now)
    .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime());
});

const eventsByYear = computed(() => {
  const eventGroups = new Map<number, typeof djEvents.value>();

  djEvents.value.forEach((event) => {
    if (!event.start_date) return;

    const year = new Date(event.start_date).getFullYear();
    if (!eventGroups.has(year)) {
      eventGroups.set(year, []);
    }
    eventGroups.get(year)?.push(event);
  });

  // Sort events within each year by date (newest first)
  eventGroups.forEach((events) => {
    events.sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime());
  });

  // Convert to array and sort years (newest first)
  return Array.from(eventGroups.entries())
    .map(([year, events]) => ({ year, events }))
    .sort((a, b) => b.year - a.year);
});

const eventsStats = computed(() => {
  const events = djEvents.value;

  // Data validation for countries
  const countryValues = events.map((e) => e.country);
  const validCountries = countryValues.filter(Boolean); // Remove null, undefined, empty strings
  const countries = new Set(validCountries);
  const countriesWithIssues = events.length - validCountries.length;

  // Data validation for years
  const yearValues = events.map((e) => {
    if (!e.start_date) return null;
    const year = new Date(e.start_date).getFullYear();
    return !isNaN(year) ? year : null;
  });
  const validYears = yearValues.filter((year) => year !== null);
  const years = new Set(validYears);

  return {
    total: events.length,
    upcoming: upcomingEvents.value.length,
    countries: countries.size,
    countriesWithIssues,
    years: years.size,
    // Additional metadata for debugging/tooltips
    hasDataIssues: countriesWithIssues > 0 || events.length - validYears.length > 0,
  };
});

// Methods
const isEventUpcoming = (startDate: string): boolean => {
  if (!startDate) return false;
  return new Date(startDate) > new Date();
};

const loadDJEvents = () => {
  if (!dj.value?.id) return;

  eventsLoading.value = true;
  try {
    // Use the embedded events if available
    if (dj.value._embedded?.events && Array.isArray(dj.value._embedded.events)) {
      djEvents.value = dj.value._embedded.events;
      console.info(`Using ${djEvents.value.length} embedded events for DJ ${dj.value.id}`);

      // Validate embedded data quality
      const eventsWithoutCountry = djEvents.value.filter((e) => !e.country).length;
      if (eventsWithoutCountry > 0) {
        console.warn(`${eventsWithoutCountry} events missing country data for DJ ${dj.value.id}`);
      }
    } else {
      // No embedded events available - this DJ has no events
      djEvents.value = [];
      console.info(`No embedded events found for DJ ${dj.value.id} - DJ has no associated events`);
    }
  } catch (err) {
    console.error('Error loading DJ events:', err);
    djEvents.value = []; // Reset to empty array on error
    $q.notify({
      type: 'negative',
      message: 'Failed to load DJ events. Some statistics may be incomplete.',
      position: 'top',
      timeout: 5000,
    });
  } finally {
    eventsLoading.value = false;
  }
};

const goToEvent = (eventId: number) => {
  void router.push(`/events/${eventId}`);
};

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
    // Load events after DJ is loaded
    loadDJEvents();
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

  .event-item {
    transition: background-color 0.2s ease;

    &:hover {
      background-color: rgba(0, 0, 0, 0.04);
    }
  }
}
</style>

<template>
  <q-pull-to-refresh @refresh="loadEvent">
    <q-page class="event-details-page">
      <!-- Hero Banner -->
      <div v-if="event" class="hero-wrapper q-mb-md">
        <q-img
          :src="event.featured_image || defaultImage"
          :alt="`Event banner for ${event.event_name || event.title}`"
          class="hero-img"
          loading="lazy"
          ratio="16/9"
        >
          <div class="absolute-full bg-gradient" />
          <div class="hero-content column justify-end q-pa-lg">
            <div class="text-h4 text-weight-bold text-white">
              <template v-if="editionOrdinal">{{ editionOrdinal }}&nbsp;</template
              >{{ event.event_name || event.title }}
            </div>
            <div class="row items-center q-gutter-sm text-white q-mt-sm">
              <div class="row items-center">
                <q-icon name="event" size="18px" class="q-mr-xs" />
                {{ formattedDates }}
              </div>
              <div v-if="location" class="row items-center">
                <q-icon name="location_on" size="18px" class="q-mr-xs" />
                {{ location }}
              </div>
              <q-chip
                v-if="getEventCategory(event.taxonomies)"
                dense
                color="primary"
                text-color="white"
              >
                {{ getEventCategory(event.taxonomies) }}
              </q-chip>
            </div>
            <!-- Quick Stats Chips -->
            <div class="row items-center q-gutter-sm text-white q-mt-sm">
              <template v-for="chip in heroChips" :key="chip.label">
                <q-chip
                  v-if="chip.show"
                  :icon="chip.icon"
                  dense
                  :color="chip.color"
                  text-color="white"
                  >{{ chip.label }}</q-chip
                >
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
      <template v-if="event">
        <!-- Tab Navigation -->
        <q-tabs v-model="tab" class="text-primary q-mb-md" dense>
          <q-tab name="overview" label="About" icon="info" />
          <q-tab name="details" label="Details & Registration" icon="how_to_reg" />
          <q-tab name="venue" label="Venue & Location" icon="location_on" />
          <q-tab name="contact" label="Contact & Links" icon="link" />
        </q-tabs>
        <q-separator />

        <!-- Tab Content -->
        <q-tab-panels v-model="tab" animated :swipeable="$q.platform.is.mobile">
          <!-- Overview Panel -->
          <q-tab-panel name="overview" class="q-pa-md">
            <div class="row q-col-gutter-lg">
              <!-- Description -->
              <div class="col-12 col-lg-8">
                <q-card flat>
                  <q-card-section v-if="descriptionHtml">
                    <div class="text-h6 q-mb-md">About This Event</div>
                    <div v-html="descriptionHtml" class="event-description"></div>
                  </q-card-section>
                  <q-card-section v-else>
                    <div class="text-h6 q-mb-md">About This Event</div>
                    <div class="text-grey-7">No description available for this event.</div>
                  </q-card-section>
                </q-card>
              </div>

              <!-- Event Info Sidebar -->
              <div class="col-12 col-lg-4">
                <q-card flat bordered class="bg-grey-1">
                  <q-card-section>
                    <div class="text-h6 q-mb-md">Event Info</div>
                    <q-list dense>
                      <template v-for="info in eventInfoItems" :key="info.label">
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

          <!-- Details & Registration Panel -->
          <q-tab-panel name="details" class="q-pa-md">
            <div class="row q-col-gutter-lg">
              <!-- Registration & Features -->
              <div class="col-12 col-md-6">
                <q-card flat class="q-mb-md">
                  <q-card-section>
                    <div class="text-h6 q-mb-md">Registration & Access</div>
                    <q-list>
                      <template v-for="reg in registrationItems" :key="reg.label">
                        <q-item v-if="reg.show">
                          <q-item-section avatar>
                            <q-icon :name="reg.icon" :color="reg.color" />
                          </q-item-section>
                          <q-item-section>
                            <q-item-label>{{ reg.label }}</q-item-label>
                            <q-item-label caption>{{ reg.value }}</q-item-label>
                          </q-item-section>
                        </q-item>
                      </template>
                    </q-list>
                  </q-card-section>
                </q-card>

                <!-- Dance & Music Features -->
                <q-card flat>
                  <q-card-section>
                    <div class="text-h6 q-mb-md">What's Available</div>
                    <q-list>
                      <template v-for="feature in danceFeatures" :key="feature.label">
                        <q-item v-if="feature.show">
                          <q-item-section avatar>
                            <q-icon :name="feature.icon" :color="feature.color" />
                          </q-item-section>
                          <q-item-section>
                            <q-item-label>{{ feature.label }}</q-item-label>
                            <q-item-label caption>{{ feature.description }}</q-item-label>
                          </q-item-section>
                        </q-item>
                      </template>
                    </q-list>
                  </q-card-section>
                </q-card>
              </div>

              <!-- Services & Practical Info -->
              <div class="col-12 col-md-6">
                <q-card flat>
                  <q-card-section>
                    <div class="text-h6 q-mb-md">Services & Amenities</div>
                    <q-list>
                      <template v-for="service in practicalServices" :key="service.label">
                        <q-item v-if="service.show">
                          <q-item-section avatar>
                            <q-icon :name="service.icon" :color="service.color" />
                          </q-item-section>
                          <q-item-section>
                            <q-item-label>{{ service.label }}</q-item-label>
                            <q-item-label caption>{{ service.value }}</q-item-label>
                          </q-item-section>
                        </q-item>
                      </template>
                    </q-list>
                  </q-card-section>
                </q-card>
              </div>
            </div>
          </q-tab-panel>

          <!-- Venue & Location Panel -->
          <q-tab-panel name="venue" class="q-pa-md">
            <div class="row q-col-gutter-lg">
              <!-- Map -->
              <div class="col-12 col-md-6" v-if="event.lat && event.lon">
                <q-card flat bordered>
                  <q-card-section>
                    <div class="text-h6 q-mb-md">Location Map</div>
                    <div
                      class="map-container"
                      style="height: 300px; border-radius: 8px; overflow: hidden"
                    >
                      <iframe
                        :src="`https://www.openstreetmap.org/export/embed.html?bbox=${event.lon! - 0.01},${event.lat! - 0.01},${event.lon! + 0.01},${event.lat! + 0.01}&layer=mapnik&marker=${event.lat},${event.lon}`"
                        width="100%"
                        height="300"
                        frameborder="0"
                        scrolling="no"
                        style="border: 0"
                        title="Event Location Map"
                      ></iframe>
                    </div>
                    <div class="q-mt-sm text-center">
                      <q-btn
                        flat
                        dense
                        no-caps
                        color="primary"
                        icon="open_in_new"
                        @click="openInMaps(event.lat!, event.lon!)"
                        label="Open in Maps"
                      />
                    </div>
                  </q-card-section>
                </q-card>
              </div>

              <!-- Address & Venue Details -->
              <div class="col-12" :class="event.lat && event.lon ? 'col-md-6' : ''">
                <q-card flat>
                  <q-card-section>
                    <div class="text-h6 q-mb-md">Venue Details</div>
                    <q-list>
                      <template v-for="venue in venueDetails" :key="venue.label">
                        <q-item v-if="venue.show">
                          <q-item-section avatar>
                            <q-icon :name="venue.icon" :color="venue.color" />
                          </q-item-section>
                          <q-item-section>
                            <q-item-label>{{ venue.label }}</q-item-label>
                            <q-item-label caption class="text-wrap">{{ venue.value }}</q-item-label>
                          </q-item-section>
                          <q-item-section side v-if="venue.action">
                            <q-btn
                              flat
                              round
                              :icon="venue.action.icon"
                              :color="venue.color"
                              @click="venue.action.handler"
                              :title="venue.action.title"
                            />
                          </q-item-section>
                        </q-item>
                      </template>
                      <q-item v-if="!hasVenueDetails">
                        <q-item-section avatar>
                          <q-icon name="help_outline" color="grey" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label class="text-grey-6"
                            >No venue details available</q-item-label
                          >
                          <q-item-label caption
                            >Check with organizers for location info</q-item-label
                          >
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
import { eventDetailsService as eventService } from '../services';
import type { EventDetails } from '../services/types';
import { useFormatters } from '../composables/useFormatters';

defineOptions({ name: 'EventDetails' });

const route = useRoute();
const $q = useQuasar();

const event = ref<EventDetails>({} as EventDetails);
const isLoading = ref(true);
const error = ref<string | null>(null);
const tab = ref<'overview' | 'details' | 'venue' | 'contact'>('overview');

const defaultImage = 'https://cdn.quasar.dev/img/parallax1.jpg';

const { formatDate, getEventCategory } = useFormatters();

const formattedDates = computed(() => {
  if (!event.value) return '';
  const { start_date, end_date } = event.value;
  return end_date ? `${formatDate(start_date)} - ${formatDate(end_date)}` : formatDate(start_date);
});

const location = computed(() =>
  [event.value?.city, event.value?.country].filter(Boolean).join(', '),
);

const getOrdinal = (n: number): string => {
  const s = ['th', 'st', 'nd', 'rd'] as const;
  const v = n % 100;
  return `${n}${s[(v - 20) % 10] || s[v] || s[0]}`;
};

const editionOrdinal = computed(() => {
  const raw = event.value?.edition;
  if (!raw) return '';
  const num = parseInt(raw, 10);
  return isNaN(num) ? raw : getOrdinal(num);
});

const descriptionHtml = computed(() => {
  const desc = event.value?.event_description;
  const post = event.value?.post_content;
  if (desc && post) return `${desc}<hr/>${post}`;
  return desc || post || '';
});

const fullAddress = computed(() => {
  if (!event.value) return '';
  const parts = [
    event.value.venue_name,
    event.value.street,
    event.value.city,
    event.value.country,
  ].filter(Boolean);
  return parts.join(', ');
});

// Hero chips configuration
const heroChips = computed(() => [
  {
    show: event.value?.have_milongas,
    icon: 'music_note',
    color: 'dark',
    label: 'Milongas',
  },
  {
    show: event.value?.meta_box?.have_live_music,
    icon: 'campaign',
    color: 'accent',
    label: 'Live Music',
  },
  {
    show: event.value?.meta_box?.have_lessons,
    icon: 'school',
    color: 'secondary',
    label: 'Lessons',
  },
  {
    show: event.value?.meta_box?.have_show,
    icon: 'theater_comedy',
    color: 'info',
    label: 'Shows',
  },
  {
    show: !!event.value?.price,
    icon: 'paid',
    color: 'positive',
    label: `${event.value?.price} ${event.value?.currency || ''}`,
  },
  {
    show: !!event.value?.number_of_participants,
    icon: 'groups',
    color: 'warning',
    label: `${event.value?.number_of_participants} dancers`,
  },
  {
    show: event.value?.role_balanced,
    icon: 'balance',
    color: 'purple',
    label: 'Role Balanced',
  },
  {
    show: event.value?.invitation_only,
    icon: 'lock',
    color: 'orange',
    label: 'Invitation Only',
  },
]);

// Event info items for sidebar
const eventInfoItems = computed(() => [
  {
    show: true,
    icon: 'event',
    color: 'primary',
    label: 'Duration',
    value: formattedDates.value,
  },
  {
    show: !!getEventCategory(event.value?.taxonomies),
    icon: 'category',
    color: 'primary',
    label: 'Category',
    value: getEventCategory(event.value?.taxonomies),
  },
  {
    show: !!location.value,
    icon: 'location_on',
    color: 'primary',
    label: 'Location',
    value: location.value,
  },
  {
    show: !!event.value?.venue_name,
    icon: 'store',
    color: 'primary',
    label: 'Venue',
    value: event.value?.venue_name,
  },
  {
    show: !!event.value?.number_of_participants,
    icon: 'groups',
    color: 'primary',
    label: 'Participants',
    value: `${event.value?.number_of_participants} dancers`,
  },
  {
    show: !!event.value?.music_hours,
    icon: 'schedule',
    color: 'primary',
    label: 'Music Hours',
    value: `${event.value?.music_hours} hours`,
  },
  {
    show: !!event.value?.price,
    icon: 'paid',
    color: 'green',
    label: 'Price',
    value: `${event.value?.price} ${event.value?.currency || ''}`,
  },
  {
    show: !!event.value?.edition,
    icon: 'stars',
    color: 'amber',
    label: 'Edition',
    value: editionOrdinal.value,
  },
]);

// Registration items
const registrationItems = computed(() => [
  {
    show: true,
    icon: event.value?.have_registration ? 'how_to_reg' : 'help_outline',
    color: event.value?.have_registration ? 'positive' : 'grey',
    label: 'Registration',
    value: event.value?.have_registration
      ? `Required${event.value?.have_registration_mode ? ` (${event.value.have_registration_mode})` : ''}`
      : 'Open access',
  },
  {
    show: !!event.value?.registration_start_date,
    icon: 'start',
    color: 'primary',
    label: 'Registration Opens',
    value: formatDate(event.value?.registration_start_date || ''),
  },
  {
    show: event.value?.role_balanced,
    icon: 'balance',
    color: 'purple',
    label: 'Role Balanced',
    value: 'Leaders and followers balanced',
  },
  {
    show: event.value?.invitation_only,
    icon: 'lock',
    color: 'orange',
    label: 'Invitation Only',
    value: 'Exclusive event',
  },
  {
    show: event.value?.have_tickets,
    icon: 'confirmation_number',
    color: 'blue',
    label: 'Single Milonga Tickets',
    value: 'Tickets available for individual milongas',
  },
]);

// Dance and music features
const danceFeatures = computed(() => [
  {
    show: event.value?.have_milongas,
    icon: 'music_note',
    color: 'primary',
    label: 'Milongas',
    description: 'Traditional tango social dancing',
  },
  {
    show: event.value?.meta_box?.have_lessons,
    icon: 'school',
    color: 'blue',
    label: 'Dance Lessons',
    description: 'Classes and workshops available',
  },
  {
    show: event.value?.meta_box?.have_show,
    icon: 'theater_comedy',
    color: 'purple',
    label: 'Shows & Performances',
    description: 'Professional tango performances',
  },
  {
    show: event.value?.meta_box?.have_live_music,
    icon: 'campaign',
    color: 'red',
    label: 'Live Music',
    description: 'Live orchestras or musicians',
  },
  {
    show: event.value?.have_folklore,
    icon: 'celebration',
    color: 'orange',
    label: 'Folklore',
    description: 'Traditional folk dances included',
  },
  {
    show: event.value?.have_non_tango,
    icon: 'music_video',
    color: 'teal',
    label: 'Non-Tango Music',
    description: 'Other dance styles included',
  },
  {
    show: event.value?.have_separated_seating,
    icon: 'event_seat',
    color: 'indigo',
    label: 'Separated Seating',
    description: 'Traditional milonga seating',
  },
]);

// Practical services
const practicalServices = computed(() => [
  {
    show: event.value?.have_food,
    icon: 'restaurant',
    color: 'green',
    label: 'Food Available',
    value: event.value?.food_options || 'Food will be available at the event',
  },
  {
    show: event.value?.have_sleep,
    icon: 'hotel',
    color: 'purple',
    label: 'Accommodation',
    value: event.value?.sleeping_options || 'Accommodation information available',
  },
  {
    show: event.value?.have_services,
    icon: 'room_service',
    color: 'teal',
    label: 'Additional Services',
    value: event.value?.service_options || 'Additional services available',
  },
  {
    show: event.value?.have_sales,
    icon: 'shopping_cart',
    color: 'pink',
    label: 'Sales & Shopping',
    value: 'Shopping available at the event',
  },
]);

// Venue details
const venueDetails = computed(() => [
  {
    show: !!fullAddress.value,
    icon: 'location_on',
    color: 'primary',
    label: 'Full Address',
    value: fullAddress.value,
  },
  {
    show: !!event.value?.type_of_floor,
    icon: 'layers',
    color: 'brown',
    label: 'Type of Floor',
    value: event.value?.type_of_floor,
  },
  {
    show: !!event.value?.venue_features,
    icon: 'star',
    color: 'gold',
    label: 'Venue Features',
    value: event.value?.venue_features,
  },
  {
    show: !!(event.value?.lat && event.value?.lon),
    icon: 'gps_fixed',
    color: 'primary',
    label: 'Coordinates',
    value: `${event.value?.lat}, ${event.value?.lon}`,
    action: {
      icon: 'map',
      title: 'Open in Maps',
      handler: () => openInMaps(event.value.lat!, event.value.lon!),
    },
  },
]);

const hasVenueDetails = computed(
  () => !!(fullAddress.value || event.value?.type_of_floor || event.value?.venue_features),
);

// Contact methods
const contactMethods = computed(() => [
  {
    show: !!event.value?.email,
    icon: 'email',
    color: 'primary',
    label: 'Email',
    description: event.value?.email || '',
    url: `mailto:${event.value?.email}`,
    external: false,
    title: 'Send email',
  },
  {
    show: !!event.value?.website,
    icon: 'language',
    color: 'green',
    label: 'Website',
    description: 'Official event website',
    url: event.value?.website || '',
    external: true,
    title: 'Visit website',
  },
  {
    show: !!event.value?.facebook_event,
    icon: 'event',
    color: 'blue',
    label: 'Facebook Event',
    description: 'Official event page',
    url: event.value?.facebook_event || '',
    external: true,
    title: 'View Facebook event',
  },
  {
    show: !!event.value?.facebook_page,
    icon: 'pages',
    color: 'blue',
    label: 'Facebook Page',
    description: "Organizer's page",
    url: event.value?.facebook_page || '',
    external: true,
    title: 'View Facebook page',
  },
  {
    show: !!event.value?.facebook_group,
    icon: 'group',
    color: 'blue',
    label: 'Facebook Group',
    description: 'Community group',
    url: event.value?.facebook_group || '',
    external: true,
    title: 'Join Facebook group',
  },
]);

const hasContactInfo = computed(
  () =>
    !!(
      event.value?.email ||
      event.value?.website ||
      event.value?.facebook_event ||
      event.value?.facebook_page ||
      event.value?.facebook_group
    ),
);

const openInMaps = (lat: number, lon: number) => {
  const mapsUrl = `https://www.google.com/maps?q=${lat},${lon}`;
  window.open(mapsUrl, '_blank', 'noopener,noreferrer');
};

const loadEvent = async (done?: () => void) => {
  isLoading.value = true;
  error.value = null;
  const eventId = Number(route.params.id);
  if (!eventId) {
    error.value = 'Invalid event ID';
    isLoading.value = false;
    return;
  }

  try {
    event.value = await eventService.getEvent(eventId);
  } catch (err) {
    console.error('Error loading event:', err);
    error.value = 'Failed to load event';
    $q.notify({ type: 'negative', message: error.value, position: 'top' });
  } finally {
    isLoading.value = false;
    if (done) done();
  }
};

onMounted(loadEvent);
</script>

<style scoped lang="scss">
.event-details-page {
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

  .event-description {
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

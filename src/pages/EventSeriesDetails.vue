<template>
  <q-pull-to-refresh @refresh="loadEventSeries">
    <q-page class="event-series-details-page">
      <!-- Hero Banner -->
      <div v-if="eventSeries" class="hero-wrapper q-mb-md">
        <q-img
          :src="featuredImage || defaultImage"
          :alt="`Event series banner for ${eventSeries.title}`"
          class="hero-img"
          loading="lazy"
          ratio="16/9"
        >
          <div class="absolute-full bg-gradient" />
          <div class="hero-content column justify-end q-pa-lg">
            <!-- Main Title -->
            <h1
              class="text-h3 text-weight-bold text-white"
              v-html="getRenderedTitle(eventSeries.title)"
            ></h1>
            <div class="row items-center q-gutter-sm text-white q-mt-sm">
              <div v-if="location" class="row items-center">
                <q-icon name="location_on" size="18px" class="q-mr-xs" />
                {{ location }}
              </div>
              <div v-if="eventSeries.start_date" class="row items-center">
                <q-icon name="event" size="18px" class="q-mr-xs" />
                {{ formatDate(eventSeries.start_date) }}
              </div>
              <q-chip
                v-for="category in categories"
                :key="category.id"
                dense
                color="primary"
                text-color="white"
                :icon="getCategoryIcon(category.name)"
              >
                {{ category.name }}
              </q-chip>
            </div>
            <!-- Stats Counter -->
            <div class="row items-center q-gutter-md text-white q-mt-md">
              <div class="stats-card bg-black bg-opacity-30 rounded-borders q-pa-md">
                <div class="text-h4 text-weight-bold">{{ seriesEvents.length }}</div>
                <div class="text-caption">Total Events</div>
              </div>
              <div
                v-if="upcomingEventsCount > 0"
                class="stats-card bg-black bg-opacity-30 rounded-borders q-pa-md"
              >
                <div class="text-h4 text-weight-bold text-positive">{{ upcomingEventsCount }}</div>
                <div class="text-caption">Upcoming</div>
              </div>
              <div
                v-if="pastEventsCount > 0"
                class="stats-card bg-black bg-opacity-30 rounded-borders q-pa-md"
              >
                <div class="text-h4 text-weight-bold text-grey-4">{{ pastEventsCount }}</div>
                <div class="text-caption">Past Events</div>
              </div>
            </div>

            <!-- Quick Stats Chips -->
            <div class="row items-center q-gutter-sm text-white q-mt-sm">
              <q-chip
                v-if="eventSeries.registration_start_date"
                icon="how_to_reg"
                dense
                color="accent"
                text-color="white"
              >
                Registration Open
              </q-chip>
              <q-chip
                v-if="eventSeries.website"
                icon="link"
                dense
                color="positive"
                text-color="white"
              >
                Website Available
              </q-chip>
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
      <template v-if="eventSeries">
        <!-- Tab Navigation -->
        <q-tabs v-model="tab" class="text-primary q-mb-md" dense>
          <q-tab name="overview" label="About" icon="info" />
          <q-tab name="events" label="Events" icon="event" />
          <q-tab name="djs" label="DJs" icon="library_music" />
          <q-tab name="organizer" label="Organizer" icon="person" />
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
                    <div class="text-h6 q-mb-md">About This Event Series</div>
                    <div v-html="descriptionHtml" class="series-description"></div>
                  </q-card-section>
                  <q-card-section v-else>
                    <div class="text-h6 q-mb-md">About This Event Series</div>
                    <div class="text-grey-7">No description available for this event series.</div>
                  </q-card-section>
                </q-card>

                <!-- Featured Image Gallery -->
                <q-card v-if="featuredImage" flat class="q-mt-md">
                  <q-card-section>
                    <div class="text-h6 q-mb-md">Gallery</div>
                    <q-img
                      :src="featuredImage"
                      :alt="`Featured image for ${eventSeries.title}`"
                      class="rounded-borders"
                      style="max-height: 400px"
                      fit="cover"
                    />
                  </q-card-section>
                </q-card>
              </div>

              <!-- Event Series Info Sidebar -->
              <div class="col-12 col-lg-4">
                <q-card flat bordered class="bg-grey-1">
                  <q-card-section>
                    <div class="text-h6 q-mb-md">Series Info</div>
                    <q-list dense>
                      <template v-for="info in seriesInfoItems" :key="info.label">
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

                  <q-card-actions v-if="eventSeries.website">
                    <q-btn
                      color="primary"
                      icon="launch"
                      label="Visit Website"
                      :href="eventSeries.website"
                      target="_blank"
                      class="full-width"
                      @click="openExternalLink(eventSeries.website)"
                    />
                  </q-card-actions>
                </q-card>
              </div>
            </div>
          </q-tab-panel>

          <!-- Events Panel -->
          <q-tab-panel name="events" class="q-pa-md">
            <div class="row q-col-gutter-lg">
              <div class="col-12">
                <q-card flat>
                  <q-card-section>
                    <div class="text-h6 q-mb-md">
                      <q-icon name="event" class="q-mr-sm" />
                      Events in This Series
                    </div>

                    <!-- Events List -->
                    <div v-if="sortedEvents.length > 0" class="row q-col-gutter-md">
                      <div
                        v-for="event in sortedEvents"
                        :key="event.id"
                        class="col-12 col-md-6 col-lg-4"
                      >
                        <q-card
                          flat
                          bordered
                          class="event-card cursor-pointer"
                          @click="navigateToEvent(event.id)"
                        >
                          <q-card-section>
                            <div
                              class="text-h6 text-primary"
                              v-html="getRenderedTitle(event.title)"
                            ></div>
                            <q-badge
                              v-if="event.edition"
                              color="primary"
                              class="q-ml-xs"
                              size="sm"
                              >{{ event.edition }}</q-badge
                            >
                            <div v-if="event.start_date" class="text-caption text-grey-6 q-mt-xs">
                              <q-icon name="event" size="xs" class="q-mr-xs" />
                              {{ formatDate(event.start_date) }}
                            </div>
                            <div v-if="event.city" class="text-caption text-grey-6 q-mt-xs">
                              <q-icon name="location_on" size="xs" class="q-mr-xs" />
                              {{ event.city }}, {{ getCountryName(event.country || '') }}
                            </div>
                            <div
                              v-if="event.registration_start_date"
                              class="text-caption text-grey-6 q-mt-xs"
                            >
                              <q-icon name="how_to_reg" size="xs" class="q-mr-xs" />
                              Registration: {{ formatDate(event.registration_start_date) }}
                            </div>
                          </q-card-section>
                          <q-card-actions>
                            <q-btn flat color="primary" label="View Event" />
                            <q-space />
                            <q-chip
                              v-if="isEventUpcoming(event.start_date)"
                              dense
                              color="positive"
                              text-color="white"
                              label="Upcoming"
                            />
                            <q-chip v-else dense color="grey" text-color="white" label="Past" />
                          </q-card-actions>
                        </q-card>
                      </div>
                    </div>

                    <!-- No Events State -->
                    <div v-else class="text-center q-pa-xl">
                      <q-icon name="event_busy" size="4em" class="text-grey-4 q-mb-md" />
                      <div class="text-h6 text-grey-6">No Events Found</div>
                      <div class="text-body2 text-grey-5">
                        This event series doesn't have any events yet.
                      </div>
                    </div>
                  </q-card-section>
                </q-card>
              </div>
            </div>
          </q-tab-panel>

          <!-- DJs Panel -->
          <q-tab-panel name="djs" class="q-pa-md">
            <div class="row q-col-gutter-lg">
              <div class="col-12">
                <q-card flat>
                  <q-card-section>
                    <div class="text-h6 q-mb-md">
                      <q-icon name="library_music" class="q-mr-sm" />
                      DJs
                    </div>

                    <!-- Loading DJs -->
                    <div v-if="false" class="text-center q-pa-md">
                      <q-spinner color="primary" size="40px" />
                      <div class="text-body2 q-mt-md">Loading DJs...</div>
                    </div>

                    <!-- DJs Table -->
                    <div v-else-if="djLeaderboard.length > 0">
                      <q-card class="q-mb-md" style="display: none">
                        <q-card-section>
                          <div id="dj-leaderboard-map" style="height: 320px; width: 100%"></div>
                        </q-card-section>
                      </q-card>
                      <q-table
                        :rows="djLeaderboard"
                        :columns="djColumns"
                        row-key="id"
                        flat
                        :pagination="{ rowsPerPage: 0 }"
                        class="dj-table"
                      >
                        <template #body-cell-name="props">
                          <q-td :props="props">
                            <div class="row items-center">
                              <div
                                class="text-weight-medium text-primary cursor-pointer"
                                @click="navigateToDJ(props.row.id)"
                              >
                                {{ props.row.name }}
                              </div>
                              <q-badge color="secondary" class="q-ml-sm" size="sm">
                                {{ props.row.playCount }}
                                {{ props.row.playCount === 1 ? 'event' : 'events' }}
                              </q-badge>
                            </div>
                          </q-td>
                        </template>

                        <template #body-cell-location="props">
                          <q-td :props="props">
                            <div class="text-grey-7">
                              {{ props.row.location }}
                            </div>
                          </q-td>
                        </template>

                        <template #body-cell-playCount="props">
                          <q-td :props="props">
                            <q-chip color="secondary" text-color="white" dense>
                              {{ props.row.playCount }}
                              {{ props.row.playCount === 1 ? 'time' : 'times' }}
                            </q-chip>
                          </q-td>
                        </template>

                        <template #body-cell-years="props">
                          <q-td :props="props">
                            <div class="row q-gutter-xs">
                              <q-chip
                                v-for="year in props.row.years"
                                :key="year"
                                dense
                                outline
                                color="primary"
                                size="sm"
                              >
                                {{ year }}
                              </q-chip>
                            </div>
                          </q-td>
                        </template>
                      </q-table>
                    </div>

                    <!-- No DJs State -->
                    <div v-else class="text-center q-pa-xl">
                      <q-icon name="music_off" size="4em" class="text-grey-4 q-mb-md" />
                      <div class="text-h6 text-grey-6">No DJs Found</div>
                      <div class="text-body2 text-grey-5">
                        No DJ information is available for events in this series.
                      </div>
                    </div>
                  </q-card-section>
                </q-card>
              </div>
            </div>
          </q-tab-panel>

          <!-- Organizer Panel -->
          <q-tab-panel name="organizer" class="q-pa-md">
            <div class="row q-col-gutter-lg">
              <div class="col-12">
                <q-card flat>
                  <q-card-section>
                    <div class="text-h6 q-mb-md">
                      <q-icon name="person" class="q-mr-sm" />
                      Organizer Information
                    </div>

                    <div v-if="organizer" class="row q-col-gutter-md">
                      <div class="col-12">
                        <q-card flat bordered>
                          <q-card-section>
                            <div class="text-subtitle1 q-mb-md">Contact Details</div>
                            <q-list dense>
                              <q-item>
                                <q-item-section avatar>
                                  <q-icon name="person" color="primary" />
                                </q-item-section>
                                <q-item-section>
                                  <q-item-label>Organizer</q-item-label>
                                  <q-item-label caption>{{ organizer.name }}</q-item-label>
                                </q-item-section>
                              </q-item>
                              <q-item v-if="organizer.url">
                                <q-item-section avatar>
                                  <q-icon name="link" color="secondary" />
                                </q-item-section>
                                <q-item-section>
                                  <q-item-label>Website</q-item-label>
                                  <q-item-label caption>
                                    <a :href="organizer.url" target="_blank" class="text-primary">
                                      {{ organizer.url }}
                                    </a>
                                  </q-item-label>
                                </q-item-section>
                              </q-item>
                              <q-item>
                                <q-item-section avatar>
                                  <q-icon name="location_on" color="accent" />
                                </q-item-section>
                                <q-item-section>
                                  <q-item-label>Location</q-item-label>
                                  <q-item-label caption>{{
                                    location || 'Not specified'
                                  }}</q-item-label>
                                </q-item-section>
                              </q-item>
                            </q-list>
                          </q-card-section>
                        </q-card>
                      </div>
                    </div>

                    <div v-else class="text-center q-pa-xl">
                      <q-icon name="person_off" size="4em" class="text-grey-4 q-mb-md" />
                      <div class="text-h6 text-grey-6">No Organizer Information</div>
                      <div class="text-body2 text-grey-5">
                        Organizer details are not available for this event series.
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
              <div class="col-12 col-md-6">
                <q-card flat>
                  <q-card-section>
                    <div class="text-h6 q-mb-md">
                      <q-icon name="link" class="q-mr-sm" />
                      Links & Resources
                    </div>
                    <q-list>
                      <q-item
                        v-if="eventSeries.website"
                        clickable
                        @click="openExternalLink(eventSeries.website)"
                      >
                        <q-item-section avatar>
                          <q-icon name="language" color="primary" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label>Official Website</q-item-label>
                          <q-item-label caption>{{ eventSeries.website }}</q-item-label>
                        </q-item-section>
                        <q-item-section side>
                          <q-icon name="launch" />
                        </q-item-section>
                      </q-item>
                    </q-list>
                  </q-card-section>
                </q-card>
              </div>

              <div class="col-12 col-md-6">
                <q-card flat>
                  <q-card-section>
                    <div class="text-h6 q-mb-md">
                      <q-icon name="info" class="q-mr-sm" />
                      Additional Information
                    </div>
                    <q-list dense>
                      <q-item>
                        <q-item-section avatar>
                          <q-icon name="calendar_today" color="info" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label>Added to TMD</q-item-label>
                          <q-item-label caption>{{ formatDate(eventSeries.date) }}</q-item-label>
                        </q-item-section>
                      </q-item>
                      <q-item>
                        <q-item-section avatar>
                          <q-icon name="update" color="warning" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label>Last Updated</q-item-label>
                          <q-item-label caption>{{
                            formatDate(eventSeries.modified)
                          }}</q-item-label>
                        </q-item-section>
                      </q-item>
                      <q-item>
                        <q-item-section avatar>
                          <q-icon name="tag" color="positive" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label>Categories</q-item-label>
                          <q-item-label caption>
                            {{
                              categories.length > 0
                                ? categories.map((c) => c.name).join(', ')
                                : 'None'
                            }}
                          </q-item-label>
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
import { useQuasar } from 'quasar';
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useCountries } from '../composables/useCountries';
import { useFormatters } from '../composables/useFormatters';
import { eventSeriesService } from '../services';
import type { EventSeries } from '../services/types';

const { formatDate } = useFormatters();
const { getCountryName } = useCountries();
const route = useRoute();
const router = useRouter();
const $q = useQuasar();

// Helper function to extract rendered title from V4 API responses
const getRenderedTitle = (title: string | { rendered: string } | undefined): string => {
  if (typeof title === 'string') return title;
  if (title && typeof title === 'object' && 'rendered' in title) return title.rendered;
  return '';
};

// State
const eventSeries = ref<EventSeries | null>(null);
const isLoading = ref(true);
const error = ref<string | null>(null);
const tab = ref('overview');

// Add computed property for DJ leaderboard
const djLeaderboard = computed(() => {
  return eventSeries.value?.dj_statistics?.dj_list || [];
});

// Default image for when no featured image is available
const defaultImage = 'https://cdn.quasar.dev/img/mountains.jpg';

// Computed properties
const featuredImage = computed(() => {
  if (eventSeries.value?._embedded?.['wp:featuredmedia']?.[0]) {
    return eventSeries.value._embedded['wp:featuredmedia'][0].source_url;
  }
  return null;
});

const descriptionHtml = computed(() => {
  return eventSeries.value?.content?.rendered || null;
});

const location = computed(() => {
  if (!eventSeries.value) return null;
  const city = eventSeries.value.city;
  const country = getCountryName(eventSeries.value.country || '');
  if (city && country) {
    return `${city}, ${country}`;
  }
  return city || country || null;
});

const categories = computed(() => {
  if (!eventSeries.value?._embedded?.['wp:term']) return [];
  return eventSeries.value._embedded['wp:term'][0] || [];
});

const organizer = computed(() => {
  return eventSeries.value?._embedded?.author?.[0] || null;
});

const seriesEvents = computed(() => {
  return eventSeries.value?._embedded?.events || [];
});

const sortedEvents = computed(() => {
  if (!eventSeries.value?._embedded?.events) return [];
  return [...eventSeries.value._embedded.events].sort((a, b) => {
    const aDate = a.start_date || '';
    const bDate = b.start_date || '';
    return bDate.localeCompare(aDate); // descending
  });
});

const upcomingEventsCount = computed(() => {
  return seriesEvents.value.filter((event) => isEventUpcoming(event.start_date)).length;
});

const pastEventsCount = computed(() => {
  return seriesEvents.value.filter((event) => !isEventUpcoming(event.start_date)).length;
});

const seriesInfoItems = computed(() => [
  {
    show: true,
    icon: 'event_repeat',
    color: 'primary',
    label: 'Series Name',
    value: eventSeries.value?.title || 'Unknown',
  },
  {
    show: !!eventSeries.value?.start_date,
    icon: 'event',
    color: 'secondary',
    label: 'Start Date',
    value: eventSeries.value?.start_date ? formatDate(eventSeries.value.start_date) : '',
  },
  {
    show: !!eventSeries.value?.registration_start_date,
    icon: 'how_to_reg',
    color: 'accent',
    label: 'Registration Start',
    value: eventSeries.value?.registration_start_date
      ? formatDate(eventSeries.value.registration_start_date)
      : '',
  },
  {
    show: !!location.value,
    icon: 'location_on',
    color: 'info',
    label: 'Location',
    value: location.value || '',
  },
  {
    show: seriesEvents.value.length > 0,
    icon: 'event_available',
    color: 'positive',
    label: 'Total Events',
    value: `${seriesEvents.value.length} event${seriesEvents.value.length !== 1 ? 's' : ''}`,
  },
  {
    show: upcomingEventsCount.value > 0,
    icon: 'schedule',
    color: 'warning',
    label: 'Upcoming Events',
    value: `${upcomingEventsCount.value} upcoming`,
  },
]);

// DJ table columns
const djColumns = [
  {
    name: 'name',
    label: 'DJ Name',
    field: 'name',
    align: 'left' as const,
    sortable: true,
  },
  {
    name: 'location',
    label: 'Location',
    field: 'location',
    align: 'left' as const,
    sortable: true,
  },
  {
    name: 'playCount',
    label: 'Appearances',
    field: 'playCount',
    align: 'center' as const,
    sortable: true,
  },
  {
    name: 'years',
    label: 'Years Played',
    field: 'years',
    align: 'left' as const,
    sortable: false,
  },
];

// Methods
const getCategoryIcon = (categoryName: string): string => {
  const name = categoryName.toLowerCase();
  if (name.includes('festival')) return 'celebration';
  if (name.includes('marathon')) return 'directions_run';
  if (name.includes('encuentro')) return 'people';
  if (name.includes('workshop')) return 'school';
  if (name.includes('learning')) return 'menu_book';
  return 'event';
};

const isEventUpcoming = (startDate: string): boolean => {
  if (!startDate) return false;
  return new Date(startDate) > new Date();
};

const navigateToEvent = (eventId: number) => {
  void router.push(`/events/${eventId}`);
};

const navigateToDJ = (djId: number) => {
  void router.push(`/djs/${djId}`);
};

const openExternalLink = (url: string) => {
  window.open(url, '_blank', 'noopener,noreferrer');
};

const loadEventSeries = async (done?: () => void) => {
  isLoading.value = true;
  error.value = null;
  const id = Number.parseInt(route.params.id as string);

  if (!id) {
    error.value = 'Invalid event series ID';
    isLoading.value = false;
    return;
  }

  try {
    eventSeries.value = await eventSeriesService.getEventSeriesById(id, { include_events: true });
    // No need to load DJs separately
  } catch (err) {
    console.error('Error loading event series:', err);
    error.value = 'Failed to load event series details';
    $q.notify({
      type: 'negative',
      message: error.value,
      position: 'top',
    });
  } finally {
    isLoading.value = false;
    if (done) done();
  }
};

onMounted(() => {
  void loadEventSeries();
});
</script>

<style scoped lang="scss">
.event-series-details-page {
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

  .series-description {
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

  .event-card {
    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
    border-radius: 8px;
    overflow: hidden;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    }
  }

  .organizer-card {
    transition: all 0.2s ease;
    border-radius: 8px;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
  }

  .stats-card {
    text-align: center;
    min-width: 80px;
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .dj-table {
    .q-table__top {
      padding: 0;
    }

    .q-table thead th {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      font-weight: 600;
    }

    .q-table tbody tr:hover {
      background-color: rgba(102, 126, 234, 0.1);
      transform: translateY(-1px);
      transition: all 0.2s ease;
    }

    .q-table tbody td {
      border-bottom: 1px solid rgba(0, 0, 0, 0.05);
    }
  }
}
</style>

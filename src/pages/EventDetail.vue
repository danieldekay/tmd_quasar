<template>
  <q-page padding>
    <div class="row q-mb-md items-center">
      <div class="col-auto">
        <q-btn
          flat
          dense
          icon="arrow_back"
          label="Back to List"
          @click="goBackToList"
          class="q-mr-md"
        />
      </div>
      <div class="col">
        <h1 class="text-h4 q-mb-none">Event Details</h1>
      </div>
      <div class="col-auto">
        <q-btn round color="primary" icon="refresh" @click="loadEvent" :loading="loading">
          <q-tooltip>Reload event</q-tooltip>
        </q-btn>
      </div>
    </div>

    <div v-if="loading" class="row justify-center">
      <q-spinner color="primary" size="3em" />
    </div>

    <div v-else-if="error" class="q-mb-md">
      <q-banner class="bg-negative text-white">
        {{ error }}
        <template v-slot:action>
          <q-btn flat label="Retry" @click="loadEvent" />
        </template>
      </q-banner>
    </div>

    <div v-else-if="event" class="row q-col-gutter-md">
      <div class="col-12">
        <q-card class="q-pa-lg q-mb-md event-header-card">
          <div class="row items-center q-col-gutter-xl">
            <!-- Header Info (Title, Date, Location, Category) -->
            <div class="col-12 col-md-7">
              <div class="event-title text-h3 text-weight-bold q-mb-xs ellipsis">
                {{
                  event.edition && event.event_name
                    ? event.edition + ' – ' + event.event_name
                    : event.edition || event.event_name || '-'
                }}
              </div>
              <div class="row items-center q-mb-sm q-gutter-md">
                <div class="row items-center q-mr-md">
                  <q-icon name="event" size="sm" class="q-mr-xs" />
                  <span class="text-subtitle1"
                    >{{ formatDate(event.start_date)
                    }}<span v-if="event.end_date"> - {{ formatDate(event.end_date) }}</span></span
                  >
                </div>
                <div class="row items-center q-mr-md">
                  <q-icon name="location_on" size="sm" class="q-mr-xs" />
                  <span class="text-subtitle2"
                    >{{ event.city }}<span v-if="event.city && event.country">, </span
                    >{{ event.country }}</span
                  >
                </div>
                <div class="row items-center">
                  <q-icon name="category" size="sm" class="q-mr-xs" />
                  <q-chip color="primary" text-color="white" size="sm">
                    {{ event.event_category || '-' }}
                  </q-chip>
                </div>
              </div>
            </div>
            <!-- Event Image -->
            <div class="col-12 col-md-5 flex flex-center q-mt-md q-mt-none-md">
              <q-img
                :src="event.featured_image || 'https://cdn.quasar.dev/img/mountains.jpg'"
                :ratio="3 / 2"
                class="rounded-borders shadow-2 event-image"
                style="max-width: 320px; min-width: 180px"
              />
            </div>
          </div>
        </q-card>

        <!-- Description Section -->
        <div class="text-h6 q-mb-sm q-mt-lg q-pt-md border-b">Description</div>
        <div class="q-mb-md">
          <div
            class="text-body1 q-mt-sm"
            v-html="
              event.description || '<span class=\'text-grey\'>No description available.</span>'
            "
          ></div>
        </div>

        <!-- Event Metadata Grid -->
        <div class="text-h6 q-mb-sm q-mt-lg q-pt-md border-b">Event Metadata</div>
        <div class="row q-col-gutter-md q-mb-md">
          <div class="col-12 col-sm-6 col-md-4">
            <q-list bordered separator>
              <q-item
                ><q-item-section
                  ><q-item-label caption>Event Name</q-item-label
                  ><q-item-label>{{ event.event_name || '-' }}</q-item-label></q-item-section
                ></q-item
              >
              <q-item
                ><q-item-section
                  ><q-item-label caption>Edition</q-item-label
                  ><q-item-label>{{ event.edition || '-' }}</q-item-label></q-item-section
                ></q-item
              >
              <q-item
                ><q-item-section
                  ><q-item-label caption>Start Date</q-item-label
                  ><q-item-label>{{
                    formatDate(event.start_date) || '-'
                  }}</q-item-label></q-item-section
                ></q-item
              >
              <q-item
                ><q-item-section
                  ><q-item-label caption>End Date</q-item-label
                  ><q-item-label>{{
                    formatDate(event.end_date) || '-'
                  }}</q-item-label></q-item-section
                ></q-item
              >
              <q-item
                ><q-item-section
                  ><q-item-label caption>Location</q-item-label
                  ><q-item-label
                    >{{ event.city || '-' }}, {{ event.country || '-' }}</q-item-label
                  ></q-item-section
                ></q-item
              >
              <q-item
                ><q-item-section
                  ><q-item-label caption>Role Balanced</q-item-label
                  ><q-item-label>{{ event.role_balanced || '-' }}</q-item-label></q-item-section
                ></q-item
              >
              <q-item
                ><q-item-section
                  ><q-item-label caption>Invitation Only</q-item-label
                  ><q-item-label>{{ event.invitation_only || '-' }}</q-item-label></q-item-section
                ></q-item
              >
            </q-list>
          </div>
          <div class="col-12 col-sm-6 col-md-4">
            <q-list bordered separator>
              <q-item
                ><q-item-section
                  ><q-item-label caption>Website</q-item-label
                  ><q-item-label
                    ><a
                      v-if="event.website"
                      :href="event.website"
                      target="_blank"
                      class="text-primary"
                      >{{ event.website }}</a
                    ><span v-else class="text-grey">-</span></q-item-label
                  ></q-item-section
                ></q-item
              >
              <q-item
                ><q-item-section
                  ><q-item-label caption>Email</q-item-label
                  ><q-item-label
                    ><a v-if="event.email" :href="'mailto:' + event.email" class="text-primary">{{
                      event.email
                    }}</a
                    ><span v-else class="text-grey">-</span></q-item-label
                  ></q-item-section
                ></q-item
              >
              <q-item
                ><q-item-section
                  ><q-item-label caption>Facebook</q-item-label
                  ><q-item-label
                    ><div
                      v-if="event.facebook_event || event.facebook_group || event.facebook_page"
                    >
                      <a
                        v-if="event.facebook_event"
                        :href="event.facebook_event"
                        target="_blank"
                        class="text-primary q-mr-sm"
                        >Event</a
                      ><a
                        v-if="event.facebook_group"
                        :href="event.facebook_group"
                        target="_blank"
                        class="text-primary q-mr-sm"
                        >Group</a
                      ><a
                        v-if="event.facebook_page"
                        :href="event.facebook_page"
                        target="_blank"
                        class="text-primary"
                        >Page</a
                      >
                    </div>
                    <span v-else class="text-grey">-</span></q-item-label
                  ></q-item-section
                ></q-item
              >
              <q-item
                ><q-item-section
                  ><q-item-label caption>Price</q-item-label
                  ><q-item-label>{{
                    event.price ? `${event.price} ${event.currency || ''}` : '-'
                  }}</q-item-label></q-item-section
                ></q-item
              >
              <q-item
                ><q-item-section
                  ><q-item-label caption>Participants</q-item-label
                  ><q-item-label>{{
                    event.number_of_participants || '-'
                  }}</q-item-label></q-item-section
                ></q-item
              >
              <q-item
                ><q-item-section
                  ><q-item-label caption>Music Hours</q-item-label
                  ><q-item-label>{{ event.music_hours || '-' }}</q-item-label></q-item-section
                ></q-item
              >
              <q-item
                ><q-item-section
                  ><q-item-label caption>Month</q-item-label
                  ><q-item-label>{{ event.month || '-' }}</q-item-label></q-item-section
                ></q-item
              >
              <q-item
                ><q-item-section
                  ><q-item-label caption>Weekend</q-item-label
                  ><q-item-label>{{ event.weekend || '-' }}</q-item-label></q-item-section
                ></q-item
              >
            </q-list>
          </div>
          <div class="col-12 col-sm-6 col-md-4">
            <q-list bordered separator>
              <q-item
                ><q-item-section
                  ><q-item-label caption>Milongas</q-item-label
                  ><q-item-label>{{ event.have_milongas || '-' }}</q-item-label></q-item-section
                ></q-item
              >
              <q-item
                ><q-item-section
                  ><q-item-label caption>Tickets</q-item-label
                  ><q-item-label>{{ event.have_tickets || '-' }}</q-item-label></q-item-section
                ></q-item
              >
              <q-item
                ><q-item-section
                  ><q-item-label caption>Food</q-item-label
                  ><q-item-label>{{ event.have_food || '-' }}</q-item-label></q-item-section
                ></q-item
              >
              <q-item
                ><q-item-section
                  ><q-item-label caption>Food Options</q-item-label
                  ><q-item-label>{{ event.food_options || '-' }}</q-item-label></q-item-section
                ></q-item
              >
              <q-item
                ><q-item-section
                  ><q-item-label caption>Sleeping</q-item-label
                  ><q-item-label>{{ event.have_sleep || '-' }}</q-item-label></q-item-section
                ></q-item
              >
              <q-item
                ><q-item-section
                  ><q-item-label caption>Sleeping Options</q-item-label
                  ><q-item-label>{{ event.sleeping_options || '-' }}</q-item-label></q-item-section
                ></q-item
              >
              <q-item
                ><q-item-section
                  ><q-item-label caption>Services</q-item-label
                  ><q-item-label>{{ event.have_services || '-' }}</q-item-label></q-item-section
                ></q-item
              >
              <q-item
                ><q-item-section
                  ><q-item-label caption>Service Options</q-item-label
                  ><q-item-label>{{ event.service_options || '-' }}</q-item-label></q-item-section
                ></q-item
              >
            </q-list>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="text-h6 q-mb-sm q-mt-lg q-pt-md border-b">Quick Actions</div>
        <div class="row q-col-gutter-sm q-mt-sm">
          <div class="col-12 col-sm-6 col-md-4">
            <q-btn
              color="primary"
              icon="share"
              label="Share"
              class="full-width q-py-md text-weight-bold"
              @click="shareEvent"
              unelevated
            />
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { wordpressService } from '../services/wordpress';
import type { Event } from '../services/wordpress';

const route = useRoute();
const router = useRouter();
const $q = useQuasar();
const event = ref<Event | null>(null);
const loading = ref(true);
const error = ref<string | null>(null);

const formatDate = (date: string | undefined) => {
  if (!date) return 'Date not set';
  return new Date(date).toISOString().split('T')[0];
};

interface ApiError extends Error {
  response?: {
    status: number;
    data?: unknown;
  };
  request?: unknown;
}

const loadEvent = async () => {
  const eventId = Number(route.params.id);
  if (!eventId) {
    error.value = 'Invalid event ID. Please check the URL and try again.';
    loading.value = false;
    return;
  }

  loading.value = true;
  error.value = null;

  try {
    const data = await wordpressService.getEvent(eventId);

    if (!data) {
      error.value = 'Event not found. It may have been removed or is not accessible.';
      return;
    }

    event.value = data;
  } catch (err: unknown) {
    console.error('Error loading event:', err);
    const apiError = err as ApiError;

    if (apiError.response) {
      switch (apiError.response.status) {
        case 404:
          error.value = 'Event not found. It may have been removed or is not accessible.';
          break;
        case 401:
          error.value = 'Authentication required. Please log in to view this event.';
          break;
        case 403:
          error.value = 'Access denied. You do not have permission to view this event.';
          break;
        case 500:
          error.value = 'Server error. Please try again later.';
          break;
        default:
          error.value = `Failed to load event (${apiError.response.status}). Please try again.`;
      }
    } else if (apiError.request) {
      error.value = 'Network error. Please check your connection and try again.';
    } else {
      error.value = 'An unexpected error occurred. Please try again.';
    }
  } finally {
    loading.value = false;
  }
};

const shareEvent = () => {
  if (!event.value) return;

  if (navigator.share) {
    navigator
      .share({
        title: event.value.title,
        text: `Check out this event: ${event.value.title}`,
        url: window.location.href,
      })
      .catch(console.error);
  } else {
    // Fallback for browsers that don't support Web Share API
    const dummy = document.createElement('input');
    document.body.appendChild(dummy);
    dummy.value = window.location.href;
    dummy.select();
    document.execCommand('copy');
    document.body.removeChild(dummy);
    $q.notify({
      type: 'positive',
      message: 'Link copied to clipboard',
      position: 'top',
    });
  }
};

const goBackToList = () => {
  void router.push('/events');
};

onMounted(() => {
  void loadEvent();
});
</script>

<style lang="scss" scoped>
.q-card {
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-2px);
  }
}

.border-b {
  border-bottom: 2px solid #eee;
}

.event-header-card {
  background: #f8fafc;
  border-radius: 12px;
  box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.03);
}

.event-title {
  word-break: break-word;
  white-space: normal;
  max-width: 100%;
}

.event-image {
  border-radius: 8px;
}
</style>

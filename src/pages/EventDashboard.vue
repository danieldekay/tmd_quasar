<template>
  <q-page padding>
    <div v-if="isLoading" class="q-pa-md">
      <q-spinner color="primary" size="3em" />
      <div class="text-subtitle1 q-mt-sm">Loading event details...</div>
    </div>
    <div v-else-if="error" class="q-pa-md">
      <q-banner class="bg-negative text-white">
        {{ error }}
      </q-banner>
    </div>
    <div v-else-if="event" class="q-pa-md">
      <!-- Basic Information -->
      <q-card class="q-mb-md">
        <q-card-section>
          <div class="text-h5">{{ event.event_name }}</div>
          <div class="text-subtitle2">
            {{ formatDate(event.start_date) }} - {{ formatDate(event.end_date) }}
          </div>
          <div class="text-subtitle2">{{ event.city }}, {{ event.country }}</div>
        </q-card-section>
      </q-card>

      <!-- Contact & Links -->
      <q-card class="q-mb-md">
        <q-card-section>
          <div class="text-h6">Contact Information</div>
          <q-list>
            <q-item v-if="event.website">
              <q-item-section>
                <q-item-label>Website</q-item-label>
                <q-item-label caption>
                  <a :href="event.website" target="_blank">{{ event.website }}</a>
                </q-item-label>
              </q-item-section>
            </q-item>
            <q-item v-if="event.email">
              <q-item-section>
                <q-item-label>Email</q-item-label>
                <q-item-label caption>{{ event.email }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-item v-if="event.facebook_event">
              <q-item-section>
                <q-item-label>Facebook Event</q-item-label>
                <q-item-label caption>
                  <a :href="event.facebook_event" target="_blank">{{ event.facebook_event }}</a>
                </q-item-label>
              </q-item-section>
            </q-item>
            <q-item v-if="event.facebook_page">
              <q-item-section>
                <q-item-label>Facebook Page</q-item-label>
                <q-item-label caption>
                  <a :href="event.facebook_page" target="_blank">{{ event.facebook_page }}</a>
                </q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>

      <!-- Event Features -->
      <q-card class="q-mb-md">
        <q-card-section>
          <div class="text-h6">Event Features</div>
          <q-list>
            <q-item v-if="event.have_milongas">
              <q-item-section>
                <q-item-label>Milongas</q-item-label>
                <q-item-label caption>Available</q-item-label>
              </q-item-section>
            </q-item>
            <q-item v-if="event.have_tickets">
              <q-item-section>
                <q-item-label>Tickets</q-item-label>
                <q-item-label caption>Available</q-item-label>
              </q-item-section>
            </q-item>
            <q-item v-if="event.have_food">
              <q-item-section>
                <q-item-label>Food Options</q-item-label>
                <q-item-label caption>{{ event.food_options }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-item v-if="event.have_sleep">
              <q-item-section>
                <q-item-label>Sleeping Options</q-item-label>
                <q-item-label caption>{{ event.sleeping_options }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-item v-if="event.meta_box?.have_live_music">
              <q-item-section>
                <q-item-label>Live Music</q-item-label>
                <q-item-label caption>Available</q-item-label>
              </q-item-section>
            </q-item>
            <q-item v-if="event.meta_box?.have_lessons">
              <q-item-section>
                <q-item-label>Lessons</q-item-label>
                <q-item-label caption>Available</q-item-label>
              </q-item-section>
            </q-item>
            <q-item v-if="event.meta_box?.have_show">
              <q-item-section>
                <q-item-label>Shows</q-item-label>
                <q-item-label caption>Available</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>

      <!-- Registration Info -->
      <q-card class="q-mb-md" v-if="event.have_registration">
        <q-card-section>
          <div class="text-h6">Registration</div>
          <q-list>
            <q-item v-if="event.registration_start_date">
              <q-item-section>
                <q-item-label>Registration Opens</q-item-label>
                <q-item-label caption>{{ formatDate(event.registration_start_date) }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-item v-if="event.have_registration_mode">
              <q-item-section>
                <q-item-label>Registration Mode</q-item-label>
                <q-item-label caption>{{ event.have_registration_mode }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>

      <!-- Additional Information -->
      <q-card class="q-mb-md">
        <q-card-section>
          <div class="text-h6">Additional Information</div>
          <q-list>
            <q-item v-if="event.role_balanced">
              <q-item-section>
                <q-item-label>Role Balanced</q-item-label>
                <q-item-label caption>{{ event.role_balanced }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-item v-if="event.invitation_only">
              <q-item-section>
                <q-item-label>Invitation Only</q-item-label>
                <q-item-label caption>Yes</q-item-label>
              </q-item-section>
            </q-item>
            <q-item v-if="event.price">
              <q-item-section>
                <q-item-label>Price</q-item-label>
                <q-item-label caption>{{ event.price }} {{ event.currency }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-item v-if="event.number_of_participants">
              <q-item-section>
                <q-item-label>Number of Participants</q-item-label>
                <q-item-label caption>{{ event.number_of_participants }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-item v-if="event.music_hours">
              <q-item-section>
                <q-item-label>Music Hours</q-item-label>
                <q-item-label caption>{{ event.music_hours }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>

      <!-- Location -->
      <q-card class="q-mb-md" v-if="event.lat && event.lon">
        <q-card-section>
          <div class="text-h6">Location</div>
          <div class="text-subtitle2">{{ event.city }}, {{ event.country }}</div>
          <div class="text-caption">Coordinates: {{ event.lat }}, {{ event.lon }}</div>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { wordpressService } from 'src/services/wordpress';
import type { Event } from 'src/services/wordpress';
import { useQuasar } from 'quasar';

export default defineComponent({
  name: 'EventDashboard',
  setup() {
    const route = useRoute();
    const $q = useQuasar();
    const event = ref<Event | null>(null);
    const isLoading = ref(true);
    const error = ref<string | null>(null);

    const formatDate = (dateString: string) => {
      if (!dateString) return '';
      return new Date(dateString).toISOString().split('T')[0];
    };

    onMounted(() => {
      const eventId = Number(route.params.id);
      void (async () => {
        try {
          isLoading.value = true;
          error.value = null;
          if (eventId) {
            event.value = await wordpressService.getEvent(eventId);
          }
        } catch (err) {
          console.error('Error loading event:', err);
          error.value = 'Failed to load event details. Please try again later.';
          $q.notify({
            type: 'negative',
            message: error.value,
            position: 'top',
          });
        } finally {
          isLoading.value = false;
        }
      })();
    });

    return {
      event,
      formatDate,
      isLoading,
      error,
    };
  },
});
</script>

<style scoped>
.q-card {
  max-width: 800px;
  margin: 0 auto;
}
</style>

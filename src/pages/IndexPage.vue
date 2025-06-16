<template>
  <q-page class="landing-page">
    <!-- Hero Section -->
    <section class="hero-section">
      <q-parallax src="https://cdn.quasar.dev/img/parallax2.jpg" :height="600">
        <div class="hero-content text-center">
          <h1 class="text-h2 text-weight-bold text-white">Tango Marathons</h1>
          <p class="text-h5 text-white q-mt-md">Discover the world's best tango events</p>
          <q-btn
            color="primary"
            size="lg"
            label="Explore Events"
            class="q-mt-lg"
            to="/events"
            icon="search"
          />
        </div>
      </q-parallax>
    </section>

    <!-- Features Section -->
    <section class="features-section q-pa-xl">
      <div class="row q-col-gutter-lg justify-center">
        <div class="col-12 col-md-4">
          <q-card class="feature-card">
            <q-card-section>
              <q-icon name="event" size="3rem" color="primary" />
              <h3 class="text-h5 q-mt-md">Upcoming Events</h3>
              <p class="text-body1 q-mt-sm">
                Find the latest tango marathons, festivals, and encuentros
              </p>
            </q-card-section>
          </q-card>
        </div>
        <div class="col-12 col-md-4">
          <q-card class="feature-card">
            <q-card-section>
              <q-icon name="people" size="3rem" color="primary" />
              <h3 class="text-h5 q-mt-md">DJs & Teachers</h3>
              <p class="text-body1 q-mt-sm">Connect with professional DJs and teachers</p>
            </q-card-section>
          </q-card>
        </div>
        <div class="col-12 col-md-4">
          <q-card class="feature-card">
            <q-card-section>
              <q-icon name="map" size="3rem" color="primary" />
              <h3 class="text-h5 q-mt-md">Global Coverage</h3>
              <p class="text-body1 q-mt-sm">Events from around the world at your fingertips</p>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </section>

    <!-- Upcoming Events Section -->
    <section class="events-section q-pa-xl bg-grey-2">
      <div class="container">
        <h2 class="text-h4 text-center q-mb-xl">Upcoming Events</h2>
        <div class="row q-col-gutter-lg">
          <div class="col-12 col-md-6 col-lg-4" v-for="i in 3" :key="i">
            <q-card class="event-card">
              <q-img src="https://cdn.quasar.dev/img/mountains.jpg" :ratio="16 / 9">
                <div class="absolute-bottom text-subtitle2 text-center bg-transparent">
                  Tango Marathon {{ i }}
                </div>
              </q-img>
              <q-card-section>
                <div class="text-subtitle2">
                  <q-icon name="location_on" size="xs" />
                  Location, Country
                </div>
                <div class="text-caption q-mt-sm">
                  <q-icon name="event" size="xs" />
                  Date: Coming Soon
                </div>
              </q-card-section>
              <q-card-actions align="right">
                <q-btn flat color="primary" label="Details" icon="info" />
              </q-card-actions>
            </q-card>
          </div>
        </div>
      </div>
    </section>

    <!-- Newsletter Section -->
    <section class="newsletter-section q-pa-xl">
      <div class="container text-center">
        <h2 class="text-h4 q-mb-lg">Stay Updated</h2>
        <p class="text-body1 q-mb-lg">
          Subscribe to our newsletter for the latest events and updates
        </p>
        <div class="row justify-center">
          <div class="col-12 col-md-6">
            <q-input
              v-model="email"
              type="email"
              label="Your Email"
              outlined
              class="q-mb-md"
              :rules="[(val) => !!val || 'Email is required']"
            >
              <template v-slot:append>
                <q-btn color="primary" label="Subscribe" icon="send" @click="subscribe" />
              </template>
            </q-input>
          </div>
        </div>
      </div>
    </section>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useQuasar } from 'quasar';

const $q = useQuasar();
const email = ref('');

const subscribe = () => {
  if (email.value) {
    $q.notify({
      type: 'positive',
      message: 'Thank you for subscribing!',
      icon: 'check_circle',
      position: 'top',
    });
    email.value = '';
  }
};
</script>

<style lang="scss" scoped>
.landing-page {
  .hero-section {
    .hero-content {
      padding: 0 1rem;
    }
  }

  .feature-card {
    height: 100%;
    transition: transform 0.3s ease;

    &:hover {
      transform: translateY(-5px);
    }
  }

  .event-card {
    transition: transform 0.3s ease;

    &:hover {
      transform: translateY(-5px);
    }
  }
}
</style>

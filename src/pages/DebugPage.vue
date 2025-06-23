<template>
  <q-page class="q-pa-md">
    <h2 class="text-h4 q-mb-md">Debug Information</h2>

    <q-card class="q-mb-md">
      <q-card-section>
        <div class="text-h6">API Configuration</div>
        <q-list>
          <q-item>
            <q-item-section>
              <q-item-label>Base API URL</q-item-label>
              <q-item-label caption>{{ apiBaseUrl }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
    </q-card>

    <q-card class="q-mb-md">
      <q-card-section>
        <div class="text-h6">API Endpoints</div>
        <q-list>
          <q-item v-for="(endpoint, index) in apiEndpoints" :key="index">
            <q-item-section>
              <q-item-label>{{ endpoint.name }}</q-item-label>
              <q-item-label caption>{{ endpoint.url }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
    </q-card>

    <q-card class="q-mb-md">
      <q-card-section>
        <div class="text-h6">Frontend Routes</div>
        <q-list>
          <q-item v-for="(route, index) in frontendRoutes" :key="index">
            <q-item-section>
              <q-item-label>{{ route.name }}</q-item-label>
              <q-item-label caption>{{ route.path }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
    </q-card>

    <q-card>
      <q-card-section>
        <div class="text-h6">Environment</div>
        <q-list>
          <q-item>
            <q-item-section>
              <q-item-label>Node Environment</q-item-label>
              <q-item-label caption>{{ nodeEnv }}</q-item-label>
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section>
              <q-item-label>Router Mode</q-item-label>
              <q-item-label caption>{{ routerMode }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { api } from '../boot/axios';

const apiBaseUrl = ref(api.defaults.baseURL || 'Not configured');
const nodeEnv = ref(process.env.NODE_ENV);
const routerMode = ref(process.env.VUE_ROUTER_MODE);

const apiEndpoints = ref([
  {
    name: 'List Events',
    url: '/wp/v2/tmd_event?_embed=true',
  },
  {
    name: 'Single Event',
    url: '/wp/v2/tmd_event/:id?_embed=true',
  },
]);

const frontendRoutes = ref([
  { name: 'Home', path: '/' },
  { name: 'Events List', path: '/events' },
  { name: 'Event Detail', path: '/events/:id' },
  { name: 'DJs', path: '/djs' },
  { name: 'Teachers', path: '/teachers' },
  { name: 'About', path: '/about' },
  { name: 'Debug', path: '/debug' },
]);
</script>

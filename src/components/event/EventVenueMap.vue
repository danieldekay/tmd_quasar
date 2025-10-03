<template>
  <div v-if="venue" class="venue-map-wrapper col-12">
    <!-- Error State -->
    <div v-if="mapError" class="map-error q-pa-md">
      <q-banner type="negative" class="text-white">
        <template #avatar>
          <q-icon name="error" color="white" />
        </template>
        {{ mapError }}
      </q-banner>
    </div>

    <!-- Map Container (only shown if no error) -->
    <div v-else class="map-section relative-position">
      <!-- Loading Spinner -->
      <div v-if="!isMapReady" class="map-loading absolute-center">
        <q-spinner color="primary" size="3em" />
      </div>

      <!-- Leaflet Map Container -->
      <div
        ref="mapContainer"
        class="map-container"
        :data-lat="venue.coordinates?.lat"
        :data-lng="venue.coordinates?.lng"
        :aria-label="`Map showing ${venue.name} location`"
        role="application"
      />
    </div>

    <!-- Venue Information (always visible) -->
    <div class="venue-info q-pa-md">
      <h3 class="venue-name text-h5 q-mb-xs">{{ venue.name }}</h3>
      <div class="venue-address text-body2 text-grey-8 q-mb-xs">
        {{ venue.address }}
      </div>
      <div class="venue-location text-body2 text-grey-7">{{ venue.city }}, {{ venue.country }}</div>
      <div class="venue-full-address text-caption text-grey-6 q-mt-sm">
        {{ venue.address }}, {{ venue.city }}, {{ venue.country }}
      </div>
    </div>
  </div>

  <!-- Null Venue State -->
  <div v-else class="venue-map-wrapper col-12">
    <div class="map-error q-pa-md">
      <q-banner type="negative" class="text-white">
        <template #avatar>
          <q-icon name="error" color="white" />
        </template>
        No venue provided
      </q-banner>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, toRef } from 'vue';
import { useMapIntegration } from '../../composables/useMapIntegration';
import type { VenueData } from '../../types/event';

// Props
interface Props {
  venue: VenueData | null;
}

const props = defineProps<Props>();

// Convert venue prop to ref for composable
const venueRef = toRef(props, 'venue');

// Map container ref
const mapContainer = ref<HTMLElement | null>(null);

// Use map integration composable
const { mapError, isMapReady, initializeMap, destroyMap } = useMapIntegration(
  venueRef,
  mapContainer,
);

// Lifecycle: Initialize map on mount
onMounted(() => {
  void initializeMap();
});

// Lifecycle: Clean up map on unmount
onUnmounted(() => {
  destroyMap();
});
</script>

<style lang="scss" scoped>
.venue-map-wrapper {
  width: 100%;
}

.map-section {
  position: relative;
  width: 100%;
  min-height: 300px;

  @media (min-width: 600px) {
    min-height: 400px;
  }
}

.map-container {
  width: 100%;
  height: 300px;
  border-radius: 4px;
  overflow: hidden;
  background-color: #f5f5f5;

  @media (min-width: 600px) {
    height: 400px;
  }
}

.map-loading {
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.map-error {
  margin-bottom: 1rem;
}

.venue-info {
  background-color: #fafafa;
  border-radius: 4px;
  margin-top: 1rem;
}

.venue-name {
  color: #1976d2;
  font-weight: 600;
}

.venue-address,
.venue-location,
.venue-full-address {
  line-height: 1.5;
}
</style>

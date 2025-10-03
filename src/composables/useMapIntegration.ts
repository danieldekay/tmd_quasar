/**
 * useMapIntegration Composable
 *
 * Manages Leaflet map initialization, geocoding fallback, and lifecycle
 * Provides lazy loading and cleanup for venue location display
 *
 * Reference: /specs/004-event-display/contracts/use-map-integration.contract.md
 */

import type { Map as LeafletMap, Marker as LeafletMarker } from 'leaflet';
import { type Ref, ref } from 'vue';
import type { GeocodingResponse, VenueData } from '../types/event';

/**
 * Geocode a location using OpenStreetMap Nominatim API
 * Implements session storage caching to avoid duplicate requests
 */
async function geocodeLocation(city: string, country: string): Promise<[number, number] | null> {
  const cacheKey = `geocode:${city},${country}`;

  // Check session storage cache
  const cached = sessionStorage.getItem(cacheKey);
  if (cached) {
    try {
      const parsed = JSON.parse(cached) as {
        lat: number;
        lng: number;
        timestamp: number;
      };
      return [parsed.lat, parsed.lng];
    } catch {
      // Invalid cache entry, continue to API call
      sessionStorage.removeItem(cacheKey);
    }
  }

  // Call Nominatim API
  try {
    const query = encodeURIComponent(`${city}, ${country}`);
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'TMD-Quasar-Frontend/1.0',
      },
    });

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as GeocodingResponse;

    if (data.length === 0 || !data[0]) {
      return null;
    }

    const lat = Number.parseFloat(data[0].lat);
    const lng = Number.parseFloat(data[0].lon);

    // Cache the result
    sessionStorage.setItem(cacheKey, JSON.stringify({ lat, lng, timestamp: Date.now() }));

    return [lat, lng];
  } catch {
    return null;
  }
}

/**
 * Composable for Leaflet map integration
 * @param venue - Reactive reference to VenueData or null
 * @param containerRef - Reactive reference to HTML element for map mounting
 * @returns Map control functions and reactive state
 */
export function useMapIntegration(
  venue: Ref<VenueData | null>,
  containerRef: Ref<HTMLElement | null>,
): {
  initializeMap: () => Promise<void>;
  destroyMap: () => void;
  isMapReady: Ref<boolean>;
  mapError: Ref<string | null>;
} {
  const isMapReady = ref(false);
  const mapError = ref<string | null>(null);
  let mapInstance: LeafletMap | null = null;
  let markerInstance: LeafletMarker | null = null;

  /**
   * Initialize the Leaflet map
   * Handles dynamic import, coordinate validation, and geocoding fallback
   */
  async function initializeMap(): Promise<void> {
    // Already initialized
    if (isMapReady.value) {
      return;
    }

    // Validate container
    if (!containerRef.value) {
      mapError.value = 'Map container not found';
      return;
    }

    // Validate venue
    if (!venue.value) {
      mapError.value = 'No venue data available';
      return;
    }

    try {
      // Dynamic import of Leaflet
      const L = await import('leaflet');

      let center: [number, number];
      let zoom = 11;
      let shouldPlaceMarker = false;

      // Check if we have valid coordinates
      const coords = venue.value.coordinates;
      if (coords?.lat && coords?.lng) {
        // Valid coordinates from venue data
        center = [coords.lat, coords.lng];
        shouldPlaceMarker = true;
      } else {
        // Fallback to geocoding
        const city = venue.value.city || '';
        const country = venue.value.country || '';

        if (city && country) {
          const geocoded = await geocodeLocation(city, country);

          if (geocoded) {
            // Geocoding succeeded
            center = geocoded;
          } else {
            // Geocoding failed - use Europe center as final fallback
            center = [48.8566, 2.3522]; // Paris
            zoom = 5;
            mapError.value = 'Unable to determine location';
          }
        } else {
          // No location data at all
          center = [48.8566, 2.3522]; // Paris
          zoom = 5;
          mapError.value = 'Location information incomplete';
        }
      }

      // Create map instance
      const map = L.map(containerRef.value).setView(center, zoom);

      // Add OpenStreetMap tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      // Add marker if we have coordinates
      if (shouldPlaceMarker && venue.value) {
        const marker = L.marker(center).addTo(map);

        // Create popup content
        const popupContent = [
          venue.value.name,
          venue.value.address,
          venue.value.city,
          venue.value.country,
        ]
          .filter(Boolean)
          .join('<br>');

        if (popupContent) {
          marker.bindPopup(popupContent);
        }

        markerInstance = marker;
      }

      mapInstance = map;
      isMapReady.value = true;

      // Clear error on full success (coordinates were provided)
      if (!mapError.value) {
        mapError.value = null;
      }
    } catch (error) {
      mapError.value = 'Failed to load map library';
      isMapReady.value = false;
      console.error('Map initialization error:', error);
    }
  }

  /**
   * Destroy the map instance and clean up resources
   * Idempotent - safe to call multiple times
   */
  function destroyMap(): void {
    if (mapInstance) {
      try {
        // Remove marker first
        if (markerInstance) {
          // Type assertion for remove method
          (markerInstance as { remove?: () => void }).remove?.();
          markerInstance = null;
        }

        // Remove map instance
        (mapInstance as { remove?: () => void }).remove?.();
        mapInstance = null;
      } catch (error) {
        console.error('Error destroying map:', error);
      }
    }

    isMapReady.value = false;
    mapError.value = null;
  }

  return {
    initializeMap,
    destroyMap,
    isMapReady,
    mapError,
  };
}

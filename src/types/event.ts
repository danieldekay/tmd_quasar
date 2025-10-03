/**
 * Event Display Type Definitions
 *
 * Type definitions for enhanced event display feature based on data-model.md
 */

/**
 * Event response from API
 */
export type EventResponse = {
  id: number;
  title: string;
  slug: string;
  start_date?: string | undefined; // ISO 8601 format
  end_date?: string | undefined; // ISO 8601 format
  featured_image?: string | undefined; // URL
  categories?: string[] | undefined; // Category slugs
  edition?: number | string | undefined; // Edition number or string
  venue?: VenueData;
  description?: string;
  organizers?: string;
  status?: string;
};

/**
 * Venue/Location data
 */
export type VenueData = {
  name?: string;
  address?: string;
  city?: string;
  country?: string;
  country_code?: string;
  coordinates?:
    | {
        lat: number;
        lng: number;
      }
    | undefined;
};

/**
 * Event category types
 */
export type EventCategory = 'marathon' | 'festival' | 'encuentro' | 'workshop' | 'other';

/**
 * Category configuration
 */
export type CategoryConfig = {
  slug: EventCategory;
  name: string;
  color: string; // Hex color
  textColor: string; // Hex color for text
  icon: string; // Quasar icon name
  defaultImage: string; // Path to default image
};

/**
 * Leaflet map configuration
 */
export type MapConfig = {
  center: [number, number]; // [lat, lng]
  zoom: number;
  hasMarker: boolean;
  markerPosition?: [number, number];
  popupContent?: string;
};

/**
 * Formatted event data with computed properties
 */
export type FormattedEvent = EventResponse & {
  formattedDateRange: string;
  editionDisplay: string | null;
  categoryPillData: CategoryConfig | null;
  heroImageSrc: string;
};

/**
 * Geocoding API response from Nominatim
 */
export type GeocodingResponse = {
  lat: string;
  lon: string;
  display_name: string;
  type: string;
  importance: number;
}[];

/**
 * Cached geocoding result
 */
export type CachedGeocoding = {
  lat: number;
  lng: number;
  timestamp: number;
};

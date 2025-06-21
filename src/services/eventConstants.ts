/**
 * Event Service Constants
 * Centralized configuration for event-related API interactions
 */

// Enhanced meta fields for V3 API - categorized by usage and performance
export const EVENT_META_FIELDS = {
  // Essential fields always needed for event listings
  ESSENTIAL: [
    'start_date',
    'end_date',
    'registration_start_date',
    'city',
    'country',
    'event_name',
    'edition',
  ].join(','),

  // Feature fields for filtering and display
  FEATURES: [
    'have_milongas',
    'have_tickets',
    'have_food',
    'have_sleep',
    'have_registration',
    'invitation_only',
    'have_live_music',
    'have_lessons',
    'have_show',
    'price',
    'currency',
  ].join(','),

  // Venue and location fields
  VENUE: ['venue_name', 'street', 'lat', 'lon'].join(','),

  // Contact and communication fields
  CONTACT: [
    'contact_email',
    'contact_phone',
    'website',
    'facebook',
    'instagram',
    'registration_link',
  ].join(','),

  // Additional descriptive fields
  DESCRIPTIVE: [
    'short_description',
    'long_description',
    'accommodation_info',
    'transportation_info',
    'special_notes',
  ].join(','),
} as const;

// Combined meta field sets for different use cases
export const META_FIELD_SETS = {
  // Minimal set for list views
  LIST_MINIMAL: EVENT_META_FIELDS.ESSENTIAL,

  // Standard set for most list views
  LIST_STANDARD: [EVENT_META_FIELDS.ESSENTIAL, EVENT_META_FIELDS.FEATURES].join(','),

  // Complete set for list views with venue info
  LIST_COMPLETE: [
    EVENT_META_FIELDS.ESSENTIAL,
    EVENT_META_FIELDS.FEATURES,
    EVENT_META_FIELDS.VENUE,
  ].join(','),

  // Full set for detailed views
  DETAILS_FULL: [
    EVENT_META_FIELDS.ESSENTIAL,
    EVENT_META_FIELDS.FEATURES,
    EVENT_META_FIELDS.VENUE,
    EVENT_META_FIELDS.CONTACT,
    EVENT_META_FIELDS.DESCRIPTIVE,
  ].join(','),
} as const;

// Event categories supported by the V3 API
export const EVENT_CATEGORIES = {
  MARATHON: 'marathon',
  FESTIVAL: 'festival',
  ENCUENTRO: 'encuentro',
} as const;

// Event feature keys for type-safe feature checking
export const EVENT_FEATURES = {
  HAVE_MILONGAS: 'have_milongas',
  HAVE_TICKETS: 'have_tickets',
  HAVE_FOOD: 'have_food',
  HAVE_SLEEP: 'have_sleep',
  HAVE_REGISTRATION: 'have_registration',
  INVITATION_ONLY: 'invitation_only',
  HAVE_LIVE_MUSIC: 'have_live_music',
  HAVE_LESSONS: 'have_lessons',
  HAVE_SHOW: 'have_show',
} as const;

// Sorting options for events
export const EVENT_SORT_OPTIONS = {
  START_DATE: 'start_date',
  REGISTRATION_DATE: 'registration_start_date',
  TITLE: 'title',
  DATE: 'date',
} as const;

// Order directions
export const SORT_ORDER = {
  ASC: 'asc',
  DESC: 'desc',
} as const;

// Default parameters for different operations
export const DEFAULT_PARAMS = {
  // Default pagination
  PER_PAGE: 20,
  PAGE: 1,

  // Default sorting
  ORDER_BY: EVENT_SORT_OPTIONS.START_DATE,
  ORDER: SORT_ORDER.ASC,

  // Default meta fields for list operations
  META_FIELDS: META_FIELD_SETS.LIST_STANDARD,

  // Default embedding settings
  INCLUDE_TAXONOMIES: true,
  EMBED: false, // Performance optimization
} as const;

// Feature display configuration
export const FEATURE_DISPLAY = {
  [EVENT_FEATURES.HAVE_MILONGAS]: {
    label: 'Milongas',
    icon: 'music_note',
    color: 'primary',
    unavailableText: 'No milongas',
  },
  [EVENT_FEATURES.HAVE_TICKETS]: {
    label: 'Tickets Required',
    icon: 'confirmation_number',
    color: 'warning',
    unavailableText: 'No tickets required',
  },
  [EVENT_FEATURES.HAVE_FOOD]: {
    label: 'Food Available',
    icon: 'restaurant',
    color: 'positive',
    unavailableText: 'No food provided',
  },
  [EVENT_FEATURES.HAVE_SLEEP]: {
    label: 'Accommodation',
    icon: 'hotel',
    color: 'info',
    unavailableText: 'No accommodation',
  },
  [EVENT_FEATURES.HAVE_REGISTRATION]: {
    label: 'Registration Required',
    icon: 'how_to_reg',
    color: 'accent',
    unavailableText: 'No registration required',
  },
  [EVENT_FEATURES.INVITATION_ONLY]: {
    label: 'Invitation Only',
    icon: 'mail',
    color: 'warning',
    unavailableText: 'Open registration',
  },
  [EVENT_FEATURES.HAVE_LIVE_MUSIC]: {
    label: 'Live Music',
    icon: 'queue_music',
    color: 'primary',
    unavailableText: 'No live music',
  },
  [EVENT_FEATURES.HAVE_LESSONS]: {
    label: 'Lessons',
    icon: 'school',
    color: 'positive',
    unavailableText: 'No lessons',
  },
  [EVENT_FEATURES.HAVE_SHOW]: {
    label: 'Shows',
    icon: 'theater_comedy',
    color: 'secondary',
    unavailableText: 'No shows',
  },
} as const;

// Type exports for better TypeScript support
export type EventCategory = (typeof EVENT_CATEGORIES)[keyof typeof EVENT_CATEGORIES];
export type EventFeature = (typeof EVENT_FEATURES)[keyof typeof EVENT_FEATURES];
export type EventSortOption = (typeof EVENT_SORT_OPTIONS)[keyof typeof EVENT_SORT_OPTIONS];
export type SortOrder = (typeof SORT_ORDER)[keyof typeof SORT_ORDER];

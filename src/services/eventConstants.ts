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

// Teacher Constants
export const TEACHER_ROLES = {
  LEADER: 'leader',
  FOLLOWER: 'follower',
  BOTH: 'both',
  DOUBLE_ROLE: 'double-role',
} as const;

export const TEACHER_GENDERS = {
  MAN: 'man',
  WOMAN: 'woman',
  OTHER: 'other',
} as const;

export const TEACHER_SORT_OPTIONS = {
  NAME: 'title',
  CITY: 'city',
  COUNTRY: 'country',
  ROLE: 'role',
  TEACHING_SINCE: 'teaching_since',
  DANCING_SINCE: 'dancing_since',
  DATE: 'date',
} as const;

export const ESSENTIAL_TEACHER_META_FIELDS = [
  'first_name',
  'last_name',
  'role',
  'gender',
  'city',
  'country',
  'website',
  'email',
].join(',');

export const ALL_TEACHER_META_FIELDS = [
  'first_name',
  'last_name',
  'role',
  'gender',
  'website',
  'email',
  'facebook_profile',
  'instagram',
  'bio_short',
  'teaching_since',
  'dancing_since',
  'specializations',
].join(',');

// DJ Constants
export const DJ_ACTIVITY_TYPES = {
  ENCUENTROS: 'encuentros',
  FESTIVALS: 'festivals',
  MARATHONS: 'marathons',
  MILONGAS: 'milongas',
  MILONGAS_TRAVEL: 'milongas_travel',
} as const;

export const DJ_SORT_OPTIONS = {
  NAME: 'title',
  CITY: 'tmd_dj_city',
  COUNTRY: 'tmd_dj_country',
  ACTIVITY_ENCUENTROS: 'tmd_dj_activity_encuentros',
  ACTIVITY_FESTIVALS: 'tmd_dj_activity_festivals',
  ACTIVITY_MARATHONS: 'tmd_dj_activity_marathons',
  ACTIVITY_MILONGAS: 'tmd_dj_activity_milongas',
  DATE: 'date',
} as const;

export const ESSENTIAL_DJ_META_FIELDS = [
  'tmd_dj_name',
  'tmd_dj_country',
  'tmd_dj_city',
  'tmd_dj_activity_marathons',
  'tmd_dj_activity_festivals',
  'tmd_dj_activity_encuentros',
  'tmd_dj_activity_milongas',
  'tmd_dj_activity_milongas_travel',
  'tmd_dj_webpage',
].join(',');

export const ALL_DJ_META_FIELDS = [
  'abstract',
  'gender',
  'tmd_dj_about_the_dj',
  'tmd_dj_name',
  'tmd_dj_city',
  'tmd_dj_country',
  'tmd_dj_e_mail',
  'tmd_dj_webpage',
  'tmd_dj_activity_encuentros',
  'tmd_dj_activity_encuentros_since',
  'tmd_dj_activity_festivals',
  'tmd_dj_activity_festivals_since',
  'tmd_dj_activity_marathons',
  'tmd_dj_activity_marathons_since',
  'tmd_dj_activity_milongas',
  'tmd_dj_activity_milongas_since',
  'tmd_dj_activity_milongas_travel',
  'tmd_dj_activity_milongas_travel_since',
  'tmd_dj_link_to_facebook',
  'tmd_dj_link_to_facebook_page',
].join(',');

// Couple Constants
export const COUPLE_SORT_OPTIONS = {
  NAME: 'title',
  CITY: 'city',
  COUNTRY: 'country',
  PARTNERSHIP_STARTED: 'partnership_started',
  PARTNERSHIP_STYLE: 'partnership_style',
  DATE: 'date',
} as const;

export const ESSENTIAL_COUPLE_META_FIELDS = [
  '__relate_leader',
  '__relate_follower',
  'city',
  'country',
  'partnership_started',
  'partnership_style',
  'website',
].join(',');

export const ALL_COUPLE_META_FIELDS = [
  '__relate_leader',
  '__relate_follower',
  'partnership_started',
  'partnership_style',
  'bio_couple',
  'teaching_philosophy',
  'specializations_couple',
  'workshops_offered',
  'achievements',
  'website',
  'facebook_page',
  'started_dancing',
  'couples_to_events_to',
].join(',');

// Event Series Constants
export const EVENT_SERIES_SORT_OPTIONS = {
  NAME: 'title',
  CITY: 'city',
  COUNTRY: 'country',
  START_DATE: 'start_date',
  REGISTRATION_START_DATE: 'registration_start_date',
  DATE: 'date',
} as const;

export const ESSENTIAL_EVENT_SERIES_META_FIELDS = [
  'start_date',
  'registration_start_date',
  'city',
  'country',
  'description',
].join(',');

export const ALL_EVENT_SERIES_META_FIELDS = [
  'start_date',
  'registration_start_date',
  'description',
  'logo',
].join(',');

// Type exports for better TypeScript support
export type EventCategory = (typeof EVENT_CATEGORIES)[keyof typeof EVENT_CATEGORIES];
export type EventFeature = (typeof EVENT_FEATURES)[keyof typeof EVENT_FEATURES];
export type EventSortOption = (typeof EVENT_SORT_OPTIONS)[keyof typeof EVENT_SORT_OPTIONS];
export type SortOrder = (typeof SORT_ORDER)[keyof typeof SORT_ORDER];
export type TeacherRole = (typeof TEACHER_ROLES)[keyof typeof TEACHER_ROLES];
export type TeacherGender = (typeof TEACHER_GENDERS)[keyof typeof TEACHER_GENDERS];
export type TeacherSortOption = (typeof TEACHER_SORT_OPTIONS)[keyof typeof TEACHER_SORT_OPTIONS];
export type DJActivityType = (typeof DJ_ACTIVITY_TYPES)[keyof typeof DJ_ACTIVITY_TYPES];
export type DJSortOption = (typeof DJ_SORT_OPTIONS)[keyof typeof DJ_SORT_OPTIONS];
export type CoupleSortOption = (typeof COUPLE_SORT_OPTIONS)[keyof typeof COUPLE_SORT_OPTIONS];
export type EventSeriesSortOption =
  (typeof EVENT_SERIES_SORT_OPTIONS)[keyof typeof EVENT_SERIES_SORT_OPTIONS];

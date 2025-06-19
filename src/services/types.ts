export interface BaseEntity {
  id: number;
  title: string;
  date: string;
  link: string;
}

export interface TaxonomyTerm {
  id: number;
  name: string;
  slug: string;
  description: string;
}

export interface EventTaxonomies {
  'event-categories-2020'?: TaxonomyTerm[];
}

export interface BaseEvent extends BaseEntity {
  start_date: string;
  end_date: string;
  registration_start_date: string;
  edition: string;
  event_name?: string;
  event_category?: string;
  featured_image?: string;
  city?: string;
  country?: string;
  taxonomies?: EventTaxonomies;
}

export interface EventListItem extends BaseEvent {
  // Only include fields needed for list view
  have_milongas?: boolean;
  have_tickets?: boolean;
  have_food?: boolean;
  have_sleep?: boolean;
  have_registration?: boolean;
  price?: string;
  currency?: string;
  venue_name?: string;
}

export interface EventDetails extends BaseEvent {
  // Include all fields for detail view
  website?: string;
  email?: string;
  facebook_event?: string;
  facebook_page?: string;
  facebook_group?: string;
  price?: string;
  currency?: string;
  event_description?: string;
  /** Full post content (HTML) */
  post_content?: string;
  lat?: number;
  lon?: number;

  /* Venue & location */
  'venue-name'?: string; // API returns with hyphen
  venue_name?: string; // For compatibility
  street?: string;
  venue_features?: string;
  type_of_floor?: string;

  /* Event features - API returns as "0" or "1" strings */
  have_milongas?: string;
  have_tickets?: string;
  have_food?: string;
  have_sleep?: string;
  have_registration?: string;
  have_registration_mode?: string; // "mandatory" | "optional" | etc.
  have_live_music?: string;
  have_lessons?: string;
  have_show?: string;
  have_separated_seating?: string;
  have_folklore?: string;
  have_non_tango?: string;
  have_services?: string;
  have_sales?: string;

  /* Registration & access */
  invitation_only?: string; // "0" = open registration, "1" = invitation only
  role_balanced?: string;

  /* Additional metadata */
  number_of_participants?: string;
  food_options?: string;
  sleeping_options?: string;
  service_options?: string;
  // Embedded related data
  _embedded?: {
    djs?: DJ[];
    teachers?: Teacher[];
    author?: unknown[];
    'wp:featuredmedia'?: unknown[];
    'wp:term'?: unknown[][];
  };
}

export interface DJ extends BaseEntity {
  slug?: string;
  date_gmt?: string;
  modified?: string;
  modified_gmt?: string;
  status?: string;
  content?: {
    rendered: string;
  };
  acf?: {
    bio: string;
    photo: string;
    website: string;
  };
  // Embedded related data
  _embedded?: {
    events?: BaseEvent[];
    author?: unknown[];
  };
  // Meta fields from v3 API
  abstract?: string;
  gender?: string;
  tmd_dj_about_the_dj?: string;
  tmd_dj_activity_encuentros?: string;
  tmd_dj_activity_encuentros_since?: string;
  tmd_dj_activity_festivals?: string;
  tmd_dj_activity_festivals_since?: string;
  tmd_dj_activity_marathons?: string;
  tmd_dj_activity_marathons_since?: string;
  tmd_dj_activity_milongas?: string;
  tmd_dj_activity_milongas_since?: string;
  tmd_dj_activity_milongas_travel?: string;
  tmd_dj_activity_milongas_travel_since?: string;
  tmd_dj_city?: string;
  tmd_dj_country?: string;
  tmd_dj_e_mail?: string;
  tmd_dj_link_to_facebook?: string;
  tmd_dj_link_to_facebook_page?: string;
  tmd_dj_name?: string;
  tmd_dj_webpage?: string;
}

export interface Teacher extends BaseEntity {
  slug?: string;
  date_gmt?: string;
  modified?: string;
  modified_gmt?: string;
  status?: string;
  city?: string;
  country?: string;
  content?: {
    rendered: string;
  };
  // TMD v3 API might have these fields
  acf?: {
    bio?: string;
    photo?: string;
    website?: string;
    teaching_style?: string;
  };
  // TMD v3 API meta fields (when using meta_fields=all)
  all?: string; // Contains all meta fields
  // Embedded related data
  _embedded?: {
    events?: BaseEvent[];
    author?: unknown[];
  };
}

export interface EventSeries extends BaseEntity {
  start_date?: string;
  registration_start_date?: string;
  content?: {
    rendered: string;
  };
  acf?: {
    description: string;
    website: string;
    logo: string;
  };
  // Embedded related data
  _embedded?: {
    events?: BaseEvent[];
    author?: unknown[];
  };
}

export interface EventParams {
  page?: number;
  perPage?: number;
  country?: string;
  start_date_from?: string;
  start_date_to?: string;
  registration_start_date_from?: string;
  registration_start_date_to?: string;
}

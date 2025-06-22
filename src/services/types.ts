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
  content: Content;
  excerpt: Excerpt;
  author: number;
  featured_media: number;
  comment_status: string;
  ping_status: string;
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
  // TMD v3 API meta_box structure (actual API response)
  meta_box?: {
    first_name?: string;
    last_name?: string;
    nickname?: string;
    city?: string;
    country?: string;
    role?: string;
    gender?: string;
    website?: string;
    email?: string;
    facebook_profile?: string;
    instagram?: string;
    bio_short?: string;
    teaching_since?: string;
    dancing_since?: string;
    specializations?: string[];
    teachers_to_events_to?: unknown[];
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
    couples?: Array<{
      id: number;
      title: string;
      slug: string;
      link: string;
    }>;
    author?: unknown[];
  };
}

export interface Couple extends BaseEntity {
  slug?: string;
  date_gmt?: string;
  modified?: string;
  modified_gmt?: string;
  status?: string;
  city?: string;
  country?: string;
  leader_id?: number;
  leader_name?: string;
  follower_id?: number;
  follower_name?: string;
  // TMD v3 API meta fields (when using meta_fields=all)
  all?: string; // Contains all meta fields
  // TMD v3 API meta_box structure (actual API response)
  meta_box?: {
    __relate_leader?: string;
    __relate_follower?: string;
    city?: string;
    country?: string;
    website?: string;
    facebook_page?: string;
    started_dancing?: string;
    partnership_started?: string;
    partnership_style?: string;
    bio_couple?: string;
    teaching_philosophy?: string;
    specializations_couple?: string[];
    workshops_offered?: string;
    achievements?: string;
    couples_to_events_to?: string[];
  };
  // Embedded related data
  _embedded?: {
    events?: BaseEvent[];
    teachers?: Array<{
      id: number;
      title: string;
      slug: string;
      link: string;
      href: string;
      city?: string;
      country?: string;
      role: 'leader' | 'follower' | 'both' | 'double-role';
    }>;
    leader?: Teacher[];
    follower?: Teacher[];
    author?: unknown[];
  };
  // Links to related entities (from API response)
  _links?: {
    self?: Array<{ href: string }>;
    collection?: Array<{ href: string }>;
    author?: Array<{ href: string; embeddable: boolean }>;
    leader?: {
      href: string;
      title: string;
      type: string;
      role: string;
      embeddable: boolean;
    };
    follower?: {
      href: string;
      title: string;
      type: string;
      role: string;
      embeddable: boolean;
    };
    events?: Array<{
      href: string;
      title: string;
      type: string;
      embeddable: boolean;
    }>;
  };
}

export interface EventSeries extends BaseEntity {
  slug?: string;
  modified?: string;
  status?: string;
  start_date?: string;
  registration_start_date?: string;
  city?: string;
  country?: string;
  website?: string;
  content?: {
    rendered: string;
  };
  acf?: {
    description?: string;
    website?: string;
    logo?: string;
  };
  // Embedded related data
  _embedded?: {
    events?: BaseEvent[];
    author?: Array<{
      id: number;
      name: string;
      url?: string;
      description?: string;
      avatar_urls: {
        '24': string;
        '48': string;
        '96': string;
      };
    }>;
    'wp:featuredmedia'?: Array<{
      id: number;
      source_url: string;
      alt_text?: string;
      title?: {
        rendered: string;
      };
    }>;
    'wp:term'?: Array<
      Array<{
        id: number;
        name: string;
        slug: string;
        taxonomy: string;
      }>
    >;
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

// User Interaction Types
export type InteractionType = 'like' | 'bookmark' | 'reminder' | 'follow';

export type ContentType =
  | 'tmd_event'
  | 'tmd_teacher'
  | 'tmd_dj'
  | 'tmd_teacher_couple'
  | 'tmd_event_series';

export interface UserInteraction {
  id: number;
  interaction_type: InteractionType;
  target_post_id: number;
  target_post_type: ContentType;
  interaction_date: string;
  expires_date?: string | undefined;
  reminder_note?: string | undefined;
  private_note?: string | undefined;
  notification_sent: boolean;
}

export interface CreateInteractionRequest {
  interaction_type: InteractionType;
  target_post_id: number;
  target_post_type: ContentType;
  expires_date?: string;
  reminder_note?: string;
  private_note?: string;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface Content {
  rendered: string;
  protected: boolean;
}

export interface Excerpt {
  rendered: string;
  protected: boolean;
}

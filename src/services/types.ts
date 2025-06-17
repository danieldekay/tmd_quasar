export interface BaseEntity {
  id: number;
  title: string;
  date: string;
  link: string;
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
}

export interface EventDetails extends BaseEvent {
  // Include all fields for detail view
  website?: string;
  email?: string;
  facebook_event?: string;
  facebook_page?: string;
  have_milongas?: boolean;
  have_tickets?: boolean;
  have_food?: boolean;
  have_sleep?: boolean;
  food_options?: string;
  sleeping_options?: string;
  have_registration?: boolean;
  have_registration_mode?: string;
  role_balanced?: boolean;
  invitation_only?: boolean;
  price?: string;
  currency?: string;
  number_of_participants?: number;
  music_hours?: string;
  event_description?: string;
  /** Full post content (HTML) */
  post_content?: string;
  lat?: number;
  lon?: number;
  meta_box?: {
    have_live_music?: boolean;
    have_lessons?: boolean;
    have_show?: boolean;
  };
  /* Venue & location */
  venue_name?: string;
  street?: string;
  venue_features?: string;
  type_of_floor?: string;
  /* Social */
  facebook_group?: string;
  /* Additional options */
  have_separated_seating?: boolean;
  have_folklore?: boolean;
  have_non_tango?: boolean;
  have_services?: boolean;
  service_options?: string;
  have_sales?: boolean;
}

export interface DJ extends BaseEntity {
  content: {
    rendered: string;
  };
  acf?: {
    bio: string;
    photo: string;
    website: string;
  };
}

export interface Teacher extends BaseEntity {
  content: {
    rendered: string;
  };
  acf?: {
    bio: string;
    photo: string;
    website: string;
    teaching_style: string;
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

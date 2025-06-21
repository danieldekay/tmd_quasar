import { BaseService } from './baseService';
import type { EventDetails } from './types';

/**
 * Helper function to check if a feature is available
 * V3 API returns features as "0" or "1" strings
 */
const isFeatureAvailable = (value: unknown): boolean => {
  return String(value) === '1';
};

/**
 * Safely convert unknown value to string with proper undefined handling
 */
const safeString = (value: unknown): string => {
  if (typeof value === 'string') return value;
  if (value === null || value === undefined) return '';
  if (typeof value === 'object') return '';
  return String(value);
};

/**
 * Enhanced event details parameters for V3 API
 */
export interface EventDetailsParams {
  // Embedding options
  include_djs?: boolean;
  include_teachers?: boolean;
  include_event_series?: boolean;
  include_orchestras?: boolean;
  include_author?: boolean;
  include_featured_media?: boolean;
  include_taxonomies?: boolean;

  // Meta field selection (default: all)
  meta_fields?: string;

  // Performance options
  minimal?: boolean; // For basic info only
}

/**
 * Enhanced event details with V3 API meta filters support
 */
export interface EventDetailsFilters {
  country?: string;
  city?: string;
  event_category?: string;
  have_milongas?: '0' | '1';
  have_tickets?: '0' | '1';
  have_food?: '0' | '1';
  have_sleep?: '0' | '1';
  have_registration?: '0' | '1';
  invitation_only?: '0' | '1';
  have_live_music?: '0' | '1';
  price_range?: 'free' | 'low' | 'medium' | 'high';
}

/**
 * Event registration status information
 */
export interface EventRegistrationInfo {
  hasRegistration: boolean;
  isInvitationOnly: boolean;
  isOpen: boolean;
  registrationStartDate: string | undefined;
  registrationMode: string | undefined;
  status: 'closed' | 'invitation_only' | 'not_required' | 'open' | 'unknown';
}

/**
 * Event feature analysis result
 */
export interface EventFeatureAnalysis {
  // Accommodation features
  has_milongas: boolean;
  has_food: boolean;
  has_sleep: boolean;

  // Event features
  has_tickets: boolean;
  has_registration: boolean;
  has_live_music: boolean;
  has_lessons: boolean;
  has_show: boolean;
  has_separated_seating: boolean;
  has_folklore: boolean;
  has_non_tango: boolean;
  has_services: boolean;
  has_sales: boolean;

  // Access and rules
  is_invitation_only: boolean;
  is_role_balanced: boolean;

  // Computed properties
  is_marathon: boolean;
  is_festival: boolean;
  is_encuentro: boolean;
  accommodation_score: number; // 0-3 based on food, sleep, services
  feature_count: number;
}

class EventDetailsService extends BaseService<EventDetails> {
  constructor() {
    super('/events', {
      meta_fields: 'all', // Get all meta fields for detailed view
      include_taxonomies: true,
      _embed: true, // Enable embeds for detailed view
    });
  }

  /**
   * Get a single event with comprehensive details and embedded relationships
   */
  async getEvent(id: number, params: EventDetailsParams = {}): Promise<EventDetails> {
    const requestParams: Record<string, unknown> = {
      meta_fields: params.meta_fields || 'all',
      include_taxonomies: params.include_taxonomies !== false,
      _embed: true, // Always embed for details
    };

    // Enhanced embedding control with proper undefined handling
    if (params.include_djs !== false) {
      requestParams._embed = true;
    }
    if (params.include_teachers !== false) {
      requestParams._embed = true;
    }
    if (params.include_event_series !== false) {
      requestParams._embed = true;
    }
    if (params.include_orchestras !== false) {
      requestParams._embed = true;
    }
    if (params.include_author !== false) {
      requestParams._embed = true;
    }
    if (params.include_featured_media !== false) {
      requestParams._embed = true;
    }

    // Minimal mode for performance
    if (params.minimal) {
      requestParams.meta_fields =
        'start_date,end_date,city,country,have_registration,invitation_only';
      requestParams._embed = false;
    }

    const event = await this.getById(id, requestParams);
    return event;
  }

  /**
   * Get multiple events with full details (for batch operations)
   */
  async getEventDetails(ids: number[], params: EventDetailsParams = {}): Promise<EventDetails[]> {
    const requestParams: Record<string, unknown> = {
      meta_fields: params.meta_fields || 'all',
      include_taxonomies: params.include_taxonomies !== false,
      _embed: !params.minimal,
      include: ids.join(','),
      per_page: Math.min(ids.length, 100), // API limit
    };

    const response = await this.getAll(requestParams);
    return response.data;
  }

  /**
   * Search events by content and get full details
   */
  async searchEventDetails(
    query: string,
    params: EventDetailsParams = {},
  ): Promise<EventDetails[]> {
    const requestParams: Record<string, unknown> = {
      search: query,
      meta_fields: params.meta_fields || 'all',
      include_taxonomies: params.include_taxonomies !== false,
      _embed: !params.minimal,
      per_page: 20, // Reasonable default for search
    };

    const response = await this.getAll(requestParams);
    return response.data;
  }

  /**
   * Check if an event has a specific feature
   * V3 API returns features as "0" or "1" strings
   */
  hasFeature(event: EventDetails, featureKey: string): boolean {
    const value = (event as unknown as Record<string, unknown>)[featureKey];
    return isFeatureAvailable(value);
  }

  /**
   * Get comprehensive event features analysis
   */
  getEventFeatures(event: EventDetails): EventFeatureAnalysis {
    const features = {
      // Accommodation features
      has_milongas: this.hasFeature(event, 'have_milongas'),
      has_food: this.hasFeature(event, 'have_food'),
      has_sleep: this.hasFeature(event, 'have_sleep'),

      // Event features
      has_tickets: this.hasFeature(event, 'have_tickets'),
      has_registration: this.hasFeature(event, 'have_registration'),
      has_live_music: this.hasFeature(event, 'have_live_music'),
      has_lessons: this.hasFeature(event, 'have_lessons'),
      has_show: this.hasFeature(event, 'have_show'),
      has_separated_seating: this.hasFeature(event, 'have_separated_seating'),
      has_folklore: this.hasFeature(event, 'have_folklore'),
      has_non_tango: this.hasFeature(event, 'have_non_tango'),
      has_services: this.hasFeature(event, 'have_services'),
      has_sales: this.hasFeature(event, 'have_sales'),

      // Access and rules
      is_invitation_only: this.hasFeature(event, 'invitation_only'),
      is_role_balanced: this.hasFeature(event, 'role_balanced'),

      // Computed properties with proper undefined handling
      is_marathon: (event.event_category || '').toLowerCase().includes('marathon'),
      is_festival: (event.event_category || '').toLowerCase().includes('festival'),
      is_encuentro: (event.event_category || '').toLowerCase().includes('encuentro'),
      accommodation_score: 0,
      feature_count: 0,
    };

    // Calculate accommodation score
    features.accommodation_score =
      (features.has_food ? 1 : 0) + (features.has_sleep ? 1 : 0) + (features.has_services ? 1 : 0);

    // Calculate total feature count
    features.feature_count = Object.values(features).filter((value) => value === true).length;

    return features;
  }

  /**
   * Get comprehensive registration information for an event
   */
  getRegistrationInfo(event: EventDetails): EventRegistrationInfo {
    const features = this.getEventFeatures(event);

    const regInfo: EventRegistrationInfo = {
      hasRegistration: features.has_registration,
      isInvitationOnly: features.is_invitation_only,
      registrationStartDate: event.registration_start_date || undefined,
      registrationMode: event.have_registration_mode || undefined,
      isOpen: false,
      status: 'unknown',
    };

    // Determine registration status
    if (!regInfo.hasRegistration) {
      regInfo.status = 'not_required';
      regInfo.isOpen = false;
    } else if (regInfo.isInvitationOnly) {
      regInfo.status = 'invitation_only';
      regInfo.isOpen = false;
    } else {
      // Check if registration is open based on dates
      if (regInfo.registrationStartDate) {
        const regStartDate = new Date(regInfo.registrationStartDate);
        const today = new Date();
        regInfo.isOpen = regStartDate <= today;
        regInfo.status = regInfo.isOpen ? 'open' : 'closed';
      } else {
        // No registration start date, assume open if registration is available
        regInfo.isOpen = true;
        regInfo.status = 'open';
      }
    }

    return regInfo;
  }

  /**
   * Get embedded DJs from event with proper undefined handling
   */
  getEventDJs(event: EventDetails) {
    return event._embedded?.djs || [];
  }

  /**
   * Get embedded teachers from event with proper undefined handling
   */
  getEventTeachers(event: EventDetails) {
    return event._embedded?.teachers || [];
  }

  /**
   * Get embedded orchestras from event with proper undefined handling
   */
  getEventOrchestras(event: EventDetails) {
    // Check if orchestras are embedded (V3 API may support this)
    const embedded = event._embedded as Record<string, unknown> | undefined;
    return (embedded?.orchestras as unknown[]) || [];
  }

  /**
   * Check if event is happening soon (within specified days)
   */
  isEventSoon(event: EventDetails, daysAhead = 30): boolean {
    const startDate = event.start_date;
    if (!startDate) return false;

    const eventDate = new Date(startDate);
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + daysAhead);

    return eventDate >= today && eventDate <= futureDate;
  }

  /**
   * Check if event registration is currently open
   */
  isRegistrationOpen(event: EventDetails): boolean {
    const regInfo = this.getRegistrationInfo(event);
    return regInfo.isOpen;
  }

  /**
   * Check if event is happening today
   */
  isEventToday(event: EventDetails): boolean {
    const startDate = event.start_date;
    const endDate = event.end_date;

    if (!startDate) return false;

    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const eventStart = startDate.split('T')[0];

    if (!todayStr || !eventStart) return false;

    if (endDate) {
      const eventEnd = endDate.split('T')[0];
      if (!eventEnd) return todayStr === eventStart;
      return todayStr >= eventStart && todayStr <= eventEnd;
    }

    return todayStr === eventStart;
  }

  /**
   * Get event duration in days
   */
  getEventDuration(event: EventDetails): number {
    const startDate = event.start_date;
    const endDate = event.end_date;

    if (!startDate || !endDate) return 1; // Default to 1 day

    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return Math.max(1, diffDays); // At least 1 day
  }

  /**
   * Get price information with proper undefined handling
   */
  getPriceInfo(event: EventDetails) {
    const price = safeString(event.price);
    const currency = safeString(event.currency);

    return {
      price: price || 'TBD',
      currency: currency || 'EUR',
      isFree: price === '0' || price.toLowerCase().includes('free'),
      hasPricing: price !== '' && price !== 'TBD',
      displayPrice: price && currency ? `${price} ${currency}` : price || 'TBD',
    };
  }

  /**
   * Get location information with proper undefined handling
   */
  getLocationInfo(event: EventDetails) {
    const city = safeString(event.city);
    const country = safeString(event.country);
    const venueName = safeString(event.venue_name || event['venue-name']);
    const street = safeString(event.street);

    return {
      city: city || 'TBD',
      country: country || 'TBD',
      venueName: venueName || 'TBD',
      street: street || '',
      hasCoordinates: !!(event.lat && event.lon),
      coordinates: event.lat && event.lon ? { lat: event.lat, lon: event.lon } : null,
      displayLocation: [venueName, city, country].filter(Boolean).join(', ') || 'TBD',
    };
  }

  /**
   * Get event contact information
   */
  getContactInfo(event: EventDetails) {
    return {
      website: safeString(event.website),
      email: safeString(event.email),
      facebookEvent: safeString(event.facebook_event),
      facebookPage: safeString(event.facebook_page),
      facebookGroup: safeString(event.facebook_group),
      hasContact: !!(event.website || event.email || event.facebook_event),
    };
  }

  /**
   * Get comprehensive event summary for display
   */
  getEventSummary(event: EventDetails) {
    const features = this.getEventFeatures(event);
    const registration = this.getRegistrationInfo(event);
    const price = this.getPriceInfo(event);
    const location = this.getLocationInfo(event);
    const contact = this.getContactInfo(event);

    return {
      id: event.id,
      title: safeString(event.title),
      eventName: safeString(event.event_name),
      edition: safeString(event.edition),

      // Dates
      startDate: event.start_date || '',
      endDate: event.end_date || '',
      duration: this.getEventDuration(event),
      isToday: this.isEventToday(event),
      isSoon: this.isEventSoon(event),

      // Features
      features,

      // Registration
      registration,

      // Pricing
      price,

      // Location
      location,

      // Contact
      contact,

      // Relationships
      djCount: this.getEventDJs(event).length,
      teacherCount: this.getEventTeachers(event).length,
      orchestraCount: this.getEventOrchestras(event).length,
    };
  }
}

// Export singleton instance
export const eventDetailsService = new EventDetailsService();

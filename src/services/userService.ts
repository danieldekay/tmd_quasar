import { BaseService, type BaseParams } from './baseService';
import type { User } from '../stores/authStore';
import type { AxiosRequestConfig } from 'axios';

// User interface for v3 API
export interface UserProfile extends User {
  // WordPress standard fields
  id: number;
  name: string;
  display_name: string;
  username: string;
  email: string;
  url?: string;
  description?: string;
  slug?: string;
  date_gmt?: string;
  modified?: string;
  modified_gmt?: string;
  status?: string;
  registered_date: string;
  content?: {
    rendered: string;
  };

  // User roles and capabilities
  roles: string[];
  capabilities: Record<string, boolean>;

  // Content counts
  content_counts: {
    event: {
      published: number;
      draft: number;
      private: number;
    };
    teacher: {
      published: number;
      draft: number;
      private: number;
    };
    dj: {
      published: number;
      draft: number;
      private: number;
    };
    event_series: {
      published: number;
      draft: number;
      private: number;
    };
  };

  // User meta fields
  meta: {
    first_name?: string;
    last_name?: string;
    nickname?: string;
    city?: string;
    country?: string;
    website?: string;
    facebook_profile?: string;
    instagram?: string;
    bio_short?: string;
    phone?: string;
    timezone?: string;
    locale?: string;
    show_admin_bar_front?: string;
    use_ssl?: string;
  };

  // TMD v3 API meta_box structure (legacy)
  meta_box?: {
    first_name?: string;
    last_name?: string;
    nickname?: string;
    city?: string;
    country?: string;
    website?: string;
    email?: string;
    facebook_profile?: string;
    instagram?: string;
    bio_short?: string;
    user_registered?: string;
    user_login?: string;
    user_nicename?: string;
    display_name?: string;
    user_url?: string;
    description?: string;
    // User capabilities and roles
    capabilities?: Record<string, boolean>;
    allcaps?: Record<string, boolean>;
    user_level?: number;
    // Additional user metadata
    phone?: string;
    timezone?: string;
    locale?: string;
    // User preferences
    show_admin_bar_front?: string;
    use_ssl?: string;
    // User events (if any)
    events_created?: number[];
    events_attending?: number[];
    // Computed fields added during transformation
    full_name?: string;
    user_level_description?: string;
    registration_date_formatted?: string;
  };

  // Embedded related data
  _embedded?: {
    'wordpress-profile'?: Array<{
      id: number;
      name: string;
      url?: string;
      description?: string;
      link: string;
      slug: string;
      avatar_urls: Record<string, string>;
      meta_box?: unknown[];
      _links?: unknown;
    }>;
    'authored:events'?: Array<{
      _embedded: {
        events: Array<{
          id: number;
          title: string;
          slug: string;
          date: string;
          date_gmt: string;
          modified: string;
          modified_gmt: string;
          status: string;
          link: string;
          start_date?: string;
          end_date?: string;
          registration_start_date?: string;
          edition?: string;
          country?: string;
          city?: string;
          _links?: unknown;
        }>;
      };
      _links: unknown;
      page: number;
      per_page: number;
      count: number;
      total: number;
    }>;
    'authored:teachers'?: Array<{
      _embedded: {
        teachers: Array<{
          id: number;
          title: string;
          slug: string;
          date: string;
          date_gmt: string;
          modified: string;
          modified_gmt: string;
          status: string;
          link: string;
          city?: string;
          country?: string;
          _links?: unknown;
        }>;
      };
      _links: unknown;
      page: number;
      per_page: number;
      count: number;
      total: number;
    }>;
    'authored:djs'?: Array<{
      _embedded: {
        djs: Array<{
          id: number;
          title: string;
          slug: string;
          date: string;
          date_gmt: string;
          modified: string;
          modified_gmt: string;
          status: string;
          link: string;
          city?: string;
          country?: string;
          _links?: unknown;
        }>;
      };
      _links: unknown;
      page: number;
      per_page: number;
      count: number;
      total: number;
    }>;
    'authored:event-series'?: Array<{
      _embedded: {
        'event-series': Array<{
          id: number;
          title: string;
          slug: string;
          date: string;
          date_gmt: string;
          modified: string;
          modified_gmt: string;
          status: string;
          link: string;
          city?: string;
          country?: string;
          _links?: unknown;
        }>;
      };
      _links: unknown;
      page: number;
      per_page: number;
      count: number;
      total: number;
    }>;
  };

  // Links to related entities
  _links?: {
    self?: Array<{ href: string }>;
    collection?: Array<{ href: string }>;
    author?: Array<{ href: string; embeddable: boolean }>;
  };
}

export interface UserParams extends BaseParams {
  // User-specific filtering
  role?: string;
  country?: string;
  city?: string;
  registered_since?: string;
  orderby?: UserSortOption;
  order?: 'asc' | 'desc';
  meta_filters?: string;
  include_events?: boolean;
  essential_only?: boolean;
  _embed?: boolean;
}

// User sort options
export const USER_SORT_OPTIONS = {
  NAME: 'title',
  CITY: 'city',
  COUNTRY: 'country',
  REGISTERED_DATE: 'registered_date',
  DATE: 'date',
} as const;

export type UserSortOption = (typeof USER_SORT_OPTIONS)[keyof typeof USER_SORT_OPTIONS];

// User meta fields for v3 API
export const ESSENTIAL_USER_META_FIELDS = [
  'first_name',
  'last_name',
  'nickname',
  'city',
  'country',
  'website',
  'email',
  'user_registered',
  'user_login',
  'display_name',
].join(',');

export const ALL_USER_META_FIELDS = [
  'first_name',
  'last_name',
  'nickname',
  'city',
  'country',
  'website',
  'email',
  'facebook_profile',
  'instagram',
  'bio_short',
  'user_registered',
  'user_login',
  'user_nicename',
  'display_name',
  'user_url',
  'description',
  'capabilities',
  'allcaps',
  'user_level',
  'phone',
  'timezone',
  'locale',
  'show_admin_bar_front',
  'use_ssl',
  'events_created',
  'events_attending',
].join(',');

export class UserService extends BaseService<UserProfile> {
  private readonly defaultMetaFields: string;

  constructor() {
    super('/me', {
      _embed: false, // Disable embeds for better performance by default
      meta_fields: ESSENTIAL_USER_META_FIELDS, // Use essential fields only by default
    });
    this.defaultMetaFields = ESSENTIAL_USER_META_FIELDS;
  }

  /**
   * Get current user profile using the /me endpoint
   * Token is automatically added by axios interceptor
   */
  async getCurrentUserProfile(params?: UserParams, signal?: AbortSignal): Promise<UserProfile>;
  async getCurrentUserProfile(
    token: string,
    params?: UserParams,
    signal?: AbortSignal,
  ): Promise<UserProfile>;
  async getCurrentUserProfile(
    paramsOrToken: UserParams | string = {},
    paramsOrSignal?: UserParams | AbortSignal,
    signalOrUndefined?: AbortSignal,
  ): Promise<UserProfile> {
    try {
      // Handle overloaded parameters
      let params: UserParams;
      let signal: AbortSignal | undefined;
      let customHeaders: Record<string, string> | undefined;

      if (typeof paramsOrToken === 'string') {
        // Legacy call with explicit token
        const token = paramsOrToken;
        params = (paramsOrSignal as UserParams) || {};
        signal = signalOrUndefined;
        customHeaders = { Authorization: `Bearer ${token}` };
      } else {
        // New call without token (uses axios interceptor)
        params = paramsOrToken;
        signal = paramsOrSignal as AbortSignal;
        customHeaders = undefined;
      }

      // Build V3 API parameters with advanced filtering
      const apiParams = this.buildUserApiParams(params);

      // Use the /me endpoint for current user profile
      const response = await this.makeRequest(
        'me',
        apiParams,
        signal,
        customHeaders ? { headers: customHeaders } : undefined,
      );

      // Transform and enhance the data
      const userProfile = this.transformUser(response.data as UserProfile);

      return userProfile;
    } catch (error) {
      console.error('getCurrentUserProfile: Error details:', error);
      throw new Error(
        `Failed to fetch user profile: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Get user profile by ID (public data)
   */
  async getUserProfile(
    id: number,
    params: UserParams = {},
    signal?: AbortSignal,
  ): Promise<UserProfile> {
    try {
      const apiParams = {
        _embed: params.include_events ? true : false,
        meta_fields: params.essential_only ? ESSENTIAL_USER_META_FIELDS : ALL_USER_META_FIELDS,
        ...params,
      };

      const user = await this.getById(id, apiParams, signal);
      return this.transformUser(user);
    } catch (error) {
      throw new Error(
        `Failed to fetch user profile ${id}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Search users by name or other criteria with V3 API optimization
   */
  async searchUsers(
    query: string,
    params: UserParams = {},
    signal?: AbortSignal,
  ): Promise<UserProfile[]> {
    try {
      const searchParams = {
        search: query,
        meta_fields: ALL_USER_META_FIELDS, // Include all fields for search results
        _embed: params.include_events ? true : false,
        ...params,
      };

      const response = await this.search(query, searchParams, signal);
      return this.transformUsers(response.data);
    } catch (error) {
      throw new Error(
        `Failed to search users: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Get users filtered by role
   */
  async getUsersByRole(
    role: string,
    params: UserParams = {},
    signal?: AbortSignal,
  ): Promise<UserProfile[]> {
    const metaFilters = { role };
    return this.getUsers({ ...params, meta_filters: JSON.stringify(metaFilters) }, signal);
  }

  /**
   * Get users by country with optimized meta filtering
   */
  async getUsersByCountry(
    country: string,
    params: UserParams = {},
    signal?: AbortSignal,
  ): Promise<UserProfile[]> {
    const metaFilters = { country };
    return this.getUsers({ ...params, meta_filters: JSON.stringify(metaFilters) }, signal);
  }

  /**
   * Get users by city with optimized meta filtering
   */
  async getUsersByCity(
    city: string,
    params: UserParams = {},
    signal?: AbortSignal,
  ): Promise<UserProfile[]> {
    const metaFilters = { city };
    return this.getUsers({ ...params, meta_filters: JSON.stringify(metaFilters) }, signal);
  }

  /**
   * Get users registered since a specific date
   */
  async getUsersRegisteredSince(
    date: string,
    params: UserParams = {},
    signal?: AbortSignal,
  ): Promise<UserProfile[]> {
    const metaFilters = { user_registered: date };
    return this.getUsers({ ...params, meta_filters: JSON.stringify(metaFilters) }, signal);
  }

  /**
   * Get all users (for admin purposes)
   */
  async getUsers(params: UserParams = {}, signal?: AbortSignal): Promise<UserProfile[]> {
    try {
      // Build V3 API parameters with advanced filtering
      const apiParams = this.buildUserApiParams(params);

      // Get response using BaseService
      const response = await this.getAll(apiParams, signal);

      // Transform and enhance the data
      const users = this.transformUsers(response.data);

      return users;
    } catch (error) {
      throw new Error(
        `Failed to fetch users: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Build optimized API parameters for user requests
   */
  private buildUserApiParams(params: UserParams): Record<string, unknown> {
    const apiParams: Record<string, unknown> = {
      // Default settings
      meta_fields: params.essential_only ? ESSENTIAL_USER_META_FIELDS : ALL_USER_META_FIELDS,
    };

    // Handle _embed parameter - ensure it's a boolean
    if (params.include_events || params._embed) {
      apiParams._embed = true;
    }

    // Add meta filters if provided
    if (params.meta_filters) {
      try {
        const filters = JSON.parse(params.meta_filters);
        Object.assign(apiParams, filters);
      } catch {
        console.warn('Invalid meta_filters JSON:', params.meta_filters);
      }
    }

    // Add sorting parameters
    if (params.orderby) {
      apiParams.orderby = params.orderby;
    }
    if (params.order) {
      apiParams.order = params.order;
    }

    // Add pagination parameters
    if (params.page) {
      apiParams.page = params.page;
    }
    if (params.per_page) {
      apiParams.per_page = params.per_page;
    }

    // Add search parameter
    if (params.search) {
      apiParams.search = params.search;
    }

    return apiParams;
  }

  /**
   * Transform user data to ensure consistency and add computed fields
   */
  private transformUsers(users: UserProfile[]): UserProfile[] {
    return users.map((user) => this.transformUser(user));
  }

  /**
   * Transform a single user to ensure consistency and add computed fields
   */
  private transformUser(user: UserProfile): UserProfile {
    // Ensure we have basic user data
    const transformedUser: UserProfile = {
      ...user,
      // Ensure required fields have fallbacks - handle both API response structures
      name:
        user.name ||
        user.display_name ||
        user.username ||
        user.meta_box?.display_name ||
        user.meta_box?.nickname ||
        'Unknown User',
      email: user.email || user.meta_box?.email || '',
      roles: user.roles || [],
      avatar_urls: user.avatar_urls || {},
      url: user.url || user.meta_box?.website || user.meta_box?.user_url || '',
      description: user.description || user.meta_box?.bio_short || '',
      link: user.link || '',
      slug: user.slug || user.meta_box?.user_nicename || '',
    };

    // Add computed fields
    if (transformedUser.meta_box) {
      // Full name from first and last name
      if (transformedUser.meta_box.first_name || transformedUser.meta_box.last_name) {
        const firstName = transformedUser.meta_box.first_name || '';
        const lastName = transformedUser.meta_box.last_name || '';
        transformedUser.meta_box.full_name = `${firstName} ${lastName}`.trim();
      }

      // User level description
      if (transformedUser.meta_box.user_level !== undefined) {
        transformedUser.meta_box.user_level_description = this.getUserLevelDescription(
          transformedUser.meta_box.user_level,
        );
      }

      // Registration date formatting
      if (transformedUser.meta_box.user_registered) {
        try {
          const date = new Date(transformedUser.meta_box.user_registered);
          transformedUser.meta_box.registration_date_formatted = date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          });
        } catch {
          transformedUser.meta_box.registration_date_formatted =
            transformedUser.meta_box.user_registered;
        }
      }
    }

    return transformedUser;
  }

  /**
   * Get user-friendly description for user level
   */
  private getUserLevelDescription(level: number): string {
    switch (level) {
      case 0:
        return 'Subscriber';
      case 1:
        return 'Contributor';
      case 2:
        return 'Author';
      case 3:
        return 'Editor';
      case 4:
        return 'Administrator';
      case 5:
        return 'Super Administrator';
      default:
        return 'Unknown Level';
    }
  }

  /**
   * Analyze user data for statistics and insights
   */
  analyzeUserData(users: UserProfile[]): {
    totalCount: number;
    byCountry: Record<string, number>;
    byCity: Record<string, number>;
    byRole: Record<string, number>;
    withWebsite: number;
    withEmail: number;
    withSocialMedia: number;
    recentlyRegistered: number;
  } {
    const stats = {
      totalCount: users.length,
      byCountry: {} as Record<string, number>,
      byCity: {} as Record<string, number>,
      byRole: {} as Record<string, number>,
      withWebsite: 0,
      withEmail: 0,
      withSocialMedia: 0,
      recentlyRegistered: 0,
    };

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    users.forEach((user) => {
      // Country stats
      const country = user.meta_box?.country || 'Unknown';
      stats.byCountry[country] = (stats.byCountry[country] || 0) + 1;

      // City stats
      const city = user.meta_box?.city || 'Unknown';
      stats.byCity[city] = (stats.byCity[city] || 0) + 1;

      // Role stats
      user.roles.forEach((role) => {
        stats.byRole[role] = (stats.byRole[role] || 0) + 1;
      });

      // Feature stats
      if (user.meta_box?.website) stats.withWebsite++;
      if (user.meta_box?.email) stats.withEmail++;
      if (user.meta_box?.facebook_profile || user.meta_box?.instagram) stats.withSocialMedia++;

      // Recent registrations
      if (user.meta_box?.user_registered) {
        try {
          const registrationDate = new Date(user.meta_box.user_registered);
          if (registrationDate > thirtyDaysAgo) {
            stats.recentlyRegistered++;
          }
        } catch {
          // Ignore invalid dates
        }
      }
    });

    return stats;
  }

  /**
   * Get user statistics
   */
  async getUserStats(signal?: AbortSignal): Promise<ReturnType<typeof this.analyzeUserData>> {
    try {
      const users = await this.getUsers({ essential_only: true }, signal);
      return this.analyzeUserData(users);
    } catch (error) {
      throw new Error(
        `Failed to get user stats: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Override makeRequest to support custom headers for authenticated requests
   */
  protected override async makeRequest<R = UserProfile | UserProfile[]>(
    path: string,
    params: BaseParams = {},
    signal?: AbortSignal,
    customConfig?: { headers?: Record<string, string> },
  ): Promise<{ data: R; headers: Record<string, string> }> {
    const { api } = await import('../boot/axios');
    const { useApiStatus } = await import('../composables/useApiStatus');
    const apiStatus = useApiStatus();

    return apiStatus.withApiErrorHandling(
      async () => {
        const requestConfig: AxiosRequestConfig = {
          params: {
            ...this.defaultOptions,
            ...this.normalizePaginationParams(params),
            ...params,
          },
          ...customConfig,
        };

        if (signal) {
          requestConfig.signal = signal;
        }

        const response = await api.get(path, requestConfig);
        return {
          data: response.data as R,
          headers: response.headers as Record<string, string>,
        };
      },
      { retries: 1 },
    );
  }
}

export const userService = new UserService();

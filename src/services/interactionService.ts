import { api } from 'boot/axios';
import type { InteractionType, ContentType } from './types';

export interface InteractionServiceResponse {
  id: number;
  interaction_type: InteractionType;
  target_post_id: number | string; // API returns string, but we convert to number
  target_post_type: ContentType;
  interaction_date: string;
  expires_date?: string;
  reminder_note?: string;
  private_note?: string;
  notification_sent: boolean;
  _links?: {
    self: Array<{ href: string }>;
    target: Array<{ href: string }>;
  };
}

export interface CreateInteractionData {
  interaction_type: InteractionType;
  target_post_id: number;
  target_post_type: ContentType;
  expires_date?: string | undefined;
  reminder_note?: string | undefined;
  private_note?: string | undefined;
}

export interface InteractionListResponse {
  _embedded: {
    'user-interactions': InteractionServiceResponse[];
  };
  _links: {
    self: Array<{ href: string }>;
    next?: Array<{ href: string }>;
    last?: Array<{ href: string }>;
  };
  page: number;
  per_page: number;
  count: number;
  total: number;
}

class InteractionService {
  private readonly baseUrl = '/user-interactions';

  /**
   * Get all user interactions with optional filtering
   */
  async getUserInteractions(params?: {
    interaction_type?: InteractionType;
    target_post_type?: ContentType;
    target_post_id?: number;
    page?: number;
    per_page?: number;
    _embed?: boolean;
    meta_fields?: string;
  }): Promise<InteractionListResponse> {
    try {
      // Always include essential meta fields for interactions
      const requestParams = {
        ...params,
        meta_fields:
          params?.meta_fields ||
          'interaction_type,target_post_id,target_post_type,expires_date,reminder_note,private_note,notification_sent',
      };

      const response = await api.get<InteractionListResponse>(this.baseUrl, {
        params: requestParams,
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch user interactions:', error);
      throw error;
    }
  }

  /**
   * Get interactions for a specific content item
   */
  async getContentInteractions(
    targetPostId: number,
    targetPostType: ContentType,
  ): Promise<InteractionServiceResponse[]> {
    try {
      const response = await this.getUserInteractions({
        target_post_id: targetPostId,
        target_post_type: targetPostType,
      });
      return response._embedded?.['user-interactions'] || [];
    } catch (error) {
      console.error(`Failed to fetch interactions for ${targetPostType}:${targetPostId}:`, error);
      throw error;
    }
  }

  /**
   * Create a new interaction
   */
  async createInteraction(data: CreateInteractionData): Promise<InteractionServiceResponse> {
    try {
      const response = await api.post<InteractionServiceResponse>(this.baseUrl, data);
      return response.data;
    } catch (error) {
      console.error('Failed to create interaction:', error);
      throw error;
    }
  }

  /**
   * Update an existing interaction
   */
  async updateInteraction(
    id: number,
    data: Partial<CreateInteractionData>,
  ): Promise<InteractionServiceResponse> {
    try {
      const response = await api.put<InteractionServiceResponse>(`${this.baseUrl}/${id}`, data);
      return response.data;
    } catch (error) {
      console.error(`Failed to update interaction ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete an interaction
   */
  async deleteInteraction(id: number): Promise<void> {
    try {
      await api.delete(`${this.baseUrl}/${id}`);
    } catch (error) {
      console.error(`Failed to delete interaction ${id}:`, error);
      throw error;
    }
  }

  /**
   * Toggle an interaction (create if doesn't exist, delete if exists)
   */
  async toggleInteraction(
    interactionType: InteractionType,
    targetPostId: number,
    targetPostType: ContentType,
    additionalData?: {
      expires_date?: string;
      reminder_note?: string;
      private_note?: string;
    },
  ): Promise<{ action: 'created' | 'deleted'; interaction?: InteractionServiceResponse }> {
    try {
      // First, check if interaction already exists
      const existingInteractions = await this.getContentInteractions(targetPostId, targetPostType);
      const existingInteraction = existingInteractions.find(
        (interaction) => interaction.interaction_type === interactionType,
      );

      if (existingInteraction) {
        // Delete existing interaction
        await this.deleteInteraction(existingInteraction.id);
        return { action: 'deleted' };
      } else {
        // Create new interaction
        const newInteraction = await this.createInteraction({
          interaction_type: interactionType,
          target_post_id: targetPostId,
          target_post_type: targetPostType,
          ...additionalData,
        });
        return { action: 'created', interaction: newInteraction };
      }
    } catch (error) {
      console.error(
        `Failed to toggle ${interactionType} for ${targetPostType}:${targetPostId}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Bulk create interactions
   */
  async createBulkInteractions(
    interactions: CreateInteractionData[],
  ): Promise<InteractionServiceResponse[]> {
    try {
      const response = await api.post<{ interactions: InteractionServiceResponse[] }>(
        `${this.baseUrl}/bulk`,
        { interactions },
      );
      return response.data.interactions;
    } catch (error) {
      console.error('Failed to create bulk interactions:', error);
      throw error;
    }
  }

  /**
   * Bulk delete interactions
   */
  async deleteBulkInteractions(ids: number[]): Promise<void> {
    try {
      await api.delete(`${this.baseUrl}/bulk`, { data: { ids } });
    } catch (error) {
      console.error('Failed to delete bulk interactions:', error);
      throw error;
    }
  }

  /**
   * Get user's favorites (bookmarks)
   */
  async getUserBookmarks(params?: {
    target_post_type?: ContentType;
    page?: number;
    per_page?: number;
    _embed?: boolean;
    meta_fields?: string;
  }): Promise<InteractionListResponse> {
    return this.getUserInteractions({
      ...params,
      interaction_type: 'bookmark',
    });
  }

  /**
   * Get user's likes
   */
  async getUserLikes(params?: {
    target_post_type?: ContentType;
    page?: number;
    per_page?: number;
    _embed?: boolean;
    meta_fields?: string;
  }): Promise<InteractionListResponse> {
    return this.getUserInteractions({
      ...params,
      interaction_type: 'like',
    });
  }

  /**
   * Get user's reminders
   */
  async getUserReminders(params?: {
    target_post_type?: ContentType;
    page?: number;
    per_page?: number;
    _embed?: boolean;
    meta_fields?: string;
  }): Promise<InteractionListResponse> {
    return this.getUserInteractions({
      ...params,
      interaction_type: 'reminder',
    });
  }

  /**
   * Get user's follows
   */
  async getUserFollows(params?: {
    target_post_type?: ContentType;
    page?: number;
    per_page?: number;
    _embed?: boolean;
    meta_fields?: string;
  }): Promise<InteractionListResponse> {
    return this.getUserInteractions({
      ...params,
      interaction_type: 'follow',
    });
  }
}

export const interactionService = new InteractionService();
export default interactionService;

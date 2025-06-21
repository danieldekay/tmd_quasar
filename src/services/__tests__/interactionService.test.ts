import { describe, it, expect, vi, beforeEach } from 'vitest';
import { interactionService } from '../interactionService';

// Mock the axios instance
const mockApi = {
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
};

vi.mock('boot/axios', () => ({
  api: mockApi,
}));

describe('InteractionService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getUserInteractions', () => {
    it('should fetch user interactions successfully', async () => {
      const mockResponse = {
        data: {
          _embedded: {
            'user-interactions': [
              {
                id: 1,
                interaction_type: 'like',
                target_post_id: 12345,
                target_post_type: 'tmd_event',
                interaction_date: '2024-01-15T10:30:00+00:00',
                notification_sent: false,
              },
            ],
          },
          _links: {
            self: [{ href: '/wp-json/tmd/v3/user-interactions' }],
          },
          page: 1,
          per_page: 10,
          count: 1,
          total: 1,
        },
      };

      mockApi.get.mockResolvedValue(mockResponse);

      const result = await interactionService.getUserInteractions();

      expect(mockApi.get).toHaveBeenCalledWith('/tmd/v3/user-interactions', { params: undefined });
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle API errors gracefully', async () => {
      const error = new Error('Network error');
      mockApi.get.mockRejectedValue(error);

      await expect(interactionService.getUserInteractions()).rejects.toThrow('Network error');
    });

    it('should pass query parameters correctly', async () => {
      const params = {
        interaction_type: 'bookmark' as const,
        target_post_type: 'tmd_event' as const,
        page: 2,
        per_page: 20,
      };

      mockApi.get.mockResolvedValue({ data: { _embedded: { 'user-interactions': [] } } });

      await interactionService.getUserInteractions(params);

      expect(mockApi.get).toHaveBeenCalledWith('/tmd/v3/user-interactions', { params });
    });
  });

  describe('getContentInteractions', () => {
    it('should fetch interactions for specific content', async () => {
      const mockInteractions = [
        {
          id: 1,
          interaction_type: 'like',
          target_post_id: 12345,
          target_post_type: 'tmd_event',
          interaction_date: '2024-01-15T10:30:00+00:00',
          notification_sent: false,
        },
      ];

      mockApi.get.mockResolvedValue({
        data: {
          _embedded: {
            'user-interactions': mockInteractions,
          },
        },
      });

      const result = await interactionService.getContentInteractions(12345, 'tmd_event');

      expect(mockApi.get).toHaveBeenCalledWith('/tmd/v3/user-interactions', {
        params: {
          target_post_id: 12345,
          target_post_type: 'tmd_event',
        },
      });
      expect(result).toEqual(mockInteractions);
    });

    it('should return empty array when no interactions found', async () => {
      mockApi.get.mockResolvedValue({
        data: {
          _embedded: {},
        },
      });

      const result = await interactionService.getContentInteractions(12345, 'tmd_event');

      expect(result).toEqual([]);
    });
  });

  describe('createInteraction', () => {
    it('should create a new interaction successfully', async () => {
      const newInteraction = {
        interaction_type: 'like' as const,
        target_post_id: 12345,
        target_post_type: 'tmd_event' as const,
        private_note: 'Great event!',
      };

      const mockResponse = {
        data: {
          id: 1,
          ...newInteraction,
          interaction_date: '2024-01-15T10:30:00+00:00',
          notification_sent: false,
        },
      };

      mockApi.post.mockResolvedValue(mockResponse);

      const result = await interactionService.createInteraction(newInteraction);

      expect(mockApi.post).toHaveBeenCalledWith('/tmd/v3/user-interactions', newInteraction);
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle creation errors', async () => {
      const error = new Error('Creation failed');
      mockApi.post.mockRejectedValue(error);

      const newInteraction = {
        interaction_type: 'like' as const,
        target_post_id: 12345,
        target_post_type: 'tmd_event' as const,
      };

      await expect(interactionService.createInteraction(newInteraction)).rejects.toThrow(
        'Creation failed',
      );
    });
  });

  describe('updateInteraction', () => {
    it('should update an existing interaction', async () => {
      const updateData = {
        private_note: 'Updated note',
      };

      const mockResponse = {
        data: {
          id: 1,
          interaction_type: 'like',
          target_post_id: 12345,
          target_post_type: 'tmd_event',
          interaction_date: '2024-01-15T10:30:00+00:00',
          notification_sent: false,
          ...updateData,
        },
      };

      mockApi.put.mockResolvedValue(mockResponse);

      const result = await interactionService.updateInteraction(1, updateData);

      expect(mockApi.put).toHaveBeenCalledWith('/tmd/v3/user-interactions/1', updateData);
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('deleteInteraction', () => {
    it('should delete an interaction successfully', async () => {
      mockApi.delete.mockResolvedValue({ data: { deleted: true } });

      await interactionService.deleteInteraction(1);

      expect(mockApi.delete).toHaveBeenCalledWith('/tmd/v3/user-interactions/1');
    });

    it('should handle deletion errors', async () => {
      const error = new Error('Deletion failed');
      mockApi.delete.mockRejectedValue(error);

      await expect(interactionService.deleteInteraction(1)).rejects.toThrow('Deletion failed');
    });
  });

  describe('toggleInteraction', () => {
    it('should create interaction when it does not exist', async () => {
      // Mock getContentInteractions to return empty array
      mockApi.get.mockResolvedValue({
        data: {
          _embedded: {
            'user-interactions': [],
          },
        },
      });

      // Mock createInteraction
      const newInteraction = {
        id: 1,
        interaction_type: 'like',
        target_post_id: 12345,
        target_post_type: 'tmd_event',
        interaction_date: '2024-01-15T10:30:00+00:00',
        notification_sent: false,
      };

      mockApi.post.mockResolvedValue({ data: newInteraction });

      const result = await interactionService.toggleInteraction('like', 12345, 'tmd_event');

      expect(result.action).toBe('created');
      expect(result.interaction).toEqual(newInteraction);
    });

    it('should delete interaction when it exists', async () => {
      // Mock getContentInteractions to return existing interaction
      const existingInteraction = {
        id: 1,
        interaction_type: 'like',
        target_post_id: 12345,
        target_post_type: 'tmd_event',
        interaction_date: '2024-01-15T10:30:00+00:00',
        notification_sent: false,
      };

      mockApi.get.mockResolvedValue({
        data: {
          _embedded: {
            'user-interactions': [existingInteraction],
          },
        },
      });

      // Mock deleteInteraction
      mockApi.delete.mockResolvedValue({ data: { deleted: true } });

      const result = await interactionService.toggleInteraction('like', 12345, 'tmd_event');

      expect(result.action).toBe('deleted');
      expect(mockApi.delete).toHaveBeenCalledWith('/tmd/v3/user-interactions/1');
    });
  });

  describe('getUserBookmarks', () => {
    it('should fetch user bookmarks', async () => {
      const mockResponse = {
        data: {
          _embedded: {
            'user-interactions': [],
          },
        },
      };

      mockApi.get.mockResolvedValue(mockResponse);

      await interactionService.getUserBookmarks();

      expect(mockApi.get).toHaveBeenCalledWith('/tmd/v3/user-interactions', {
        params: {
          interaction_type: 'bookmark',
        },
      });
    });
  });

  describe('getUserLikes', () => {
    it('should fetch user likes', async () => {
      const mockResponse = {
        data: {
          _embedded: {
            'user-interactions': [],
          },
        },
      };

      mockApi.get.mockResolvedValue(mockResponse);

      await interactionService.getUserLikes();

      expect(mockApi.get).toHaveBeenCalledWith('/tmd/v3/user-interactions', {
        params: {
          interaction_type: 'like',
        },
      });
    });
  });

  describe('getUserReminders', () => {
    it('should fetch user reminders', async () => {
      const mockResponse = {
        data: {
          _embedded: {
            'user-interactions': [],
          },
        },
      };

      mockApi.get.mockResolvedValue(mockResponse);

      await interactionService.getUserReminders();

      expect(mockApi.get).toHaveBeenCalledWith('/tmd/v3/user-interactions', {
        params: {
          interaction_type: 'reminder',
        },
      });
    });
  });

  describe('getUserFollows', () => {
    it('should fetch user follows', async () => {
      const mockResponse = {
        data: {
          _embedded: {
            'user-interactions': [],
          },
        },
      };

      mockApi.get.mockResolvedValue(mockResponse);

      await interactionService.getUserFollows();

      expect(mockApi.get).toHaveBeenCalledWith('/tmd/v3/user-interactions', {
        params: {
          interaction_type: 'follow',
        },
      });
    });
  });
});

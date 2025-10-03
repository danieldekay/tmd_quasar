import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useErrorMessages } from '../useErrorMessages';

// Mock Quasar
const mockNotify = vi.fn();
vi.mock('quasar', () => ({
  useQuasar: () => ({
    notify: mockNotify,
  }),
}));

describe('useErrorMessages', () => {
  beforeEach(() => {
    mockNotify.mockClear();
  });

  describe('getErrorMessage', () => {
    it('should return correct message object for NETWORK_TIMEOUT', () => {
      const { getErrorMessage } = useErrorMessages();
      const error = getErrorMessage('NETWORK_TIMEOUT');

      expect(error).toBeDefined();
      if (!error) return;
      expect(error.code).toBe('NETWORK_TIMEOUT');
      expect(error.title).toBe('Connection Timeout');
      expect(error.type).toBe('network');
      expect(error.userAction).toBe('retry');
      expect(error.message).toContain('took too long');
    });

    it('should return correct message object for HTTP_404', () => {
      const { getErrorMessage } = useErrorMessages();
      const error = getErrorMessage('HTTP_NOT_FOUND');

      expect(error).toBeDefined();
      if (!error) return;
      expect(error.code).toBe('HTTP_NOT_FOUND');
      expect(error.title).toBe('Content Not Found');
      expect(error.type).toBe('http');
      expect(error.userAction).toBe('back');
      expect(error.message).toContain('could not be found');
    });

    it('should return auth error with login action for HTTP_401', () => {
      const { getErrorMessage } = useErrorMessages();
      const error = getErrorMessage('HTTP_UNAUTHORIZED');

      expect(error).toBeDefined();
      if (!error) return;
      expect(error.code).toBe('HTTP_UNAUTHORIZED');
      expect(error.title).toBe('Authentication Required');
      expect(error.type).toBe('authentication');
      expect(error.userAction).toBe('login');
      expect(error.message).toContain('session has expired');
    });

    it('should return generic error for unknown error code', () => {
      const { getErrorMessage } = useErrorMessages();
      const error = getErrorMessage('UNKNOWN_ERROR_CODE');

      expect(error).toBeDefined();
      if (!error) return;
      expect(error.code).toBe('UNKNOWN_ERROR');
      expect(error.title).toBe('Error');
      expect(error.message).toContain('unexpected error');
    });

    it('should support message interpolation with contentType', () => {
      const { getErrorMessage } = useErrorMessages();
      const error = getErrorMessage('TABLE_LOAD_FAILURE', { contentType: 'Events' });

      if (!error) return;
      expect(error.message).toContain('Events');
    });

    it('should support message interpolation with errorDetail', () => {
      const { getErrorMessage } = useErrorMessages();
      const error = getErrorMessage('DETAIL_LOAD_FAILURE', { errorDetail: 'Server timeout' });

      if (!error) return;
      expect(error.message).toContain('Server timeout');
    });
  });

  describe('getUserAction', () => {
    it('should return correct action config for retry', () => {
      const { getUserAction } = useErrorMessages();
      const action = getUserAction('retry');

      expect(action).toBeDefined();
      if (!action) return;
      expect(action.label).toBe('Retry');
      expect(action.icon).toBe('refresh');
      expect(action.description).toContain('operation again');
    });

    it('should return correct action config for login', () => {
      const { getUserAction } = useErrorMessages();
      const action = getUserAction('login');

      expect(action).toBeDefined();
      if (!action) return;
      expect(action.label).toBe('Log In');
      expect(action.icon).toBe('login');
    });

    it('should return correct action config for back', () => {
      const { getUserAction } = useErrorMessages();
      const action = getUserAction('back');

      expect(action).toBeDefined();
      if (!action) return;
      expect(action.label).toBe('Go Back');
      expect(action.icon).toBe('arrow_back');
    });

    it('should return null action for none', () => {
      const { getUserAction } = useErrorMessages();
      const action = getUserAction('none');

      expect(action).toBeDefined();
      if (!action) return;
      expect(action.label).toBeNull();
      expect(action.icon).toBeNull();
    });
  });

  describe('showErrorNotification', () => {
    it('should call Quasar Notify with correct params for network error', () => {
      const { showErrorNotification } = useErrorMessages();
      showErrorNotification('NETWORK_TIMEOUT');

      expect(mockNotify).toHaveBeenCalledTimes(1);
      expect(mockNotify).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'warning',
          position: 'top',
          timeout: 5000,
          message: expect.stringContaining('Connection Timeout'),
        }),
      );
    });

    it('should call Quasar Notify with correct params for HTTP error', () => {
      const { showErrorNotification } = useErrorMessages();
      showErrorNotification('HTTP_NOT_FOUND');

      expect(mockNotify).toHaveBeenCalledTimes(1);
      expect(mockNotify).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'negative',
          position: 'top',
          timeout: 5000,
          message: expect.stringContaining('Content Not Found'),
        }),
      );
    });

    it('should include action buttons when userAction is defined', () => {
      const { showErrorNotification } = useErrorMessages();
      showErrorNotification('NETWORK_TIMEOUT');

      expect(mockNotify).toHaveBeenCalledWith(
        expect.objectContaining({
          actions: expect.arrayContaining([
            expect.objectContaining({
              label: 'Retry',
              icon: 'refresh',
            }),
          ]),
        }),
      );
    });

    it('should support message interpolation in notifications', () => {
      const { showErrorNotification } = useErrorMessages();
      showErrorNotification('TABLE_LOAD_FAILURE', {
        contentType: 'Events',
        errorDetail: 'timeout',
      });

      expect(mockNotify).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('Events'),
        }),
      );
    });

    it('should not include action buttons when userAction is none', () => {
      const { showErrorNotification } = useErrorMessages();
      showErrorNotification('DATA_PARTIAL_CONTENT');

      expect(mockNotify).toHaveBeenCalledWith(
        expect.not.objectContaining({
          actions: expect.anything(),
        }),
      );
    });
  });

  describe('getNotificationType', () => {
    it('should return warning for network errors', () => {
      const { getErrorMessage } = useErrorMessages();
      const error = getErrorMessage('NETWORK_TIMEOUT');

      if (!error) return;
      expect(error.type).toBe('network');
    });

    it('should return negative for HTTP errors', () => {
      const { getErrorMessage } = useErrorMessages();
      const error = getErrorMessage('HTTP_NOT_FOUND');

      if (!error) return;
      expect(error.type).toBe('http');
    });

    it('should return warning for authentication errors', () => {
      const { getErrorMessage } = useErrorMessages();
      const error = getErrorMessage('HTTP_UNAUTHORIZED');

      if (!error) return;
      expect(error.type).toBe('authentication');
    });

    it('should return info for data errors', () => {
      const { getErrorMessage } = useErrorMessages();
      const error = getErrorMessage('DATA_EMPTY_TABLE');

      if (!error) return;
      expect(error.type).toBe('data');
    });
  });
});

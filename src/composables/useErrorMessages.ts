/**
 * Error Messages Composable
 *
 * Provides error message handling based on contracts/error-messages.json
 * Supports message interpolation and Quasar notification integration
 *
 * Usage:
 *   const { getErrorMessage, showErrorNotification } = useErrorMessages();
 *   const errorMsg = getErrorMessage('HTTP_404');
 *   showErrorNotification('HTTP_404', { contentType: 'Events' });
 */

import { useQuasar } from 'quasar';
import errorMessagesData from '../../specs/003-content-is-shown/contracts/error-messages.json';

// Type definitions
export type ErrorMessage = {
  type: string;
  code: string;
  title: string;
  message: string;
  userAction: string;
  technicalMessage: string;
};

export type UserAction = {
  label: string | null;
  icon: string | null;
  description: string;
};

type ErrorCategory =
  | 'networkErrors'
  | 'httpErrors'
  | 'dataErrors'
  | 'tableSpecific'
  | 'detailSpecific';

type ErrorMessagesJson = {
  networkErrors: Record<string, ErrorMessage>;
  httpErrors: Record<string, ErrorMessage>;
  dataErrors: Record<string, ErrorMessage>;
  tableSpecific: Record<string, ErrorMessage>;
  detailSpecific: Record<string, ErrorMessage>;
  userActions: Record<string, UserAction>;
  contentTypeLabels: Record<string, string>;
  notificationSettings: {
    position: string;
    timeout: number;
    types: Record<string, string>;
  };
};

/**
 * Use Error Messages Composable
 */
export function useErrorMessages() {
  const $q = useQuasar();
  const errorMessages = errorMessagesData as ErrorMessagesJson;

  /**
   * Get error message by error code with optional interpolation
   */
  function getErrorMessage(
    code: string,
    params?: Record<string, string>,
  ): ErrorMessage | null {
    // Search through all error categories
    const categories: ErrorCategory[] = [
      'networkErrors',
      'httpErrors',
      'dataErrors',
      'tableSpecific',
      'detailSpecific',
    ];

    for (const category of categories) {
      const categoryErrors = errorMessages[category];
      for (const error of Object.values(categoryErrors)) {
        if (error.code === code) {
          // Clone and interpolate if params provided
          if (params !== undefined) {
            const interpolatedError = { ...error };
            for (const [key, value] of Object.entries(params)) {
              interpolatedError.message = interpolatedError.message.replace(
                `{${key}}`,
                value,
              );
              interpolatedError.title = interpolatedError.title.replace(
                `{${key}}`,
                value,
              );
            }
            return interpolatedError;
          }
          return error;
        }
      }
    }

    // Return generic error if code not found
    return {
      type: 'unknown',
      code: 'UNKNOWN_ERROR',
      title: 'Error',
      message: 'An unexpected error occurred. Please try again or contact support.',
      userAction: 'retry',
      technicalMessage: `Unknown error code: ${code}`,
    };
  }

  /**
   * Get user action configuration by action key
   */
  function getUserAction(actionKey: string): UserAction | null {
    const action = errorMessages.userActions[actionKey];
    return action ?? null;
  }

  /**
   * Show error notification using Quasar Notify
   */
  function showErrorNotification(
    code: string,
    params?: Record<string, string>,
  ): void {
    const error = getErrorMessage(code, params);
    if (error === null) return;

    // Get notification type based on error type
    const notificationType =
      errorMessages.notificationSettings.types[error.type] ?? 'negative';

    // Build actions array
    const actions: Array<{ label: string; icon?: string }> = [];
    const userAction = getUserAction(error.userAction);
    if (userAction !== null && userAction.label !== null) {
      const action: { label: string; icon?: string } = {
        label: userAction.label,
      };
      if (userAction.icon !== null) {
        action.icon = userAction.icon;
      }
      actions.push(action);
    }

    // Build notification options
    const notifyOptions: {
      type: string;
      message: string;
      caption: string;
      position:
        | 'top'
        | 'bottom'
        | 'left'
        | 'right'
        | 'top-left'
        | 'top-right'
        | 'bottom-left'
        | 'bottom-right'
        | 'center';
      timeout: number;
      actions?: Array<{ label: string; icon?: string }>;
    } = {
      type: notificationType,
      message: error.title,
      caption: error.message,
      position: errorMessages.notificationSettings.position as
        | 'top'
        | 'bottom'
        | 'left'
        | 'right'
        | 'top-left'
        | 'top-right'
        | 'bottom-left'
        | 'bottom-right'
        | 'center',
      timeout: errorMessages.notificationSettings.timeout,
    };

    // Add actions only if they exist
    if (actions.length > 0) {
      notifyOptions.actions = actions;
    }

    // Show notification
    $q.notify(notifyOptions);
  }

  /**
   * Get content type label for error message interpolation
   */
  function getContentTypeLabel(contentType: string): string {
    return errorMessages.contentTypeLabels[contentType] ?? contentType;
  }

  return {
    getErrorMessage,
    getUserAction,
    showErrorNotification,
    getContentTypeLabel,
  };
}

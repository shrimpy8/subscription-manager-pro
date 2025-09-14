/**
 * Centralized error handling utilities
 * 
 * Provides consistent error handling across the application
 * with proper user feedback and logging capabilities.
 * All error handling should use these utilities to ensure consistent behavior and logging.
 */

import { getCurrentDate } from '@/lib/utils';

/**
 * Context information for error logging
 */
export interface ErrorContext {
  /** The component where the error occurred */
  component?: string;
  /** The action being performed when the error occurred */
  action?: string;
  /** The user ID associated with the error */
  userId?: string;
  /** The timestamp when the error occurred */
  timestamp?: Date;
}

/**
 * Detailed error information for logging and debugging
 */
export interface ErrorDetails {
  /** The error message */
  message: string;
  /** Optional error code */
  code?: string;
  /** Context information about where the error occurred */
  context?: ErrorContext;
  /** The original error object */
  originalError?: Error;
}

/**
 * Handle errors with proper user feedback and logging
 * @param error - The error to handle (Error object or string message)
 * @param context - Optional context information about where the error occurred
 * @param showUserFeedback - Whether to show user feedback (default: true)
 * @returns ErrorDetails object with error information
 * @example
 * ```typescript
 * try {
 *   // Some operation that might fail
 * } catch (error) {
 *   handleError(error, { component: 'MyComponent', action: 'fetchData' });
 * }
 * ```
 */
export function handleError(
  error: Error | string,
  context?: ErrorContext,
  showUserFeedback: boolean = true
): ErrorDetails {
  const errorDetails: ErrorDetails = {
    message: typeof error === 'string' ? error : error.message,
    context: {
      ...context,
      timestamp: getCurrentDate()
    },
    originalError: typeof error === 'string' ? undefined : error
  };

  // Log error for debugging (in development)
  if (process.env.NODE_ENV === 'development') {
    console.error('Application Error:', errorDetails);
  }

  // Show user feedback if requested
  if (showUserFeedback && typeof window !== 'undefined') {
    // You can integrate with a toast notification system here
    // For now, we'll use a simple alert in development
    if (process.env.NODE_ENV === 'development') {
      alert(`Error: ${errorDetails.message}`);
    }
  }

  return errorDetails;
}

/**
 * Handle API errors specifically
 * @param error - The API error that occurred
 * @param endpoint - The API endpoint that failed
 * @param context - Optional context information
 * @returns ErrorDetails object with API error information
 * @example
 * ```typescript
 * try {
 *   const response = await fetch('/api/subscriptions');
 * } catch (error) {
 *   handleApiError(error, '/api/subscriptions', { component: 'SubscriptionsList' });
 * }
 * ```
 */
export function handleApiError(
  error: Error,
  endpoint: string,
  context?: ErrorContext
): ErrorDetails {
  return handleError(
    `API Error (${endpoint}): ${error.message}`,
    {
      ...context,
      action: `API call to ${endpoint}`
    }
  );
}

/**
 * Handle subscription-related errors
 * @param error - The error that occurred
 * @param action - The subscription action that failed (e.g., 'creating', 'updating', 'deleting')
 * @param context - Optional context information
 * @returns ErrorDetails object with subscription error information
 * @example
 * ```typescript
 * try {
 *   await saveSubscription(subscription);
 * } catch (error) {
 *   handleSubscriptionError(error, 'saving', { component: 'SubscriptionForm' });
 * }
 * ```
 */
export function handleSubscriptionError(
  error: Error,
  action: string,
  context?: ErrorContext
): ErrorDetails {
  return handleError(
    `Subscription ${action} failed: ${error.message}`,
    {
      ...context,
      action: `Subscription ${action}`
    }
  );
}

/**
 * Handle form validation errors
 * @param field - The form field that failed validation
 * @param message - The validation error message
 * @param context - Optional context information
 * @returns ErrorDetails object with validation error information
 * @example
 * ```typescript
 * if (!isValidEmail(email)) {
 *   handleValidationError('email', 'Invalid email format', { component: 'ContactForm' });
 * }
 * ```
 */
export function handleValidationError(
  field: string,
  message: string,
  context?: ErrorContext
): ErrorDetails {
  return handleError(
    `Validation error in ${field}: ${message}`,
    {
      ...context,
      action: `Form validation for ${field}`
    },
    false // Don't show user feedback for validation errors
  );
}

/**
 * Create a user-friendly error message from technical error messages
 * @param error - The error to convert to a user-friendly message
 * @returns A user-friendly error message
 * @example
 * ```typescript
 * const friendlyMessage = getUserFriendlyMessage('Failed to fetch');
 * // Returns: "Unable to connect to the server. Please check your internet connection."
 * ```
 */
export function getUserFriendlyMessage(error: Error | string): string {
  const message = typeof error === 'string' ? error : error.message;
  
  // Map technical errors to user-friendly messages
  const friendlyMessages: Record<string, string> = {
    'Failed to fetch': 'Unable to connect to the server. Please check your internet connection.',
    'Network request failed': 'Network error. Please try again.',
    'Unauthorized': 'You are not authorized to perform this action.',
    'Forbidden': 'Access denied. Please contact support.',
    'Not Found': 'The requested resource was not found.',
    'Internal Server Error': 'Server error. Please try again later.',
    'Bad Request': 'Invalid request. Please check your input.',
    'Timeout': 'Request timed out. Please try again.'
  };

  return friendlyMessages[message] || 'An unexpected error occurred. Please try again.';
}

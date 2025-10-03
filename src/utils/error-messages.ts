/**
 * Error Message Catalog
 * 
 * Centralized error messages with specific, actionable guidance
 * for better user experience and error recovery.
 */

/**
 * Error categories for better organization
 */
export enum ErrorCategory {
  NETWORK = 'NETWORK',
  VALIDATION = 'VALIDATION',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  NOT_FOUND = 'NOT_FOUND',
  SERVER = 'SERVER',
  CLIENT = 'CLIENT',
  UNKNOWN = 'UNKNOWN',
}

/**
 * Error severity levels
 */
export enum ErrorSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

/**
 * Error message interface
 */
export interface ErrorMessage {
  code: string;
  message: string;
  category: ErrorCategory;
  severity: ErrorSeverity;
  userMessage: string;
  recoveryActions: string[];
  technicalDetails?: string;
}

/**
 * Error message catalog
 */
export const ERROR_MESSAGES: Record<string, ErrorMessage> = {
  // Network Errors
  NETWORK_ERROR: {
    code: 'NETWORK_ERROR',
    message: 'Network request failed',
    category: ErrorCategory.NETWORK,
    severity: ErrorSeverity.MEDIUM,
    userMessage: 'Unable to connect to the server. Please check your internet connection and try again.',
    recoveryActions: [
      'Check your internet connection',
      'Try refreshing the page',
      'Contact support if the problem persists'
    ],
    technicalDetails: 'Network request failed - possible connectivity issues'
  },

  NETWORK_TIMEOUT: {
    code: 'NETWORK_TIMEOUT',
    message: 'Request timeout',
    category: ErrorCategory.NETWORK,
    severity: ErrorSeverity.MEDIUM,
    userMessage: 'The request took too long to complete. Please try again.',
    recoveryActions: [
      'Try again in a moment',
      'Check your internet connection',
      'Contact support if the problem continues'
    ],
    technicalDetails: 'Request timeout - server may be slow or overloaded'
  },

  // Validation Errors
  VALIDATION_ERROR: {
    code: 'VALIDATION_ERROR',
    message: 'Validation failed',
    category: ErrorCategory.VALIDATION,
    severity: ErrorSeverity.LOW,
    userMessage: 'Please check the highlighted fields and correct any errors.',
    recoveryActions: [
      'Review the form for highlighted errors',
      'Correct any invalid input',
      'Ensure all required fields are filled'
    ],
    technicalDetails: 'Form validation failed - check input data'
  },

  REQUIRED_FIELD: {
    code: 'REQUIRED_FIELD',
    message: 'Required field is missing',
    category: ErrorCategory.VALIDATION,
    severity: ErrorSeverity.LOW,
    userMessage: 'This field is required. Please provide a value.',
    recoveryActions: [
      'Fill in the required field',
      'Check for any missing information'
    ],
    technicalDetails: 'Required field validation failed'
  },

  INVALID_EMAIL: {
    code: 'INVALID_EMAIL',
    message: 'Invalid email format',
    category: ErrorCategory.VALIDATION,
    severity: ErrorSeverity.LOW,
    userMessage: 'Please enter a valid email address.',
    recoveryActions: [
      'Check the email format',
      'Ensure the email contains @ and a domain'
    ],
    technicalDetails: 'Email validation failed - invalid format'
  },

  INVALID_URL: {
    code: 'INVALID_URL',
    message: 'Invalid URL format',
    category: ErrorCategory.VALIDATION,
    severity: ErrorSeverity.LOW,
    userMessage: 'Please enter a valid URL (e.g., https://example.com).',
    recoveryActions: [
      'Check the URL format',
      'Ensure the URL starts with http:// or https://'
    ],
    technicalDetails: 'URL validation failed - invalid format'
  },

  // Authentication Errors
  UNAUTHORIZED: {
    code: 'UNAUTHORIZED',
    message: 'Unauthorized access',
    category: ErrorCategory.AUTHENTICATION,
    severity: ErrorSeverity.HIGH,
    userMessage: 'You are not authorized to perform this action. Please log in again.',
    recoveryActions: [
      'Log in again',
      'Check your account status',
      'Contact support if the problem persists'
    ],
    technicalDetails: 'Authentication failed - invalid or expired credentials'
  },

  // Authorization Errors
  FORBIDDEN: {
    code: 'FORBIDDEN',
    message: 'Access denied',
    category: ErrorCategory.AUTHORIZATION,
    severity: ErrorSeverity.HIGH,
    userMessage: 'You do not have permission to perform this action.',
    recoveryActions: [
      'Contact your administrator',
      'Check your account permissions',
      'Contact support for assistance'
    ],
    technicalDetails: 'Authorization failed - insufficient permissions'
  },

  // Not Found Errors
  SUBSCRIPTION_NOT_FOUND: {
    code: 'SUBSCRIPTION_NOT_FOUND',
    message: 'Subscription not found',
    category: ErrorCategory.NOT_FOUND,
    severity: ErrorSeverity.MEDIUM,
    userMessage: 'The subscription you are looking for could not be found.',
    recoveryActions: [
      'Check if the subscription exists',
      'Refresh the page',
      'Contact support if the problem persists'
    ],
    technicalDetails: 'Subscription not found - ID may be invalid or deleted'
  },

  RESOURCE_NOT_FOUND: {
    code: 'RESOURCE_NOT_FOUND',
    message: 'Resource not found',
    category: ErrorCategory.NOT_FOUND,
    severity: ErrorSeverity.MEDIUM,
    userMessage: 'The requested resource could not be found.',
    recoveryActions: [
      'Check the URL or resource ID',
      'Refresh the page',
      'Contact support if the problem persists'
    ],
    technicalDetails: 'Resource not found - invalid ID or deleted resource'
  },

  // Server Errors
  SERVER_ERROR: {
    code: 'SERVER_ERROR',
    message: 'Internal server error',
    category: ErrorCategory.SERVER,
    severity: ErrorSeverity.HIGH,
    userMessage: 'Something went wrong on our end. Please try again later.',
    recoveryActions: [
      'Try again in a few minutes',
      'Refresh the page',
      'Contact support if the problem persists'
    ],
    technicalDetails: 'Internal server error - application or database issue'
  },

  DATABASE_ERROR: {
    code: 'DATABASE_ERROR',
    message: 'Database error',
    category: ErrorCategory.SERVER,
    severity: ErrorSeverity.HIGH,
    userMessage: 'We are experiencing database issues. Please try again later.',
    recoveryActions: [
      'Try again in a few minutes',
      'Refresh the page',
      'Contact support immediately'
    ],
    technicalDetails: 'Database connection or query failed'
  },

  // Client Errors
  INVALID_REQUEST: {
    code: 'INVALID_REQUEST',
    message: 'Invalid request',
    category: ErrorCategory.CLIENT,
    severity: ErrorSeverity.MEDIUM,
    userMessage: 'The request was invalid. Please check your input and try again.',
    recoveryActions: [
      'Check your input data',
      'Ensure all required fields are filled',
      'Try again with valid data'
    ],
    technicalDetails: 'Invalid request format or missing required fields'
  },

  RATE_LIMIT_EXCEEDED: {
    code: 'RATE_LIMIT_EXCEEDED',
    message: 'Rate limit exceeded',
    category: ErrorCategory.CLIENT,
    severity: ErrorSeverity.MEDIUM,
    userMessage: 'You have made too many requests. Please wait a moment before trying again.',
    recoveryActions: [
      'Wait a few minutes before trying again',
      'Reduce the frequency of your requests',
      'Contact support if you need higher limits'
    ],
    technicalDetails: 'Rate limit exceeded - too many requests in short time'
  },

  // Application Specific Errors
  SAVE_ERROR: {
    code: 'SAVE_ERROR',
    message: 'Failed to save subscription',
    category: ErrorCategory.SERVER,
    severity: ErrorSeverity.MEDIUM,
    userMessage: 'Failed to save your subscription. Please try again.',
    recoveryActions: [
      'Try saving again',
      'Check your internet connection',
      'Contact support if the problem persists'
    ],
    technicalDetails: 'Subscription save operation failed'
  },

  LOAD_ERROR: {
    code: 'LOAD_ERROR',
    message: 'Failed to load subscriptions',
    category: ErrorCategory.SERVER,
    severity: ErrorSeverity.MEDIUM,
    userMessage: 'Unable to load your subscriptions. Please try refreshing the page.',
    recoveryActions: [
      'Refresh the page',
      'Check your internet connection',
      'Contact support if the problem persists'
    ],
    technicalDetails: 'Subscription loading failed - data retrieval error'
  },

  EXPORT_ERROR: {
    code: 'EXPORT_ERROR',
    message: 'Failed to export subscriptions',
    category: ErrorCategory.SERVER,
    severity: ErrorSeverity.MEDIUM,
    userMessage: 'Unable to export your subscriptions. Please try again.',
    recoveryActions: [
      'Try exporting again',
      'Check your internet connection',
      'Contact support if the problem persists'
    ],
    technicalDetails: 'Subscription export failed - data processing error'
  },

  DELETE_ERROR: {
    code: 'DELETE_ERROR',
    message: 'Failed to delete subscription',
    category: ErrorCategory.SERVER,
    severity: ErrorSeverity.MEDIUM,
    userMessage: 'Unable to delete the subscription. Please try again.',
    recoveryActions: [
      'Try deleting again',
      'Check your internet connection',
      'Contact support if the problem persists'
    ],
    technicalDetails: 'Subscription deletion failed - data removal error'
  },

  // Unknown Errors
  UNKNOWN_ERROR: {
    code: 'UNKNOWN_ERROR',
    message: 'An unexpected error occurred',
    category: ErrorCategory.UNKNOWN,
    severity: ErrorSeverity.HIGH,
    userMessage: 'Something unexpected happened. Please try again or contact support.',
    recoveryActions: [
      'Try the action again',
      'Refresh the page',
      'Contact support with error details'
    ],
    technicalDetails: 'Unknown error - unhandled exception or unexpected condition'
  },
};

/**
 * Get error message by code
 */
export function getErrorMessage(code: string): ErrorMessage {
  return ERROR_MESSAGES[code] || ERROR_MESSAGES.UNKNOWN_ERROR;
}

/**
 * Get user-friendly error message
 */
export function getUserFriendlyMessage(code: string): string {
  const errorMessage = getErrorMessage(code);
  return errorMessage.userMessage;
}

/**
 * Get error recovery actions
 */
export function getErrorRecoveryActions(code: string): string[] {
  const errorMessage = getErrorMessage(code);
  return errorMessage.recoveryActions;
}

/**
 * Get error category
 */
export function getErrorCategory(code: string): ErrorCategory {
  const errorMessage = getErrorMessage(code);
  return errorMessage.category;
}

/**
 * Get error severity
 */
export function getErrorSeverity(code: string): ErrorSeverity {
  const errorMessage = getErrorMessage(code);
  return errorMessage.severity;
}

/**
 * Check if error is recoverable
 */
export function isErrorRecoverable(code: string): boolean {
  const errorMessage = getErrorMessage(code);
  return errorMessage.recoveryActions.length > 0;
}

/**
 * Get error message for display
 */
export function getDisplayMessage(code: string, includeRecovery: boolean = false): string {
  const errorMessage = getErrorMessage(code);
  let message = errorMessage.userMessage;
  
  if (includeRecovery && errorMessage.recoveryActions.length > 0) {
    message += '\n\nWhat you can do:\n' + errorMessage.recoveryActions.map(action => `• ${action}`).join('\n');
  }
  
  return message;
}

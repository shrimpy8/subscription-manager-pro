/**
 * Standardized Operation Handler
 * 
 * Provides consistent error handling and user feedback for common operations
 * like saving, deleting, and updating subscriptions.
 */

import { toast } from 'react-hot-toast';
import { handleSubscriptionError } from './error-handler';
import { getUserFriendlyMessage } from './error-messages';

/**
 * Context for operation handling
 */
export interface OperationContext {
  /** The component performing the operation */
  component: string;
  /** The action being performed */
  action: string;
  /** Optional user ID */
  userId?: string;
}

/**
 * Result of an operation
 */
export interface OperationResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Handle a subscription operation with consistent error handling and user feedback
 * @param operation - The async operation to perform
 * @param context - Context information about the operation
 * @param successMessage - Message to show on success
 * @returns Promise<OperationResult<T>>
 */
export async function handleSubscriptionOperation<T>(
  operation: () => Promise<T>,
  context: OperationContext,
  successMessage: string
): Promise<OperationResult<T>> {
  try {
    const data = await operation();
    toast.success(successMessage);
    return { success: true, data };
  } catch (error) {
    const errorMessage = getUserFriendlyMessage('SAVE_ERROR');
    toast.error(errorMessage);
    handleSubscriptionError(
      error as Error,
      context.action,
      { component: context.component, userId: context.userId }
    );
    return { success: false, error: errorMessage };
  }
}

/**
 * Handle a subscription save operation with consistent patterns
 * @param saveOperation - The save operation to perform
 * @param context - Context information
 * @param itemName - Name of the item being saved
 * @returns Promise<OperationResult>
 */
export async function handleSaveOperation(
  saveOperation: () => Promise<void>,
  context: OperationContext,
  itemName: string
): Promise<OperationResult> {
  return handleSubscriptionOperation(
    saveOperation,
    context,
    `Successfully saved "${itemName}"!`
  );
}

/**
 * Handle a subscription delete operation with consistent patterns
 * @param deleteOperation - The delete operation to perform
 * @param context - Context information
 * @param itemName - Name of the item being deleted
 * @returns Promise<OperationResult>
 */
export async function handleDeleteOperation(
  deleteOperation: () => Promise<void>,
  context: OperationContext,
  itemName: string
): Promise<OperationResult> {
  return handleSubscriptionOperation(
    deleteOperation,
    context,
    `Successfully deleted "${itemName}"!`
  );
}

/**
 * Handle a subscription update operation with consistent patterns
 * @param updateOperation - The update operation to perform
 * @param context - Context information
 * @param itemName - Name of the item being updated
 * @returns Promise<OperationResult>
 */
export async function handleUpdateOperation(
  updateOperation: () => Promise<void>,
  context: OperationContext,
  itemName: string
): Promise<OperationResult> {
  return handleSubscriptionOperation(
    updateOperation,
    context,
    `Successfully updated "${itemName}"!`
  );
}

/**
 * Handle a subscription duplicate operation with consistent patterns
 * @param duplicateOperation - The duplicate operation to perform
 * @param context - Context information
 * @param itemName - Name of the item being duplicated
 * @returns Promise<OperationResult>
 */
export async function handleDuplicateOperation(
  duplicateOperation: () => Promise<void>,
  context: OperationContext,
  itemName: string
): Promise<OperationResult> {
  return handleSubscriptionOperation(
    duplicateOperation,
    context,
    `Successfully duplicated "${itemName}"!`
  );
}

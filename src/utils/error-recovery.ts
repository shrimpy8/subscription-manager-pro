/**
 * Error Recovery Mechanisms
 * 
 * Provides centralized error recovery utilities and retry mechanisms
 * for better user experience and error handling.
 */

import { ErrorCategory, ErrorSeverity } from './error-messages';

/**
 * Retry configuration options
 */
export interface RetryOptions {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  retryCondition?: (error: Error) => boolean;
}

/**
 * Default retry configuration
 */
export const DEFAULT_RETRY_OPTIONS: RetryOptions = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  backoffMultiplier: 2,
  retryCondition: (error: Error) => {
    // Retry on network errors, timeouts, and server errors
    return error.message.includes('fetch') || 
           error.message.includes('timeout') || 
           error.message.includes('5') ||
           error.message.includes('network');
  }
};

/**
 * Retry handler result
 */
export interface RetryResult<T> {
  success: boolean;
  data?: T;
  error?: Error;
  attempts: number;
  totalTime: number;
}

/**
 * Create a retry handler for async operations
 */
export function createRetryHandler<T>(
  operation: () => Promise<T>,
  options: Partial<RetryOptions> = {}
): () => Promise<RetryResult<T>> {
  const config = { ...DEFAULT_RETRY_OPTIONS, ...options };
  
  return async (): Promise<RetryResult<T>> => {
    const startTime = Date.now();
    let lastError: Error;
    
    for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
      try {
        const data = await operation();
        return {
          success: true,
          data,
          attempts: attempt + 1,
          totalTime: Date.now() - startTime
        };
      } catch (error) {
        lastError = error as Error;
        
        // Check if we should retry
        if (attempt === config.maxRetries || 
            (config.retryCondition && !config.retryCondition(lastError))) {
          break;
        }
        
        // Calculate delay with exponential backoff
        const delay = Math.min(
          config.baseDelay * Math.pow(config.backoffMultiplier, attempt),
          config.maxDelay
        );
        
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    return {
      success: false,
      error: lastError!,
      attempts: config.maxRetries + 1,
      totalTime: Date.now() - startTime
    };
  };
}

/**
 * Offline detection and handling
 */
export class OfflineHandler {
  private static instance: OfflineHandler;
  private isOnline: boolean = navigator.onLine;
  private listeners: Set<(isOnline: boolean) => void> = new Set();
  
  private constructor() {
    window.addEventListener('online', () => this.setOnline(true));
    window.addEventListener('offline', () => this.setOnline(false));
  }
  
  static getInstance(): OfflineHandler {
    if (!OfflineHandler.instance) {
      OfflineHandler.instance = new OfflineHandler();
    }
    return OfflineHandler.instance;
  }
  
  private setOnline(isOnline: boolean): void {
    this.isOnline = isOnline;
    this.listeners.forEach(listener => listener(isOnline));
  }
  
  public getOnlineStatus(): boolean {
    return this.isOnline;
  }
  
  public addListener(listener: (isOnline: boolean) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
  
  public waitForOnline(): Promise<void> {
    if (this.isOnline) {
      return Promise.resolve();
    }
    
    return new Promise(resolve => {
      const removeListener = this.addListener(isOnline => {
        if (isOnline) {
          removeListener();
          resolve();
        }
      });
    });
  }
}

/**
 * Error recovery strategies
 */
export enum RecoveryStrategy {
  RETRY = 'RETRY',
  FALLBACK = 'FALLBACK',
  CACHE = 'CACHE',
  OFFLINE = 'OFFLINE',
  USER_ACTION = 'USER_ACTION'
}

/**
 * Recovery action interface
 */
export interface RecoveryAction {
  strategy: RecoveryStrategy;
  label: string;
  description: string;
  action: () => Promise<void> | void;
  priority: number;
}

/**
 * Error recovery manager
 */
export class ErrorRecoveryManager {
  private static instance: ErrorRecoveryManager;
  private recoveryActions: Map<string, RecoveryAction[]> = new Map();
  
  static getInstance(): ErrorRecoveryManager {
    if (!ErrorRecoveryManager.instance) {
      ErrorRecoveryManager.instance = new ErrorRecoveryManager();
    }
    return ErrorRecoveryManager.instance;
  }
  
  /**
   * Register recovery actions for a specific error
   */
  public registerRecoveryActions(
    errorCode: string,
    actions: RecoveryAction[]
  ): void {
    this.recoveryActions.set(errorCode, actions.sort((a, b) => a.priority - b.priority));
  }
  
  /**
   * Get recovery actions for an error
   */
  public getRecoveryActions(errorCode: string): RecoveryAction[] {
    return this.recoveryActions.get(errorCode) || [];
  }
  
  /**
   * Execute recovery action
   */
  public async executeRecoveryAction(action: RecoveryAction): Promise<void> {
    try {
      await action.action();
    } catch (error) {
      console.error('Recovery action failed:', error);
      throw error;
    }
  }
}

/**
 * Data recovery utilities
 */
export class DataRecovery {
  /**
   * Recover from localStorage corruption
   */
  public static recoverFromStorageCorruption<T>(
    key: string,
    fallback: T,
    validator: (data: unknown) => data is T
  ): T {
    try {
      const stored = localStorage.getItem(key);
      if (!stored) return fallback;
      
      const parsed = JSON.parse(stored);
      if (validator(parsed)) {
        return parsed;
      }
      
      // Data is corrupted, remove it
      localStorage.removeItem(key);
      return fallback;
    } catch {
      // JSON parsing failed, remove corrupted data
      localStorage.removeItem(key);
      return fallback;
    }
  }
  
  /**
   * Backup data before operations
   */
  public static createBackup<T>(data: T, key: string): void {
    try {
      const backup = {
        data,
        timestamp: Date.now(),
        version: '1.0'
      };
      localStorage.setItem(`${key}_backup`, JSON.stringify(backup));
    } catch (error) {
      console.warn('Failed to create backup:', error);
    }
  }
  
  /**
   * Restore from backup
   */
  public static restoreFromBackup<T>(
    key: string,
    validator: (data: unknown) => data is T
  ): T | null {
    try {
      const backup = localStorage.getItem(`${key}_backup`);
      if (!backup) return null;
      
      const parsed = JSON.parse(backup);
      if (parsed.data && validator(parsed.data)) {
        return parsed.data;
      }
      
      return null;
    } catch {
      return null;
    }
  }
}

/**
 * Network error recovery
 */
export class NetworkRecovery {
  /**
   * Check if error is recoverable
   */
  public static isRecoverableError(error: Error): boolean {
    const recoverablePatterns = [
      'fetch',
      'network',
      'timeout',
      'connection',
      '5',
      '503',
      '502',
      '504'
    ];
    
    return recoverablePatterns.some(pattern => 
      error.message.toLowerCase().includes(pattern)
    );
  }
  
  /**
   * Get network error recovery actions
   */
  public static getRecoveryActions(error: Error): RecoveryAction[] {
    const actions: RecoveryAction[] = [];
    
    if (error.message.includes('fetch') || error.message.includes('network')) {
      actions.push({
        strategy: RecoveryStrategy.RETRY,
        label: 'Retry Connection',
        description: 'Try connecting again',
        action: async () => {
          // Wait for network to be available
          const offlineHandler = OfflineHandler.getInstance();
          await offlineHandler.waitForOnline();
        },
        priority: 1
      });
    }
    
    if (error.message.includes('timeout')) {
      actions.push({
        strategy: RecoveryStrategy.RETRY,
        label: 'Retry with Longer Timeout',
        description: 'Try again with extended timeout',
        action: async () => {
          // Implementation would depend on the specific operation
        },
        priority: 2
      });
    }
    
    return actions;
  }
}

/**
 * Form validation recovery
 */
export class FormRecovery {
  /**
   * Recover from form validation errors
   */
  public static getValidationRecoveryActions(
    errors: Record<string, string[]>
  ): RecoveryAction[] {
    const actions: RecoveryAction[] = [];
    
    // Check for common validation errors
    if (errors.email && errors.email.length > 0) {
      actions.push({
        strategy: RecoveryStrategy.USER_ACTION,
        label: 'Fix Email Format',
        description: 'Please enter a valid email address',
        action: () => {
          // Focus on email field
          const emailField = document.querySelector('input[type="email"]') as HTMLInputElement;
          if (emailField) {
            emailField.focus();
            emailField.select();
          }
        },
        priority: 1
      });
    }
    
    if (errors.url && errors.url.length > 0) {
      actions.push({
        strategy: RecoveryStrategy.USER_ACTION,
        label: 'Fix URL Format',
        description: 'Please enter a valid URL (e.g., https://example.com)',
        action: () => {
          // Focus on URL field
          const urlField = document.querySelector('input[type="url"]') as HTMLInputElement;
          if (urlField) {
            urlField.focus();
            urlField.select();
          }
        },
        priority: 1
      });
    }
    
    return actions;
  }
}

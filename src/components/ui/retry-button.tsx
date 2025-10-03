/**
 * Retry Button Component
 * 
 * Provides error recovery functionality with retry mechanisms
 * and user-friendly error handling.
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Retry button props
 */
export interface RetryButtonProps {
  onRetry: () => Promise<void>;
  maxRetries?: number;
  retryDelay?: number;
  className?: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  disabled?: boolean;
  children?: React.ReactNode;
}

/**
 * Retry button component
 */
export function RetryButton({
  onRetry,
  maxRetries = 3,
  retryDelay = 1000,
  className,
  variant = 'outline',
  size = 'default',
  disabled = false,
  children = 'Retry'
}: RetryButtonProps) {
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [lastError, setLastError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const handleRetry = async () => {
    if (isRetrying || retryCount >= maxRetries) return;
    
    setIsRetrying(true);
    setLastError(null);
    
    try {
      await onRetry();
      setSuccess(true);
      setRetryCount(0);
      
      // Reset success state after delay
      setTimeout(() => setSuccess(false), 2000);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Retry failed';
      setLastError(errorMessage);
      setRetryCount(prev => prev + 1);
      
      // Auto-retry with delay if under max retries
      if (retryCount + 1 < maxRetries) {
        setTimeout(() => {
          setIsRetrying(false);
        }, retryDelay);
      } else {
        setIsRetrying(false);
      }
    }
  };
  
  const isMaxRetriesReached = retryCount >= maxRetries;
  const isDisabled = disabled || isRetrying || isMaxRetriesReached;
  
  return (
    <div className="flex flex-col items-center gap-2">
      <Button
        onClick={handleRetry}
        disabled={isDisabled}
        variant={variant}
        size={size}
        className={cn(
          'flex items-center gap-2',
          success && 'bg-green-600 hover:bg-green-700',
          isMaxRetriesReached && 'opacity-50 cursor-not-allowed',
          className
        )}
      >
        {isRetrying ? (
          <>
            <RefreshCw className="w-4 h-4 animate-spin" />
            Retrying...
          </>
        ) : success ? (
          <>
            <CheckCircle className="w-4 h-4" />
            Success!
          </>
        ) : (
          <>
            <RefreshCw className="w-4 h-4" />
            {children}
          </>
        )}
      </Button>
      
      {lastError && (
        <div className="flex items-center gap-2 text-sm text-red-600">
          <AlertCircle className="w-4 h-4" />
          <span>{lastError}</span>
        </div>
      )}
      
      {retryCount > 0 && (
        <div className="text-xs text-gray-500">
          Attempt {retryCount + 1} of {maxRetries + 1}
        </div>
      )}
      
      {isMaxRetriesReached && (
        <div className="text-xs text-red-500">
          Maximum retries reached. Please try again later.
        </div>
      )}
    </div>
  );
}

/**
 * Error recovery component
 */
export interface ErrorRecoveryProps {
  error: string;
  onRetry: () => Promise<void>;
  onAlternativeAction?: () => void;
  alternativeActionLabel?: string;
  className?: string;
}

export function ErrorRecovery({
  error,
  onRetry,
  onAlternativeAction,
  alternativeActionLabel = 'Try Alternative',
  className
}: ErrorRecoveryProps) {
  return (
    <div className={cn('flex flex-col items-center gap-4 p-4 bg-red-50 border border-red-200 rounded-lg', className)}>
      <div className="flex items-center gap-2 text-red-600">
        <AlertCircle className="w-5 h-5" />
        <span className="font-medium">Something went wrong</span>
      </div>
      
      <p className="text-sm text-red-700 text-center">{error}</p>
      
      <div className="flex gap-2">
        <RetryButton onRetry={onRetry} variant="destructive" size="sm">
          Try Again
        </RetryButton>
        
        {onAlternativeAction && (
          <Button
            onClick={onAlternativeAction}
            variant="outline"
            size="sm"
            className="border-red-300 text-red-700 hover:bg-red-100"
          >
            {alternativeActionLabel}
          </Button>
        )}
      </div>
    </div>
  );
}

/**
 * Network error recovery component
 */
export interface NetworkErrorRecoveryProps {
  onRetry: () => Promise<void>;
  onGoOffline?: () => void;
  className?: string;
}

export function NetworkErrorRecovery({
  onRetry,
  onGoOffline,
  className
}: NetworkErrorRecoveryProps) {
  return (
    <div className={cn('flex flex-col items-center gap-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg', className)}>
      <div className="flex items-center gap-2 text-yellow-600">
        <AlertCircle className="w-5 h-5" />
        <span className="font-medium">Connection Problem</span>
      </div>
      
      <p className="text-sm text-yellow-700 text-center">
        Unable to connect to the server. Please check your internet connection.
      </p>
      
      <div className="flex gap-2">
        <RetryButton onRetry={onRetry} variant="outline" size="sm">
          Retry Connection
        </RetryButton>
        
        {onGoOffline && (
          <Button
            onClick={onGoOffline}
            variant="outline"
            size="sm"
            className="border-yellow-300 text-yellow-700 hover:bg-yellow-100"
          >
            Work Offline
          </Button>
        )}
      </div>
    </div>
  );
}

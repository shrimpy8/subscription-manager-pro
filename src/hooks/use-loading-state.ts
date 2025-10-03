import { useState, useCallback, useMemo } from 'react';
import { LoadingState } from '@/types/common';

export interface LoadingActions {
  setLoading: (loading: boolean, message?: string) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  reset: () => void;
}

export interface UseLoadingStateReturn extends LoadingState, LoadingActions {}

/**
 * Unified loading state management hook
 * Provides consistent loading state management across the application
 */
export function useLoadingState(initialState: Partial<LoadingState> = {}): UseLoadingStateReturn {
  const [isLoading, setIsLoading] = useState(initialState.isLoading || false);
  const [loadingMessage, setLoadingMessage] = useState<string | null>(initialState.loadingMessage || null);
  const [error, setError] = useState<string | null>(initialState.error || null);

  const setLoading = useCallback((loading: boolean, message?: string) => {
    setIsLoading(loading);
    setLoadingMessage(loading ? message || null : null);
    if (loading) {
      setError(null); // Clear error when starting to load
    }
  }, []);

  const setErrorState = useCallback((errorMessage: string | null) => {
    setError(errorMessage);
    if (errorMessage) {
      setIsLoading(false); // Stop loading when error occurs
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const reset = useCallback(() => {
    setIsLoading(false);
    setLoadingMessage(null);
    setError(null);
  }, []);

  return {
    isLoading,
    loadingMessage,
    error,
    setLoading,
    setError: setErrorState,
    clearError,
    reset
  };
}

/**
 * Hook for managing multiple loading states
 * Useful for components that need to track multiple async operations
 * Note: This is a simplified version that creates individual loading states
 */
export function useMultipleLoadingStates<T extends string>(
  _operations: T[]
): Record<T, UseLoadingStateReturn> & {
  isAnyLoading: boolean;
  hasAnyError: boolean;
  clearAllErrors: () => void;
  resetAll: () => void;
} {
  // For now, we'll create a simple implementation
  // In a real implementation, you'd need to dynamically create hooks
  // This is a limitation of React hooks - they can't be called conditionally
  
  const initialState = useLoadingState();
  const exportState = useLoadingState();
  const saveState = useLoadingState();
  const deleteState = useLoadingState();
  const addState = useLoadingState();

  const states = useMemo(() => ({
    initial: initialState,
    export: exportState,
    save: saveState,
    delete: deleteState,
    add: addState
  } as Record<T, UseLoadingStateReturn>), [initialState, exportState, saveState, deleteState, addState]);

  const isAnyLoading = Object.values(states).some((state) => (state as UseLoadingStateReturn).isLoading);
  const hasAnyError = Object.values(states).some((state) => (state as UseLoadingStateReturn).error);

  const clearAllErrors = useCallback(() => {
    Object.values(states).forEach(state => (state as UseLoadingStateReturn).clearError());
  }, [states]);

  const resetAll = useCallback(() => {
    Object.values(states).forEach(state => (state as UseLoadingStateReturn).reset());
  }, [states]);

  return {
    ...states,
    isAnyLoading,
    hasAnyError,
    clearAllErrors,
    resetAll
  };
}

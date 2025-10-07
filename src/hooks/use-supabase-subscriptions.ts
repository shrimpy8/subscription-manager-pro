/**
 * React Hook for Supabase Subscriptions
 * 
 * Provides React hooks for all Supabase subscription operations
 * with loading states, error handling, and optimistic updates
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { SupabaseDataAccess } from '@/lib/supabase-data'
import { Subscription } from '@/types/subscription'

// Hook state interface
export interface UseSupabaseSubscriptionsState {
  subscriptions: Subscription[]
  loading: boolean
  error: string | null
  lastSync: Date | null
  isOnline: boolean
}

// Hook actions interface
export interface UseSupabaseSubscriptionsActions {
  // CRUD operations
  createSubscription: (subscription: Subscription) => Promise<boolean>
  updateSubscription: (id: string, updates: Partial<Subscription>) => Promise<boolean>
  deleteSubscription: (id: string) => Promise<boolean>
  
  // Query operations
  refreshSubscriptions: () => Promise<void>
  searchSubscriptions: (query: string) => Promise<Subscription[]>
  getExpiringSubscriptions: (days?: number) => Promise<Subscription[]>
  getMonthlyCost: () => Promise<number>
  
  // Sync operations
  syncFromLocalStorage: () => Promise<void>
  syncToLocalStorage: () => Promise<void>
  clearError: () => void
}

// Hook return type
export type UseSupabaseSubscriptionsReturn = UseSupabaseSubscriptionsState & UseSupabaseSubscriptionsActions

/**
 * Main hook for Supabase subscription management
 */
export function useSupabaseSubscriptions(): UseSupabaseSubscriptionsReturn {
  // State
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastSync, setLastSync] = useState<Date | null>(null)
  const [isOnline, setIsOnline] = useState(true)
  
  // Refs for cleanup
  const abortControllerRef = useRef<AbortController | null>(null)
  
  // Online/offline detection
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])
  
  // Load subscriptions on mount
  useEffect(() => {
    refreshSubscriptions()
  }, [])
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])
  
  // Clear error
  const clearError = useCallback(() => {
    setError(null)
  }, [])
  
  // Refresh subscriptions
  const refreshSubscriptions = useCallback(async () => {
    if (!isOnline) {
      setError('No internet connection')
      return
    }
    
    setLoading(true)
    setError(null)
    
    try {
      abortControllerRef.current = new AbortController()
      
      const result = await SupabaseDataAccess.readAllSubscriptions()
      
      if (result.success && result.data) {
        setSubscriptions(result.data)
        setLastSync(new Date())
      } else {
        setError(result.error?.message || 'Failed to load subscriptions')
      }
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        setError(err.message)
      }
    } finally {
      setLoading(false)
    }
  }, [isOnline])
  
  // Create subscription
  const createSubscription = useCallback(async (subscription: Subscription): Promise<boolean> => {
    if (!isOnline) {
      setError('No internet connection')
      return false
    }
    
    setLoading(true)
    setError(null)
    
    try {
      const result = await SupabaseDataAccess.createSubscription(subscription)
      
      if (result.success) {
        // Optimistic update
        setSubscriptions(prev => [...prev, subscription])
        setLastSync(new Date())
        return true
      } else {
        setError(result.error?.message || 'Failed to create subscription')
        return false
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      return false
    } finally {
      setLoading(false)
    }
  }, [isOnline])
  
  // Update subscription
  const updateSubscription = useCallback(async (id: string, updates: Partial<Subscription>): Promise<boolean> => {
    if (!isOnline) {
      setError('No internet connection')
      return false
    }
    
    setLoading(true)
    setError(null)
    
    try {
      const result = await SupabaseDataAccess.updateSubscription(id, updates)
      
      if (result.success && result.data) {
        // Optimistic update
        setSubscriptions(prev => 
          prev.map(sub => sub.id === id ? { ...sub, ...updates } : sub)
        )
        setLastSync(new Date())
        return true
      } else {
        setError(result.error?.message || 'Failed to update subscription')
        return false
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      return false
    } finally {
      setLoading(false)
    }
  }, [isOnline])
  
  // Delete subscription
  const deleteSubscription = useCallback(async (id: string): Promise<boolean> => {
    if (!isOnline) {
      setError('No internet connection')
      return false
    }
    
    setLoading(true)
    setError(null)
    
    try {
      const result = await SupabaseDataAccess.deleteSubscription(id)
      
      if (result.success) {
        // Optimistic update
        setSubscriptions(prev => prev.filter(sub => sub.id !== id))
        setLastSync(new Date())
        return true
      } else {
        setError(result.error?.message || 'Failed to delete subscription')
        return false
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      return false
    } finally {
      setLoading(false)
    }
  }, [isOnline])
  
  // Search subscriptions
  const searchSubscriptions = useCallback(async (query: string): Promise<Subscription[]> => {
    if (!isOnline) {
      setError('No internet connection')
      return []
    }
    
    try {
      const result = await SupabaseDataAccess.searchSubscriptions(query)
      
      if (result.success && result.data) {
        return result.data
      } else {
        setError(result.error?.message || 'Search failed')
        return []
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed')
      return []
    }
  }, [isOnline])
  
  // Get expiring subscriptions
  const getExpiringSubscriptions = useCallback(async (days: number = 30): Promise<Subscription[]> => {
    if (!isOnline) {
      setError('No internet connection')
      return []
    }
    
    try {
      const result = await SupabaseDataAccess.getExpiringSubscriptions(days)
      
      if (result.success && result.data) {
        return result.data
      } else {
        setError(result.error?.message || 'Failed to get expiring subscriptions')
        return []
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get expiring subscriptions')
      return []
    }
  }, [isOnline])
  
  // Get monthly cost
  const getMonthlyCost = useCallback(async (): Promise<number> => {
    if (!isOnline) {
      setError('No internet connection')
      return 0
    }
    
    try {
      const result = await SupabaseDataAccess.getActiveSubscriptionsMonthlyCost()
      
      if (result.success && result.data !== null) {
        return result.data
      } else {
        setError(result.error?.message || 'Failed to get monthly cost')
        return 0
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get monthly cost')
      return 0
    }
  }, [isOnline])
  
  // Sync from localStorage
  const syncFromLocalStorage = useCallback(async () => {
    if (!isOnline) {
      setError('No internet connection')
      return
    }
    
    setLoading(true)
    setError(null)
    
    try {
      // Get localStorage subscriptions
      const localStorageData = localStorage.getItem('subscriptions')
      if (!localStorageData) {
        setError('No local data found')
        return
      }
      
      const localSubscriptions: Subscription[] = JSON.parse(localStorageData)
      
      // Batch create in Supabase
      const result = await SupabaseDataAccess.batchCreateSubscriptions(localSubscriptions)
      
      if (result.success && result.data) {
        setSubscriptions(result.data)
        setLastSync(new Date())
      } else {
        setError(result.error?.message || 'Sync failed')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sync failed')
    } finally {
      setLoading(false)
    }
  }, [isOnline])
  
  // Sync to localStorage
  const syncToLocalStorage = useCallback(async () => {
    try {
      localStorage.setItem('subscriptions', JSON.stringify(subscriptions))
      setLastSync(new Date())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sync to localStorage')
    }
  }, [subscriptions])
  
  return {
    // State
    subscriptions,
    loading,
    error,
    lastSync,
    isOnline,
    
    // Actions
    createSubscription,
    updateSubscription,
    deleteSubscription,
    refreshSubscriptions,
    searchSubscriptions,
    getExpiringSubscriptions,
    getMonthlyCost,
    syncFromLocalStorage,
    syncToLocalStorage,
    clearError
  }
}

/**
 * Hook for subscription statistics
 */
export function useSubscriptionStats() {
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    paused: 0,
    canceled: 0,
    monthlyCost: 0,
    expiringSoon: 0
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const refreshStats = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const [
        subscriptionsResult,
        monthlyCostResult,
        expiringResult
      ] = await Promise.all([
        SupabaseDataAccess.readAllSubscriptions(),
        SupabaseDataAccess.getActiveSubscriptionsMonthlyCost(),
        SupabaseDataAccess.getExpiringSubscriptions(30)
      ])
      
      if (subscriptionsResult.success && subscriptionsResult.data) {
        const subs = subscriptionsResult.data
        const active = subs.filter(s => s.status === 'active').length
        const paused = subs.filter(s => s.status === 'paused').length
        const canceled = subs.filter(s => s.status === 'canceled').length
        
        setStats({
          total: subs.length,
          active,
          paused,
          canceled,
          monthlyCost: monthlyCostResult.success ? monthlyCostResult.data || 0 : 0,
          expiringSoon: expiringResult.success ? expiringResult.data?.length || 0 : 0
        })
      } else {
        setError(subscriptionsResult.error?.message || 'Failed to load stats')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load stats')
    } finally {
      setLoading(false)
    }
  }, [])
  
  useEffect(() => {
    refreshStats()
  }, [refreshStats])
  
  return {
    stats,
    loading,
    error,
    refreshStats
  }
}

/**
 * Hook for health monitoring
 */
export function useSupabaseHealth() {
  const [isHealthy, setIsHealthy] = useState<boolean | null>(null)
  const [lastCheck, setLastCheck] = useState<Date | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  const checkHealth = useCallback(async () => {
    try {
      const result = await SupabaseDataAccess.healthCheck()
      setIsHealthy(result.success)
      setError(result.error?.message || null)
      setLastCheck(new Date())
    } catch (err) {
      setIsHealthy(false)
      setError(err instanceof Error ? err.message : 'Health check failed')
      setLastCheck(new Date())
    }
  }, [])
  
  useEffect(() => {
    checkHealth()
    
    // Check health every 5 minutes
    const interval = setInterval(checkHealth, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [checkHealth])
  
  return {
    isHealthy,
    lastCheck,
    error,
    checkHealth
  }
}

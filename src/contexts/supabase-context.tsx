/**
 * Supabase Context Provider
 * 
 * Provides global state management for Supabase operations
 * with React Context for sharing state across components
 */

'use client'

import React, { createContext, useContext, ReactNode } from 'react'
import { 
  useSupabaseSubscriptions, 
  useSubscriptionStats, 
  useSupabaseHealth,
  UseSupabaseSubscriptionsReturn 
} from '@/hooks/use-supabase-subscriptions'

// Context type
interface SupabaseContextType {
  subscriptions: UseSupabaseSubscriptionsReturn
  stats: ReturnType<typeof useSubscriptionStats>
  health: ReturnType<typeof useSupabaseHealth>
}

// Create context
const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined)

// Provider component
interface SupabaseProviderProps {
  children: ReactNode
}

export function SupabaseProvider({ children }: SupabaseProviderProps) {
  const subscriptions = useSupabaseSubscriptions()
  const stats = useSubscriptionStats()
  const health = useSupabaseHealth()
  
  const value: SupabaseContextType = {
    subscriptions,
    stats,
    health
  }
  
  return (
    <SupabaseContext.Provider value={value}>
      {children}
    </SupabaseContext.Provider>
  )
}

// Hook to use Supabase context
export function useSupabaseContext(): SupabaseContextType {
  const context = useContext(SupabaseContext)
  
  if (context === undefined) {
    throw new Error('useSupabaseContext must be used within a SupabaseProvider')
  }
  
  return context
}

// Individual hooks for specific parts of the context
export function useSupabaseSubscriptionsContext() {
  const { subscriptions } = useSupabaseContext()
  return subscriptions
}

export function useSupabaseStatsContext() {
  const { stats } = useSupabaseContext()
  return stats
}

export function useSupabaseHealthContext() {
  const { health } = useSupabaseContext()
  return health
}

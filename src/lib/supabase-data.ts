/**
 * Supabase Data Access Layer
 * 
 * Comprehensive data access layer for Supabase with all CRUD functions,
 * data transformation utilities, and error handling.
 */

import { supabase, supabaseAdmin } from './supabase'

// Server-side proxy helper
async function proxyRequest(endpoint: string, method: string = 'GET', body?: Record<string, unknown>) {
  const url = `/api/supabase-proxy?endpoint=${encodeURIComponent(endpoint)}`
  const response = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined
  })
  
  if (!response.ok) {
    throw new Error(`Proxy request failed: ${response.status}`)
  }
  
  const result = await response.json()
  if (!result.success) {
    throw new Error(result.error || 'Proxy request failed')
  }
  
  return result.data
}
import { 
  subscriptionToSupabase, 
  supabaseToSubscription, 
  supabaseFullToSubscription,
  createSubscriptionRelationships,
  SupabaseSubscriptionInsert,
  SupabaseSubscriptionUpdate,
  SupabaseSubscriptionFull
} from './supabase-types'
import { Subscription } from '@/types/subscription'

// Error types
export interface SupabaseError {
  code: string
  message: string
  details?: string
  hint?: string
}

export interface SupabaseResult<T> {
  data: T | null
  error: SupabaseError | null
  success: boolean
}

// Retry configuration
const RETRY_CONFIG = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 5000
}

/**
 * Retry utility with exponential backoff
 */
async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = RETRY_CONFIG.maxRetries
): Promise<T> {
  let lastError: Error
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error as Error
      
      if (attempt === maxRetries) {
        throw lastError
      }
      
      // Exponential backoff with jitter
      const delay = Math.min(
        RETRY_CONFIG.baseDelay * Math.pow(2, attempt) + Math.random() * 1000,
        RETRY_CONFIG.maxDelay
      )
      
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  
  throw lastError!
}

/**
 * Handle Supabase errors with user-friendly messages
 */
function handleSupabaseError(error: unknown): SupabaseError {
  if (error && typeof error === 'object' && 'code' in error && 'message' in error) {
    return {
      code: (error as { code: string }).code,
      message: (error as { message: string }).message,
      details: (error as { details?: string }).details,
      hint: (error as { hint?: string }).hint
    }
  }
  
  return {
    code: 'UNKNOWN_ERROR',
    message: error instanceof Error ? error.message : 'An unknown error occurred',
    details: error?.toString()
  }
}

/**
 * Create a new subscription with all relationships
 */
export async function createSubscription(subscription: Subscription): Promise<SupabaseResult<Subscription>> {
  try {
    // Transform to Supabase format
    const supabaseData = subscriptionToSupabase(subscription)
    
    // Use proxy for data access to avoid CORS issues
    const response = await fetch('/api/supabase-proxy?endpoint=/rest/v1/subscriptions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(supabaseData)
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Request failed: ${response.status} - ${errorText}`)
    }
    
    const result = await response.json()
    
    if (!result.success) {
      throw new Error(result.error || 'Request failed')
    }
    
    return {
      data: subscription,
      error: null,
      success: true
    }
    
  } catch (error) {
    console.error('Create subscription error:', error, 'for subscription:', subscription.name)
    return {
      data: null,
      error: handleSupabaseError(error),
      success: false
    }
  }
}

/**
 * Read a subscription by ID with all relationships
 */
export async function readSubscription(id: string): Promise<SupabaseResult<Subscription>> {
  try {
    const result = await withRetry(async () => {
      // Get subscription with all relationships using the full view
      const { data, error } = await supabase
        .from('subscriptions_full')
        .select('*')
        .eq('id', id)
        .single()
      
      if (error) {
        throw error
      }
      
      if (!data) {
        throw new Error('Subscription not found')
      }
      
      // Transform to localStorage format
      return supabaseFullToSubscription(data)
    })
    
    return {
      data: result,
      error: null,
      success: true
    }
    
  } catch (error) {
    return {
      data: null,
      error: handleSupabaseError(error),
      success: false
    }
  }
}

/**
 * Read all subscriptions with optional filtering
 */
export async function readAllSubscriptions(filters?: {
  category?: string
  status?: string
  search?: string
  limit?: number
  offset?: number
}): Promise<SupabaseResult<Subscription[]>> {
  try {
    const result = await withRetry(async () => {
      // Use proxy for data access to avoid CORS issues
      let queryParams = 'select=*'
      
      // Apply filters
      if (filters?.category) {
        queryParams += `&category=eq.${encodeURIComponent(filters.category)}`
      }
      
      if (filters?.status) {
        queryParams += `&status=eq.${encodeURIComponent(filters.status)}`
      }
      
      if (filters?.search) {
        queryParams += `&or=name.ilike.%${encodeURIComponent(filters.search)}%,description.ilike.%${encodeURIComponent(filters.search)}%`
      }
      
      // Apply pagination
      if (filters?.limit) {
        queryParams += `&limit=${filters.limit}`
      }
      
      if (filters?.offset) {
        queryParams += `&offset=${filters.offset}`
      }
      
      const response = await fetch(`/api/supabase-proxy?endpoint=/rest/v1/subscriptions_full&query=${queryParams}`)
      
      if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`)
      }
      
      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Request failed')
      }
      
      // Transform all subscriptions
      return result.data?.map((sub: SupabaseSubscriptionFull) => supabaseFullToSubscription(sub)) || []
    })
    
    return {
      data: result,
      error: null,
      success: true
    }
    
  } catch (error) {
    return {
      data: null,
      error: handleSupabaseError(error),
      success: false
    }
  }
}

/**
 * Update a subscription
 */
export async function updateSubscription(id: string, updates: Partial<Subscription>): Promise<SupabaseResult<Subscription>> {
  try {
    const result = await withRetry(async () => {
      // Transform updates to Supabase format
      const supabaseUpdates = subscriptionToSupabase(updates as Subscription)
      
      // Update subscription
      const { data, error } = await supabase
        .from('subscriptions')
        .update(supabaseUpdates)
        .eq('id', id)
        .select()
        .single()
      
      if (error) {
        throw error
      }
      
      if (!data) {
        throw new Error('Subscription not found')
      }
      
      // If relationships are being updated, handle them
      if (updates.tags || updates.alternative_services || updates.api_access_keys || 
          updates.previously_used_promotion_code || updates.account_emails_used_previously) {
        
        // Delete existing relationships
        await Promise.allSettled([
          supabase.from('subscription_tags').delete().eq('subscription_id', id),
          supabase.from('subscription_alternatives').delete().eq('subscription_id', id),
          supabase.from('subscription_api_keys').delete().eq('subscription_id', id),
          supabase.from('subscription_previous_promocodes').delete().eq('subscription_id', id),
          supabase.from('subscription_previous_accountemails').delete().eq('subscription_id', id)
        ])
        
        // Create new relationships
        const relationships = createSubscriptionRelationships(id, updates as Subscription)
        
        // Insert new relationships
        const relationshipPromises = []
        
        if (relationships.tags.length > 0) {
          relationshipPromises.push(
            supabase.from('subscription_tags').insert(relationships.tags)
          )
        }
        
        if (relationships.alternatives.length > 0) {
          relationshipPromises.push(
            supabase.from('subscription_alternatives').insert(relationships.alternatives)
          )
        }
        
        if (relationships.apiKeys.length > 0) {
          relationshipPromises.push(
            supabase.from('subscription_api_keys').insert(relationships.apiKeys)
          )
        }
        
        if (relationships.promoCodes.length > 0) {
          relationshipPromises.push(
            supabase.from('subscription_promo_codes').insert(relationships.promoCodes)
          )
        }
        
        if (relationships.accountEmails.length > 0) {
          relationshipPromises.push(
            supabase.from('subscription_account_emails').insert(relationships.accountEmails)
          )
        }
        
        await Promise.allSettled(relationshipPromises)
      }
      
      // Get the updated subscription with relationships
      const { data: fullData, error: fullError } = await supabase
        .from('subscriptions_full')
        .select('*')
        .eq('id', id)
        .single()
      
      if (fullError) {
        throw fullError
      }
      
      return supabaseFullToSubscription(fullData)
    })
    
    return {
      data: result,
      error: null,
      success: true
    }
    
  } catch (error) {
    return {
      data: null,
      error: handleSupabaseError(error),
      success: false
    }
  }
}

/**
 * Delete a subscription and all its relationships
 */
export async function deleteSubscription(id: string): Promise<SupabaseResult<boolean>> {
  try {
    await withRetry(async () => {
      // Delete subscription (relationships will cascade delete)
      const { error } = await supabase
        .from('subscriptions')
        .delete()
        .eq('id', id)
      
      if (error) {
        throw error
      }
    })
    
    return {
      data: true,
      error: null,
      success: true
    }
    
  } catch (error) {
    return {
      data: false,
      error: handleSupabaseError(error),
      success: false
    }
  }
}

/**
 * Get subscriptions expiring soon
 */
export async function getExpiringSubscriptions(days: number = 30): Promise<SupabaseResult<Subscription[]>> {
  try {
    const result = await withRetry(async () => {
      // Use proxy for data access to avoid CORS issues
      const response = await fetch(`/api/supabase-proxy?endpoint=/rest/v1/subscriptions_expiring_soon&query=select=*&days_until_renewal=lte.${days}`)
      
      if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`)
      }
      
      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Request failed')
      }
      
      return result.data?.map((sub: SupabaseSubscriptionFull) => supabaseFullToSubscription(sub)) || []
    })
    
    return {
      data: result,
      error: null,
      success: true
    }
    
  } catch (error) {
    return {
      data: null,
      error: handleSupabaseError(error),
      success: false
    }
  }
}

/**
 * Get active subscriptions monthly cost
 */
export async function getActiveSubscriptionsMonthlyCost(): Promise<SupabaseResult<number>> {
  try {
    const result = await withRetry(async () => {
      // Use proxy for data access to avoid CORS issues
      const response = await fetch(`/api/supabase-proxy?endpoint=/rest/v1/active_subscriptions_monthly_cost&query=select=monthly_cost`)
      
      if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`)
      }
      
      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Request failed')
      }
      
      const totalCost = result.data?.reduce((sum: number, item: { monthly_cost?: number }) => sum + (item.monthly_cost || 0), 0) || 0
      return totalCost
    })
    
    return {
      data: result,
      error: null,
      success: true
    }
    
  } catch (error) {
    return {
      data: null,
      error: handleSupabaseError(error),
      success: false
    }
  }
}

/**
 * Search subscriptions
 */
export async function searchSubscriptions(query: string): Promise<SupabaseResult<Subscription[]>> {
  try {
    const result = await withRetry(async () => {
      const { data, error } = await supabase
        .from('subscriptions_full')
        .select('*')
        .or(`name.ilike.%${query}%,description.ilike.%${query}%,notes.ilike.%${query}%`)
      
      if (error) {
        throw error
      }
      
      return data?.map((sub: SupabaseSubscriptionFull) => supabaseFullToSubscription(sub)) || []
    })
    
    return {
      data: result,
      error: null,
      success: true
    }
    
  } catch (error) {
    return {
      data: null,
      error: handleSupabaseError(error),
      success: false
    }
  }
}

/**
 * Get category breakdown
 */
export async function getCategoryBreakdown(): Promise<SupabaseResult<Array<{
  category: string
  count: number
  totalCost: number
}>>> {
  try {
    const result = await withRetry(async () => {
      const { data, error } = await supabase
        .rpc('get_category_breakdown')
      
      if (error) {
        throw error
      }
      
      return data || []
    })
    
    return {
      data: result,
      error: null,
      success: true
    }
    
  } catch (error) {
    return {
      data: null,
      error: handleSupabaseError(error),
      success: false
    }
  }
}

/**
 * Get total monthly cost
 */
export async function getTotalMonthlyCost(): Promise<SupabaseResult<number>> {
  try {
    const result = await withRetry(async () => {
      const { data, error } = await supabase
        .rpc('calculate_total_monthly_cost')
      
      if (error) {
        throw error
      }
      
      return data || 0
    })
    
    return {
      data: result,
      error: null,
      success: true
    }
    
  } catch (error) {
    return {
      data: null,
      error: handleSupabaseError(error),
      success: false
    }
  }
}

/**
 * Batch operations
 */
export async function batchCreateSubscriptions(subscriptions: Subscription[]): Promise<SupabaseResult<Subscription[]>> {
  try {
    console.log(`Starting batch create for ${subscriptions.length} subscriptions`)
    
    const results = await Promise.allSettled(
      subscriptions.map((sub, index) => {
        console.log(`Creating subscription ${index + 1}/${subscriptions.length}: ${sub.name}`)
        return createSubscription(sub)
      })
    )
    
    const successful = results
      .filter((result): result is PromiseFulfilledResult<SupabaseResult<Subscription>> => 
        result.status === 'fulfilled' && result.value.success
      )
      .map(result => result.value.data!)
    
    const failed = results
      .filter(result => result.status === 'rejected' || 
        (result.status === 'fulfilled' && !result.value.success)
      )
    
    if (failed.length > 0) {
      console.warn(`${failed.length} subscriptions failed to create`)
      failed.forEach((result, index) => {
        if (result.status === 'rejected') {
          console.error(`Subscription ${index} rejected:`, result.reason)
        } else if (result.status === 'fulfilled' && !result.value.success) {
          console.error(`Subscription ${index} failed:`, result.value.error)
        }
      })
    }
    
    console.log(`Batch create completed: ${successful.length} successful, ${failed.length} failed`)
    
    return {
      data: successful,
      error: failed.length > 0 ? {
        code: 'BATCH_PARTIAL_FAILURE',
        message: `${failed.length} subscriptions failed to create`,
        details: `Successfully created ${successful.length} of ${subscriptions.length} subscriptions`
      } : null,
      success: successful.length > 0
    }
    
  } catch (error) {
    console.error('Batch create error:', error)
    return {
      data: null,
      error: handleSupabaseError(error),
      success: false
    }
  }
}

/**
 * Health check
 */
export async function healthCheck(): Promise<SupabaseResult<boolean>> {
  try {
    // Use proxy for health check to avoid CORS issues
    const response = await fetch('/api/supabase-proxy?endpoint=/rest/v1/subscriptions&query=select=id&limit=1')
    
    if (!response.ok) {
      throw new Error(`Health check failed: ${response.status}`)
    }
    
    const result = await response.json()
    
    if (result.success) {
      return {
        data: true,
        error: null,
        success: true
      }
    } else {
      return {
        data: false,
        error: { code: 'HEALTH_CHECK_FAILED', message: result.error || 'Health check failed' },
        success: false
      }
    }
    
  } catch (error) {
    return {
      data: false,
      error: handleSupabaseError(error),
      success: false
    }
  }
}

// Export all functions
export const SupabaseDataAccess = {
  // CRUD operations
  createSubscription,
  readSubscription,
  readAllSubscriptions,
  updateSubscription,
  deleteSubscription,
  
  // Query operations
  getExpiringSubscriptions,
  getActiveSubscriptionsMonthlyCost,
  searchSubscriptions,
  getCategoryBreakdown,
  getTotalMonthlyCost,
  
  // Batch operations
  batchCreateSubscriptions,
  
  // Utility
  healthCheck
}

// Make it available globally for testing
if (typeof window !== 'undefined') {
  window.SupabaseDataAccess = SupabaseDataAccess
}

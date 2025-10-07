/**
 * Subscription Storage Management
 * 
 * Enhanced localStorage management with URL state synchronization
 * Features from AI Tools Tracker: URL state management, advanced filtering
 */

import { Subscription, SubscriptionFilters, ViewMode, URLState } from '@/types/subscription';
import { handleError } from '@/utils/error-handler';
import { generateId } from '@/lib/utils'

const STORAGE_KEYS = {
  SUBSCRIPTIONS: 'subscription-manager-subscriptions',
  FILTERS: 'subscription-manager-filters',
  VIEW_MODE: 'subscription-manager-view-mode',
  URL_STATE: 'subscription-manager-url-state'
} as const

/**
 * Load subscriptions from localStorage
 */
export function loadSubscriptions(): Subscription[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.SUBSCRIPTIONS)
    if (!stored) return []
    
    const subscriptions = JSON.parse(stored)
    // Convert date strings back to Date objects
    return subscriptions.map((sub: Subscription) => ({
      ...sub,
      renewal_date: new Date(sub.renewal_date),
      start_date: new Date(sub.start_date),
      last_used: sub.last_used ? new Date(sub.last_used) : undefined
    }))
  } catch (error) {
    handleError(
      error as Error,
      { component: 'subscription-storage', action: 'load subscriptions' }
    );
    return []
  }
}

/**
 * Save subscriptions to localStorage
 */
export function saveSubscriptions(subscriptions: Subscription[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SUBSCRIPTIONS, JSON.stringify(subscriptions))
  } catch (error) {
    handleError(
      error as Error,
      { component: 'subscription-storage', action: 'save subscriptions' }
    );
  }
}

/**
 * Add a new subscription
 */
export function addSubscription(subscription: Omit<Subscription, 'id'>): Subscription {
  const subscriptions = loadSubscriptions()
  const newSubscription: Subscription = {
    ...subscription,
    id: generateId()
  }
  
  subscriptions.push(newSubscription)
  saveSubscriptions(subscriptions)
  return newSubscription
}

/**
 * Update an existing subscription
 */
export function updateSubscription(id: string, updates: Partial<Subscription>): Subscription | null {
  const subscriptions = loadSubscriptions()
  const index = subscriptions.findIndex(sub => sub.id === id)
  
  if (index === -1) return null
  
  subscriptions[index] = { ...subscriptions[index], ...updates }
  saveSubscriptions(subscriptions)
  return subscriptions[index]
}

/**
 * Delete a subscription
 */
export function deleteSubscription(id: string): boolean {
  const subscriptions = loadSubscriptions()
  const filtered = subscriptions.filter(sub => sub.id !== id)
  
  if (filtered.length === subscriptions.length) return false
  
  saveSubscriptions(filtered)
  return true
}

/**
 * Load filters from localStorage
 */
export function loadFilters(): Partial<SubscriptionFilters> {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.FILTERS)
    return stored ? JSON.parse(stored) : {}
  } catch (error) {
    handleError(
      error as Error,
      { component: 'subscription-storage', action: 'load filters' }
    );
    return {}
  }
}

/**
 * Save filters to localStorage
 */
export function saveFilters(filters: Partial<SubscriptionFilters>): void {
  try {
    localStorage.setItem(STORAGE_KEYS.FILTERS, JSON.stringify(filters))
  } catch (error) {
    handleError(
      error as Error,
      { component: 'subscription-storage', action: 'save filters' }
    );
  }
}

/**
 * Load view mode from localStorage
 */
export function loadViewMode(): Partial<ViewMode> {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.VIEW_MODE)
    return stored ? JSON.parse(stored) : {}
  } catch (error) {
    handleError(
      error as Error,
      { component: 'subscription-storage', action: 'load view mode' }
    );
    return {}
  }
}

/**
 * Save view mode to localStorage
 */
export function saveViewMode(viewMode: Partial<ViewMode>): void {
  try {
    localStorage.setItem(STORAGE_KEYS.VIEW_MODE, JSON.stringify(viewMode))
  } catch (error) {
    handleError(
      error as Error,
      { component: 'subscription-storage', action: 'save view mode' }
    );
  }
}

/**
 * Load URL state from localStorage
 */
export function loadURLState(): Partial<URLState> {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.URL_STATE)
    return stored ? JSON.parse(stored) : {}
  } catch (error) {
    handleError(
      error as Error,
      { component: 'subscription-storage', action: 'load URL state' }
    );
    return {}
  }
}

/**
 * Save URL state to localStorage
 */
export function saveURLState(urlState: Partial<URLState>): void {
  try {
    localStorage.setItem(STORAGE_KEYS.URL_STATE, JSON.stringify(urlState))
  } catch (error) {
    handleError(
      error as Error,
      { component: 'subscription-storage', action: 'save URL state' }
    );
  }
}

/**
 * Export subscriptions to JSON
 */
export function exportSubscriptions(): string {
  const subscriptions = loadSubscriptions()
  return JSON.stringify(subscriptions, null, 2)
}

/**
 * Import subscriptions from JSON
 */
export function importSubscriptions(jsonData: string): { success: number; errors: string[] } {
  try {
    const imported = JSON.parse(jsonData)
    const subscriptions = Array.isArray(imported) ? imported : [imported]
    
    const existing = loadSubscriptions()
    const errors: string[] = []
    let success = 0
    
    subscriptions.forEach((sub, index) => {
      if (!sub.name || !sub.cost) {
        errors.push(`Row ${index + 1}: Missing required fields (name, cost)`)
        return
      }
      
      const newSub: Subscription = {
        id: generateId(),
        name: sub.name,
        plan: sub.plan || 'Basic',
        logo: sub.logo || '',
        cost: Number(sub.cost),
        currency: sub.currency || 'USD',
        billing_cycle: sub.billingCycle || 'Monthly',
        category: sub.category || 'Other',
        description: sub.description || '',
        url: sub.url || '',
        status: sub.status || 'active',
        account_email: sub.accountEmail || '',
        promo_code: sub.promoCode,
        promo_discount: sub.promoDiscount,
        notes: sub.notes,
        renewal_date: sub.renewalDate ? new Date(sub.renewalDate) : new Date(),
        start_date: sub.startDate ? new Date(sub.startDate) : new Date(),
        tags: sub.tags || [],
        usage_importance: (sub.priority as 'high' | 'medium' | 'low') || 'medium',
        usage_frequency: (sub.usageFrequency as 'daily' | 'weekly' | 'monthly' | 'rarely') || 'monthly',
        alternative_services: sub.alternativeServices || [],
        last_used: sub.lastUsed ? new Date(sub.lastUsed) : undefined,
        auto_renew: sub.autoRenew !== undefined ? sub.autoRenew : true
      }
      
      existing.push(newSub)
      success++
    })
    
    saveSubscriptions(existing)
    return { success, errors }
  } catch (error) {
    return { success: 0, errors: ['Invalid JSON format'] }
  }
}


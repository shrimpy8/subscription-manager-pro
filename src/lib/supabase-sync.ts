/**
 * Supabase Data Synchronization Utilities
 * 
 * Handles synchronization between localStorage and Supabase
 * with conflict resolution and data migration
 */

import { SupabaseDataAccess } from './supabase-data'
import { Subscription } from '@/types/subscription'
import { loadToolsSubscriptionData } from '@/lib/tools-subscription-loader'

function ensureValidUUIDs(subs: Subscription[]): Subscription[] {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  const makeUUID = (): string => {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID()
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0
      const v = c === 'x' ? r : (r & 0x3 | 0x8)
      return v.toString(16)
    })
  }
  return subs.map(s => ({
    ...s,
    id: uuidRegex.test(s.id) ? s.id : makeUUID()
  }))
}

/**
 * Generate a proper UUID v4
 */
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

/**
 * Check if a string is a valid UUID
 */
function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(uuid)
}

// Sync result interface
export interface SyncResult {
  success: boolean
  localCount: number
  remoteCount: number
  syncedCount: number
  conflicts: Conflict[]
  errors: string[]
  duration: number
}

// Conflict interface
export interface Conflict {
  id: string
  local: Subscription
  remote: Subscription
  resolution: 'local' | 'remote' | 'skip'
}

// Sync options
export interface SyncOptions {
  resolveConflicts: 'local' | 'remote' | 'prompt' | 'skip'
  batchSize: number
  retryAttempts: number
  onProgress?: (progress: number) => void
  onConflict?: (conflict: Conflict) => Promise<'local' | 'remote' | 'skip'>
}

// Default sync options
const DEFAULT_SYNC_OPTIONS: SyncOptions = {
  resolveConflicts: 'prompt',
  batchSize: 200,
  retryAttempts: 3,
  onProgress: undefined,
  onConflict: undefined
}

// Legacy/local CSV shape covering all keys we reference during transformation
interface LegacyCSVSubscription {
  id?: string
  Name?: string
  name?: string
  Category?: string
  category?: string
  Subcategory?: string
  subcategory?: string
  Plan?: string
  plan?: string
  Cost?: string
  cost?: string
  Currency?: string
  currency?: string
  'Billing Cycle'?: string
  billingCycle?: string
  Status?: string
  status?: string
  'Start Date'?: string
  startDate?: string
  'Renewal Date'?: string
  renewalDate?: string
  URL?: string
  url?: string
  Description?: string
  description?: string
  Notes?: string
  notes?: string
  'Account Email'?: string
  accountEmail?: string
  Priority?: 'high' | 'medium' | 'low' | string
  priority?: 'high' | 'medium' | 'low' | string
  'Usage Frequency'?: 'daily' | 'weekly' | 'monthly' | 'rarely' | string
  usageFrequency?: 'daily' | 'weekly' | 'monthly' | 'rarely' | string
  logo?: string
  logoUrl?: string
  tags?: string[]
  'Auto Renew'?: string | boolean
  autoRenew?: boolean
  alternativeServices?: string[]
  accountEmailsUsedPreviously?: string[]
  previouslyUsedPromotionCode?: string[]
  latestPromotionCode?: string
  secretKey?: string
  'Safe for Work'?: string | boolean
  safeForWork?: boolean
  'China Region Only'?: string | boolean
  chinaRegionOnly?: boolean
  'a16z Rank'?: string
  lastUsed?: string
  fallbackIcon?: string
}

/**
 * Get subscriptions from localStorage
 */
export function getLocalSubscriptions(): Subscription[] {
  try {
  const data = localStorage.getItem('subscription-manager-data')
  if (!data) return []
    
    const parsed = JSON.parse(data)
    
    // Handle the actual data structure: { subscriptions: [...] }
  let subscriptions: unknown[] = []
    if (Array.isArray(parsed)) {
      subscriptions = parsed
    } else if (parsed && Array.isArray((parsed as { subscriptions?: unknown[] }).subscriptions)) {
      subscriptions = (parsed as { subscriptions: unknown[] }).subscriptions
    } else if (
      parsed &&
      (parsed as { data?: { subscriptions?: unknown[] } }).data &&
      Array.isArray((parsed as { data: { subscriptions: unknown[] } }).data.subscriptions)
    ) {
      subscriptions = (parsed as { data: { subscriptions: unknown[] } }).data.subscriptions
    }
    
        // Transform CSV-style data to proper Subscription format
        return (subscriptions as LegacyCSVSubscription[]).map((sub) => ({
      id: isValidUUID(sub.id || '') ? (sub.id as string) : generateUUID(),
      name: sub.Name || sub.name || 'Unknown',
      category: (sub.Category || sub.category || 'Other') as Subscription['category'],
      subcategory: sub.Subcategory || sub.subcategory || '',
      plan: sub.Plan || sub.plan || 'Free',
      cost: parseFloat((sub.Cost || sub.cost || '0') as string),
      currency: sub.Currency || sub.currency || 'USD',
      billing_cycle: (sub['Billing Cycle'] || sub.billingCycle || 'Monthly') as Subscription['billing_cycle'],
      status: (sub.Status || sub.status || 'active') as Subscription['status'],
      start_date: new Date((sub['Start Date'] || sub.startDate || new Date().toISOString()) as string),
      renewal_date: new Date((sub['Renewal Date'] || sub.renewalDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()) as string),
      url: sub.URL || sub.url || '',
      description: sub.Description || sub.description || '',
      notes: sub.Notes || sub.notes || '',
      account_email: sub['Account Email'] || sub.accountEmail || '',
      usage_importance: ((sub.Priority || sub.priority || 'medium') as Subscription['usage_importance']),
      usage_frequency: ((sub['Usage Frequency'] || sub.usageFrequency || 'monthly') as Subscription['usage_frequency']),
      logo: sub.logo || '',
      logo_url: sub.logoUrl || sub.logo || '',
      tags: sub.tags || [],
      auto_renew: (sub['Auto Renew'] === 'Yes') || (sub['Auto Renew'] === true) || (sub.autoRenew === true) || false,
      alternative_services: sub.alternativeServices || [],
      account_emails_used_previously: sub.accountEmailsUsedPreviously || [],
      previously_used_promotion_code: sub.previouslyUsedPromotionCode || undefined,
      latest_promocode: sub.latestPromotionCode || undefined,
      secret_key: sub.secretKey || undefined,
      safe_for_work: (sub['Safe for Work'] === 'Yes') || (sub['Safe for Work'] === true) || (sub.safeForWork === true) || false,
      china_region_only: (sub['China Region Only'] === 'Yes') || (sub['China Region Only'] === true) || (sub.chinaRegionOnly === true) || false,
      a16z_rank: sub['a16z Rank'] ? parseInt(sub['a16z Rank'] as string) : undefined,
      last_used: sub.lastUsed ? new Date(sub.lastUsed) : undefined,
      fallback_icon: sub.fallbackIcon || '📦'
    }))
  } catch (error) {
    console.error('Failed to get local subscriptions:', error)
    return []
  }
}

/**
 * Save subscriptions to localStorage
 */
export function saveLocalSubscriptions(subscriptions: Subscription[]): boolean {
  try {
    localStorage.setItem('subscription-manager-data', JSON.stringify(subscriptions))
    return true
  } catch (error) {
    console.error('Failed to save local subscriptions:', error)
    return false
  }
}

/**
 * Sync from localStorage to Supabase
 */
export async function syncToSupabase(options: Partial<SyncOptions> = {}): Promise<SyncResult> {
  const startTime = performance.now()
  const opts = { ...DEFAULT_SYNC_OPTIONS, ...options }
  
  const result: SyncResult = {
    success: false,
    localCount: 0,
    remoteCount: 0,
    syncedCount: 0,
    conflicts: [],
    errors: [],
    duration: 0
  }
  
  try {
    // Get local subscriptions
    const localSubscriptions = getLocalSubscriptions()
    // Also load tools subscriptions (Trending AI Tools) and merge
    let toolsSubscriptions: Subscription[] = []
    try {
      toolsSubscriptions = await loadToolsSubscriptionData()
    } catch {
      // ignore loader errors; proceed with local only
    }
    // Merge and de-duplicate by id (prefer local over tools)
    const combinedById = new Map<string, Subscription>()
    for (const sub of toolsSubscriptions) combinedById.set(sub.id, sub)
    for (const sub of localSubscriptions) combinedById.set(sub.id, sub)
    const combinedSubscriptions = ensureValidUUIDs(Array.from(combinedById.values()))
    
    result.localCount = combinedSubscriptions.length
    
    if (combinedSubscriptions.length === 0) {
      result.success = true
      result.duration = performance.now() - startTime
      return result
    }
    
    // Get remote subscriptions
    const remoteResult = await SupabaseDataAccess.readAllSubscriptions()
    if (!remoteResult.success) {
      result.errors.push(remoteResult.error?.message || 'Failed to get remote subscriptions')
      result.duration = performance.now() - startTime
      return result
    }
    
    const remoteSubscriptions = remoteResult.data || []
    result.remoteCount = remoteSubscriptions.length
    
    // Find conflicts
    const conflicts = findConflicts(combinedSubscriptions, remoteSubscriptions)
    result.conflicts = conflicts
    
    // Resolve conflicts
    const resolvedSubscriptions = await resolveConflicts(combinedSubscriptions, conflicts, opts)
    
    // Batch sync to Supabase honoring batchSize
    const batchSize = Math.max(1, opts.batchSize)
    let totalSynced = 0
    for (let i = 0; i < resolvedSubscriptions.length; i += batchSize) {
      const slice = resolvedSubscriptions.slice(i, i + batchSize)
      const batchResult = await SupabaseDataAccess.batchCreateSubscriptions(slice)
      if (batchResult.success) {
        totalSynced += batchResult.data?.length || 0
      } else {
        result.errors.push(batchResult.error?.message || `Failed to sync batch starting at ${i}`)
      }
    }
    result.syncedCount = totalSynced
    result.success = totalSynced > 0 && result.errors.length === 0
    
  } catch (error) {
    result.errors.push(error instanceof Error ? error.message : 'Unknown error')
  }
  
  result.duration = performance.now() - startTime
  return result
}

/**
 * Sync from Supabase to localStorage
 */
export async function syncFromSupabase(options: Partial<SyncOptions> = {}): Promise<SyncResult> {
  const startTime = performance.now()
  const opts = { ...DEFAULT_SYNC_OPTIONS, ...options }
  
  const result: SyncResult = {
    success: false,
    localCount: 0,
    remoteCount: 0,
    syncedCount: 0,
    conflicts: [],
    errors: [],
    duration: 0
  }
  
  try {
    // Get remote subscriptions
    const remoteResult = await SupabaseDataAccess.readAllSubscriptions()
    if (!remoteResult.success) {
      result.errors.push(remoteResult.error?.message || 'Failed to get remote subscriptions')
      result.duration = performance.now() - startTime
      return result
    }
    
    const remoteSubscriptions = remoteResult.data || []
    result.remoteCount = remoteSubscriptions.length
    
    if (remoteSubscriptions.length === 0) {
      result.success = true
      result.duration = performance.now() - startTime
      return result
    }
    
    // Get local subscriptions
    const localSubscriptions = getLocalSubscriptions()
    result.localCount = localSubscriptions.length
    
    // Find conflicts
    const conflicts = findConflicts(localSubscriptions, remoteSubscriptions)
    result.conflicts = conflicts
    
    // Resolve conflicts
    const resolvedSubscriptions = await resolveConflicts(remoteSubscriptions, conflicts, opts)
    
    // Save to localStorage
    const saved = saveLocalSubscriptions(resolvedSubscriptions)
    if (saved) {
      result.syncedCount = resolvedSubscriptions.length
      result.success = true
    } else {
      result.errors.push('Failed to save to localStorage')
    }
    
  } catch (error) {
    result.errors.push(error instanceof Error ? error.message : 'Unknown error')
  }
  
  result.duration = performance.now() - startTime
  return result
}

/**
 * Two-way sync between localStorage and Supabase
 */
export async function syncBidirectional(options: Partial<SyncOptions> = {}): Promise<SyncResult> {
  const startTime = performance.now()
  const opts = { ...DEFAULT_SYNC_OPTIONS, ...options }
  
  const result: SyncResult = {
    success: false,
    localCount: 0,
    remoteCount: 0,
    syncedCount: 0,
    conflicts: [],
    errors: [],
    duration: 0
  }
  
  try {
    // Get both local and remote subscriptions
    const [localSubscriptions, remoteResult] = await Promise.all([
      Promise.resolve(getLocalSubscriptions()),
      SupabaseDataAccess.readAllSubscriptions()
    ])
    
    if (!remoteResult.success) {
      result.errors.push(remoteResult.error?.message || 'Failed to get remote subscriptions')
      result.duration = performance.now() - startTime
      return result
    }
    
    const remoteSubscriptions = remoteResult.data || []
    result.localCount = localSubscriptions.length
    result.remoteCount = remoteSubscriptions.length
    
    // Find conflicts
    const conflicts = findConflicts(localSubscriptions, remoteSubscriptions)
    result.conflicts = conflicts
    
    // Merge subscriptions
    const mergedSubscriptions = mergeSubscriptions(localSubscriptions, remoteSubscriptions, conflicts, opts)
    
    // Save to both localStorage and Supabase
    const [localSaved, remoteResult2] = await Promise.all([
      Promise.resolve(saveLocalSubscriptions(mergedSubscriptions)),
      SupabaseDataAccess.batchCreateSubscriptions(mergedSubscriptions)
    ])
    
    if (localSaved && remoteResult2.success) {
      result.syncedCount = mergedSubscriptions.length
      result.success = true
    } else {
      if (!localSaved) {
        result.errors.push('Failed to save to localStorage')
      }
      if (!remoteResult2.success) {
        result.errors.push(remoteResult2.error?.message || 'Failed to save to Supabase')
      }
    }
    
  } catch (error) {
    result.errors.push(error instanceof Error ? error.message : 'Unknown error')
  }
  
  result.duration = performance.now() - startTime
  return result
}

/**
 * Find conflicts between local and remote subscriptions
 */
function findConflicts(local: Subscription[], remote: Subscription[]): Conflict[] {
  const conflicts: Conflict[] = []
  
  for (const localSub of local) {
    const remoteSub = remote.find(r => r.id === localSub.id)
    if (remoteSub && !areSubscriptionsEqual(localSub, remoteSub)) {
      conflicts.push({
        id: localSub.id,
        local: localSub,
        remote: remoteSub,
        resolution: 'skip'
      })
    }
  }
  
  return conflicts
}

/**
 * Check if two subscriptions are equal
 */
function areSubscriptionsEqual(a: Subscription, b: Subscription): boolean {
  return JSON.stringify(a) === JSON.stringify(b)
}

/**
 * Resolve conflicts based on options
 */
async function resolveConflicts(
  baseSubscriptions: Subscription[],
  conflicts: Conflict[],
  options: SyncOptions
): Promise<Subscription[]> {
  const resolved: Subscription[] = [...baseSubscriptions]
  
  for (const conflict of conflicts) {
    let resolution = options.resolveConflicts
    
    if (resolution === 'prompt' && options.onConflict) {
      resolution = await options.onConflict(conflict)
    }
    
    switch (resolution) {
      case 'local':
        // Keep local version
        break
      case 'remote':
        // Use remote version
        const remoteIndex = resolved.findIndex(s => s.id === conflict.id)
        if (remoteIndex !== -1) {
          resolved[remoteIndex] = conflict.remote
        }
        break
      case 'skip':
        // Skip this conflict
        break
    }
  }
  
  return resolved
}

/**
 * Merge two subscriptions
 */
function mergeSubscription(local: Subscription, remote: Subscription): Subscription {
  // Use the most recent version of each field
  const merged: Subscription = { ...local }
  
  // Compare timestamps if available
  const localTime = local.last_used?.getTime() || 0
  const remoteTime = remote.last_used?.getTime() || 0
  
  if (remoteTime > localTime) {
    // Remote is newer, use remote values
    return { ...remote, ...local }
  } else {
    // Local is newer, use local values
    return { ...local, ...remote }
  }
}

/**
 * Merge subscriptions from both sources
 */
function mergeSubscriptions(
  local: Subscription[],
  remote: Subscription[],
  conflicts: Conflict[],
  options: SyncOptions
): Subscription[] {
  const merged: Subscription[] = []
  const processedIds = new Set<string>()
  
  // Add all local subscriptions
  for (const sub of local) {
    merged.push(sub)
    processedIds.add(sub.id)
  }
  
  // Add remote subscriptions that don't exist locally
  for (const sub of remote) {
    if (!processedIds.has(sub.id)) {
      merged.push(sub)
      processedIds.add(sub.id)
    }
  }
  
  return merged
}

/**
 * Migration utility: Move data from localStorage to Supabase
 */
export async function migrateToSupabase(): Promise<{
  success: boolean
  migrated: number
  errors: string[]
}> {
  const result = {
    success: false,
    migrated: 0,
    errors: [] as string[]
  }
  
  try {
    const localSubscriptions = getLocalSubscriptions()
    
    if (localSubscriptions.length === 0) {
      result.success = true
      return result
    }
    
    const syncResult = await syncToSupabase({
      resolveConflicts: 'local',
      batchSize: 5
    })
    
    result.success = syncResult.success
    result.migrated = syncResult.syncedCount
    result.errors = syncResult.errors
    
  } catch (error) {
    result.errors.push(error instanceof Error ? error.message : 'Migration failed')
  }
  
  return result
}

/**
 * Backup utility: Export data from Supabase
 */
export async function backupFromSupabase(): Promise<{
  success: boolean
  data: Subscription[]
  errors: string[]
}> {
  const result = {
    success: false,
    data: [] as Subscription[],
    errors: [] as string[]
  }
  
  try {
    const remoteResult = await SupabaseDataAccess.readAllSubscriptions()
    
    if (remoteResult.success && remoteResult.data) {
      result.success = true
      result.data = remoteResult.data
    } else {
      result.errors.push(remoteResult.error?.message || 'Failed to backup data')
    }
    
  } catch (error) {
    result.errors.push(error instanceof Error ? error.message : 'Backup failed')
  }
  
  return result
}

// Export all functions
export const SupabaseSync = {
  syncToSupabase,
  syncFromSupabase,
  syncBidirectional,
  migrateToSupabase,
  backupFromSupabase,
  getLocalSubscriptions,
  saveLocalSubscriptions
}

/**
 * Supabase Type Mapping Utilities
 * 
 * Handles transformation between localStorage Subscription format and Supabase database format
 */

import { Database } from '@/types/supabase'
import { Subscription } from '@/types/subscription'

// Extract Supabase types
export type SupabaseSubscription = Database['public']['Tables']['subscriptions']['Row']
export type SupabaseSubscriptionInsert = Database['public']['Tables']['subscriptions']['Insert']
export type SupabaseSubscriptionUpdate = Database['public']['Tables']['subscriptions']['Update']

// Relationship table types
export type SupabaseTag = Database['public']['Tables']['subscription_tags']['Row']
export type SupabaseAlternative = Database['public']['Tables']['subscription_alternatives']['Row']
export type SupabaseApiKey = Database['public']['Tables']['subscription_api_keys']['Row']
export type SupabasePromoCode = Database['public']['Tables']['subscription_previous_promocodes']['Row']
export type SupabaseAccountEmail = Database['public']['Tables']['subscription_previous_accountemails']['Row']

// View types
export type SupabaseSubscriptionFull = Database['public']['Views']['subscriptions_full']['Row']
export type SupabaseActiveSubscriptionsMonthlyCost = Database['public']['Views']['active_subscriptions_monthly_cost']['Row']
export type SupabaseSubscriptionsExpiringSoon = Database['public']['Views']['subscriptions_expiring_soon']['Row']

/**
 * Transform localStorage Subscription to Supabase format
 */
export function subscriptionToSupabase(subscription: Subscription): SupabaseSubscriptionInsert {
  return {
    id: subscription.id,
    name: subscription.name,
    plan: subscription.plan,
    cost: subscription.cost,
    currency: subscription.currency,
    billing_cycle: subscription.billing_cycle,
    category: subscription.category,
    subcategory: subscription.subcategory || null,
    description: subscription.description,
    url: subscription.url,
    status: subscription.status,
    account_email: subscription.account_email,
    notes: subscription.notes || null,
    renewal_date: subscription.renewal_date.toISOString(),
    start_date: subscription.start_date.toISOString(),
    usage_importance: subscription.usage_importance,
    usage_frequency: subscription.usage_frequency,
    auto_renew: subscription.auto_renew,
    logo_url: subscription.logo_url || null,
    fallback_icon: subscription.fallback_icon || null,
    safe_for_work: subscription.safe_for_work || null,
    china_region_only: subscription.china_region_only || null,
    a16z_rank: subscription.a16z_rank || null,
    secret_key: subscription.secret_key || null,
    latest_promocode: subscription.latest_promocode || null,
    last_used: subscription.last_used?.toISOString() || null,
  }
}

/**
 * Transform Supabase subscription to localStorage format
 */
export function supabaseToSubscription(supabaseSub: SupabaseSubscription): Subscription {
  return {
    id: supabaseSub.id,
    name: supabaseSub.name,
    plan: supabaseSub.plan || '',
    logo: supabaseSub.logo_url || '', // Map logo_url back to logo field for compatibility
    cost: supabaseSub.cost,
    currency: supabaseSub.currency || 'USD',
    billing_cycle: supabaseSub.billing_cycle as Subscription['billing_cycle'],
    category: supabaseSub.category as Subscription['category'],
    subcategory: supabaseSub.subcategory || undefined,
    description: supabaseSub.description || '',
    url: supabaseSub.url || '',
    status: supabaseSub.status as Subscription['status'],
    account_email: supabaseSub.account_email || '',
    notes: supabaseSub.notes || undefined,
    renewal_date: new Date(supabaseSub.renewal_date),
    start_date: new Date(supabaseSub.start_date),
    usage_importance: supabaseSub.usage_importance as Subscription['usage_importance'],
    usage_frequency: supabaseSub.usage_frequency as Subscription['usage_frequency'],
    auto_renew: supabaseSub.auto_renew || false,
    logo_url: supabaseSub.logo_url || undefined,
    fallback_icon: supabaseSub.fallback_icon || undefined,
    safe_for_work: supabaseSub.safe_for_work || undefined,
    china_region_only: supabaseSub.china_region_only || undefined,
    a16z_rank: supabaseSub.a16z_rank || undefined,
    secret_key: supabaseSub.secret_key || undefined,
    latest_promocode: supabaseSub.latest_promocode || undefined,
    last_used: supabaseSub.last_used ? new Date(supabaseSub.last_used) : undefined,
    // These will be populated from relationship tables
    tags: [],
    alternative_services: [],
    api_access_keys: [],
    previously_used_promotion_code: [],
    account_emails_used_previously: [],
  }
}

/**
 * Transform Supabase full subscription (with relationships) to localStorage format
 */
export function supabaseFullToSubscription(supabaseFull: SupabaseSubscriptionFull): Subscription {
  // Cast through unknown to align view row type with table row type expectations
  const baseSubscription = supabaseToSubscription(supabaseFull as unknown as SupabaseSubscription)
  
  // Add relationship data
  return {
    ...baseSubscription,
    tags: (supabaseFull.tags as string[]) || [],
    alternative_services: (supabaseFull.alternatives as string[]) || [],
    api_access_keys: (supabaseFull.api_keys as string[]) || [],
    previously_used_promotion_code: (supabaseFull.promotions as string[]) || [],
    account_emails_used_previously: (supabaseFull.emails as string[]) || [],
  }
}

/**
 * Create relationship records for a subscription
 */
export function createSubscriptionRelationships(
  subscriptionId: string,
  subscription: Subscription
): {
  tags: SupabaseTag[]
  alternatives: SupabaseAlternative[]
  apiKeys: SupabaseApiKey[]
  promoCodes: SupabasePromoCode[]
  accountEmails: SupabaseAccountEmail[]
} {
  return {
    tags: (subscription.tags || []).map(tag => ({
      id: crypto.randomUUID(),
      subscription_id: subscriptionId,
      tag,
      created_at: new Date().toISOString(),
    })),
    alternatives: (subscription.alternative_services || []).map((service: string) => ({
      id: crypto.randomUUID(),
      subscription_id: subscriptionId,
      service_name: service,
      created_at: new Date().toISOString(),
    })),
    apiKeys: (subscription.api_access_keys || []).map((key: string, index: number) => ({
      id: crypto.randomUUID(),
      subscription_id: subscriptionId,
      key_name: `API Key ${index + 1}`,
      key_value: key,
      created_at: new Date().toISOString(),
    })),
    promoCodes: (subscription.previously_used_promotion_code || []).map((code: string) => ({
      id: crypto.randomUUID(),
      subscription_id: subscriptionId,
      promo_code: code,
      used_at: new Date().toISOString(),
    })),
    accountEmails: (subscription.account_emails_used_previously || []).map((email: string) => ({
      id: crypto.randomUUID(),
      subscription_id: subscriptionId,
      email,
      used_at: new Date().toISOString(),
    })),
  }
}

/**
 * Type guards for runtime validation
 */
export function isValidSupabaseSubscription(data: unknown): data is SupabaseSubscription {
  return (
    typeof data === 'object' &&
    data !== null &&
    'id' in data &&
    'name' in data &&
    'cost' in data &&
    'billing_cycle' in data &&
    'category' in data &&
    'status' in data
  )
}

export function isValidSubscription(data: unknown): data is Subscription {
  return (
    typeof data === 'object' &&
    data !== null &&
    'id' in data &&
    'name' in data &&
    'cost' in data &&
    'billingCycle' in data &&
    'category' in data &&
    'status' in data
  )
}

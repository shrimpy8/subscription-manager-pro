/**
 * Supabase Query Testing & Validation
 * 
 * Comprehensive test suite for all CRUD operations with Supabase
 * Validates data transformation and relationship queries
 */

import { supabase, supabaseAdmin } from './supabase'
import { 
  subscriptionToSupabase, 
  supabaseToSubscription, 
  supabaseFullToSubscription,
  createSubscriptionRelationships,
  SupabaseSubscription,
  SupabaseTag,
  SupabaseAlternative,
  SupabaseApiKey,
  SupabasePromoCode,
  SupabaseAccountEmail
} from './supabase-types'
import { Subscription } from '@/types/subscription'

// Test result interface
export interface TestResult<T = unknown> {
  success: boolean
  operation: string
  duration: number
  data?: T
  error?: string
}

export interface TestSuite {
  crud: {
    create: TestResult
    read: TestResult
    update: TestResult
    delete: TestResult
  }
  relationships: {
    tags: TestResult
    alternatives: TestResult
    apiKeys: TestResult
    promoCodes: TestResult
    accountEmails: TestResult
  }
  views: {
    full: TestResult
    monthlyCost: TestResult
    expiringSoon: TestResult
  }
  performance: {
    createTime: number
    readTime: number
    updateTime: number
    deleteTime: number
  }
}

/**
 * Test CREATE operation
 */
export async function testCreateSubscription(subscription: Subscription): Promise<TestResult> {
  const startTime = performance.now()
  
  try {
    // Transform to Supabase format
    const supabaseData = subscriptionToSupabase(subscription)
    
    // Insert subscription
    const { data, error } = await supabase
      .from('subscriptions')
      .insert(supabaseData)
      .select()
      .single()
    
    if (error) {
      throw new Error(`Create failed: ${error.message}`)
    }
    
    // Create relationships
    const relationships = createSubscriptionRelationships(subscription.id, subscription)
    
    // Insert tags
    if (relationships.tags.length > 0) {
      const { error: tagsError } = await supabase
        .from('subscription_tags')
        .insert(relationships.tags)
      
      if (tagsError) {
        console.warn('Tags insert failed:', tagsError.message)
      }
    }
    
    // Insert alternatives
    if (relationships.alternatives.length > 0) {
      const { error: alternativesError } = await supabase
        .from('subscription_alternatives')
        .insert(relationships.alternatives)
      
      if (alternativesError) {
        console.warn('Alternatives insert failed:', alternativesError.message)
      }
    }
    
    // Insert API keys
    if (relationships.apiKeys.length > 0) {
      const { error: apiKeysError } = await supabase
        .from('subscription_api_keys')
        .insert(relationships.apiKeys)
      
      if (apiKeysError) {
        console.warn('API keys insert failed:', apiKeysError.message)
      }
    }
    
    // Insert promo codes
    if (relationships.promoCodes.length > 0) {
      const { error: promoCodesError } = await supabase
        .from('subscription_promo_codes')
        .insert(relationships.promoCodes)
      
      if (promoCodesError) {
        console.warn('Promo codes insert failed:', promoCodesError.message)
      }
    }
    
    // Insert account emails
    if (relationships.accountEmails.length > 0) {
      const { error: accountEmailsError } = await supabase
        .from('subscription_account_emails')
        .insert(relationships.accountEmails)
      
      if (accountEmailsError) {
        console.warn('Account emails insert failed:', accountEmailsError.message)
      }
    }
    
    const duration = performance.now() - startTime
    
    return {
      success: true,
      operation: 'CREATE',
      duration,
      data: data
    }
    
  } catch (error) {
    const duration = performance.now() - startTime
    
    return {
      success: false,
      operation: 'CREATE',
      duration,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Test READ operation
 */
export async function testReadSubscription(id: string): Promise<TestResult> {
  const startTime = performance.now()
  
  try {
    // Read basic subscription
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('id', id)
      .single()
    
    if (subError) {
      throw new Error(`Read subscription failed: ${subError.message}`)
    }
    
    // Read relationships
    const { data: tags } = await supabase
      .from('subscription_tags')
      .select('tag')
      .eq('subscription_id', id)
    
    const { data: alternatives } = await supabase
      .from('subscription_alternatives')
      .select('service_name')
      .eq('subscription_id', id)
    
    const { data: apiKeys } = await supabase
      .from('subscription_api_keys')
      .select('key_name, key_value')
      .eq('subscription_id', id)
    
    const { data: promoCodes } = await supabase
      .from('subscription_promo_codes')
      .select('promo_code')
      .eq('subscription_id', id)
    
    const { data: accountEmails } = await supabase
      .from('subscription_account_emails')
      .select('email')
      .eq('subscription_id', id)
    
    // Transform back to localStorage format
    const fullSubscription = {
      ...subscription,
      tags: tags?.map((t: { tag: string }) => t.tag) || [],
      alternative_services: alternatives?.map((a: { service_name: string }) => a.service_name) || [],
      api_access_keys: apiKeys?.map((k: { key_value: string }) => k.key_value) || [],
      previously_used_promotion_code: promoCodes?.map((p: { promo_code: string }) => p.promo_code) || [],
      account_emails_used_previously: accountEmails?.map((e: { email: string }) => e.email) || []
    }
    
    const transformedSubscription = supabaseToSubscription(subscription)
    
    const duration = performance.now() - startTime
    
    return {
      success: true,
      operation: 'READ',
      duration,
      data: {
        subscription: transformedSubscription,
        relationships: {
          tags: tags?.length || 0,
          alternatives: alternatives?.length || 0,
          apiKeys: apiKeys?.length || 0,
          promoCodes: promoCodes?.length || 0,
          accountEmails: accountEmails?.length || 0
        }
      }
    }
    
  } catch (error) {
    const duration = performance.now() - startTime
    
    return {
      success: false,
      operation: 'READ',
      duration,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Test UPDATE operation
 */
export async function testUpdateSubscription(id: string, updates: Partial<Subscription>): Promise<TestResult> {
  const startTime = performance.now()
  
  try {
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
      throw new Error(`Update failed: ${error.message}`)
    }
    
    const duration = performance.now() - startTime
    
    return {
      success: true,
      operation: 'UPDATE',
      duration,
      data: data
    }
    
  } catch (error) {
    const duration = performance.now() - startTime
    
    return {
      success: false,
      operation: 'UPDATE',
      duration,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Test DELETE operation
 */
export async function testDeleteSubscription(id: string): Promise<TestResult> {
  const startTime = performance.now()
  
  try {
    // Delete subscription (relationships will cascade delete)
    const { error } = await supabase
      .from('subscriptions')
      .delete()
      .eq('id', id)
    
    if (error) {
      throw new Error(`Delete failed: ${error.message}`)
    }
    
    const duration = performance.now() - startTime
    
    return {
      success: true,
      operation: 'DELETE',
      duration,
      data: { deleted: true }
    }
    
  } catch (error) {
    const duration = performance.now() - startTime
    
    return {
      success: false,
      operation: 'DELETE',
      duration,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Test relationship queries
 */
export async function testRelationshipQueries(subscriptionId: string): Promise<{
  tags: TestResult
  alternatives: TestResult
  apiKeys: TestResult
  promoCodes: TestResult
  accountEmails: TestResult
}> {
  const testTagQuery = async (): Promise<TestResult> => {
    const startTime = performance.now()
    try {
      const { data, error } = await supabase
        .from('subscription_tags')
        .select('*')
        .eq('subscription_id', subscriptionId)
      
      if (error) throw error
      
      return {
        success: true,
        operation: 'TAGS_QUERY',
        duration: performance.now() - startTime,
        data: data
      }
    } catch (error) {
      return {
        success: false,
        operation: 'TAGS_QUERY',
        duration: performance.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }
  
  const testAlternativesQuery = async (): Promise<TestResult> => {
    const startTime = performance.now()
    try {
      const { data, error } = await supabase
        .from('subscription_alternatives')
        .select('*')
        .eq('subscription_id', subscriptionId)
      
      if (error) throw error
      
      return {
        success: true,
        operation: 'ALTERNATIVES_QUERY',
        duration: performance.now() - startTime,
        data: data
      }
    } catch (error) {
      return {
        success: false,
        operation: 'ALTERNATIVES_QUERY',
        duration: performance.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }
  
  const testApiKeysQuery = async (): Promise<TestResult> => {
    const startTime = performance.now()
    try {
      const { data, error } = await supabase
        .from('subscription_api_keys')
        .select('*')
        .eq('subscription_id', subscriptionId)
      
      if (error) throw error
      
      return {
        success: true,
        operation: 'API_KEYS_QUERY',
        duration: performance.now() - startTime,
        data: data
      }
    } catch (error) {
      return {
        success: false,
        operation: 'API_KEYS_QUERY',
        duration: performance.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }
  
  const testPromoCodesQuery = async (): Promise<TestResult> => {
    const startTime = performance.now()
    try {
      const { data, error } = await supabase
        .from('subscription_promo_codes')
        .select('*')
        .eq('subscription_id', subscriptionId)
      
      if (error) throw error
      
      return {
        success: true,
        operation: 'PROMO_CODES_QUERY',
        duration: performance.now() - startTime,
        data: data
      }
    } catch (error) {
      return {
        success: false,
        operation: 'PROMO_CODES_QUERY',
        duration: performance.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }
  
  const testAccountEmailsQuery = async (): Promise<TestResult> => {
    const startTime = performance.now()
    try {
      const { data, error } = await supabase
        .from('subscription_account_emails')
        .select('*')
        .eq('subscription_id', subscriptionId)
      
      if (error) throw error
      
      return {
        success: true,
        operation: 'ACCOUNT_EMAILS_QUERY',
        duration: performance.now() - startTime,
        data: data
      }
    } catch (error) {
      return {
        success: false,
        operation: 'ACCOUNT_EMAILS_QUERY',
        duration: performance.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }
  
  return {
    tags: await testTagQuery(),
    alternatives: await testAlternativesQuery(),
    apiKeys: await testApiKeysQuery(),
    promoCodes: await testPromoCodesQuery(),
    accountEmails: await testAccountEmailsQuery()
  }
}

/**
 * Test view queries
 */
export async function testViewQueries(): Promise<{
  full: TestResult
  monthlyCost: TestResult
  expiringSoon: TestResult
}> {
  const testFullView = async (): Promise<TestResult> => {
    const startTime = performance.now()
    try {
      const { data, error } = await supabase
        .from('subscriptions_full')
        .select('*')
        .limit(5)
      
      if (error) throw error
      
      return {
        success: true,
        operation: 'FULL_VIEW_QUERY',
        duration: performance.now() - startTime,
        data: data
      }
    } catch (error) {
      return {
        success: false,
        operation: 'FULL_VIEW_QUERY',
        duration: performance.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }
  
  const testMonthlyCostView = async (): Promise<TestResult> => {
    const startTime = performance.now()
    try {
      const { data, error } = await supabase
        .from('active_subscriptions_monthly_cost')
        .select('*')
        .limit(5)
      
      if (error) throw error
      
      return {
        success: true,
        operation: 'MONTHLY_COST_VIEW_QUERY',
        duration: performance.now() - startTime,
        data: data
      }
    } catch (error) {
      return {
        success: false,
        operation: 'MONTHLY_COST_VIEW_QUERY',
        duration: performance.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }
  
  const testExpiringSoonView = async (): Promise<TestResult> => {
    const startTime = performance.now()
    try {
      const { data, error } = await supabase
        .from('subscriptions_expiring_soon')
        .select('*')
        .limit(5)
      
      if (error) throw error
      
      return {
        success: true,
        operation: 'EXPIRING_SOON_VIEW_QUERY',
        duration: performance.now() - startTime,
        data: data
      }
    } catch (error) {
      return {
        success: false,
        operation: 'EXPIRING_SOON_VIEW_QUERY',
        duration: performance.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }
  
  return {
    full: await testFullView(),
    monthlyCost: await testMonthlyCostView(),
    expiringSoon: await testExpiringSoonView()
  }
}

/**
 * Run comprehensive test suite
 */
export async function runSupabaseTestSuite(): Promise<TestSuite> {
  console.log('🧪 Starting Supabase Test Suite...')
  
  // Create test subscription
  const testSubscription: Subscription = {
    id: 'test-supabase-' + Date.now(),
    name: 'Supabase Test Service',
    plan: 'Pro',
    logo: 'test-logo.png',
    cost: 29.99,
    currency: 'USD',
    billing_cycle: 'Monthly',
    category: 'AI Tools',
    subcategory: 'Chat',
    description: 'Test subscription for Supabase validation',
    url: 'https://test-supabase.com',
    status: 'active',
    account_email: 'test@supabase.com',
    promo_code: 'TEST20',
    promo_discount: 20,
    notes: 'Test notes for Supabase',
    renewal_date: new Date('2024-12-01'),
    start_date: new Date('2024-01-01'),
    usage_importance: 'high',
    usage_frequency: 'daily',
    auto_renew: true,
    logo_url: 'https://test-supabase.com/logo.png',
    fallback_icon: 'test-icon',
    safe_for_work: true,
    china_region_only: false,
    a16z_rank: 15,
    secret_key: 'secret123',
    latest_promocode: 'TEST20',
    last_used: new Date('2024-10-01'),
    tags: ['AI', 'Productivity', 'Test'],
    alternative_services: ['Alternative 1', 'Alternative 2'],
    api_access_keys: ['key1', 'key2'],
    previously_used_promotion_code: ['OLD20', 'SAVE10'],
    account_emails_used_previously: ['old@example.com', 'previous@example.com']
  }
  
  try {
    // Test CRUD operations
    console.log('📝 Testing CRUD operations...')
    const createResult = await testCreateSubscription(testSubscription)
    const readResult = await testReadSubscription(testSubscription.id)
    const updateResult = await testUpdateSubscription(testSubscription.id, { 
      name: 'Updated Test Service',
      cost: 39.99 
    })
    const deleteResult = await testDeleteSubscription(testSubscription.id)
    
    // Test relationships
    console.log('🔗 Testing relationship queries...')
    const relationshipResults = await testRelationshipQueries(testSubscription.id)
    
    // Test views
    console.log('👁️ Testing view queries...')
    const viewResults = await testViewQueries()
    
    const testSuite: TestSuite = {
      crud: {
        create: createResult,
        read: readResult,
        update: updateResult,
        delete: deleteResult
      },
      relationships: relationshipResults,
      views: viewResults,
      performance: {
        createTime: createResult.duration,
        readTime: readResult.duration,
        updateTime: updateResult.duration,
        deleteTime: deleteResult.duration
      }
    }
    
    console.log('✅ Supabase Test Suite completed!')
    console.log('📊 Results:', testSuite)
    
    return testSuite
    
  } catch (error) {
    console.error('❌ Supabase Test Suite failed:', error)
    throw error
  }
}

// Make it available globally for testing
if (typeof window !== 'undefined') {
  window.runSupabaseTestSuite = runSupabaseTestSuite
}

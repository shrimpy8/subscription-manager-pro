/**
 * Test Suite for Supabase Data Access Layer
 * 
 * Comprehensive testing of all data access functions
 */

import { SupabaseDataAccess } from './supabase-data'
import { Subscription } from '@/types/subscription'

// Test result interface
export interface TestResult {
  test: string
  success: boolean
  duration: number
  error?: string
  data?: unknown
}

export interface TestSuite {
  crud: TestResult[]
  queries: TestResult[]
  batch: TestResult[]
  utility: TestResult[]
  summary: {
    total: number
    passed: number
    failed: number
    duration: number
  }
}

/**
 * Create test subscription
 */
function createTestSubscription(id: string): Subscription {
  return {
    id,
    name: `Test Service ${id}`,
    plan: 'Pro',
    logo: 'test-logo.png',
    cost: 29.99,
    currency: 'USD',
    billing_cycle: 'Monthly',
    category: 'AI Tools',
    subcategory: 'Chat',
    description: `Test subscription ${id} for Supabase validation`,
    url: `https://test-${id}.com`,
    status: 'active',
    account_email: `test-${id}@supabase.com`,
    promo_code: 'TEST20',
    promo_discount: 20,
    notes: `Test notes for ${id}`,
    renewal_date: new Date('2024-12-01'),
    start_date: new Date('2024-01-01'),
    usage_importance: 'high',
    usage_frequency: 'daily',
    auto_renew: true,
    logo_url: `https://test-${id}.com/logo.png`,
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
}

/**
 * Test CRUD operations
 */
async function testCRUDOperations(): Promise<TestResult[]> {
  const results: TestResult[] = []
  const testId = 'test-crud-' + Date.now()
  
  // Test Create
  const createStart = performance.now()
  try {
    const testSub = createTestSubscription(testId)
    const result = await SupabaseDataAccess.createSubscription(testSub)
    
    results.push({
      test: 'CREATE',
      success: result.success,
      duration: performance.now() - createStart,
      error: result.error?.message,
      data: result.data
    })
  } catch (error) {
    results.push({
      test: 'CREATE',
      success: false,
      duration: performance.now() - createStart,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
  
  // Test Read
  const readStart = performance.now()
  try {
    const result = await SupabaseDataAccess.readSubscription(testId)
    
    results.push({
      test: 'READ',
      success: result.success,
      duration: performance.now() - readStart,
      error: result.error?.message,
      data: result.data
    })
  } catch (error) {
    results.push({
      test: 'READ',
      success: false,
      duration: performance.now() - readStart,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
  
  // Test Update
  const updateStart = performance.now()
  try {
    const result = await SupabaseDataAccess.updateSubscription(testId, {
      name: 'Updated Test Service',
      cost: 39.99
    })
    
    results.push({
      test: 'UPDATE',
      success: result.success,
      duration: performance.now() - updateStart,
      error: result.error?.message,
      data: result.data
    })
  } catch (error) {
    results.push({
      test: 'UPDATE',
      success: false,
      duration: performance.now() - updateStart,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
  
  // Test Delete
  const deleteStart = performance.now()
  try {
    const result = await SupabaseDataAccess.deleteSubscription(testId)
    
    results.push({
      test: 'DELETE',
      success: result.success,
      duration: performance.now() - deleteStart,
      error: result.error?.message,
      data: result.data
    })
  } catch (error) {
    results.push({
      test: 'DELETE',
      success: false,
      duration: performance.now() - deleteStart,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
  
  return results
}

/**
 * Test query operations
 */
async function testQueryOperations(): Promise<TestResult[]> {
  const results: TestResult[] = []
  
  // Test Read All
  const readAllStart = performance.now()
  try {
    const result = await SupabaseDataAccess.readAllSubscriptions({ limit: 5 })
    
    results.push({
      test: 'READ_ALL',
      success: result.success,
      duration: performance.now() - readAllStart,
      error: result.error?.message,
      data: result.data
    })
  } catch (error) {
    results.push({
      test: 'READ_ALL',
      success: false,
      duration: performance.now() - readAllStart,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
  
  // Test Search
  const searchStart = performance.now()
  try {
    const result = await SupabaseDataAccess.searchSubscriptions('test')
    
    results.push({
      test: 'SEARCH',
      success: result.success,
      duration: performance.now() - searchStart,
      error: result.error?.message,
      data: result.data
    })
  } catch (error) {
    results.push({
      test: 'SEARCH',
      success: false,
      duration: performance.now() - searchStart,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
  
  // Test Expiring Soon
  const expiringStart = performance.now()
  try {
    const result = await SupabaseDataAccess.getExpiringSubscriptions(30)
    
    results.push({
      test: 'EXPIRING_SOON',
      success: result.success,
      duration: performance.now() - expiringStart,
      error: result.error?.message,
      data: result.data
    })
  } catch (error) {
    results.push({
      test: 'EXPIRING_SOON',
      success: false,
      duration: performance.now() - expiringStart,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
  
  // Test Monthly Cost
  const costStart = performance.now()
  try {
    const result = await SupabaseDataAccess.getActiveSubscriptionsMonthlyCost()
    
    results.push({
      test: 'MONTHLY_COST',
      success: result.success,
      duration: performance.now() - costStart,
      error: result.error?.message,
      data: result.data
    })
  } catch (error) {
    results.push({
      test: 'MONTHLY_COST',
      success: false,
      duration: performance.now() - costStart,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
  
  return results
}

/**
 * Test batch operations
 */
async function testBatchOperations(): Promise<TestResult[]> {
  const results: TestResult[] = []
  
  // Test Batch Create
  const batchStart = performance.now()
  try {
    const testSubs = [
      createTestSubscription('batch-1-' + Date.now()),
      createTestSubscription('batch-2-' + Date.now()),
      createTestSubscription('batch-3-' + Date.now())
    ]
    
    const result = await SupabaseDataAccess.batchCreateSubscriptions(testSubs)
    
    results.push({
      test: 'BATCH_CREATE',
      success: result.success,
      duration: performance.now() - batchStart,
      error: result.error?.message,
      data: result.data
    })
    
    // Clean up batch test data
    if (result.data) {
      await Promise.allSettled(
        result.data.map(sub => SupabaseDataAccess.deleteSubscription(sub.id))
      )
    }
    
  } catch (error) {
    results.push({
      test: 'BATCH_CREATE',
      success: false,
      duration: performance.now() - batchStart,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
  
  return results
}

/**
 * Test utility operations
 */
async function testUtilityOperations(): Promise<TestResult[]> {
  const results: TestResult[] = []
  
  // Test Health Check
  const healthStart = performance.now()
  try {
    const result = await SupabaseDataAccess.healthCheck()
    
    results.push({
      test: 'HEALTH_CHECK',
      success: result.success,
      duration: performance.now() - healthStart,
      error: result.error?.message,
      data: result.data
    })
  } catch (error) {
    results.push({
      test: 'HEALTH_CHECK',
      success: false,
      duration: performance.now() - healthStart,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
  
  return results
}

/**
 * Run comprehensive test suite
 */
export async function runSupabaseDataTestSuite(): Promise<TestSuite> {
  console.log('🧪 Starting Supabase Data Access Test Suite...')
  const startTime = performance.now()
  
  try {
    // Run all test categories
    const [crudResults, queryResults, batchResults, utilityResults] = await Promise.all([
      testCRUDOperations(),
      testQueryOperations(),
      testBatchOperations(),
      testUtilityOperations()
    ])
    
    const allResults = [...crudResults, ...queryResults, ...batchResults, ...utilityResults]
    const passed = allResults.filter(r => r.success).length
    const failed = allResults.filter(r => !r.success).length
    const totalDuration = performance.now() - startTime
    
    const testSuite: TestSuite = {
      crud: crudResults,
      queries: queryResults,
      batch: batchResults,
      utility: utilityResults,
      summary: {
        total: allResults.length,
        passed,
        failed,
        duration: totalDuration
      }
    }
    
    console.log('✅ Supabase Data Access Test Suite completed!')
    console.log('📊 Results:', testSuite)
    
    return testSuite
    
  } catch (error) {
    console.error('❌ Supabase Data Access Test Suite failed:', error)
    throw error
  }
}

// Make it available globally for testing
if (typeof window !== 'undefined') {
  (window as unknown as Record<string, unknown>).runSupabaseDataTestSuite = runSupabaseDataTestSuite
}

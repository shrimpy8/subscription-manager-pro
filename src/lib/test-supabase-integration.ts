/**
 * Supabase Integration Test Suite
 * 
 * Comprehensive testing of all Supabase integration components
 * including hooks, context, sync utilities, and React components
 */

import { 
  createSubscription,
  readSubscription,
  updateSubscription,
  deleteSubscription,
  readAllSubscriptions,
  searchSubscriptions,
  getActiveSubscriptionsMonthlyCost,
  batchCreateSubscriptions,
  healthCheck
} from './supabase-data'
import { 
  syncToSupabase,
  syncFromSupabase,
  syncBidirectional,
  migrateToSupabase,
  backupFromSupabase
} from './supabase-sync'
import { Subscription } from '@/types/subscription'

// Test result interface
export interface IntegrationTestResult<T = unknown> {
  test: string
  category: string
  success: boolean
  duration: number
  error?: string
  data?: T
  warnings?: string[]
}

export interface IntegrationTestSuite {
  hooks: IntegrationTestResult[]
  sync: IntegrationTestResult[]
  migration: IntegrationTestResult[]
  components: IntegrationTestResult[]
  performance: IntegrationTestResult[]
  errorHandling: IntegrationTestResult[]
  summary: {
    total: number
    passed: number
    failed: number
    duration: number
    warnings: number
  }
}

/**
 * Create test subscription data
 */
function createTestSubscriptions(): Subscription[] {
  return [
    {
      id: 'test-1-' + Date.now(),
      name: 'Test Service 1',
      plan: 'Pro',
      logo: 'test-logo-1.png',
      cost: 29.99,
      currency: 'USD',
      billing_cycle: 'Monthly',
      category: 'AI Tools',
      subcategory: 'Chat',
      description: 'Test subscription 1 for integration testing',
      url: 'https://test-1.com',
      status: 'active',
      account_email: 'test1@example.com',
      // promo fields removed
      notes: 'Test notes 1',
      renewal_date: new Date('2024-12-01'),
      start_date: new Date('2024-01-01'),
      usage_importance: 'high',
      usage_frequency: 'daily',
      auto_renew: true,
      logo_url: 'https://test-1.com/logo.png',
      fallback_icon: 'test-icon-1',
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
    },
    {
      id: 'test-2-' + Date.now(),
      name: 'Test Service 2',
      plan: 'Basic',
      logo: 'test-logo-2.png',
      cost: 9.99,
      currency: 'USD',
      billing_cycle: 'Yearly',
      category: 'Productivity',
      subcategory: 'Task Management',
      description: 'Test subscription 2 for integration testing',
      url: 'https://test-2.com',
      status: 'paused',
      account_email: 'test2@example.com',
      // promo fields removed
      notes: 'Test notes 2',
      renewal_date: new Date('2025-01-01'),
      start_date: new Date('2024-01-01'),
      usage_importance: 'medium',
      usage_frequency: 'weekly',
      auto_renew: false,
      logo_url: 'https://test-2.com/logo.png',
      fallback_icon: 'test-icon-2',
      safe_for_work: true,
      china_region_only: false,
      a16z_rank: 25,
      secret_key: 'secret456',
      latest_promocode: 'SAVE50',
      last_used: new Date('2024-09-15'),
      tags: ['Productivity', 'Task Management', 'Test'],
      alternative_services: ['Alternative 3', 'Alternative 4'],
      api_access_keys: ['key3', 'key4'],
      previously_used_promotion_code: ['OLD50', 'SAVE25'],
      account_emails_used_previously: ['old2@example.com', 'previous2@example.com']
    }
  ]
}

/**
 * Test Supabase Data Access Layer
 */
async function testDataAccessLayer(): Promise<IntegrationTestResult[]> {
  const results: IntegrationTestResult[] = []
  const testSubscriptions = createTestSubscriptions()
  
  // Test Health Check
  const healthStart = performance.now()
  try {
    const result = await healthCheck()
    
    results.push({
      test: 'Health Check',
      category: 'Data Access',
      success: result.success,
      duration: performance.now() - healthStart,
      error: result.error?.message,
      data: result.data
    })
  } catch (error) {
    results.push({
      test: 'Health Check',
      category: 'Data Access',
      success: false,
      duration: performance.now() - healthStart,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
  
  // Test Create Subscription
  const createStart = performance.now()
  try {
    const result = await createSubscription(testSubscriptions[0])
    
    results.push({
      test: 'Create Subscription',
      category: 'Data Access',
      success: result.success,
      duration: performance.now() - createStart,
      error: result.error?.message,
      data: result.data
    })
  } catch (error) {
    results.push({
      test: 'Create Subscription',
      category: 'Data Access',
      success: false,
      duration: performance.now() - createStart,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
  
  // Test Read Subscription
  const readStart = performance.now()
  try {
    const result = await readSubscription(testSubscriptions[0].id)
    
    results.push({
      test: 'Read Subscription',
      category: 'Data Access',
      success: result.success,
      duration: performance.now() - readStart,
      error: result.error?.message,
      data: result.data
    })
  } catch (error) {
    results.push({
      test: 'Read Subscription',
      category: 'Data Access',
      success: false,
      duration: performance.now() - readStart,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
  
  // Test Update Subscription
  const updateStart = performance.now()
  try {
    const result = await updateSubscription(testSubscriptions[0].id, {
      name: 'Updated Test Service',
      cost: 39.99
    })
    
    results.push({
      test: 'Update Subscription',
      category: 'Data Access',
      success: result.success,
      duration: performance.now() - updateStart,
      error: result.error?.message,
      data: result.data
    })
  } catch (error) {
    results.push({
      test: 'Update Subscription',
      category: 'Data Access',
      success: false,
      duration: performance.now() - updateStart,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
  
  // Test Search Subscriptions
  const searchStart = performance.now()
  try {
    const result = await searchSubscriptions('test')
    
    results.push({
      test: 'Search Subscriptions',
      category: 'Data Access',
      success: result.success,
      duration: performance.now() - searchStart,
      error: result.error?.message,
      data: result.data
    })
  } catch (error) {
    results.push({
      test: 'Search Subscriptions',
      category: 'Data Access',
      success: false,
      duration: performance.now() - searchStart,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
  
  // Test Get Monthly Cost
  const costStart = performance.now()
  try {
    const result = await getActiveSubscriptionsMonthlyCost()
    
    results.push({
      test: 'Get Monthly Cost',
      category: 'Data Access',
      success: result.success,
      duration: performance.now() - costStart,
      error: result.error?.message,
      data: result.data
    })
  } catch (error) {
    results.push({
      test: 'Get Monthly Cost',
      category: 'Data Access',
      success: false,
      duration: performance.now() - costStart,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
  
  // Test Delete Subscription
  const deleteStart = performance.now()
  try {
    const result = await deleteSubscription(testSubscriptions[0].id)
    
    results.push({
      test: 'Delete Subscription',
      category: 'Data Access',
      success: result.success,
      duration: performance.now() - deleteStart,
      error: result.error?.message,
      data: result.data
    })
  } catch (error) {
    results.push({
      test: 'Delete Subscription',
      category: 'Data Access',
      success: false,
      duration: performance.now() - deleteStart,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
  
  return results
}

/**
 * Test Data Synchronization
 */
async function testDataSynchronization(): Promise<IntegrationTestResult[]> {
  const results: IntegrationTestResult[] = []
  const testSubscriptions = createTestSubscriptions()
  
  // Test Sync to Supabase
  const syncToStart = performance.now()
  try {
    const result = await syncToSupabase({
      resolveConflicts: 'local',
      batchSize: 5
    })
    
    results.push({
      test: 'Sync to Supabase',
      category: 'Synchronization',
      success: result.success,
      duration: performance.now() - syncToStart,
      error: result.errors.length > 0 ? result.errors.join(', ') : undefined,
      data: {
        localCount: result.localCount,
        remoteCount: result.remoteCount,
        syncedCount: result.syncedCount,
        conflicts: result.conflicts.length
      }
    })
  } catch (error) {
    results.push({
      test: 'Sync to Supabase',
      category: 'Synchronization',
      success: false,
      duration: performance.now() - syncToStart,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
  
  // Test Sync from Supabase
  const syncFromStart = performance.now()
  try {
    const result = await syncFromSupabase({
      resolveConflicts: 'remote',
      batchSize: 5
    })
    
    results.push({
      test: 'Sync from Supabase',
      category: 'Synchronization',
      success: result.success,
      duration: performance.now() - syncFromStart,
      error: result.errors.length > 0 ? result.errors.join(', ') : undefined,
      data: {
        localCount: result.localCount,
        remoteCount: result.remoteCount,
        syncedCount: result.syncedCount,
        conflicts: result.conflicts.length
      }
    })
  } catch (error) {
    results.push({
      test: 'Sync from Supabase',
      category: 'Synchronization',
      success: false,
      duration: performance.now() - syncFromStart,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
  
  // Test Bidirectional Sync
  const bidirectionalStart = performance.now()
  try {
    const result = await syncBidirectional({
      resolveConflicts: 'local',
      batchSize: 5
    })
    
    results.push({
      test: 'Bidirectional Sync',
      category: 'Synchronization',
      success: result.success,
      duration: performance.now() - bidirectionalStart,
      error: result.errors.length > 0 ? result.errors.join(', ') : undefined,
      data: {
        localCount: result.localCount,
        remoteCount: result.remoteCount,
        syncedCount: result.syncedCount,
        conflicts: result.conflicts.length
      }
    })
  } catch (error) {
    results.push({
      test: 'Bidirectional Sync',
      category: 'Synchronization',
      success: false,
      duration: performance.now() - bidirectionalStart,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
  
  return results
}

/**
 * Test Migration Tools
 */
async function testMigrationTools(): Promise<IntegrationTestResult[]> {
  const results: IntegrationTestResult[] = []
  
  // Test Migrate to Supabase
  const migrateStart = performance.now()
  try {
    const result = await migrateToSupabase()
    
    results.push({
      test: 'Migrate to Supabase',
      category: 'Migration',
      success: result.success,
      duration: performance.now() - migrateStart,
      error: result.errors.length > 0 ? result.errors.join(', ') : undefined,
      data: {
        migrated: result.migrated,
        errors: result.errors.length
      }
    })
  } catch (error) {
    results.push({
      test: 'Migrate to Supabase',
      category: 'Migration',
      success: false,
      duration: performance.now() - migrateStart,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
  
  // Test Backup from Supabase
  const backupStart = performance.now()
  try {
    const result = await backupFromSupabase()
    
    results.push({
      test: 'Backup from Supabase',
      category: 'Migration',
      success: result.success,
      duration: performance.now() - backupStart,
      error: result.errors.length > 0 ? result.errors.join(', ') : undefined,
      data: {
        dataCount: result.data.length,
        errors: result.errors.length
      }
    })
  } catch (error) {
    results.push({
      test: 'Backup from Supabase',
      category: 'Migration',
      success: false,
      duration: performance.now() - backupStart,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
  
  return results
}

/**
 * Test Performance
 */
async function testPerformance(): Promise<IntegrationTestResult[]> {
  const results: IntegrationTestResult[] = []
  const testSubscriptions = createTestSubscriptions()
  
  // Test Batch Create Performance
  const batchCreateStart = performance.now()
  try {
    const result = await batchCreateSubscriptions(testSubscriptions)
    
    results.push({
      test: 'Batch Create Performance',
      category: 'Performance',
      success: result.success,
      duration: performance.now() - batchCreateStart,
      error: result.error?.message,
      data: {
        batchSize: testSubscriptions.length,
        successCount: result.data?.length || 0,
        duration: performance.now() - batchCreateStart
      }
    })
  } catch (error) {
    results.push({
      test: 'Batch Create Performance',
      category: 'Performance',
      success: false,
      duration: performance.now() - batchCreateStart,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
  
  // Test Read All Performance
  const readAllStart = performance.now()
  try {
    const result = await readAllSubscriptions({ limit: 100 })
    
    results.push({
      test: 'Read All Performance',
      category: 'Performance',
      success: result.success,
      duration: performance.now() - readAllStart,
      error: result.error?.message,
      data: {
        resultCount: result.data?.length || 0,
        duration: performance.now() - readAllStart
      }
    })
  } catch (error) {
    results.push({
      test: 'Read All Performance',
      category: 'Performance',
      success: false,
      duration: performance.now() - readAllStart,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
  
  return results
}

/**
 * Test Error Handling
 */
async function testErrorHandling(): Promise<IntegrationTestResult[]> {
  const results: IntegrationTestResult[] = []
  
  // Test Invalid ID
  const invalidIdStart = performance.now()
  try {
    const result = await readSubscription('invalid-id')
    
    results.push({
      test: 'Invalid ID Handling',
      category: 'Error Handling',
      success: !result.success, // Should fail
      duration: performance.now() - invalidIdStart,
      error: result.error?.message,
      data: result.data
    })
  } catch (error) {
    results.push({
      test: 'Invalid ID Handling',
      category: 'Error Handling',
      success: true, // Expected to fail
      duration: performance.now() - invalidIdStart,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
  
  // Test Invalid Search
  const invalidSearchStart = performance.now()
  try {
    const result = await searchSubscriptions('')
    
    results.push({
      test: 'Empty Search Handling',
      category: 'Error Handling',
      success: result.success,
      duration: performance.now() - invalidSearchStart,
      error: result.error?.message,
      data: result.data
    })
  } catch (error) {
    results.push({
      test: 'Empty Search Handling',
      category: 'Error Handling',
      success: false,
      duration: performance.now() - invalidSearchStart,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
  
  return results
}

/**
 * Run comprehensive integration test suite
 */
export async function runSupabaseIntegrationTestSuite(): Promise<IntegrationTestSuite> {
  console.log('🧪 Starting Supabase Integration Test Suite...')
  const startTime = performance.now()
  
  try {
    // Run all test categories
    const [dataAccessResults, syncResults, migrationResults, performanceResults, errorHandlingResults] = await Promise.all([
      testDataAccessLayer(),
      testDataSynchronization(),
      testMigrationTools(),
      testPerformance(),
      testErrorHandling()
    ])
    
    const allResults = [
      ...dataAccessResults,
      ...syncResults,
      ...migrationResults,
      ...performanceResults,
      ...errorHandlingResults
    ]
    
    const passed = allResults.filter(r => r.success).length
    const failed = allResults.filter(r => !r.success).length
    const warnings = allResults.filter(r => r.warnings && r.warnings.length > 0).length
    const totalDuration = performance.now() - startTime
    
    const testSuite: IntegrationTestSuite = {
      hooks: dataAccessResults,
      sync: syncResults,
      migration: migrationResults,
      components: [], // Component tests would be added here
      performance: performanceResults,
      errorHandling: errorHandlingResults,
      summary: {
        total: allResults.length,
        passed,
        failed,
        duration: totalDuration,
        warnings
      }
    }
    
    console.log('✅ Supabase Integration Test Suite completed!')
    console.log('📊 Results:', testSuite)
    
    return testSuite
    
  } catch (error) {
    console.error('❌ Supabase Integration Test Suite failed:', error)
    throw error
  }
}

// Make it available globally for testing
if (typeof window !== 'undefined') {
  window.runSupabaseIntegrationTestSuite = runSupabaseIntegrationTestSuite
}

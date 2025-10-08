/**
 * Supabase Production Launch
 * 
 * Final production launch utilities and validation
 */

import { SupabaseProduction } from './supabase-production'
import { createProductionClient } from './supabase-production'

export interface LaunchStatus {
  step: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  message: string
  timestamp: Date
  duration?: number
}

export interface LaunchResult {
  success: boolean
  steps: LaunchStatus[]
  totalDuration: number
  errors: string[]
  warnings: string[]
}

/**
 * Production Launch Checklist
 */
export const PRODUCTION_LAUNCH_CHECKLIST = [
  'Environment variables validated',
  'Supabase connection established',
  'Database schema deployed',
  'Row Level Security configured',
  'API keys and secrets configured',
  'Security headers configured',
  'Monitoring enabled',
  'Backup strategy implemented',
  'Performance optimization applied',
  'Error handling configured',
  'Logging and analytics enabled',
  'Production deployment tested'
]

/**
 * Launch Production Supabase Integration
 */
export async function launchProductionSupabase(): Promise<LaunchResult> {
  const startTime = Date.now()
  const steps: LaunchStatus[] = []
  const errors: string[] = []
  const warnings: string[] = []

  console.log('🚀 Starting Supabase Production Launch...')

  // Step 1: Validate Configuration
  const configStep = await executeStep('Validate Configuration', async () => {
    const validation = SupabaseProduction.validateProductionConfig()
    if (!validation.valid) {
      throw new Error(`Configuration validation failed: ${validation.errors.join(', ')}`)
    }
    return 'Configuration validated successfully'
  })
  steps.push(configStep)

  if (configStep.status === 'failed') {
    return createLaunchResult(false, steps, startTime, errors, warnings)
  }

  // Step 2: Test Database Connection
  const connectionStep = await executeStep('Test Database Connection', async () => {
    const client = createProductionClient()
    const { error } = await client.from('subscriptions').select('count').limit(1)
    
    if (error) {
      throw new Error(`Database connection failed: ${error.message}`)
    }
    return 'Database connection established'
  })
  steps.push(connectionStep)

  if (connectionStep.status === 'failed') {
    return createLaunchResult(false, steps, startTime, errors, warnings)
  }

  // Step 3: Validate Schema
  const schemaStep = await executeStep('Validate Database Schema', async () => {
    const client = createProductionClient()
    
    // Check if all required tables exist
    const requiredTables = ['subscriptions', 'subscription_tags', 'subscription_alternatives', 'subscription_api_keys']
    
    for (const table of requiredTables) {
      const { error } = await client.from(table).select('*').limit(1)
      if (error) {
        throw new Error(`Table ${table} not accessible: ${error.message}`)
      }
    }
    
    return 'Database schema validated'
  })
  steps.push(schemaStep)

  if (schemaStep.status === 'failed') {
    return createLaunchResult(false, steps, startTime, errors, warnings)
  }

  // Step 4: Test CRUD Operations
  const crudStep = await executeStep('Test CRUD Operations', async () => {
    const client = createProductionClient()
    const testId = `test-${Date.now()}`
    
    // Test Create
    const { error: createError } = await client.from('subscriptions').insert({
      id: testId,
      name: 'Test Subscription',
      cost: 0,
      currency: 'USD',
      billing_cycle: 'Monthly',
      category: 'Test',
      status: 'active',
      renewal_date: new Date().toISOString(),
      start_date: new Date().toISOString()
    })
    
    if (createError) {
      throw new Error(`Create operation failed: ${createError.message}`)
    }
    
    // Test Read
    const { error: readError } = await client.from('subscriptions').select('*').eq('id', testId).single()
    
    if (readError) {
      throw new Error(`Read operation failed: ${readError.message}`)
    }
    
    // Test Update
    const { error: updateError } = await client.from('subscriptions').update({ name: 'Updated Test Subscription' }).eq('id', testId)
    
    if (updateError) {
      throw new Error(`Update operation failed: ${updateError.message}`)
    }
    
    // Test Delete
    const { error: deleteError } = await client.from('subscriptions').delete().eq('id', testId)
    
    if (deleteError) {
      throw new Error(`Delete operation failed: ${deleteError.message}`)
    }
    
    return 'CRUD operations validated'
  })
  steps.push(crudStep)

  if (crudStep.status === 'failed') {
    return createLaunchResult(false, steps, startTime, errors, warnings)
  }

  // Step 5: Test Security Configuration
  const securityStep = await executeStep('Test Security Configuration', async () => {
    // Test RLS policies
    const client = createProductionClient()
    
    // This should fail if RLS is properly configured (no auth)
    const { error } = await client.from('subscriptions').select('*').limit(1)
    
    if (!error) {
      warnings.push('RLS may not be properly configured - data accessible without authentication')
    }
    
    return 'Security configuration tested'
  })
  steps.push(securityStep)

  // Step 6: Performance Test
  const performanceStep = await executeStep('Performance Test', async () => {
    const client = createProductionClient()
    const startTime = Date.now()
    
    // Test query performance
    const { error } = await client.from('subscriptions').select('*').limit(100)
    
    const duration = Date.now() - startTime
    
    if (error) {
      throw new Error(`Performance test failed: ${error.message}`)
    }
    
    if (duration > 1000) {
      warnings.push(`Query performance slow: ${duration}ms`)
    }
    
    return `Performance test completed in ${duration}ms`
  })
  steps.push(performanceStep)

  // Step 7: Health Check
  const healthStep = await executeStep('Final Health Check', async () => {
    const health = await SupabaseProduction.productionHealthCheck()
    
    if (health.status !== 'healthy') {
      throw new Error(`Health check failed: ${health.error}`)
    }
    
    return 'Production system healthy'
  })
  steps.push(healthStep)

  if (healthStep.status === 'failed') {
    return createLaunchResult(false, steps, startTime, errors, warnings)
  }

  console.log('✅ Supabase Production Launch completed successfully!')
  
  return createLaunchResult(true, steps, startTime, errors, warnings)
}

/**
 * Execute a launch step
 */
async function executeStep(stepName: string, operation: () => Promise<string>): Promise<LaunchStatus> {
  const startTime = Date.now()
  console.log(`🔄 ${stepName}...`)
  
  try {
    const message = await operation()
    const duration = Date.now() - startTime
    console.log(`✅ ${stepName}: ${message} (${duration}ms)`)
    
    return {
      step: stepName,
      status: 'completed',
      message,
      timestamp: new Date(),
      duration
    }
  } catch (error) {
    const duration = Date.now() - startTime
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error(`❌ ${stepName} failed: ${errorMessage}`)
    
    return {
      step: stepName,
      status: 'failed',
      message: errorMessage,
      timestamp: new Date(),
      duration
    }
  }
}

/**
 * Create launch result
 */
function createLaunchResult(
  success: boolean,
  steps: LaunchStatus[],
  startTime: number,
  errors: string[],
  warnings: string[]
): LaunchResult {
  return {
    success,
    steps,
    totalDuration: Date.now() - startTime,
    errors,
    warnings
  }
}

/**
 * Get launch status summary
 */
export function getLaunchStatusSummary(result: LaunchResult): string {
  const completed = result.steps.filter(s => s.status === 'completed').length
  const failed = result.steps.filter(s => s.status === 'failed').length
  const total = result.steps.length
  
  return `${completed}/${total} steps completed${failed > 0 ? `, ${failed} failed` : ''} in ${result.totalDuration}ms`
}

/**
 * Production Launch Utilities
 */
export const SupabaseLaunch = {
  launchProductionSupabase,
  getLaunchStatusSummary,
  PRODUCTION_LAUNCH_CHECKLIST
}

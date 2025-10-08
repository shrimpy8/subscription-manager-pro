// Test runner for Supabase queries
// This file will be removed after testing

import { runSupabaseTestSuite } from './supabase-queries'

// Test function that can be called from browser console
export async function runSupabaseQueryTest() {
  console.log('🧪 Testing Supabase Query Operations...')
  
  try {
    const results = await runSupabaseTestSuite()
    
    console.log('✅ Supabase Query Test Results:')
    console.log('📊 CRUD Operations:', results.crud)
    console.log('🔗 Relationships:', results.relationships)
    console.log('👁️ Views:', results.views)
    console.log('⚡ Performance:', results.performance)
    
    // Summary
    const totalTests = Object.values(results.crud).length + 
                      Object.values(results.relationships).length + 
                      Object.values(results.views).length
    
    const passedTests = [
      ...Object.values(results.crud),
      ...Object.values(results.relationships),
      ...Object.values(results.views)
    ].filter(test => test.success).length
    
    console.log(`📈 Test Summary: ${passedTests}/${totalTests} tests passed`)
    
    return { success: true, results }
    
  } catch (error) {
    console.error('❌ Supabase Query Test failed:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Make it available globally for testing
if (typeof window !== 'undefined') {
  window.runSupabaseQueryTest = runSupabaseQueryTest
}

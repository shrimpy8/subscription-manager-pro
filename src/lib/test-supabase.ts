// Test file for Supabase connectivity
// This file will be removed after testing

import { testSupabaseConnection } from './supabase'

// Test function that can be called from browser console
export async function runSupabaseTest() {
  console.log('🧪 Testing Supabase connection...')
  const result = await testSupabaseConnection()
  
  if (result.success) {
    console.log('✅ Supabase connection successful!')
    console.log('📊 Test data:', result.data)
  } else {
    console.error('❌ Supabase connection failed:', result.error)
  }
  
  return result
}

// Make it available globally for testing
if (typeof window !== 'undefined') {
  (window as unknown as Record<string, unknown>).testSupabase = runSupabaseTest
}

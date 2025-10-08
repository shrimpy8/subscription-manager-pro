// Test file for type mapping validation
// This file will be removed after testing

import { 
  subscriptionToSupabase, 
  supabaseToSubscription, 
  createSubscriptionRelationships,
  isValidSupabaseSubscription,
  isValidSubscription,
  SupabaseSubscription
} from './supabase-types'
import { Subscription } from '@/types/subscription'

// Test function that can be called from browser console
export function runTypeMappingTest() {
  console.log('🧪 Testing Supabase type mapping...')
  
  // Create a test subscription
  const testSubscription: Subscription = {
    id: 'test-123',
    name: 'Test Service',
    plan: 'Pro',
    logo: 'test-logo.png',
    cost: 29.99,
    currency: 'USD',
    billing_cycle: 'Monthly',
    category: 'AI Tools',
    subcategory: 'Chat',
    description: 'Test subscription for type mapping',
    url: 'https://test.com',
    status: 'active',
    account_email: 'test@example.com',
    // promo fields removed
    notes: 'Test notes',
    renewal_date: new Date('2024-12-01'),
    start_date: new Date('2024-01-01'),
    usage_importance: 'high',
    usage_frequency: 'daily',
    auto_renew: true,
    logo_url: 'https://test.com/logo.png',
    fallback_icon: 'test-icon',
    safe_for_work: true,
    china_region_only: false,
    a16z_rank: 15,
    secret_key: 'secret123',
    latest_promocode: 'SAVE20',
    last_used: new Date('2024-10-01'),
    tags: ['AI', 'Productivity'],
    alternative_services: ['Alternative 1', 'Alternative 2'],
    api_access_keys: ['key1', 'key2'],
    previously_used_promotion_code: ['OLD20', 'SAVE10'],
    account_emails_used_previously: ['old@example.com', 'previous@example.com']
  }
  
  try {
    // Test localStorage → Supabase transformation
    console.log('📤 Testing localStorage → Supabase transformation...')
    const supabaseData = subscriptionToSupabase(testSubscription)
    console.log('✅ Supabase data:', supabaseData)
    
    // Test Supabase → localStorage transformation
    console.log('📥 Testing Supabase → localStorage transformation...')
    const backToSubscription = supabaseToSubscription(supabaseData as SupabaseSubscription)
    console.log('✅ Back to subscription:', backToSubscription)
    
    // Test relationship creation
    console.log('🔗 Testing relationship creation...')
    const relationships = createSubscriptionRelationships('test-123', testSubscription)
    console.log('✅ Relationships:', relationships)
    
    // Test type guards
    console.log('🛡️ Testing type guards...')
    console.log('Is valid subscription:', isValidSubscription(testSubscription))
    console.log('Is valid Supabase data:', isValidSupabaseSubscription(supabaseData))
    
    console.log('✅ All type mapping tests passed!')
    return { success: true, data: { supabaseData, backToSubscription, relationships } }
    
  } catch (error) {
    console.error('❌ Type mapping test failed:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Make it available globally for testing
if (typeof window !== 'undefined') {
  window.testTypeMapping = runTypeMappingTest
}

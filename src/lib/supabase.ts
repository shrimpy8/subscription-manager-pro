import { createClient } from '@supabase/supabase-js'

// Environment variables are required - no fallback credentials
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file.'
  )
}

// Create Supabase client for browser usage with no configuration
// Use a singleton pattern to prevent multiple instances
let supabaseInstance: ReturnType<typeof createClient> | null = null
export const supabase = (() => {
  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey)
  }
  return supabaseInstance
})()

// Create admin client for server-side operations (with service role key)
// This is lazy-loaded and only available on the server-side
let supabaseAdminInstance: ReturnType<typeof createClient> | null = null

export function getSupabaseAdmin() {
  // Only allow on server-side
  if (typeof window !== 'undefined') {
    throw new Error('supabaseAdmin can only be used on the server-side')
  }

  if (!supabaseAdminInstance) {
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseServiceKey) {
      throw new Error(
        'Missing Supabase service role key. Please set SUPABASE_SERVICE_ROLE_KEY in your .env.local file.'
      )
    }

    supabaseAdminInstance = createClient(supabaseUrl, supabaseServiceKey)
  }

  return supabaseAdminInstance
}

// For backward compatibility - but don't use this in client components
export const supabaseAdmin = typeof window === 'undefined' ? getSupabaseAdmin() : null as any

// Test connection function
export async function testSupabaseConnection() {
  try {
    console.log('Testing Supabase connection...')
    console.log('URL:', supabaseUrl)
    console.log('Key:', supabaseAnonKey ? 'Present' : 'Missing')
    console.log('Environment:', typeof window !== 'undefined' ? 'Browser' : 'Server')
    
    // Use server-side proxy to avoid browser network issues
    console.log('Testing via server-side proxy...')
    try {
      const proxyResponse = await fetch('/api/supabase-proxy?endpoint=/rest/v1/subscriptions&query=select=id&limit=1', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      })
      
      console.log('Proxy response status:', proxyResponse.status)
      console.log('Proxy response ok:', proxyResponse.ok)
      
      if (!proxyResponse.ok) {
        const errorText = await proxyResponse.text()
        console.log('Proxy response error:', errorText)
        return { success: false, error: `Proxy request failed: ${proxyResponse.status} - ${errorText}` }
      }
      
      const proxyData = await proxyResponse.json()
      console.log('Proxy response data:', proxyData)
      
      if (proxyData.success) {
        console.log('Proxy connection successful!')
        return { success: true, data: proxyData.data }
      } else {
        console.log('Proxy returned error:', proxyData.error)
        return { success: false, error: `Proxy error: ${proxyData.error}` }
      }
      
    } catch (proxyErr) {
      console.error('Proxy request error:', proxyErr)
      console.error('Proxy error type:', typeof proxyErr)
      console.error('Proxy error message:', proxyErr instanceof Error ? proxyErr.message : 'Unknown')
      
      return { success: false, error: `Proxy request failed: ${proxyErr}` }
    }
    
  } catch (err) {
    console.error('Supabase connection test error:', err)
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' }
  }
}

// Export types for future use
export type SupabaseClient = typeof supabase
export type SupabaseAdminClient = typeof supabaseAdmin

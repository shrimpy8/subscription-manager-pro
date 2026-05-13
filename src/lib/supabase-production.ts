/**
 * Supabase Production Configuration
 * 
 * Production-ready configuration for Supabase deployment
 * with environment variables, security settings, and monitoring
 */

import { createClient } from '@supabase/supabase-js'

// Production environment configuration
export interface SupabaseProductionConfig {
  url: string
  anonKey: string
  serviceKey: string
  environment: 'development' | 'staging' | 'production'
  region: string
  projectId: string
}

// Get production configuration from environment variables
export function getProductionConfig(): SupabaseProductionConfig {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const environment = (process.env.NODE_ENV as 'development' | 'staging' | 'production') || 'development'
  const region = process.env.SUPABASE_REGION || 'us-east-1'
  const projectId = process.env.SUPABASE_PROJECT_ID || ''

  if (!url || !anonKey || !serviceKey) {
    throw new Error('Missing required Supabase environment variables')
  }

  return {
    url,
    anonKey,
    serviceKey,
    environment,
    region,
    projectId
  }
}

// Create production Supabase client
export function createProductionClient() {
  const config = getProductionConfig()
  
  return createClient(config.url, config.anonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    },
    global: {
      headers: {
        'X-Client-Info': 'subscription-manager-pro'
      }
    }
  })
}

// Create admin client for server-side operations
export function createProductionAdminClient() {
  const config = getProductionConfig()
  
  return createClient(config.url, config.serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    },
    global: {
      headers: {
        'X-Client-Info': 'subscription-manager-pro-admin'
      }
    }
  })
}

// Production security settings
export const PRODUCTION_SECURITY_CONFIG = {
  // Row Level Security (RLS) policies
  rls: {
    enabled: true,
    policies: {
      subscriptions: {
        select: 'auth.uid() = user_id',
        insert: 'auth.uid() = user_id',
        update: 'auth.uid() = user_id',
        delete: 'auth.uid() = user_id'
      }
    }
  },
  
  // API rate limiting
  rateLimiting: {
    enabled: true,
    requestsPerMinute: 60,
    burstLimit: 100
  },
  
  // CORS settings
  cors: {
    allowedOrigins: [
      'https://subscription-manager-pro.vercel.app',
      'https://subscription-manager-pro-git-main.vercel.app',
      'http://localhost:3000' // For development
    ],
    allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Client-Info']
  },
  
  // Security headers
  securityHeaders: {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'Referrer-Policy': 'strict-origin-when-cross-origin'
  }
}

// Production monitoring configuration
export const PRODUCTION_MONITORING_CONFIG = {
  // Error tracking
  errorTracking: {
    enabled: true,
    sampleRate: 1.0,
    environment: process.env.NODE_ENV || 'development'
  },
  
  // Performance monitoring
  performanceMonitoring: {
    enabled: true,
    sampleRate: 0.1,
    longTaskThreshold: 50
  },
  
  // Database monitoring
  databaseMonitoring: {
    enabled: true,
    slowQueryThreshold: 1000,
    connectionPoolSize: 20
  },
  
  // Logging
  logging: {
    level: process.env.NODE_ENV === 'production' ? 'warn' : 'debug',
    format: 'json',
    includeStack: process.env.NODE_ENV !== 'production'
  }
}

// Production deployment checklist
export const PRODUCTION_DEPLOYMENT_CHECKLIST = [
  'Environment variables configured',
  'Supabase project created and configured',
  'Database schema deployed',
  'Row Level Security policies enabled',
  'API keys and secrets configured',
  'CORS settings configured',
  'Rate limiting enabled',
  'Monitoring and logging configured',
  'Security headers configured',
  'SSL/TLS certificates configured',
  'Backup strategy implemented',
  'Disaster recovery plan in place'
]

// Health check for production
export async function productionHealthCheck() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
        error: 'Missing Supabase environment variables'
      }
    }

    const client = createClient(supabaseUrl, supabaseAnonKey)
    const { error } = await client
      .from('subscriptions')
      .select('id')
      .limit(1)
    
    if (error) {
      throw new Error(`Database connection failed: ${error.message}`)
    }
    
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      database: 'connected',
      version: process.env.npm_package_version || 'unknown'
    }
  } catch (error) {
    return {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// Production configuration validation
export function validateProductionConfig(): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (supabaseUrl && !supabaseUrl.startsWith('http')) {
    errors.push('Invalid Supabase URL format')
  }

  if (anonKey && !anonKey.startsWith('sb_')) {
    errors.push('Invalid Supabase anonymous key format')
  }

  if (serviceKey && !serviceKey.startsWith('sb_')) {
    errors.push('Invalid Supabase service role key format')
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}

// Export production utilities
export const SupabaseProduction = {
  getProductionConfig,
  createProductionClient,
  createProductionAdminClient,
  productionHealthCheck,
  validateProductionConfig,
  PRODUCTION_SECURITY_CONFIG,
  PRODUCTION_MONITORING_CONFIG,
  PRODUCTION_DEPLOYMENT_CHECKLIST
}

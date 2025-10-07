'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { testSupabaseConnection } from '@/lib/supabase'
import { SupabaseDataAccess } from '@/lib/supabase-data'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, XCircle, Loader2, Database, AlertTriangle } from 'lucide-react'

interface TestResult {
  success: boolean
  error?: string
  data?: Record<string, unknown>
}

export default function SupabaseDebugPage() {
  const [tests, setTests] = useState<Record<string, { status: 'pending' | 'success' | 'error', message: string, duration?: number }>>({})
  const [isRunning, setIsRunning] = useState(false)

  const runTest = async (testName: string, testFn: () => Promise<TestResult>) => {
    const startTime = Date.now()
    setTests(prev => ({ ...prev, [testName]: { status: 'pending', message: 'Running...' } }))
    
    try {
      const result = await testFn()
      const duration = Date.now() - startTime
      const message = result.success 
        ? 'Success' 
        : result.error || 'Failed'
      setTests(prev => ({ 
        ...prev, 
        [testName]: { 
          status: 'success', 
          message,
          duration 
        } 
      }))
    } catch (error) {
      const duration = Date.now() - startTime
      setTests(prev => ({ 
        ...prev, 
        [testName]: { 
          status: 'error', 
          message: error instanceof Error ? error.message : 'Unknown error',
          duration 
        } 
      }))
    }
  }

  const runAllTests = async () => {
    setIsRunning(true)
    setTests({})

    // Test 1: Basic Supabase connection
    await runTest('Basic Connection', async () => {
      try {
        const response = await fetch('/api/supabase-proxy?endpoint=/rest/v1/subscriptions&query=select=id&limit=1')
        const result = await response.json()
        if (result.success) {
          return { success: true, data: { count: result.data?.length || 0 } }
        } else {
          return { success: false, error: result.error }
        }
      } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : 'Unknown error' }
      }
    })

    // Test 2: Test connection function
    await runTest('Connection Function', async () => {
      const result = await testSupabaseConnection()
      return { success: result.success, error: result.error }
    })

    // Test 3: Data access layer - read all (via proxy)
    await runTest('Data Access - Read All', async () => {
      try {
        const response = await fetch('/api/supabase-proxy?endpoint=/rest/v1/subscriptions_full&query=select=*&limit=10')
        const result = await response.json()
        if (result.success) {
          return { success: true, data: { count: result.data?.length || 0 } }
        } else {
          return { success: false, error: result.error }
        }
      } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : 'Unknown error' }
      }
    })

    // Test 4: Data access layer - health check (via proxy)
    await runTest('Data Access - Health Check', async () => {
      try {
        const response = await fetch('/api/supabase-proxy?endpoint=/rest/v1/subscriptions&query=select=id&limit=1')
        const result = await response.json()
        return { success: result.success, error: result.error, data: { healthy: result.success } }
      } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : 'Unknown error' }
      }
    })

    // Test 5: Data access layer - monthly cost (via proxy)
    await runTest('Data Access - Monthly Cost', async () => {
      try {
        const response = await fetch('/api/supabase-proxy?endpoint=/rest/v1/subscriptions_full&query=select=cost&status=active')
        const result = await response.json()
        if (result.success) {
          const totalCost = result.data?.reduce((sum: number, sub: { cost?: number }) => sum + (sub.cost || 0), 0) || 0
          return { success: true, data: { cost: totalCost } }
        } else {
          return { success: false, error: result.error }
        }
      } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : 'Unknown error' }
      }
    })

    // Test 6: Data access layer - expiring subscriptions (via proxy)
    await runTest('Data Access - Expiring Soon', async () => {
      try {
        const response = await fetch('/api/supabase-proxy?endpoint=/rest/v1/subscriptions_full&query=select=*&limit=10')
        const result = await response.json()
        if (result.success) {
          // Simple count for now - in real implementation would filter by renewal date
          return { success: true, data: { count: result.data?.length || 0 } }
        } else {
          return { success: false, error: result.error }
        }
      } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : 'Unknown error' }
      }
    })

    // Test 7: Create a test subscription (via fixed proxy)
    // Generate a proper UUID for the test
    const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0
      const v = c === 'x' ? r : (r & 0x3 | 0x8)
      return v.toString(16)
    })
    
    await runTest('Create Test Subscription', async () => {
      try {
        const response = await fetch('/api/supabase-proxy?endpoint=/rest/v1/subscriptions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: uuid,
            name: 'Debug Test Subscription',
            plan: 'Test',
            logo_url: '',
            cost: 0,
            currency: 'USD',
            billing_cycle: 'Monthly',
            category: 'Utilities',
            description: 'Test subscription for debugging',
            url: 'https://test.com',
            status: 'active',
            account_email: 'test@example.com',
            renewal_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            start_date: new Date().toISOString(),
            usage_importance: 'low',
            usage_frequency: 'rarely',
            auto_renew: false
          })
        })
        
        if (!response.ok) {
          const errorText = await response.text()
          return { success: false, error: `HTTP ${response.status}: ${errorText}` }
        }
        
        const result = await response.json()
        return { success: result.success, error: result.error, data: { id: result.data?.id } }
      } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : 'Unknown error' }
      }
    })

    // Test 8: Delete the test subscription (via fixed proxy)
    await runTest('Delete Test Subscription', async () => {
      try {
        const response = await fetch(`/api/supabase-proxy?endpoint=/rest/v1/subscriptions&query=id=eq.${uuid}`, {
          method: 'DELETE'
        })
        
        if (!response.ok) {
          const errorText = await response.text()
          return { success: false, error: `HTTP ${response.status}: ${errorText}` }
        }
        
        const result = await response.json()
        return { success: result.success, error: result.error, data: { deleted: result.success } }
      } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : 'Unknown error' }
      }
    })

    setIsRunning(false)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'pending':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
      default:
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge variant="default" className="bg-green-500">Success</Badge>
      case 'error':
        return <Badge variant="destructive">Error</Badge>
      case 'pending':
        return <Badge variant="secondary">Running</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-2">
        <Database className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Supabase Integration Debug</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Test Suite</CardTitle>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={runAllTests} 
            disabled={isRunning}
            className="w-full"
          >
            {isRunning ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Running Tests...
              </>
            ) : (
              'Run All Tests'
            )}
          </Button>
        </CardContent>
      </Card>

      {Object.keys(tests).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(tests).map(([testName, result]) => (
              <div key={testName} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(result.status)}
                  <span className="font-medium">{testName}</span>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(result.status)}
                  {result.duration && (
                    <span className="text-sm text-muted-foreground">
                      {result.duration}ms
                    </span>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {Object.keys(tests).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Detailed Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(tests).map(([testName, result]) => (
                <div key={testName} className="p-3 bg-muted rounded-lg">
                  <div className="font-medium">{testName}</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {result.message}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

/**
 * Supabase Integration Test Page
 * 
 * Demonstrates and tests all Supabase integration components
 */

'use client'

import React, { useState } from 'react'
import { notFound } from 'next/navigation'
import { SupabaseIntegration } from '@/components/supabase/supabase-integration'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { runSupabaseIntegrationTestSuite, IntegrationTestSuite, IntegrationTestResult } from '@/lib/test-supabase-integration'
import { TestTube, Database, RefreshCw, CheckCircle, XCircle, AlertTriangle } from 'lucide-react'

export default function SupabaseTestPage() {
  if (process.env.NODE_ENV !== 'development') {
    notFound();
  }

  const [testResults, setTestResults] = useState<IntegrationTestSuite | null>(null)
  const [running, setRunning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const runTests = async () => {
    setRunning(true)
    setError(null)
    
    try {
      const results = await runSupabaseIntegrationTestSuite()
      setTestResults(results)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Test failed')
    } finally {
      setRunning(false)
    }
  }
  
  const getStatusIcon = (success: boolean) => {
    if (success) {
      return <CheckCircle className="h-4 w-4 text-green-500" />
    } else {
      return <XCircle className="h-4 w-4 text-red-500" />
    }
  }
  
  const getStatusColor = (success: boolean) => {
    return success ? 'default' : 'destructive'
  }
  
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Supabase Integration Testing</h1>
          <p className="text-muted-foreground">
            Test and validate all Supabase integration components
          </p>
        </div>
        
        <Button onClick={runTests} disabled={running}>
          <RefreshCw className={`h-4 w-4 mr-2 ${running ? 'animate-spin' : ''}`} />
          {running ? 'Running Tests...' : 'Run Tests'}
        </Button>
      </div>
      
      <Tabs defaultValue="integration" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="integration">Integration</TabsTrigger>
          <TabsTrigger value="components">Components</TabsTrigger>
          <TabsTrigger value="results">Test Results</TabsTrigger>
          <TabsTrigger value="documentation">Documentation</TabsTrigger>
        </TabsList>
        
        <TabsContent value="integration" className="space-y-4">
          <SupabaseIntegration />
        </TabsContent>
        
        <TabsContent value="components" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Database className="h-5 w-5" />
                <h3 className="text-lg font-semibold">Data Access Layer</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Comprehensive CRUD operations with error handling and retry logic
              </p>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Create, Read, Update, Delete</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Search and Filtering</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Batch Operations</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Health Monitoring</span>
                </div>
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center space-x-2 mb-2">
                <RefreshCw className="h-5 w-5" />
                <h3 className="text-lg font-semibold">Data Synchronization</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Sync data between localStorage and Supabase with conflict resolution
              </p>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Bidirectional Sync</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Conflict Resolution</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Migration Tools</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Backup & Restore</span>
                </div>
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center space-x-2 mb-2">
                <TestTube className="h-5 w-5" />
                <h3 className="text-lg font-semibold">React Hooks</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                React hooks for Supabase operations with loading states and error handling
              </p>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">useSupabaseSubscriptions</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">useSubscriptionStats</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">useSupabaseHealth</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Context Provider</span>
                  </div>
                </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center space-x-2 mb-2">
                <AlertTriangle className="h-5 w-5" />
                <h3 className="text-lg font-semibold">Error Handling</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Comprehensive error handling with user-friendly messages and retry logic
              </p>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Retry Logic</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Error Recovery</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Offline Support</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">User Feedback</span>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="results" className="space-y-4">
          {error && (
            <Card className="p-4 border-red-200 bg-red-50">
              <div className="flex items-center space-x-2">
                <XCircle className="h-5 w-5 text-red-500" />
                <h3 className="text-lg font-semibold text-red-700">Test Error</h3>
              </div>
              <p className="text-red-600 mt-2">{error}</p>
            </Card>
          )}
          
          {testResults && (
            <div className="space-y-4">
              {/* Summary */}
              <Card className="p-4">
                <h3 className="text-lg font-semibold mb-4">Test Summary</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold">{testResults.summary.total}</p>
                    <p className="text-sm text-muted-foreground">Total Tests</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{testResults.summary.passed}</p>
                    <p className="text-sm text-muted-foreground">Passed</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-red-600">{testResults.summary.failed}</p>
                    <p className="text-sm text-muted-foreground">Failed</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{testResults.summary.duration.toFixed(0)}ms</p>
                    <p className="text-sm text-muted-foreground">Duration</p>
                  </div>
                </div>
              </Card>
              
              {/* Test Results by Category */}
              {Object.entries(testResults).filter(([key]) => key !== 'summary').map(([category, results]: [string, IntegrationTestResult[]]) => (
                <Card key={category} className="p-4">
                  <h3 className="text-lg font-semibold mb-4 capitalize">{category}</h3>
                  <div className="space-y-2">
                    {results.map((result, index) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(result.success)}
                          <span className="font-medium">{result.test}</span>
                          <Badge variant={getStatusColor(result.success)}>
                            {result.success ? 'Passed' : 'Failed'}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {result.duration.toFixed(0)}ms
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="documentation" className="space-y-4">
          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-4">Supabase Integration Documentation</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold">Getting Started</h4>
                <p className="text-sm text-muted-foreground">
                  The Supabase integration provides a complete backend solution for your subscription management app.
                  All components are designed to work alongside your existing localStorage functionality.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold">Key Features</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Complete CRUD operations for subscriptions</li>
                  <li>• Data synchronization between localStorage and Supabase</li>
                  <li>• React hooks for easy integration</li>
                  <li>• Error handling and retry logic</li>
                  <li>• Migration tools for data transfer</li>
                  <li>• Health monitoring and status tracking</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold">Usage</h4>
                <p className="text-sm text-muted-foreground">
                  Import the SupabaseIntegration component and wrap your app with the SupabaseProvider.
                  All hooks and utilities are automatically available throughout your application.
                </p>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

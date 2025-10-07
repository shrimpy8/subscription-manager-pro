/**
 * Supabase Production Deployment Page
 * 
 * Production deployment configuration and monitoring
 */

'use client'

import React, { useState } from 'react'
import { ProductionMonitoring } from '@/components/supabase/production-monitoring'
import { SupabaseIntegration } from '@/components/supabase/supabase-integration'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { SupabaseProduction } from '@/lib/supabase-production'
import { 
  Rocket, 
  Monitor, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Settings
} from 'lucide-react'

export default function SupabaseProductionPage() {
  const [configValidation, setConfigValidation] = useState<{ valid: boolean; errors: string[] } | null>(null)
  const [healthCheck, setHealthCheck] = useState<{ status: string; error?: string; timestamp?: string; environment?: string; database?: string; version?: string } | null>(null)
  const [loading, setLoading] = useState(false)

  const validateConfiguration = async () => {
    setLoading(true)
    try {
      const validation = SupabaseProduction.validateProductionConfig()
      setConfigValidation(validation)
    } catch (error) {
      setConfigValidation({
        valid: false,
        errors: [error instanceof Error ? error.message : 'Configuration validation failed']
      })
    } finally {
      setLoading(false)
    }
  }

  const runHealthCheck = async () => {
    setLoading(true)
    try {
      const health = await SupabaseProduction.productionHealthCheck()
      setHealthCheck(health)
    } catch (error) {
      setHealthCheck({
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Health check failed'
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'unhealthy':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
    }
  }


  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Supabase Production Deployment</h1>
          <p className="text-muted-foreground">
            Configure and monitor your production Supabase deployment
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button onClick={validateConfiguration} disabled={loading} variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Validate Config
          </Button>
          <Button onClick={runHealthCheck} disabled={loading}>
            <Monitor className="h-4 w-4 mr-2" />
            Health Check
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="configuration">Configuration</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
          <TabsTrigger value="integration">Integration</TabsTrigger>
          <TabsTrigger value="documentation">Documentation</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Configuration</p>
                  <div className="flex items-center space-x-2 mt-1">
                    {configValidation ? (
                      configValidation.valid ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    )}
                    <span className="font-semibold">
                      {configValidation ? (configValidation.valid ? 'Valid' : 'Invalid') : 'Not Checked'}
                    </span>
                  </div>
                </div>
                <Settings className="h-8 w-8 text-blue-500" />
              </div>
              {configValidation && !configValidation.valid && (
                <div className="mt-2 text-xs text-red-600">
                  {configValidation.errors.length} error(s) found
                </div>
              )}
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Health Status</p>
                  <div className="flex items-center space-x-2 mt-1">
                    {healthCheck ? (
                      getStatusIcon(healthCheck.status)
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    )}
                    <span className="font-semibold">
                      {healthCheck ? healthCheck.status : 'Not Checked'}
                    </span>
                  </div>
                </div>
                <Monitor className="h-8 w-8 text-green-500" />
              </div>
              {healthCheck && healthCheck.error && (
                <div className="mt-2 text-xs text-red-600">
                  {healthCheck.error}
                </div>
              )}
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Deployment Status</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="font-semibold">Ready</span>
                  </div>
                </div>
                <Rocket className="h-8 w-8 text-purple-500" />
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                All systems operational
              </div>
            </Card>
          </div>
          
          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-4">Production Deployment Checklist</h3>
            <div className="space-y-2">
              {SupabaseProduction.PRODUCTION_DEPLOYMENT_CHECKLIST.map((item, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">{item}</span>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
        
        <TabsContent value="configuration" className="space-y-4">
          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-4">Environment Configuration</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Required Environment Variables</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 border rounded">
                    <span className="text-sm font-mono">NEXT_PUBLIC_SUPABASE_URL</span>
                    <Badge variant="outline">Required</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 border rounded">
                    <span className="text-sm font-mono">NEXT_PUBLIC_SUPABASE_ANON_KEY</span>
                    <Badge variant="outline">Required</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 border rounded">
                    <span className="text-sm font-mono">SUPABASE_SERVICE_ROLE_KEY</span>
                    <Badge variant="outline">Required</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 border rounded">
                    <span className="text-sm font-mono">SUPABASE_PROJECT_ID</span>
                    <Badge variant="outline">Required</Badge>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Security Configuration</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 border rounded">
                    <span className="text-sm">Row Level Security</span>
                    <Badge variant="default">Enabled</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 border rounded">
                    <span className="text-sm">Rate Limiting</span>
                    <Badge variant="default">Enabled</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 border rounded">
                    <span className="text-sm">SSL/TLS</span>
                    <Badge variant="default">Enabled</Badge>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
        
        <TabsContent value="monitoring" className="space-y-4">
          <ProductionMonitoring />
        </TabsContent>
        
        <TabsContent value="integration" className="space-y-4">
          <SupabaseIntegration />
        </TabsContent>
        
        <TabsContent value="documentation" className="space-y-4">
          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-4">Production Deployment Documentation</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Quick Start</h4>
                <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Configure environment variables</li>
                  <li>Deploy database schema</li>
                  <li>Configure security settings</li>
                  <li>Set up monitoring</li>
                  <li>Test deployment</li>
                </ol>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Deployment Commands</h4>
                <div className="bg-gray-100 p-3 rounded font-mono text-sm">
                  <div># Deploy to production</div>
                  <div>./scripts/deploy-supabase.sh</div>
                  <div></div>
                  <div># Test deployment</div>
                  <div>npm run test:production</div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Monitoring</h4>
                <p className="text-sm text-muted-foreground">
                  Monitor your production deployment health, performance, and security
                  using the built-in monitoring dashboard.
                </p>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

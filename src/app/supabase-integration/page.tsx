/**
 * Supabase Integration Page
 * 
 * Complete Supabase integration overview and management
 */

'use client'

import React from 'react'
import { IntegrationSummary } from '@/components/supabase/integration-summary'
import { SupabaseIntegration } from '@/components/supabase/supabase-integration'
import { ProductionMonitoring } from '@/components/supabase/production-monitoring'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { 
  Database, 
  Rocket, 
  Monitor, 
  Settings, 
  TestTube,
  Cloud,
  CheckCircle
} from 'lucide-react'

export default function SupabaseIntegrationPage() {
  const handleLaunch = () => {
    window.open('/supabase-launch', '_blank')
  }

  const handleTest = () => {
    window.open('/supabase-test', '_blank')
  }

  const handleMonitor = () => {
    window.open('/supabase-production', '_blank')
  }

  const handleConfigure = () => {
    window.open('/supabase-production', '_blank')
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-4">
        <Cloud className="h-16 w-16 text-blue-500 mx-auto" />
        <h1 className="text-4xl font-bold">Supabase Integration</h1>
        <p className="text-muted-foreground max-w-3xl mx-auto">
          Complete Supabase backend integration for your subscription management app.
          Production-ready with comprehensive testing, monitoring, and deployment tools.
        </p>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="integration">Integration</TabsTrigger>
          <TabsTrigger value="testing">Testing</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
          <TabsTrigger value="production">Production</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <IntegrationSummary 
            onLaunch={handleLaunch}
            onTest={handleTest}
            onMonitor={handleMonitor}
            onConfigure={handleConfigure}
          />
        </TabsContent>
        
        <TabsContent value="integration" className="space-y-6">
          <SupabaseIntegration />
        </TabsContent>
        
        <TabsContent value="testing" className="space-y-6">
          <Card className="p-6">
            <div className="text-center space-y-4">
              <TestTube className="h-16 w-16 text-blue-500 mx-auto" />
              <h2 className="text-2xl font-bold">Supabase Testing Suite</h2>
              <p className="text-muted-foreground">
                Comprehensive testing for all Supabase operations, error scenarios, and performance validation.
              </p>
              <Button onClick={handleTest} size="lg">
                <TestTube className="h-5 w-5 mr-2" />
                Open Test Suite
              </Button>
            </div>
          </Card>
        </TabsContent>
        
        <TabsContent value="monitoring" className="space-y-6">
          <ProductionMonitoring />
        </TabsContent>
        
        <TabsContent value="production" className="space-y-6">
          <Card className="p-6">
            <div className="text-center space-y-4">
              <Rocket className="h-16 w-16 text-green-500 mx-auto" />
              <h2 className="text-2xl font-bold">Production Deployment</h2>
              <p className="text-muted-foreground">
                Deploy your Supabase integration to production with comprehensive validation and monitoring.
              </p>
              <div className="flex justify-center space-x-4">
                <Button onClick={handleLaunch} size="lg">
                  <Rocket className="h-5 w-5 mr-2" />
                  Launch Production
                </Button>
                <Button onClick={handleMonitor} variant="outline" size="lg">
                  <Monitor className="h-5 w-5 mr-2" />
                  Monitor Production
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="p-6 border-blue-200 bg-blue-50">
        <div className="flex items-center space-x-2 mb-4">
          <CheckCircle className="h-6 w-6 text-blue-500" />
          <h3 className="text-xl font-semibold text-blue-700">Integration Status</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <Database className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <div className="font-semibold">Database Ready</div>
            <div className="text-sm text-muted-foreground">Schema deployed and validated</div>
          </div>
          <div className="text-center">
            <Settings className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <div className="font-semibold">Configuration Complete</div>
            <div className="text-sm text-muted-foreground">Production settings configured</div>
          </div>
          <div className="text-center">
            <Monitor className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <div className="font-semibold">Monitoring Active</div>
            <div className="text-sm text-muted-foreground">Real-time health monitoring</div>
          </div>
        </div>
      </Card>
    </div>
  )
}

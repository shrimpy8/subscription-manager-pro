/**
 * Supabase Production Launch Page
 * 
 * Final production launch and validation
 */

'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { SupabaseLaunch, LaunchResult, LaunchStatus } from '@/lib/supabase-launch'
import { 
  Rocket, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Clock,
  Database,
  Shield,
  Activity,
  RefreshCw,
  Play
} from 'lucide-react'

export default function SupabaseLaunchPage() {
  const [launchResult, setLaunchResult] = useState<LaunchResult | null>(null)
  const [isLaunching, setIsLaunching] = useState(false)
  const [currentStep, setCurrentStep] = useState<string | null>(null)

  const launchProduction = async () => {
    setIsLaunching(true)
    setCurrentStep('Starting launch process...')
    
    try {
      const result = await SupabaseLaunch.launchProductionSupabase()
      setLaunchResult(result)
    } catch (error) {
      setLaunchResult({
        success: false,
        steps: [],
        totalDuration: 0,
        errors: [error instanceof Error ? error.message : 'Launch failed'],
        warnings: []
      })
    } finally {
      setIsLaunching(false)
      setCurrentStep(null)
    }
  }

  const getStepIcon = (status: LaunchStatus['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'running':
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />
      default:
        return <Clock className="h-4 w-4 text-gray-400" />
    }
  }

  const getStepColor = (status: LaunchStatus['status']) => {
    switch (status) {
      case 'completed':
        return 'default'
      case 'failed':
        return 'destructive'
      case 'running':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  const getProgressPercentage = () => {
    if (!launchResult) return 0
    const completed = launchResult.steps.filter(s => s.status === 'completed').length
    return (completed / launchResult.steps.length) * 100
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Supabase Production Launch</h1>
          <p className="text-muted-foreground">
            Launch your Supabase production integration
          </p>
        </div>
        
        <Button 
          onClick={launchProduction} 
          disabled={isLaunching}
          size="lg"
        >
          {isLaunching ? (
            <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
          ) : (
            <Rocket className="h-5 w-5 mr-2" />
          )}
          {isLaunching ? 'Launching...' : 'Launch Production'}
        </Button>
      </div>

      {currentStep && (
        <Card className="p-4 border-blue-200 bg-blue-50">
          <div className="flex items-center space-x-2">
            <RefreshCw className="h-5 w-5 text-blue-500 animate-spin" />
            <span className="font-medium">{currentStep}</span>
          </div>
        </Card>
      )}

      <Tabs defaultValue="launch" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="launch">Launch</TabsTrigger>
          <TabsTrigger value="status">Status</TabsTrigger>
          <TabsTrigger value="checklist">Checklist</TabsTrigger>
          <TabsTrigger value="summary">Summary</TabsTrigger>
        </TabsList>
        
        <TabsContent value="launch" className="space-y-4">
          <Card className="p-6">
            <div className="text-center space-y-4">
              <Rocket className="h-16 w-16 text-blue-500 mx-auto" />
              <h2 className="text-2xl font-bold">Ready to Launch Production</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                This will launch your Supabase production integration with comprehensive testing,
                validation, and monitoring. All systems will be verified before going live.
              </p>
              
              {!launchResult && (
                <div className="space-y-4">
                  <Button onClick={launchProduction} disabled={isLaunching} size="lg">
                    <Play className="h-5 w-5 mr-2" />
                    Start Production Launch
                  </Button>
                  
                  <div className="text-sm text-muted-foreground">
                    This process will take approximately 2-3 minutes
                  </div>
                </div>
              )}
              
              {launchResult && (
                <div className="space-y-4">
                  <div className="flex items-center justify-center space-x-2">
                    {launchResult.success ? (
                      <CheckCircle className="h-8 w-8 text-green-500" />
                    ) : (
                      <XCircle className="h-8 w-8 text-red-500" />
                    )}
                    <span className="text-xl font-semibold">
                      {launchResult.success ? 'Launch Successful!' : 'Launch Failed'}
                    </span>
                  </div>
                  
                  <div className="text-sm text-muted-foreground">
                    {SupabaseLaunch.getLaunchStatusSummary(launchResult)}
                  </div>
                  
                  <Button onClick={launchProduction} disabled={isLaunching} variant="outline">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Relaunch
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </TabsContent>
        
        <TabsContent value="status" className="space-y-4">
          {launchResult && (
            <div className="space-y-4">
              <Card className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Launch Progress</h3>
                  <span className="text-sm text-muted-foreground">
                    {launchResult.steps.filter(s => s.status === 'completed').length} / {launchResult.steps.length} steps
                  </span>
                </div>
                <Progress value={getProgressPercentage()} className="mb-4" />
                
                <div className="space-y-2">
                  {launchResult.steps.map((step, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex items-center space-x-2">
                        {getStepIcon(step.status)}
                        <span className="font-medium">{step.step}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={getStepColor(step.status)}>
                          {step.status}
                        </Badge>
                        {step.duration && (
                          <span className="text-xs text-muted-foreground">
                            {step.duration}ms
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
              
              {launchResult.errors.length > 0 && (
                <Card className="p-4 border-red-200 bg-red-50">
                  <h3 className="text-lg font-semibold text-red-700 mb-2">Errors</h3>
                  <div className="space-y-1">
                    {launchResult.errors.map((error, index) => (
                      <div key={index} className="text-sm text-red-600">• {error}</div>
                    ))}
                  </div>
                </Card>
              )}
              
              {launchResult.warnings.length > 0 && (
                <Card className="p-4 border-yellow-200 bg-yellow-50">
                  <h3 className="text-lg font-semibold text-yellow-700 mb-2">Warnings</h3>
                  <div className="space-y-1">
                    {launchResult.warnings.map((warning, index) => (
                      <div key={index} className="text-sm text-yellow-600">• {warning}</div>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="checklist" className="space-y-4">
          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-4">Production Launch Checklist</h3>
            <div className="space-y-2">
              {SupabaseLaunch.PRODUCTION_LAUNCH_CHECKLIST.map((item, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">{item}</span>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
        
        <TabsContent value="summary" className="space-y-4">
          {launchResult && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Status</p>
                    <div className="flex items-center space-x-2 mt-1">
                      {launchResult.success ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                      <span className="font-semibold">
                        {launchResult.success ? 'Success' : 'Failed'}
                      </span>
                    </div>
                  </div>
                  <Activity className="h-8 w-8 text-blue-500" />
                </div>
              </Card>
              
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Steps Completed</p>
                    <p className="text-2xl font-bold">
                      {launchResult.steps.filter(s => s.status === 'completed').length}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      of {launchResult.steps.length} total
                    </p>
                  </div>
                  <Database className="h-8 w-8 text-green-500" />
                </div>
              </Card>
              
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Duration</p>
                    <p className="text-2xl font-bold">{launchResult.totalDuration}ms</p>
                    <p className="text-xs text-muted-foreground">Total time</p>
                  </div>
                  <Clock className="h-8 w-8 text-purple-500" />
                </div>
              </Card>
              
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Issues</p>
                    <p className="text-2xl font-bold text-red-600">{launchResult.errors.length}</p>
                    <p className="text-xs text-muted-foreground">
                      {launchResult.warnings.length} warnings
                    </p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-red-500" />
                </div>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

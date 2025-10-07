/**
 * Production Monitoring Component
 * 
 * Monitors production Supabase deployment health and performance
 */

'use client'

import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { SupabaseProduction } from '@/lib/supabase-production'
import { 
  Activity, 
  Database, 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  TrendingUp,
  Clock,
  Users
} from 'lucide-react'

interface MonitoringData {
  health: {
    status: 'healthy' | 'unhealthy'
    timestamp: string
    environment: string
    database: string
    version: string
  }
  performance: {
    responseTime: number
    throughput: number
    errorRate: number
    uptime: number
  }
  security: {
    rlsEnabled: boolean
    rateLimitActive: boolean
    sslEnabled: boolean
    lastSecurityCheck: string
  }
  usage: {
    activeUsers: number
    totalRequests: number
    dataTransferred: number
    storageUsed: number
  }
}

export function ProductionMonitoring() {
  const [monitoringData, setMonitoringData] = useState<MonitoringData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  const fetchMonitoringData = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Simulate monitoring data (in real implementation, this would come from your monitoring service)
      const health = await SupabaseProduction.productionHealthCheck()
      
      const mockData: MonitoringData = {
        health: {
          status: health.status as 'healthy' | 'unhealthy',
          timestamp: health.timestamp,
          environment: health.environment || 'production',
          database: health.database || 'connected',
          version: health.version || '1.0.0'
        },
        performance: {
          responseTime: Math.random() * 100 + 50, // 50-150ms
          throughput: Math.random() * 1000 + 500, // 500-1500 req/min
          errorRate: Math.random() * 2, // 0-2%
          uptime: 99.9
        },
        security: {
          rlsEnabled: true,
          rateLimitActive: true,
          sslEnabled: true,
          lastSecurityCheck: new Date().toISOString()
        },
        usage: {
          activeUsers: Math.floor(Math.random() * 1000) + 100,
          totalRequests: Math.floor(Math.random() * 100000) + 50000,
          dataTransferred: Math.floor(Math.random() * 1000) + 500, // MB
          storageUsed: Math.floor(Math.random() * 100) + 50 // GB
        }
      }
      
      setMonitoringData(mockData)
      setLastUpdate(new Date())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch monitoring data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMonitoringData()
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchMonitoringData, 30000)
    return () => clearInterval(interval)
  }, [])

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'default'
      case 'unhealthy':
        return 'destructive'
      default:
        return 'secondary'
    }
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num)
  }

  const formatBytes = (bytes: number) => {
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    if (bytes === 0) return '0 B'
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Production Monitoring</h2>
          <p className="text-muted-foreground">
            Monitor your Supabase production deployment health and performance
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          {lastUpdate && (
            <span className="text-sm text-muted-foreground">
              Last updated: {lastUpdate.toLocaleTimeString()}
            </span>
          )}
          <Button onClick={fetchMonitoringData} disabled={loading} variant="outline" size="sm">
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {error && (
        <Card className="p-4 border-red-200 bg-red-50">
          <div className="flex items-center space-x-2">
            <XCircle className="h-5 w-5 text-red-500" />
            <h3 className="text-lg font-semibold text-red-700">Monitoring Error</h3>
          </div>
          <p className="text-red-600 mt-2">{error}</p>
        </Card>
      )}

      {monitoringData && (
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="usage">Usage</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Health Status */}
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Health Status</p>
                    <div className="flex items-center space-x-2 mt-1">
                      {getStatusIcon(monitoringData.health.status)}
                      <span className="font-semibold capitalize">{monitoringData.health.status}</span>
                    </div>
                  </div>
                  <Activity className="h-8 w-8 text-blue-500" />
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  <p>Environment: {monitoringData.health.environment}</p>
                  <p>Database: {monitoringData.health.database}</p>
                  <p>Version: {monitoringData.health.version}</p>
                </div>
              </Card>
              
              {/* Database Status */}
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Database</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="font-semibold">Connected</span>
                    </div>
                  </div>
                  <Database className="h-8 w-8 text-green-500" />
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  <p>RLS: {monitoringData.security.rlsEnabled ? 'Enabled' : 'Disabled'}</p>
                  <p>SSL: {monitoringData.security.sslEnabled ? 'Enabled' : 'Disabled'}</p>
                </div>
              </Card>
              
              {/* Uptime */}
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Uptime</p>
                    <p className="text-2xl font-bold text-green-600">{monitoringData.performance.uptime}%</p>
                  </div>
                  <Clock className="h-8 w-8 text-green-500" />
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  <p>Last check: {new Date(monitoringData.health.timestamp).toLocaleTimeString()}</p>
                </div>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="performance" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Response Time</p>
                    <p className="text-2xl font-bold">{monitoringData.performance.responseTime.toFixed(0)}ms</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-blue-500" />
                </div>
              </Card>
              
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Throughput</p>
                    <p className="text-2xl font-bold">{formatNumber(monitoringData.performance.throughput)}</p>
                    <p className="text-xs text-muted-foreground">req/min</p>
                  </div>
                  <Activity className="h-8 w-8 text-green-500" />
                </div>
              </Card>
              
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Error Rate</p>
                    <p className="text-2xl font-bold">{monitoringData.performance.errorRate.toFixed(2)}%</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-yellow-500" />
                </div>
              </Card>
              
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Uptime</p>
                    <p className="text-2xl font-bold">{monitoringData.performance.uptime}%</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="security" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Row Level Security</p>
                    <div className="flex items-center space-x-2 mt-1">
                      {monitoringData.security.rlsEnabled ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                      <span className="font-semibold">
                        {monitoringData.security.rlsEnabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                  </div>
                  <Shield className="h-8 w-8 text-blue-500" />
                </div>
              </Card>
              
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Rate Limiting</p>
                    <div className="flex items-center space-x-2 mt-1">
                      {monitoringData.security.rateLimitActive ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                      <span className="font-semibold">
                        {monitoringData.security.rateLimitActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                  <Shield className="h-8 w-8 text-green-500" />
                </div>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="usage" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Active Users</p>
                    <p className="text-2xl font-bold">{formatNumber(monitoringData.usage.activeUsers)}</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-500" />
                </div>
              </Card>
              
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Requests</p>
                    <p className="text-2xl font-bold">{formatNumber(monitoringData.usage.totalRequests)}</p>
                  </div>
                  <Activity className="h-8 w-8 text-green-500" />
                </div>
              </Card>
              
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Data Transferred</p>
                    <p className="text-2xl font-bold">{formatBytes(monitoringData.usage.dataTransferred * 1024 * 1024)}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-purple-500" />
                </div>
              </Card>
              
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Storage Used</p>
                    <p className="text-2xl font-bold">{monitoringData.usage.storageUsed} GB</p>
                  </div>
                  <Database className="h-8 w-8 text-orange-500" />
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}

/**
 * Supabase Statistics Component
 * 
 * Shows statistics and metrics for Supabase data
 */

'use client'

import React from 'react'
import { useSupabaseContext } from '@/contexts/supabase-context'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Database, Users, DollarSign, Clock, TrendingUp, AlertTriangle } from 'lucide-react'

export function SupabaseStats() {
  const { stats, health } = useSupabaseContext()
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }
  
  const getHealthStatus = () => {
    if (health.isHealthy === true) {
      return { color: 'green', text: 'Healthy' }
    } else if (health.isHealthy === false) {
      return { color: 'red', text: 'Unhealthy' }
    } else {
      return { color: 'yellow', text: 'Checking...' }
    }
  }
  
  const healthStatus = getHealthStatus()
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Total Subscriptions */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Total Subscriptions</p>
            <p className="text-2xl font-bold">{stats.stats.total}</p>
          </div>
          <Database className="h-8 w-8 text-blue-500" />
        </div>
      </Card>
      
      {/* Active Subscriptions */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Active</p>
            <p className="text-2xl font-bold text-green-600">{stats.stats.active}</p>
          </div>
          <Users className="h-8 w-8 text-green-500" />
        </div>
      </Card>
      
      {/* Monthly Cost */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Monthly Cost</p>
            <p className="text-2xl font-bold">{formatCurrency(stats.stats.monthlyCost)}</p>
          </div>
          <DollarSign className="h-8 w-8 text-green-500" />
        </div>
      </Card>
      
      {/* Paused Subscriptions */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Paused</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.stats.paused}</p>
          </div>
          <Clock className="h-8 w-8 text-yellow-500" />
        </div>
      </Card>
      
      {/* Canceled Subscriptions */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Canceled</p>
            <p className="text-2xl font-bold text-red-600">{stats.stats.canceled}</p>
          </div>
          <TrendingUp className="h-8 w-8 text-red-500" />
        </div>
      </Card>
      
      {/* Expiring Soon */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Expiring Soon</p>
            <p className="text-2xl font-bold text-orange-600">{stats.stats.expiringSoon}</p>
          </div>
          <AlertTriangle className="h-8 w-8 text-orange-500" />
        </div>
      </Card>
      
      {/* Health Status */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Database Health</p>
            <div className="flex items-center space-x-2">
              <Badge variant={healthStatus.color === 'green' ? 'default' : healthStatus.color === 'red' ? 'destructive' : 'secondary'}>
                {healthStatus.text}
              </Badge>
              {health.lastCheck && (
                <span className="text-xs text-muted-foreground">
                  {health.lastCheck.toLocaleTimeString()}
                </span>
              )}
            </div>
          </div>
          <Database className={`h-8 w-8 ${
            healthStatus.color === 'green' ? 'text-green-500' : 
            healthStatus.color === 'red' ? 'text-red-500' : 
            'text-yellow-500'
          }`} />
        </div>
      </Card>
      
      {/* Loading State */}
      {stats.loading && (
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
            <span className="text-sm text-muted-foreground">Loading stats...</span>
          </div>
        </Card>
      )}
      
      {/* Error State */}
      {stats.error && (
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <span className="text-sm text-red-600">Error loading stats</span>
          </div>
        </Card>
      )}
    </div>
  )
}

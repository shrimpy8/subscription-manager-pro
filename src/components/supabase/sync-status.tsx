/**
 * Supabase Sync Status Component
 * 
 * Shows sync status, health, and provides sync controls
 */

'use client'

import React from 'react'
import { useSupabaseContext } from '@/contexts/supabase-context'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { RefreshCw, Wifi, WifiOff, CheckCircle, XCircle, AlertCircle } from 'lucide-react'

export function SyncStatus() {
  const { subscriptions, health } = useSupabaseContext()
  
  const getStatusIcon = () => {
    if (!subscriptions.isOnline) {
      return <WifiOff className="h-4 w-4 text-red-500" />
    }
    
    if (health.isHealthy === true) {
      return <CheckCircle className="h-4 w-4 text-green-500" />
    } else if (health.isHealthy === false) {
      return <XCircle className="h-4 w-4 text-red-500" />
    } else {
      return <AlertCircle className="h-4 w-4 text-yellow-500" />
    }
  }
  
  const getStatusText = () => {
    if (!subscriptions.isOnline) {
      return 'Offline'
    }
    
    if (health.isHealthy === true) {
      return 'Connected'
    } else if (health.isHealthy === false) {
      return 'Disconnected'
    } else {
      return 'Checking...'
    }
  }
  
  const getStatusColor = () => {
    if (!subscriptions.isOnline) {
      return 'destructive'
    }
    
    if (health.isHealthy === true) {
      return 'default'
    } else if (health.isHealthy === false) {
      return 'destructive'
    } else {
      return 'secondary'
    }
  }
  
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {getStatusIcon()}
          <div>
            <p className="text-sm font-medium">Supabase Status</p>
            <div className="flex items-center space-x-2">
              <Badge variant={getStatusColor()}>
                {getStatusText()}
              </Badge>
              {subscriptions.lastSync && (
                <span className="text-xs text-muted-foreground">
                  Last sync: {subscriptions.lastSync.toLocaleTimeString()}
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={subscriptions.refreshSubscriptions}
            disabled={subscriptions.loading}
          >
            <RefreshCw className={`h-4 w-4 ${subscriptions.loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={health.checkHealth}
            disabled={health.error !== null}
          >
            <Wifi className="h-4 w-4" />
            Check Health
          </Button>
        </div>
      </div>
      
      {subscriptions.error && (
        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
          {subscriptions.error}
        </div>
      )}
      
      {health.error && (
        <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-700">
          Health check error: {health.error}
        </div>
      )}
    </Card>
  )
}

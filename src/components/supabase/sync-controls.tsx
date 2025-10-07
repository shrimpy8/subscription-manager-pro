/**
 * Supabase Sync Controls Component
 * 
 * Provides controls for data synchronization between localStorage and Supabase
 */

'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { SupabaseSync } from '@/lib/supabase-sync'
import { Upload, Download, RefreshCw, Database, HardDrive } from 'lucide-react'

export function SyncControls() {
  const [syncing, setSyncing] = useState(false)
  const [syncResult, setSyncResult] = useState<{
    success: boolean
    message: string
    details?: string
  } | null>(null)
  
  const handleSyncToSupabase = async () => {
    setSyncing(true)
    setSyncResult(null)
    
    try {
      const result = await SupabaseSync.syncToSupabase({
        resolveConflicts: 'local',
        batchSize: 200
      })
      
      setSyncResult({
        success: result.success,
        message: result.success 
          ? `Synced ${result.syncedCount} subscriptions to Supabase`
          : 'Sync failed',
        details: result.errors.length > 0 ? result.errors.join(', ') : undefined
      })
    } catch (error) {
      setSyncResult({
        success: false,
        message: 'Sync failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setSyncing(false)
    }
  }
  
  const handleSyncFromSupabase = async () => {
    setSyncing(true)
    setSyncResult(null)
    
    try {
      const result = await SupabaseSync.syncFromSupabase({
        resolveConflicts: 'remote',
        batchSize: 200
      })
      
      setSyncResult({
        success: result.success,
        message: result.success 
          ? `Synced ${result.syncedCount} subscriptions from Supabase`
          : 'Sync failed',
        details: result.errors.length > 0 ? result.errors.join(', ') : undefined
      })
    } catch (error) {
      setSyncResult({
        success: false,
        message: 'Sync failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setSyncing(false)
    }
  }
  
  const handleBidirectionalSync = async () => {
    setSyncing(true)
    setSyncResult(null)
    
    try {
      const result = await SupabaseSync.syncBidirectional({
        resolveConflicts: 'local',
        batchSize: 200
      })
      
      setSyncResult({
        success: result.success,
        message: result.success 
          ? `Bidirectional sync completed: ${result.syncedCount} subscriptions`
          : 'Sync failed',
        details: result.errors.length > 0 ? result.errors.join(', ') : undefined
      })
    } catch (error) {
      setSyncResult({
        success: false,
        message: 'Sync failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setSyncing(false)
    }
  }
  
  const handleMigrateToSupabase = async () => {
    setSyncing(true)
    setSyncResult(null)
    
    try {
      const result = await SupabaseSync.migrateToSupabase()
      
      setSyncResult({
        success: result.success,
        message: result.success 
          ? `Migration completed: ${result.migrated} subscriptions migrated`
          : 'Migration failed',
        details: result.errors.length > 0 ? result.errors.join(', ') : undefined
      })
    } catch (error) {
      setSyncResult({
        success: false,
        message: 'Migration failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setSyncing(false)
    }
  }
  
  return (
    <Card className="p-4">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">Data Synchronization</h3>
          <p className="text-sm text-muted-foreground">
            Manage data between localStorage and Supabase
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Sync to Supabase */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="w-full" disabled={syncing}>
                <Upload className="h-4 w-4 mr-2" />
                Sync to Supabase
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Sync to Supabase</AlertDialogTitle>
                <AlertDialogDescription>
                  This will upload your local subscriptions to Supabase. 
                  Local data will take precedence in case of conflicts.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleSyncToSupabase}>
                  Sync to Supabase
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          
          {/* Sync from Supabase */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="w-full" disabled={syncing}>
                <Download className="h-4 w-4 mr-2" />
                Sync from Supabase
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Sync from Supabase</AlertDialogTitle>
                <AlertDialogDescription>
                  This will download subscriptions from Supabase to your local storage. 
                  Remote data will take precedence in case of conflicts.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleSyncFromSupabase}>
                  Sync from Supabase
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          
          {/* Bidirectional Sync */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="w-full" disabled={syncing}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Bidirectional Sync
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Bidirectional Sync</AlertDialogTitle>
                <AlertDialogDescription>
                  This will merge data from both localStorage and Supabase. 
                  Local data will take precedence in case of conflicts.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleBidirectionalSync}>
                  Bidirectional Sync
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          
          {/* Migrate to Supabase */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="w-full" disabled={syncing}>
                <Database className="h-4 w-4 mr-2" />
                Migrate to Supabase
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Migrate to Supabase</AlertDialogTitle>
                <AlertDialogDescription>
                  This will migrate all your local subscriptions to Supabase. 
                  This is a one-way migration and will not affect your local data.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleMigrateToSupabase}>
                  Migrate to Supabase
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
        
        {/* Sync Result */}
        {syncResult && (
          <div className={`p-3 rounded border ${
            syncResult.success 
              ? 'bg-green-50 border-green-200 text-green-700'
              : 'bg-red-50 border-red-200 text-red-700'
          }`}>
            <div className="flex items-center space-x-2">
              <Badge variant={syncResult.success ? 'default' : 'destructive'}>
                {syncResult.success ? 'Success' : 'Error'}
              </Badge>
              <span className="text-sm font-medium">{syncResult.message}</span>
            </div>
            {syncResult.details && (
              <p className="text-xs mt-1 text-muted-foreground">
                {syncResult.details}
              </p>
            )}
          </div>
        )}
        
        {/* Loading State */}
        {syncing && (
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span>Synchronizing data...</span>
          </div>
        )}
      </div>
    </Card>
  )
}

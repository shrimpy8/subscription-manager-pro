/**
 * Main Supabase Integration Component
 * 
 * Combines all Supabase components into a single interface
 */

'use client'

import React from 'react'
import { SupabaseProvider } from '@/contexts/supabase-context'
import { SyncStatus } from './sync-status'
import { SyncControls } from './sync-controls'
import { SupabaseStats } from './supabase-stats'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export function SupabaseIntegration() {
  return (
    <SupabaseProvider>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Supabase Integration</h2>
          <p className="text-muted-foreground">
            Manage your subscription data with Supabase backend
          </p>
        </div>
        
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="sync">Synchronization</TabsTrigger>
            <TabsTrigger value="stats">Statistics</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <SyncStatus />
            <SupabaseStats />
          </TabsContent>
          
          <TabsContent value="sync" className="space-y-4">
            <SyncControls />
          </TabsContent>
          
          <TabsContent value="stats" className="space-y-4">
            <SupabaseStats />
          </TabsContent>
          
          <TabsContent value="settings" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Connection Settings</h3>
                <div className="space-y-2">
                  <div>
                    <label className="text-sm font-medium">Supabase URL</label>
                    <p className="text-xs text-muted-foreground">
                      {process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:55421'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Environment</label>
                    <p className="text-xs text-muted-foreground">Local Development</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Sync Settings</h3>
                <div className="space-y-2">
                  <div>
                    <label className="text-sm font-medium">Auto-sync</label>
                    <p className="text-xs text-muted-foreground">Disabled</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Conflict Resolution</label>
                    <p className="text-xs text-muted-foreground">Local data takes precedence</p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </SupabaseProvider>
  )
}

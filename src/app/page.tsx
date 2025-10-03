"use client";

import { useState, useEffect, memo, useMemo, useCallback } from 'react';
import { Plus, Search, Grid, List, BarChart3, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { Subscription, SubscriptionFilters, ViewMode } from '@/types/subscription';
import { loadSubscriptions, saveSubscriptions, exportSubscriptionsToCSV, downloadCSV } from '@/lib/subscription-persistence';
import { handleSubscriptionError } from '@/utils/error-handler';
import { formatCurrency, getDaysUntilRenewal, getStatusColor, getPriorityColor, generateId, toDate, getDefaultRenewalDate, getCurrentDate, formatDate } from '@/lib/utils';
import { AdvancedFilters } from '@/components/advanced-filters';
import AIToolsBrowser from '@/components/ai-tools-browser';
import Sidebar from '@/components/sidebar';
import { ErrorBoundary } from '@/components/error-boundary';
import SubscriptionsTable from '@/components/subscriptions-table';
import SubscriptionDetailsModal from '@/components/subscription-details-modal';
import EditSubscriptionModal from '@/components/edit-subscription-modal';
import { useMultipleLoadingStates } from '@/hooks/use-loading-state';
import { LoadingPage } from '@/components/ui/loading-spinner';

export default function HomePage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [filters, setFilters] = useState<SubscriptionFilters>({
    search: '',
    category: 'all',
    subcategory: 'all',
    status: 'all',
    billingCycle: 'all',
    priority: 'all',
    usageFrequency: 'all',
    costRange: { min: 0, max: 1000 },
    tags: [],
    showExpiringSoon: false,
    showUnused: false
  });
  const [viewMode, setViewMode] = useState<ViewMode>({
    type: 'grid',
    sortBy: 'name',
    sortOrder: 'asc',
    groupBy: undefined
  });
  // Unified loading state management
  const loadingStates = useMultipleLoadingStates(['initial', 'export', 'save', 'delete', 'add']);
  const { initial, export: exportLoading, save, delete: deleteLoading, add } = loadingStates;
  const [currentTab, setCurrentTab] = useState<'subscriptions' | 'ai-tools'>('subscriptions');
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  
  // Handle URL parameters to set the current tab
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const tab = urlParams.get('tab');
      if (tab === 'ai-tools') {
        setCurrentTab('ai-tools');
      } else {
        setCurrentTab('subscriptions');
      }
    }
  }, []);

  // Simple test to see if client-side JS is working
  if (typeof window !== 'undefined') {
    // Client-side JavaScript is executing
  }

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;
    
    const loadData = async () => {
      try {
        initial.setLoading(true, 'Loading subscriptions...');
        const loadedSubscriptions = await loadSubscriptions();
        setSubscriptions(loadedSubscriptions);
      } catch (error) {
        handleSubscriptionError(
          error as Error,
          'loading initial data',
          { component: 'main-page' }
        );
        initial.setError('Failed to load subscriptions');
        setSubscriptions([]);
      } finally {
        initial.setLoading(false);
      }
    };

    loadData();
  }, []); // Remove initial from dependencies to prevent infinite loop

  // Filter and sort subscriptions
  const filteredSubscriptions = useMemo(() => {
    return subscriptions
    .filter(sub => {
      const matchesSearch = sub.name.toLowerCase().includes(filters.search.toLowerCase()) ||
                           sub.plan.toLowerCase().includes(filters.search.toLowerCase());
      const matchesCategory = filters.category === 'all' || sub.category === filters.category;
      
      // Subcategory filtering - only apply when category is AI Tools
      const matchesSubcategory = filters.subcategory === 'all' || 
        (filters.category === 'AI Tools' && sub.subcategory === filters.subcategory) ||
        (filters.category !== 'AI Tools');
      
      const matchesStatus = filters.status === 'all' || sub.status === filters.status;
      const matchesPriority = filters.priority === 'all' || sub.priority === filters.priority;
      const matchesUsage = filters.usageFrequency === 'all' || sub.usageFrequency === filters.usageFrequency;
      const matchesCost = sub.cost >= filters.costRange.min && sub.cost <= filters.costRange.max;
      
      // AI Tools Tracker enhanced filtering
      const matchesExpiringSoon = !filters.showExpiringSoon || getDaysUntilRenewal(sub.renewalDate) <= 7;
      const matchesUnused = !filters.showUnused || sub.usageFrequency === 'rarely';
      
      return matchesSearch && matchesCategory && matchesSubcategory && matchesStatus && matchesPriority && 
             matchesUsage && matchesCost && matchesExpiringSoon && matchesUnused;
    })
    .sort((a, b) => {
      let aValue: string | number | Date = a[viewMode.sortBy] as string | number | Date;
      let bValue: string | number | Date = b[viewMode.sortBy] as string | number | Date;
      
      if (viewMode.sortBy === 'cost') {
        aValue = a.cost;
        bValue = b.cost;
      } else if (viewMode.sortBy === 'renewalDate') {
        aValue = toDate(a.renewalDate);
        bValue = toDate(b.renewalDate);
      } else if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (viewMode.sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  }, [subscriptions, filters, viewMode]);

  const totalMonthlyCost = useMemo(() => {
    return subscriptions
      .filter(sub => sub.status === 'active')
      .reduce((sum, sub) => sum + sub.cost, 0);
  }, [subscriptions]);

  const activeSubscriptions = useMemo(() => {
    return subscriptions.filter(sub => sub.status === 'active').length;
  }, [subscriptions]);

  const expiringSoon = useMemo(() => {
    return subscriptions.filter(sub => 
      sub.status === 'active' && getDaysUntilRenewal(sub.renewalDate) <= 7
    ).length;
  }, [subscriptions]);

  if (initial.isLoading) {
    return <LoadingPage message={initial.loadingMessage || 'Loading subscriptions...'} />;
  }

  // Error banner component
  const ErrorBanner = () => {
    const hasError = initial.error || exportLoading.error || save.error || deleteLoading.error || add.error;
    if (!hasError) return null;
    
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-800">{initial.error || exportLoading.error || save.error || deleteLoading.error || add.error}</p>
          </div>
          <div className="ml-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <button
                type="button"
                className="inline-flex bg-red-50 rounded-md p-1.5 text-red-500 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-red-50 focus:ring-red-600"
                onClick={() => {
                  initial.clearError();
                  exportLoading.clearError();
                  save.clearError();
                  deleteLoading.clearError();
                  add.clearError();
                }}
              >
                <span className="sr-only">Dismiss</span>
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      {/* Sidebar */}
      <Sidebar 
        currentTab={currentTab} 
        onTabChange={setCurrentTab}
      />

      {/* Main Content Area */}
      <div className="md:ml-64 min-h-screen">
        {/* Top Header Bar */}
        <header className="glass-card border-b border-orange-200/50 sticky top-0 z-30">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <h2 className="section-title">
                  {currentTab === 'subscriptions' ? 'Subscriptions' : 'Trending AI Tools'}
                </h2>
                <Badge variant="secondary" className="btn-secondary">
                  {currentTab === 'subscriptions' ? `${activeSubscriptions} Active` : '50 Tools'}
                </Badge>
              </div>
              
              {currentTab === 'subscriptions' && (
                <div className="flex items-center space-x-4">
                  <Button 
                    variant="outline"
                    disabled={exportLoading.isLoading}
                    onClick={async () => {
                      try {
                        exportLoading.setLoading(true, 'Exporting subscriptions...');
                        exportLoading.clearError();
                        const csvContent = exportSubscriptionsToCSV(subscriptions);
                        downloadCSV(csvContent, `subscriptions-${formatDate(getCurrentDate(), 'input')}.csv`);
                      } catch (error) {
                        exportLoading.setError('Failed to export subscriptions. Please try again.');
                        handleSubscriptionError(
                          error as Error,
                          'exporting subscriptions',
                          { component: 'main-page' }
                        );
                      } finally {
                        exportLoading.setLoading(false);
                      }
                    }}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    {exportLoading.isLoading ? (exportLoading.loadingMessage || 'Exporting...') : 'Export CSV'}
                  </Button>
                  <Button 
                    className="btn-primary"
                    onClick={() => window.location.href = '/ai-tool-form'}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Subscription
                  </Button>
                </div>
              )}
              
              {currentTab === 'ai-tools' && (
                <div className="flex items-center space-x-4">
                  <Button 
                    className="btn-primary"
                    onClick={() => window.location.href = '/add-ai-tool'}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add AI Tool
                  </Button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main Content */}
        {currentTab === 'subscriptions' ? (
          <ErrorBoundary>
            <div className="px-4 sm:px-6 lg:px-8 py-8">
              <ErrorBanner />
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 section-spacing">
          <Card className="subscription-card">
            <CardHeader className="pb-2">
              <CardTitle className="card-subtitle">Monthly Cost</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {formatCurrency(totalMonthlyCost)}
              </div>
            </CardContent>
          </Card>
          
          <Card className="subscription-card">
            <CardHeader className="pb-2">
              <CardTitle className="card-subtitle">Active Subscriptions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{activeSubscriptions}</div>
            </CardContent>
          </Card>
          
          <Card className="subscription-card">
            <CardHeader className="pb-2">
              <CardTitle className="card-subtitle">Expiring Soon</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{expiringSoon}</div>
            </CardContent>
          </Card>
        </div>

        {/* Search and View Controls */}
        <Card className="subscription-card card-spacing">
          <CardContent className="pt-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search subscriptions..."
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    className="pl-10"
                  />
                </div>
              </div>
              
              {/* View Mode Toggle */}
              <div className="flex items-center space-x-2">
                <Button
                  variant={viewMode.type === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode(prev => ({ ...prev, type: 'grid' }))}
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode.type === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode(prev => ({ ...prev, type: 'list' }))}
                >
                  <List className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode.type === 'analytics' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode(prev => ({ ...prev, type: 'analytics' }))}
                >
                  <BarChart3 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Advanced Filters - AI Tools Tracker Feature */}
        <AdvancedFilters
          filters={filters}
          onFiltersChange={(newFilters) => setFilters(prev => ({ ...prev, ...newFilters }))}
          onClearFilters={() => setFilters({
            search: '',
            category: 'all',
            subcategory: 'all',
            status: 'all',
            billingCycle: 'all',
            priority: 'all',
            usageFrequency: 'all',
            costRange: { min: 0, max: 1000 },
            tags: [],
            showExpiringSoon: false,
            showUnused: false
          })}
        />

        {/* Main Content */}
        <Tabs value={viewMode.type} onValueChange={(value) => setViewMode(prev => ({ ...prev, type: value as "grid" | "list" | "analytics" }))}>
          <TabsContent value="grid" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSubscriptions.map((subscription) => (
                <Card key={subscription.id} className="subscription-card">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                          <span className="text-orange-600 font-semibold text-sm">
                            {subscription.name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <CardTitle className="text-lg">{subscription.name}</CardTitle>
                          <p className="text-sm text-gray-600">{subscription.plan}</p>
                        </div>
                      </div>
                      <Badge className={getStatusColor(subscription.status)}>
                        {subscription.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-orange-600">
                        {formatCurrency(subscription.cost, subscription.currency)}
                      </span>
                      <Badge className={getPriorityColor(subscription.priority)}>
                        {subscription.priority}
                      </Badge>
                    </div>
                    
                    <div className="text-sm text-gray-600">
                      <p>Renews in {getDaysUntilRenewal(subscription.renewalDate)} days</p>
                      <p>Category: {subscription.category}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="list" className="space-y-4">
            <SubscriptionsTable
              subscriptions={filteredSubscriptions}
              onEdit={(subscription) => {
                setSelectedSubscription(subscription);
                setIsEditModalOpen(true);
              }}
              onDuplicate={async (subscription) => {
                const duplicated = {
                  ...subscription,
                  id: generateId(),
                  name: `${subscription.name} (Copy)`,
                  status: 'active' as const,
                  startDate: getCurrentDate(),
                  renewalDate: getDefaultRenewalDate()
                };
                const updatedSubscriptions = [...subscriptions, duplicated];
                setSubscriptions(updatedSubscriptions);
                save.setLoading(true, 'Saving subscription...');
                try {
                  await saveSubscriptions(updatedSubscriptions);
                } catch (error) {
                  save.setError('Failed to save subscription. Please try again.');
                  handleSubscriptionError(
                    error as Error,
                    'duplicating subscription',
                    { component: 'main-page' }
                  );
                } finally {
                  save.setLoading(false);
                }
              }}
              onDelete={async (subscription) => {
                if (confirm(`Are you sure you want to delete ${subscription.name}?`)) {
                  const updatedSubscriptions = subscriptions.filter(s => s.id !== subscription.id);
                  setSubscriptions(updatedSubscriptions);
                  save.setLoading(true, 'Saving subscription...');
                  try {
                    await saveSubscriptions(updatedSubscriptions);
                  } catch (error) {
                    deleteLoading.setError('Failed to delete subscription. Please try again.');
                    handleSubscriptionError(
                      error as Error,
                      'deleting subscription',
                      { component: 'main-page' }
                    );
                  } finally {
                    save.setLoading(false);
                  }
                }
              }}
              onPause={async (subscription) => {
                const updatedSubscriptions = subscriptions.map(s => 
                  s.id === subscription.id 
                    ? { ...s, status: s.status === 'paused' ? 'active' as const : 'paused' as const }
                    : s
                );
                setSubscriptions(updatedSubscriptions);
                save.setLoading(true, 'Saving subscription...');
                try {
                  await saveSubscriptions(updatedSubscriptions);
                } catch (error) {
                  save.setError('Failed to update subscription status. Please try again.');
                  handleSubscriptionError(
                    error as Error,
                    'updating subscription status',
                    { component: 'main-page' }
                  );
                } finally {
                  save.setLoading(false);
                }
              }}
              onViewDetails={(subscription) => {
                setSelectedSubscription(subscription);
                setIsDetailsModalOpen(true);
              }}
            />
          </TabsContent>
          
          <TabsContent value="analytics" className="space-y-4">
            <Card className="subscription-card">
              <CardHeader>
                <CardTitle>Analytics Dashboard</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Analytics features coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>
          </Tabs>
          </div>
          </ErrorBoundary>
        ) : (
          <ErrorBoundary>
            <div className="px-4 sm:px-6 lg:px-8 py-8">
              <ErrorBanner />
              <AIToolsBrowser
              onAddToSubscriptions={async (tool) => {
                // Create new subscription from AI tool
                const newSubscription: Subscription = {
                  id: generateId(),
                  name: tool.name,
                  category: 'AI Tools',
                  subcategory: tool.category, // Use AI tool category as subcategory
                  status: 'active',
                  cost: 0,
                  billingCycle: 'Monthly',
                  renewalDate: getDefaultRenewalDate(),
                  startDate: getCurrentDate(),
                  priority: 'medium',
                  usageFrequency: 'monthly',
                  url: tool.url,
                  description: `AI tool from ${tool.category} category`,
                  notes: `Added from AI Tools Browser - ${tool.category} category`,
                  accountEmail: '',
                  autoRenew: true,
                  plan: 'Free',
                  logo: `https://www.google.com/s2/favicons?domain=${new URL(tool.url).hostname}&sz=64`,
                  fallbackIcon: tool.fallbackIcon,
                  currency: 'USD'
                };
                
                const updatedSubscriptions = [...subscriptions, newSubscription];
                setSubscriptions(updatedSubscriptions);
                save.setLoading(true, 'Saving subscription...');
                try {
                  await saveSubscriptions(updatedSubscriptions);
                } catch (error) {
                  add.setError('Failed to add subscription. Please try again.');
                  handleSubscriptionError(
                    error as Error,
                    'adding subscription from AI tool',
                    { component: 'main-page' }
                  );
                } finally {
                  save.setLoading(false);
                }
                
                // Silent action - no alert needed
              }}
              onMarkAsUsing={(tool) => {
                // Silent action - no alert needed
              }}
            />
          </div>
          </ErrorBoundary>
        )}
        </div>

      {/* Modals */}
      <ErrorBoundary>
      <SubscriptionDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedSubscription(null);
        }}
        subscription={selectedSubscription}
      />

      <EditSubscriptionModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedSubscription(null);
        }}
        subscription={selectedSubscription}
        onSave={async (updatedSubscription) => {
          const updatedSubscriptions = subscriptions.map(s => 
            s.id === updatedSubscription.id ? updatedSubscription : s
          );
          setSubscriptions(updatedSubscriptions);
          await saveSubscriptions(updatedSubscriptions);
        }}
      />
      </ErrorBoundary>
    </div>
  );
}
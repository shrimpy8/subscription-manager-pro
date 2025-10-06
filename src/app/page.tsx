"use client";

import { useState, useEffect, useMemo } from 'react';
import { Plus, Download } from 'lucide-react';
// import { PremiumButton } from '@/components/ui/premium-button';
import PageHeader from '@/components/ui/page-header';
// import { Badge } from '@/components/ui/badge';
import { Subscription, SubscriptionFilters, ViewMode } from '@/types/subscription';
import { loadSubscriptions, saveSubscriptions, exportSubscriptionsToCSV, downloadCSV } from '@/lib/subscription-persistence';
import { handleSubscriptionError } from '@/utils/error-handler';
import { generateId, toDate, getDefaultRenewalDate, getCurrentDate, formatDate, getDaysUntilRenewal } from '@/lib/utils';
import AIToolsBrowser from '@/components/ai-tools-browser';
import Sidebar from '@/components/sidebar';
import { ErrorBoundary } from '@/components/error-boundary';
import SubscriptionDetailsModal from '@/components/subscription-details-modal';
import DeleteConfirmationDialog from '@/components/delete-confirmation-dialog';
import { useMultipleLoadingStates } from '@/hooks/use-loading-state';
import { LoadingPage } from '@/components/ui/loading-spinner';
import { ToastContainer, useToast } from '@/components/ui/toast';
import { getUserFriendlyMessage } from '@/utils/error-messages';
import { PremiumDashboard } from '@/components/dashboard/premium-dashboard';

export default function HomePage() {
  const toast = useToast();

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
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  const [subscriptionToDelete, setSubscriptionToDelete] = useState<Subscription | null>(null);
  
  // Handle URL parameters to set the current tab and view mode (validated/coerced)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const tab = (urlParams.get('tab') || '').toLowerCase();
      const view = (urlParams.get('view') || '').toLowerCase();
      
      if (tab === 'ai-tools') {
        setCurrentTab('ai-tools');
      } else {
        setCurrentTab('subscriptions');
      }
      
      // Set view mode based on URL parameter
      if (view === 'list') {
        setViewMode(prev => ({ ...prev, type: 'list' }));
      } else if (view === 'grid') {
        setViewMode(prev => ({ ...prev, type: 'grid' }));
      } else if (view === 'analytics') {
        setViewMode(prev => ({ ...prev, type: 'analytics' }));
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
        // Removed success message to prevent multiple toasts on navigation
      } catch (error) {
        handleSubscriptionError(
          error as Error,
          'loading initial data',
          { component: 'main-page' }
        );
        const errorMessage = getUserFriendlyMessage('LOAD_ERROR');
        initial.setError(errorMessage);
        toast.error(errorMessage);
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

  const activeSubscriptions = useMemo(() => {
    return subscriptions.filter(sub => sub.status === 'active').length;
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
    <div className="min-h-screen bg-gradient-to-br from-neutral-100 to-neutral-200">
      {/* Sidebar */}
      <Sidebar 
        currentTab={currentTab} 
        onTabChange={setCurrentTab}
      />

      {/* Main Content Area */}
      <div className="md:ml-64 min-h-screen">
        <PageHeader
          title={currentTab === 'subscriptions' ? 'Subscriptions' : 'Trending AI Tools'}
          badgeText={currentTab === 'subscriptions' ? `${activeSubscriptions} Active` : '50 Tools'}
          actions={currentTab === 'subscriptions' ? [
            {
              key: 'export',
              label: exportLoading.isLoading ? (exportLoading.loadingMessage || 'Exporting...') : 'Export CSV',
              variant: 'secondary',
              disabled: exportLoading.isLoading,
              loading: exportLoading.isLoading,
              iconLeft: <Download className="w-4 h-4 mr-2" />,
              onClick: async () => {
                try {
                  exportLoading.setLoading(true, 'Exporting subscriptions...');
                  exportLoading.clearError();
                  const csvContent = exportSubscriptionsToCSV(subscriptions);
                  downloadCSV(csvContent, `subscriptions-${formatDate(getCurrentDate(), 'input')}.csv`);
                  toast.success(`Successfully exported ${subscriptions.length} subscriptions!`);
                } catch (error) {
                  const errorMessage = getUserFriendlyMessage('EXPORT_ERROR');
                  exportLoading.setError(errorMessage);
                  toast.error(errorMessage);
                  handleSubscriptionError(
                    error as Error,
                    'exporting subscriptions',
                    { component: 'main-page' }
                  );
                } finally {
                  exportLoading.setLoading(false);
                }
              }
            },
            {
              key: 'add-sub',
              label: 'Add Subscription',
              variant: 'orange-gradient',
              iconLeft: <Plus className="w-4 h-4 mr-2" />,
              onClick: () => (window.location.href = '/ai-tool-form')
            }
          ] : [
            {
              key: 'add-ai',
              label: 'Add AI Tool',
              variant: 'orange-gradient',
              iconLeft: <Plus className="w-4 h-4 mr-2" />,
              onClick: () => (window.location.href = '/add-ai-tool')
            }
          ]}
        />

        {/* Main Content */}
        {currentTab === 'subscriptions' ? (
          <ErrorBoundary>
            <PremiumDashboard
              subscriptions={subscriptions}
              filteredSubscriptions={filteredSubscriptions}
              filters={filters}
              viewMode={viewMode}
              loadingStates={loadingStates}
              onFiltersChange={setFilters}
              onViewModeChange={(mode) => setViewMode(prev => ({ ...prev, type: mode }))}
              onEdit={(subscription) => {
                window.location.href = `/update-subscription/${subscription.id}`;
              }}
              onDuplicate={async (subscription) => {
                const duplicated = {
                  ...subscription,
                  id: generateId(),
                  name: `${subscription.name}_Copy`,
                  status: 'active' as const,
                  startDate: getCurrentDate(),
                  renewalDate: getDefaultRenewalDate()
                };
                const updatedSubscriptions = [...subscriptions, duplicated];
                
                // Update state and force re-render
                setSubscriptions(updatedSubscriptions);
                setViewMode(prev => ({ ...prev, type: 'list' }));
                
                save.setLoading(true, 'Saving subscription...');
                try {
                  await saveSubscriptions(updatedSubscriptions);
                  toast.success(`Successfully duplicated "${subscription.name}"!`);
                  
                  // Force a state refresh to ensure UI updates
                  setTimeout(() => {
                    setSubscriptions(prev => [...prev]);
                  }, 100);
                } catch (error) {
                  const errorMessage = getUserFriendlyMessage('SAVE_ERROR');
                  save.setError(errorMessage);
                  toast.error(errorMessage);
                  handleSubscriptionError(
                    error as Error,
                    'duplicating subscription',
                    { component: 'main-page' }
                  );
                } finally {
                  save.setLoading(false);
                }
              }}
              onDelete={(subscription) => {
                setSubscriptionToDelete(subscription);
                setIsDeleteDialogOpen(true);
              }}
              onPause={async (subscription) => {
                const updatedSubscriptions = subscriptions.map(s => 
                  s.id === subscription.id 
                    ? { ...s, status: s.status === 'paused' ? 'active' as const : 'paused' as const }
                    : s
                );
                setSubscriptions(updatedSubscriptions);
                setViewMode(prev => ({ ...prev, type: 'list' }));
                save.setLoading(true, 'Saving subscription...');
                try {
                  await saveSubscriptions(updatedSubscriptions);
                  toast.success(`Successfully updated "${subscription.name}" status!`);
                  
                  // Force a state refresh to ensure UI updates
                  setTimeout(() => {
                    setSubscriptions(prev => [...prev]);
                  }, 100);
                } catch (error) {
                  const errorMessage = getUserFriendlyMessage('SAVE_ERROR');
                  save.setError(errorMessage);
                  toast.error(errorMessage);
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
              onExport={async () => {
                try {
                  exportLoading.setLoading(true, 'Exporting subscriptions...');
                  exportLoading.clearError();
                  const csvContent = exportSubscriptionsToCSV(subscriptions);
                  downloadCSV(csvContent, `subscriptions-${formatDate(getCurrentDate(), 'input')}.csv`);
                  toast.success(`Successfully exported ${subscriptions.length} subscriptions!`);
                } catch (error) {
                  const errorMessage = getUserFriendlyMessage('EXPORT_ERROR');
                  exportLoading.setError(errorMessage);
                  toast.error(errorMessage);
                  handleSubscriptionError(
                    error as Error,
                    'exporting subscriptions',
                    { component: 'main-page' }
                  );
                } finally {
                  exportLoading.setLoading(false);
                }
              }}
            />
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
                  toast.success(`Successfully added "${tool.name}" to your subscriptions!`);
                } catch (error) {
                  const errorMessage = getUserFriendlyMessage('SAVE_ERROR');
                  add.setError(errorMessage);
                  toast.error(errorMessage);
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


      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setSubscriptionToDelete(null);
        }}
        onConfirm={async () => {
          if (!subscriptionToDelete) return;
          
          const updatedSubscriptions = subscriptions.filter(s => s.id !== subscriptionToDelete.id);
          setSubscriptions(updatedSubscriptions);
          setViewMode(prev => ({ ...prev, type: 'list' }));
          deleteLoading.setLoading(true, 'Deleting subscription...');
          
          try {
            await saveSubscriptions(updatedSubscriptions);
            setIsDeleteDialogOpen(false);
            setSubscriptionToDelete(null);
            toast.success(`Successfully deleted "${subscriptionToDelete.name}"!`);
            
            // Force a state refresh to ensure UI updates
            setTimeout(() => {
              setSubscriptions(prev => [...prev]);
            }, 100);
          } catch (error) {
            const errorMessage = getUserFriendlyMessage('DELETE_ERROR');
            deleteLoading.setError(errorMessage);
            toast.error(errorMessage);
            handleSubscriptionError(
              error as Error,
              'deleting subscription',
              { component: 'main-page' }
            );
          } finally {
            deleteLoading.setLoading(false);
          }
        }}
        subscription={subscriptionToDelete}
        isLoading={deleteLoading.isLoading}
      />
      </ErrorBoundary>
      
      {/* Toast Notifications */}
      <ToastContainer />
    </div>
  );
}
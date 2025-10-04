/**
 * Premium Dashboard Component
 * Apple-inspired design with enhanced visual hierarchy
 */

import { useState, useEffect } from 'react';
import { Plus, Search, Grid, List, BarChart3, Download, TrendingUp, DollarSign, CheckCircle, PiggyBank } from 'lucide-react';
import { EnhancedCard, MetricsCard } from '@/components/ui/enhanced-card';
import { PremiumButton, ButtonGroup } from '@/components/ui/premium-button';
import { SearchInput } from '@/components/ui/enhanced-input';
import { LoadingState } from '@/components/ui/loading-states';
import { Subscription, SubscriptionFilters, ViewMode } from '@/types/subscription';
import { loadSubscriptions, saveSubscriptions, exportSubscriptionsToCSV, downloadCSV } from '@/lib/subscription-persistence';
import { formatCurrency, getDaysUntilRenewal, getStatusColor, getPriorityColor, generateId, toDate, getDefaultRenewalDate, getCurrentDate, formatDate } from '@/lib/utils';
import { AdvancedFilters } from '@/components/advanced-filters';
import AIToolsBrowser from '@/components/ai-tools-browser';
import Sidebar from '@/components/sidebar';
import { ErrorBoundary } from '@/components/error-boundary';
import SubscriptionsTable from '@/components/subscriptions-table';
import SubscriptionDetailsModal from '@/components/subscription-details-modal';
import DeleteConfirmationDialog from '@/components/delete-confirmation-dialog';
import { useMultipleLoadingStates } from '@/hooks/use-loading-state';
import { LoadingPage } from '@/components/ui/loading-spinner';
import { ToastContainer, useToast } from '@/components/ui/toast';
import { getErrorMessage, getUserFriendlyMessage } from '@/utils/error-messages';

export default function PremiumDashboard() {
  const toast = useToast();

  // State management
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [filteredSubscriptions, setFilteredSubscriptions] = useState<Subscription[]>([]);
  const [currentTab, setCurrentTab] = useState<'subscriptions' | 'ai-tools'>('subscriptions');
  const [viewMode, setViewMode] = useState<ViewMode>({ type: 'list' });
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<SubscriptionFilters>({
    category: '',
    status: '',
    priority: '',
    costRange: { min: 0, max: 1000 }
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  const [subscriptionToDelete, setSubscriptionToDelete] = useState<Subscription | null>(null);

  // Loading states
  const initial = useMultipleLoadingStates();
  const add = useMultipleLoadingStates();
  const save = useMultipleLoadingStates();
  const deleteLoading = useMultipleLoadingStates();
  const exportLoading = useMultipleLoadingStates();

  // Calculate metrics
  const totalSubscriptions = subscriptions.length;
  const totalMonthlyCost = subscriptions.reduce((sum, sub) => {
    if (sub.billingCycle === 'Monthly') return sum + sub.cost;
    if (sub.billingCycle === 'Yearly') return sum + (sub.cost / 12);
    return sum;
  }, 0);
  const activeSubscriptions = subscriptions.filter(sub => sub.status === 'active').length;
  const totalSavings = subscriptions.reduce((sum, sub) => {
    if (sub.promoDiscount) return sum + sub.promoDiscount;
    return sum;
  }, 0);

  // Load subscriptions
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const loadData = async () => {
      try {
        initial.setLoading(true, 'Loading subscriptions...');
        const loadedSubscriptions = await loadSubscriptions();
        setSubscriptions(loadedSubscriptions);
      } catch (error) {
        const errorMessage = getErrorMessage(error as Error);
        initial.setError(errorMessage);
        toast.error(errorMessage);
        setSubscriptions([]);
      } finally {
        initial.setLoading(false);
      }
    };
    loadData();
  }, [initial, toast]);

  // Handle URL parameters
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const tab = urlParams.get('tab');
      const view = urlParams.get('view');
      
      if (tab === 'ai-tools') {
        setCurrentTab('ai-tools');
      } else {
        setCurrentTab('subscriptions');
      }
      
      if (view === 'list') {
        setViewMode(prev => ({ ...prev, type: 'list' }));
      } else if (view === 'grid') {
        setViewMode(prev => ({ ...prev, type: 'grid' }));
      } else if (view === 'analytics') {
        setViewMode(prev => ({ ...prev, type: 'analytics' }));
      }
    }
  }, []);

  // Filter subscriptions
  useEffect(() => {
    let filtered = subscriptions;

    if (searchQuery) {
      filtered = filtered.filter(sub => 
        sub.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sub.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filters.category) {
      filtered = filtered.filter(sub => sub.category === filters.category);
    }

    if (filters.status) {
      filtered = filtered.filter(sub => sub.status === filters.status);
    }

    if (filters.priority) {
      filtered = filtered.filter(sub => sub.priority === filters.priority);
    }

    if (filters.costRange.min > 0 || filters.costRange.max < 1000) {
      filtered = filtered.filter(sub => 
        sub.cost >= filters.costRange.min && sub.cost <= filters.costRange.max
      );
    }

    setFilteredSubscriptions(filtered);
  }, [subscriptions, searchQuery, filters]);

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  // Handle view mode change
  const handleViewModeChange = (mode: 'list' | 'grid' | 'analytics') => {
    setViewMode({ type: mode });
  };

  // Handle subscription actions
  const handleAddSubscription = (subscription: Subscription) => {
    const newSubscription = {
      ...subscription,
      id: generateId(),
      startDate: getCurrentDate(),
      renewalDate: getDefaultRenewalDate()
    };

    const updatedSubscriptions = [...subscriptions, newSubscription];
    setSubscriptions(updatedSubscriptions);
    saveSubscriptions(updatedSubscriptions);
    toast.success(`Successfully added "${subscription.name}" to your subscriptions!`);
  };

  const handleEditSubscription = (subscription: Subscription) => {
    window.location.href = `/update-subscription/${subscription.id}`;
  };

  const handleDuplicateSubscription = async (subscription: Subscription) => {
    try {
      save.setLoading(true, 'Duplicating subscription...');
      
      const duplicatedSubscription = {
        ...subscription,
        id: generateId(),
        name: `${subscription.name} (Copy)`,
        startDate: getCurrentDate(),
        renewalDate: getDefaultRenewalDate()
      };

      const updatedSubscriptions = [...subscriptions, duplicatedSubscription];
      setSubscriptions(updatedSubscriptions);
      await saveSubscriptions(updatedSubscriptions);
      
      setViewMode(prev => ({ ...prev, type: 'list' }));
      setTimeout(() => {
        setSubscriptions(prev => [...prev]);
      }, 100);
      
      toast.success(`Successfully duplicated "${subscription.name}"!`);
    } catch (error) {
      const errorMessage = getErrorMessage(error as Error);
      save.setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      save.setLoading(false);
    }
  };

  const handleDeleteSubscription = async (subscription: Subscription) => {
    try {
      deleteLoading.setLoading(true, 'Deleting subscription...');
      
      const updatedSubscriptions = subscriptions.filter(sub => sub.id !== subscription.id);
      setSubscriptions(updatedSubscriptions);
      await saveSubscriptions(updatedSubscriptions);
      
      setViewMode(prev => ({ ...prev, type: 'list' }));
      setTimeout(() => {
        setSubscriptions(prev => [...prev]);
      }, 100);
      
      toast.success(`Successfully deleted "${subscription.name}"!`);
      setSubscriptionToDelete(null);
    } catch (error) {
      const errorMessage = getErrorMessage(error as Error);
      deleteLoading.setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      deleteLoading.setLoading(false);
    }
  };

  const handlePauseSubscription = async (subscription: Subscription) => {
    try {
      save.setLoading(true, 'Updating subscription...');
      
      const updatedSubscription = {
        ...subscription,
        status: subscription.status === 'active' ? 'paused' : 'active' as 'active' | 'paused' | 'canceled'
      };

      const updatedSubscriptions = subscriptions.map(sub => 
        sub.id === subscription.id ? updatedSubscription : sub
      );
      
      setSubscriptions(updatedSubscriptions);
      await saveSubscriptions(updatedSubscriptions);
      
      setViewMode(prev => ({ ...prev, type: 'list' }));
      setTimeout(() => {
        setSubscriptions(prev => [...prev]);
      }, 100);
      
      toast.success(`Successfully updated "${subscription.name}" status!`);
    } catch (error) {
      const errorMessage = getErrorMessage(error as Error);
      save.setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      save.setLoading(false);
    }
  };

  const handleExportSubscriptions = async () => {
    try {
      exportLoading.setLoading(true, 'Exporting subscriptions...');
      const csvContent = await exportSubscriptionsToCSV(subscriptions);
      downloadCSV(csvContent, `subscriptions-${formatDate(getCurrentDate(), 'input')}.csv`);
      toast.success(`Successfully exported ${subscriptions.length} subscriptions!`);
    } catch (error) {
      const errorMessage = getErrorMessage(error as Error);
      exportLoading.setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      exportLoading.setLoading(false);
    }
  };

  if (initial.isLoading) {
    return <LoadingPage message="Loading your subscriptions..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100">
      {/* Hero Section */}
      <div className="bg-white shadow-sm border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-display text-neutral-900">
                Subscription Manager
              </h1>
              <p className="text-body-lg text-neutral-600 mt-2">
                Manage your subscriptions with ease
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <SearchInput
                placeholder="Search subscriptions..."
                onSearch={handleSearch}
                className="w-64"
              />
              <PremiumButton variant="gradient" size="lg">
                <Plus className="h-5 w-5 mr-2" />
                Add Subscription
              </PremiumButton>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricsCard
            title="Total Subscriptions"
            value={totalSubscriptions}
            change={5}
            trend="up"
            icon={<TrendingUp className="h-4 w-4 text-primary-500" />}
          />
          <MetricsCard
            title="Monthly Cost"
            value={formatCurrency(totalMonthlyCost, 'USD')}
            change={-2}
            trend="down"
            icon={<DollarSign className="h-4 w-4 text-success-500" />}
          />
          <MetricsCard
            title="Active Services"
            value={activeSubscriptions}
            change={0}
            trend="neutral"
            icon={<CheckCircle className="h-4 w-4 text-primary-500" />}
          />
          <MetricsCard
            title="Total Savings"
            value={formatCurrency(totalSavings, 'USD')}
            change={12}
            trend="up"
            icon={<PiggyBank className="h-4 w-4 text-success-500" />}
          />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <EnhancedCard variant="elevated" padding="lg">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-h2 text-neutral-900">Subscription Overview</h2>
                <ButtonGroup>
                  <PremiumButton
                    variant={viewMode.type === 'list' ? 'primary' : 'ghost'}
                    size="sm"
                    onClick={() => handleViewModeChange('list')}
                  >
                    <List className="h-4 w-4 mr-2" />
                    List
                  </PremiumButton>
                  <PremiumButton
                    variant={viewMode.type === 'grid' ? 'primary' : 'ghost'}
                    size="sm"
                    onClick={() => handleViewModeChange('grid')}
                  >
                    <Grid className="h-4 w-4 mr-2" />
                    Grid
                  </PremiumButton>
                  <PremiumButton
                    variant={viewMode.type === 'analytics' ? 'primary' : 'ghost'}
                    size="sm"
                    onClick={() => handleViewModeChange('analytics')}
                  >
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Analytics
                  </PremiumButton>
                </ButtonGroup>
              </div>

              {viewMode.type === 'list' && (
                <SubscriptionsTable
                  subscriptions={filteredSubscriptions}
                  onEdit={handleEditSubscription}
                  onDuplicate={handleDuplicateSubscription}
                  onDelete={(sub) => setSubscriptionToDelete(sub)}
                  onPause={handlePauseSubscription}
                  onViewDetails={setSelectedSubscription}
                />
              )}

              {viewMode.type === 'grid' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredSubscriptions.map((subscription) => (
                    <EnhancedCard key={subscription.id} variant="default" hover={true}>
                      <div className="p-4">
                        <div className="flex items-center space-x-3 mb-3">
                          {getSubscriptionIcon(subscription)}
                          <div>
                            <h3 className="text-h4 text-neutral-900">{subscription.name}</h3>
                            <p className="text-body-sm text-neutral-600">{subscription.category}</p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-body-sm text-neutral-600">Cost:</span>
                            <span className="text-body-sm font-medium">{formatCurrency(subscription.cost, subscription.currency)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-body-sm text-neutral-600">Status:</span>
                            <span className={`text-body-sm font-medium ${getStatusColor(subscription.status)}`}>
                              {subscription.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    </EnhancedCard>
                  ))}
                </div>
              )}
            </EnhancedCard>
          </div>

          <div>
            <EnhancedCard variant="elevated" padding="lg">
              <h3 className="text-h3 text-neutral-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <PremiumButton variant="gradient" className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Subscription
                </PremiumButton>
                <PremiumButton variant="secondary" className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Export Data
                </PremiumButton>
                <PremiumButton variant="ghost" className="w-full">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  View Analytics
                </PremiumButton>
              </div>
            </EnhancedCard>
          </div>
        </div>
      </div>

      {/* Modals */}
      {selectedSubscription && (
        <SubscriptionDetailsModal
          subscription={selectedSubscription}
          onClose={() => setSelectedSubscription(null)}
        />
      )}

      {subscriptionToDelete && (
        <DeleteConfirmationDialog
          subscription={subscriptionToDelete}
          onClose={() => setSubscriptionToDelete(null)}
          onConfirm={() => handleDeleteSubscription(subscriptionToDelete)}
          isLoading={deleteLoading.isLoading}
        />
      )}

      <ToastContainer />
    </div>
  );
}

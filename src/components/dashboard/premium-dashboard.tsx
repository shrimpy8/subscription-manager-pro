/**
 * Premium Dashboard Component
 * Apple-inspired design with enhanced visual hierarchy
 */

import { useState, useEffect } from 'react';
import { Plus, Grid, List, BarChart3, Download, DollarSign, CheckCircle, PiggyBank, TrendingUp } from 'lucide-react';
import { EnhancedCard, MetricsCard } from '@/components/ui/enhanced-card';
import { PremiumButton, ButtonGroup } from '@/components/ui/premium-button';
import { SearchInput } from '@/components/ui/enhanced-input';
import { Subscription, SubscriptionFilters, ViewMode } from '@/types/subscription';
import { formatCurrency, getDaysUntilRenewal, getStatusColor, getPriorityColor, generateId, toDate, getDefaultRenewalDate, getCurrentDate, formatDate } from '@/lib/utils';
import EnhancedSubscriptionsTable from '@/components/enhanced-subscriptions-table';
import SubscriptionDetailsModal from '@/components/subscription-details-modal';
import DeleteConfirmationDialog from '@/components/delete-confirmation-dialog';
import { LoadingPage } from '@/components/ui/loading-spinner';
import { ToastContainer, useToast } from '@/components/ui/toast';

interface PremiumDashboardProps {
  subscriptions: Subscription[];
  filteredSubscriptions: Subscription[];
  filters: SubscriptionFilters;
  viewMode: ViewMode;
  loadingStates: {
    initial: { isLoading: boolean; loadingMessage?: string | null; error?: string | null; setLoading: (loading: boolean, message?: string) => void; setError: (error: string) => void; clearError: () => void };
    add: { isLoading: boolean; loadingMessage?: string | null; error?: string | null; setLoading: (loading: boolean, message?: string) => void; setError: (error: string) => void; clearError: () => void };
    save: { isLoading: boolean; loadingMessage?: string | null; error?: string | null; setLoading: (loading: boolean, message?: string) => void; setError: (error: string) => void; clearError: () => void };
    delete: { isLoading: boolean; loadingMessage?: string | null; error?: string | null; setLoading: (loading: boolean, message?: string) => void; setError: (error: string) => void; clearError: () => void };
    export: { isLoading: boolean; loadingMessage?: string | null; error?: string | null; setLoading: (loading: boolean, message?: string) => void; setError: (error: string) => void; clearError: () => void };
  };
  onFiltersChange: (filters: SubscriptionFilters) => void;
  onViewModeChange: (mode: 'list' | 'grid' | 'analytics') => void;
  onEdit: (subscription: Subscription) => void;
  onDuplicate: (subscription: Subscription) => Promise<void>;
  onDelete: (subscription: Subscription) => void;
  onPause: (subscription: Subscription) => Promise<void>;
  onViewDetails: (subscription: Subscription) => void;
  onExport: () => Promise<void>;
}

export default function PremiumDashboard({
  subscriptions,
  filteredSubscriptions,
  filters,
  viewMode,
  loadingStates,
  onFiltersChange,
  onViewModeChange,
  onEdit,
  onDuplicate,
  onDelete,
  onPause,
  onViewDetails,
  onExport
}: PremiumDashboardProps) {
  const toast = useToast();

  // Local state for UI
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  const [subscriptionToDelete, setSubscriptionToDelete] = useState<Subscription | null>(null);

  // Destructure loading states
  const { initial, delete: deleteLoading, export: exportLoading } = loadingStates;

  // Helper function to get subscription icon
  const getSubscriptionIcon = (subscription: Subscription) => {
    if (subscription.logoUrl) {
      return (
        <img
          src={subscription.logoUrl}
          alt={`${subscription.name} logo`}
          className="w-8 h-8 rounded-lg object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            const fallback = target.nextElementSibling as HTMLElement;
            if (fallback) fallback.style.display = 'flex';
          }}
        />
      );
    }
    
    return (
      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
        {subscription.fallbackIcon || subscription.name.charAt(0).toUpperCase()}
      </div>
    );
  };

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

  // Note: filteredSubscriptions is managed by parent component

  // Note: URL parameters are handled by parent component

  // Filter subscriptions
  // Note: Filtering is handled by parent component

  // Note: Search is handled by parent component

  // Note: View mode changes are handled by parent component

  // Note: All subscription actions are handled by parent component

  // Note: Subscription operations are now handled by parent component

  // Note: All subscription operations are now handled by parent component

  // Note: Export functionality is now handled by parent component

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
                    onClick={() => onViewModeChange('list')}
                  >
                    <List className="h-4 w-4 mr-2" />
                    List
                  </PremiumButton>
                  <PremiumButton
                    variant={viewMode.type === 'grid' ? 'primary' : 'ghost'}
                    size="sm"
                    onClick={() => onViewModeChange('grid')}
                  >
                    <Grid className="h-4 w-4 mr-2" />
                    Grid
                  </PremiumButton>
                  <PremiumButton
                    variant={viewMode.type === 'analytics' ? 'primary' : 'ghost'}
                    size="sm"
                    onClick={() => onViewModeChange('analytics')}
                  >
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Analytics
                  </PremiumButton>
                </ButtonGroup>
              </div>

              {viewMode.type === 'list' && (
                <EnhancedSubscriptionsTable
                  subscriptions={filteredSubscriptions}
                  onEdit={onEdit}
                  onDuplicate={onDuplicate}
                  onDelete={(sub) => setSubscriptionToDelete(sub)}
                  onPause={onPause}
                  onViewDetails={onViewDetails}
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
          isOpen={!!selectedSubscription}
          subscription={selectedSubscription}
          onClose={() => setSelectedSubscription(null)}
        />
      )}

      {subscriptionToDelete && (
        <DeleteConfirmationDialog
          isOpen={!!subscriptionToDelete}
          subscription={subscriptionToDelete}
          onClose={() => setSubscriptionToDelete(null)}
          onConfirm={() => onDelete(subscriptionToDelete)}
          isLoading={deleteLoading.isLoading}
        />
      )}

      <ToastContainer />
    </div>
  );
}

export { PremiumDashboard };

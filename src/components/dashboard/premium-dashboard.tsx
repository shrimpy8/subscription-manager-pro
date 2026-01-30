/**
 * Premium Dashboard Component
 * Apple-inspired design with enhanced visual hierarchy
 */

import { useState } from 'react';
import { Grid, List, BarChart3, DollarSign, CheckCircle, PiggyBank, TrendingUp } from 'lucide-react';
import { EnhancedCard, MetricsCard } from '@/components/ui/enhanced-card';
import Image from 'next/image';
// import { AI_TOOL_CATEGORY_LABEL } from '@/types/ai-tools';
import { PremiumButton, ButtonGroup } from '@/components/ui/premium-button';
// import { SearchInput } from '@/components/ui/enhanced-input';
import { Subscription, SubscriptionFilters, ViewMode } from '@/types/subscription';
import { formatCurrency, getStatusColor } from '@/lib/utils';
import { sanitizeInput } from '@/lib/xss';
import SubscriptionsTable from '@/components/subscriptions-table';
import SubscriptionDetailsModal from '@/components/subscription-details-modal';
import { LoadingPage } from '@/components/ui/loading-spinner';
import { ToastContainer } from '@/components/ui/toast';

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
  // const toast = useToast();

  // Local state for UI
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  // Delete confirmation is handled by parent page to avoid double dialogs

  // Destructure loading states
  const { initial } = loadingStates;

  // Helper function to get subscription icon (matches list view logic)
  const getSubscriptionIcon = (subscription: Subscription) => {
    // Use Google's favicon service for ALL subscriptions with URLs, just like the list view
    if (subscription.url) {
      try {
        const domain = new URL(subscription.url).hostname;
        return (
          <div className="relative w-8 h-8 flex items-center justify-center flex-shrink-0">
            <Image
              src={`https://www.google.com/s2/favicons?domain=${domain}&sz=64`}
              alt={`${subscription.name} favicon`}
              width={32}
              height={32}
              className="w-8 h-8 rounded-sm"
              unoptimized
              onError={(e) => {
                const img = e.currentTarget as HTMLImageElement;
                img.style.display = 'none';
                const fallback = img.nextElementSibling as HTMLElement;
                if (fallback) fallback.style.display = 'flex';
              }}
            />
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 items-center justify-center text-white font-semibold text-sm hidden">
              {subscription.fallback_icon || subscription.name.charAt(0).toUpperCase()}
            </div>
          </div>
        );
      } catch {
        // If URL parsing fails, fall back to emoji/letter
        return (
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white font-semibold text-sm">
            {subscription.fallback_icon || subscription.name.charAt(0).toUpperCase()}
          </div>
        );
      }
    }

    // For subscriptions without URL, try logo_url
    if (subscription.logo_url) {
      return (
        <Image
          src={subscription.logo_url}
          alt={`${subscription.name} logo`}
          width={32}
          height={32}
          className="w-8 h-8 rounded-lg object-cover"
          unoptimized
        />
      );
    }

    // Final fallback
    return (
      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white font-semibold text-sm">
        {subscription.fallback_icon || subscription.name.charAt(0).toUpperCase()}
      </div>
    );
  };

  // Calculate metrics
  const totalSubscriptions = subscriptions.length;
  const totalMonthlyCost = subscriptions.reduce((sum, sub) => {
    if (sub.billing_cycle === 'Monthly') return sum + sub.cost;
    if (sub.billing_cycle === 'Yearly') return sum + (sub.cost / 12);
    return sum;
  }, 0);
  const totalActiveSubscriptions = subscriptions.filter(sub => sub.status === 'active').length;
  // const totalSavings = subscriptions.reduce((sum, sub) => {
  //   if (sub.promoDiscount) return sum + sub.promoDiscount;
  //   return sum;
  // }, 0);

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
      {/* Header content handled by shared PageHeader in parent; hero removed for consistency */}

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
            value={totalActiveSubscriptions}
            change={0}
            trend="neutral"
            icon={<CheckCircle className="h-4 w-4 text-primary-500" />}
          />
          <MetricsCard
            title="Total Savings"
            value="$0.00"
            change={12}
            trend="up"
            icon={<PiggyBank className="h-4 w-4 text-success-500" />}
          />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-3">
            <EnhancedCard variant="elevated" padding="lg" hover={false}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-h2 text-neutral-900">Subscription Overview</h2>
                <div className="flex items-center space-x-3 relative z-10">
                  <button
                    onClick={() => onViewModeChange('grid')}
                    className={`px-4 py-2 rounded transition-colors cursor-pointer ${
                      viewMode.type === 'grid'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                    type="button"
                  >
                    Grid
                  </button>
                  <button
                    onClick={() => onViewModeChange('list')}
                    className={`px-4 py-2 rounded transition-colors cursor-pointer ${
                      viewMode.type === 'list'
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                    type="button"
                  >
                    List
                  </button>
                </div>
              </div>

              {viewMode.type === 'list' && (
                <SubscriptionsTable
                  subscriptions={filteredSubscriptions}
                  onEdit={onEdit}
                  onDuplicate={onDuplicate}
                  onDelete={(sub) => onDelete(sub)}
                  onPause={onPause}
                  onViewDetails={onViewDetails}
                />
              )}

              {viewMode.type === 'grid' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-6">
                  {filteredSubscriptions.map((subscription) => (
                    <EnhancedCard key={subscription.id} variant="default" hover={true}>
                      <div className="p-3">
                        <div className="flex items-start space-x-3 -mt-2 mb-1">
                          <div className="flex-shrink-0">
                            {getSubscriptionIcon(subscription)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm text-neutral-900 leading-tight">{sanitizeInput(subscription.name)}</h3>
                            <p className="text-xs text-neutral-600 leading-tight">
                              {subscription.category === 'AI Tools' && subscription.subcategory
                                ? subscription.subcategory
                                : subscription.category}
                            </p>
                          </div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-neutral-200 space-y-2">
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

      {/* Delete dialog handled by parent page to avoid duplicate overlays */}

      <ToastContainer />
    </div>
  );
}

export { PremiumDashboard };

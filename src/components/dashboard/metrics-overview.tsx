/**
 * Metrics Overview Component
 * Executive-level dashboard with key performance indicators
 */

import { TrendingUp, TrendingDown, DollarSign, CheckCircle, AlertTriangle, Clock, PiggyBank, Target } from 'lucide-react';
import { MetricsCard } from '@/components/ui/enhanced-card';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { Subscription } from '@/types/subscription';
import { formatCurrency, getDaysUntilRenewal } from '@/lib/utils';

interface MetricsOverviewProps {
  subscriptions: Subscription[];
  className?: string;
}

export const MetricsOverview = ({ subscriptions, className }: MetricsOverviewProps) => {
  // Calculate key metrics
  const totalSubscriptions = subscriptions.length;
  const activeSubscriptions = subscriptions.filter(sub => sub.status === 'active').length;
  const pausedSubscriptions = subscriptions.filter(sub => sub.status === 'paused').length;
  const canceledSubscriptions = subscriptions.filter(sub => sub.status === 'canceled').length;

  // Cost calculations
  const totalMonthlyCost = subscriptions.reduce((sum, sub) => {
    if (sub.billingCycle === 'Monthly') return sum + sub.cost;
    if (sub.billingCycle === 'Yearly') return sum + (sub.cost / 12);
    return sum;
  }, 0);

  const totalYearlyCost = subscriptions.reduce((sum, sub) => {
    if (sub.billingCycle === 'Monthly') return sum + (sub.cost * 12);
    if (sub.billingCycle === 'Yearly') return sum + sub.cost;
    return sum;
  }, 0);

  // Savings calculations
  const totalSavings = subscriptions.reduce((sum, sub) => {
    if (sub.promoDiscount) return sum + sub.promoDiscount;
    return sum;
  }, 0);

  const savingsPercentage = totalYearlyCost > 0 ? (totalSavings / totalYearlyCost) * 100 : 0;

  // Renewal tracking
  const upcomingRenewals = subscriptions.filter(sub => {
    const daysUntilRenewal = getDaysUntilRenewal(sub.renewalDate);
    return daysUntilRenewal <= 30 && daysUntilRenewal > 0;
  }).length;

  const overdueRenewals = subscriptions.filter(sub => {
    const daysUntilRenewal = getDaysUntilRenewal(sub.renewalDate);
    return daysUntilRenewal < 0;
  }).length;

  // Category breakdown
  const categoryBreakdown = subscriptions.reduce((acc, sub) => {
    acc[sub.category] = (acc[sub.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topCategory = Object.entries(categoryBreakdown).reduce((a, b) => 
    a[1] > b[1] ? a : b, ['', 0]
  );

  // Priority breakdown
  const highPrioritySubscriptions = subscriptions.filter(sub => sub.priority === 'High').length;
  const mediumPrioritySubscriptions = subscriptions.filter(sub => sub.priority === 'Medium').length;
  const lowPrioritySubscriptions = subscriptions.filter(sub => sub.priority === 'Low').length;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricsCard
          title="Total Subscriptions"
          value={totalSubscriptions}
          change={5}
          trend="up"
          icon={<Target className="h-4 w-4 text-primary-500" />}
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
          icon={<CheckCircle className="h-4 w-4 text-success-500" />}
        />
        <MetricsCard
          title="Total Savings"
          value={formatCurrency(totalSavings, 'USD')}
          change={12}
          trend="up"
          icon={<PiggyBank className="h-4 w-4 text-success-500" />}
        />
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <EnhancedCard variant="elevated" padding="lg">
          <h3 className="text-h3 text-neutral-900 mb-4">Subscription Status</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-success-500 rounded-full"></div>
                <span className="text-body text-neutral-700">Active</span>
              </div>
              <span className="text-h4 text-neutral-900">{activeSubscriptions}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-warning-500 rounded-full"></div>
                <span className="text-body text-neutral-700">Paused</span>
              </div>
              <span className="text-h4 text-neutral-900">{pausedSubscriptions}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-error-500 rounded-full"></div>
                <span className="text-body text-neutral-700">Canceled</span>
              </div>
              <span className="text-h4 text-neutral-900">{canceledSubscriptions}</span>
            </div>
          </div>
        </EnhancedCard>

        <EnhancedCard variant="elevated" padding="lg">
          <h3 className="text-h3 text-neutral-900 mb-4">Renewal Alerts</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Clock className="h-4 w-4 text-warning-500" />
                <span className="text-body text-neutral-700">Upcoming (30 days)</span>
              </div>
              <span className="text-h4 text-warning-600">{upcomingRenewals}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="h-4 w-4 text-error-500" />
                <span className="text-body text-neutral-700">Overdue</span>
              </div>
              <span className="text-h4 text-error-600">{overdueRenewals}</span>
            </div>
          </div>
        </EnhancedCard>
      </div>

      {/* Cost Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <EnhancedCard variant="elevated" padding="lg">
          <h3 className="text-h3 text-neutral-900 mb-4">Cost Breakdown</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-body text-neutral-700">Monthly Cost</span>
              <span className="text-h4 text-neutral-900">{formatCurrency(totalMonthlyCost, 'USD')}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-body text-neutral-700">Yearly Cost</span>
              <span className="text-h4 text-neutral-900">{formatCurrency(totalYearlyCost, 'USD')}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-body text-neutral-700">Savings Rate</span>
              <span className="text-h4 text-success-600">{savingsPercentage.toFixed(1)}%</span>
            </div>
          </div>
        </EnhancedCard>

        <EnhancedCard variant="elevated" padding="lg">
          <h3 className="text-h3 text-neutral-900 mb-4">Category Analysis</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-body text-neutral-700">Top Category</span>
              <span className="text-h4 text-neutral-900">{topCategory[0] || 'None'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-body text-neutral-700">High Priority</span>
              <span className="text-h4 text-error-600">{highPrioritySubscriptions}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-body text-neutral-700">Medium Priority</span>
              <span className="text-h4 text-warning-600">{mediumPrioritySubscriptions}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-body text-neutral-700">Low Priority</span>
              <span className="text-h4 text-success-600">{lowPrioritySubscriptions}</span>
            </div>
          </div>
        </EnhancedCard>
      </div>
    </div>
  );
};

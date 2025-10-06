"use client";

import { useState, memo, useMemo, useCallback } from 'react';
import { 
  ChevronUp, 
  ChevronDown, 
  MoreHorizontal, 
  Eye, 
  Edit, 
  Copy, 
  ExternalLink, 
  Pause, 
  Trash2,
  Calendar,
  DollarSign,
  Plus,
  TrendingUp,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
    import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
    import Image from 'next/image';
import { Subscription } from '@/types/subscription';
import { formatCurrency, getDaysUntilRenewal, getStatusColor, getPriorityColor, toDate, formatDate } from '@/lib/utils';
import { ErrorBoundary } from '@/components/error-boundary';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { PremiumButton } from '@/components/ui/premium-button';
import { EnhancedSubscriptionCard } from '@/components/subscription/enhanced-subscription-card';

interface EnhancedSubscriptionsTableProps {
  subscriptions: Subscription[];
  onEdit?: (subscription: Subscription) => void;
  onDuplicate?: (subscription: Subscription) => void;
  onDelete?: (subscription: Subscription) => void;
  onPause?: (subscription: Subscription) => void;
  onViewDetails?: (subscription: Subscription) => void;
  onAddSubscription?: () => void;
}

type SortField = 'name' | 'plan' | 'cost' | 'billingCycle' | 'startDate' | 'status' | 'priority';
type SortOrder = 'asc' | 'desc';

const EnhancedSubscriptionsTable = memo(function EnhancedSubscriptionsTable({
  subscriptions,
  onEdit,
  onDuplicate,
  onDelete,
  onPause,
  onViewDetails,
  onAddSubscription
}: EnhancedSubscriptionsTableProps) {
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  const handleSort = useCallback((field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  }, [sortField, sortOrder]);

  const sortedSubscriptions = useMemo(() => {
    return [...subscriptions].sort((a, b) => {
      let aValue: string | number | Date;
      let bValue: string | number | Date;

      switch (sortField) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'plan':
          aValue = a.plan.toLowerCase();
          bValue = b.plan.toLowerCase();
          break;
        case 'cost':
          aValue = a.cost;
          bValue = b.cost;
          break;
        case 'billingCycle':
          aValue = a.billingCycle.toLowerCase();
          bValue = b.billingCycle.toLowerCase();
          break;
        case 'startDate':
          aValue = toDate(a.startDate);
          bValue = toDate(b.startDate);
          break;
        case 'status':
          aValue = a.status.toLowerCase();
          bValue = b.status.toLowerCase();
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [subscriptions, sortField, sortOrder]);

  const SortButton = memo(function SortButton({ field, children, className }: { field: SortField; children: React.ReactNode; className?: string }) {
    return (
      <PremiumButton
        variant="ghost"
        size="sm"
        onClick={() => handleSort(field)}
        className={`h-8 px-2 lg:px-3 hover:bg-orange-50 ${className || ''}`}
      >
        <span className="sr-only">
          Sort by {field} in {sortField === field ? (sortOrder === 'asc' ? 'descending' : 'ascending') : 'ascending'} order
        </span>
        {children}
        {sortField === field && (
          sortOrder === 'asc' ? (
            <ChevronUp className="ml-2 h-4 w-4" />
          ) : (
            <ChevronDown className="ml-2 h-4 w-4" />
          )
        )}
      </PremiumButton>
    );
  });

      const getSubscriptionIcon = (subscription: Subscription) => {
        // Helper that prefers logoUrl, then favicon from URL, else fallback letter box
        const size = 32;
        const commonClass = "w-8 h-8 rounded-lg object-cover";
        const altText = `${subscription.name} logo`;

    if (subscription.url) {
      try {
        const domain = new URL(subscription.url).hostname;
        const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
        
        return (
              <Image 
                src={faviconUrl}
                alt={altText}
                width={size}
                height={size}
                className={commonClass}
                unoptimized
                onError={(e) => {
                  const img = e.currentTarget as HTMLImageElement;
                  img.style.display = 'none';
                  const fallback = img.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
        );
      } catch {
        // If URL parsing fails, fall through to other methods
      }
    }

    if (subscription.logoUrl) {
      return (
              <Image 
                src={subscription.logoUrl}
                alt={altText}
                width={size}
                height={size}
                className={commonClass}
                unoptimized
                onError={(e) => {
                  const img = e.currentTarget as HTMLImageElement;
                  img.style.display = 'none';
                  const fallback = img.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
      );
    }

    if (subscription.fallbackIcon) {
      return (
        <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center text-lg">
          {subscription.fallbackIcon}
        </div>
      );
    }

          return (
            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
              <span className="text-orange-600 font-semibold text-sm">
                {subscription.name.charAt(0)}
              </span>
            </div>
          );
  };

  if (subscriptions.length === 0) {
    return (
      <ErrorBoundary>
        <EnhancedCard variant="elevated" className="text-center py-12">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
              <Plus className="w-8 h-8 text-orange-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">No subscriptions found</h3>
              <p className="text-gray-600">Get started by adding your first subscription.</p>
            </div>
            {onAddSubscription && (
              <PremiumButton
                variant="gradient"
                onClick={onAddSubscription}
                className="mt-4"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Subscription
              </PremiumButton>
            )}
          </div>
        </EnhancedCard>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <div className="space-y-4">
        {/* Enhanced Table Header */}
        <EnhancedCard variant="outlined" className="overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-orange-50 to-amber-50 border-b border-orange-200">
                <th className="text-left py-4 pl-4 w-1/2">
                  <SortButton field="name">
                    <span className="font-semibold text-orange-800">Subscription</span>
                  </SortButton>
                </th>
                <th className="text-left py-4 pl-4 w-1/6">
                  <SortButton field="plan">
                    <span className="font-semibold text-orange-800">Plan</span>
                  </SortButton>
                </th>
                <th className="text-left py-4 pl-4 w-1/6">
                  <SortButton field="cost">
                    <span className="font-semibold text-orange-800">Cost</span>
                  </SortButton>
                </th>
                <th className="text-left py-4 pl-4 w-1/12">
                  <SortButton field="billingCycle">
                    <span className="font-semibold text-orange-800">Billing</span>
                  </SortButton>
                </th>
                <th className="text-left py-4 pl-4 w-1/12">
                  <SortButton field="status">
                    <span className="font-semibold text-orange-800">Status</span>
                  </SortButton>
                </th>
                <th className="text-left py-4 pl-4 w-1/12">
                  <SortButton field="priority">
                    <span className="font-semibold text-orange-800">Priority</span>
                  </SortButton>
                </th>
                <th className="text-left py-4 pl-4 w-16"></th>
              </tr>
            </thead>
            <tbody>

              {sortedSubscriptions.map((subscription) => (
                <tr key={subscription.id} className="hover:bg-orange-50/50 transition-colors duration-200">
                  {/* Subscription Info */}
                  <td className="py-4 pl-4">
                    <div className="flex items-center space-x-3">
                      {getSubscriptionIcon(subscription)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center mb-1">
                          <h3 className="text-sm font-semibold text-gray-900">
                            {subscription.name}
                          </h3>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-600">
                            Renews in {getDaysUntilRenewal(subscription.renewalDate)} days
                          </span>
                          {getDaysUntilRenewal(subscription.renewalDate) <= 7 && (
                            <AlertTriangle className="w-3 h-3 text-yellow-500" />
                          )}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Plan */}
                  <td className="py-4 pl-4">
                    <span className="text-sm text-gray-900">{subscription.plan}</span>
                  </td>

                  {/* Cost */}
                  <td className="py-4 pl-4">
                    <div className="flex items-center space-x-1">
                      <DollarSign className="w-3 h-3 text-green-600" />
                      <span className="text-sm font-semibold text-gray-900">
                        {formatCurrency(subscription.cost, subscription.currency)}
                      </span>
                    </div>
                  </td>

                  {/* Billing Cycle */}
                  <td className="py-4 pl-4">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3 h-3 text-orange-600" />
                      <span className="text-sm text-gray-600">{subscription.billingCycle}</span>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="py-4 pl-4">
                    <Badge className={getStatusColor(subscription.status)}>
                      {subscription.status}
                    </Badge>
                  </td>

                  {/* Priority */}
                  <td className="py-4 pl-4">
                    <Badge className={getPriorityColor(subscription.priority)}>
                      {subscription.priority}
                    </Badge>
                  </td>

                  {/* Actions */}
                  <td className="py-4 pl-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        {onViewDetails && (
                          <DropdownMenuItem onClick={() => onViewDetails(subscription)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                        )}
                        {onEdit && (
                          <DropdownMenuItem onClick={() => onEdit(subscription)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Update Subscription
                          </DropdownMenuItem>
                        )}
                        {subscription.url && (
                          <DropdownMenuItem asChild>
                            <a
                              href={subscription.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center"
                            >
                              <ExternalLink className="mr-2 h-4 w-4" />
                              Visit Website
                            </a>
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        {onDuplicate && (
                          <DropdownMenuItem onClick={() => onDuplicate(subscription)}>
                            <Copy className="mr-2 h-4 w-4" />
                            Duplicate
                          </DropdownMenuItem>
                        )}
                        {onPause && (
                          <DropdownMenuItem onClick={() => onPause(subscription)}>
                            <Pause className="mr-2 h-4 w-4" />
                            {subscription.status === 'paused' ? 'Resume' : 'Pause'}
                          </DropdownMenuItem>
                        )}
                        {onDelete && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => onDelete(subscription)}
                              className="text-red-600 focus:text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </EnhancedCard>
      </div>
    </ErrorBoundary>
  );
});

export default EnhancedSubscriptionsTable;

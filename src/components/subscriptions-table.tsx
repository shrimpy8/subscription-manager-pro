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
  Plus
} from 'lucide-react';
import { PremiumButton } from '@/components/ui/premium-button';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Subscription } from '@/types/subscription';
import { AI_TOOL_CATEGORY_LABEL } from '@/types/ai-tools';
import { formatCurrency, getDaysUntilRenewal, getStatusColor, getPriorityColor, toDate, formatDate } from '@/lib/utils';
import { sanitizeInput } from '@/lib/xss';
import { ErrorBoundary } from '@/components/error-boundary';

interface SubscriptionsTableProps {
  subscriptions: Subscription[];
  onEdit?: (subscription: Subscription) => void;
  onDuplicate?: (subscription: Subscription) => void;
  onDelete?: (subscription: Subscription) => void;
  onPause?: (subscription: Subscription) => void;
  onViewDetails?: (subscription: Subscription) => void;
  onAddSubscription?: () => void;
}

type SortField = 'name' | 'category' | 'subcategory' | 'plan' | 'cost' | 'billing_cycle' | 'start_date' | 'status';
type SortOrder = 'asc' | 'desc';

const SubscriptionsTable = memo(function SubscriptionsTable({
  subscriptions,
  onEdit,
  onDuplicate,
  onDelete,
  onPause,
  onViewDetails,
  onAddSubscription
}: SubscriptionsTableProps) {
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
      let aValue: string | number | Date = a[sortField] as string | number | Date;
      let bValue: string | number | Date = b[sortField] as string | number | Date;

    if (sortField === 'cost') {
      aValue = a.cost;
      bValue = b.cost;
    } else if (sortField === 'start_date') {
      aValue = toDate(a.start_date);
      bValue = toDate(b.start_date);
    } else if (typeof aValue === 'string' && typeof bValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }

    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
    });
  }, [subscriptions, sortField, sortOrder]);

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ChevronUp className="w-4 h-4 opacity-30" />;
    }
    return sortOrder === 'asc' ? 
      <ChevronUp className="w-4 h-4" /> : 
      <ChevronDown className="w-4 h-4" />;
  };

  // Using centralized date utility function

  const getSubscriptionIcon = (subscription: Subscription) => {
    // Use Google's favicon service for ALL subscriptions with URLs, just like the AI tools browser
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
                if (fallback) fallback.style.display = 'block';
              }}
            />
            <span className="text-lg hidden">
              {subscription.fallback_icon || subscription.name.charAt(0)}
            </span>
          </div>
        );
      } catch (error) {
        // If URL parsing fails, fall back to emoji
        return (
          <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center text-lg">
            {subscription.fallback_icon || subscription.name.charAt(0)}
          </div>
        );
      }
    }

    // For other subscriptions, try to use logoUrl if available
    if (subscription.logo_url) {
      return (
        <Image 
          src={subscription.logo_url} 
          alt={subscription.name}
          width={32}
          height={32}
          className="w-8 h-8 rounded-lg object-cover"
          unoptimized
          onError={(e) => {
            const img = e.currentTarget as HTMLImageElement;
            img.style.display = 'none';
            const parent = img.parentElement;
            if (parent) {
              parent.innerHTML = `<div class=\"w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center\"><span class=\"text-orange-600 font-semibold text-xs\">${subscription.name.charAt(0)}</span></div>`;
            }
          }}
        />
      );
    }

    // Use fallback icon if available
    if (subscription.fallback_icon) {
      return (
        <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center text-lg">
          {subscription.fallback_icon}
        </div>
      );
    }

    // Default to first letter
    return (
      <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
        <span className="text-orange-600 font-semibold text-xs">
          {subscription.name.charAt(0)}
        </span>
      </div>
    );
  };

  const getRenewalText = (subscription: Subscription) => {
    const days = getDaysUntilRenewal(subscription.renewal_date);
    if (days === 0) return 'Renews today';
    if (days === 1) return 'Renews tomorrow';
    if (days < 0) return `Expired ${Math.abs(days)} days ago`;
    return `Renews in ${days} days`;
  };

  const getCategoryDisplay = (sub: Subscription): string => {
    // Simply return the category as-is from the database
    return sub.category || '-';
  };

  return (
    <ErrorBoundary>
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left p-4 font-medium text-gray-600">
                <button
                  onClick={() => handleSort('name')}
                  className="flex items-center space-x-1 hover:text-gray-900 transition-colors"
                >
                  <span>Subscription</span>
                  {getSortIcon('name')}
                </button>
              </th>
          <th className="text-left p-4 font-medium text-gray-600">
            <button
              onClick={() => handleSort('category')}
              className="flex items-center space-x-1 hover:text-gray-900 transition-colors"
            >
              <span>Category</span>
              {getSortIcon('category')}
            </button>
          </th>
          <th className="text-left p-4 font-medium text-gray-600">
            <button
              onClick={() => handleSort('subcategory')}
              className="flex items-center space-x-1 hover:text-gray-900 transition-colors"
            >
              <span>Subcategory</span>
              {getSortIcon('subcategory')}
            </button>
          </th>
              <th className="text-left p-4 font-medium text-gray-600">
                <button
                  onClick={() => handleSort('plan')}
                  className="flex items-center space-x-1 hover:text-gray-900 transition-colors"
                >
                  <span>Plan</span>
                  {getSortIcon('plan')}
                </button>
              </th>
              <th className="text-left p-4 font-medium text-gray-600">
                <button
                  onClick={() => handleSort('cost')}
                  className="flex items-center space-x-1 hover:text-gray-900 transition-colors"
                >
                  <span>Cost</span>
                  {getSortIcon('cost')}
                </button>
              </th>
              <th className="text-left p-4 font-medium text-gray-600">
                <button
                  onClick={() => handleSort('billing_cycle')}
                  className="flex items-center space-x-1 hover:text-gray-900 transition-colors"
                >
                  <span>Billing</span>
                  {getSortIcon('billing_cycle')}
                </button>
              </th>
              <th className="text-left p-4 font-medium text-gray-600">
                <button
                  onClick={() => handleSort('start_date')}
                  className="flex items-center space-x-1 hover:text-gray-900 transition-colors"
                >
                  <span>Started</span>
                  {getSortIcon('start_date')}
                </button>
              </th>
              <th className="text-left p-4 font-medium text-gray-600">
                <button
                  onClick={() => handleSort('status')}
                  className="flex items-center space-x-1 hover:text-gray-900 transition-colors"
                >
                  <span>Status</span>
                  {getSortIcon('status')}
                </button>
              </th>
              <th className="text-left p-4 font-medium text-gray-600">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedSubscriptions.map((subscription) => (
              <tr key={subscription.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="p-4">
                  <div className="flex items-center space-x-3">
                    {getSubscriptionIcon(subscription)}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center space-x-2">
                        <p className="font-medium text-gray-900 truncate">{sanitizeInput(subscription.name)}</p>
                        {subscription.china_region_only && (
                          <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300 text-xs">
                            CN Region
                          </Badge>
                        )}
                        {subscription.safe_for_work === false && (
                          <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-300 text-xs">
                            NSFW
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center space-x-1 text-xs text-gray-500">
                        <Calendar className="w-3 h-3" />
                        <span>{getRenewalText(subscription)}</span>
                      </div>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <span className="text-sm text-gray-700">{getCategoryDisplay(subscription)}</span>
                </td>
                <td className="p-4">
                  <span className="text-sm text-gray-600">{subscription.subcategory || '-'}</span>
                </td>
                <td className="p-4">
                  <span className="text-sm font-medium text-gray-900">
                    {subscription.plan || 'Free'}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex items-center space-x-1">
                    <DollarSign className="w-4 h-4 text-gray-400" />
                    <span className="font-semibold text-orange-600">
                      {formatCurrency(subscription.cost, subscription.currency)}
                    </span>
                  </div>
                  {subscription.latest_promocode && (
                    <p className="text-xs text-green-600 mt-1">
                      -{subscription.latest_promocode}
                    </p>
                  )}
                </td>
                <td className="p-4">
                  <span className="text-sm text-gray-600 capitalize">
                    {subscription.billing_cycle}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex items-center space-x-1 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(subscription.start_date, 'short')}</span>
                  </div>
                </td>
                <td className="p-4">
                  <Badge className={getStatusColor(subscription.status)}>
                    {subscription.status}
                  </Badge>
                </td>
                <td className="p-4">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <PremiumButton variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </PremiumButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={() => onViewDetails?.(subscription)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onEdit?.(subscription)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Update Subscription
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onDuplicate?.(subscription)}>
                        <Copy className="mr-2 h-4 w-4" />
                        Duplicate Subscription
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => subscription.url ? window.open(subscription.url, '_blank') : null}
                        disabled={!subscription.url}
                      >
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Visit Website
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => onPause?.(subscription)}
                        className="text-yellow-600"
                      >
                        <Pause className="mr-2 h-4 w-4" />
                        {subscription.status === 'paused' ? 'Resume Subscription' : 'Pause Subscription'}
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => onDelete?.(subscription)}
                        className="text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Subscription
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {sortedSubscriptions.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Calendar className="w-12 h-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No subscriptions found</h3>
          <p className="text-gray-600 mb-4">Get started by adding your first subscription.</p>
          <PremiumButton 
            variant="gradient"
            onClick={() => window.location.href = '/add-subscription'}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Subscription
          </PremiumButton>
        </div>
      )}
    </div>
    </ErrorBoundary>
  );
});

export default SubscriptionsTable;

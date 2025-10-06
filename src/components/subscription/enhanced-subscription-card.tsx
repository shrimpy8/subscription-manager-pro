/**
 * Enhanced Subscription Card Component
 * Apple-inspired design with smooth interactions
 */

import { useState } from 'react';
import { MoreVertical, Edit, Copy, Trash2, Pause, Play, ExternalLink, Calendar, DollarSign, AlertCircle } from 'lucide-react';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import Image from 'next/image';
import { PremiumButton } from '@/components/ui/premium-button';
import { Badge } from '@/components/ui/badge';
import { Subscription } from '@/types/subscription';
import { formatCurrency, getDaysUntilRenewal, getStatusColor, getPriorityColor } from '@/lib/utils';

interface EnhancedSubscriptionCardProps {
  subscription: Subscription;
  onEdit?: (subscription: Subscription) => void;
  onDuplicate?: (subscription: Subscription) => void;
  onDelete?: (subscription: Subscription) => void;
  onPause?: (subscription: Subscription) => void;
  onViewDetails?: (subscription: Subscription) => void;
  className?: string;
}

export const EnhancedSubscriptionCard = ({
  subscription,
  onEdit,
  onDuplicate,
  onDelete,
  onPause,
  onViewDetails,
  className
}: EnhancedSubscriptionCardProps) => {
  const [showActions, setShowActions] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const daysUntilRenewal = getDaysUntilRenewal(subscription.renewalDate);
  const isOverdue = daysUntilRenewal < 0;
  const isUpcoming = daysUntilRenewal <= 30 && daysUntilRenewal > 0;

  const getSubscriptionIcon = (subscription: Subscription) => {
    if (subscription.url) {
      try {
        const domain = new URL(subscription.url).hostname;
        const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
        
        return (
          <Image 
            src={faviconUrl} 
            alt={subscription.name}
            width={48}
            height={48}
            className="w-12 h-12 rounded-xl object-cover shadow-sm"
            unoptimized
            onError={(e) => {
              const img = e.currentTarget as HTMLImageElement;
              img.style.display = 'none';
              const parent = img.parentElement as HTMLElement | null;
              if (parent) {
                if (subscription.fallbackIcon) {
                  parent.innerHTML = `<div class=\"w-12 h-12 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl flex items-center justify-center text-xl font-semibold text-primary-700 shadow-sm\">${subscription.fallbackIcon}</div>`;
                } else {
                  parent.innerHTML = `<div class=\"w-12 h-12 bg-gradient-to-br from-neutral-100 to-neutral-200 rounded-xl flex items-center justify-center text-xl font-semibold text-neutral-700 shadow-sm\">${subscription.name.charAt(0)}</div>`;
                }
              }
            }}
          />
        );
      } catch {
        return (
          <div className="w-12 h-12 bg-gradient-to-br from-neutral-100 to-neutral-200 rounded-xl flex items-center justify-center text-xl font-semibold text-neutral-700 shadow-sm">
            {subscription.fallbackIcon || subscription.name.charAt(0)}
          </div>
        );
      }
    }
    
    return (
      <div className="w-12 h-12 bg-gradient-to-br from-neutral-100 to-neutral-200 rounded-xl flex items-center justify-center text-xl font-semibold text-neutral-700 shadow-sm">
        {subscription.fallbackIcon || subscription.name.charAt(0)}
      </div>
    );
  };

  const getRenewalStatus = () => {
    if (isOverdue) {
      return {
        text: 'Overdue',
        color: 'text-error-600',
        bg: 'bg-error-50',
        icon: <AlertCircle className="h-3 w-3" />
      };
    }
    if (isUpcoming) {
      return {
        text: `${daysUntilRenewal} days`,
        color: 'text-warning-600',
        bg: 'bg-warning-50',
        icon: <Calendar className="h-3 w-3" />
      };
    }
    return {
      text: `${daysUntilRenewal} days`,
      color: 'text-success-600',
      bg: 'bg-success-50',
      icon: <Calendar className="h-3 w-3" />
    };
  };

  const renewalStatus = getRenewalStatus();

  return (
    <EnhancedCard
      variant="elevated"
      hover={true}
      className={`group relative overflow-hidden transition-all duration-300 ${
        isHovered ? 'scale-[1.02]' : ''
      } ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          {getSubscriptionIcon(subscription)}
          <div className="flex-1 min-w-0">
            <h3 className="text-h4 text-neutral-900 truncate group-hover:text-primary-600 transition-colors">
              {subscription.name}
            </h3>
            <p className="text-body-sm text-neutral-600">{subscription.category}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Badge 
            variant="secondary" 
            className={`${getStatusColor(subscription.status)} text-xs font-medium`}
          >
            {subscription.status}
          </Badge>
          <div className="relative">
            <PremiumButton
              variant="ghost"
              size="sm"
              onClick={() => setShowActions(!showActions)}
              className="h-8 w-8 p-0"
            >
              <MoreVertical className="h-4 w-4" />
            </PremiumButton>
            
            {showActions && (
              <div className="absolute right-0 top-10 bg-white border border-neutral-200 rounded-lg shadow-lg z-50 min-w-[160px] animate-fade-in">
                <div className="py-1">
                  {onEdit && (
                    <button
                      onClick={() => {
                        onEdit(subscription);
                        setShowActions(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-50 flex items-center space-x-2"
                    >
                      <Edit className="h-4 w-4" />
                      <span>Edit</span>
                    </button>
                  )}
                  {onDuplicate && (
                    <button
                      onClick={() => {
                        onDuplicate(subscription);
                        setShowActions(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-50 flex items-center space-x-2"
                    >
                      <Copy className="h-4 w-4" />
                      <span>Duplicate</span>
                    </button>
                  )}
                  {onPause && (
                    <button
                      onClick={() => {
                        onPause(subscription);
                        setShowActions(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-50 flex items-center space-x-2"
                    >
                      {subscription.status === 'active' ? (
                        <>
                          <Pause className="h-4 w-4" />
                          <span>Pause</span>
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4" />
                          <span>Resume</span>
                        </>
                      )}
                    </button>
                  )}
                  {onViewDetails && (
                    <button
                      onClick={() => {
                        onViewDetails(subscription);
                        setShowActions(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-50 flex items-center space-x-2"
                    >
                      <ExternalLink className="h-4 w-4" />
                      <span>View Details</span>
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => {
                        onDelete(subscription);
                        setShowActions(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-error-600 hover:bg-error-50 flex items-center space-x-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Delete</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-3">
        {/* Cost and Billing */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <DollarSign className="h-4 w-4 text-neutral-400" />
            <span className="text-h3 text-neutral-900">
              {formatCurrency(subscription.cost, subscription.currency)}
            </span>
          </div>
          <span className="text-body-sm text-neutral-600">
            {subscription.billingCycle}
          </span>
        </div>

        {/* Renewal Status */}
        <div className="flex items-center justify-between">
          <span className="text-body-sm text-neutral-600">Renewal</span>
          <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${renewalStatus.bg} ${renewalStatus.color}`}>
            {renewalStatus.icon}
            <span>{renewalStatus.text}</span>
          </div>
        </div>

        {/* Priority */}
        <div className="flex items-center justify-between">
          <span className="text-body-sm text-neutral-600">Priority</span>
          <Badge 
            variant="outline" 
            className={`${getPriorityColor(subscription.priority)} text-xs font-medium`}
          >
            {subscription.priority}
          </Badge>
        </div>

        {/* Description */}
        {subscription.description && (
          <p className="text-body-sm text-neutral-600 line-clamp-2">
            {subscription.description}
          </p>
        )}
      </div>

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-neutral-100">
        <div className="flex items-center justify-between">
          <span className="text-caption text-neutral-500">
            Added {new Date(subscription.startDate).toLocaleDateString()}
          </span>
          {subscription.url && (
            <a
              href={subscription.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-caption text-primary-600 hover:text-primary-700 transition-colors"
            >
              Visit Site →
            </a>
          )}
        </div>
      </div>
    </EnhancedCard>
  );
};

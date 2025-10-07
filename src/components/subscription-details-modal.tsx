"use client";

import { X, ExternalLink, Calendar, DollarSign, User, Key, Shield, Globe } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PremiumButton } from '@/components/ui/premium-button';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Subscription } from '@/types/subscription';
import { toDate, formatDate } from '@/lib/utils';
import { formatCurrency, getDaysUntilRenewal } from '@/lib/utils';
import { sanitizeInput, sanitizeURL } from '@/lib/xss';

interface SubscriptionDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscription: Subscription | null;
}

export default function SubscriptionDetailsModal({
  isOpen,
  onClose,
  subscription
}: SubscriptionDetailsModalProps) {
  if (!subscription) return null;

  // Using centralized date utility function

  const getSubscriptionIcon = (subscription: Subscription) => {
    if (subscription.logo_url) {
      return (
        <Image 
          src={subscription.logo_url} 
          alt={subscription.name}
          width={64}
          height={64}
          className="w-16 h-16 rounded-xl object-cover"
          unoptimized
          onError={(e) => {
            const img = e.currentTarget as HTMLImageElement;
            img.style.display = 'none';
            const parent = img.parentElement;
            if (parent) {
              parent.innerHTML = `<div class=\"w-16 h-16 bg-orange-100 rounded-xl flex items-center justify-center text-2xl\">${subscription.fallback_icon || subscription.name.charAt(0)}</div>`;
            }
          }}
        />
      );
    }

    return (
      <div className="w-16 h-16 bg-orange-100 rounded-xl flex items-center justify-center text-2xl">
        {subscription.fallback_icon || subscription.name.charAt(0)}
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent showCloseButton={false} className="!max-w-[75vw] !w-[75vw] max-h-[90vh] overflow-y-auto sm:!max-w-[75vw] glass-card">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="modal-title text-2xl">
              Subscription Details
            </DialogTitle>
            <PremiumButton variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </PremiumButton>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Section (neutral glass style to match pages) */}
          <div className="flex items-start space-x-4 p-4 bg-white/80 backdrop-blur-sm border border-neutral-200 rounded-xl">
            {getSubscriptionIcon(subscription)}
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h2 className="text-h3 text-neutral-900">{sanitizeInput(subscription.name)}</h2>
                <Badge className={subscription.status === 'active' ? 'bg-green-100 text-green-800' : 
                                 subscription.status === 'paused' ? 'bg-yellow-100 text-yellow-800' : 
                                 'bg-red-100 text-red-800'}>
                  {subscription.status}
                </Badge>
                {subscription.china_region_only && (
                  <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">
                    CN Region
                  </Badge>
                )}
                {subscription.safe_for_work === false && (
                  <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-300">
                    NSFW
                  </Badge>
                )}
              </div>
              <p className="text-sm text-neutral-600 mb-1">{sanitizeInput(subscription.plan || 'Free')} Plan</p>
              <p className="text-sm text-neutral-600">{sanitizeInput(subscription.description || '')}</p>
            </div>
            <PremiumButton 
              onClick={() => window.open(sanitizeURL(subscription.url), '_blank')}
              variant="gradient"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Visit Website
            </PremiumButton>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Billing Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-h3 text-neutral-900">
                  <DollarSign className="w-5 h-5 mr-2 text-orange-600" />
                  Billing Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-600">Cost</span>
                  <span className="text-xl font-semibold text-orange-600">
                    {formatCurrency(subscription.cost, subscription.currency)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-600">Billing Cycle</span>
                  <span className="text-sm font-medium text-neutral-900">{subscription.billing_cycle}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-600">Priority</span>
                  <Badge className={subscription.usage_importance === 'high' ? 'bg-red-100 text-red-800' : 
                                   subscription.usage_importance === 'medium' ? 'bg-yellow-100 text-yellow-800' : 
                                   'bg-green-100 text-green-800'}>
                    {subscription.usage_importance}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-600">Auto Renew</span>
                  <span className="text-sm font-medium text-neutral-900">{subscription.auto_renew ? 'Yes' : 'No'}</span>
                </div>
                {subscription.latest_promocode && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-neutral-600">Latest Promo</span>
                    <Badge variant="outline" className="bg-green-100 text-green-800">
                      {subscription.latest_promocode}
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Dates & Usage */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-h3 text-neutral-900">
                  <Calendar className="w-5 h-5 mr-2 text-orange-600" />
                  Dates & Usage
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-600">Start Date</span>
                  <span className="text-sm font-medium text-neutral-900">{formatDate(subscription.start_date, 'long')}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-600">Renewal Date</span>
                  <span className="text-sm font-medium text-neutral-900">{formatDate(subscription.renewal_date, 'long')}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-600">Days Until Renewal</span>
                  <span className="text-sm font-medium text-orange-600">
                    {getDaysUntilRenewal(subscription.renewal_date)} days
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-600">Usage Frequency</span>
                  <Badge variant="outline" className="bg-neutral-50">
                    {subscription.usage_frequency}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Account Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-h3 text-neutral-900">
                  <User className="w-5 h-5 mr-2 text-orange-600" />
                  Account Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <span className="text-sm text-neutral-600 block mb-1">Current Email</span>
                  <span className="text-sm font-medium text-neutral-900">{sanitizeInput(subscription.account_email || 'Not set')}</span>
                </div>
                {subscription.account_emails_used_previously && subscription.account_emails_used_previously.length > 0 && (
                  <div>
                    <span className="text-sm text-neutral-600 block mb-1">Previous Emails</span>
                    <div className="space-y-1">
                      {subscription.account_emails_used_previously.map((email: string, index: number) => (
                        <span key={index} className="text-xs text-neutral-500 block">{email}</span>
                      ))}
                    </div>
                  </div>
                )}
                <div>
                  <span className="text-sm text-neutral-600 block mb-1">Category</span>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">{subscription.category}</Badge>
                    {subscription.subcategory && (
                      <Badge variant="outline" className="bg-gray-100">{subscription.subcategory}</Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* API & Security */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-h3 text-neutral-900">
                  <Key className="w-5 h-5 mr-2 text-orange-600" />
                  API & Security
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {subscription.api_access_keys && subscription.api_access_keys.length > 0 && (
                  <div>
                    <span className="text-sm text-neutral-600 block mb-1">API Keys</span>
                    <div className="space-y-1">
                      {subscription.api_access_keys.map((key: string, index: number) => (
                        <div key={index} className="text-sm font-mono bg-gray-100 p-2 rounded">
                          {key.substring(0, 8)}...{key.substring(key.length - 4)}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {subscription.secret_key && (
                  <div>
                    <span className="text-sm text-neutral-600 block mb-1">Secret Key</span>
                    <div className="text-sm font-mono bg-gray-100 p-2 rounded">
                      {subscription.secret_key.substring(0, 8)}...{subscription.secret_key.substring(subscription.secret_key.length - 4)}
                    </div>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-600">Safe for Work</span>
                  <Badge variant="outline" className={subscription.safe_for_work ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                    {subscription.safe_for_work ? 'Yes' : 'No'}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-600">China Region Only</span>
                  <Badge variant="outline" className={subscription.china_region_only ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}>
                    {subscription.china_region_only ? 'Yes' : 'No'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Notes Section */}
          {subscription.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center card-title">
                  <Shield className="w-5 h-5 mr-2 text-orange-600" />
                  Personal Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-wrap">{sanitizeInput(subscription.notes)}</p>
              </CardContent>
            </Card>
          )}

          {/* Promotion History */}
          {subscription.previously_used_promotion_code && subscription.previously_used_promotion_code.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center card-title">
                  <Globe className="w-5 h-5 mr-2 text-orange-600" />
                  Promotion History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {subscription.previously_used_promotion_code.map((code: string, index: number) => (
                    <Badge key={index} variant="outline" className="bg-orange-100 text-orange-800">
                      {code}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

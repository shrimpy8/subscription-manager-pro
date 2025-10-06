"use client";

import { X, ExternalLink, Calendar, DollarSign, User, Key, Shield, Globe } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { PremiumButton } from '@/components/ui/premium-button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Subscription } from '@/types/subscription';
import { toDate, formatDate } from '@/lib/utils';
import { formatCurrency, getDaysUntilRenewal } from '@/lib/utils';

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
    if (subscription.logoUrl) {
      return (
        <Image 
          src={subscription.logoUrl} 
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
              parent.innerHTML = `<div class=\"w-16 h-16 bg-orange-100 rounded-xl flex items-center justify-center text-2xl\">${subscription.fallbackIcon || subscription.name.charAt(0)}</div>`;
            }
          }}
        />
      );
    }

    return (
      <div className="w-16 h-16 bg-orange-100 rounded-xl flex items-center justify-center text-2xl">
        {subscription.fallbackIcon || subscription.name.charAt(0)}
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="!max-w-[75vw] !w-[75vw] max-h-[90vh] overflow-y-auto sm:!max-w-[75vw] glass-card">
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
          {/* Header Section */}
          <div className="flex items-start space-x-4 p-6 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl">
            {getSubscriptionIcon(subscription)}
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h2 className="text-2xl font-bold text-gray-900">{subscription.name}</h2>
                <Badge className={subscription.status === 'active' ? 'bg-green-100 text-green-800' : 
                                 subscription.status === 'paused' ? 'bg-yellow-100 text-yellow-800' : 
                                 'bg-red-100 text-red-800'}>
                  {subscription.status}
                </Badge>
                {subscription.chinaRegionOnly && (
                  <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">
                    CN Region
                  </Badge>
                )}
                {subscription.safeForWork === false && (
                  <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-300">
                    NSFW
                  </Badge>
                )}
              </div>
              <p className="text-gray-600 mb-2">{subscription.plan || 'Free'} Plan</p>
              <p className="text-sm text-gray-500">{subscription.description}</p>
            </div>
            <Button 
              onClick={() => window.open(subscription.url, '_blank')}
              className="gradient-bg hover:opacity-90"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Visit Website
            </Button>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Billing Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center card-title">
                  <DollarSign className="w-5 h-5 mr-2 text-orange-600" />
                  Billing Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Cost</span>
                  <span className="text-2xl font-bold text-orange-600">
                    {formatCurrency(subscription.cost, subscription.currency)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Billing Cycle</span>
                  <span className="font-medium">{subscription.billingCycle}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Priority</span>
                  <Badge className={subscription.priority === 'high' ? 'bg-red-100 text-red-800' : 
                                   subscription.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' : 
                                   'bg-green-100 text-green-800'}>
                    {subscription.priority}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Auto Renew</span>
                  <span className="font-medium">{subscription.autoRenew ? 'Yes' : 'No'}</span>
                </div>
                {subscription.latestPromotionCode && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Latest Promo</span>
                    <Badge variant="outline" className="bg-green-100 text-green-800">
                      {subscription.latestPromotionCode}
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Dates & Usage */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center card-title">
                  <Calendar className="w-5 h-5 mr-2 text-orange-600" />
                  Dates & Usage
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Start Date</span>
                  <span className="font-medium">{formatDate(subscription.startDate, 'long')}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Renewal Date</span>
                  <span className="font-medium">{formatDate(subscription.renewalDate, 'long')}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Days Until Renewal</span>
                  <span className="font-medium text-orange-600">
                    {getDaysUntilRenewal(subscription.renewalDate)} days
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Usage Frequency</span>
                  <Badge variant="outline">
                    {subscription.usageFrequency}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Account Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center card-title">
                  <User className="w-5 h-5 mr-2 text-orange-600" />
                  Account Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <span className="text-gray-600 block mb-1">Current Email</span>
                  <span className="font-medium">{subscription.accountEmail || 'Not set'}</span>
                </div>
                {subscription.accountEmailsUsedPreviously && subscription.accountEmailsUsedPreviously.length > 0 && (
                  <div>
                    <span className="text-gray-600 block mb-1">Previous Emails</span>
                    <div className="space-y-1">
                      {subscription.accountEmailsUsedPreviously.map((email: string, index: number) => (
                        <span key={index} className="text-sm text-gray-500 block">{email}</span>
                      ))}
                    </div>
                  </div>
                )}
                <div>
                  <span className="text-gray-600 block mb-1">Category</span>
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
                <CardTitle className="flex items-center card-title">
                  <Key className="w-5 h-5 mr-2 text-orange-600" />
                  API & Security
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {subscription.apiAccessKeys && subscription.apiAccessKeys.length > 0 && (
                  <div>
                    <span className="text-gray-600 block mb-1">API Keys</span>
                    <div className="space-y-1">
                      {subscription.apiAccessKeys.map((key: string, index: number) => (
                        <div key={index} className="text-sm font-mono bg-gray-100 p-2 rounded">
                          {key.substring(0, 8)}...{key.substring(key.length - 4)}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {subscription.secretKey && (
                  <div>
                    <span className="text-gray-600 block mb-1">Secret Key</span>
                    <div className="text-sm font-mono bg-gray-100 p-2 rounded">
                      {subscription.secretKey.substring(0, 8)}...{subscription.secretKey.substring(subscription.secretKey.length - 4)}
                    </div>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Safe for Work</span>
                  <Badge variant="outline" className={subscription.safeForWork ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                    {subscription.safeForWork ? 'Yes' : 'No'}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">China Region Only</span>
                  <Badge variant="outline" className={subscription.chinaRegionOnly ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}>
                    {subscription.chinaRegionOnly ? 'Yes' : 'No'}
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
                <p className="text-gray-700 whitespace-pre-wrap">{subscription.notes}</p>
              </CardContent>
            </Card>
          )}

          {/* Promotion History */}
          {subscription.previouslyUsedPromotionCode && subscription.previouslyUsedPromotionCode.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center card-title">
                  <Globe className="w-5 h-5 mr-2 text-orange-600" />
                  Promotion History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {subscription.previouslyUsedPromotionCode.map((code: string, index: number) => (
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

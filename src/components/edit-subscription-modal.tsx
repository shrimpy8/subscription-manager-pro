"use client";

import { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Subscription } from '@/types/subscription';
import { handleSubscriptionError } from '@/utils/error-handler';
import { toDate, formatDateForInput } from '@/lib/utils';
import { validateSubscription } from '@/utils/validation';

interface EditSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscription: Subscription | null;
  onSave: (updatedSubscription: Subscription) => Promise<void>;
}

const STATUS_OPTIONS = ['active', 'paused', 'canceled'];
const PRIORITY_OPTIONS = ['low', 'medium', 'high'];
const USAGE_FREQUENCY_OPTIONS = ['daily', 'weekly', 'monthly', 'rarely'];
const BILLING_CYCLE_OPTIONS = ['Monthly', 'Yearly', 'Free'];
const PLAN_OPTIONS = ['Free', 'Personal', 'Pro', 'Premium', 'Plus', 'Team', 'Enterprise', 'Max', 'Ultra'];

export default function EditSubscriptionModal({
  isOpen,
  onClose,
  subscription,
  onSave
}: EditSubscriptionModalProps) {
  const [formData, setFormData] = useState<Partial<Subscription>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (subscription) {
      setFormData({
        ...subscription,
        startDate: subscription.startDate,
        renewalDate: subscription.renewalDate
      });
    }
  }, [subscription]);

  const handleInputChange = (field: keyof Subscription, value: string | number | boolean | Date) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    if (!subscription) return;

    // Validate form data
    const validation = validateSubscription(formData);
    if (!validation.isValid) {
      alert(`Please fix the following errors:\n${Object.values(validation.errors).join('\n')}`);
      return;
    }

    setIsLoading(true);
    try {
      const updatedSubscription: Subscription = {
        ...subscription,
        ...formData,
        id: subscription.id // Ensure ID doesn't change
      } as Subscription;

      await onSave(updatedSubscription);
      onClose();
    } catch (error) {
      handleSubscriptionError(
        error as Error,
        'updating',
        { component: 'edit-subscription-modal' }
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Using centralized date utility function

  if (!subscription) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="!max-w-[75vw] !w-[75vw] max-h-[90vh] overflow-y-auto sm:!max-w-[75vw]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold text-gray-900">
              Edit Subscription
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name" className="text-sm font-medium text-gray-700">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name || ''}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="plan" className="text-sm font-medium text-gray-700">Plan</Label>
                  <Select value={formData.plan || ''} onValueChange={(value) => handleInputChange('plan', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select plan" />
                    </SelectTrigger>
                    <SelectContent>
                      {PLAN_OPTIONS.map((plan) => (
                        <SelectItem key={plan} value={plan}>{plan}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category" className="text-sm font-medium text-gray-700">Category *</Label>
                  <Input
                    id="category"
                    value={formData.category || ''}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="subcategory" className="text-sm font-medium text-gray-700">Subcategory</Label>
                  <Input
                    id="subcategory"
                    value={formData.subcategory || ''}
                    onChange={(e) => handleInputChange('subcategory', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description" className="text-sm font-medium text-gray-700">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description || ''}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Billing Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900">Billing Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="cost" className="text-sm font-medium text-gray-700">Cost *</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-gray-500">$</span>
                    <Input
                      id="cost"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.cost || 0}
                      onChange={(e) => handleInputChange('cost', parseFloat(e.target.value) || 0)}
                      className="pl-8"
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="currency" className="text-sm font-medium text-gray-700">Currency</Label>
                  <Select value={formData.currency || 'USD'} onValueChange={(value) => handleInputChange('currency', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                      <SelectItem value="CAD">CAD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="billingCycle" className="text-sm font-medium text-gray-700">Billing Cycle</Label>
                  <Select value={formData.billingCycle || 'Monthly'} onValueChange={(value) => handleInputChange('billingCycle', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {BILLING_CYCLE_OPTIONS.map((cycle) => (
                        <SelectItem key={cycle} value={cycle}>{cycle}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate" className="text-sm font-medium text-gray-700">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate ? formatDateForInput(formData.startDate) : ''}
                    onChange={(e) => handleInputChange('startDate', toDate(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="renewalDate" className="text-sm font-medium text-gray-700">Renewal Date</Label>
                  <Input
                    id="renewalDate"
                    type="date"
                    value={formData.renewalDate ? formatDateForInput(formData.renewalDate) : ''}
                    onChange={(e) => handleInputChange('renewalDate', toDate(e.target.value))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Status & Usage */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900">Status & Usage</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="status" className="text-sm font-medium text-gray-700">Status</Label>
                  <Select value={formData.status || 'active'} onValueChange={(value) => handleInputChange('status', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((status) => (
                        <SelectItem key={status} value={status}>{status}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="priority" className="text-sm font-medium text-gray-700">Priority</Label>
                  <Select value={formData.priority || 'medium'} onValueChange={(value) => handleInputChange('priority', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PRIORITY_OPTIONS.map((priority) => (
                        <SelectItem key={priority} value={priority}>{priority}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="usageFrequency" className="text-sm font-medium text-gray-700">Usage Frequency</Label>
                  <Select value={formData.usageFrequency || 'monthly'} onValueChange={(value) => handleInputChange('usageFrequency', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {USAGE_FREQUENCY_OPTIONS.map((frequency) => (
                        <SelectItem key={frequency} value={frequency}>{frequency}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="url" className="text-sm font-medium text-gray-700">Website URL</Label>
                  <Input
                    id="url"
                    type="url"
                    value={formData.url || ''}
                    onChange={(e) => handleInputChange('url', e.target.value)}
                    placeholder="https://example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="accountEmail" className="text-sm font-medium text-gray-700">Account Email</Label>
                  <Input
                    id="accountEmail"
                    type="email"
                    value={formData.accountEmail || ''}
                    onChange={(e) => handleInputChange('accountEmail', e.target.value)}
                    placeholder="user@example.com"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.autoRenew || false}
                    onChange={(e) => handleInputChange('autoRenew', e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm font-medium text-gray-700">Auto Renew</span>
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Personal Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900">Personal Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={formData.notes || ''}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                rows={4}
                placeholder="Add any personal notes about this subscription..."
              />
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-6 border-t">
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={isLoading}
              className="gradient-bg hover:opacity-90"
            >
              <Save className="w-4 h-4 mr-2" />
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

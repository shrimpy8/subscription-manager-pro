"use client";

import { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { PremiumButton } from '@/components/ui/premium-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Subscription } from '@/types/subscription';
import { generateId, getCurrentDate, getDefaultRenewalDate } from '@/lib/utils';
import { sanitizeInput } from '@/lib/xss';
import { validateSubscription } from '@/utils/validation';
import { useLoadingState } from '@/hooks/use-loading-state';
import { LoadingButton } from '@/components/ui/loading-spinner';
import { useToast } from '@/components/ui/toast';
import { getUserFriendlyMessage } from '@/utils/error-messages';

interface AddSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (subscription: Subscription) => void;
}

const STATUS_OPTIONS = ['active', 'paused', 'canceled'];
const PRIORITY_OPTIONS = ['low', 'medium', 'high'];
const USAGE_FREQUENCY_OPTIONS = ['daily', 'weekly', 'monthly', 'rarely'];
const BILLING_CYCLE_OPTIONS = ['Monthly', 'Yearly', 'Free'];
const PLAN_OPTIONS = ['Free', 'Basic', 'Pro', 'Premium', 'Enterprise', 'Max', 'Ultra'];
const CATEGORY_OPTIONS = ['AI Tools', 'Productivity', 'Entertainment', 'Development', 'Design', 'Marketing', 'Other'];

export default function AddSubscriptionModal({ isOpen, onClose, onAdd }: AddSubscriptionModalProps) {
  const loadingState = useLoadingState();
  const toast = useToast();

  const [formData, setFormData] = useState({
    name: '',
    category: 'AI Tools' as const,
    subcategory: '',
    status: 'active' as const,
    cost: '',
    currency: 'USD' as const,
    billingCycle: 'Monthly' as 'Monthly' | 'Yearly' | 'Weekly' | 'Quarterly' | 'Free',
    plan: 'Free' as const,
    renewalDate: '',
    startDate: '',
    priority: 'medium' as const,
    usageFrequency: 'monthly' as const,
    notes: '',
    url: '',
    email: '',
    description: '',
    logo: '',
    autoRenew: true
  });

  const handleInputChange = (field: string, value: string | number | boolean | Date) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    loadingState.setLoading(true, 'Adding subscription...');
    
    try {
      const subscription: Subscription = {
        id: generateId(),
        name: formData.name,
        category: formData.category,
        subcategory: formData.subcategory,
        status: formData.status,
        cost: parseFloat(formData.cost) || 0,
        currency: formData.currency,
        billingCycle: formData.billingCycle,
        plan: formData.plan,
        renewalDate: new Date(formData.renewalDate || getDefaultRenewalDate()),
        startDate: new Date(formData.startDate || getCurrentDate()),
        priority: formData.priority,
        usageFrequency: formData.usageFrequency as 'daily' | 'weekly' | 'monthly' | 'rarely',
        notes: formData.notes || undefined,
        url: formData.url || '',
        accountEmail: formData.email || '',
        description: formData.description || '',
        logo: formData.logo || '',
        autoRenew: formData.autoRenew
      };

      // Validate subscription
      const validation = validateSubscription(subscription);
      if (!validation.isValid) {
        const errorMessage = getUserFriendlyMessage('VALIDATION_ERROR');
        toast.error(errorMessage);
        return;
      }

      onAdd(subscription);
      toast.success(`Successfully added "${sanitizeInput(subscription.name)}"!`);
      onClose();
      
      // Reset form
      setFormData({
        name: '',
        category: 'AI Tools',
        subcategory: '',
        status: 'active',
        cost: '',
        currency: 'USD',
        billingCycle: 'Monthly',
        plan: 'Free',
        renewalDate: '',
        startDate: '',
        priority: 'medium',
        usageFrequency: 'monthly',
        notes: '',
        url: '',
        email: '',
        description: '',
        logo: '',
        autoRenew: true
      });
    } catch (error) {
      const errorMessage = getUserFriendlyMessage('SAVE_ERROR');
      toast.error(errorMessage);
    } finally {
      loadingState.setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="!max-w-[75vw] !w-[75vw] max-h-[90vh] overflow-y-auto sm:!max-w-[75vw] glass-card">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="modal-title text-2xl">
              Add New Subscription
            </DialogTitle>
            <PremiumButton variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </PremiumButton>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="card-title">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name" className="form-label">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="e.g., ChatGPT Plus"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="plan" className="form-label">Plan</Label>
                  <Select value={formData.plan} onValueChange={(value) => handleInputChange('plan', value)}>
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
                  <Label htmlFor="category" className="form-label">Category</Label>
                  <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORY_OPTIONS.map((category) => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="subcategory" className="form-label">Subcategory</Label>
                  <Input
                    id="subcategory"
                    value={formData.subcategory}
                    onChange={(e) => handleInputChange('subcategory', e.target.value)}
                    placeholder="e.g., AI Writing"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description" className="form-label">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Brief description of the subscription..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Billing Information */}
          <Card>
            <CardHeader>
              <CardTitle className="card-title">Billing Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="cost" className="form-label">Cost</Label>
                  <Input
                    id="cost"
                    type="number"
                    step="0.01"
                    value={formData.cost}
                    onChange={(e) => handleInputChange('cost', e.target.value)}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="currency" className="form-label">Currency</Label>
                  <Select value={formData.currency} onValueChange={(value) => handleInputChange('currency', value)}>
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
                  <Label htmlFor="billingCycle" className="form-label">Billing Cycle</Label>
                  <Select value={formData.billingCycle} onValueChange={(value) => handleInputChange('billingCycle', value)}>
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
                  <Label htmlFor="startDate" className="form-label">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="renewalDate" className="form-label">Renewal Date</Label>
                  <Input
                    id="renewalDate"
                    type="date"
                    value={formData.renewalDate}
                    onChange={(e) => handleInputChange('renewalDate', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Status & Priority */}
          <Card>
            <CardHeader>
              <CardTitle className="card-title">Status & Priority</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="status" className="form-label">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
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
                  <Label htmlFor="priority" className="form-label">Priority</Label>
                  <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
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
                  <Label htmlFor="usageFrequency" className="form-label">Usage Frequency</Label>
                  <Select value={formData.usageFrequency} onValueChange={(value) => handleInputChange('usageFrequency', value)}>
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
            </CardContent>
          </Card>

          {/* Additional Information */}
          <Card>
            <CardHeader>
              <CardTitle className="card-title">Additional Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="url" className="form-label">Website URL</Label>
                  <Input
                    id="url"
                    type="url"
                    value={formData.url}
                    onChange={(e) => handleInputChange('url', e.target.value)}
                    placeholder="https://example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="form-label">Account Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="notes" className="form-label">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Additional notes..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <Button
              type="submit"
              disabled={loadingState.isLoading}
              className="flex-1 gradient-bg hover:opacity-90"
            >
              {loadingState.isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Adding...
                </div>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Add Subscription
                </>
              )}
            </Button>
            <PremiumButton type="button" variant="secondary" onClick={onClose} className="flex-1">
              Cancel
            </PremiumButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

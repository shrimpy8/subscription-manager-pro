"use client";

import { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Subscription, SubscriptionCategory } from '@/types/subscription';
import { handleSubscriptionError } from '@/utils/error-handler';
import { formatDateForInput } from '@/lib/utils';
import { validateSubscription } from '@/utils/validation';
import { useLoadingState } from '@/hooks/use-loading-state';
import { useToast } from '@/components/ui/toast';
import { getUserFriendlyMessage } from '@/utils/error-messages';

interface EditSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscription: Subscription | null;
  onSave: (updatedSubscription: Subscription) => Promise<void>;
}

export default function EditSubscriptionModal({
  isOpen,
  onClose,
  subscription,
  onSave
}: EditSubscriptionModalProps) {
  
  const loadingState = useLoadingState();
  const toast = useToast();

  const [formData, setFormData] = useState({
    name: '',
    category: 'AI Tools' as SubscriptionCategory,
    status: 'active' as 'active' | 'paused' | 'canceled',
    cost: '',
    billingCycle: 'Monthly' as 'Monthly' | 'Yearly' | 'Weekly' | 'Quarterly' | 'Free',
    renewalDate: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    usageFrequency: 'monthly' as 'daily' | 'weekly' | 'monthly' | 'rarely',
    notes: '',
    url: '',
    email: ''
  });

  useEffect(() => {
    if (subscription) {
      setFormData({
        name: subscription.name || '',
        category: subscription.category || 'AI Tools',
        status: subscription.status || 'active',
        cost: subscription.cost?.toString() || '',
        billingCycle: subscription.billingCycle || 'Monthly',
        renewalDate: subscription.renewalDate ? formatDateForInput(subscription.renewalDate) : '',
        priority: subscription.priority || 'medium',
        usageFrequency: subscription.usageFrequency || 'monthly',
        notes: subscription.notes || '',
        url: subscription.url || '',
        email: subscription.accountEmail || ''
      });
    }
  }, [subscription]);

  const handleInputChange = (field: string, value: string | number | boolean | Date) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!subscription) return;
    
    loadingState.setLoading(true, 'Saving subscription...');
    
    try {
      const updatedSubscription: Subscription = {
        ...subscription,
        name: formData.name,
        category: formData.category,
        status: formData.status,
        cost: parseFloat(formData.cost) || 0,
        billingCycle: formData.billingCycle,
        renewalDate: new Date(formData.renewalDate || Date.now() + 30 * 24 * 60 * 60 * 1000),
        priority: formData.priority,
        usageFrequency: formData.usageFrequency as 'daily' | 'weekly' | 'monthly' | 'rarely',
        notes: formData.notes || undefined,
        url: formData.url || '',
        accountEmail: formData.email || ''
      };

      // Validate subscription
      const validation = validateSubscription(updatedSubscription);
      if (!validation.isValid) {
        const errorMessage = getUserFriendlyMessage('VALIDATION_ERROR');
        toast.error(errorMessage);
        return;
      }

      await onSave(updatedSubscription);
      toast.success(`Successfully updated "${updatedSubscription.name}"!`);
      onClose();
    } catch (error) {
      const errorMessage = getUserFriendlyMessage('SAVE_ERROR');
      toast.error(errorMessage);
      handleSubscriptionError(
        error as Error,
        'updating subscription',
        { component: 'edit-subscription-modal' }
      );
    } finally {
      loadingState.setLoading(false);
    }
  };

  if (!subscription) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-4">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold">
              Update Subscription
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="e.g., ChatGPT Plus"
              required
            />
          </div>

          <div>
            <Label htmlFor="cost">Monthly Cost ($)</Label>
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
            <Label htmlFor="billingCycle">Billing Cycle</Label>
            <Select value={formData.billingCycle} onValueChange={(value) => handleInputChange('billingCycle', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Monthly">Monthly</SelectItem>
                <SelectItem value="Yearly">Yearly</SelectItem>
                <SelectItem value="Weekly">Weekly</SelectItem>
                <SelectItem value="Quarterly">Quarterly</SelectItem>
                <SelectItem value="Free">Free</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="renewalDate">Renewal Date</Label>
            <Input
              id="renewalDate"
              type="date"
              value={formData.renewalDate}
              onChange={(e) => handleInputChange('renewalDate', e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="url">Website URL</Label>
            <Input
              id="url"
              type="url"
              value={formData.url}
              onChange={(e) => handleInputChange('url', e.target.value)}
              placeholder="https://example.com"
            />
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Additional notes..."
              rows={3}
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <Button
              type="submit"
              disabled={loadingState.isLoading}
              className="flex-1 gradient-bg hover:opacity-90"
            >
              {loadingState.isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </div>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
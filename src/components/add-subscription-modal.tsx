"use client";

import { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Subscription } from '@/types/subscription';
import { generateId } from '@/lib/utils';

interface AddSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (subscription: Subscription) => void;
}

export default function AddSubscriptionModal({ isOpen, onClose, onAdd }: AddSubscriptionModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    category: 'AI Tools' as const,
    status: 'active' as const,
    cost: '',
    billingCycle: 'Monthly' as 'Monthly' | 'Yearly' | 'Weekly' | 'Quarterly' | 'Free',
    renewalDate: '',
    priority: 'medium' as const,
    usageFrequency: 'monthly' as const,
    notes: '',
    url: '',
    email: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const subscription: Subscription = {
      id: generateId(),
      name: formData.name,
      category: formData.category,
      status: formData.status,
      cost: parseFloat(formData.cost) || 0,
      billingCycle: formData.billingCycle as 'Monthly' | 'Yearly' | 'Weekly' | 'Quarterly' | 'Free',
      renewalDate: new Date(formData.renewalDate || Date.now() + 30 * 24 * 60 * 60 * 1000),
      priority: formData.priority,
      usageFrequency: formData.usageFrequency as 'daily' | 'weekly' | 'monthly' | 'rarely',
      notes: formData.notes || undefined,
      url: formData.url || '',
      accountEmail: formData.email || '',
      plan: 'Free',
      logo: '',
      currency: 'USD',
      description: '',
      subcategory: '',
      startDate: new Date(),
      autoRenew: true
    };

    onAdd(subscription);
    onClose();
    
    // Reset form
    setFormData({
      name: '',
      category: 'AI Tools',
      status: 'active',
      cost: '',
      billingCycle: 'Monthly',
      renewalDate: '',
      priority: 'medium',
      usageFrequency: 'monthly',
      notes: '',
      url: '',
      email: ''
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Add New Subscription</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
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
              onChange={(e) => setFormData(prev => ({ ...prev, cost: e.target.value }))}
              placeholder="0.00"
            />
          </div>

          <div>
            <Label htmlFor="billingCycle">Billing Cycle</Label>
            <Select value={formData.billingCycle} onValueChange={(value: string) => setFormData(prev => ({ ...prev, billingCycle: value as 'Monthly' | 'Yearly' | 'Weekly' | 'Quarterly' | 'Free' }))}>
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
              onChange={(e) => setFormData(prev => ({ ...prev, renewalDate: e.target.value }))}
            />
          </div>

          <div>
            <Label htmlFor="url">Website URL</Label>
            <Input
              id="url"
              type="url"
              value={formData.url}
              onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
              placeholder="https://example.com"
            />
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Additional notes..."
              rows={3}
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <Button type="submit" className="flex-1 gradient-bg hover:opacity-90">
              Add Subscription
            </Button>
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

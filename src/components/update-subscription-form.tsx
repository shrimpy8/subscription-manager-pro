'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/toast';
import { ArrowLeft, FileText, DollarSign, Gift, Globe, Mail, Tag, Calendar, Key, Shield } from 'lucide-react';
import { Subscription } from '@/types/subscription';
import { loadSubscriptions, saveSubscriptions } from '@/lib/subscription-persistence';

interface UpdateSubscriptionFormProps {
  subscriptionId: string;
}

interface UpdateSubscriptionFormData {
  id: string;
  name: string;
  category: string;
  subcategory: string;
  description: string;
  url: string;
  logoUrl: string;
  plan: string;
  cost: number;
  currency: string;
  billingCycle: string;
  status: string;
  accountEmailInUse: string;
  notes: string;
  renewalDate: string;
  startDate: string;
  fallbackIcon: string;
  previouslyUsedPromotionCode: string[];
  latestPromotionCode: string;
  usageFrequency: string;
  usageImportance: string;
  accountEmailsUsedPreviously: string[];
  apiAccessKeys: string[];
  secretKey: string;
  chinaRegionOnly: boolean;
  safeForWork: boolean;
}

// Constants from the original form
const MAIN_CATEGORIES = [
  'AI Tools', 'Cloud Provider', 'Communication', 'Design Tools', 'Development Tools',
  'Entertainment', 'Magazine', 'Newsletter', 'Online Learning', 'Other',
  'Productivity', 'SaaS', 'Security', 'Streaming Service', 'Utilities'
];

const AI_TOOL_SUBCATEGORIES_WITH_EXAMPLES = [
  { value: 'APIs', label: 'APIs (Amadeus)', example: 'Amadeus' },
  { value: 'Audio', label: 'Audio (ElevenLabs)', example: 'ElevenLabs' },
  { value: 'Automation', label: 'Automation (Zapier)', example: 'Zapier' },
  { value: 'Build', label: 'Build (CURSOR)', example: 'CURSOR' },
  { value: 'Chat', label: 'Chat (ChatGPT)', example: 'ChatGPT' },
  { value: 'DB', label: 'DB (Supabase)', example: 'Supabase' },
  { value: 'Deploy', label: 'Deploy (Vercel)', example: 'Vercel' },
  { value: 'Design/Prototype', label: 'Design/Prototype (Magic Patterns)', example: 'Magic Patterns' },
  { value: 'Dev', label: 'Dev (Hugging Face)', example: 'Hugging Face' },
  { value: 'Image', label: 'Image (Midjourney)', example: 'Midjourney' },
  { value: 'Other', label: 'Other (Hailuo AI)', example: 'Hailuo AI' },
  { value: 'Planning', label: 'Planning (Linear)', example: 'Linear' },
  { value: 'Productivity', label: 'Productivity (Raycast)', example: 'Raycast' },
  { value: 'Roleplay', label: 'Roleplay (character.ai)', example: 'character.ai' },
  { value: 'Search', label: 'Search (perplexity)', example: 'perplexity' },
  { value: 'Speech-to-text', label: 'Speech-to-text (WisprFlow)', example: 'WisprFlow' },
  { value: 'Transcribe', label: 'Transcribe (TurboScribe)', example: 'TurboScribe' },
  { value: 'Utils', label: 'Utils (ZeroGPT)', example: 'ZeroGPT' },
  { value: 'Vector DB', label: 'Vector DB (Pinecone)', example: 'Pinecone' },
  { value: 'Video', label: 'Video (VEED)', example: 'VEED' },
  { value: 'Write', label: 'Write (NotebookLM)', example: 'NotebookLM' }
];

const PLAN_OPTIONS = ['Enterprise', 'Free', 'Max', 'Personal', 'Plus', 'Premium', 'Pro', 'Team', 'Ultra'];
const BILLING_CYCLES = ['Monthly', 'Yearly', 'One-time', 'Pay-per-use'];
const CURRENCIES = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY'];
const STATUS_OPTIONS = ['Active', 'Paused', 'Canceled', 'Trial'];
const USAGE_FREQUENCY = ['Daily', 'Weekly', 'Monthly', 'Occasionally', 'Rarely'];
const USAGE_IMPORTANCE = ['Critical', 'High', 'Medium', 'Low'];

export default function UpdateSubscriptionForm({ subscriptionId }: UpdateSubscriptionFormProps) {
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);
  const [originalData, setOriginalData] = useState<UpdateSubscriptionFormData | null>(null);
  
  const [formData, setFormData] = useState<UpdateSubscriptionFormData>({
    id: '',
    name: '',
    category: 'AI Tools',
    subcategory: '',
    description: '',
    url: '',
    logoUrl: '',
    plan: 'Free',
    cost: 0,
    currency: 'USD',
    billingCycle: 'Monthly',
    status: 'active',
    accountEmailInUse: '',
    notes: '',
    renewalDate: '',
    startDate: '',
    fallbackIcon: '🤖',
    previouslyUsedPromotionCode: [],
    latestPromotionCode: '',
    usageFrequency: 'monthly',
    usageImportance: 'Medium',
    accountEmailsUsedPreviously: [],
    apiAccessKeys: [],
    secretKey: '',
    chinaRegionOnly: false,
    safeForWork: true
  });

  // Load subscription data
  useEffect(() => {
    const loadSubscription = async () => {
      try {
        const subscriptions = await loadSubscriptions();
        const foundSubscription = subscriptions.find(sub => sub.id === subscriptionId);
        
        if (!foundSubscription) {
          toast.error('Subscription not found');
          router.push('/?view=list');
          return;
        }

        // Convert subscription to form data
        const subscriptionFormData: UpdateSubscriptionFormData = {
          id: foundSubscription.id,
          name: foundSubscription.name,
          category: foundSubscription.category,
          subcategory: foundSubscription.subcategory || '',
          description: foundSubscription.description || '',
          url: foundSubscription.url || '',
          logoUrl: foundSubscription.logo || '',
          plan: foundSubscription.plan || 'Free',
          cost: foundSubscription.cost || 0,
          currency: foundSubscription.currency || 'USD',
          billingCycle: foundSubscription.billingCycle || 'Monthly',
          status: foundSubscription.status || 'active',
          accountEmailInUse: foundSubscription.accountEmail || '',
          notes: foundSubscription.notes || '',
          renewalDate: foundSubscription.renewalDate ? foundSubscription.renewalDate.toISOString().split('T')[0] : '',
          startDate: foundSubscription.startDate ? foundSubscription.startDate.toISOString().split('T')[0] : '',
          fallbackIcon: foundSubscription.fallbackIcon || '🤖',
          previouslyUsedPromotionCode: foundSubscription.previouslyUsedPromotionCode || [],
          latestPromotionCode: foundSubscription.latestPromotionCode || '',
          usageFrequency: foundSubscription.usageFrequency || 'monthly',
          usageImportance: foundSubscription.usageImportance || 'Medium',
          accountEmailsUsedPreviously: foundSubscription.accountEmailsUsedPreviously || [],
          apiAccessKeys: foundSubscription.apiAccessKeys || [],
          secretKey: foundSubscription.secretKey || '',
          chinaRegionOnly: foundSubscription.chinaRegionOnly || false,
          safeForWork: foundSubscription.safeForWork || true
        };

        setFormData(subscriptionFormData);
        setOriginalData(subscriptionFormData);
        setLoading(false);
      } catch (error) {
        console.error('Error loading subscription:', error);
        toast.error('Failed to load subscription');
        router.push('/?view=list');
      }
    };

    loadSubscription();
  }, [subscriptionId, router, toast]);

  const handleInputChange = (field: keyof UpdateSubscriptionFormData, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      const subscriptions = await loadSubscriptions();
      const updatedSubscriptions = subscriptions.map(sub => 
        sub.id === subscriptionId ? { ...sub, ...formData } : sub
      );
      
      await saveSubscriptions(updatedSubscriptions);
      toast.success('Subscription updated successfully!');
      router.push('/?view=list');
    } catch (error) {
      console.error('Error saving subscription:', error);
      toast.error('Failed to save subscription');
    }
  };

  const handleCancel = () => {
    if (hasChanges) {
      if (confirm('You have unsaved changes. Are you sure you want to cancel?')) {
        router.push('/?view=list');
      }
    } else {
      router.push('/?view=list');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading subscription...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="glass-card border-b border-orange-200/50 sticky top-0 z-30">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <ArrowLeft className="w-5 h-5 mr-2 text-gray-600" />
                  <button 
                    onClick={() => router.push('/?view=list')}
                    className="text-gray-600 hover:text-gray-800 cursor-pointer"
                  >
                    Back to Subscriptions
                  </button>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <h2 className="section-title">Update Subscription</h2>
                <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                  Editing
                </Badge>
              </div>
            </div>
          </div>
        </header>

        {/* Warning */}
        <div className="px-4 sm:px-6 lg:px-8 mb-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-yellow-900 mb-2">
              ⚠️ Update Warning
            </h4>
            <p className="text-sm text-yellow-800">
              <strong>Editing Subscription:</strong> You are about to modify an existing subscription. 
              Changes will be saved when you click &quot;Save Changes&quot;. 
              Make sure all information is correct before proceeding.
            </p>
          </div>
        </div>

        <form className="px-4 sm:px-6 lg:px-8 pb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Basic Information */}
              <Card className="border border-gray-200 shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center text-lg font-semibold text-gray-900">
                    <FileText className="w-5 h-5 mr-2 text-orange-600" />
                    Basic Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="name" className="text-sm font-medium text-gray-700">Tool Name *</Label>
                    <Input
                      id="name"
                      placeholder="e.g. ChatGPT"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="category" className="text-sm font-medium text-gray-700">Category *</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => handleInputChange('category', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {MAIN_CATEGORIES.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="description" className="text-sm font-medium text-gray-700">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Brief description of the subscription..."
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="url" className="text-sm font-medium text-gray-700">Website URL</Label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <Input
                        id="url"
                        placeholder="https://example.com"
                        value={formData.url}
                        onChange={(e) => handleInputChange('url', e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Billing Information */}
              <Card className="border border-gray-200 shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center text-lg font-semibold text-gray-900">
                    <DollarSign className="w-5 h-5 mr-2 text-green-600" />
                    Billing Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="plan" className="text-sm font-medium text-gray-700">Plan Name</Label>
                    <Select value={formData.plan} onValueChange={(value) => handleInputChange('plan', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select plan" />
                      </SelectTrigger>
                      <SelectContent>
                        {PLAN_OPTIONS.map((plan) => (
                          <SelectItem key={plan} value={plan}>
                            {plan}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="cost" className="text-sm font-medium text-gray-700">Cost</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-3 text-gray-500">$</span>
                        <Input
                          id="cost"
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={formData.cost}
                          onChange={(e) => handleInputChange('cost', parseFloat(e.target.value) || 0)}
                          className="pl-8"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="currency" className="text-sm font-medium text-gray-700">Currency</Label>
                      <Select value={formData.currency} onValueChange={(value) => handleInputChange('currency', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CURRENCIES.map((currency) => (
                            <SelectItem key={currency} value={currency}>
                              {currency}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="billingCycle" className="text-sm font-medium text-gray-700">Billing Cycle</Label>
                    <Select value={formData.billingCycle} onValueChange={(value) => handleInputChange('billingCycle', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select billing cycle" />
                      </SelectTrigger>
                      <SelectContent>
                        {BILLING_CYCLES.map((cycle) => (
                          <SelectItem key={cycle} value={cycle}>
                            {cycle}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="status" className="text-sm font-medium text-gray-700">Status</Label>
                    <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS_OPTIONS.map((status) => (
                          <SelectItem key={status} value={status.toLowerCase()}>
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Usage Information */}
              <Card className="border border-gray-200 shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center text-lg font-semibold text-gray-900">
                    <Tag className="w-5 h-5 mr-2 text-blue-600" />
                    Usage Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="usageFrequency" className="text-sm font-medium text-gray-700">Usage Frequency</Label>
                    <Select value={formData.usageFrequency} onValueChange={(value) => handleInputChange('usageFrequency', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        {USAGE_FREQUENCY.map((frequency) => (
                          <SelectItem key={frequency} value={frequency.toLowerCase()}>
                            {frequency}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="usageImportance" className="text-sm font-medium text-gray-700">Usage Importance</Label>
                    <Select value={formData.usageImportance} onValueChange={(value) => handleInputChange('usageImportance', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select importance" />
                      </SelectTrigger>
                      <SelectContent>
                        {USAGE_IMPORTANCE.map((importance) => (
                          <SelectItem key={importance} value={importance}>
                            {importance}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="safeForWork" className="text-sm font-medium text-gray-700">Safe for Work</Label>
                    <button
                      type="button"
                      onClick={() => handleInputChange('safeForWork', !formData.safeForWork)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        formData.safeForWork ? 'bg-orange-500' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          formData.safeForWork ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </CardContent>
              </Card>

              {/* Personal Notes */}
              <Card className="border border-gray-200 shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center text-lg font-semibold text-gray-900">
                    <FileText className="w-5 h-5 mr-2 text-purple-600" />
                    Personal Notes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div>
                    <Label htmlFor="notes" className="text-sm font-medium text-gray-700">Notes</Label>
                    <Textarea
                      id="notes"
                      placeholder="Additional notes about this subscription..."
                      value={formData.notes}
                      onChange={(e) => handleInputChange('notes', e.target.value)}
                      rows={4}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              className="px-6 py-2"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white"
            >
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

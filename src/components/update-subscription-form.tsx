'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { PremiumButton } from '@/components/ui/premium-button';
import { EnhancedInput } from '@/components/ui/enhanced-input';
import { FormField, FormValidation } from '@/components/ui/form-field';
import { validateSubscription } from '@/utils/validation';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/toast';
import { ToastContainer } from '@/components/ui/toast';
import { getUserFriendlyMessage } from '@/utils/error-messages';
import { sanitizeInput } from '@/lib/xss';
// import { Switch } from '@/components/ui/switch';
import { ArrowLeft, FileText, DollarSign, Gift, Globe, Mail, Tag, Calendar, Key, Shield, Plus, Trash2, RotateCcw } from 'lucide-react';
import SaveConfirmationDialog from './save-confirmation-dialog';
import CancelConfirmationDialog from './cancel-confirmation-dialog';
import { SubscriptionCategory } from '@/types/subscription';
import { Subscription } from '@/types/subscription';
import { loadSubscriptions, saveSubscriptions } from '@/lib/subscription-persistence';

interface UpdateSubscriptionFormProps {
  subscriptionId: string;
}

export interface UpdateSubscriptionFormData {
  id: string;
  name: string;
  category: SubscriptionCategory;
  subcategory: string;
  description: string;
  url: string;
  logoUrl: string;
  plan: string;
  cost: number;
  currency: string;
  billingCycle: 'Monthly' | 'Yearly' | 'Weekly' | 'Quarterly' | 'Free';
  status: 'active' | 'paused' | 'canceled';
  accountEmailInUse: string;
  notes: string;
  renewalDate: Date;
  startDate: Date;
  fallbackIcon: string;
  previouslyUsedPromotionCode: string[];
  latestPromotionCode: string;
  usageFrequency: 'daily' | 'weekly' | 'monthly' | 'rarely';
  usageImportance: string;
  accountEmailsUsedPreviously: string[];
  apiAccessKeys: string[];
  secretKey: string;
  chinaRegionOnly: boolean;
  safeForWork: boolean;
}

// Main categories (alphabetically sorted)
const MAIN_CATEGORIES = [
  'AI Tools',
  'Cloud Provider',
  'Communication',
  'Design Tools',
  'Development Tools',
  'Entertainment',
  'Magazine',
  'Newsletter',
  'Online Learning',
  'Other',
  'Productivity',
  'SaaS',
  'Security',
  'Streaming Service',
  'Utilities'
];

// AI Tool subcategories with example tools (alphabetically sorted)
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

// Custom validation for Update Subscription form
const validateUpdateSubscription = (data: UpdateSubscriptionFormData) => {
  const errors: Record<string, string[]> = {};

  // Required fields
  if (!data.name || data.name.trim() === '') {
    errors.name = ['Tool name is required'];
  }
  
  if (!data.category) {
    errors.category = ['Category is required'];
  }
  
  if (!data.plan) {
    errors.plan = ['Plan is required'];
  }
  
  if (data.cost === undefined || data.cost === null) {
    errors.cost = ['Cost is required'];
  }
  
  if (data.cost < 0) {
    errors.cost = ['Cost cannot be negative'];
  }
  
  if (!data.currency) {
    errors.currency = ['Currency is required'];
  }
  
  if (!data.billingCycle) {
    errors.billingCycle = ['Billing cycle is required'];
  }
  
  if (!data.status) {
    errors.status = ['Status is required'];
  }
  
  if (!data.startDate) {
    errors.startDate = ['Start date is required'];
  }
  
  if (!data.renewalDate) {
    errors.renewalDate = ['Renewal date is required'];
  }

  // Email validation (if provided)
  if (data.accountEmailInUse && data.accountEmailInUse.trim() !== '') {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.accountEmailInUse)) {
      errors.accountEmailInUse = ['Invalid email format'];
    }
  }

  // URL validation (if provided)
  if (data.url && data.url.trim() !== '') {
    try {
      new URL(data.url);
    } catch {
      errors.url = ['Invalid URL format'];
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export default function UpdateSubscriptionForm({ subscriptionId }: UpdateSubscriptionFormProps) {
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);
  const [originalData, setOriginalData] = useState<UpdateSubscriptionFormData | null>(null);
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  
  // Section-level change tracking
  const [sectionStates, setSectionStates] = useState<Record<string, { hasChanges: boolean; changeHistory: Array<{ field: string; value: string | number | boolean; timestamp: number }> }>>({
    'BASIC_INFO': { hasChanges: false, changeHistory: [] },
    'KEY_MANAGEMENT': { hasChanges: false, changeHistory: [] },
    'USAGE': { hasChanges: false, changeHistory: [] },
    'BILLING': { hasChanges: false, changeHistory: [] },
    'PROMO': { hasChanges: false, changeHistory: [] },
    'MISCELLANEOUS': { hasChanges: false, changeHistory: [] },
    'NOTES': { hasChanges: false, changeHistory: [] }
  });
  
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
    renewalDate: new Date(),
    startDate: new Date(),
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

  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [apiKeyInput, setApiKeyInput] = useState('');

  // Section field mapping
  const sectionFieldMap: Record<string, string[]> = {
    'BASIC_INFO': ['name', 'category', 'subcategory', 'description', 'url'],
    'KEY_MANAGEMENT': ['secretKey', 'apiAccessKeys'],
    'USAGE': ['usageFrequency', 'usageImportance', 'safeForWork'],
    'BILLING': ['plan', 'cost', 'currency', 'billingCycle', 'startDate', 'renewalDate', 'status', 'accountEmailInUse'],
    'PROMO': ['latestPromotionCode', 'previouslyUsedPromotionCode'],
    'MISCELLANEOUS': ['chinaRegionOnly', 'logoUrl', 'fallbackIcon'],
    'NOTES': ['notes']
  };

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
          renewalDate: foundSubscription.renewalDate || new Date(),
          startDate: foundSubscription.startDate || new Date(),
          fallbackIcon: foundSubscription.fallbackIcon || '🤖',
          previouslyUsedPromotionCode: foundSubscription.previouslyUsedPromotionCode || [],
          latestPromotionCode: foundSubscription.latestPromotionCode || '',
          usageFrequency: foundSubscription.usageFrequency || 'monthly',
          usageImportance: 'Medium', // Default value since usageImportance is not in Subscription type
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
  }, [subscriptionId, router]);

  const handleInputChange = (field: keyof UpdateSubscriptionFormData, value: string | number | boolean) => {
    if (field === 'startDate' || field === 'renewalDate') {
      setFormData(prev => ({ ...prev, [field]: new Date(value as string) }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
    setHasChanges(true);
    
    // Update section states
    updateSectionStates(field as string, value as string | number | boolean);
  };

  const updateSectionStates = (field: string, value: string | number | boolean) => {
    setSectionStates(prevStates => {
      const newStates = { ...prevStates };
      
      // Find which section this field belongs to
      Object.entries(sectionFieldMap).forEach(([section, fields]) => {
        if (fields.includes(field)) {
          newStates[section] = {
            hasChanges: true,
            changeHistory: [...(newStates[section]?.changeHistory || []), { field, value, timestamp: Date.now() }]
          };
        }
      });
      
      return newStates;
    });
  };

  const handleArrayAdd = (field: 'previouslyUsedPromotionCode' | 'accountEmailsUsedPreviously' | 'apiAccessKeys', input: string) => {
    if (input.trim()) {
      setFormData(prev => ({
        ...prev,
        [field]: [...prev[field], input.trim()]
      }));
      setHasChanges(true);
    }
  };

  const handleArrayRemove = (field: 'previouslyUsedPromotionCode' | 'accountEmailsUsedPreviously' | 'apiAccessKeys', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
    setHasChanges(true);
    updateSectionStates(field, formData[field].filter((_, i) => i !== index) as unknown as string | number | boolean);
  };

  // Utility function to create section header with change tracking
  const createSectionHeader = (sectionKey: string, icon: React.ReactNode, title: string) => {
    return (
      <CardTitle className="flex items-center justify-between text-lg font-semibold text-gray-900">
        <div className="flex items-center">
          {icon}
          {title}
          {sectionStates[sectionKey]?.hasChanges && (
            <Badge variant="secondary" className="ml-2 bg-orange-100 text-orange-800">
              Modified
            </Badge>
          )}
        </div>
        {sectionStates[sectionKey]?.hasChanges && (
          <div className="flex items-center space-x-2">
            <PremiumButton
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => revertSection(sectionKey)}
              className="text-gray-500 hover:text-gray-700 p-2"
              title="Revert All Changes"
            >
              <RotateCcw className="w-5 h-5" />
            </PremiumButton>
          </div>
        )}
      </CardTitle>
    );
  };

  const revertSection = (section: string) => {
    if (!originalData) return;
    
    const fields = sectionFieldMap[section];
    if (!fields) return;
    
    const newFormData = { ...formData };
    
    // Revert all fields in section to original values
    fields.forEach(field => {
      if (field in originalData) {
        (newFormData as unknown as Record<string, unknown>)[field] = (originalData as unknown as Record<string, unknown>)[field];
      }
    });
    
    setFormData(newFormData);
    
    // Reset section state
    setSectionStates(prev => ({
      ...prev,
      [section]: { hasChanges: false, changeHistory: [] }
    }));
  };

  // Option grid control component that shows all options at once
  const OptionGridControl = ({ 
    label, 
    value, 
    options, 
    onChange, 
    className = "" 
  }: { 
    label: string; 
    value: string; 
    options: string[]; 
    onChange: (value: string) => void;
    className?: string;
  }) => {
    return (
      <div className={`space-y-2 ${className}`}>
        <Label className="text-sm font-medium text-gray-700">{label}</Label>
        <div className="grid grid-cols-2 gap-2">
          {options.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => onChange(option)}
              className={`px-3 py-2 text-sm font-medium rounded-md border transition-colors ${
                value === option
                  ? 'bg-orange-500 text-white border-orange-500'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    );
  };

  const handleSave = () => {
    // Show confirmation dialog
    setIsSaveDialogOpen(true);
  };

  const handleSaveConfirm = async () => {
    try {
      setIsSaving(true);
      
      // Custom validation for Update Subscription form
      const validation = validateUpdateSubscription(formData);
      if (!validation.isValid) {
        const errorMessage = getUserFriendlyMessage('VALIDATION_ERROR');
        toast.error(errorMessage);
        setIsSaveDialogOpen(false);
        return;
      }

      const subscriptions = await loadSubscriptions();
      const updatedSubscriptions = subscriptions.map(sub => 
        sub.id === subscriptionId ? { ...sub, ...formData } : sub
      );
      
      await saveSubscriptions(updatedSubscriptions);
      
      toast.success('Subscription updated successfully!');
      
      // Navigate to list view specifically
      router.push('/?view=list');
    } catch (error) {
      console.error('Error saving subscription:', error);
      toast.error('Failed to save subscription');
    } finally {
      setIsSaving(false);
      setIsSaveDialogOpen(false);
    }
  };

  const handleCancel = () => {
    if (hasChanges) {
      setIsCancelDialogOpen(true);
    } else {
      router.push('/?view=list');
    }
  };

  const handleCancelConfirm = () => {
    router.push('/?view=list');
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
    <div className="min-h-screen bg-gradient-to-br from-neutral-100 to-neutral-200">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-neutral-200 sticky top-0 z-30">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <ArrowLeft className="w-5 h-5 mr-2 text-neutral-600" />
                  <button 
                    onClick={() => router.push('/?view=list')}
                    className="text-neutral-600 hover:text-neutral-800 cursor-pointer transition-colors"
                  >
                    Back to Subscriptions
                  </button>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <h2 className="text-h2 text-neutral-900">Update Subscription</h2>
                <Badge variant="secondary" className="bg-primary-100 text-primary-800">
                  Editing
                </Badge>
              </div>
            </div>
          </div>
        </header>

        {/* Warning */}
        <div className="px-4 sm:px-6 lg:px-8 mt-4 mb-6">
          <EnhancedCard variant="outlined" className="bg-warning-50 border-warning-200">
            <div className="p-2 md:p-3">
              <h4 className="text-sm font-semibold text-warning-900 mb-2 flex items-center">
                ⚠️ Update Warning
              </h4>
              <p className="text-sm text-warning-800">
                <strong>Editing Subscription:</strong> You are about to modify an existing subscription. 
                Changes will be saved when you click &quot;Save Changes&quot;. 
                Make sure all information is correct before proceeding.
              </p>
            </div>
          </EnhancedCard>
        </div>

        <form className="px-4 sm:px-6 lg:px-8 pb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Basic Information */}
              <EnhancedCard variant="elevated" className="border border-neutral-200">
                <CardHeader className="pb-4">
                  {createSectionHeader('BASIC_INFO', <FileText className="w-5 h-5 mr-2 text-primary-600" />, 'Basic Information')}
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
                      value={formData.category === 'AI Tools' && formData.subcategory ? `ai-tools-${formData.subcategory}` : formData.category}
                      onValueChange={(value) => {
                        if (value.startsWith('ai-tools-')) {
                          // AI Tool subcategory selected
                          const subcategory = value.replace('ai-tools-', '');
                          handleInputChange('category', 'AI Tools');
                          handleInputChange('subcategory', subcategory);
                        } else {
                          // Regular category selected
                          handleInputChange('category', value);
                          handleInputChange('subcategory', '');
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category">
                          {formData.category === 'AI Tools' && formData.subcategory 
                            ? `AI Tools: ${formData.subcategory}`
                            : formData.category || 'Select category'}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent className="max-h-96">
                        {MAIN_CATEGORIES.map((category) => {
                          if (category === 'AI Tools') {
                            return (
                              <div key={category}>
                                {/* AI Tools Main Category */}
                                <SelectItem value="AI Tools">
                                  <div className="flex items-center">
                                    <span className="font-medium">AI Tools</span>
                                    <span className="ml-2 text-xs text-gray-500">(21 subcategories)</span>
                                  </div>
                                </SelectItem>
                                
                                {/* AI Tool Subcategories - Nested */}
                                <div className="ml-4 border-l-2 border-orange-200 pl-2 space-y-1">
                                  {AI_TOOL_SUBCATEGORIES_WITH_EXAMPLES.map((subcategory) => (
                                    <SelectItem key={`ai-tools-${subcategory.value}`} value={`ai-tools-${subcategory.value}`} className="nested-dropdown-item">
                                      <div className="flex items-center py-1">
                                        <div className="w-2 h-2 bg-orange-400 rounded-full mr-3 flex-shrink-0"></div>
                                        <div className="flex flex-col">
                                          <span className="font-medium text-sm">{subcategory.value}</span>
                                          <span className="text-xs text-gray-500">e.g., {subcategory.example}</span>
                                        </div>
                                      </div>
                                    </SelectItem>
                                  ))}
                                </div>
                                {/* Separator after AI Tools */}
                                <div className="my-2 border-t border-gray-200"></div>
                              </div>
                            );
                          } else {
                            // Add header for first non-AI Tools category
                            const isFirstOtherCategory = category === 'Cloud Provider';
                            return (
                              <div key={category}>
                                {isFirstOtherCategory && (
                                  <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 bg-gray-50">
                                    Other Categories
                                  </div>
                                )}
                                <SelectItem value={category}>
                                  {category}
                                </SelectItem>
                              </div>
                            );
                          }
                        })}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="description" className="text-sm font-medium text-gray-700">Description (optional)</Label>
                    <Textarea
                      id="description"
                      placeholder="Brief description of the AI tool and its capabilities..."
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="url" className="text-sm font-medium text-gray-700">Website URL (optional)</Label>
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
              </EnhancedCard>

              {/* Key Management */}
              <Card className="border border-gray-200 shadow-sm">
                <CardHeader className="pb-4">
                  {createSectionHeader('KEY_MANAGEMENT', <Key className="w-5 h-5 mr-2 text-orange-600" />, 'Key Management')}
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="secretKey" className="text-sm font-medium text-gray-700">Secret Key (optional)</Label>
                    <div className="relative">
                      <Key className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <Input
                        id="secretKey"
                        type="password"
                        placeholder="Enter secret key"
                        value={formData.secretKey}
                        onChange={(e) => handleInputChange('secretKey', e.target.value)}
                        className="pl-10"
                        autoComplete="new-password"
                        inputMode="text"
                        name="secret_key"
                        data-lpignore="true"
                        data-1p-ignore
                        data-form-type="other"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-700">API Access Keys</Label>
                    <p className="text-xs text-gray-500 mb-2">Add multiple API keys for different environments or backup access</p>
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Input
                          placeholder="e.g. sk-example123"
                          value={apiKeyInput}
                          onChange={(e) => setApiKeyInput(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleArrayAdd('apiAccessKeys', apiKeyInput);
                              setApiKeyInput('');
                            }
                          }}
                          autoComplete="off"
                          inputMode="text"
                          name="api_access_key"
                          data-lpignore="true"
                          data-1p-ignore
                          data-form-type="other"
                        />
                        <PremiumButton
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            handleArrayAdd('apiAccessKeys', apiKeyInput);
                            setApiKeyInput('');
                          }}
                        >
                          <Plus className="w-4 h-4" />
                        </PremiumButton>
                      </div>
                      <div className="space-y-2">
                        {formData.apiAccessKeys.map((key, index) => (
                          <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded border">
                            <Key className="w-4 h-4 text-gray-400" />
                            <span className="flex-1 text-sm font-mono">{key}</span>
                            <PremiumButton
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleArrayRemove('apiAccessKeys', index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </PremiumButton>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Usage */}
              <EnhancedCard variant="elevated" className="border border-neutral-200">
                <CardHeader className="pb-4">
                  {createSectionHeader('USAGE', <Shield className="w-5 h-5 mr-2 text-primary-600" />, 'Usage')}
                </CardHeader>
                <CardContent className="space-y-4">
                  <OptionGridControl
                    label="Usage Importance"
                    value={formData.usageImportance}
                    options={USAGE_IMPORTANCE}
                    onChange={(value) => handleInputChange('usageImportance', value)}
                  />

                  <OptionGridControl
                    label="Usage Frequency"
                    value={formData.usageFrequency}
                    options={USAGE_FREQUENCY}
                    onChange={(value) => handleInputChange('usageFrequency', value)}
                  />

                  <div className="flex items-center justify-between">
                    <Label htmlFor="safeForWork" className="text-sm font-medium text-gray-700">Safe for Work</Label>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        id="safeForWork"
                        checked={formData.safeForWork}
                        onChange={(e) => handleInputChange('safeForWork', e.target.checked)}
                        className="sr-only"
                      />
                      <div className={`relative w-20 h-7 rounded-full transition-colors ${formData.safeForWork ? 'bg-orange-500' : 'bg-gray-200'}`}>
                        <div className={`absolute inset-0 flex items-center justify-center text-xs font-medium transition-colors ${formData.safeForWork ? 'text-white' : 'text-gray-600'}`}>
                          {formData.safeForWork ? 'YES' : 'NO'}
                        </div>
                        <div className={`absolute top-[2px] w-6 h-6 bg-white border border-gray-300 rounded-full transition-transform ${formData.safeForWork ? 'translate-x-[52px]' : 'translate-x-[2px]'}`}></div>
                      </div>
                    </label>
                  </div>
                </CardContent>
              </EnhancedCard>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Billing Information */}
              <EnhancedCard variant="elevated" className="border border-neutral-200">
                <CardHeader className="pb-4">
                  {createSectionHeader('BILLING', <DollarSign className="w-5 h-5 mr-2 text-primary-600" />, 'Billing Information')}
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="plan" className="text-sm font-medium text-gray-700">Plan Name *</Label>
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

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="cost" className="text-sm font-medium text-gray-700">Cost *</Label>
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
                          required
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
                            <SelectItem key={currency} value={currency}>{currency}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <OptionGridControl
                    label="Billing Cycle"
                    value={formData.billingCycle}
                    options={BILLING_CYCLES}
                    onChange={(value) => handleInputChange('billingCycle', value)}
                  />

                  <div>
                    <Label htmlFor="startDate" className="text-sm font-medium text-gray-700">Start Date *</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <Input
                        id="startDate"
                        type="date"
                        value={formData.startDate.toISOString().split('T')[0]}
                        onChange={(e) => handleInputChange('startDate', e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="renewalDate" className="text-sm font-medium text-gray-700">Next Renewal Date *</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <Input
                        id="renewalDate"
                        type="date"
                        value={formData.renewalDate.toISOString().split('T')[0]}
                        onChange={(e) => handleInputChange('renewalDate', e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <OptionGridControl
                    label="Status"
                    value={formData.status}
                    options={STATUS_OPTIONS}
                    onChange={(value) => handleInputChange('status', value)}
                  />

                  <div>
                    <Label htmlFor="accountEmailInUse" className="text-sm font-medium text-gray-700">Account Email (optional)</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <Input
                        id="accountEmailInUse"
                        type="email"
                        placeholder="email@example.com"
                        value={formData.accountEmailInUse}
                        onChange={(e) => handleInputChange('accountEmailInUse', e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </CardContent>
              </EnhancedCard>

              {/* Promo Details */}
              <EnhancedCard variant="elevated" className="border border-neutral-200">
                <CardHeader className="pb-4">
                  {createSectionHeader('PROMO', <Gift className="w-5 h-5 mr-2 text-primary-600" />, 'Promo Details (optional)')}
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="latestPromotionCode" className="text-sm font-medium text-gray-700">Latest Promo Code</Label>
                    <div className="relative">
                      <Tag className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <Input
                        id="latestPromotionCode"
                        placeholder="e.g. SAVE20"
                        value={formData.latestPromotionCode}
                        onChange={(e) => handleInputChange('latestPromotionCode', e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-700">Previously Used Promo Codes</Label>
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Input
                          placeholder="e.g. LABOR25"
                          value={promoCodeInput}
                          onChange={(e) => setPromoCodeInput(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleArrayAdd('previouslyUsedPromotionCode', promoCodeInput);
                              setPromoCodeInput('');
                            }
                          }}
                        />
                        <PremiumButton
                          type="button"
                          variant="secondary"
                          onClick={() => {
                            handleArrayAdd('previouslyUsedPromotionCode', promoCodeInput);
                            setPromoCodeInput('');
                          }}
                        >
                          Add
                        </PremiumButton>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {formData.previouslyUsedPromotionCode.map((code, index) => (
                          <Badge key={index} variant="secondary" className="flex items-center gap-1">
                            {code}
                            <button
                              type="button"
                              onClick={() => handleArrayRemove('previouslyUsedPromotionCode', index)}
                              className="ml-1 hover:text-red-500"
                            >
                              ×
                            </button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </EnhancedCard>

              {/* Miscellaneous */}
              <EnhancedCard variant="elevated" className="border border-neutral-200">
                <CardHeader className="pb-4">
                  {createSectionHeader('MISCELLANEOUS', <Shield className="w-5 h-5 mr-2 text-primary-600" />, 'Miscellaneous')}
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="chinaRegionOnly" className="text-sm font-medium text-gray-700">China Region Only</Label>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        id="chinaRegionOnly"
                        checked={formData.chinaRegionOnly}
                        onChange={(e) => handleInputChange('chinaRegionOnly', e.target.checked)}
                        className="sr-only"
                      />
                      <div className={`relative w-20 h-7 rounded-full transition-colors ${formData.chinaRegionOnly ? 'bg-orange-500' : 'bg-gray-200'}`}>
                        <div className={`absolute inset-0 flex items-center justify-center text-xs font-medium transition-colors ${formData.chinaRegionOnly ? 'text-white' : 'text-gray-600'}`}>
                          {formData.chinaRegionOnly ? 'YES' : 'NO'}
                        </div>
                        <div className={`absolute top-[2px] w-6 h-6 bg-white border border-gray-300 rounded-full transition-transform ${formData.chinaRegionOnly ? 'translate-x-[52px]' : 'translate-x-[2px]'}`}></div>
                      </div>
                    </label>
                  </div>

                  <div>
                    <Label htmlFor="logoUrl" className="text-sm font-medium text-gray-700">Logo URL (optional)</Label>
                    <Input
                      id="logoUrl"
                      placeholder="https://example.com/logo.png"
                      value={formData.logoUrl}
                      onChange={(e) => handleInputChange('logoUrl', e.target.value)}
                    />
                    <p className="text-xs text-gray-500 mt-1">Leave blank for a default placeholder</p>
                  </div>

                  <div>
                    <Label htmlFor="fallbackIcon" className="text-sm font-medium text-gray-700">Fallback Icon</Label>
                    <Input
                      id="fallbackIcon"
                      placeholder="🤖"
                      value={formData.fallbackIcon}
                      onChange={(e) => handleInputChange('fallbackIcon', e.target.value)}
                    />
                  </div>
                </CardContent>
              </EnhancedCard>

              {/* Personal Notes */}
              <EnhancedCard variant="elevated" className="border border-neutral-200">
                <CardHeader className="pb-4">
                  {createSectionHeader('NOTES', <FileText className="w-5 h-5 mr-2 text-primary-600" />, 'Personal Notes (optional)')}
                </CardHeader>
                <CardContent>
                    <Textarea
                    placeholder="Any personal notes about this AI tool subscription..."
                      value={formData.notes}
                      onChange={(e) => handleInputChange('notes', sanitizeInput(e.target.value))}
                    rows={4}
                  />
                </CardContent>
              </EnhancedCard>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-neutral-200">
            <PremiumButton 
              type="button" 
              variant="secondary"
              onClick={handleCancel}
            >
              Cancel
            </PremiumButton>
            <PremiumButton 
              type="button"
              variant="gradient"
              onClick={handleSave}
            >
              Save Changes
            </PremiumButton>
          </div>
        </form>
      </div>
      
      {/* Save Confirmation Dialog */}
      <SaveConfirmationDialog
        isOpen={isSaveDialogOpen}
        onClose={() => setIsSaveDialogOpen(false)}
        onConfirm={handleSaveConfirm}
        subscriptionData={formData}
        isLoading={isSaving}
      />
      
      {/* Cancel Confirmation Dialog */}
      <CancelConfirmationDialog
        isOpen={isCancelDialogOpen}
        onClose={() => setIsCancelDialogOpen(false)}
        onConfirm={handleCancelConfirm}
        isLoading={false}
      />
      
      <ToastContainer />
    </div>
  );
}
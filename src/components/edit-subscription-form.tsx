'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/toast';
import { ArrowLeft, FileText, Save, RotateCcw, Undo2, Key, Shield, DollarSign, Gift, Globe, Calendar, Mail } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Subscription } from '@/types/subscription';
import { loadSubscriptions, saveSubscriptions } from '@/lib/subscription-persistence';
import { validateSubscription } from '@/utils/validation';
import { useLoadingState } from '@/hooks/use-loading-state';
import { handleSubscriptionError } from '@/utils/error-handler';

interface EditSubscriptionFormProps {
  subscriptionId: string;
}

// Section identifiers for change tracking
const SECTIONS = {
  BASIC_INFO: 'basic-info',
  KEY_MANAGEMENT: 'key-management', 
  USAGE: 'usage',
  BILLING: 'billing',
  PROMO: 'promo',
  MISCELLANEOUS: 'miscellaneous',
  NOTES: 'notes'
} as const;

type SectionKey = keyof typeof SECTIONS;

interface SectionState {
  hasChanges: boolean;
  originalData: Record<string, unknown>;
  currentData: Record<string, unknown>;
  changeHistory: Record<string, unknown>[];
}

export default function EditSubscriptionForm({ subscriptionId }: EditSubscriptionFormProps) {
  const router = useRouter();
  const loadingState = useLoadingState();
  const toast = useToast();

  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const [sectionStates, setSectionStates] = useState<Record<string, SectionState>>({});
  const [hasAnyChanges, setHasAnyChanges] = useState(false);

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

  // Constants from Add Subscription form
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
    'Security',
    'Social Media',
    'Storage',
    'Utilities',
    'Video Streaming',
    'Web Hosting'
  ];

  const AI_TOOL_SUBCATEGORIES_WITH_EXAMPLES = [
    { value: 'Language Model', example: 'ChatGPT, Claude' },
    { value: 'Code Generation', example: 'GitHub Copilot, Tabnine' },
    { value: 'Image Generation', example: 'DALL-E, Midjourney' },
    { value: 'Video Generation', example: 'Runway, Pika' },
    { value: 'Audio Generation', example: 'ElevenLabs, Murf' },
    { value: 'Data Analysis', example: 'DataGPT, Julius' },
    { value: 'Writing Assistant', example: 'Jasper, Copy.ai' },
    { value: 'Research Assistant', example: 'Perplexity, Consensus' },
    { value: 'Code Review', example: 'CodeRabbit, DeepCode' },
    { value: 'Document Processing', example: 'DocuSign, PandaDoc' },
    { value: 'Customer Support', example: 'Intercom, Zendesk' },
    { value: 'Sales Assistant', example: 'Salesforce Einstein, HubSpot' },
    { value: 'Marketing', example: 'Hootsuite, Buffer' },
    { value: 'Design', example: 'Figma, Canva' },
    { value: 'Translation', example: 'DeepL, Google Translate' },
    { value: 'Summarization', example: 'SummarizeBot, TLDR' },
    { value: 'Chatbot', example: 'Chatfuel, ManyChat' },
    { value: 'Automation', example: 'Zapier, IFTTT' },
    { value: 'Analytics', example: 'Mixpanel, Amplitude' },
    { value: 'Testing', example: 'Testim, Applitools' },
    { value: 'Other', example: 'Custom tools' }
  ];

  const PLAN_OPTIONS = ['Enterprise', 'Free', 'Max', 'Personal', 'Plus', 'Premium', 'Pro', 'Team', 'Ultra'];
  const BILLING_CYCLES = ['Monthly', 'Yearly', 'One-time', 'Pay-per-use'];
  const CURRENCIES = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY'];

  // Initialize section states
  useEffect(() => {
    const initialSectionStates: Record<string, SectionState> = {};
    Object.values(SECTIONS).forEach(sectionId => {
      initialSectionStates[sectionId] = {
        hasChanges: false,
        originalData: {},
        currentData: {},
        changeHistory: []
      };
    });
    setSectionStates(initialSectionStates);
  }, []);

  // Load subscription data
  useEffect(() => {
    const loadSubscription = async () => {
      try {
        const subscriptions = await loadSubscriptions();
        const foundSubscription = subscriptions.find(sub => sub.id === subscriptionId);
        
        if (!foundSubscription) {
          toast.error('Subscription not found');
          return;
        }

        setSubscription(foundSubscription);
        
        // Initialize form data
        const newFormData = {
          name: foundSubscription.name || '',
          category: foundSubscription.category || 'AI Tools',
          subcategory: foundSubscription.subcategory || '',
          description: foundSubscription.description || '',
          url: foundSubscription.url || '',
          // Add all other fields...
        };
        
        setFormData(newFormData);
        
        // Initialize section states with original data
        updateSectionStates(newFormData, foundSubscription);
      } catch (error) {
        handleSubscriptionError(
          error as Error,
          'loading subscription',
          { component: 'edit-subscription-form' }
        );
        toast.error('Failed to load subscription');
      }
    };

    loadSubscription();
  }, [subscriptionId, toast]);

  // Update section states when form data changes
  const updateSectionStates = useCallback((newFormData: Record<string, unknown>, originalData: Subscription | null) => {
    // Don't update if original data is not loaded yet
    if (!originalData) return;
    
    const updatedStates = { ...sectionStates };
    let anyChanges = false;

    // Check each section for changes
    Object.entries(SECTIONS).forEach(([sectionKey, sectionId]) => {
      const sectionFields = getSectionFields(sectionKey as SectionKey);
      const originalSectionData = extractSectionData(originalData as unknown as Record<string, unknown>, sectionFields);
      const currentSectionData = extractSectionData(newFormData, sectionFields);
      
      const hasChanges = !isEqual(originalSectionData, currentSectionData);
      
      updatedStates[sectionId] = {
        hasChanges,
        originalData: originalSectionData,
        currentData: currentSectionData,
        changeHistory: hasChanges ? [...(updatedStates[sectionId]?.changeHistory || []), currentSectionData] : []
      };
      
      if (hasChanges) anyChanges = true;
    });

    setSectionStates(updatedStates);
    setHasAnyChanges(anyChanges);
  }, [sectionStates]);

  // Get fields for each section
  const getSectionFields = (sectionKey: SectionKey): string[] => {
    const fieldMap: Record<string, string[]> = {
      'BASIC_INFO': ['name', 'category', 'subcategory', 'description', 'url'],
      'KEY_MANAGEMENT': ['secretKey', 'apiAccessKeys'],
      'USAGE': ['usageImportance', 'usageFrequency', 'safeForWork'],
      'BILLING': ['plan', 'cost', 'currency', 'billingCycle', 'startDate', 'renewalDate', 'status'],
      'PROMO': ['latestPromotionCode', 'previouslyUsedPromotionCode'],
      'MISCELLANEOUS': ['chinaRegionOnly', 'logoUrl', 'fallbackIcon'],
      'NOTES': ['notes']
    };
    return fieldMap[sectionKey] || [];
  };

  // Extract data for a specific section
  const extractSectionData = (data: Record<string, unknown>, fields: string[]): Record<string, unknown> => {
    const sectionData: Record<string, unknown> = {};
    fields.forEach(field => {
      sectionData[field] = data[field];
    });
    return sectionData;
  };

  // Deep equality check
  const isEqual = (obj1: Record<string, unknown>, obj2: Record<string, unknown>): boolean => {
    return JSON.stringify(obj1) === JSON.stringify(obj2);
  };

  // Handle input changes
  const handleInputChange = (field: string, value: unknown) => {
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);
    updateSectionStates(newFormData, subscription);
  };

  // Revert section changes
  const revertSection = (sectionId: string, revertType: 'all' | 'last') => {
    const sectionState = sectionStates[sectionId];
    if (!sectionState) return;

    if (revertType === 'all') {
      // Revert to original values
      const newFormData = { ...formData };
      Object.keys(sectionState.originalData).forEach(field => {
        newFormData[field] = sectionState.originalData[field];
      });
      setFormData(newFormData);
      updateSectionStates(newFormData, subscription);
      toast.success('Section reverted to original values');
    } else if (revertType === 'last' && sectionState.changeHistory.length > 1) {
      // Revert to previous change
      const previousData = sectionState.changeHistory[sectionState.changeHistory.length - 2];
      const newFormData = { ...formData };
      Object.keys(previousData).forEach(field => {
        newFormData[field] = previousData[field];
      });
      setFormData(newFormData);
      updateSectionStates(newFormData, subscription);
      toast.success('Last change reverted');
    }
  };

  // Handle save with confirmation
  const handleSave = async () => {
    if (!subscription) return;

    // Check if there are any changes
    if (!hasAnyChanges) {
      toast.error('No changes detected to save');
      return;
    }

    // Show confirmation dialog
    const confirmed = window.confirm(
      'Do you really want to make these changes? These changes are irreversible.'
    );
    
    if (!confirmed) return;

    loadingState.setLoading(true, 'Saving changes...');

    try {
      const updatedSubscription: Subscription = {
        ...subscription,
        ...formData,
        // Ensure proper data types
        cost: parseFloat(formData.cost as string) || 0,
        startDate: new Date(formData.startDate as string),
        renewalDate: new Date(formData.renewalDate as string),
      };

      const validation = validateSubscription(updatedSubscription);
      if (!validation.isValid) {
        toast.error('Please fix validation errors before saving');
        return;
      }

      const subscriptions = await loadSubscriptions();
      const updatedSubscriptions = subscriptions.map(s => 
        s.id === updatedSubscription.id ? updatedSubscription : s
      );
      
      await saveSubscriptions(updatedSubscriptions);
      toast.success('Subscription updated successfully!');
      
      // Redirect to main page with list view
      router.push('/?view=list');
    } catch (error) {
      toast.error('Failed to save changes');
      handleSubscriptionError(
        error as Error,
        'saving subscription',
        { component: 'edit-subscription-form' }
      );
    } finally {
      loadingState.setLoading(false);
    }
  };

  if (!subscription) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4"></div>
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
                  Update Entry
                </Badge>
              </div>
            </div>
          </div>
        </header>

        {/* Update Warning */}
        <div className="px-4 sm:px-6 lg:px-8 mb-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-yellow-900 mb-2">
              ⚠️ Update Warning
            </h4>
            <p className="text-sm text-yellow-800">
              <strong>Editing Subscription:</strong> You are about to modify an existing subscription. 
              Changes will be saved immediately when you click &quot;Save Changes&quot;. 
              Make sure all information is correct before proceeding.
            </p>
          </div>
        </div>

        <form className="px-4 sm:px-6 lg:px-8 pb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Basic Information Section */}
              <Card className="border border-gray-200 shadow-sm">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center text-lg font-semibold text-gray-900">
                      <FileText className="w-5 h-5 mr-2 text-orange-600" />
                      Basic Information
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                      {sectionStates[SECTIONS.BASIC_INFO]?.hasChanges && (
                        <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                          Modified
                        </Badge>
                      )}
                      {sectionStates[SECTIONS.BASIC_INFO]?.hasChanges && (
                        <div className="flex space-x-1">
                          <button
                            type="button"
                            onClick={() => revertSection(SECTIONS.BASIC_INFO, 'last')}
                            className="p-1 hover:bg-gray-100 rounded"
                            title="Revert Last Change"
                          >
                            <Undo2 className="w-4 h-4 text-gray-600" />
                          </button>
                          <button
                            type="button"
                            onClick={() => revertSection(SECTIONS.BASIC_INFO, 'all')}
                            className="p-1 hover:bg-gray-100 rounded"
                            title="Revert All Changes"
                          >
                            <RotateCcw className="w-4 h-4 text-gray-600" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="name" className="text-sm font-medium text-gray-700">Tool Name *</Label>
                    <Input
                      id="name"
                      placeholder="e.g. ChatGPT"
                      value={(formData.name as string) || ''}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="category" className="text-sm font-medium text-gray-700">Category *</Label>
                    <Select
                      value={(formData.category as string) === 'AI Tools' && formData.subcategory ? `ai-tools-${formData.subcategory}` : (formData.category as string)}
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
                          {(formData.category as string) === 'AI Tools' && formData.subcategory 
                            ? `AI Tools: ${formData.subcategory}`
                            : (formData.category as string) || 'Select category'}
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
                      value={(formData.description as string) || ''}
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
                        value={(formData.url as string) || ''}
                        onChange={(e) => handleInputChange('url', e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Key Management Section */}
              <Card className="border border-gray-200 shadow-sm">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center text-lg font-semibold text-gray-900">
                      <Key className="w-5 h-5 mr-2 text-orange-600" />
                      Key Management
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                      {sectionStates[SECTIONS.KEY_MANAGEMENT]?.hasChanges && (
                        <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                          Modified
                        </Badge>
                      )}
                      {sectionStates[SECTIONS.KEY_MANAGEMENT]?.hasChanges && (
                        <div className="flex space-x-1">
                          <button
                            type="button"
                            onClick={() => revertSection(SECTIONS.KEY_MANAGEMENT, 'last')}
                            className="p-1 hover:bg-gray-100 rounded"
                            title="Revert Last Change"
                          >
                            <Undo2 className="w-4 h-4 text-gray-600" />
                          </button>
                          <button
                            type="button"
                            onClick={() => revertSection(SECTIONS.KEY_MANAGEMENT, 'all')}
                            className="p-1 hover:bg-gray-100 rounded"
                            title="Revert All Changes"
                          >
                            <RotateCcw className="w-4 h-4 text-gray-600" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="secretKey" className="text-sm font-medium text-gray-700">Secret Key</Label>
                    <Input
                      id="secretKey"
                      type="password"
                      placeholder="Enter secret key"
                      value={(formData.secretKey as string) || ''}
                      onChange={(e) => handleInputChange('secretKey', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="apiAccessKeys" className="text-sm font-medium text-gray-700">API Access Keys</Label>
                    <Input
                      id="apiAccessKeys"
                      placeholder="Enter API keys"
                      value={(formData.apiAccessKeys as string) || ''}
                      onChange={(e) => handleInputChange('apiAccessKeys', e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Usage Section */}
              <Card className="border border-gray-200 shadow-sm">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center text-lg font-semibold text-gray-900">
                      <Shield className="w-5 h-5 mr-2 text-orange-600" />
                      Usage
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                      {sectionStates[SECTIONS.USAGE]?.hasChanges && (
                        <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                          Modified
                        </Badge>
                      )}
                      {sectionStates[SECTIONS.USAGE]?.hasChanges && (
                        <div className="flex space-x-1">
                          <button
                            type="button"
                            onClick={() => revertSection(SECTIONS.USAGE, 'last')}
                            className="p-1 hover:bg-gray-100 rounded"
                            title="Revert Last Change"
                          >
                            <Undo2 className="w-4 h-4 text-gray-600" />
                          </button>
                          <button
                            type="button"
                            onClick={() => revertSection(SECTIONS.USAGE, 'all')}
                            className="p-1 hover:bg-gray-100 rounded"
                            title="Revert All Changes"
                          >
                            <RotateCcw className="w-4 h-4 text-gray-600" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <OptionGridControl
                    label="Usage Importance"
                    value={(formData.usageImportance as string) || ''}
                    options={['High', 'Medium', 'Low']}
                    onChange={(value) => handleInputChange('usageImportance', value)}
                  />

                  <OptionGridControl
                    label="Usage Frequency"
                    value={(formData.usageFrequency as string) || ''}
                    options={['Daily', 'Weekly', 'Monthly', 'Rarely']}
                    onChange={(value) => handleInputChange('usageFrequency', value)}
                  />

                  <div className="flex items-center justify-between">
                    <Label htmlFor="safeForWork" className="text-sm font-medium text-gray-700">Safe for Work</Label>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        id="safeForWork"
                        checked={Boolean(formData.safeForWork)}
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
              </Card>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Billing Information Section */}
              <Card className="border border-gray-200 shadow-sm">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center text-lg font-semibold text-gray-900">
                      <DollarSign className="w-5 h-5 mr-2 text-orange-600" />
                      Billing Information
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                      {sectionStates[SECTIONS.BILLING]?.hasChanges && (
                        <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                          Modified
                        </Badge>
                      )}
                      {sectionStates[SECTIONS.BILLING]?.hasChanges && (
                        <div className="flex space-x-1">
                          <button
                            type="button"
                            onClick={() => revertSection(SECTIONS.BILLING, 'last')}
                            className="p-1 hover:bg-gray-100 rounded"
                            title="Revert Last Change"
                          >
                            <Undo2 className="w-4 h-4 text-gray-600" />
                          </button>
                          <button
                            type="button"
                            onClick={() => revertSection(SECTIONS.BILLING, 'all')}
                            className="p-1 hover:bg-gray-100 rounded"
                            title="Revert All Changes"
                          >
                            <RotateCcw className="w-4 h-4 text-gray-600" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="plan" className="text-sm font-medium text-gray-700">Plan Name *</Label>
                    <Select value={(formData.plan as string) || ''} onValueChange={(value) => handleInputChange('plan', value)}>
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
                          value={(formData.cost as string) || ''}
                          onChange={(e) => handleInputChange('cost', parseFloat(e.target.value) || 0)}
                          className="pl-8"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="currency" className="text-sm font-medium text-gray-700">Currency</Label>
                      <Select value={(formData.currency as string) || ''} onValueChange={(value) => handleInputChange('currency', value)}>
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
                    value={(formData.billingCycle as string) || ''}
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
                        value={(formData.startDate as string) || ''}
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
                        value={(formData.renewalDate as string) || ''}
                        onChange={(e) => handleInputChange('renewalDate', e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <OptionGridControl
                    label="Status"
                    value={(formData.status as string) || ''}
                    options={['Active', 'Paused', 'Canceled', 'Trial']}
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
                        value={(formData.accountEmailInUse as string) || ''}
                        onChange={(e) => handleInputChange('accountEmailInUse', e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Promo Details Section */}
              <Card className="border border-gray-200 shadow-sm">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center text-lg font-semibold text-gray-900">
                      <Gift className="w-5 h-5 mr-2 text-orange-600" />
                      Promo Details
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                      {sectionStates[SECTIONS.PROMO]?.hasChanges && (
                        <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                          Modified
                        </Badge>
                      )}
                      {sectionStates[SECTIONS.PROMO]?.hasChanges && (
                        <div className="flex space-x-1">
                          <button
                            type="button"
                            onClick={() => revertSection(SECTIONS.PROMO, 'last')}
                            className="p-1 hover:bg-gray-100 rounded"
                            title="Revert Last Change"
                          >
                            <Undo2 className="w-4 h-4 text-gray-600" />
                          </button>
                          <button
                            type="button"
                            onClick={() => revertSection(SECTIONS.PROMO, 'all')}
                            className="p-1 hover:bg-gray-100 rounded"
                            title="Revert All Changes"
                          >
                            <RotateCcw className="w-4 h-4 text-gray-600" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="latestPromotionCode" className="text-sm font-medium text-gray-700">Latest Promotion Code</Label>
                    <Input
                      id="latestPromotionCode"
                      placeholder="e.g. SAVE20"
                      value={(formData.latestPromotionCode as string) || ''}
                      onChange={(e) => handleInputChange('latestPromotionCode', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="previouslyUsedPromotionCode" className="text-sm font-medium text-gray-700">Previously Used Promotion Code</Label>
                    <Input
                      id="previouslyUsedPromotionCode"
                      placeholder="e.g. WELCOME10"
                      value={(formData.previouslyUsedPromotionCode as string) || ''}
                      onChange={(e) => handleInputChange('previouslyUsedPromotionCode', e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Miscellaneous Section */}
              <Card className="border border-gray-200 shadow-sm">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center text-lg font-semibold text-gray-900">
                      <Globe className="w-5 h-5 mr-2 text-orange-600" />
                      Miscellaneous
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                      {sectionStates[SECTIONS.MISCELLANEOUS]?.hasChanges && (
                        <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                          Modified
                        </Badge>
                      )}
                      {sectionStates[SECTIONS.MISCELLANEOUS]?.hasChanges && (
                        <div className="flex space-x-1">
                          <button
                            type="button"
                            onClick={() => revertSection(SECTIONS.MISCELLANEOUS, 'last')}
                            className="p-1 hover:bg-gray-100 rounded"
                            title="Revert Last Change"
                          >
                            <Undo2 className="w-4 h-4 text-gray-600" />
                          </button>
                          <button
                            type="button"
                            onClick={() => revertSection(SECTIONS.MISCELLANEOUS, 'all')}
                            className="p-1 hover:bg-gray-100 rounded"
                            title="Revert All Changes"
                          >
                            <RotateCcw className="w-4 h-4 text-gray-600" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="chinaRegionOnly" className="text-sm font-medium text-gray-700">China Region Only</Label>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        id="chinaRegionOnly"
                        checked={Boolean(formData.chinaRegionOnly)}
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
                      value={(formData.logoUrl as string) || ''}
                      onChange={(e) => handleInputChange('logoUrl', e.target.value)}
                    />
                    <p className="text-xs text-gray-500 mt-1">Leave blank for a default placeholder</p>
                  </div>

                  <div>
                    <Label htmlFor="fallbackIcon" className="text-sm font-medium text-gray-700">Fallback Icon (optional)</Label>
                    <Input
                      id="fallbackIcon"
                      placeholder="Icon name or URL"
                      value={(formData.fallbackIcon as string) || ''}
                      onChange={(e) => handleInputChange('fallbackIcon', e.target.value)}
                    />
                    <p className="text-xs text-gray-500 mt-1">Used when logo URL fails to load</p>
                  </div>
                </CardContent>
              </Card>

              {/* Personal Notes Section */}
              <Card className="border border-gray-200 shadow-sm">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center text-lg font-semibold text-gray-900">
                      <FileText className="w-5 h-5 mr-2 text-orange-600" />
                      Personal Notes
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                      {sectionStates[SECTIONS.NOTES]?.hasChanges && (
                        <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                          Modified
                        </Badge>
                      )}
                      {sectionStates[SECTIONS.NOTES]?.hasChanges && (
                        <div className="flex space-x-1">
                          <button
                            type="button"
                            onClick={() => revertSection(SECTIONS.NOTES, 'last')}
                            className="p-1 hover:bg-gray-100 rounded"
                            title="Revert Last Change"
                          >
                            <Undo2 className="w-4 h-4 text-gray-600" />
                          </button>
                          <button
                            type="button"
                            onClick={() => revertSection(SECTIONS.NOTES, 'all')}
                            className="p-1 hover:bg-gray-100 rounded"
                            title="Revert All Changes"
                          >
                            <RotateCcw className="w-4 h-4 text-gray-600" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="notes" className="text-sm font-medium text-gray-700">Notes</Label>
                    <Textarea
                      id="notes"
                      placeholder="Additional notes about this subscription..."
                      value={(formData.notes as string) || ''}
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
              onClick={() => router.push('/?view=list')}
              className="px-6"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              disabled={loadingState.isLoading || !hasAnyChanges}
              className="px-6 gradient-bg hover:opacity-90"
            >
              {loadingState.isLoading ? (
                <div className="flex items-center">
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
          </div>
        </form>
      </div>
    </div>
  );
}

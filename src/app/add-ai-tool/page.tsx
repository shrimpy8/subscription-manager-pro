'use client';

import React, { useState } from 'react';
// import { Button } from '@/components/ui/button';
import { PremiumButton } from '@/components/ui/premium-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, FileText, Globe, Shield, Globe2 } from 'lucide-react';
import { AIToolCategory } from '@/types/ai-tools';
import { useToast, ToastContainer } from '@/components/ui/toast';
import { getUserFriendlyMessage } from '@/utils/error-messages';

interface AIToolFormData {
  name: string;
  url: string;
  category: AIToolCategory;
  fallback_icon: string;
  description: string;
  safe_for_work: boolean;
  china_region_only: boolean;
}

const AI_TOOL_CATEGORIES: AIToolCategory[] = [
  "Chat", "Search", "Roleplay", "Image", "Video", "Audio", "Transcribe", 
  "Build", "Write", "Dev", "Utils", "Automation", "Vector DB", "APIs", 
  "Planning", "Design/Prototype", "Speech-to-text", "Productivity", "DB", "Deploy", "Other"
];

export default function AddAIToolPage() {
  const toast = useToast();
  const [formData, setFormData] = useState<AIToolFormData>({
    name: '',
    url: '',
    category: 'Chat',
    fallback_icon: '🤖',
    description: '',
    safe_for_work: true,
    china_region_only: false
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: keyof AIToolFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = (): string[] => {
    const errors: string[] = [];
    
    if (!formData.name.trim()) {
      errors.push('Tool name is required');
    }
    
    if (!formData.url.trim()) {
      errors.push('URL is required');
    } else {
      try {
        new URL(formData.url);
      } catch {
        errors.push('Please enter a valid URL');
      }
    }
    
    if (!formData.category) {
      errors.push('Category is required');
    }
    
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const errors = validateForm();
    if (errors.length > 0) {
      const errorMessage = getUserFriendlyMessage('VALIDATION_ERROR');
      toast.error(errorMessage);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Create new AI tool data
      // const _newAITool = {
      //   id: Date.now(), // Temporary ID
      //   name: formData.name.trim(),
      //   url: formData.url.trim(),
      //   category: formData.category,
      //   fallbackIcon: formData.fallbackIcon || '🤖',
      //   rank: 999, // Will be sorted by date added
      //   originalRank: 999,
      //   isSubscribed: false,
      //   isUsing: false
      // };
      
      // TODO: Add to AI tools list via API
      
      // For now, just show success message
      toast.success('AI Tool added successfully! You can now browse it in the AI Tools section.');
      
      // Reset form
      setFormData({
        name: '',
        url: '',
        category: 'Chat',
        fallback_icon: '🤖',
        description: '',
        safe_for_work: true,
        china_region_only: false,
      });
      
    } catch {
      const errorMessage = getUserFriendlyMessage('SAVE_ERROR');
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-neutral-200 sticky top-0 z-30">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <PremiumButton
                  variant="secondary"
                  size="sm"
                  onClick={() => window.location.href = '/?tab=ai-tools'}
                  className="flex items-center"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Trending AI Tools
                </PremiumButton>
              </div>
              <div className="flex items-center space-x-4">
                <h1 className="text-2xl font-semibold text-neutral-900">Add AI Tool</h1>
                <Badge variant="secondary" className="bg-primary-100 text-primary-800 text-xs">
                  Discovery
                </Badge>
              </div>
            </div>
          </div>
        </header>

        <form onSubmit={handleSubmit} className="px-6 mt-6 pb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Basic Information */}
            <div className="space-y-6">
              <EnhancedCard variant="elevated" className="border border-neutral-200">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center text-lg font-semibold text-neutral-900">
                    <FileText className="w-5 h-5 mr-2 text-primary-600" />
                    Basic Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium text-neutral-900">
                      Tool Name *
                    </Label>
                    <Input
                      id="name"
                      placeholder="e.g. ChatGPT, Claude, Midjourney"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      required
                      className="h-10 border-neutral-300 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="url" className="text-sm font-medium text-neutral-900">
                      Website URL *
                    </Label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-3 w-4 h-4 text-neutral-400" />
                      <Input
                        id="url"
                        placeholder="https://example.com"
                        value={formData.url}
                        onChange={(e) => handleInputChange('url', e.target.value)}
                        className="pl-10 h-10 border-neutral-300 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category" className="text-sm font-medium text-neutral-900">
                      Category *
                    </Label>
                    <Select 
                      value={formData.category} 
                      onValueChange={(value) => handleInputChange('category', value as AIToolCategory)}
                    >
                      <SelectTrigger className="h-10 border-neutral-300 focus:border-primary-500 focus:ring-1 focus:ring-primary-500">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent className="max-h-96">
                        {AI_TOOL_CATEGORIES.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fallback_icon" className="text-sm font-medium text-neutral-900">
                      Fallback Icon
                    </Label>
                    <Input
                      id="fallback_icon"
                      placeholder="🤖"
                      value={formData.fallback_icon}
                      onChange={(e) => handleInputChange('fallback_icon', e.target.value)}
                      className="h-10 border-neutral-300 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                    />
                    <p className="text-xs text-neutral-500 mt-1">
                      Emoji to display if favicon fails to load
                    </p>
                  </div>
                </CardContent>
              </EnhancedCard>
            </div>

            {/* Right Column - Additional Information */}
            <div className="space-y-6">
              <EnhancedCard variant="elevated" className="border border-neutral-200">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center text-lg font-semibold text-neutral-900">
                    <FileText className="w-5 h-5 mr-2 text-primary-600" />
                    Additional Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-sm font-medium text-neutral-900">
                      Description (optional)
                    </Label>
                    <Textarea
                      id="description"
                      placeholder="Brief description of what this AI tool does..."
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      rows={4}
                      className="border-neutral-300 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                    />
                  </div>


                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-neutral-900">Tool Flags</h4>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="safe_for_work"
                          checked={formData.safe_for_work}
                          onChange={(e) => setFormData(prev => ({ ...prev, safe_for_work: e.target.checked }))}
                          className="w-4 h-4 text-green-600 bg-neutral-100 border-neutral-300 rounded focus:ring-green-500 focus:ring-2"
                        />
                        <Label htmlFor="safe_for_work" className="text-sm text-neutral-900 flex items-center">
                          <Shield className="w-4 h-4 mr-2 text-green-600" />
                          Safe for work
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="china_region_only"
                          checked={formData.china_region_only}
                          onChange={(e) => setFormData(prev => ({ ...prev, china_region_only: e.target.checked }))}
                          className="w-4 h-4 text-red-600 bg-neutral-100 border-neutral-300 rounded focus:ring-red-500 focus:ring-2"
                        />
                        <Label htmlFor="china_region_only" className="text-sm text-neutral-900 flex items-center">
                          <Globe2 className="w-4 h-4 mr-2 text-red-600" />
                          China region only
                        </Label>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50/50 border border-blue-200/50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-blue-900 mb-2">
                      What happens next?
                    </h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• This tool will be added to the AI Tools browser</li>
                      <li>• You can browse and discover it alongside other tools</li>
                      <li>• When you&apos;re ready to subscribe, use &quot;Add Subscription&quot;</li>
                      <li>• Subscribing will automatically link it to your subscriptions</li>
                    </ul>
                  </div>
                </CardContent>
              </EnhancedCard>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-neutral-200">
            <PremiumButton 
              type="button" 
              variant="secondary"
              onClick={() => {
                console.log('Navigating to Trending AI Tools...');
                window.location.href = '/?tab=ai-tools';
              }}
            >
              Cancel
            </PremiumButton>
            <PremiumButton 
              type="submit" 
              variant="gradient"
              disabled={isSubmitting}
              loading={isSubmitting}
            >
              {isSubmitting ? 'Adding...' : 'Add AI Tool'}
            </PremiumButton>
          </div>
        </form>
      </div>
      
      {/* Toast Notifications */}
      <ToastContainer />
    </div>
  );
}

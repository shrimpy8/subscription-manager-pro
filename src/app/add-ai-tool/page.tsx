'use client';

import React, { useState } from 'react';
// import { Button } from '@/components/ui/button';
import { PremiumButton } from '@/components/ui/premium-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, FileText, Globe } from 'lucide-react';
import { AIToolCategory, AI_TOOL_CATEGORY_LABEL, AI_TOOL_CATEGORY_COLORS } from '@/types/ai-tools';
import { useToast, ToastContainer } from '@/components/ui/toast';
import { getUserFriendlyMessage } from '@/utils/error-messages';

interface AIToolFormData {
  name: string;
  url: string;
  category: AIToolCategory;
  fallbackIcon: string;
  description: string;
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
    fallbackIcon: '🤖',
    description: ''
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
        fallbackIcon: '🤖',
        description: ''
      });
      
    } catch {
      const errorMessage = getUserFriendlyMessage('SAVE_ERROR');
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
  <div className="min-h-screen bg-gradient-to-br from-neutral-100 to-neutral-200">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="glass-card border-b border-orange-200/50 sticky top-0 z-30">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <ArrowLeft className="w-5 h-5 mr-2 text-gray-600" />
                  <button 
                    onClick={() => window.location.href = '/?tab=ai-tools'}
                    className="text-gray-600 hover:text-gray-800 cursor-pointer"
                  >
                    Back to Trending AI Tools
                  </button>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <h2 className="section-title">Add AI Tool</h2>
                <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                  Discovery
                </Badge>
              </div>
            </div>
          </div>
        </header>

        <form onSubmit={handleSubmit} className="px-4 sm:px-6 lg:px-8 mt-4 pb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Basic Information */}
            <div className="space-y-6">
              <Card className="border border-gray-200 shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center text-lg font-semibold text-gray-900">
                    <FileText className="w-5 h-5 mr-2 text-orange-600" />
                    Basic Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                      Tool Name *
                    </Label>
                    <Input
                      id="name"
                      placeholder="e.g. ChatGPT, Claude, Midjourney"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="url" className="text-sm font-medium text-gray-700">
                      Website URL *
                    </Label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <Input
                        id="url"
                        placeholder="https://example.com"
                        value={formData.url}
                        onChange={(e) => handleInputChange('url', e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="category" className="text-sm font-medium text-gray-700">
                      Category *
                    </Label>
                    <Select 
                      value={formData.category} 
                      onValueChange={(value) => handleInputChange('category', value as AIToolCategory)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent className="max-h-96">
                        {AI_TOOL_CATEGORIES.map((category) => (
                          <SelectItem key={category} value={category}>
                            <div className="flex items-center">
                              <span className={`inline-block w-3 h-3 rounded-full mr-3 ${AI_TOOL_CATEGORY_COLORS[category].split(' ')[0]}`}></span>
                              {AI_TOOL_CATEGORY_LABEL[category]}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="fallbackIcon" className="text-sm font-medium text-gray-700">
                      Fallback Icon
                    </Label>
                    <Input
                      id="fallbackIcon"
                      placeholder="🤖"
                      value={formData.fallbackIcon}
                      onChange={(e) => handleInputChange('fallbackIcon', e.target.value)}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Emoji to display if favicon fails to load
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Additional Information */}
            <div className="space-y-6">
              <Card className="border border-gray-200 shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center text-lg font-semibold text-gray-900">
                    <FileText className="w-5 h-5 mr-2 text-orange-600" />
                    Additional Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                      Description (optional)
                    </Label>
                    <Textarea
                      id="description"
                      placeholder="Brief description of what this AI tool does..."
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      rows={4}
                    />
                  </div>

                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-orange-900 mb-2">
                      What happens next?
                    </h4>
                    <ul className="text-sm text-orange-800 space-y-1">
                      <li>• This tool will be added to the AI Tools browser</li>
                      <li>• You can browse and discover it alongside other tools</li>
                      <li>• When you&apos;re ready to subscribe, use &quot;Add Subscription&quot;</li>
                      <li>• Subscribing will automatically link it to your subscriptions</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
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

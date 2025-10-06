"use client";

import { useState } from 'react';
import { Filter, X, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PremiumButton } from '@/components/ui/premium-button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SubscriptionFilters, SubscriptionCategory } from '@/types/subscription';

interface AdvancedFiltersProps {
  filters: SubscriptionFilters;
  onFiltersChange: (filters: Partial<SubscriptionFilters>) => void;
  onClearFilters: () => void;
}

const CATEGORIES: SubscriptionCategory[] = [
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

const BILLING_CYCLES = ['Monthly', 'Yearly', 'Weekly', 'Quarterly', 'Free'];
const PRIORITIES = ['high', 'medium', 'low'];
const USAGE_FREQUENCIES = ['daily', 'weekly', 'monthly', 'rarely'];

export function AdvancedFilters({ filters, onFiltersChange, onClearFilters }: AdvancedFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const activeFiltersCount = [
    filters.category !== 'all',
    filters.subcategory !== 'all',
    filters.status !== 'all',
    filters.billingCycle !== 'all',
    filters.priority !== 'all',
    filters.usageFrequency !== 'all',
    filters.showExpiringSoon,
    filters.showUnused,
    filters.tags.length > 0
  ].filter(Boolean).length;

  const handleFilterChange = (key: keyof SubscriptionFilters, value: string | string[] | number | boolean | { min: number; max: number }) => {
    onFiltersChange({ [key]: value });
  };

  const removeFilter = (key: keyof SubscriptionFilters) => {
    const defaultValues: Partial<SubscriptionFilters> = {
      category: 'all',
      subcategory: 'all',
      status: 'all',
      billingCycle: 'all',
      priority: 'all',
      usageFrequency: 'all',
      showExpiringSoon: false,
      showUnused: false,
      tags: []
    };
    onFiltersChange({ [key]: defaultValues[key] });
  };

  return (
    <Card className="subscription-card">
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Filter Toggle Button */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center space-x-2"
            >
              <Filter className="w-4 h-4" />
              <span>Advanced Filters</span>
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-2 bg-orange-100 text-orange-800">
                  {activeFiltersCount}
                </Badge>
              )}
              <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
            </Button>
            
            {activeFiltersCount > 0 && (
              <PremiumButton variant="ghost" size="sm" onClick={onClearFilters}>
                Clear All
              </PremiumButton>
            )}
          </div>

          {/* Active Filters */}
          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap gap-2">
              {filters.category !== 'all' && (
                <Badge className="filter-chip-active">
                  {filters.category === 'AI Tools' && filters.subcategory !== 'all' 
                    ? `AI Tools: ${filters.subcategory}` 
                    : `Category: ${filters.category}`}
                  <button
                    onClick={() => {
                      removeFilter('category');
                      removeFilter('subcategory');
                    }}
                    className="ml-2 hover:bg-orange-700 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
              
              {filters.status !== 'all' && (
                <Badge className="filter-chip-active">
                  Status: {filters.status}
                  <button
                    onClick={() => removeFilter('status')}
                    className="ml-2 hover:bg-orange-700 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
              
              {filters.priority !== 'all' && (
                <Badge className="filter-chip-active">
                  Priority: {filters.priority}
                  <button
                    onClick={() => removeFilter('priority')}
                    className="ml-2 hover:bg-orange-700 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
              
              {filters.usageFrequency !== 'all' && (
                <Badge className="filter-chip-active">
                  Usage: {filters.usageFrequency}
                  <button
                    onClick={() => removeFilter('usageFrequency')}
                    className="ml-2 hover:bg-orange-700 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
              
              {filters.showExpiringSoon && (
                <Badge className="filter-chip-active">
                  Expiring Soon
                  <button
                    onClick={() => removeFilter('showExpiringSoon')}
                    className="ml-2 hover:bg-orange-700 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
              
              {filters.showUnused && (
                <Badge className="filter-chip-active">
                  Unused
                  <button
                    onClick={() => removeFilter('showUnused')}
                    className="ml-2 hover:bg-orange-700 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
            </div>
          )}

          {/* Expanded Filters */}
          {isExpanded && (
            <div className="space-y-6 pt-4 border-t border-gray-200">
              {/* First Row - Dropdown Filters */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Category Filter with AI Tool Subcategories */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Category</label>
                  <Select
                    value={filters.category === 'AI Tools' && filters.subcategory !== 'all' ? `ai-tools-${filters.subcategory}` : filters.category}
                    onValueChange={(value) => {
                      if (value.startsWith('ai-tools-')) {
                        // AI Tool subcategory selected
                        const subcategory = value.replace('ai-tools-', '');
                        handleFilterChange('category', 'AI Tools');
                        handleFilterChange('subcategory', subcategory);
                      } else {
                        // Regular category selected
                        handleFilterChange('category', value);
                        handleFilterChange('subcategory', 'all');
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Categories">
                        {filters.category === 'AI Tools' && filters.subcategory !== 'all' 
                          ? `AI Tools: ${filters.subcategory}`
                          : filters.category === 'all' 
                            ? 'All Categories'
                            : filters.category}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="max-h-96">
                      <SelectItem value="all">All Categories</SelectItem>
                      {CATEGORIES.map((category) => {
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

                {/* Status Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Status</label>
                  <Select
                    value={filters.status}
                    onValueChange={(value) => handleFilterChange('status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="paused">Paused</SelectItem>
                      <SelectItem value="canceled">Canceled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Priority Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Priority</label>
                  <Select
                    value={filters.priority}
                    onValueChange={(value) => handleFilterChange('priority', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Priorities" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priorities</SelectItem>
                      {PRIORITIES.map((priority) => (
                        <SelectItem key={priority} value={priority}>
                          {priority.charAt(0).toUpperCase() + priority.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Usage Frequency Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Usage Frequency</label>
                  <Select
                    value={filters.usageFrequency}
                    onValueChange={(value) => handleFilterChange('usageFrequency', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Frequencies" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Frequencies</SelectItem>
                      {USAGE_FREQUENCIES.map((frequency) => (
                        <SelectItem key={frequency} value={frequency}>
                          {frequency.charAt(0).toUpperCase() + frequency.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Second Row - Cost Range and Special Filters */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Cost Range Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Cost Range ($)</label>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.costRange.min}
                      onChange={(e) => handleFilterChange('costRange', {
                        ...filters.costRange,
                        min: Number(e.target.value) || 0
                      })}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                    <span className="flex items-center text-gray-500">to</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.costRange.max}
                      onChange={(e) => handleFilterChange('costRange', {
                        ...filters.costRange,
                        max: Number(e.target.value) || 1000
                      })}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                </div>

                {/* Special Filters */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Special Filters</label>
                  <div className="space-y-3">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.showExpiringSoon}
                        onChange={(e) => handleFilterChange('showExpiringSoon', e.target.checked)}
                        className="rounded border-gray-300 text-orange-600 focus:ring-orange-500 focus:ring-2"
                      />
                      <span className="text-sm text-gray-700">Expiring Soon (≤7 days)</span>
                    </label>
                    
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.showUnused}
                        onChange={(e) => handleFilterChange('showUnused', e.target.checked)}
                        className="rounded border-gray-300 text-orange-600 focus:ring-orange-500 focus:ring-2"
                      />
                      <span className="text-sm text-gray-700">Unused (rarely used)</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

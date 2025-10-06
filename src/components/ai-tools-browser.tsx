"use client";

import React, { useState, useEffect, memo } from 'react';
import { Search, ExternalLink, Plus, Check, Filter, X, Eye, EyeOff, MessageSquare, Search as SearchIcon, Users, Image as ImageIcon, Video, Music, FileText, Wrench, Code, Settings, Sparkles, Zap, Database, Globe, Calendar, Palette, Mic, TrendingUp, Server, Rocket } from 'lucide-react';
// import { Card, CardContent } from '@/components/ui/card';
import { PremiumButton } from '@/components/ui/premium-button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import Image from 'next/image';
// import { EnhancedInput } from '@/components/ui/enhanced-input';
import { AITool, AIToolFilters } from '@/types/ai-tools';
import { aiTools, getAIToolsByCategory, searchAITools } from '@/lib/ai-tools-data';
import { AI_TOOL_CATEGORY_ORDER, AI_TOOL_CATEGORY_LABEL, AI_TOOL_CATEGORY_COLORS } from '@/types/ai-tools';
import { ErrorBoundary } from '@/components/error-boundary';
import { LoadingInline } from '@/components/ui/loading-spinner';

// Category icon mapping
const CATEGORY_ICONS = {
  'Chat': MessageSquare,
  'Search': SearchIcon,
  'Roleplay': Users,
  'Image': ImageIcon,
  'Video': Video,
  'Audio': Music,
  'Transcribe': FileText,
  'Build': Wrench,
  'Write': FileText,
  'Dev': Code,
  'Utils': Settings,
  'Automation': Zap,
  'Vector DB': Database,
  'APIs': Globe,
  'Planning': Calendar,
  'Design/Prototype': Palette,
  'Speech-to-text': Mic,
  'Productivity': TrendingUp,
  'DB': Server,
  'Deploy': Rocket,
  'Other': Sparkles
} as const;

interface AIToolsBrowserProps {
  onAddToSubscriptions?: (tool: AITool) => void;
  onMarkAsUsing?: (tool: AITool) => void;
  selectedTools?: Set<number>;
  onToolSelectionChange?: (selectedTools: Set<number>) => void;
}

const AIToolsBrowser = memo(function AIToolsBrowser({
  onAddToSubscriptions,
  onMarkAsUsing,
  selectedTools = new Set(),
  onToolSelectionChange
}: AIToolsBrowserProps) {
  const [filters, setFilters] = useState<AIToolFilters>({
    category: 'all',
    searchTerm: '',
    showSubscribedOnly: false,
    showUsingOnly: false,
    showUntrackedOnly: false,
    a16zRank: 'all'
  });
  const [mounted, setMounted] = useState(false);
  const [showCNRegion, setShowCNRegion] = useState(false);
  const [showRoleplay, setShowRoleplay] = useState(false);
  const [trackedTools, setTrackedTools] = useState<Set<number>>(new Set());
  const [usingTools, setUsingTools] = useState<Set<number>>(new Set());

  useEffect(() => {
    setMounted(true);
  }, []);

  // Filter tools based on current filters
  const filteredTools = React.useMemo(() => {
    let tools = aiTools;

    // Apply CN/Region filter (hide by default)
    if (!showCNRegion) {
      tools = tools.filter(tool => !tool.flags?.includes('cn-region'));
    }

    // Apply Roleplay filter (hide by default)
    if (!showRoleplay) {
      tools = tools.filter(tool => tool.category !== 'Roleplay');
    }

    // Apply category filter
    if (filters.category !== 'all') {
      tools = getAIToolsByCategory(filters.category);
    }

    // Apply search filter
    if (filters.searchTerm) {
      tools = searchAITools(filters.searchTerm);
    }

    // Apply a16z ranking filter
    if (filters.a16zRank === 'a16z-ranked') {
      tools = tools.filter(tool => tool.originalRank <= 50);
    } else if (filters.a16zRank === 'user-choice') {
      tools = tools.filter(tool => tool.originalRank > 50);
    }

    // Apply additional filters
    if (filters.showSubscribedOnly) {
      tools = tools.filter(tool => trackedTools.has(tool.id));
    }
    if (filters.showUsingOnly) {
      tools = tools.filter(tool => usingTools.has(tool.id));
    }
    if (filters.showUntrackedOnly) {
      tools = tools.filter(tool => !trackedTools.has(tool.id) && !usingTools.has(tool.id));
    }

    return tools;
  }, [filters, showCNRegion, showRoleplay, trackedTools, usingTools]);

  // Group tools by category
  const groupedTools = React.useMemo(() => {
    const groups: Record<string, AITool[]> = {};
    
    filteredTools.forEach(tool => {
      if (!groups[tool.category]) {
        groups[tool.category] = [];
      }
      groups[tool.category].push(tool);
    });

    // Sort tools within each category by their a16z ranking (id)
    Object.keys(groups).forEach(category => {
      groups[category].sort((a, b) => a.id - b.id);
    });

    return groups;
  }, [filteredTools]);

  const handleToolToggle = (tool: AITool) => {
    const newSelected = new Set(selectedTools);
    if (newSelected.has(tool.id)) {
      newSelected.delete(tool.id);
    } else {
      newSelected.add(tool.id);
    }
    onToolSelectionChange?.(newSelected);
  };

  const handleAddToSubscriptions = (tool: AITool, e: React.MouseEvent) => {
    e.stopPropagation();
    const newTrackedTools = new Set(trackedTools);
    if (newTrackedTools.has(tool.id)) {
      newTrackedTools.delete(tool.id);
    } else {
      newTrackedTools.add(tool.id);
    }
    setTrackedTools(newTrackedTools);
    onAddToSubscriptions?.(tool);
  };

  const handleMarkAsUsing = (tool: AITool, e: React.MouseEvent) => {
    e.stopPropagation();
    const newUsingTools = new Set(usingTools);
    if (newUsingTools.has(tool.id)) {
      newUsingTools.delete(tool.id);
    } else {
      newUsingTools.add(tool.id);
    }
    setUsingTools(newUsingTools);
    onMarkAsUsing?.(tool);
  };


  const clearFilters = () => {
    setFilters({
      category: 'all',
      searchTerm: '',
      showSubscribedOnly: false,
      showUsingOnly: false,
      showUntrackedOnly: false,
      a16zRank: 'all'
    });
  };

  const activeFiltersCount = [
    filters.category !== 'all',
    filters.searchTerm,
    filters.showSubscribedOnly,
    filters.showUsingOnly,
    filters.a16zRank !== 'all',
    !showCNRegion,
    !showRoleplay
  ].filter(Boolean).length;

  if (!mounted) {
    return (
      <LoadingInline message="Loading AI tools..." variant="primary" />
    );
  }

  return (
    <ErrorBoundary>
      <div className="max-w-7xl mx-auto">
      {/* Header moved to shared PageHeader in the parent page */}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-8">
        <EnhancedCard variant="glass" className="text-center">
          <div className="p-4">
            <div className="text-2xl font-bold text-primary-600">{filteredTools.length}</div>
            <div className="text-sm text-neutral-600">Visible Tools</div>
          </div>
        </EnhancedCard>
        <EnhancedCard variant="glass" className="text-center">
          <div className="p-4">
            <div className="text-2xl font-bold text-primary-600">{aiTools.filter(tool => tool.originalRank <= 50).length}</div>
            <div className="text-sm text-neutral-600">a16z Ranked</div>
            <div className="text-xs text-neutral-500 mt-1">🏆 Top 50</div>
          </div>
        </EnhancedCard>
        <EnhancedCard variant="glass" className="text-center">
          <div className="p-4">
            <div className="text-2xl font-bold text-primary-600">{aiTools.filter(tool => tool.originalRank > 50).length}</div>
            <div className="text-sm text-neutral-600">User Choice</div>
            <div className="text-xs text-neutral-500 mt-1">⭐ Additional</div>
          </div>
        </EnhancedCard>
        <EnhancedCard variant="glass" className="text-center">
          <div className="p-4">
            <div className="text-2xl font-bold text-primary-600">{selectedTools.size}</div>
            <div className="text-sm text-neutral-600">Selected</div>
          </div>
        </EnhancedCard>
        <EnhancedCard variant="glass" className="text-center">
          <div className="p-4">
            <div className="text-2xl font-bold text-primary-600">{trackedTools.size}</div>
            <div className="text-sm text-neutral-600">Subscribed</div>
          </div>
        </EnhancedCard>
        <EnhancedCard variant="glass" className="text-center">
          <div className="p-4">
            <div className="text-2xl font-bold text-primary-600">{usingTools.size}</div>
            <div className="text-sm text-neutral-600">Using</div>
          </div>
        </EnhancedCard>
      </div>

      {/* Filters */}
      <EnhancedCard variant="glass" className="card-spacing">
        <div className="p-6">
          <div className="flex items-center justify-between element-spacing">
            <h3 className="text-h3 text-neutral-900 flex items-center">
              <Filter className="w-4 h-4 mr-2 text-primary-600" />
              Filters
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-2 bg-primary-100 text-primary-800 text-xs">
                  {activeFiltersCount}
                </Badge>
              )}
            </h3>
            {activeFiltersCount > 0 && (
              <PremiumButton variant="secondary" size="sm" onClick={clearFilters} className="h-7 px-2 text-xs">
                <X className="w-3 h-3 mr-1" />
                Clear
              </PremiumButton>
            )}
          </div>

          <div className="space-y-4">
            {/* Three Main Filter Panels */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Ranking Panel */}
              <div className="form-section">
                <h4 className="form-section-title">Ranking</h4>
                <div className="flex flex-wrap gap-1.5">
                  <PremiumButton
                    variant={filters.a16zRank === 'all' ? "primary" : "secondary"}
                    size="sm"
                    onClick={() => setFilters(prev => ({ ...prev, a16zRank: 'all' }))}
                    className="h-7 px-2 text-xs"
                  >
                    <Sparkles className="w-3 h-3 mr-1" />
                    All
                  </PremiumButton>
                  <PremiumButton
                    variant={filters.a16zRank === 'a16z-ranked' ? "primary" : "secondary"}
                    size="sm"
                    onClick={() => setFilters(prev => ({ ...prev, a16zRank: 'a16z-ranked' }))}
                    className="h-7 px-2 text-xs"
                  >
                    <span className="w-3 h-3 mr-1">🏆</span>
                    a16z Rank
                  </PremiumButton>
                  <PremiumButton
                    variant={filters.a16zRank === 'user-choice' ? "primary" : "secondary"}
                    size="sm"
                    onClick={() => setFilters(prev => ({ ...prev, a16zRank: 'user-choice' }))}
                    className="h-7 px-2 text-xs"
                  >
                    <span className="w-3 h-3 mr-1">⭐</span>
                    User Choice
                  </PremiumButton>
                </div>
              </div>

              {/* Tracking Panel */}
              <div className="form-section">
                <h4 className="form-section-title">Tracking</h4>
                <div className="flex flex-wrap gap-1.5">
                  <PremiumButton
                    variant={filters.showSubscribedOnly ? "primary" : "secondary"}
                    size="sm"
                    onClick={() => setFilters(prev => ({ ...prev, showSubscribedOnly: !prev.showSubscribedOnly }))}
                    className="h-7 px-2 text-xs"
                  >
                    Subscribed
                  </PremiumButton>
                  <PremiumButton
                    variant={filters.showUsingOnly ? "primary" : "secondary"}
                    size="sm"
                    onClick={() => setFilters(prev => ({ ...prev, showUsingOnly: !prev.showUsingOnly }))}
                    className="h-7 px-2 text-xs"
                  >
                    Using
                  </PremiumButton>
                </div>
              </div>

              {/* Visibility Panel */}
              <div className="form-section">
                <h4 className="form-section-title">Visibility</h4>
                <div className="flex flex-wrap gap-1.5">
                  <PremiumButton
                    variant={showCNRegion ? "primary" : "secondary"}
                    size="sm"
                    onClick={() => setShowCNRegion(!showCNRegion)}
                    className="h-7 px-2 text-xs"
                  >
                    {showCNRegion ? <Eye className="w-3 h-3 mr-1" /> : <EyeOff className="w-3 h-3 mr-1" />}
                    CN Region
                  </PremiumButton>
                  <PremiumButton
                    variant={showRoleplay ? "primary" : "secondary"}
                    size="sm"
                    onClick={() => setShowRoleplay(!showRoleplay)}
                    className="h-7 px-2 text-xs"
                  >
                    {showRoleplay ? <Eye className="w-3 h-3 mr-1" /> : <EyeOff className="w-3 h-3 mr-1" />}
                    Roleplay
                  </PremiumButton>
                </div>
              </div>
            </div>

            {/* Category Filters - Alphabetically sorted with counts */}
            <div className="form-section">
              <h4 className="form-section-title">Categories</h4>
              <div className="flex flex-wrap gap-1.5">
                <PremiumButton
                  variant={filters.category === 'all' ? "orange-gradient" : "secondary"}
                  size="sm"
                  onClick={() => setFilters(prev => ({ ...prev, category: 'all' }))}
                  className={`${filters.category === 'all' ? "gradient-bg" : ""} h-7 px-2 text-xs`}
                >
                  <Sparkles className="w-3 h-3 mr-1" />
                  All
                </PremiumButton>
                {AI_TOOL_CATEGORY_ORDER.sort().map((category) => {
                  const Icon = CATEGORY_ICONS[category];
                  const count = aiTools.filter(tool => tool.category === category).length;
                  return (
                    <PremiumButton
                      key={category}
                      variant={filters.category === category ? "orange-gradient" : "secondary"}
                      size="sm"
                      onClick={() => setFilters(prev => ({ ...prev, category }))}
                      className={`${filters.category === category ? "gradient-bg" : ""} h-7 px-2 text-xs`}
                      title={`${AI_TOOL_CATEGORY_LABEL[category]} (${count} tools)`}
                    >
                      <Icon className="w-3 h-3 mr-1" />
                      {AI_TOOL_CATEGORY_LABEL[category]} ({count})
                    </PremiumButton>
                  );
                })}
              </div>
            </div>

            {/* Search Field - Moved to bottom */}
            <div className="form-section">
              <h4 className="form-section-title">Search</h4>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search tools..."
                  value={filters.searchTerm}
                  onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </div>
      </EnhancedCard>

      {/* Category Groups */}
      {Object.keys(groupedTools).length > 0 ? (
        <div className="space-y-8">
          {AI_TOOL_CATEGORY_ORDER.filter(category => groupedTools[category]).map(category => {
            const categoryTools = groupedTools[category];
            return (
              <div key={category}>
                {/* Category Header - consistent neutral style */}
                <div className="flex items-center mb-3">
                  <div className="w-2 h-2 rounded-full bg-orange-400 mr-2" />
                  <h3 className="text-sm font-semibold text-neutral-900 mr-2">
                    {AI_TOOL_CATEGORY_LABEL[category]}
                  </h3>
                  <span className="text-xs text-neutral-500">
                    {categoryTools.length} tool{categoryTools.length !== 1 ? 's' : ''}
                  </span>
                </div>

                {/* Tools Grid for this category */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4">
                  {categoryTools.map((tool) => {
                    const isSelected = selectedTools.has(tool.id);
                    const isSubscribed = tool.isSubscribed;
                    const isUsing = tool.isUsing;
                    const isTracked = trackedTools.has(tool.id);
                    const isCurrentlyUsing = usingTools.has(tool.id);

                    return (
                      <div
                        key={tool.id}
                        className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 ${
                          isSelected ? 'ring-2 ring-orange-500 shadow-lg' : ''
                        } ${isSubscribed ? 'border-orange-300' : ''}`}
                        onClick={() => handleToolToggle(tool)}
                      >
                        <EnhancedCard
                          variant="glass"
                        >
                        <div className="p-3">
          {/* a16z Ranking Badge */}
          <div className="absolute top-2 left-2">
            <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-300 text-xs font-bold">
              #{tool.originalRank}
            </Badge>
          </div>

          {/* CN Region Badge */}
          {tool.flags?.includes('cn-region') && (
            <div className="absolute top-2 left-16">
              <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300 text-xs font-bold">
                CN Region
              </Badge>
            </div>
          )}

          {/* NSFW Badge for Roleplay tools */}
          {tool.category === 'Roleplay' && (
            <div className={`absolute top-2 ${tool.flags?.includes('cn-region') ? 'left-32' : 'left-16'}`}>
              <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-300 text-xs font-bold">
                NSFW
              </Badge>
            </div>
          )}

                          {/* Checkbox removed per design cleanup */}

                          {/* Line 1: Icon + Tool Name */}
                          <div className="flex items-center space-x-2 mb-1 mt-4">
                            <div className="relative w-10 h-10 flex items-center justify-center flex-shrink-0">
                              <Image
                                src={`https://www.google.com/s2/favicons?domain=${new URL(tool.url).hostname}&sz=64`}
                                alt={`${tool.name} favicon`}
                                width={32}
                                height={32}
                                className="w-8 h-8 rounded-sm"
                                unoptimized
                                onError={(e) => {
                                  // Fallback to emoji icon if favicon fails to load
                                  const img = e.currentTarget as HTMLImageElement;
                                  img.style.display = 'none';
                                  const fallback = img.nextElementSibling as HTMLElement;
                                  if (fallback) {
                                    fallback.style.display = 'block';
                                  }
                                }}
                              />
                              <span className="text-lg hidden">
                                {tool.fallbackIcon}
                              </span>
                            </div>
                            <h3 className="font-semibold text-gray-900 text-base line-clamp-1 flex-1">
                              {tool.name}
                            </h3>
                          </div>

                          {/* Line 2: Action Buttons + Visit Link */}
                          <div className="mt-3 pt-3 border-t border-neutral-200 flex items-center justify-between gap-1">
                            {/* Show Track/Using buttons only for non-CN/Region and non-Roleplay tools */}
                            {!tool.flags?.includes('cn-region') && tool.category !== 'Roleplay' ? (
                              <>
                                <PremiumButton
                                  variant={isTracked ? "orange-gradient" : "secondary"}
                                  size="sm"
                                  className={`flex-1 text-sm h-7 px-3 ${isTracked ? "gradient-bg" : ""}`}
                                  onClick={(e) => handleAddToSubscriptions(tool, e)}
                                >
                                  {isTracked ? <Check className="w-3 h-3 mr-1" /> : <Plus className="w-3 h-3 mr-1" />}
                                  Subscribe
                                </PremiumButton>
                                <PremiumButton
                                  variant={isCurrentlyUsing ? "orange-gradient" : "secondary"}
                                  size="sm"
                                  className={`flex-1 text-sm h-7 px-3 ${isCurrentlyUsing ? "gradient-bg" : ""}`}
                                  onClick={(e) => handleMarkAsUsing(tool, e)}
                                >
                                  {isCurrentlyUsing ? <Check className="w-3 h-3 mr-1" /> : <Plus className="w-3 h-3 mr-1" />}
                                  Using
                                </PremiumButton>
                              </>
                            ) : (
                              <div className="flex-1" />
                            )}
                            <PremiumButton
                              variant="ghost"
                              size="sm"
                              className="text-xs h-6 px-2"
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(tool.url, '_blank', 'noopener,noreferrer');
                              }}
                            >
                              <ExternalLink className="w-3 h-3" />
                            </PremiumButton>
                          </div>
                        </div>
                        </EnhancedCard>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <EnhancedCard variant="glass" className="text-center">
          <div className="p-8">
            <div className="text-gray-500 mb-4">
              <Search className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No tools found</h3>
              <p>Try adjusting your filters or search terms.</p>
            </div>
            <PremiumButton variant="secondary" onClick={clearFilters}>
              Clear Filters
            </PremiumButton>
          </div>
        </EnhancedCard>
      )}

      {/* Footer */}
      <div className="text-center mt-8 text-gray-500 text-sm">
        <p>Click on tools to select them. Use the filters to view a16z ranked tools, user choice tools, or all tools.</p>
        <p className="mt-2 text-xs">
          Tools are organized by a16z ranking and category for easy discovery. Use the a16z Rank filter to focus on the top 50 tools.
        </p>
        <p className="mt-1 text-xs">
          <span className="bg-red-100 text-red-800 px-1 rounded text-xs">CN Region</span> tools are China-specific. 
          <span className="bg-purple-100 text-purple-800 px-1 rounded text-xs ml-2">NSFW</span> indicates adult content.
        </p>
      </div>
    </div>
    </ErrorBoundary>
  );
});

export default AIToolsBrowser;
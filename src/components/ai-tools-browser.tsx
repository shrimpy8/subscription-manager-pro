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
// import { aiTools, getAIToolsByCategory, searchAITools } from '@/lib/ai-tools-data';
import { ErrorBoundary } from '@/components/error-boundary';
import { LoadingInline } from '@/components/ui/loading-spinner';
import { sanitizeInput, sanitizeURL } from '@/lib/xss';
import { useSupabaseSubscriptions } from '@/hooks/use-supabase-subscriptions';

// Category icon mapping removed to avoid hardcoding; using plain labels from DB

interface AIToolsBrowserProps {
  aiTools: AITool[];
  loading?: boolean;
  error?: string | null;
  onAddToSubscriptions?: (tool: AITool) => void;
  onMarkAsUsing?: (tool: AITool) => void;
  selectedTools?: Set<number>;
  onToolSelectionChange?: (selectedTools: Set<number>) => void;
}

const AIToolsBrowser = memo(function AIToolsBrowser({
  aiTools,
  loading = false,
  error = null,
  onAddToSubscriptions,
  onMarkAsUsing,
  selectedTools = new Set(),
  onToolSelectionChange
}: AIToolsBrowserProps) {
  const { subscriptions } = useSupabaseSubscriptions();
  
  const [filters, setFilters] = useState<AIToolFilters>({
    subcategory: 'all',
    searchTerm: '',
    showSubscribedOnly: false,
    showUsingOnly: false,
    showUntrackedOnly: false,
    a16zRank: 'all'
  });
  const [mounted, setMounted] = useState(false);
  const [showCNRegion, setShowCNRegion] = useState(false);
  // Removed Roleplay toggle per requirement
  const [showNSFW, setShowNSFW] = useState(false);
  const [trackedTools, setTrackedTools] = useState<Set<number>>(new Set());
  const [usingTools, setUsingTools] = useState<Set<number>>(new Set());

  useEffect(() => {
    setMounted(true);
  }, []);

  // Initialize toggle states from DB-derived flags
  useEffect(() => {
    const tracked = new Set<number>();
    const using = new Set<number>();
    aiTools.forEach(tool => {
      if (tool.isSubscribed) tracked.add(tool.id);
      if (tool.isUsing) using.add(tool.id);
    });
    setTrackedTools(tracked);
    setUsingTools(using);
  }, [aiTools]);

  // Debug logging
  console.log('🔍 AIToolsBrowser - aiTools:', aiTools.length, 'loading:', loading, 'error:', error);
  console.log('🔍 AIToolsBrowser - First tool:', aiTools[0]);

  // Filter tools based on current filters
  const filteredTools = React.useMemo(() => {
    let tools = aiTools;

    // Apply CN/Region filter (hide by default)
    if (!showCNRegion) {
      tools = tools.filter(tool => !tool.flags?.includes('cn-region'));
    }

    // Roleplay toggle removed

    // Apply NSFW filter (hide by default)
    if (!showNSFW) {
      tools = tools.filter(tool => !tool.flags?.includes('nsfw'));
    }

    // Apply subcategory filter (map AI tools to subscription subcategories)
    if (filters.subcategory !== 'all') {
      tools = tools.filter(tool => {
        // Find matching subscription by name
        const matchingSubscription = subscriptions.find(sub => 
          sub.name.toLowerCase() === tool.name.toLowerCase()
        );
        return matchingSubscription?.subcategory === filters.subcategory;
      });
    }

    // Apply search filter
    if (filters.searchTerm) {
      const searchTerm = filters.searchTerm.toLowerCase();
      tools = tools.filter(tool => 
        tool.name.toLowerCase().includes(searchTerm) ||
        tool.category.toLowerCase().includes(searchTerm)
      );
    }

    // Apply ranking filters
    if (filters.a16zRank === 'a16z-ranked') {
      tools = tools.filter(tool => tool.originalRank && tool.originalRank <= 50);
    } else if (filters.a16zRank === 'user-choice') {
      tools = tools.filter(tool => tool.isUsing);
    } else if (filters.a16zRank === 'no-rank') {
      tools = tools.filter(tool => tool.flags?.includes('no-rank'));
    }

    // Apply tracking filters mapped to DB-derived booleans
    if (filters.showSubscribedOnly) {
      // Subscribed => no_subscription === false mapped to isSubscribed
      tools = tools.filter(tool => tool.isSubscribed);
    }
    if (filters.showUsingOnly) {
      // Using => iam_using_it === true mapped to isUsing
      tools = tools.filter(tool => tool.isUsing);
    }
    if (filters.showUntrackedOnly) {
      tools = tools.filter(tool => !trackedTools.has(tool.id) && !usingTools.has(tool.id));
    }

    console.log('🔍 AIToolsBrowser: Filtered tools:', tools.length, 'from', aiTools.length, 'total');
    return tools;
  }, [aiTools, filters, showCNRegion, showNSFW, trackedTools, usingTools]);

  // Group tools by subcategory (from database)
  const groupedTools = React.useMemo(() => {
    const groups: Record<string, AITool[]> = {};
    
    filteredTools.forEach(tool => {
      // Find matching subscription to get subcategory
      const matchingSubscription = subscriptions.find(sub => 
        sub.name.toLowerCase() === tool.name.toLowerCase()
      );
      
      const subcategory = matchingSubscription?.subcategory || 'Uncategorized';
      
      if (!groups[subcategory]) {
        groups[subcategory] = [];
      }
      groups[subcategory].push(tool);
    });

    // Sort tools within each subcategory by their a16z ranking (id)
    Object.keys(groups).forEach(subcategory => {
      groups[subcategory].sort((a, b) => a.id - b.id);
    });

    console.log('🔍 AIToolsBrowser: Grouped tools:', Object.keys(groups).length, 'subcategories');
    return groups;
  }, [filteredTools, subscriptions]);

  // Derive subcategories dynamically from database (no hardcoding)
  const subcategoryOptions = React.useMemo((): string[] => {
    const set = new Set<string>();
    subscriptions.forEach(sub => {
      if (sub.subcategory) {
        set.add(sub.subcategory);
      }
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [subscriptions]);

  const handleToolToggle = (tool: AITool) => {
    const newSelected = new Set(selectedTools);
    if (newSelected.has(tool.id)) {
      newSelected.delete(tool.id);
    } else {
      newSelected.add(tool.id);
    }
    onToolSelectionChange?.(newSelected);
  };

  const handleAddToSubscriptions = async (tool: AITool, e: React.MouseEvent) => {
    e.stopPropagation();
    // Use database state as source of truth
    const willUnsubscribe = tool.isSubscribed;
    try {
      const resp = await fetch(`/api/ai-tools/${encodeURIComponent(tool.subscriptionId || '')}/subscribe`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: willUnsubscribe ? true : false }) // true => no_subscription
      });
      const result = await resp.json();
      if (!result.success) throw new Error(result.error || 'Failed to update');
      const newTracked = new Set(trackedTools);
      if (willUnsubscribe) newTracked.delete(tool.id); else newTracked.add(tool.id);
      setTrackedTools(newTracked);
      onAddToSubscriptions?.(tool);
    } catch (err) {
      console.error('Subscribe toggle update failed:', err);
    }
  };

  const handleMarkAsUsing = async (tool: AITool, e: React.MouseEvent) => {
    e.stopPropagation();
    // Use database state as source of truth
    const willUnsetUsing = tool.isUsing;
    try {
      const resp = await fetch(`/api/ai-tools/${encodeURIComponent(tool.subscriptionId || '')}/using`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: willUnsetUsing ? false : true })
      });
      const result = await resp.json();
      if (!result.success) throw new Error(result.error || 'Failed to update');
      const newUsing = new Set(usingTools);
      if (willUnsetUsing) newUsing.delete(tool.id); else newUsing.add(tool.id);
      setUsingTools(newUsing);
      onMarkAsUsing?.(tool);
    } catch (err) {
      console.error('Using toggle update failed:', err);
    }
  };


  const clearFilters = () => {
    setFilters({
      subcategory: 'all',
      searchTerm: '',
      showSubscribedOnly: false,
      showUsingOnly: false,
      showUntrackedOnly: false,
      a16zRank: 'all'
    });
  };

  const activeFiltersCount = [
    filters.subcategory !== 'all',
    filters.searchTerm,
    filters.showSubscribedOnly,
    filters.showUsingOnly,
    filters.a16zRank !== 'all',
    !showCNRegion,
    !showNSFW
  ].filter(Boolean).length;

  if (!mounted) {
    console.log('🔍 AIToolsBrowser: Not mounted yet');
    return (
      <LoadingInline message="Loading AI tools..." variant="primary" />
    );
  }

  // Handle loading state
  if (loading) {
    console.log('🔍 AIToolsBrowser: Loading state');
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingInline message="Loading AI tools..." />
      </div>
    );
  }

  // Handle error state
  if (error) {
    console.log('🔍 AIToolsBrowser: Error state:', error);
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <p className="text-red-600 mb-4">Failed to load AI tools</p>
          <p className="text-sm text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  console.log('🔍 AIToolsBrowser: Rendering component with', aiTools.length, 'tools');
  
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
            <div className="text-2xl font-bold text-primary-600">{aiTools.filter(tool => !!tool.originalRank && tool.originalRank <= 50).length}</div>
            <div className="text-sm text-neutral-600">a16z Ranked</div>
            <div className="text-xs text-neutral-500 mt-1">🏆 Top 50</div>
          </div>
        </EnhancedCard>
        <EnhancedCard variant="glass" className="text-center">
          <div className="p-4">
            <div className="text-2xl font-bold text-primary-600">{aiTools.filter(tool => tool.flags?.includes('no-rank')).length}</div>
            <div className="text-sm text-neutral-600">No Rank</div>
            <div className="text-xs text-neutral-500 mt-1">🚫 a16z</div>
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
            <div className="text-2xl font-bold text-primary-600">{aiTools.filter(tool => tool.isSubscribed).length}</div>
            <div className="text-sm text-neutral-600">Subscribed</div>
          </div>
        </EnhancedCard>
        <EnhancedCard variant="glass" className="text-center">
          <div className="p-4">
            <div className="text-2xl font-bold text-primary-600">{aiTools.filter(tool => tool.isUsing).length}</div>
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
                  <PremiumButton
                    variant={filters.a16zRank === 'no-rank' ? "primary" : "secondary"}
                    size="sm"
                    onClick={() => setFilters(prev => ({ ...prev, a16zRank: 'no-rank' }))}
                    className="h-7 px-2 text-xs"
                  >
                    <span className="w-3 h-3 mr-1">🚫</span>
                    No Rank
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
                  {/* Roleplay toggle removed per requirement */}
                  <PremiumButton
                    variant={showNSFW ? "primary" : "secondary"}
                    size="sm"
                    onClick={() => setShowNSFW(!showNSFW)}
                    className="h-7 px-2 text-xs"
                  >
                    {showNSFW ? <Eye className="w-3 h-3 mr-1" /> : <EyeOff className="w-3 h-3 mr-1" />}
                    NSFW
                  </PremiumButton>
                </div>
              </div>
            </div>

            {/* Subcategory Filters - Dynamically derived from database */}
            <div className="form-section">
              <h4 className="form-section-title">Subcategories</h4>
              <div className="flex flex-wrap gap-1.5">
                <PremiumButton
                  variant={filters.subcategory === 'all' ? "orange-gradient" : "secondary"}
                  size="sm"
                  onClick={() => setFilters(prev => ({ ...prev, subcategory: 'all' }))}
                  className={`${filters.subcategory === 'all' ? "gradient-bg" : ""} h-7 px-2 text-xs`}
                >
                  <Sparkles className="w-3 h-3 mr-1" />
                  All
                </PremiumButton>
                {subcategoryOptions.map((subcategory) => {
                  const count = subscriptions.filter(sub => sub.subcategory === subcategory).length;
                  return (
                    <PremiumButton
                      key={subcategory}
                      variant={filters.subcategory === subcategory ? "orange-gradient" : "secondary"}
                      size="sm"
                      onClick={() => setFilters(prev => ({ ...prev, subcategory }))}
                      className={`${filters.subcategory === subcategory ? "gradient-bg" : ""} h-7 px-2 text-xs`}
                      title={`${subcategory} (${count} tools)`}
                    >
                      {subcategory} ({count})
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

      {/* Subcategory Groups */}
      {Object.keys(groupedTools).length > 0 ? (
        <div className="space-y-8">
          {subcategoryOptions.filter(subcategory => groupedTools[subcategory]).map(subcategory => {
            const subcategoryTools = groupedTools[subcategory];
            return (
              <div key={subcategory}>
                {/* Subcategory Header - consistent neutral style */}
                <div className="flex items-center mb-3">
                  <div className="w-2 h-2 rounded-full bg-orange-400 mr-2" />
                  <h3 className="text-sm font-semibold text-neutral-900 mr-2">
                    {subcategory}
                  </h3>
                  <span className="text-xs text-neutral-500">
                    {subcategoryTools.length} tool{subcategoryTools.length !== 1 ? 's' : ''}
                  </span>
                </div>

                {/* Tools Grid for this subcategory */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4">
                  {subcategoryTools.map((tool) => {
                    const isSelected = selectedTools.has(tool.id);
                    const isSubscribed = tool.isSubscribed;
                    const isUsing = tool.isUsing;
                    // Use database state as the source of truth, fallback to local state
                    const isTracked = isSubscribed || trackedTools.has(tool.id);
                    const isCurrentlyUsing = isUsing || usingTools.has(tool.id);

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
              {tool.flags?.includes('no-rank') ? '#' : `#${tool.originalRank}`}
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

          {/* NSFW Badge - now based on database safe_for_work field */}
          {tool.flags?.includes('nsfw') && (
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
                              {sanitizeInput(tool.name)}
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
                                  className={`min-w-[90px] text-sm h-7 px-4 ${isTracked ? "gradient-bg" : ""}`}
                                  onClick={(e) => handleAddToSubscriptions(tool, e)}
                                >
                                  {isTracked ? <Check className="w-3 h-3 mr-1.5" /> : <Plus className="w-3 h-3 mr-1.5" />}
                                  Subscribe
                                </PremiumButton>
                                <PremiumButton
                                  variant={isCurrentlyUsing ? "orange-gradient" : "secondary"}
                                  size="sm"
                                  className={`min-w-[80px] text-sm h-7 px-4 ${isCurrentlyUsing ? "gradient-bg" : ""}`}
                                  onClick={(e) => handleMarkAsUsing(tool, e)}
                                >
                                  {isCurrentlyUsing ? <Check className="w-3 h-3 mr-1.5" /> : <Plus className="w-3 h-3 mr-1.5" />}
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
                                window.open(sanitizeURL(tool.url), '_blank', 'noopener,noreferrer');
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
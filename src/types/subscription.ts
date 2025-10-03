/**
 * Subscription Data Model
 * 
 * Comprehensive subscription management with enhanced features from AI Tools Tracker
 * - Advanced filtering capabilities
 * - Rich metadata for better organization
 * - URL state management support
 * - Enhanced analytics and insights
 */

export interface Subscription {
  id: string;
  name: string;
  plan: string;
  logo: string;
  cost: number;
  currency: string;
  billingCycle: 'Monthly' | 'Yearly' | 'Weekly' | 'Quarterly' | 'Free';
  category: SubscriptionCategory;
  subcategory?: string; // For AI Tools subcategories
  description: string;
  url: string;
  status: 'active' | 'paused' | 'canceled';
  accountEmail: string;
  promoCode?: string;
  promoDiscount?: number;
  notes?: string;
  renewalDate: Date;
  startDate: Date;
  
  // Enhanced features from AI Tools Tracker
  tags?: string[];
  priority: 'high' | 'medium' | 'low';
  usageFrequency: 'daily' | 'weekly' | 'monthly' | 'rarely';
  productivityScore?: number; // User-rated 1-10
  alternativeServices?: string[];
  lastUsed?: Date;
  autoRenew: boolean;
  
  // Additional fields from toolsSubscription.json
  logoUrl?: string;
  fallbackIcon?: string;
  safeForWork?: boolean;
  chinaRegionOnly?: boolean;
  a16zRank?: number; // a16z ranking (1-50 for ranked, >50 for user choice)
  apiAccessKeys?: string[];
  secretKey?: string;
  previouslyUsedPromotionCode?: string[];
  latestPromotionCode?: string;
  accountEmailsUsedPreviously?: string[];
}

export type SubscriptionCategory = 
  | 'AI Tools'
  | 'SaaS'
  | 'Entertainment'
  | 'Productivity'
  | 'Utilities'
  | 'Newsletter'
  | 'Streaming Service'
  | 'Online Learning'
  | 'Magazine'
  | 'Cloud Provider'
  | 'Development Tools'
  | 'Design Tools'
  | 'Communication'
  | 'Security'
  | 'Other';

// AI Tool subcategories from toolsSubscription.json (alphabetically sorted)
export const AI_TOOL_SUBCATEGORIES = [
  'APIs',
  'Audio',
  'Automation',
  'Build',
  'Chat',
  'DB',
  'Deploy',
  'Design/Prototype',
  'Dev',
  'Image',
  'Other',
  'Planning',
  'Productivity',
  'Roleplay',
  'Search',
  'Speech-to-text',
  'Transcribe',
  'Utils',
  'Vector DB',
  'Video',
  'Write'
] as const;

export type AIToolSubcategory = typeof AI_TOOL_SUBCATEGORIES[number];

export interface SubscriptionFilters {
  search: string;
  category: SubscriptionCategory | 'all';
  subcategory: string | 'all';
  status: 'active' | 'paused' | 'canceled' | 'all';
  billingCycle: string | 'all';
  priority: 'high' | 'medium' | 'low' | 'all';
  usageFrequency: 'daily' | 'weekly' | 'monthly' | 'rarely' | 'all';
  costRange: {
    min: number;
    max: number;
  };
  tags: string[];
  showExpiringSoon: boolean;
  showUnused: boolean;
}

export interface SubscriptionAnalytics {
  totalMonthlyCost: number;
  totalYearlyCost: number;
  activeSubscriptions: number;
  pausedSubscriptions: number;
  canceledSubscriptions: number;
  categoryBreakdown: Record<SubscriptionCategory, number>;
  upcomingRenewals: Subscription[];
  expiringSoon: Subscription[];
  unusedSubscriptions: Subscription[];
  costTrends: {
    month: string;
    cost: number;
  }[];
  productivityInsights: {
    highValue: Subscription[];
    lowValue: Subscription[];
    recommendations: string[];
  };
}

export interface ViewMode {
  type: 'grid' | 'list' | 'analytics';
  sortBy: 'name' | 'cost' | 'renewalDate' | 'category' | 'priority' | 'usageFrequency';
  sortOrder: 'asc' | 'desc';
  groupBy?: 'category' | 'status' | 'priority' | 'billingCycle';
}

// Enhanced from AI Tools Tracker - URL state management
export interface URLState {
  filters: Partial<SubscriptionFilters>;
  viewMode: Partial<ViewMode>;
  selectedIds: string[];
  searchQuery: string;
}

// Interface for JSON data from toolsSubscription.json
export interface AIToolJsonData {
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
  usageImportance: string;
  usageFrequency: string;
  startDate?: string;
  renewalDate?: string;
  notes?: string;
  accountEmailInUse?: string;
  fallbackIcon?: string;
  safeForWork?: string;
  chinaRegionOnly?: string;
  a16zRank?: number; // a16z ranking (1-50 for ranked, >50 for user choice)
  apiAccessKeys?: string[];
  secretKey?: string;
  previouslyUsedPromotionCode?: string[];
  latestPromotionCode?: string;
  accountEmailsUsedPreviously?: string[];
}

// API Response interfaces
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export type SubscriptionApiResponse = ApiResponse<Subscription[]>;

// Analysis interfaces for AI tool categorizer
export interface NameAnalysis {
  keywords: string[];
  confidence: number;
  category: string;
}

export interface DomainAnalysis {
  domain: string;
  confidence: number;
  category: string;
}

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
  billing_cycle: 'Monthly' | 'Yearly' | 'Weekly' | 'Quarterly' | 'Free';
  category: SubscriptionCategory;
  subcategory?: string; // For AI Tools subcategories
  description: string;
  url: string;
  status: 'active' | 'paused' | 'canceled';
  account_email: string;
  promo_code?: string;
  promo_discount?: number;
  notes?: string;
  renewal_date: Date;
  start_date: Date;
  
  // Enhanced features from AI Tools Tracker
  tags?: string[];
  usage_importance: 'high' | 'medium' | 'low';
  usage_frequency: 'daily' | 'weekly' | 'monthly' | 'rarely';
  alternative_services?: string[];
  last_used?: Date;
  auto_renew: boolean;
  
  // Additional fields from toolsSubscription.json
  logo_url?: string;
  fallback_icon?: string;
  safe_for_work?: boolean;
  china_region_only?: boolean;
  a16z_rank?: number; // a16z ranking (1-50 for ranked, >50 for user choice)
  api_access_keys?: string[];
  secret_key?: string;
  previously_used_promotion_code?: string[];
  latest_promocode?: string;
  account_emails_used_previously?: string[];
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
  'Development',
  'Image',
  'Other',
  'Planning',
  'Productivity',
  'Roleplay',
  'Search',
  'Speech-to-text',
  'Transcribe',
  'Utilities',
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
  billing_cycle: string | 'all';
  usage_importance: 'high' | 'medium' | 'low' | 'all';
  usage_frequency: 'daily' | 'weekly' | 'monthly' | 'rarely' | 'all';
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
  sortBy: 'name' | 'cost' | 'renewal_date' | 'category' | 'usage_importance' | 'usage_frequency';
  sortOrder: 'asc' | 'desc';
  groupBy?: 'category' | 'status' | 'usage_importance' | 'billing_cycle';
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
  logo_url: string;
  plan: string;
  cost: number;
  currency: string;
  billing_cycle: string;
  status: string;
  usage_importance: string;
  usage_frequency: string;
  start_date?: string;
  renewal_date?: string;
  notes?: string;
  account_email?: string;
  fallback_icon?: string;
  safe_for_work?: string;
  china_region_only?: string;
  a16z_rank?: number; // a16z ranking (1-50 for ranked, >50 for user choice)
  api_access_keys?: string[];
  secret_key?: string;
  previously_used_promotion_code?: string[];
  latest_promocode?: string;
  account_emails_used_previously?: string[];
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

/**
 * Tools Subscription Data Loader
 * 
 * Loads and transforms the toolsSubscription.json data into the application's
 * subscription format for seamless integration with the subscription manager.
 */

import { Subscription } from '@/types/subscription';
import { handleSubscriptionError } from '@/utils/error-handler';

// Generate a proper UUID v4 (fallback if crypto.randomUUID is not available)
function generateUUIDv4(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Type for the raw data from toolsSubscription.json
interface ToolsSubscriptionData {
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
  chinaRegionOnly: string;
  safeForWork: string;
}

/**
 * Transform toolsSubscription.json data to Subscription format
 */
export function transformToolsSubscriptionData(rawData: ToolsSubscriptionData[]): Subscription[] {
  return rawData.map(item => ({
    id: generateUUIDv4(),
    name: item.name,
    plan: item.plan,
    logo: item.logoUrl || item.fallbackIcon,
    logo_url: item.logoUrl || undefined,
    cost: item.cost,
    currency: item.currency,
    billing_cycle: item.billingCycle as 'Monthly' | 'Yearly' | 'Weekly' | 'Quarterly' | 'Free',
    category: 'AI Tools' as const,
    subcategory: item.subcategory,
    description: item.description,
    url: item.url,
    status: item.status.toLowerCase() as 'active' | 'paused' | 'canceled',
    account_email: item.accountEmailInUse,
    promo_code: item.latestPromotionCode || undefined,
    notes: item.notes,
    renewal_date: new Date(item.renewalDate),
    start_date: new Date(item.startDate),
    tags: [item.subcategory],
    usage_importance: mapUsageImportanceToPriority(item.usageImportance),
    usage_frequency: mapUsageFrequency(item.usageFrequency),
    auto_renew: true,
    fallback_icon: item.fallbackIcon || '📦'
  }));
}

/**
 * Map usage importance to priority
 */
function mapUsageImportanceToPriority(importance: string): 'high' | 'medium' | 'low' {
  switch (importance.toLowerCase()) {
    case 'high':
      return 'high';
    case 'medium':
      return 'medium';
    case 'low':
    default:
      return 'low';
  }
}

/**
 * Map usage frequency to standard format
 */
function mapUsageFrequency(frequency: string): 'daily' | 'weekly' | 'monthly' | 'rarely' {
  switch (frequency.toLowerCase()) {
    case 'daily':
      return 'daily';
    case 'weekly':
      return 'weekly';
    case 'monthly':
      return 'monthly';
    case 'rarely':
    default:
      return 'rarely';
  }
}

/**
 * Load tools subscription data from JSON file
 */
export async function loadToolsSubscriptionData(): Promise<Subscription[]> {
  try {
    const response = await fetch('/toolsSubscription.json');
    if (!response.ok) {
      throw new Error(`Failed to load tools subscription data: ${response.statusText}`);
    }
    
    const rawData: ToolsSubscriptionData[] = await response.json();
    return transformToolsSubscriptionData(rawData);
  } catch (error) {
    handleSubscriptionError(
      error as Error,
      'loading tools subscription data',
      { component: 'tools-subscription-loader' }
    );
    return [];
  }
}

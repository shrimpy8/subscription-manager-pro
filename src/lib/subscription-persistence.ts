import { Subscription, AIToolJsonData, SubscriptionApiResponse, SubscriptionCategory } from '@/types/subscription';
import { handleApiError, handleSubscriptionError } from '@/utils/error-handler';
import { getCurrentDateISO, toDate, getDefaultRenewalDate, getCurrentDate, formatDate } from '@/lib/utils';
import { getAIToolByName } from '@/lib/ai-tools-data';

const STORAGE_KEY = 'subscription-manager-data';

export interface SubscriptionData {
  subscriptions: Subscription[];
  lastUpdated: string;
}

/**
 * Load subscriptions from API with fallback to localStorage and JSON file
 */
export async function loadSubscriptions(): Promise<Subscription[]> {
  try {
    // Use localStorage directly (API calls disabled for now)
    // const apiResponse = await fetch('/api/subscriptions');
    // if (apiResponse.ok) {
    //   const apiData: SubscriptionApiResponse = await apiResponse.json();
    //   if (apiData.success && apiData.data.length > 0) {
    //     return ensureDateObjects(apiData.data);
    //   }
    // }

    // Use localStorage
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data: SubscriptionData = JSON.parse(stored);
        if (data.subscriptions && data.subscriptions.length > 0) {
          return ensureDateObjects(data.subscriptions);
        }
      }
    }

    // Final fallback to JSON file
    const response = await fetch('/toolsSubscription.json');
    if (response.ok) {
      const jsonData: AIToolJsonData[] = await response.json();
      // Transform JSON data to Subscription format
      const transformed = transformJsonToSubscriptions(jsonData);
      // Ensure dates are properly converted
      const withDateObjects = ensureDateObjects(transformed);
      // Save to API for future use (disabled to prevent infinite loops)
      // await saveSubscriptionsToAPI(withDateObjects);
      return withDateObjects;
    }

    return [];
  } catch (error) {
    handleSubscriptionError(
      error as Error,
      'loading',
      { component: 'subscription-persistence' }
    );
    return [];
  }
}

/**
 * Save subscriptions to API and localStorage
 */
export async function saveSubscriptions(subscriptions: Subscription[]): Promise<void> {
  try {
    // Use localStorage directly (API calls disabled for now)
    // await saveSubscriptionsToAPI(subscriptions);
    
    // Save to localStorage
    if (typeof window !== 'undefined') {
      const data: SubscriptionData = {
        subscriptions,
        lastUpdated: getCurrentDateISO()
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  } catch (error) {
    handleSubscriptionError(
      error as Error,
      'saving',
      { component: 'subscription-persistence' }
    );
    // Fallback to localStorage only
    if (typeof window !== 'undefined') {
      const data: SubscriptionData = {
        subscriptions,
        lastUpdated: getCurrentDateISO()
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  }
}

/**
 * Save subscriptions to API
 */
async function saveSubscriptionsToAPI(subscriptions: Subscription[]): Promise<void> {
  try {
    const response = await fetch('/api/subscriptions', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ subscriptions }),
    });

    if (!response.ok) {
      throw new Error('Failed to save to API');
    }
  } catch (error) {
    handleApiError(
      error as Error,
      '/api/subscriptions',
      { component: 'subscription-persistence' }
    );
    throw error;
  }
}

/**
 * Ensure dates are properly converted to Date objects
 */
function ensureDateObjects(subscriptions: Subscription[]): Subscription[] {
  return subscriptions.map(sub => ({
    ...sub,
    start_date: toDate(sub.start_date),
    renewal_date: toDate(sub.renewal_date)
  }));
}

/**
 * Transform JSON data from toolsSubscription.json to Subscription format
 */
function transformJsonToSubscriptions(jsonData: AIToolJsonData[]): Subscription[] {
  return jsonData.map((item, index) => ({
    id: item.id || `sub-${index + 1}`,
    name: item.name || 'Unknown Service',
    category: (item.category as SubscriptionCategory) || 'Other',
    subcategory: item.subcategory || '',
    status: (item.status?.toLowerCase() as 'active' | 'paused' | 'canceled') || 'active',
    cost: item.cost || 0,
    currency: item.currency || 'USD',
    billing_cycle: (item.billing_cycle as 'Monthly' | 'Yearly' | 'Weekly' | 'Quarterly' | 'Free') || 'Monthly',
    renewal_date: item.renewal_date ? toDate(item.renewal_date) : getDefaultRenewalDate(),
    start_date: item.start_date ? toDate(item.start_date) : getCurrentDate(),
    usage_importance: mapUsageImportanceToPriority(item.usage_importance),
    usage_frequency: (item.usage_frequency?.toLowerCase() as 'daily' | 'weekly' | 'monthly' | 'rarely') || 'monthly',
    url: item.url || '',
    description: item.description || '',
    notes: item.notes || '',
    account_email: item.account_email || '',
    auto_renew: true,
    // Additional fields from JSON
    plan: item.plan || 'Free',
    logo: item.logo_url || '', // Map logo_url to logo field
    logo_url: item.logo_url || '',
    fallback_icon: item.fallback_icon || '🔧',
    safe_for_work: determineSafeForWork(item.category, item.subcategory),
    china_region_only: determineChinaRegionOnly(item.name),
    a16z_rank: getActualA16zRank(item.name),
    api_access_keys: item.api_access_keys || [],
    secret_key: item.secret_key || '',
    previously_used_promotion_code: item.previously_used_promotion_code || [],
    latest_promocode: item.latest_promocode || '',
    account_emails_used_previously: item.account_emails_used_previously || []
  }));
}

/**
 * Map usage importance to priority
 */
function mapUsageImportanceToPriority(importance: string): 'low' | 'medium' | 'high' {
  switch (importance?.toLowerCase()) {
    case 'high':
      return 'high';
    case 'medium':
      return 'medium';
    case 'low':
      return 'low';
    default:
      return 'medium';
  }
}

/**
 * Determine if a tool is safe for work based on category and subcategory
 */
function determineSafeForWork(category: string, subcategory: string): boolean {
  // Roleplay category tools are not safe for work
  if (category === 'Roleplay' || subcategory === 'Roleplay') {
    return false;
  }
  return true;
}

/**
 * Determine if a tool is China region only based on the tool name
 */
function determineChinaRegionOnly(toolName: string): boolean {
  const chinaRegionTools = [
    'Kimi',
    'Qwen3', 
    'Doubao',
    'SEARRT.AI',
    'KlingAI',
    'Hailuo AI'
  ];
  
  return chinaRegionTools.includes(toolName);
}

/**
 * Get actual a16z rank for a tool by name, or return undefined if not found
 */
function getActualA16zRank(toolName: string): number | undefined {
  const aiTool = getAIToolByName(toolName);
  return aiTool?.originalRank;
}

/**
 * Export subscriptions to CSV format
 */
export function exportSubscriptionsToCSV(subscriptions: Subscription[]): string {
  const headers = [
    'Name',
    'Category',
    'Subcategory',
    'Plan',
    'Cost',
    'Currency',
    'Billing Cycle',
    'Status',
    'Start Date',
    'Renewal Date',
    'Priority',
    'Usage Frequency',
    'URL',
    'Description',
    'Notes',
    'Account Email',
    'Auto Renew',
    'Safe for Work',
    'China Region Only',
    'a16z Rank'
  ];

  // Sort subscriptions alphabetically by name
  const sortedSubscriptions = [...subscriptions].sort((a, b) => 
    a.name.toLowerCase().localeCompare(b.name.toLowerCase())
  );

  const rows = sortedSubscriptions.map(sub => [
    sub.name,
    sub.category,
    sub.subcategory || '',
    sub.plan || '',
    sub.cost.toString(),
    sub.currency,
    sub.billing_cycle,
    sub.status,
    formatDate(sub.start_date, 'input'),
    formatDate(sub.renewal_date, 'input'),
    sub.usage_importance,
    sub.usage_frequency,
    sub.url,
    sub.description,
    sub.notes,
    sub.account_email,
    sub.auto_renew ? 'Yes' : 'No',
    sub.safe_for_work ? 'Yes' : 'No',
    sub.china_region_only ? 'Yes' : 'No',
    sub.a16z_rank ? sub.a16z_rank.toString() : ''
  ]);

  const csvContent = [headers, ...rows]
    .map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
    .join('\n');

  return csvContent;
}

/**
 * Download CSV file
 */
export function downloadCSV(csvContent: string, filename: string = 'subscriptions.csv'): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

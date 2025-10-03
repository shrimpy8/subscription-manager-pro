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
    // First try API
    const apiResponse = await fetch('/api/subscriptions');
    if (apiResponse.ok) {
      const apiData: SubscriptionApiResponse = await apiResponse.json();
      if (apiData.success && apiData.data.length > 0) {
        return ensureDateObjects(apiData.data);
      }
    }

    // Fallback to localStorage
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
      // Save to API for future use
      await saveSubscriptionsToAPI(withDateObjects);
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
    // Save to API first
    await saveSubscriptionsToAPI(subscriptions);
    
    // Also save to localStorage as backup
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
    startDate: toDate(sub.startDate),
    renewalDate: toDate(sub.renewalDate)
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
    billingCycle: (item.billingCycle as 'Monthly' | 'Yearly' | 'Weekly' | 'Quarterly' | 'Free') || 'Monthly',
    renewalDate: item.renewalDate ? toDate(item.renewalDate) : getDefaultRenewalDate(),
    startDate: item.startDate ? toDate(item.startDate) : getCurrentDate(),
    priority: mapUsageImportanceToPriority(item.usageImportance),
    usageFrequency: (item.usageFrequency?.toLowerCase() as 'daily' | 'weekly' | 'monthly' | 'rarely') || 'monthly',
    url: item.url || '',
    description: item.description || '',
    notes: item.notes || '',
    accountEmail: item.accountEmailInUse || '',
    autoRenew: true,
    // Additional fields from JSON
    plan: item.plan || 'Free',
    logo: item.logoUrl || '', // Map logoUrl to logo field
    logoUrl: item.logoUrl || '',
    fallbackIcon: item.fallbackIcon || '🔧',
    safeForWork: determineSafeForWork(item.category, item.subcategory),
    chinaRegionOnly: determineChinaRegionOnly(item.name),
    a16zRank: getActualA16zRank(item.name),
    apiAccessKeys: item.apiAccessKeys || [],
    secretKey: item.secretKey || '',
    previouslyUsedPromotionCode: item.previouslyUsedPromotionCode || [],
    latestPromotionCode: item.latestPromotionCode || '',
    accountEmailsUsedPreviously: item.accountEmailsUsedPreviously || []
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
    sub.billingCycle,
    sub.status,
    formatDate(sub.startDate, 'input'),
    formatDate(sub.renewalDate, 'input'),
    sub.priority,
    sub.usageFrequency,
    sub.url,
    sub.description,
    sub.notes,
    sub.accountEmail,
    sub.autoRenew ? 'Yes' : 'No',
    sub.safeForWork ? 'Yes' : 'No',
    sub.chinaRegionOnly ? 'Yes' : 'No',
    sub.a16zRank ? sub.a16zRank.toString() : ''
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

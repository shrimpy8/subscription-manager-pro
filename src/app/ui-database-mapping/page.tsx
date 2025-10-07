"use client";

import { useState, useEffect } from 'react';
import { getLocalSubscriptions } from '@/lib/supabase-sync';

interface UIDatabaseMapping {
  uiComponent: string;
  uiField: string;
  databaseTable: string;
  databaseField: string;
  dataSource: string;
  displayType: string;
  required: boolean;
}

export default function UIDatabaseMappingPage() {
  const [subscriptions, setSubscriptions] = useState<unknown[]>([]);
  const [mappings, setMappings] = useState<UIDatabaseMapping[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    if (typeof window !== 'undefined') {
      const data = getLocalSubscriptions();
      setSubscriptions(data);
      
      // Define UI to Database mappings
      const uiMappings: UIDatabaseMapping[] = [
        // Subscription Table Display
        {
          uiComponent: 'SubscriptionsTable',
          uiField: 'subscription.name',
          databaseTable: 'subscriptions',
          databaseField: 'name',
          dataSource: 'CSV: Name',
          displayType: 'Text',
          required: true
        },
        {
          uiComponent: 'SubscriptionsTable',
          uiField: 'subscription.category',
          databaseTable: 'subscriptions',
          databaseField: 'category',
          dataSource: 'CSV: Category',
          displayType: 'Badge',
          required: true
        },
        {
          uiComponent: 'SubscriptionsTable',
          uiField: 'subscription.plan',
          databaseTable: 'subscriptions',
          databaseField: 'plan',
          dataSource: 'CSV: Plan',
          displayType: 'Text',
          required: false
        },
        {
          uiComponent: 'SubscriptionsTable',
          uiField: 'subscription.cost',
          databaseTable: 'subscriptions',
          databaseField: 'cost',
          dataSource: 'CSV: Cost',
          displayType: 'Currency',
          required: true
        },
        {
          uiComponent: 'SubscriptionsTable',
          uiField: 'subscription.billingCycle',
          databaseTable: 'subscriptions',
          databaseField: 'billing_cycle',
          dataSource: 'CSV: Billing Cycle',
          displayType: 'Text',
          required: true
        },
        {
          uiComponent: 'SubscriptionsTable',
          uiField: 'subscription.status',
          databaseTable: 'subscriptions',
          databaseField: 'status',
          dataSource: 'CSV: Status',
          displayType: 'Status Badge',
          required: true
        },
        {
          uiComponent: 'SubscriptionsTable',
          uiField: 'subscription.renewalDate',
          databaseTable: 'subscriptions',
          databaseField: 'renewal_date',
          dataSource: 'CSV: Renewal Date',
          displayType: 'Date',
          required: true
        },
        {
          uiComponent: 'SubscriptionsTable',
          uiField: 'subscription.logoUrl',
          databaseTable: 'subscriptions',
          databaseField: 'logo_url',
          dataSource: 'Not in CSV',
          displayType: 'Image',
          required: false
        },
        {
          uiComponent: 'SubscriptionsTable',
          uiField: 'subscription.fallbackIcon',
          databaseTable: 'subscriptions',
          databaseField: 'fallback_icon',
          dataSource: 'Default: 📦',
          displayType: 'Emoji',
          required: false
        },
        {
          uiComponent: 'SubscriptionsTable',
          uiField: 'subscription.chinaRegionOnly',
          databaseTable: 'subscriptions',
          databaseField: 'china_region_only',
          dataSource: 'CSV: China Region Only',
          displayType: 'Badge',
          required: false
        },
        {
          uiComponent: 'SubscriptionsTable',
          uiField: 'subscription.safeForWork',
          databaseTable: 'subscriptions',
          databaseField: 'safe_for_work',
          dataSource: 'CSV: Safe for Work',
          displayType: 'Badge',
          required: false
        },

        // AI Tools Browser Display
        {
          uiComponent: 'AIToolsBrowser',
          uiField: 'tool.name',
          databaseTable: 'subscriptions',
          databaseField: 'name',
          dataSource: 'CSV: Name',
          displayType: 'Text',
          required: true
        },
        {
          uiComponent: 'AIToolsBrowser',
          uiField: 'tool.url',
          databaseTable: 'subscriptions',
          databaseField: 'url',
          dataSource: 'CSV: URL',
          displayType: 'Link',
          required: false
        },
        {
          uiComponent: 'AIToolsBrowser',
          uiField: 'tool.description',
          databaseTable: 'subscriptions',
          databaseField: 'description',
          dataSource: 'CSV: Description',
          displayType: 'Text',
          required: false
        },
        {
          uiComponent: 'AIToolsBrowser',
          uiField: 'tool.fallbackIcon',
          databaseTable: 'subscriptions',
          databaseField: 'fallback_icon',
          dataSource: 'Default: 📦',
          displayType: 'Emoji',
          required: false
        },

        // Dashboard Metrics
        {
          uiComponent: 'PremiumDashboard',
          uiField: 'totalSubscriptions',
          databaseTable: 'subscriptions',
          databaseField: 'COUNT(*)',
          dataSource: 'Calculated',
          displayType: 'Number',
          required: true
        },
        {
          uiComponent: 'PremiumDashboard',
          uiField: 'totalMonthlyCost',
          databaseTable: 'subscriptions',
          databaseField: 'SUM(cost)',
          dataSource: 'Calculated',
          displayType: 'Currency',
          required: true
        },
        {
          uiComponent: 'PremiumDashboard',
          uiField: 'totalActiveSubscriptions',
          databaseTable: 'subscriptions',
          databaseField: 'COUNT(*) WHERE status = active',
          dataSource: 'Calculated',
          displayType: 'Number',
          required: true
        },

        // Enhanced Subscription Card
        {
          uiComponent: 'EnhancedSubscriptionCard',
          uiField: 'subscription.priority',
          databaseTable: 'subscriptions',
          databaseField: 'priority',
          dataSource: 'CSV: Priority',
          displayType: 'Badge',
          required: true
        },
        {
          uiComponent: 'EnhancedSubscriptionCard',
          uiField: 'subscription.usageFrequency',
          databaseTable: 'subscriptions',
          databaseField: 'usage_frequency',
          dataSource: 'CSV: Usage Frequency',
          displayType: 'Text',
          required: false
        },
        {
          uiComponent: 'EnhancedSubscriptionCard',
          uiField: 'subscription.autoRenew',
          databaseTable: 'subscriptions',
          databaseField: 'auto_renew',
          dataSource: 'CSV: Auto Renew',
          displayType: 'Boolean',
          required: false
        },
        {
          uiComponent: 'EnhancedSubscriptionCard',
          uiField: 'subscription.a16zRank',
          databaseTable: 'subscriptions',
          databaseField: 'a16z_rank',
          dataSource: 'CSV: a16z Rank',
          displayType: 'Number',
          required: false
        }
      ];

      setMappings(uiMappings);
    }
  }, []);

  if (!isClient) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">UI to Database Mapping Analysis</h1>
      
      {/* Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-blue-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">UI Components</h2>
          <div className="space-y-2">
            <p><strong>SubscriptionsTable:</strong> Main table view</p>
            <p><strong>AIToolsBrowser:</strong> AI tools discovery</p>
            <p><strong>PremiumDashboard:</strong> Analytics & metrics</p>
            <p><strong>EnhancedSubscriptionCard:</strong> Card view</p>
          </div>
        </div>

        <div className="bg-green-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Database Tables</h2>
          <div className="space-y-2">
            <p><strong>subscriptions:</strong> Main data table</p>
            <p><strong>subscription_tags:</strong> Tags (many-to-many)</p>
            <p><strong>subscription_alternatives:</strong> Alternative services</p>
            <p><strong>subscription_api_keys:</strong> API keys</p>
            <p><strong>subscription_emails:</strong> Email history</p>
            <p><strong>subscription_promotions:</strong> Promotion codes</p>
          </div>
        </div>

        <div className="bg-purple-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Data Sources</h2>
          <div className="space-y-2">
            <p><strong>CSV Fields:</strong> 20 fields from your data</p>
            <p><strong>Calculated:</strong> Metrics & aggregations</p>
            <p><strong>Defaults:</strong> fallback_icon, timestamps</p>
            <p><strong>Generated:</strong> IDs, created_at, updated_at</p>
          </div>
        </div>
      </div>

      {/* Detailed Mappings */}
      <div className="bg-white border rounded-lg overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b">
          <h2 className="text-xl font-semibold">Detailed Field Mappings</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">UI Component</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">UI Field</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Database Table</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Database Field</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Data Source</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Display Type</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Required</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {mappings.map((mapping, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-mono">{mapping.uiComponent}</td>
                  <td className="px-4 py-3 text-sm font-mono">{mapping.uiField}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                      {mapping.databaseTable}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm font-mono">{mapping.databaseField}</td>
                  <td className="px-4 py-3 text-sm">{mapping.dataSource}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                      {mapping.displayType}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {mapping.required ? (
                      <span className="text-red-600 font-semibold">Yes</span>
                    ) : (
                      <span className="text-gray-500">No</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Missing Fields Analysis */}
      <div className="mt-8 bg-yellow-50 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4 text-yellow-800">⚠️ Missing UI Fields</h2>
        <p className="text-yellow-700 mb-4">These database fields are not displayed in the UI:</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-semibold text-yellow-600 mb-2">Not Displayed in UI</h3>
            <ul className="text-sm space-y-1">
              <li>❌ <code>logo_url</code> - Not in CSV, not displayed</li>
              <li>❌ <code>secret_key</code> - Security field, not displayed</li>
              <li>❌ <code>promo_code</code> - Not in CSV, not displayed</li>
              <li>❌ <code>promo_discount</code> - Not in CSV, not displayed</li>
              <li>❌ <code>productivity_score</code> - Not in CSV, not displayed</li>
              <li>❌ <code>last_used</code> - Not in CSV, not displayed</li>
              <li>❌ <code>created_at</code> - Auto-generated, not displayed</li>
              <li>❌ <code>updated_at</code> - Auto-generated, not displayed</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-green-600 mb-2">Related Table Fields</h3>
            <ul className="text-sm space-y-1">
              <li>📋 <code>subscription_tags</code> - Tags array</li>
              <li>📋 <code>subscription_alternatives</code> - Alternative services</li>
              <li>📋 <code>subscription_api_keys</code> - API keys</li>
              <li>📋 <code>subscription_emails</code> - Email history</li>
              <li>📋 <code>subscription_promotions</code> - Promotion codes</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Sample Data */}
      {subscriptions.length > 0 && (
        <div className="mt-8 bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Sample Subscription Data</h2>
          <pre className="bg-white p-4 rounded text-xs overflow-auto max-h-96">
            {JSON.stringify(subscriptions[0], null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
